#!/usr/bin/env bash
# Temporary: runs every check, collects logs and pushes them to the wip-out branch.
set -u
OUT=$RUNNER_TEMP/out
mkdir -p "$OUT"
SRC=$GITHUB_WORKSPACE
run() { local name=$1; shift; echo "### $name" ; "$@" 2>&1 | tail -150; local code=${PIPESTATUS[0]}; echo "### EXIT $name $code"; echo "$name $code" >> "$OUT/summary.txt"; }

{
  node -v; npm -v
  run install npm install --no-audit
  cp package-lock.json "$OUT/" || true
  run prettier-write npx prettier --write .
  git diff > "$OUT/prettier.patch"
} > "$OUT/root.log" 2>&1

checks() {
  run format npm run format:check
  run lint npm run lint
  run typecheck npm run typecheck
  run test npm run test:coverage
  run build npm run build
  run pw-install npx playwright install --with-deps chromium
  run e2e npm run test:e2e
}

for v in vanilla react; do
  W=$RUNNER_TEMP/w-$v
  rsync -a --exclude .git "$SRC/" "$W/"
  (cd "$W" && git init -q && run "$v-init" node scripts/init.mjs --variant "$v" && checks) > "$OUT/$v.log" 2>&1
done

H=$RUNNER_TEMP/host
mkdir -p "$H" && git -C "$H" init -q
(cd "$SRC" && run nested-init node scripts/init.mjs --variant react --target "$H/src/Web") > "$OUT/nested.log" 2>&1
{ ls -la "$H" "$H/.github" "$H/.github/workflows"; cat "$H/.github/workflows/frontend.yml"; cat "$H/src/Web/package.json"; cat "$H/src/Web/.husky/pre-commit"; } >> "$OUT/nested.log" 2>&1
(cd "$H/src/Web" && run nested-lint npm run lint && run nested-typecheck npm run typecheck && run nested-test npm test && run nested-build npm run build) >> "$OUT/nested.log" 2>&1

(cd "$SRC" && run docker-build bash -c "rsync -a --exclude .git ./ $RUNNER_TEMP/d/ && cd $RUNNER_TEMP/d && node scripts/init.mjs --variant react && docker build -f docker/Dockerfile -t t .") > "$OUT/docker.log" 2>&1

cd "$OUT"
git init -q -b wip-out
git config user.name ci; git config user.email ci@example.com
git add -A && git commit -qm "wip output $GITHUB_SHA"
git push -f "https://x-access-token:${GH_PUSH_TOKEN}@github.com/${GITHUB_REPOSITORY}" wip-out
