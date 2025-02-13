<#
    .SYNOPSIS
    Uninstalls pyenv-win.

    .DESCRIPTION
    This script uninstalls pyenv-win by removing the installation directory
    (typically located at $HOME\.pyenv) and deleting any pyenv-win related
    environment variables and PATH entries.

    .EXAMPLE
    PS> .\uninstall-pyenv-win.ps1

    .LINK
    Online version: https://pyenv-win.github.io/pyenv-win/
#>

# Define paths
$PyEnvDir    = "$env:USERPROFILE\.pyenv"
$PyEnvWinDir = "$PyEnvDir\pyenv-win"
$BinPath     = "$PyEnvWinDir\bin"
$ShimsPath   = "$PyEnvWinDir\shims"

Function Remove-PyEnvVars {
    Write-Host "Removing pyenv-win related environment variables and PATH entries..."
    
    # Get the current user's PATH as an array
    $PathParts = [System.Environment]::GetEnvironmentVariable('PATH', "User") -Split ';'
    
    # Filter out pyenv-win bin and shims paths
    $NewPathParts = $PathParts | Where-Object { ($_ -ne $BinPath) -and ($_ -ne $ShimsPath) }
    $NewPath = $NewPathParts -join ';'
    [System.Environment]::SetEnvironmentVariable('PATH', $NewPath, "User")

    # Remove pyenv-specific environment variables
    [System.Environment]::SetEnvironmentVariable('PYENV', $null, "User")
    [System.Environment]::SetEnvironmentVariable('PYENV_ROOT', $null, "User")
    [System.Environment]::SetEnvironmentVariable('PYENV_HOME', $null, "User")
}

Function Remove-PyEnv {
    Write-Host "Starting uninstallation of pyenv-win..."

    # Remove the pyenv-win installation directory if it exists
    If (Test-Path $PyEnvDir) {
        Write-Host "Removing directory: $PyEnvDir"
        Remove-Item -Path $PyEnvDir -Recurse -Force
    }
    Else {
        Write-Host "Directory $PyEnvDir does not exist. Nothing to remove."
    }

    # Clean up environment variables and PATH
    Remove-PyEnvVars

    Write-Host "pyenv-win has been successfully uninstalled."
}

# Execute the uninstallation function
Remove-PyEnv
