import { spawn } from "child_process";

export class PipManager {
  /**
   * Runs a pip command using the given Python executable.
   * @param args The pip command arguments.
   * @param pythonPath The Python executable to use (defaults to "python").
   */
  private runPipCommand(
    args: string[],
    pythonPath: string = "python"
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`Running: ${pythonPath} -m pip ${args.join(" ")}`);
      const proc = spawn(pythonPath, ["-m", "pip", ...args], {
        stdio: "inherit",
      });
      proc.on("error", (err) => {
        reject(new Error(`Failed to start pip command: ${err.message}`));
      });
      proc.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`pip command exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Installs multiple Python packages using pip.
   * @param packageNames An array of package names to install.
   * @param pythonPath The path to the Python executable. Defaults to "python".
   * @returns A Promise that resolves when all packages are installed successfully, or rejects if there's an error.
   */
  installMultiple(
    packageNames: string[],
    pythonPath: string = "python"
  ): Promise<void> {
    return this.runPipCommand(["install", ...packageNames], pythonPath);
  }

  /**
   * Installs Python packages specified in a requirements file using pip.
   * @param requirementsFilePath The path to the requirements file containing package specifications.
   * @param pythonPath The path to the Python executable. Defaults to "python".
   * @returns A Promise that resolves when all packages from the requirements file are installed successfully, or rejects if there's an error.
   */
  installRequirementsFile(
    requirementsFilePath: string,
    pythonPath: string = "python"
  ): Promise<void> {
    return this.runPipCommand(
      ["install", "-r", requirementsFilePath],
      pythonPath
    );
  }

  /**
   * Install a Python package.
   * @param packageName The package name to install.
   * @param pythonPath The Python executable to use (defaults to "python").
   */
  install(packageName: string, pythonPath: string = "python"): Promise<void> {
    return this.runPipCommand(["install", packageName], pythonPath);
  }

  /**
   * Uninstall a Python package.
   * @param packageName The package name to uninstall.
   * @param pythonPath The Python executable to use (defaults to "python").
   */
  uninstall(packageName: string, pythonPath: string = "python"): Promise<void> {
    return this.runPipCommand(["uninstall", "-y", packageName], pythonPath);
  }

  /**
   * List installed packages (pip freeze).
   * @param pythonPath The Python executable to use (defaults to "python").
   */
  listInstalledPackages(pythonPath: string = "python"): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const args = ["-m", "pip", "freeze"];
      console.log(`Running: ${pythonPath} ${args.join(" ")}`);
      let output = "";
      const proc = spawn(pythonPath, args, {
        stdio: ["ignore", "pipe", "inherit"],
      });
      proc.stdout.on("data", (data) => {
        output += data.toString();
      });
      proc.on("error", (err) => {
        reject(new Error(`Failed to start pip freeze: ${err.message}`));
      });
      proc.on("close", (code) => {
        if (code === 0) {
          const packages = output
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line !== "");
          resolve(packages);
        } else {
          reject(new Error(`pip freeze exited with code ${code}`));
        }
      });
    });
  }
}
