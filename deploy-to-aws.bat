@echo off
setlocal enabledelayedexpansion

echo ====================================================================
echo   SWARAMAYI - ONE-CLICK DEPLOY TO AWS EC2
echo ====================================================================
echo.

set KEY_PATH="C:\Users\UNIQUE\Downloads\swaramayi-key.pem"
set EC2_HOST=ubuntu@3.110.55.241
set PROJECT_DIR=D:\github\swaramayi-real-estate-marketing

:: 1. Build CRM Frontend locally
echo [1/4] Building latest CRM Frontend dist...
cd /d %PROJECT_DIR%\frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] CRM Frontend build failed! Aborting deployment.
    pause
    exit /b %ERRORLEVEL%
)

:: 2. Build Website Frontend locally
echo.
echo [2/4] Building latest Website Frontend dist...
cd /d %PROJECT_DIR%\website-frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Website Frontend build failed! Aborting deployment.
    pause
    exit /b %ERRORLEVEL%
)

:: 3. Clean remote temporary folders and upload
echo.
echo [3/4] Uploading Frontend, Website, and Backend files to AWS EC2...
ssh -o StrictHostKeyChecking=no -i %KEY_PATH% %EC2_HOST% "rm -rf /home/ubuntu/dist /home/ubuntu/web-dist /home/ubuntu/src"

scp -o StrictHostKeyChecking=no -i %KEY_PATH% -r "%PROJECT_DIR%\frontend\dist" %EC2_HOST%:/home/ubuntu/
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Upload of CRM Frontend dist failed! Check internet or SSH key.
    pause
    exit /b %ERRORLEVEL%
)

scp -o StrictHostKeyChecking=no -i %KEY_PATH% -r "%PROJECT_DIR%\website-frontend\dist" %EC2_HOST%:/home/ubuntu/web-dist
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Upload of Website dist failed! Check internet or SSH key.
    pause
    exit /b %ERRORLEVEL%
)

scp -o StrictHostKeyChecking=no -i %KEY_PATH% -r "%PROJECT_DIR%\backend\src" %EC2_HOST%:/home/ubuntu/
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Upload of Backend src failed! Check internet or SSH key.
    pause
    exit /b %ERRORLEVEL%
)

:: 4. Apply updates on AWS server and restart services
echo.
echo [4/4] Applying updates on AWS server and restarting services...
ssh -o StrictHostKeyChecking=no -i %KEY_PATH% %EC2_HOST% "sudo cp -r /home/ubuntu/dist/* /var/www/swaramayi/frontend/dist/ && sudo mkdir -p /var/www/swaramayi/website-frontend/dist && sudo cp -r /home/ubuntu/web-dist/* /var/www/swaramayi/website-frontend/dist/ && cp -r /home/ubuntu/src/* /var/www/swaramayi/backend/src/ && cd /var/www/swaramayi/backend && npm run build && pm2 restart swaramayi-backend && sudo systemctl reload nginx && echo '--- AWS UPDATE COMPLETED SUCCESSFULLY ---' && pm2 status"

echo.
echo ====================================================================
echo   DEPLOYMENT SUCCESSFUL! All changes are LIVE on AWS.
echo ====================================================================
echo.
pause
