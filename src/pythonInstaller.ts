import { spawn, exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

const execPromise = promisify(exec);

export class PythonInstaller {
  /**
   * Ensures that a Python executable is available.
   * If found on the system, returns its command name.
   * Otherwise, installs Python automatically using pyenv-win (on Windows)
   * or pyenv (on Linux/macOS).
   * @param version The Python version to ensure (default "3.9.1").
   * @returns The path to the Python executable.
   */
  async ensurePythonInstalled(version: string = "3.9.1"): Promise<string> {
    // On Windows, use pyenv-win, check if it's installed.
    if (process.platform === "win32") {
      if (!(await this.commandExists("pyenv"))) {
        await this.installPyenvWin();
      }
    }

    // Find the existing Python installation.
    const existing = await this.findPython(version);

    if (existing) {
      console.log(`Found existing Python: ${existing}`);
      return existing;
    }

    if (process.platform === "win32") {
      // Install Given Python Version With pyenv-win.
      await this.installPythonViaPyenv(version);

      // Return the path to the installed Python.
      return await this.getPythonPathFromPyenv(version);
    } else if (process.platform === "linux" || process.platform === "darwin") {
      // On Linux/macOS, use pyenv.
      if (!(await this.commandExists("pyenv"))) {
        await this.installPyenv();
      }
      await this.installPythonViaPyenv(version);
      return await this.getPythonPathFromPyenv(version);
    } else {
      throw new Error("Unsupported platform for automatic Python installation");
    }
  }

  /**
   * Checks whether a Python command exists by attempting to get its version.
   */
  async findPython(version: string): Promise<string | null> {
    try {
      const result = await execPromise(`pyenv local ${version}`);
    } catch (error) {
      console.log(`Python ${version} not found. Installing...`);
      return null;
    }

    return this.getPythonPathFromPyenv(version);
  }

  /**
   * Checks if a given command exists.
   * @param cmd The command name.
   */
  async commandExists(cmd: string): Promise<boolean> {
    return new Promise((resolve) => {
      // On Windows use "where"; on Linux/macOS use "command -v".
      const command = process.platform === "win32" ? "where" : "command -v";
      const child = spawn(command, [cmd], { stdio: "ignore" });
      child.on("close", (code) => {
        resolve(code === 0);
      });
    });
  }

  /**
   * Installs pyenv-win on Windows by running the provided PowerShell command.
   */
  async installPyenvWin(): Promise<void> {
    console.log("Installing pyenv-win on Windows...");
    return new Promise((resolve, reject) => {
      // This PowerShell command downloads and runs the pyenv-win installer script.
      const psCommand = `Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/pyenv-win/pyenv-win/master/pyenv-win/install-pyenv-win.ps1" -OutFile "./install-pyenv-win.ps1"; &"./install-pyenv-win.ps1"`;
      const proc = spawn("powershell.exe", ["-Command", psCommand], {
        stdio: "inherit",
      });
      proc.on("error", (err) => {
        reject(new Error(`Failed to start PowerShell: ${err.message}`));
      });
      proc.on("close", (code) => {
        if (code === 0) {
          console.log("pyenv-win installed successfully.");
          resolve();
        } else {
          reject(new Error(`pyenv-win installation exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Installs pyenv on Linux/macOS by cloning its repository.
   */
  async installPyenv(): Promise<void> {
    const pyenvRoot = path.resolve(__dirname, "..", ".pyenv");
    if (fs.existsSync(pyenvRoot)) {
      console.log("pyenv already installed.");
    } else {
      console.log("Installing pyenv...");
      await this.execCommand("git", [
        "clone",
        "https://github.com/pyenv/pyenv.git",
        pyenvRoot,
      ]);
      console.log("pyenv installed.");
    }
    // Add pyenv to PATH for the current process.
    process.env.PYENV_ROOT = pyenvRoot;
    process.env.PATH = `${path.join(pyenvRoot, "bin")}${path.delimiter}${
      process.env.PATH
    }`;
  }

  /**
   * Installs a specific Python version via pyenv (or pyenv-win on Windows).
   */
  async installPythonViaPyenv(version: string): Promise<void> {
    try {
      // Check if the version is already installed via pyenv.
      const { stdout } = await execPromise(`pyenv version`);
      if (
        stdout
          .split("\n")
          .map((v) => v.trim())
          .includes(version)
      ) {
        console.log(`Python ${version} is already installed via pyenv.`);
        return;
      }
    } catch (e) {
      // Ignore errors.
      console.error(e);
    }
    console.log(`Installing Python ${version} via pyenv...`);
    // await this.execCommand("pyenv", ["install", version]);
    await execPromise(`pyenv install ${version}`);
    await execPromise(`pyenv local ${version}`);
    const { stdout } = await execPromise(`pyenv local`);
    console.log(`Has Set Local To: ${stdout.trim()}`);
    console.log(`Python ${version} installed via pyenv.`);
  }

  /**
   * Retrieves the path to the Python executable for a given version installed via pyenv.
   */
  async getPythonPathFromPyenv(version: string): Promise<string> {
    try {
      const { stdout } = await execPromise(
        `python -c "import sys; print(sys.executable)"`
      );
      const prefix = stdout.trim();

      if (!fs.existsSync(prefix)) {
        throw new Error(
          `Python executable not found in pyenv prefix for version ${version} `
        );
      }
      return prefix;
    } catch (error) {
      console.error("Error getting Python path:", error);
      throw error;
    }
  }

  /**
   * Executes a command with the provided arguments.
   */
  async execCommand(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { stdio: "inherit" });
      proc.on("error", (err) => {
        console.log(`Failed to start ${command}: ${err.message}`);
        reject(err);
      });
      proc.on("close", (code) => {
        console.log(`${command} exited with code ${code}`);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${command} exited with code ${code}`));
        }
      });
    });
  }
}
