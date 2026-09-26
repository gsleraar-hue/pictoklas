@echo off
rem Builds store\pictoclass-<version>.zip for the Chrome Web Store (extension files only).
cd /d "%~dp0"
for /f "tokens=2 delims=:, " %%v in ('findstr /c:"\"version\"" manifest.json') do set VER=%%~v
if not exist store mkdir store
del /q "store\pictoclass-%VER%.zip" 2>nul
"%SystemRoot%\System32\tar.exe" -a -c -f "store\pictoclass-%VER%.zip" manifest.json background.js auto.js picto.js overlay.js popup.html popup.js options.html options.js bord.html bord.js offscreen.html offscreen.js voices.js ui.css icons\icon16.png icons\icon48.png icons\icon128.png _locales\en\messages.json _locales\nl\messages.json
if errorlevel 1 (echo Building the zip failed. & pause & exit /b 1)
echo Done: store\pictoclass-%VER%.zip
if "%1"=="" pause
