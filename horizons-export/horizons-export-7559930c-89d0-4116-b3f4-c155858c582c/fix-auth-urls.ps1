# Quick Authentication URL Fix Script
# This script helps you fix the Supabase authentication configuration

Write-Host "Maestro Essays - Authentication URL Fix" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if dev server is running
$devServerProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { 
    (netstat -ano | Select-String $_.Id | Select-String ":5173").Count -gt 0 
}

if ($devServerProcess) {
    Write-Host "[OK] Vite development server is running on port 5173" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Vite development server is not running" -ForegroundColor Yellow
    Write-Host "Start it with: npm run dev" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "[ERROR] Authentication Issue Detected!" -ForegroundColor Red
Write-Host "Your Supabase project is redirecting to port 3000 instead of 5173" -ForegroundColor Yellow
Write-Host ""

Write-Host "To Fix This:" -ForegroundColor Yellow
Write-Host "1. Open Supabase Dashboard" -ForegroundColor White
Write-Host "2. Update Authentication URLs" -ForegroundColor White
Write-Host "3. Test with a new verification email" -ForegroundColor White
Write-Host ""

# Ask if user wants to open the dashboard
$openDashboard = Read-Host "Open Supabase Dashboard now? (y/n)"
if ($openDashboard -eq "y" -or $openDashboard -eq "Y") {
    Write-Host "🌐 Opening Supabase Authentication Settings..." -ForegroundColor Green
    Start-Process "https://app.supabase.com/project/iojsrywtrvemxlqvvgff/auth/url-configuration"
    Start-Sleep 2
    
    Write-Host ""
    Write-Host "📝 Update these settings in the Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Site URL:" -ForegroundColor White
    Write-Host "  http://localhost:5173" -ForegroundColor Green
    Write-Host ""
    Write-Host "Redirect URLs (add all of these):" -ForegroundColor White
    Write-Host "  http://localhost:5173" -ForegroundColor Green
    Write-Host "  http://localhost:5173/**" -ForegroundColor Green
    Write-Host "  http://localhost:5173/auth/callback" -ForegroundColor Green
    Write-Host "  http://localhost:5173/auth/confirm" -ForegroundColor Green
    Write-Host "  https://maestroessays.com" -ForegroundColor Green
    Write-Host "  https://maestroessays.com/**" -ForegroundColor Green
    Write-Host ""
}

# Ask if user wants to start the dev server
if (-not $devServerProcess) {
    $startDev = Read-Host "Start development server? (y/n)"
    if ($startDev -eq "y" -or $startDev -eq "Y") {
        Write-Host "🚀 Starting development server..." -ForegroundColor Green
        Write-Host "📱 Your app will be available at: http://localhost:5173" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⚠️  After updating Supabase settings:" -ForegroundColor Yellow
        Write-Host "   1. Clear your browser cache" -ForegroundColor Gray
        Write-Host "   2. Try signing up/in again" -ForegroundColor Gray
        Write-Host "   3. Check for new verification email" -ForegroundColor Gray
        Write-Host ""
        
        # Start the dev server
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
    }
} else {
    # Open the development server in browser
    $openApp = Read-Host "Open your app in browser? (y/n)"
    if ($openApp -eq "y" -or $openApp -eq "Y") {
        Write-Host "📱 Opening http://localhost:5173..." -ForegroundColor Green
        Start-Process "http://localhost:5173"
    }
}

Write-Host ""
Write-Host "🔄 Next Steps After Updating Supabase:" -ForegroundColor Cyan
Write-Host "1. ✅ Save the authentication settings in Supabase" -ForegroundColor White
Write-Host "2. 🧹 Clear browser cache and cookies for localhost" -ForegroundColor White
Write-Host "3. 📧 Request a new verification email (old one expired)" -ForegroundColor White
Write-Host "4. ✉️  Check your email for the new verification link" -ForegroundColor White
Write-Host "5. 🎯 The new link should redirect to port 5173" -ForegroundColor White
Write-Host ""

Write-Host "💡 Pro Tip:" -ForegroundColor Yellow
Write-Host "   Email verification links expire in ~1 hour" -ForegroundColor Gray
Write-Host "   Always request a fresh one after changing settings" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Ready! Follow the steps above and your auth should work." -ForegroundColor Green