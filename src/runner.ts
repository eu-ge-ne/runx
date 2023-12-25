import { spawn } from "./spawn.js";

interface RunnerOptions {
  env: NodeJS.ProcessEnv;
}

export type Runner = (cmd: string, options?: RunnerOptions) => Promise<unknown>;

export function createRunner(
  prefix: string,
  baseOptions: RunnerOptions
): Runner {
  const info = (str: string) => console.log(`${prefix} ${str}`);
  const output = (str: string) => console.log(`${prefix} ${str}`);
  const error = (str: string) => console.log(`${prefix} ${str}`);

  return async (command, options) => {
    const cmds = command.split(" ");
    const arg0 = cmds[0] as string;
    const args = cmds.slice(1);

    let envs = "";

    if (options?.env) {
      envs =
        Object.entries(options.env)
          .map(([key, val]) => `${key}=${val}`)
          .join(" ") + " ";
    }

    info(`${envs}${command}`);

    const result = await spawn(arg0, args, {
      env: {
        ...baseOptions.env,
        ...options?.env,
      },
      onStdOut: output,
      onStdErr: error,
    });

    info(`Exited with code ${result.exitCode}`);
  };
}
