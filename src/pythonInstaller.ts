import { spawn, exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import sudo from "sudo-prompt";
import { PythonVersionManager } from "pythonVersionManager";

const execPromise = promisify(exec);

export class PythonInstaller {
  // Python version manager instance.
  private pythonVersionManager = new PythonVersionManager();

  /**
   * Ensures that a Python executable is available.
   * If found on the system, returns its command name.
   * Otherwise, installs Python automatically using pyenv-win (on Windows)
   * or pyenv (on Linux/macOS).
   * @param version The Python version to ensure (default "3.9.1").
   * @param pyenvPath The path to the pyenv executable (example "/usr/local/bin/.pyenv").
   * @param venvPath Optional path to the virtual environment. This value is optional but could be required if the process is a ElectronJS application or process executable is located in protected folders on OS. So instead of checking the system folders, use non-protected folders for venv folder and check exsistence of the venv folder.
   * @returns The path to the Python executable.
   */
  async ensurePythonInstalled(
    version: string = "3.9.1",
    pyenvPath: string,
    venvPath?: string
  ): Promise<string> {
    // On Windows, use pyenv-win, check if it's installed.
    if (process.platform === "win32") {
      if (!(await this.commandExists("pyenv"))) {
        await this.installPyenvWin();
      }
    }

    // Find the existing Python installation.
    const existing = await this.findPython(version, venvPath);

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
        await this.installPyenv(pyenvPath);
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
  private async findPython(
    version: string,
    venvPath?: string
  ): Promise<string | null> {
    // If Venv Path Has Passed, Check Venv Path Exsistence by File System
    if (venvPath && fs.existsSync(venvPath)) {
      // Check Venv Python Path Exsistence
      const isWin = process.platform === "win32";

      // Construct Python Path
      const pythonPath = isWin
        ? path.join(venvPath, "Scripts", "python.exe")
        : path.join(venvPath, "bin", "python");

      if (fs.existsSync(pythonPath)) {
        return pythonPath;
      } else {
        return null;
      }
    }

    try {
      const result = await execPromise(`pyenv local ${version}`);
      console.log(result);
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
  private async installPyenvWin(): Promise<void> {
    console.log("Installing pyenv-win on Windows...");
    await this.disableAdminRights();
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
  async installPyenv(pyenvRoot: string): Promise<void> {
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
    const pyenvRootKey = "PYENV_ROOT"; // Define key as a variable
    process.env[pyenvRootKey] = pyenvRoot;
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
    try {
      // Disable Protections to install Python.
      await this.disableAdminRights();
      // Install the specified Python version.
      await this.pythonVersionManager.installVersion(version);
      // Set the specified Python version as the local version.
      await this.pythonVersionManager.setLocalVersion(version);

      // Check if the Python version was successfully installed.
      const { stdout } = await execPromise(`pyenv local`);
      console.log(`Local Versions Has Set To: ${stdout.trim()}`);
    } catch (error) {
      throw error;
    }
  }

  // Disables administrative rights for the current process.
  private disableAdminRights(): Promise<boolean> {
    const options = {
      name: "MonitorDogPythonInstaller",
    };

    const command =
      'powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine"';

    return new Promise((resolve, reject) => {
      sudo.exec(command, options, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error}`);
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Retrieves the path to the Python executable for a given version installed via pyenv.
   */
  async getPythonPathFromPyenv(version: string): Promise<string> {
    try {
      const result = await execPromise(
        `python -c \"import sys; print(sys.executable)\"`,
        {}
      );
      const prefix = result.stdout.trim();

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
  private async execCommand(command: string, args: string[]): Promise<void> {
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
