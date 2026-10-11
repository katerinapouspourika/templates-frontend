#!/usr/bin/env node
/**
 * Generates TypeScript types for the backend API from its OpenAPI document.
 *
 *   npm run api:generate
 *   npm run api:generate -- --input ../../artifacts/OpenApi/MyApi_v1.json
 *   npm run api:generate -- --input https://localhost:5001/openapi/v1.json
 *
 * Input resolution, first match wins:
 *   1. --input <file-or-url>
 *   2. OPENAPI_INPUT environment variable
 *   3. The single *.json file in an `artifacts/OpenApi` folder found by walking up
 *      from this project (where the templates-dotnet build writes its documents).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const projectRoot = path.resolve(import.meta.dirname, "..");
const output = "src/api/schema.d.ts";

const { values } = parseArgs({ options: { input: { type: "string" } } });

const input =
  values.input ?? process.env.OPENAPI_INPUT ?? findOpenApiDocument(projectRoot);

console.log(`Generating ${output} from ${input}`);

const result = spawnSync("npx", ["openapi-typescript", input, "-o", output], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);

function findOpenApiDocument(start) {
  let dir = start;
  while (true) {
    const candidateDir = path.join(dir, "artifacts", "OpenApi");
    if (existsSync(candidateDir)) {
      const documents = readdirSync(candidateDir).filter((file) =>
        file.endsWith(".json"),
      );
      if (documents.length === 1) {
        return path
          .relative(start, path.join(candidateDir, documents[0]))
          .split(path.sep)
          .join("/");
      }
      if (documents.length > 1) {
        fail(
          `Found several OpenAPI documents in ${candidateDir}:\n  ${documents.join("\n  ")}\nPick one with --input or OPENAPI_INPUT.`,
        );
      }
    }
    if (existsSync(path.join(dir, ".git"))) break;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  fail(
    "No OpenAPI document found. Build the backend first (it writes artifacts/OpenApi/*.json), or pass --input <file-or-url>.",
  );
}

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}
