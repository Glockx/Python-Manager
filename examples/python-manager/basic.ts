import { PythonManager } from "../../src/PythonManager";
import path from "path";

async function runTests() {
  const pythonManager = new PythonManager();
  const venvPath = "./.myenv";

  const pythonCmd = await pythonManager.ensurePythonInstalled(
    "3.10.1",
    path.resolve(__dirname, "..", ".pyenv"),
    undefined
  );
  console.log(`Using Python from: ${pythonCmd}`);
  // Create a virtual environment using the installed Python.

  try {
    await pythonManager.createVenv(venvPath);

    const arePackagesInstalled = await pythonManager.arePackagesInstalled([
      "numpy",
      "pandas",
      "matplotlib",
      "pytest",
      "scipy",
    ]);

    await pythonManager.installPackage("numpy");

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
