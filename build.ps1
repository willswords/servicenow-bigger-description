# Packages the extension as a zip for the Chrome Web Store, Edge Add-ons or
# Firefox Add-ons, named with the version from manifest.json.
# Builds the zip by hand because Compress-Archive in Windows PowerShell writes
# backslashes into paths, which Firefox Add-ons rejects.
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem

$root = $PSScriptRoot
$version = (Get-Content (Join-Path $root 'manifest.json') -Raw | ConvertFrom-Json).version
$dist = Join-Path $root 'dist'
$zipPath = Join-Path $dist "servicenow-bigger-description-$version.zip"

New-Item -ItemType Directory -Force $dist | Out-Null
if (Test-Path $zipPath) { Remove-Item $zipPath }

$files = @('manifest.json', 'content.js', 'bridge.js', 'defaults.js', 'options.html', 'options.js') +
    (Get-ChildItem (Join-Path $root 'icons') -File | ForEach-Object { "icons/$($_.Name)" })

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
try {
    foreach ($file in $files) {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, (Join-Path $root $file), $file) | Out-Null
    }
} finally {
    $zip.Dispose()
}
Write-Output "Built $zipPath"
