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
