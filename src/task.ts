import { Runner } from "./runner.js";

type Declarations<T extends PropertyKey> = Record<T, TaskParams<T>>;

type Task = () => Promise<unknown>;

type Tasks<T extends PropertyKey> = {
  [P in keyof Declarations<T>]: Task;
};

export type TaskParams<T extends PropertyKey> =
  | string
  | [string, { env: NodeJS.ProcessEnv }]
  | ((x: Runner & Tasks<T>) => Promise<unknown>);

export function createTasks<T extends PropertyKey>(
  from: Declarations<T>,
  getTaskRunner: (taskName: PropertyKey) => Runner
): Tasks<T> {
  const fromEntries = Object.entries(from) as [T, TaskParams<T>][];

  let tasks: Tasks<T>;

  const toEntries = fromEntries.map(([taskName, taskParams]) => {
    const run = getTaskRunner(taskName);

    let task: Task;

    if (typeof taskParams === "string") {
      task = () => run(taskParams);
    } else if (Array.isArray(taskParams)) {
      task = () => run(...taskParams);
    } else {
      task = () => taskParams(Object.assign(run, tasks));
    }

    return [taskName, task] as [T, Task];
  });

  tasks = Object.fromEntries(toEntries) as Tasks<T>;

  return tasks;
}
