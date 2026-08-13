$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$python = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
$venvPython = Join-Path $root "similaridade\.venv\Scripts\python.exe"

Write-Host "LeiConsulta — subindo API (8080), similaridade (8002) e interface (5173)."

Start-Process powershell -WorkingDirectory (Join-Path $root "api") -ArgumentList @(
  "-NoExit", "-Command", "powershell -File .\run.ps1"
)

if (Test-Path $venvPython) {
  Start-Process powershell -WorkingDirectory (Join-Path $root "similaridade") -ArgumentList @(
    "-NoExit", "-Command", ".\.venv\Scripts\Activate.ps1; uvicorn main:app --port 8002 --reload"
  )
} elseif (Test-Path $python) {
  Write-Host "Crie o venv em similaridade se o Python nao subir: $python -m venv .venv"
  Start-Process powershell -WorkingDirectory (Join-Path $root "similaridade") -ArgumentList @(
    "-NoExit", "-Command", "& '$python' -m uvicorn main:app --port 8002 --reload"
  )
} else {
  Write-Host "Python 3.12 nao encontrado. Suba a pasta similaridade na mao."
}

Start-Process powershell -WorkingDirectory (Join-Path $root "frontend") -ArgumentList @(
  "-NoExit", "-Command", "npm run dev"
)

Write-Host "Abra http://localhost:5173/"
