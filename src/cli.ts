#!/usr/bin/env node

import { execSync } from "node:child_process";

execSync("tsx ./runx.ts", {
  stdio: ["ignore", "inherit", "inherit"],
});
