# Install the Oxocarbon fragment for Windows Terminal.
#
#   .\install.ps1              install / update
#   .\install.ps1 -Uninstall   remove the fragment
#
# Fragments are shared by Windows Terminal stable, Preview, and Canary.

[CmdletBinding()]
param(
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'

$fragmentRoot = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows Terminal\Fragments\Oxocarbon'
$fragmentFile = Join-Path $fragmentRoot 'oxocarbon.json'
$sourceFile = Join-Path $PSScriptRoot 'oxocarbon.json'

function Remove-OxocarbonFragment {
    if (Test-Path -LiteralPath $fragmentFile) {
        Remove-Item -LiteralPath $fragmentFile -Force
        Write-Host "Removed $fragmentFile"
    }
    else {
        Write-Host "Nothing to remove at $fragmentFile"
    }

    if ((Test-Path -LiteralPath $fragmentRoot) -and
        -not (Get-ChildItem -LiteralPath $fragmentRoot -Force)) {
        Remove-Item -LiteralPath $fragmentRoot -Force
        Write-Host "Removed empty folder $fragmentRoot"
    }
}

if ($Uninstall) {
    Remove-OxocarbonFragment
    Write-Host 'Restart Windows Terminal to finish uninstalling.'
    return
}

if (-not (Test-Path -LiteralPath $sourceFile)) {
    throw "oxocarbon.json not found next to this script: $sourceFile"
}

# Validate before touching the fragments folder, so a broken download can never
# leave Windows Terminal with an unreadable settings source.
try {
    Get-Content -LiteralPath $sourceFile -Raw | ConvertFrom-Json | Out-Null
}
catch {
    throw "oxocarbon.json is not valid JSON: $($_.Exception.Message)"
}

New-Item -ItemType Directory -Path $fragmentRoot -Force | Out-Null
Copy-Item -LiteralPath $sourceFile -Destination $fragmentFile -Force

Write-Host ''
Write-Host 'Installed Oxocarbon to:' -ForegroundColor Green
Write-Host "  $fragmentFile"
Write-Host ''
Write-Host 'Restart Windows Terminal, then select a scheme and a theme:'
Write-Host '  Color scheme: Settings > Profiles > Defaults > Appearance > Color scheme'
Write-Host '  Window theme: Settings > Appearance > Theme'
Write-Host ''
Write-Host 'Uninstall with: .\install.ps1 -Uninstall'
