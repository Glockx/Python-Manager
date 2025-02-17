# 🐍 Python Manager

A comprehensive TypeScript library for managing Python environments, installations, and package dependencies. This library provides a unified interface for handling Python version management, virtual environments, package installation, and script execution.

## Features

- 🐍 Python Version Management

  - Install and manage multiple Python versions
  - Set local Python versions using pyenv
  - List installed Python versions
  - Automatic installation of pyenv (Windows/Linux/macOS)

- 🔧 Python Installation

  - Automatic Python installation via pyenv
  - Cross-platform support (Windows/Linux/macOS)
  - Automatic pyenv installation
  - Python executable path management

- 🌐 Virtual Environment Management

  - Create and delete virtual environments
  - Check virtual environment existence
  - Manage isolated Python environments

- 📦 Package Management

  - Install/uninstall Python packages using pip
  - Install packages from requirements.txt
  - List installed packages
  - Multi-package installation support

- ⚡ Python Execution
  - Run Python scripts with live output streaming
  - Execute Python code snippets
  - Capture stdout/stderr and exit codes
  - Support for script arguments

## Installation

```bash
npm install python-manager
# or
yarn add python-manager
# or
bun add python-manager
```

## Usage

### Python Installation and Management

```typescript
import { PythonInstaller } from "python-manager";

const installer = new PythonInstaller();

// Ensure Python is installed (installs if not found)
const pythonPath = await installer.ensurePythonInstalled("3.9.1");

// The installer will automatically:
// - Install pyenv/pyenv-win if needed
// - Install the specified Python version
// - Configure the local Python version
// - Return the path to the Python executable
```

### Python Version Management

```typescript
import { PythonVersionManager } from "python-manager";

const versionManager = new PythonVersionManager();

// Install Python version
await versionManager.installVersion("3.9.1");

// Set local version
await versionManager.setLocalVersion("3.9.1");

// List installed versions
const versions = await versionManager.listInstalledVersions();
```

### Virtual Environment Management

```typescript
import { VirtualEnvManager } from "python-manager";

const venvManager = new VirtualEnvManager();

// Create virtual environment
await venvManager.createVenv("./my-venv");

// Check if venv exists
const exists = await venvManager.existsVenv("./my-venv");

// Delete virtual environment
await venvManager.deleteVenv("./my-venv");
```

### Package Management

```typescript
import { PipManager } from "python-manager";

const pipManager = new PipManager();

// Install a single package
await pipManager.install("requests");

// Install multiple packages
await pipManager.installMultiple(["numpy", "pandas", "matplotlib"]);

// Install from requirements.txt
await pipManager.installRequirementsFile("./requirements.txt");

// List installed packages
const packages = await pipManager.listInstalledPackages();
```

### Python Execution

```typescript
import { PythonExecutor } from "python-manager";

const executor = new PythonExecutor();

// Run a Python script
const result = await executor.runScript(
  "./script.py",
  ["--arg1", "value1"],
  "python",
  true
);

// Execute Python code
const codeResult = await executor.runCode(
  'print("Hello, World!")',
  "python",
  true
);
```

## Requirements

- Node.js 20.x or higher
- Administrative rights (for some installation operations)

## Platform Support

- Windows: Full support with pyenv-win
- Linux: Full support with pyenv (Soon)
- macOS: Full support with pyenv (Soon)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
