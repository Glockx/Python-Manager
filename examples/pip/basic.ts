import { PipManager } from "../../src/pipManager";
import { PythonInstaller } from "../../src/pythonInstaller";
import { PythonVersionManager } from "../../src/pythonVersionManager";
import { VirtualEnvManager } from "../../src/venvManager";
import path from "path";

const venvManager = new VirtualEnvManager();
const versionManager = new PythonVersionManager();
const installer = new PythonInstaller();
const pipManager = new PipManager();

// Set Path Of Python Envinonment Path
const venvPath = path.join(__dirname, ".myenv");

async function runTests() {
  // Get The local Python version installed.
  const pythonVersion = await versionManager.getLocalVersion();
  const pythonCmd = await installer.getPythonPathFromPyenv(pythonVersion);
  console.log(`Python Path: ${pythonCmd}`);

  // Create a Python virtual environment using the installed Python.
  const venvPythonPath = await createEnv(pythonCmd);

  // 1. Install single package using pip.
  await pipManager.install("pytest", venvPythonPath);

  // 2. Install multiple packages using pip.
  await pipManager.installMultiple(["numpy", "pandas"], venvPythonPath);

  // 3. Install packages from requirements file using pip.
  await pipManager.installRequirementsFile(
    path.join(__dirname, "requirements.txt"),
    venvPythonPath
  );

  // 4. Uninstall a package using pip.
  await pipManager.uninstall("numpy", venvPythonPath);

  // 5. Show List Of Installed Packages.
  const installedPackages = await pipManager.listInstalledPackages(
    venvPythonPath
  );
  console.log("Installed Packages:", installedPackages);
}

async function createEnv(pythonPath: string) {
  try {
    // Create a virtual environment using the installed Python.
    return await venvManager.createVenv(venvPath, pythonPath);
  } catch (error) {
    throw error;
  }
}

runTests();
