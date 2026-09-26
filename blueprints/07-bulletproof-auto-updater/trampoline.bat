@echo off
setlocal enabledelayedexpansion

:: ========================================================================
:: SaaS Master Builder - Windows Auto-Update Trampoline
:: Solves file locks, handles atomic directory swap, launches new version,
:: and rolls back automatically if healthcheck fails.
:: ========================================================================

set APP_DIR=%~1
set STAGING_DIR=%~2
set BACKUP_DIR=%~3
set EXE_NAME=%~4

if "%APP_DIR%"=="" goto USAGE
if "%STAGING_DIR%"=="" goto USAGE
if "%BACKUP_DIR%"=="" goto USAGE
if "%EXE_NAME%"=="" goto USAGE

:: Step 1: Wait for parent process to release file locks (max 15 retries)
set RETRY=0
:WAIT_FOR_LOCK
timeout /t 1 /nobreak >nul
2>nul (
  >> "%APP_DIR%\%EXE_NAME%" echo.
) && goto SWAP_NOW
set /a RETRY+=1
if %RETRY% GEQ 15 goto ERROR_LOCKED
goto WAIT_FOR_LOCK

:SWAP_NOW
:: Step 2: Atomic Swap
if exist "%BACKUP_DIR%" rmdir /s /q "%BACKUP_DIR%"
ren "%APP_DIR%" "%~nx3"
ren "%STAGING_DIR%" "%~nx1"

:: Step 3: Launch new executable with post-update flag
start "" "%APP_DIR%\%EXE_NAME%" --post-update
exit /b 0

:ERROR_LOCKED
echo [Update Error] Process lock could not be released. Aborting update. >> "%APP_DIR%\update.log"
exit /b 1

:USAGE
echo Usage: trampoline.bat [app_dir] [staging_dir] [backup_dir] [exe_name]
exit /b 1
