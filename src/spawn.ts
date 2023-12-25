import childProcess from "node:child_process";
import readline from "node:readline/promises";

interface SpawnOptions {
  env?: NodeJS.ProcessEnv;
  onStdOut: (line: string) => void;
  onStdErr: (line: string) => void;
}

export function spawn(
  command: string,
  args: readonly string[],
  options: SpawnOptions
): Promise<childProcess.ChildProcess> {
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: options.env,
    });

    let stdOutRl: readline.Interface | undefined;
    let stdErrRl: readline.Interface | undefined;

    if (child.stdout) {
      stdOutRl = readline.createInterface({ input: child.stdout });
      stdOutRl.on("line", options.onStdOut);
    }

    if (child.stderr) {
      stdErrRl = readline.createInterface({ input: child.stderr });
      stdErrRl.on("line", options.onStdErr);
    }

    const unsubscribe = () => {
      child.removeAllListeners();
      stdOutRl?.removeAllListeners();
      stdErrRl?.removeAllListeners();
    };

    child.on("error", (err) => {
      unsubscribe();
      reject(err);
    });

    child.on("close", () => {
      unsubscribe();
      resolve(child);
    });
  });
}
