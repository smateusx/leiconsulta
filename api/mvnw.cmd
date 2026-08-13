@echo off
setlocal
if "%HOME%"=="" set "HOME=%HOMEDRIVE%%HOMEPATH%"
if "%JAVA_HOME%"=="" (
  for /f "delims=" %%j in ('where java 2^>nul') do (
    set "JAVA_BIN=%%j"
    goto foundjava
  )
)
goto hasjava
:foundjava
for %%i in ("%JAVA_BIN%") do set "JAVA_HOME=%%~dpi.."
:hasjava
if "%JAVA_HOME%"=="" (
  echo JAVA_HOME nao encontrado. Instale o JDK 21.
  exit /b 1
)

set MAVEN_PROJECTBASEDIR=%~dp0
set WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar
set DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar

if not exist "%WRAPPER_JAR%" (
  echo Baixando Maven Wrapper...
  powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%WRAPPER_JAR%'"
)

"%JAVA_HOME%\bin\java.exe" -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*
exit /b %ERRORLEVEL%
