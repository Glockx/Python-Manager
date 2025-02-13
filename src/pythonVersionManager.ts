import { spawn } from "child_process";

export class PythonVersionManager {
  /**
   * Install a Python version using pyenv.
   * @param version The version string (e.g. "3.9.1")
   */
  installVersion(version: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd = "pyenv";
      const args = ["install", version];
      console.log(`Installing Python ${version} via pyenv...`);
      const proc = spawn(cmd, args, { stdio: "inherit", shell: true });
      proc.on("error", (err) => {
        reject(new Error(`Failed to start pyenv: ${err.message}`));
      });
      proc.on("close", (code) => {
        if (code === 0) {
          console.log(`Python ${version} installed successfully.`);
          resolve();
        } else {
          reject(new Error(`pyenv install exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Uninstall a Python version using pyenv.
   * @param version The version string to uninstall.
   */
  uninstallVersion(version: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd = "pyenv";
      const args = ["uninstall", version];
      console.log(`Uninstalling Python ${version} via pyenv...`);
      const proc = spawn(cmd, args, { stdio: "inherit", shell: true });
      proc.on("error", (err) => {
        reject(new Error(`Failed to start pyenv: ${err.message}`));
      });
      proc.on("close", (code) => {
        if (code === 0) {
          console.log(`Python ${version} uninstalled successfully.`);
          resolve();
        } else {
          reject(new Error(`pyenv uninstall exited with code ${code}`));
        }
      });
    });
  }

  /**
   * List all Python versions installed via pyenv.
   */
  listInstalledVersions(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const cmd = "pyenv";
      const args = ["versions"];

      const proc = spawn(cmd, args, {
        stdio: ["inherit", "pipe", "pipe"],
        shell: true,
      });
      let output = "";
      proc.stdout.on("data", (data) => {
        output += data.toString();
      });
      proc.on("error", (err) => {
        reject(new Error(`Failed to start pyenv: ${err.message}`));
      });
      proc.on("close", (code) => {
        if (code === 0) {
          const versions = output
            .split("\n")
            .map((v) => v.trim())
            .filter((v) => v.length > 0);
          resolve(versions);
        } else {
          reject(new Error(`pyenv versions exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Set the local Python version via pyenv.
   * @param version The version to set as local.
   */
  setLocalVersion(version: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd = "pyenv";
      const args = ["local", version];
      const proc = spawn(cmd, args, {
        stdio: ["inherit", "pipe", "pipe"],
        shell: true,
      });
      proc.on("error", (err) => {
        reject(new Error(`Failed to start pyenv: ${err.message}`));
      });
      proc.on("close", (code) => {
        if (code === 0) {
          console.log(`Local Python version set to ${version}.`);
          resolve();
        } else {
          reject(new Error(`pyenv local exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Retrieves the local Python version set by pyenv.
   *
   * This function executes the 'pyenv local' command to get the currently set local Python version.
   * It uses Node.js child process to spawn a shell command and capture its output.
   *
   * @returns A Promise that resolves with a string representing the local Python version.
   *          The version string is trimmed of any leading or trailing whitespace.
   * @throws Will reject the promise with an Error if the pyenv command fails to start or exits with a non-zero code.
   */
  getLocalVersion(): Promise<string> {
    return new Promise((resolve, reject) => {
      const cmd = "pyenv";
      const args = ["local"];

      const proc = spawn(cmd, args, {
        stdio: ["inherit", "pipe", "pipe"],
        shell: true,
      });
      let output = "";
      proc.stdout.on("data", (data) => {
        output += data.toString();
      });
      proc.on("error", (err) => {
        reject(new Error(`Failed to start pyenv: ${err.message}`));
      });
      proc.on("close", (code) => {
        if (code === 0) {
          const version = output.trim();
          resolve(version);
        } else {
          reject(new Error(`pyenv local command exited with code ${code}`));
        }
      });
    });
  }
}
