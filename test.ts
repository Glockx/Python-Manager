import { PythonInstaller } from "./src/pythonInstaller";
import { VirtualEnvManager } from "./src/venvManager";
import { PipManager } from "./src/pipManager";
import { PythonExecutor } from "./src/pythonExecutor";
import { PythonVersionManager } from "./src/pythonVersionManager";

async function runTests() {
  // Ensure Python is installed (this will use pyenv-win on Windows).
  const installer = new PythonInstaller();

  const pythonCmd = await installer.ensurePythonInstalled("3.10.1");
  console.log(`Using Python from: ${pythonCmd}`);
  // Create a virtual environment using the installed Python.
  const venvManager = new VirtualEnvManager();
  const pipManager = new PipManager();
  const executor = new PythonExecutor();
  const pythonVersionManager = new PythonVersionManager();

  try {
    const venvPath = "./.myenv";
    const venvPythonPath = await venvManager.createVenv(venvPath, pythonCmd);

    await pipManager.installMultiple(
      ["numpy", "pandas", "matplotlib"],
      venvPythonPath
    );

    executor.runCode(
      "import numpy as np\nprint(np.__version__)",
      venvPythonPath
    );

    pipManager.install("pytest", venvPythonPath);

    // Cleanup: uninstall the package and delete the virtual environment.
    // await venvManager.deleteVenv(venvPath);
    console.log("Test completed successfully.");
  } catch (err) {
    console.error("Error during tests:", err);
  }
}

runTests();
