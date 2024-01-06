import process from "node:process";

import { createRunner } from "./runner.js";
import { createTasks, TaskParams } from "./task.js";

const { npm_package_name = "", npm_lifecycle_event = "" } = process.env;

export function runx<T extends string>(input: Record<T, TaskParams<T>>) {
  const tasks = createTasks(input, (taskName) =>
    createRunner(`${npm_package_name} [${String(taskName)}]`, {
      env: {
        FORCE_COLOR: "true",
        ...process.env,
      },
    })
  );

  const task = tasks[npm_lifecycle_event as T];

  return task?.();
}
