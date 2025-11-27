@echo off
echo ========================================
echo Updating shared settings...
echo.

set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..

:: Create destination directories if they don't exist
if not exist "%PROJECT_ROOT%\FRONTEND\src\shared" mkdir "%PROJECT_ROOT%\FRONTEND\src\shared"
if not exist "%PROJECT_ROOT%\BACKEND\api\shared" mkdir "%PROJECT_ROOT%\BACKEND\api\shared"

:: Copy to FRONTEND
echo Copying to FRONTEND\src\shared\
copy /Y "%SCRIPT_DIR%sizeLimits.json" "%PROJECT_ROOT%\FRONTEND\src\shared\sizeLimits.json" >nul
if %errorlevel%==0 (echo    [OK] sizeLimits.json) else (echo    [FAIL] sizeLimits.json)
copy /Y "%SCRIPT_DIR%teamRoles.json" "%PROJECT_ROOT%\FRONTEND\src\shared\teamRoles.json" >nul
if %errorlevel%==0 (echo    [OK] teamRoles.json) else (echo    [FAIL] teamRoles.json)

echo.

:: Copy to BACKEND
echo Copying to BACKEND\api\shared\
copy /Y "%SCRIPT_DIR%sizeLimits.json" "%PROJECT_ROOT%\BACKEND\api\shared\sizeLimits.json" >nul
if %errorlevel%==0 (echo    [OK] sizeLimits.json) else (echo    [FAIL] sizeLimits.json)
copy /Y "%SCRIPT_DIR%teamRoles.json" "%PROJECT_ROOT%\BACKEND\api\shared\teamRoles.json" >nul
if %errorlevel%==0 (echo    [OK] teamRoles.json) else (echo    [FAIL] teamRoles.json)

echo.
echo Update complete!
echo ========================================
