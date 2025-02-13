import { spawn } from "child_process";
import { promises as fsPromises } from "fs";

export class VirtualEnvManager {
  /**
   * Create a Python virtual environment.
   * @param venvPath The path where the virtual environment will be created.
   * @param pythonPath The Python executable to use (defaults to "python").
   */
  createVenv(venvPath: string, pythonPath: string = "python"): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (await this.existsVenv(venvPath)) {
        console.log(`Virtual environment at ${venvPath} already exists.`);
        resolve();
        return;
      }

      console.log(
        `Creating virtual environment at ${venvPath} using ${pythonPath}...`
      );
      const args = ["-m", "venv", venvPath];
      const proc = spawn(pythonPath, args, { stdio: "inherit" });
      proc.on("error", (err) => {
        reject(new Error(`Failed to start Python: ${err.message}`));
      });
      proc.on("close", (code) => {
        if (code === 0) {
          console.log(`Virtual environment created at ${venvPath}.`);
          resolve();
        } else {
          reject(new Error(`Python venv creation exited with code ${code}`));
        }
      });
    });
  }

  // Check if a virtual environment exists at the given path.
  // Note: This method does not check if the virtual environment is active.
  async existsVenv(venvPath: string): Promise<boolean> {
    try {
      await fsPromises.access(venvPath, fsPromises.constants.F_OK);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Delete a virtual environment by removing its directory recursively.
   * @param venvPath The path to the virtual environment.
   */
  async deleteVenv(venvPath: string): Promise<void> {
    console.log(`Deleting virtual environment at ${venvPath}...`);
    await fsPromises.rm(venvPath, { recursive: true, force: true });
    console.log(`Virtual environment at ${venvPath} deleted.`);
  }
}
