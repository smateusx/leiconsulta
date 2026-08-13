$jdk = "C:\Program Files\Java\jdk-21"
if (Test-Path "$jdk\bin\java.exe") {
  $env:JAVA_HOME = $jdk
} else {
  $javaHome = (& java -XshowSettings:properties -version 2>&1 | Select-String "java.home").ToString()
  $env:JAVA_HOME = ($javaHome -split "=", 2)[1].Trim()
}
if (-not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
  Write-Error "Java nao encontrado. Instale o JDK 21."
  exit 1
}
Write-Host "JAVA_HOME=$env:JAVA_HOME"
Set-Location $PSScriptRoot
.\mvnw.cmd spring-boot:run
