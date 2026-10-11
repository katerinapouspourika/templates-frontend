# Connecting to an ASP.NET Core backend

The frontend and the backend agree on one contract: **the frontend calls relative `/api/...` URLs, and something in front of it forwards them to the backend with the `/api` prefix kept.** That "something" changes per environment, the code does not:

| Environment        | Who forwards `/api`                                      |
| ------------------ | -------------------------------------------------------- |
| `npm run dev`      | Vite dev proxy (`server.proxy` in `vite.config.ts`)      |
| `aspire run`       | Vite dev proxy, with the API address injected by Aspire  |
| Aspire publish     | YARP, via `PublishAsStaticWebsite(apiPath: "/api", ...)` |
| Docker (`docker/`) | nginx, via `API_UPSTREAM`                                |

On the backend, map endpoints under `/api`, for example `app.MapGroup("/api")`.

## Running both with Aspire

Add the hosting package to your AppHost project:

```shell
dotnet add package Aspire.Hosting.JavaScript
```

Then register the frontend next to the API in `AppHost.cs` (paths relative to the AppHost project):

```csharp
var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.MyApi>("api");

// apiTarget also adds the reference to `api`, so no separate WithReference(api) is needed.
builder.AddViteApp("web", "../Web")
    .WaitFor(api)
    .PublishAsStaticWebsite(apiPath: "/api", apiTarget: api);

builder.Build().Run();
```

What this gives you:

- `dotnet run --project src/AppHost` starts the API and the Vite dev server together, with both in the Aspire dashboard. Aspire runs `npm install` for you.
- Aspire sets `PORT` (picked up by `vite.config.ts`) and `API_HTTPS` / `API_HTTP` for the resource named `api`, which the dev proxy uses as its target. If you name the API resource differently, update the variable names in `vite.config.ts`.
- On publish, the built `dist/` is served by YARP, which proxies `/api` to the API. The prefix is kept unless you set `StripPrefix`.

## Typed API client

The templates-dotnet build writes OpenAPI documents to `artifacts/OpenApi/<Project>_v1.json`. After building the backend:

```shell
npm run api:generate
```

finds that file by walking up from the frontend folder and regenerates `src/api/schema.d.ts`. If there are several documents, pick one:

```shell
npm run api:generate -- --input ../../artifacts/OpenApi/MyApi_v1.json
```

Then call the API with full type checking of paths, parameters and responses:

```ts
import { api } from "@/api/client";

const { data, error } = await api.GET("/api/todos/{id}", {
  params: { path: { id: 42 } },
});
```

Commit `schema.d.ts` so the frontend builds without the backend. When a C# model changes, regenerate it: any frontend code that no longer matches fails `npm run typecheck` instead of failing at runtime.

## Visual Studio and Rider

The frontend does not need to be in the `.slnx`; Aspire and the npm scripts are enough. If you want it visible in Visual Studio's Solution Explorer, add a JavaScript project file (`.esproj`) using the `Microsoft.VisualStudio.JavaScript.Sdk`.
