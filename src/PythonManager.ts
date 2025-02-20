import { PipManager } from "pipManager";
import { PythonExecutor } from "pythonExecutor";
import { PythonInstaller } from "pythonInstaller";
import { PythonVersionManager } from "pythonVersionManager";
import { ExecutionResult } from "Types/ExecutionResult";
import { VirtualEnvManager } from "venvManager";

export class PythonManager {
  private pythonPath: string = "python"; // Default python path, can be updated after installation
  private pythonVersion: string | null = null; // Keep track of the managed Python version
  private venvPythonPath: string | null = null; // Path to Python in virtual environment, if created
  private pythonInstaller: PythonInstaller = new PythonInstaller();
  private pipManager: PipManager = new PipManager();
  private executor: PythonExecutor = new PythonExecutor();
  private venvManager: VirtualEnvManager = new VirtualEnvManager();
  private versionManager: PythonVersionManager = new PythonVersionManager();

  // Constructor
  constructor() {}

  /**
   * Ensures that a Python executable is available and sets the pythonPath for the manager.
   * If found on the system, returns its command name.
   * Otherwise, installs Python automatically using pyenv-win (on Windows)
   * or pyenv (on Linux/macOS).
   * @param version The Python version to ensure (default "3.9.1").
   * @param pyenvPath The path to the pyenv executable.
   * @param venvPath Optional path to the virtual environment. This value is optional but could be required if the process is a ElectronJS application or process executable is located in protected folders on OS. So instead of checking the system folders, use non-protected folders for venv folder and check exsistence of the venv folder.
   * @returns The path to the Python executable.
   */
  async ensurePythonInstalled(
    version: string = "3.9.1",
    pyenvPath: string,
    venvPath?: string
  ): Promise<string> {
    try {
      const pythonPath = await this.pythonInstaller.ensurePythonInstalled(
        version,
        pyenvPath,
        venvPath
      );
      this.pythonPath = pythonPath;
      this.pythonVersion = version;
      return pythonPath;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a Python virtual environment.
   * @param venvPath The path where the virtual environment will be created.
   * @param pythonPathOverride Optional Python executable path override.
   */
  async createVenv(
    venvPath: string,
    pythonPathOverride?: string
  ): Promise<string> {
    try {
      const pythonPath = pythonPathOverride || this.pythonPath;
      const venvPythonPath = await this.venvManager.createVenv(
        venvPath,
        pythonPath
      );
      this.venvPythonPath = venvPythonPath; // Store venv python path
      return venvPythonPath;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a virtual environment by removing its directory recursively.
   * @param venvPath The path to the virtual environment.
   */
  deleteVenv(venvPath: string): Promise<void> {
    try {
      this.venvPythonPath = null; // Clear venv python path as it's deleted
      return this.venvManager.deleteVenv(venvPath);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if a virtual environment exists at the specified path.
   *
   * @param venvPath - The path to the virtual environment.
   * @returns A promise that resolves to `true` if the virtual environment exists, and `false` otherwise.
   */
  isEnvExsits(venvPath: string): Promise<boolean> {
    try {
      return this.venvManager.isEnvExsits(venvPath);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Install a Python package using pip.
   * @param packageName The package name to install.
   * @param pythonPathOverride Optional Python executable path override. If not provided, and venvPythonPath is set, it will use venvPythonPath, otherwise default pythonPath.
   */
  installPackage(
    packageName: string,
    pythonPathOverride?: string
  ): Promise<void> {
    const pythonPath =
      pythonPathOverride || this.venvPythonPath || this.pythonPath;
    return this.pipManager.install(packageName, pythonPath);
  }

  /**
   * Installs multiple Python packages using pip.
   * @param packageNames An array of package names to install.
   * @param pythonPathOverride Optional Python executable path override. If not provided, and venvPythonPath is set, it will use venvPythonPath, otherwise default pythonPath.
   * @returns A Promise that resolves when all packages are installed successfully, or rejects if there's an error.
   */
  installPackages(
    packageNames: string[],
    pythonPathOverride?: string
  ): Promise<void> {
    const pythonPath =
      pythonPathOverride || this.venvPythonPath || this.pythonPath;
    return this.pipManager.installMultiple(packageNames, pythonPath);
  }

  /**
   * Installs Python packages specified in a requirements file using pip.
   * @param requirementsFilePath The path to the requirements file containing package specifications.
   * @param pythonPathOverride Optional Python executable path override. If not provided, and venvPythonPath is set, it will use venvPythonPath, otherwise default pythonPath.
   * @returns A Promise that resolves when all packages from the requirements file are installed successfully, or rejects if there's an error.
   */
  installRequirementsFile(
    requirementsFilePath: string,
    pythonPathOverride?: string
  ): Promise<void> {
    const pythonPath =
      pythonPathOverride || this.venvPythonPath || this.pythonPath;
    return this.pipManager.installRequirementsFile(
      requirementsFilePath,
      pythonPath
    );
  }

  /**
   * Uninstall a Python package.
   * @param packageName The package name to uninstall.
   * @param pythonPathOverride Optional Python executable path override. If not provided, and venvPythonPath is set, it will use venvPythonPath, otherwise default pythonPath.
   */
  uninstallPackage(
    packageName: string,
    pythonPathOverride?: string
  ): Promise<void> {
    const pythonPath =
      pythonPathOverride || this.venvPythonPath || this.pythonPath;
    return this.pipManager.uninstall(packageName, pythonPath);
  }

  /**
   * List installed packages (pip freeze).
   * @param pythonPathOverride Optional Python executable path override. If not provided, and venvPythonPath is set, it will use venvPythonPath, otherwise default pythonPath.
   */
  listInstalledPackages(pythonPathOverride?: string): Promise<string[]> {
    const pythonPath =
      pythonPathOverride || this.venvPythonPath || this.pythonPath;
    return this.pipManager.listInstalledPackages(pythonPath);
  }

  /**
   * Execute a Python script file with optional live output streaming.
   *
   * @param filePath Path to the Python script.
   * @param args Optional arguments to pass to the script.
   * @param withStream If true, streams output live to the console (defaults to false).
   * @param pythonPathOverride Optional Python executable path override. If not provided, and venvPythonPath is set, it will use venvPythonPath, otherwise default pythonPath.
   * @param abortSignal Optional AbortSignal to cancel the execution.
   */
  runScript(
    filePath: string,
    args: string[] = [],
    withStream: boolean = false,
    pythonPathOverride?: string,
    abortSignal?: AbortSignal
  ): Promise<ExecutionResult> {
    const pythonPath =
      pythonPathOverride || this.venvPythonPath || this.pythonPath;
    return this.executor.runScript(
      filePath,
      args,
      pythonPath,
      withStream,
      abortSignal
    );
  }

  /**
   * Execute arbitrary Python code.
   * @param code The Python code to execute.
   * @param withStream If true, streams output live to the console (defaults to false).
   * @param pythonPathOverride Optional Python executable path override. If not provided, and venvPythonPath is set, it will use venvPythonPath, otherwise default pythonPath.
   * @param abortSignal Optional AbortSignal to cancel the execution.
   */
  runCode(
    code: string,
    withStream: boolean = false,
    pythonPathOverride?: string,
    abortSignal?: AbortSignal
  ): Promise<ExecutionResult> {
    const pythonPath =
      pythonPathOverride || this.venvPythonPath || this.pythonPath;
    return this.executor.runCode(code, pythonPath, withStream, abortSignal);
  }

  /**
   * Install a Python version using pyenv.
   * @param version The version string (e.g. "3.9.1")
   */
  installVersion(version: string): Promise<void> {
    return this.versionManager.installVersion(version);
  }

  /**
   * Uninstall a Python version using pyenv.
   * @param version The version string to uninstall.
   */
  uninstallVersion(version: string): Promise<void> {
    return this.versionManager.uninstallVersion(version);
  }

  /**
   * List all Python versions installed via pyenv.
   */
  listInstalledVersions(): Promise<string[]> {
    return this.versionManager.listInstalledVersions();
  }

  /**
   * Checks if a specific Python package is installed.
   *
   * @param packageName - The name of the package to check for installation.
   * @param pythonPathOverride - Optional. The path to the Python executable to use.
   *                             If not provided, it will use the virtual environment's Python path if available,
   *                             or fall back to the default Python path.
   * @returns A Promise that resolves to a boolean indicating whether the package is installed (true) or not (false).
   */
  isPackageInstalled(
    packageName: string,
    pythonPathOverride?: string
  ): Promise<boolean> {
    const pythonPath =
      pythonPathOverride || this.venvPythonPath || this.pythonPath;

    return this.pipManager.isPackageInstalled(pythonPath, packageName);
  }

  /**
   * Checks if multiple Python packages are installed.
   *
   * @param packageNames - An array of package names to check for installation.
   * @param pythonPathOverride - Optional. The path to the Python executable to use.
   *                             If not provided, it will use the virtual environment's Python path if available,
   *                             or fall back to the default Python path.
   * @returns A Promise that resolves to a boolean indicating whether all specified packages are installed (true) or not (false).
   */
  arePackagesInstalled(packageNames: string[], pythonPathOverride?: string) {
    const pythonPath =
      pythonPathOverride || this.venvPythonPath || this.pythonPath;

    return this.pipManager.arePackagesInstalled(pythonPath, packageNames);
  }

  /**
   * Set the local Python version via pyenv.
   * @param version The version to set as local.
   */
  setLocalVersion(version: string): Promise<void> {
    return this.versionManager.setLocalVersion(version);
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
    return this.versionManager.getLocalVersion();
  }
}
