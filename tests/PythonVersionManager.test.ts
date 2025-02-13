import { PythonVersionManager } from "../src/index";
import { spawn } from "child_process";
import { EventEmitter } from "events";

jest.mock("child_process");

describe("PythonVersionManager", () => {
  let pythonVersionManager: PythonVersionManager;
  let mockedSpawn: jest.MockedFunction<typeof spawn>;

  beforeEach(() => {
    pythonVersionManager = new PythonVersionManager();
    mockedSpawn = spawn as jest.MockedFunction<typeof spawn>;
    mockedSpawn.mockClear(); // Clear mock calls before each test
  });

  describe("installVersion", () => {
    it("should resolve when pyenv install succeeds", async () => {
      const mockProc = new EventEmitter() as any;
      mockProc.stdout = new EventEmitter();
      mockProc.stderr = new EventEmitter();
      mockedSpawn.mockReturnValue(mockProc);

      const installPromise = pythonVersionManager.installVersion("3.9.1");

      mockProc.emit("close", 0); // Simulate successful exit

      await installPromise;

      expect(mockedSpawn).toHaveBeenCalledWith("pyenv", ["install", "3.9.1"], {
        stdio: "inherit",
        shell: true,
      });
    });

    it("should reject when pyenv install fails with non-zero exit code", async () => {
      const mockProc = new EventEmitter() as any;
      mockProc.stdout = new EventEmitter();
      mockProc.stderr = new EventEmitter();
      mockedSpawn.mockReturnValue(mockProc);

      const installPromise = pythonVersionManager.installVersion("3.9.1");

      mockProc.emit("close", 1); // Simulate failed exit

      await expect(installPromise).rejects.toThrowError(
        "pyenv install exited with code 1"
      );
      expect(mockedSpawn).toHaveBeenCalled();
    });

    it("should reject when spawn fails to start pyenv", async () => {
      mockedSpawn.mockImplementationOnce(() => {
        throw new Error("Spawn error");
      });

      await expect(
        pythonVersionManager.installVersion("3.9.1")
      ).rejects.toThrowError("Failed to start pyenv: Spawn error");
      expect(mockedSpawn).toHaveBeenCalled();
    });
  });

  describe("uninstallVersion", () => {
    it("should resolve when pyenv uninstall succeeds", async () => {
      const mockProc = new EventEmitter() as any;
      mockProc.stdout = new EventEmitter();
      mockProc.stderr = new EventEmitter();
      mockedSpawn.mockReturnValue(mockProc);

      const uninstallPromise = pythonVersionManager.uninstallVersion("3.9.1");

      mockProc.emit("close", 0); // Simulate successful exit

      await uninstallPromise;

      expect(mockedSpawn).toHaveBeenCalledWith(
        "pyenv",
        ["uninstall", "3.9.1"],
        { stdio: "inherit", shell: true }
      );
    });

    it("should reject when pyenv uninstall fails with non-zero exit code", async () => {
      const mockProc = new EventEmitter() as any;
      mockProc.stdout = new EventEmitter();
      mockProc.stderr = new EventEmitter();
      mockedSpawn.mockReturnValue(mockProc);

      const uninstallPromise = pythonVersionManager.uninstallVersion("3.9.1");

      mockProc.emit("close", 1); // Simulate failed exit

      await expect(uninstallPromise).rejects.toThrowError(
        "pyenv uninstall exited with code 1"
      );
      expect(mockedSpawn).toHaveBeenCalled();
    });

    it("should reject when spawn fails to start pyenv for uninstall", async () => {
      mockedSpawn.mockImplementationOnce(() => {
        throw new Error("Spawn error");
      });

      await expect(
        pythonVersionManager.uninstallVersion("3.9.1")
      ).rejects.toThrowError("Failed to start pyenv: Spawn error");
      expect(mockedSpawn).toHaveBeenCalled();
    });
  });

  describe("listInstalledVersions", () => {
    it("should resolve with a list of versions when pyenv versions succeeds", async () => {
      const mockProc = new EventEmitter() as any;
      mockProc.stdout = new EventEmitter();
      mockProc.stderr = new EventEmitter();
      mockedSpawn.mockReturnValue(mockProc);

      const listVersionsPromise = pythonVersionManager.listInstalledVersions();

      mockProc.stdout.emit("data", "  system\n  3.8.5\n* 3.9.1\n");
      mockProc.emit("close", 0); // Simulate successful exit

      const versions = await listVersionsPromise;

      expect(versions).toEqual(["system", "3.8.5", "* 3.9.1"]);
      expect(mockedSpawn).toHaveBeenCalledWith("pyenv", ["versions"], {
        stdio: ["inherit", "pipe", "pipe"],
        shell: true,
      });
    });

    it("should handle empty output from pyenv versions", async () => {
      const mockProc = new EventEmitter() as any;
      mockProc.stdout = new EventEmitter();
      mockProc.stderr = new EventEmitter();
      mockedSpawn.mockReturnValue(mockProc);

      const listVersionsPromise = pythonVersionManager.listInstalledVersions();

      mockProc.stdout.emit("data", "");
      mockProc.emit("close", 0); // Simulate successful exit

      const versions = await listVersionsPromise;

      expect(versions).toEqual([]);
      expect(mockedSpawn).toHaveBeenCalled();
    });

    it("should reject when pyenv versions fails with non-zero exit code", async () => {
      const mockProc = new EventEmitter() as any;
      mockProc.stdout = new EventEmitter();
      mockProc.stderr = new EventEmitter();
      mockedSpawn.mockReturnValue(mockProc);

      const listVersionsPromise = pythonVersionManager.listInstalledVersions();

      mockProc.emit("close", 1); // Simulate failed exit

      await expect(listVersionsPromise).rejects.toThrowError(
        "pyenv versions exited with code 1"
      );
      expect(mockedSpawn).toHaveBeenCalled();
    });

    it("should reject when spawn fails to start pyenv for versions", async () => {
      mockedSpawn.mockImplementationOnce(() => {
        throw new Error("Spawn error");
      });

      await expect(
        pythonVersionManager.listInstalledVersions()
      ).rejects.toThrowError("Failed to start pyenv: Spawn error");
      expect(mockedSpawn).toHaveBeenCalled();
    });
  });

  describe("setLocalVersion", () => {
    it("should resolve when pyenv local succeeds", async () => {
      const mockProc = new EventEmitter() as any;
      mockProc.stdout = new EventEmitter();
      mockProc.stderr = new EventEmitter();
      mockedSpawn.mockReturnValue(mockProc);

      const setLocalPromise = pythonVersionManager.setLocalVersion("3.9.1");

      mockProc.emit("close", 0); // Simulate successful exit

      await setLocalPromise;

      expect(mockedSpawn).toHaveBeenCalledWith("pyenv", ["local", "3.9.1"], {
        stdio: ["inherit", "pipe", "pipe"],
        shell: true,
      });
    });

    it("should reject when pyenv local fails with non-zero exit code", async () => {
      const mockProc = new EventEmitter() as any;
      mockProc.stdout = new EventEmitter();
      mockProc.stderr = new EventEmitter();
      mockedSpawn.mockReturnValue(mockProc);

      const setLocalPromise = pythonVersionManager.setLocalVersion("3.9.1");

      mockProc.emit("close", 1); // Simulate failed exit

      await expect(setLocalPromise).rejects.toThrowError(
        "pyenv local exited with code 1"
      );
      expect(mockedSpawn).toHaveBeenCalled();
    });

    it("should reject when spawn fails to start pyenv for local", async () => {
      mockedSpawn.mockImplementationOnce(() => {
        throw new Error("Spawn error");
      });

      await expect(
        pythonVersionManager.setLocalVersion("3.9.1")
      ).rejects.toThrowError("Failed to start pyenv: Spawn error");
      expect(mockedSpawn).toHaveBeenCalled();
    });
  });

  describe("getLocalVersion", () => {
    it("should resolve with the local version when pyenv local succeeds", async () => {
      const mockProc = new EventEmitter() as any;
      mockProc.stdout = new EventEmitter();
      mockProc.stderr = new EventEmitter();
      mockedSpawn.mockReturnValue(mockProc);

      const getLocalPromise = pythonVersionManager.getLocalVersion();

      mockProc.stdout.emit("data", "3.9.1\n");
      mockProc.emit("close", 0); // Simulate successful exit

      const version = await getLocalPromise;

      expect(version).toBe("3.9.1");
      expect(mockedSpawn).toHaveBeenCalledWith("pyenv", ["local"], {
        stdio: ["inherit", "pipe", "pipe"],
        shell: true,
      });
    });

    it("should handle output with whitespace", async () => {
      const mockProc = new EventEmitter() as any;
      mockProc.stdout = new EventEmitter();
      mockProc.stderr = new EventEmitter();
      mockedSpawn.mockReturnValue(mockProc);

      const getLocalPromise = pythonVersionManager.getLocalVersion();

      mockProc.stdout.emit("data", "  3.9.1  \n");
      mockProc.emit("close", 0); // Simulate successful exit

      const version = await getLocalPromise;

      expect(version).toBe("3.9.1");
      expect(mockedSpawn).toHaveBeenCalled();
    });

    it("should resolve with empty string if no local version is set", async () => {
      const mockProc = new EventEmitter() as any;
      mockProc.stdout = new EventEmitter();
      mockProc.stderr = new EventEmitter();
      mockedSpawn.mockReturnValue(mockProc);

      const getLocalPromise = pythonVersionManager.getLocalVersion();

      mockProc.stdout.emit("data", "");
      mockProc.emit("close", 0); // Simulate successful exit

      const version = await getLocalPromise;

      expect(version).toBe("");
      expect(mockedSpawn).toHaveBeenCalled();
    });

    it("should reject when pyenv local fails with non-zero exit code", async () => {
      const mockProc = new EventEmitter() as any;
      mockProc.stdout = new EventEmitter();
      mockProc.stderr = new EventEmitter();
      mockedSpawn.mockReturnValue(mockProc);

      const getLocalPromise = pythonVersionManager.getLocalVersion();

      mockProc.emit("close", 1); // Simulate failed exit

      await expect(getLocalPromise).rejects.toThrowError(
        "pyenv local command exited with code 1"
      );
      expect(mockedSpawn).toHaveBeenCalled();
    });

    it("should reject when spawn fails to start pyenv for get local", async () => {
      mockedSpawn.mockImplementationOnce(() => {
        throw new Error("Spawn error");
      });

      await expect(pythonVersionManager.getLocalVersion()).rejects.toThrowError(
        "Failed to start pyenv: Spawn error"
      );
      expect(mockedSpawn).toHaveBeenCalled();
    });
  });
});
