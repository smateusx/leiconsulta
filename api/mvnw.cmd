@echo off
setlocal EnableDelayedExpansion
if "%HOME%"=="" set "HOME=%HOMEDRIVE%%HOMEPATH%"

if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" goto hasjava

if exist "C:\Program Files\Java\jdk-21\bin\java.exe" (
  set "JAVA_HOME=C:\Program Files\Java\jdk-21"
  goto hasjava
)

for /f "tokens=2 delims==" %%a in ('java -XshowSettings:properties -version 2^>^&1 ^| findstr /c:"java.home"') do (
  set "JAVA_HOME=%%a"
)
for /f "tokens=* delims= " %%a in ("!JAVA_HOME!") do set "JAVA_HOME=%%a"

:hasjava
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo JAVA_HOME invalido: %JAVA_HOME%
  echo Instale o JDK 21 e defina JAVA_HOME.
  exit /b 1
)

set "MAVEN_PROJECTBASEDIR=%~dp0"
if "%MAVEN_PROJECTBASEDIR:~-1%"=="\" set "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"
set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar

if not exist "%WRAPPER_JAR%" (
  echo Baixando Maven Wrapper...
  powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%WRAPPER_JAR%'"
)

"%JAVA_HOME%\bin\java.exe" -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*
exit /b %ERRORLEVEL%
