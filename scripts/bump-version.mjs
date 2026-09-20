import { readFileSync, writeFileSync } from "node:fs";

// Increments package.json's patch version by 1. Run in CI before the checks and
// the build, so the version that is deployed is the one that then gets
// committed back to main.
const pkgPath = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
const [major, minor, patch] = pkg.version.split(".").map(Number);

pkg.version = `${major}.${minor}.${patch + 1}`;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

console.log(`package.json version bumped to ${pkg.version}`);
