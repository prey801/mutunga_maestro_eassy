# Simple Authentication URL Fix Script
Write-Host "Maestro Essays - Authentication URL Fix" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if dev server is running
$devServerRunning = $false
try {
    $processes = netstat -ano | Select-String ":5173"
    if ($processes.Count -gt 0) {
        $devServerRunning = $true
        Write-Host "[OK] Vite development server is running on port 5173" -ForegroundColor Green
    }
} catch {
    Write-Host "[WARNING] Could not check if dev server is running" -ForegroundColor Yellow
}

if (-not $devServerRunning) {
    Write-Host "[INFO] Vite development server is not running" -ForegroundColor Yellow
    Write-Host "Start it with: npm run dev" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "[ISSUE] Authentication Problem Detected!" -ForegroundColor Red
Write-Host "Your Supabase project is redirecting to port 3000 instead of 5173" -ForegroundColor Yellow
Write-Host ""

Write-Host "SOLUTION STEPS:" -ForegroundColor Yellow
Write-Host "1. Open Supabase Dashboard" -ForegroundColor White
Write-Host "2. Update Authentication URLs" -ForegroundColor White  
Write-Host "3. Test with a new verification email" -ForegroundColor White
Write-Host ""

# Ask user what to do
Write-Host "What would you like to do?" -ForegroundColor Cyan
Write-Host "1. Open Supabase Dashboard to fix URLs" -ForegroundColor White
Write-Host "2. Start development server (if not running)" -ForegroundColor White
Write-Host "3. Open your app in browser" -ForegroundColor White
Write-Host "4. Show me the exact URLs to configure" -ForegroundColor White
Write-Host "5. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "[ACTION] Opening Supabase Authentication Settings..." -ForegroundColor Green
        Start-Process "https://app.supabase.com/project/pcexiuwtmhqdpyhaxfwm/auth/url-configuration"
        Write-Host ""
        Write-Host "UPDATE THESE SETTINGS:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Site URL:" -ForegroundColor White
        Write-Host "  http://localhost:5173" -ForegroundColor Green
        Write-Host ""
        Write-Host "Redirect URLs (add all):" -ForegroundColor White
        Write-Host "  http://localhost:5173" -ForegroundColor Green
        Write-Host "  http://localhost:5173/**" -ForegroundColor Green
        Write-Host "  http://localhost:5173/auth/callback" -ForegroundColor Green
        Write-Host "  http://localhost:5173/auth/confirm" -ForegroundColor Green
        Write-Host "  https://maestroessays.com" -ForegroundColor Green
        Write-Host "  https://maestroessays.com/**" -ForegroundColor Green
    }
    "2" {
        if (-not $devServerRunning) {
            Write-Host "[ACTION] Starting development server..." -ForegroundColor Green
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
        } else {
            Write-Host "[INFO] Development server is already running" -ForegroundColor Green
        }
    }
    "3" {
        Write-Host "[ACTION] Opening app in browser..." -ForegroundColor Green
        Start-Process "http://localhost:5173"
    }
    "4" {
        Write-Host ""
        Write-Host "COPY THESE EXACT URLs INTO SUPABASE:" -ForegroundColor Yellow
        Write-Host "====================================" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Site URL:" -ForegroundColor White
        Write-Host "http://localhost:5173" -ForegroundColor Green
        Write-Host ""
        Write-Host "Redirect URLs (one per line):" -ForegroundColor White
        Write-Host "http://localhost:5173" -ForegroundColor Green
        Write-Host "http://localhost:5173/**" -ForegroundColor Green
        Write-Host "http://localhost:5173/auth/callback" -ForegroundColor Green
        Write-Host "http://localhost:5173/auth/confirm" -ForegroundColor Green
        Write-Host "https://maestroessays.com" -ForegroundColor Green
        Write-Host "https://maestroessays.com/**" -ForegroundColor Green
        Write-Host ""
        
        $openDashboard = Read-Host "Open Supabase dashboard now? (y/n)"
        if ($openDashboard -eq "y" -or $openDashboard -eq "Y") {
            Start-Process "https://app.supabase.com/project/pcexiuwtmhqdpyhaxfwm/auth/url-configuration"
        }
    }
    default {
        Write-Host "[INFO] Exiting..." -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "IMPORTANT NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Save the authentication settings in Supabase" -ForegroundColor White
Write-Host "2. Clear browser cache and cookies for localhost" -ForegroundColor White
Write-Host "3. Request a NEW verification email (old one expired)" -ForegroundColor White
Write-Host "4. Check your email for the new verification link" -ForegroundColor White
Write-Host "5. The new link should redirect to port 5173" -ForegroundColor White
Write-Host ""
Write-Host "NOTE: Email verification links expire in about 1 hour" -ForegroundColor Yellow
Write-Host "Always request a fresh one after changing settings!" -ForegroundColor Yellow