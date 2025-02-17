import { spawn } from "child_process";
import { promises as fsPromises } from "fs";
import path from "path";
import { wrapFolderWithQuotes } from "utils/utils";

export class VirtualEnvManager {
  /**
   * Create a Python virtual environment.
   * @param venvPath The path where the virtual environment will be created.
   * @param pythonPath The Python executable to use (defaults to "python").
   */
  createVenv(venvPath: string, pythonPath: string = "python"): Promise<string> {
    return new Promise(async (resolve, reject) => {
      // Check if the virtual environment already exists before creating it.
      if (await this.isEnvExsits(venvPath)) {
        console.log(`Virtual environment at ${venvPath} already exists.`);

        const isWin = process.platform === "win32";
        const venvPython = isWin
          ? path.join(venvPath, "Scripts", "python.exe")
          : path.join(venvPath, "bin", "python");

        resolve(venvPython);
        return;
      }

      console.log(
        `Creating virtual environment at ${venvPath} using ${pythonPath}...`
      );

      const args = ["-m", "venv", wrapFolderWithQuotes(venvPath)];
      const proc = spawn(pythonPath, args, { stdio: "inherit", shell: true });
      proc.on("error", (err) => {
        reject(new Error(`Failed to start Python: ${err.message}`));
      });
      proc.on("close", (code) => {
        if (code === 0) {
          console.log(`Virtual environment created at ${venvPath}.`);
          const isWin = process.platform === "win32";
          const venvPython = isWin
            ? path.join(venvPath, "Scripts", "python.exe")
            : path.join(venvPath, "bin", "python");

          resolve(venvPython);
        } else {
          reject(new Error(`Python venv creation exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Check if a virtual environment exists at the specified path.
   *
   * @param venvPath - The path to the virtual environment.
   * @returns A promise that resolves to `true` if the virtual environment exists, and `false` otherwise.
   *
   * @remarks
   * This function uses the `fsPromises.access` method to check if the virtual environment directory exists.
   * If the directory exists, the function resolves to `true`; otherwise, it resolves to `false`.
   *
   * @example
   * ```typescript
   * const venvManager = new VirtualEnvManager();
   * const venvPath = "path/to/virtual/environment";
   *
   * try {
   *   const venvExists = await venvManager.existsVenv(venvPath);
   *   if (venvExists) {
   *     console.log("Virtual environment exists.");
   *   } else {
   *     console.log("Virtual environment does not exist.");
   *   }
   * } catch (error) {
   *   console.error("Error checking virtual environment:", error);
   * }
   * ```
   */
  async isEnvExsits(venvPath: string): Promise<boolean> {
    try {
      await fsPromises.access(
        wrapFolderWithQuotes(venvPath),
        fsPromises.constants.F_OK
      );
      return true;
    } catch (e) {
      console.log(`Virtual environment at ${venvPath} does not exist.`);
      return false;
    }
  }

  /**
   * Delete a virtual environment by removing its directory recursively.
   * @param venvPath The path to the virtual environment.
   */
  async deleteVenv(venvPath: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // Check if the virtual environment exists before deleting it.
      if (!(await this.isEnvExsits(venvPath))) {
        console.log(`Virtual environment at ${venvPath} does not exist.`);
        resolve();
        return;
      }

      try {
        // Remove the directory recursively.
        await fsPromises.rm(venvPath, { recursive: true, force: true });
        console.log(`Virtual environment at ${venvPath} has been deleted.`);
        resolve();
      } catch (err: any) {
        reject(
          new Error(
            `Failed to delete virtual environment at ${venvPath}: ${err.message}`
          )
        );
      }
    });
  }
}
