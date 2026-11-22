# Runs Pocket Sanmarkkam from a local folder, so the helper files (node_modules)
# never go on Google Drive. The Drive folder stays the one place where the app
# is edited; this script copies it to the run folder, then starts the app.
#
#   .\scripts\run-local.ps1           # start the app at http://localhost:3001
#   .\scripts\run-local.ps1 build     # production build check (must pass cleanly)
#   .\scripts\run-local.ps1 start     # build, then run the production app (service worker on)
#
# To refresh the book data first:  py scripts\export_books.py   (in the Drive folder)
param([string]$Mode = "dev")

$ErrorActionPreference = "Stop"
$src = Split-Path -Parent $PSScriptRoot
$run = Join-Path $env:USERPROFILE "Dev\pocket-sanmarkkam-run"

# One-way mirror Drive -> run folder. node_modules, build output and git
# history stay where they are. /MIR deletes files removed on the Drive side.
robocopy $src $run /MIR /XD node_modules .next .git /XF tsconfig.tsbuildinfo .env.local /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Copy to $run failed (robocopy code $LASTEXITCODE)" }

Set-Location $run
$stamp = Join-Path $run "node_modules\.lock-copy"
$lock = Join-Path $run "package-lock.json"
$hash = if (Test-Path $lock) { (Get-FileHash $lock).Hash } else { "none" }
if (-not (Test-Path $stamp) -or ($hash -ne (Get-Content $stamp -ErrorAction SilentlyContinue))) {
  npm install
  # keep the lock file on Drive so every computer installs the same versions
  if (Test-Path $lock) {
    Copy-Item $lock (Join-Path $src "package-lock.json") -Force
    (Get-FileHash $lock).Hash | Set-Content $stamp
  }
}

switch ($Mode) {
  "dev"   { npm run dev }
  "build" { npm run build }
  "start" { npm run build; if ($LASTEXITCODE -eq 0) { npm run start } }
  default { throw "Unknown mode '$Mode' (use dev, build or start)" }
}
