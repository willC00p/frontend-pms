Write-Host "Starting PMS Frontend and Backend servers..." -ForegroundColor Green

# Start Laravel Backend
$backendPath = ".\Capstone-PMS-backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; php artisan serve"

# Start React Frontend
$frontendPath = ".\frontend-PMS"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm start"

Write-Host "`nServers are starting up..." -ForegroundColor Yellow
Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C in the respective windows to stop the servers." -ForegroundColor Yellow
