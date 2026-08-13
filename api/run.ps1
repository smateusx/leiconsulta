$java = (Get-Command java -ErrorAction SilentlyContinue).Source
if (-not $java) {
  Write-Error "Java nao encontrado. Instale o JDK 21."
  exit 1
}
$env:JAVA_HOME = (Resolve-Path (Join-Path (Split-Path $java) "..")).Path
Set-Location $PSScriptRoot
.\mvnw.cmd spring-boot:run
