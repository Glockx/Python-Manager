import { PythonInstaller } from "../../src/pythonInstaller";
import { PythonVersionManager } from "../../src/pythonVersionManager";
import { VirtualEnvManager } from "../../src/venvManager";
import path from "path";

// Environment Manager Instance
const venvManager = new VirtualEnvManager();
const versionManager = new PythonVersionManager();
const installer = new PythonInstaller();

// Set Path Of Python Envinonment Path
const venvPath = path.join(__dirname, ".myenv");

async function runTests() {
  try {
    // Get The local Python version installed.
    const pythonVersion = await versionManager.getLocalVersion();
    const pythonCmd = await installer.getPythonPathFromPyenv(pythonVersion);
    console.log(`Python Path: ${pythonCmd}`);

    // 1. Create a Python virtual environment using the installed Python.
    await createEnv(pythonCmd);

    // 2. Check If Given Virtual Environment Exists.
    const envExists = await venvManager.isEnvExsits(venvPath);
    console.log(`Virtual Environment Exists: ${envExists}`);

    // 3. Delete the Python virtual environment.
    await deleteEnv(venvPath);
  } catch (err) {
    console.error("Error during tests:", err);
  }
}

async function createEnv(pythonPath: string) {
  try {
    // Create a virtual environment using the installed Python.
    return await venvManager.createVenv(venvPath, pythonPath);
  } catch (error) {
    throw error;
  }
}

async function deleteEnv(venvPath: string) {
  try {
    // Delete the Python virtual environment.
    await venvManager.deleteVenv(venvPath);
  } catch (error) {
    throw error;
  }
}

runTests();
