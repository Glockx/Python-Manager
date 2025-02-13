import { spawn } from "child_process";

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class PythonExecutor {
  /**
   * Execute a Python script file with optional live output streaming.
   *
   * @param filePath Path to the Python script.
   * @param args Optional arguments to pass to the script.
   * @param pythonPath The Python executable to use (defaults to "python").
   * @param withStream If true, streams output live to the console (defaults to false).
   */
  runScript(
    filePath: string,
    args: string[] = [],
    pythonPath: string = "python",
    withStream: boolean = false
  ): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      console.log(`Executing script: ${filePath} using ${pythonPath}...`);
      const proc = spawn(pythonPath, [filePath, ...args], {
        stdio: ["ignore", "pipe", "pipe"],
      });
      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (data) => {
        const chunk = data.toString();
        stdout += chunk;
        if (withStream) {
          process.stdout.write(chunk);
        }
      });

      proc.stderr.on("data", (data) => {
        const chunk = data.toString();
        stderr += chunk;
        if (withStream) {
          process.stderr.write(chunk);
        }
      });

      proc.on("error", (err) => {
        reject(new Error(`Failed to execute script: ${err.message}`));
      });

      proc.on("close", (code) => {
        resolve({
          stdout,
          stderr,
          exitCode: code !== null ? code : -1,
        });
      });
    });
  }

  /**
   * Execute arbitrary Python code.
   * @param code The Python code to execute.
   * @param pythonPath The Python executable to use (defaults to "python").
   * @param withStream If true, streams output live to the console (defaults to false).
   */
  runCode(
    code: string,
    pythonPath: string = "python",
    withStream: boolean = false
  ): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      console.log(`Executing Python code using ${pythonPath}...`);
      const proc = spawn(pythonPath, ["-c", code], {
        stdio: ["ignore", "pipe", "pipe"],
      });
      let stdout = "";
      let stderr = "";
      proc.stdout.on("data", (data) => {
        const chunk = data.toString();
        stdout += chunk;
        if (withStream) {
          process.stdout.write(chunk);
        }
      });
      proc.stderr.on("data", (data) => {
        const chunk = data.toString();
        stderr += chunk;
        if (withStream) {
          process.stderr.write(chunk);
        }
      });
      proc.on("error", (err) => {
        reject(new Error(`Failed to execute code: ${err.message}`));
      });
      proc.on("close", (code) => {
        resolve({ stdout, stderr, exitCode: code !== null ? code : -1 });
      });
    });
  }
}
