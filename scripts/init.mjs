#!/usr/bin/env node
/**
 * One-time setup for a project created from this template.
 *
 *   npm run init -- --variant react
 *   npm run init -- --variant vanilla --target ../MyApi/src/Web
 *
 * Options:
 *   --variant <vanilla|react>  UI flavour to keep (asked interactively when omitted).
 *   --target <dir>             Copy the frontend into a folder of another repository
 *                              (e.g. a .NET solution) instead of converting this one in place.
 *   --name <package-name>      package.json name (defaults to the target folder name).
 *   --skip-install             Do not run `npm install` afterwards.
 */
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";

const templateRoot = path.resolve(import.meta.dirname, "..");
const variantsDir = path.join(templateRoot, "variants");

// Files and folders that belong to the template itself, never to a generated project.
const TEMPLATE_ONLY = [
  "variants",
  "scripts/init.mjs",
  ".github/workflows/template-ci.yml",
];

// Copied into the frontend folder in --target mode (repository-level files are handled separately).
const FRONTEND_ENTRIES = [
  ".dockerignore",
  ".editorconfig",
  ".env.example",
  ".gitattributes",
  ".gitignore",
  ".husky",
  ".npmrc",
  ".nvmrc",
  ".prettierignore",
  ".prettierrc.json",
  "CLAUDE.md",
  "docker",
  "docs",
  "e2e",
  "package-lock.json",
  "package.json",
  "playwright.config.ts",
  "public",
  "scripts",
  "src",
  "stylelint.config.js",
  "tsconfig.app.json",
  "tsconfig.json",
  "tsconfig.node.json",
];

const { values } = parseArgs({
  options: {
    variant: { type: "string" },
    target: { type: "string" },
    name: { type: "string" },
    "skip-install": { type: "boolean", default: false },
  },
});

const variants = readdirSync(variantsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const variant = values.variant ?? (await askVariant());
if (!variants.includes(variant)) {
  fail(`Unknown variant "${variant}". Choose one of: ${variants.join(", ")}.`);
}

const outputDir = values.target ? path.resolve(values.target) : templateRoot;
const nested = outputDir !== templateRoot;

if (nested) {
  if (existsSync(outputDir) && readdirSync(outputDir).length > 0) {
    fail(`Target folder ${outputDir} is not empty.`);
  }
  mkdirSync(outputDir, { recursive: true });
  for (const entry of FRONTEND_ENTRIES) {
    const source = path.join(templateRoot, entry);
    if (existsSync(source)) {
      cpSync(source, path.join(outputDir, entry), { recursive: true });
    }
  }
}

// 1. Overlay the chosen variant's files.
const variantDir = path.join(variantsDir, variant);
const variantManifest = JSON.parse(
  readFileSync(path.join(variantDir, "variant.json"), "utf8"),
);
cpSync(variantDir, outputDir, {
  recursive: true,
  filter: (source) => path.basename(source) !== "variant.json",
});

// 2. Tidy package.json.
const packageJsonPath = path.join(outputDir, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
packageJson.name = toPackageName(values.name ?? path.basename(outputDir));
delete packageJson.scripts.init;
for (const dependency of variantManifest.removeDependencies) {
  delete packageJson.dependencies?.[dependency];
  delete packageJson.devDependencies?.[dependency];
}

// 3. Remove template-only files.
for (const entry of TEMPLATE_ONLY) {
  rmSync(path.join(outputDir, entry), { recursive: true, force: true });
}

// 4. Repository-level wiring when living inside another repository.
let repoRoot = outputDir;
if (nested) {
  repoRoot = findGitRoot(outputDir) ?? outputDir;
  const frontendPath = toPosix(path.relative(repoRoot, outputDir)) || ".";
  wireIntoRepository(repoRoot, frontendPath, packageJson);
}

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

// 5. Sync node_modules and package-lock.json with the trimmed dependency list.
if (!values["skip-install"]) {
  const result = spawnSync("npm", ["install"], {
    cwd: outputDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    fail("npm install failed; fix the error above and run it again.");
  }
}

console.log(`
Done: "${variant}" frontend ready in ${outputDir}

Next steps:
  cd ${path.relative(process.cwd(), outputDir) || "."}
  npm run dev          # start the dev server
  npm run check        # format, lint, type-check and unit-test
${nested ? "\n  Review the generated .github/workflows/frontend.yml in the repository root." : ""}`);

// ---------------------------------------------------------------------------

async function askVariant() {
  if (!process.stdin.isTTY) {
    fail(`Pass --variant (${variants.join(" | ")}).`);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    `Which variant? (${variants.join(" / ")}): `,
  );
  rl.close();
  return answer.trim().toLowerCase();
}

function wireIntoRepository(root, frontendPath, pkg) {
  // CI workflow, scoped to the frontend folder.
  const workflowSource = readFileSync(
    path.join(templateRoot, ".github/workflows/ci.yml"),
    "utf8",
  );
  const workflow = workflowSource
    .replace("name: CI", "name: Frontend")
    .replace(
      "  push:\n    branches: [main]\n  pull_request:\n",
      `  push:\n    branches: [main]\n    paths: ["${frontendPath}/**", ".github/workflows/frontend.yml"]\n  pull_request:\n    paths: ["${frontendPath}/**", ".github/workflows/frontend.yml"]\n`,
    )
    .replace("working-directory: .", `working-directory: ${frontendPath}`)
    .replace(
      "node-version-file: .nvmrc",
      `node-version-file: ${frontendPath}/.nvmrc`,
    )
    .replace(
      "cache-dependency-path: package-lock.json",
      `cache-dependency-path: ${frontendPath}/package-lock.json`,
    )
    .replaceAll(
      "path: playwright-report/",
      `path: ${frontendPath}/playwright-report/`,
    );
  writeIfMissing(path.join(root, ".github/workflows/frontend.yml"), workflow);

  // Dependabot: create the file, or tell the user what to add to theirs.
  const dependabotPath = path.join(root, ".github/dependabot.yml");
  const npmEntry = `  - package-ecosystem: npm
    directory: /${frontendPath}
    schedule:
      interval: weekly
    groups:
      npm-minor-and-patch:
        update-types: [minor, patch]
    ignore:
      - dependency-name: "@types/node"
        update-types: [version-update:semver-major]
`;
  if (existsSync(dependabotPath)) {
    console.warn(
      `\n.github/dependabot.yml already exists. Add this entry under "updates:" to keep frontend packages current:\n\n${npmEntry}`,
    );
  } else {
    writeIfMissing(
      dependabotPath,
      `version: 2\nupdates:\n${npmEntry}  - package-ecosystem: github-actions\n    directory: /\n    schedule:\n      interval: weekly\n`,
    );
  }

  // Path-scoped editor/AI instructions apply repository-wide, so they live at the root.
  const instructionsDir = path.join(templateRoot, ".github/instructions");
  for (const file of readdirSync(instructionsDir)) {
    writeIfMissing(
      path.join(root, ".github/instructions", file),
      readFileSync(path.join(instructionsDir, file), "utf8"),
    );
  }

  // Git hooks must be installed from the repository root.
  const backToFrontend = frontendPath;
  const toRoot = toPosix(path.relative(path.join(root, frontendPath), root));
  pkg.scripts.prepare = `cd ${toRoot} && husky ${backToFrontend}/.husky`;
  writeFileSync(
    path.join(root, frontendPath, ".husky/pre-commit"),
    `cd ${backToFrontend}\nnpx lint-staged\n`,
  );
}

function writeIfMissing(file, content) {
  if (existsSync(file)) {
    console.warn(`Skipped ${file} (already exists).`);
    return;
  }
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function findGitRoot(start) {
  let dir = start;
  while (true) {
    if (existsSync(path.join(dir, ".git"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}

function toPackageName(name) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9._~-]+/g, "-")
      .replace(/^[-._]+|-+$/g, "") || "frontend"
  );
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}
