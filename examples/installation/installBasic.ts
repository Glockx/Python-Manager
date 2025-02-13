import { PythonInstaller } from "../../src/pythonInstaller";

async function runTests() {
  // Ensure Python is installed (this will use pyenv-win on Windows).
  const installer = new PythonInstaller();

  try {
    // Make Sure Pyenv and Python are installed.
    const pythonCmd = await installer.ensurePythonInstalled("3.10.1");

    console.log(`Using Python from: ${pythonCmd}`);
  } catch (error) {
    console.error("Failed to install Python:", error);
  }
}

runTests();
