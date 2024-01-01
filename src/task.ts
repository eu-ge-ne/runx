import { Runner } from "./runner.js";

type Tasks<T extends string> = Record<T, Task>;

type Task = () => Promise<unknown>;

export type TaskParams<T extends string> =
  | string
  | [string, { env: NodeJS.ProcessEnv }]
  | ((x: Runner & Tasks<T>) => Promise<unknown>);

export function createTasks<T extends string>(
  from: Record<T, TaskParams<T>>,
  getRunnerForTask: (taskName: string) => Runner
): Record<T, Task> {
  const fromEntries = Object.entries(from) as [T, TaskParams<T>][];

  let tasks: Tasks<T>;

  const toEntries = fromEntries.map(([taskName, taskParams]) => {
    const run = getRunnerForTask(taskName);

    let task: Task;

    if (typeof taskParams === "string") {
      task = () => run(taskParams);
    } else if (Array.isArray(taskParams)) {
      task = () => run(...taskParams);
    } else {
      task = () => taskParams(Object.assign(run, tasks));
    }

    return [taskName, task];
  });

  tasks = Object.fromEntries(toEntries) as Record<T, Task>;

  return tasks;
}
