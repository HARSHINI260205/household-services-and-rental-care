@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-25"
set "PATH=%JAVA_HOME%\bin;C:\Users\Pavithra R\.gemini\antigravity\scratch\tools\maven\bin;%PATH%"
cd /d "%~dp0backend"
call "%~dp0tools\maven\bin\mvn.cmd" %*
