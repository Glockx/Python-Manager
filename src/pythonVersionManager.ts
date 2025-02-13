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
      const proc = spawn(cmd, args, { stdio: "inherit" });
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
      const args = ["uninstall", "-f", version];
      console.log(`Uninstalling Python ${version} via pyenv...`);
      const proc = spawn(cmd, args, { stdio: "inherit" });
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
      const args = ["versions", "--bare"];
      const proc = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
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
   * Set the global Python version via pyenv.
   * @param version The version to set as global.
   */
  setGlobalVersion(version: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd = "pyenv";
      const args = ["global", version];
      console.log(`Setting global Python version to ${version} via pyenv...`);
      const proc = spawn(cmd, args, { stdio: "inherit" });
      proc.on("error", (err) => {
        reject(new Error(`Failed to start pyenv: ${err.message}`));
      });
      proc.on("close", (code) => {
        if (code === 0) {
          console.log(`Global Python version set to ${version}.`);
          resolve();
        } else {
          reject(new Error(`pyenv global exited with code ${code}`));
        }
      });
    });
  }
}
