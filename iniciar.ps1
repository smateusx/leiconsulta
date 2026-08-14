$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$python = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
$venvPython = Join-Path $root "similaridade\.venv\Scripts\python.exe"

Write-Host "LeiConsulta — ligando o gabinete (não feche as janelas pretas)."

function Test-Port([int]$port) {
  try {
    $c = New-Object System.Net.Sockets.TcpClient
    $c.Connect("127.0.0.1", $port)
    $c.Close()
    return $true
  } catch {
    return $false
  }
}

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
  Write-Host "Python 3.12 nao encontrado. A consulta ainda funciona, com comparacao mais simples."
}

Start-Process powershell -WorkingDirectory (Join-Path $root "frontend") -ArgumentList @(
  "-NoExit", "-Command", "npm run dev"
)

Write-Host "Esperando a interface (até 90 segundos)..."
$ok = $false
for ($i = 0; $i -lt 45; $i++) {
  Start-Sleep -Seconds 2
  if ((Test-Port 8080) -and (Test-Port 5173)) {
    $ok = $true
    break
  }
}

if ($ok) {
  Start-Process "http://localhost:5173/"
  Write-Host "Aberto http://localhost:5173/ — senha inicial: Cachoeira2026 (troque em api/src/main/resources/application.properties)."
} else {
  Write-Host "Ainda nao subiu. Abra http://localhost:5173/ quando as janelas terminarem de carregar."
}
