import { spawn } from "child_process";

/**
 * Represents the result of a Python script execution.
 * @interface
 * @property {string} stdout - The standard output from the execution.
 * @property {string} stderr - The standard error output from the execution.
 * @property {number} exitCode - The exit code returned by the Python process.
 * @property {boolean} aborted - Indicates whether the execution was aborted before completion.
 */
export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  aborted: boolean;
}

export class PythonExecutor {
  /**
   * Execute a Python script file with optional live output streaming.
   *
   * @param filePath Path to the Python script.
   * @param args Optional arguments to pass to the script.
   * @param pythonPath The Python executable to use (defaults to "python").
   * @param withStream If true, streams output live to the console (defaults to false).
   * @param abortSignal Optional AbortSignal to cancel the execution.
   */
  runScript(
    filePath: string,
    args: string[] = [],
    pythonPath: string = "python",
    withStream: boolean = false,
    abortSignal?: AbortSignal
  ): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      console.log(`Executing script: ${filePath} using ${pythonPath}...`);
      const proc = spawn(pythonPath, [filePath, ...args], {
        stdio: ["ignore", "pipe", "pipe"],
        signal: abortSignal,
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

      proc.on("error", (err: any) => {
        if (err.name === "AbortError") {
          return resolve({
            stdout,
            stderr,
            exitCode: -1, // or another value to indicate abortion
            aborted: true,
          });
        }

        reject(new Error(`Failed to execute script: ${err.message}`));
      });

      proc.on("close", (code) => {
        if (abortSignal?.aborted) {
          // Return a special result indicating the process was aborted
          return resolve({
            stdout,
            stderr,
            exitCode: 99, // or another value to indicate abortion
            aborted: true,
          });
        }

        resolve({
          stdout,
          stderr,
          aborted: false,
          exitCode: code !== null ? code : -1,
        });
      });
    });
  }

  /**
   * Execute arbitrary Python code.
   *
   * @param code The Python code to execute.
   * @param pythonPath The Python executable to use (defaults to "python").
   * @param withStream If true, streams output live to the console (defaults to false).
   * @param abortSignal Optional AbortSignal to cancel the execution.
   */
  runCode(
    code: string,
    pythonPath: string = "python",
    withStream: boolean = false,
    abortSignal?: AbortSignal
  ): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      console.log(`Executing Python code using ${pythonPath}...`);
      const proc = spawn(pythonPath, ["-c", code], {
        stdio: ["ignore", "pipe", "pipe"],
        signal: abortSignal,
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

      proc.on("error", (err: any) => {
        if (err.name === "AbortError") {
          return resolve({
            stdout,
            stderr,
            exitCode: 99, // or another value to indicate abortion
            aborted: true,
          });
        }
        reject(new Error(`Failed to execute code: ${err.message}`));
      });

      proc.on("close", (code) => {
        if (abortSignal?.aborted) {
          // Return a special result indicating the process was aborted
          return resolve({
            stdout,
            stderr,
            exitCode: -1, // or another value to indicate abortion
            aborted: true,
          });
        }
        resolve({
          stdout,
          stderr,
          aborted: false,
          exitCode: code !== null ? code : -1,
        });
      });
    });
  }
}
