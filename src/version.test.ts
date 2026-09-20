import { describe, expect, it } from "vitest";
import pkg from "../package.json";

describe("the app version", () => {
  // scripts/bump-version.mjs splits the version on "." and adds 1 to the last
  // part, so anything but three plain numbers ("1.0.0-beta") would turn into
  // "1.0.NaN" and go out with every deploy.
  it("is three plain numbers, which is what the bump script expects", () => {
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  // vite.config.ts defines __APP_VERSION__ from package.json, and the page
  // prints it; if the define is lost, the page would show a ReferenceError
  it("is what the build embeds as __APP_VERSION__", () => {
    expect(__APP_VERSION__).toBe(pkg.version);
  });
});
