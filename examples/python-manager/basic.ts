import { PythonManager } from "../../src/PythonManager";

async function runTests() {
  const pythonManager = new PythonManager();

  const pythonCmd = await pythonManager.ensurePythonInstalled("3.10.1");
  console.log(`Using Python from: ${pythonCmd}`);
  // Create a virtual environment using the installed Python.

  try {
    const venvPath = "./.myenv";
    await pythonManager.createVenv(venvPath);

    // No need to pass venvPythonPath anymore, it's used by default for subsequent operations

    const result = await pythonManager.runCode(
      "import numpy as np\nprint(np.__version__)"
    );

    console.log(result);

    // Cleanup: uninstall the package and delete the virtual environment.
    // await pythonManager.deleteVenv(venvPath);
    console.log("Test completed successfully.");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTests().catch((error) => {
  console.error("An error occurred:", error);
});
