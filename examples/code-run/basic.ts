import { PythonManager } from "../../src/PythonManager";
import path from "path";

async function runTests() {
  const pythonManager = new PythonManager();
  const venvPath = "./.myenv";

  const pythonCmd = await pythonManager.ensurePythonInstalled(
    "3.10.1",
    path.resolve(__dirname, "..", ".pyenv")
  );
  console.log(`Using Python from: ${pythonCmd}`);

  try {
    await pythonManager.createVenv(venvPath);

    await pythonManager.runScript(
      `C:/Users/nijat/Desktop/samsungOverlay/src/backend/scripts/webrtc-mobile.py`,
      [
        "--model-path",
        "C:/Users/nijat/Desktop/samsungOverlay/src/backend/pytorch/best.pt",
        "--conf",
        "0.3",
      ],
      true
    );

    // await pythonManager.deleteVenv(venvPath);
    console.log("Test completed successfully.");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTests().catch((error) => {
  console.error("An error occurred:", error);
});
