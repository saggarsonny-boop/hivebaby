// G01 — engine package.json references @queen-bee/client.
//
// The canonical client package is the only sanctioned way for engines to
// consume Queen Bee. An engine without the dependency cannot call
// govern() (G02) and cannot persist a stamp (G05) — so G01 is the
// load-bearing rule of the GOVERNANCE family.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { RuleDefinition } from "../../types.js";

const QB_CLIENT = "@queen-bee/client";

export const G01_packageDep: RuleDefinition = {
  id: "G01",
  title: "engine package.json declares @queen-bee/client",
  category: "GOVERNANCE",
  severity: "MANDATORY",
  async check(ctx) {
    const path = join(ctx.engineRoot, "package.json");
    if (!existsSync(path)) {
      return {
        status: "fail",
        message: `cannot read package.json (${path} does not exist) — engine cannot consume @queen-bee/client without it`,
      };
    }

    let pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string>; peerDependencies?: Record<string, string> };
    try {
      pkg = JSON.parse(readFileSync(path, "utf8"));
    } catch (err) {
      return {
        status: "fail",
        message: `package.json at ${path} is not valid JSON: ${(err as Error).message}`,
      };
    }

    const deps = pkg.dependencies ?? {};
    const devDeps = pkg.devDependencies ?? {};
    const peerDeps = pkg.peerDependencies ?? {};

    if (QB_CLIENT in deps) {
      return {
        status: "pass",
        message: `${QB_CLIENT}@${deps[QB_CLIENT]} present in dependencies`,
      };
    }
    if (QB_CLIENT in peerDeps) {
      return {
        status: "pass",
        message: `${QB_CLIENT}@${peerDeps[QB_CLIENT]} present in peerDependencies`,
      };
    }
    if (QB_CLIENT in devDeps) {
      // devDependencies aren't installed in production — engines that
      // call govern() at runtime need the package in dependencies.
      return {
        status: "fail",
        message: `${QB_CLIENT} found in devDependencies but not in dependencies. Move it: govern() runs in production code paths.`,
      };
    }

    return {
      status: "fail",
      message: `${QB_CLIENT} missing from package.json. Add via "workspace:*" if engine is in the queen-bee monorepo, or "github:saggarsonny-boop/queen-bee#main" otherwise. See packages/queen-bee-client/WIRING.md §2.`,
    };
  },
};
