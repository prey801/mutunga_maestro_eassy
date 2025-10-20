# Order Placement Issue Diagnosis and Fix Script

Write-Host "Order Placement Issue Diagnosis" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Project directory found" -ForegroundColor Green

# Check if dev server is running
$devServerRunning = $false
try {
    $processes = netstat -ano | Select-String ":5173"
    if ($processes.Count -gt 0) {
        $devServerRunning = $true
        Write-Host "[OK] Development server is running on port 5173" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Development server is not running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARNING] Could not check if dev server is running" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "COMMON ORDER PLACEMENT ISSUES:" -ForegroundColor Yellow
Write-Host "1. Database schema mismatch (most likely issue)" -ForegroundColor White
Write-Host "2. Missing storage bucket for file uploads" -ForegroundColor White
Write-Host "3. Authentication context not properly connected" -ForegroundColor White
Write-Host "4. PayPal configuration issues" -ForegroundColor White
Write-Host ""

Write-Host "FIXES APPLIED:" -ForegroundColor Green
Write-Host "[x] Updated OrderPage to use new enhanced schema" -ForegroundColor White
Write-Host "[x] Fixed database field mapping (title, description, paper_category)" -ForegroundColor White
Write-Host "[x] Updated file upload to use order_attachments table" -ForegroundColor White
Write-Host "[x] Added payment transaction recording" -ForegroundColor White
Write-Host "[x] Changed to use EnhancedAuthContext" -ForegroundColor White
Write-Host ""

Write-Host "NEXT STEPS TO COMPLETE THE FIX:" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. DEPLOY THE DATABASE SCHEMA" -ForegroundColor Yellow
Write-Host "   - Open: https://app.supabase.com/project/pcexiuwtmhqdpyhaxfwm" -ForegroundColor Gray
Write-Host "   - Go to SQL Editor" -ForegroundColor Gray
Write-Host "   - Run the contents of: database/enhanced_schema_v2.sql" -ForegroundColor Gray

Write-Host ""
Write-Host "2. CREATE STORAGE BUCKET" -ForegroundColor Yellow  
Write-Host "   - Go to Storage in Supabase Dashboard" -ForegroundColor Gray
Write-Host "   - Create new bucket named: order_attachments" -ForegroundColor Gray
Write-Host "   - Set it as public bucket" -ForegroundColor Gray

Write-Host ""
Write-Host "3. RESTART YOUR DEV SERVER" -ForegroundColor Yellow
if ($devServerRunning) {
    Write-Host "   - Stop current server (Ctrl+C in the terminal)" -ForegroundColor Gray
    Write-Host "   - Run: npm run dev" -ForegroundColor Gray
} else {
    Write-Host "   - Run: npm run dev" -ForegroundColor Gray
}

Write-Host ""
Write-Host "4. TEST THE ORDER PLACEMENT" -ForegroundColor Yellow
Write-Host "   - Go to: http://localhost:5173/order" -ForegroundColor Gray
Write-Host "   - Fill out the form completely" -ForegroundColor Gray
Write-Host "   - Check browser console for any errors" -ForegroundColor Gray

Write-Host ""

# Ask user what they want to do
Write-Host "What would you like to do now?" -ForegroundColor Cyan
Write-Host "1. Open Supabase SQL Editor to run the schema" -ForegroundColor White
Write-Host "2. Open Supabase Storage to create bucket" -ForegroundColor White  
Write-Host "3. Build and restart development server" -ForegroundColor White
Write-Host "4. Open the order page for testing" -ForegroundColor White
Write-Host "5. Show me the exact SQL to run" -ForegroundColor White
Write-Host "6. All of the above (recommended)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-6)"

switch ($choice) {
    "1" {
        Write-Host "[ACTION] Opening Supabase SQL Editor..." -ForegroundColor Green
        Start-Process "https://app.supabase.com/project/pcexiuwtmhqdpyhaxfwm/sql/new"
        Write-Host "Copy and run the contents of: database/enhanced_schema_v2.sql" -ForegroundColor Yellow
    }
    "2" {
        Write-Host "[ACTION] Opening Supabase Storage..." -ForegroundColor Green
        Start-Process "https://app.supabase.com/project/pcexiuwtmhqdpyhaxfwm/storage/buckets"
        Write-Host "Create a new bucket named 'order_attachments'" -ForegroundColor Yellow
    }
    "3" {
        Write-Host "[ACTION] Building and restarting server..." -ForegroundColor Green
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Build successful! Starting dev server..." -ForegroundColor Green
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
        } else {
            Write-Host "Build failed! Check the errors above." -ForegroundColor Red
        }
    }
    "4" {
        if ($devServerRunning) {
            Write-Host "[ACTION] Opening order page..." -ForegroundColor Green
            Start-Process "http://localhost:5173/order"
        } else {
            Write-Host "[ERROR] Development server is not running" -ForegroundColor Red
            Write-Host "Start it first with: npm run dev" -ForegroundColor Yellow
        }
    }
    "5" {
        Write-Host ""
        Write-Host "COPY THIS SQL AND RUN IT IN SUPABASE SQL EDITOR:" -ForegroundColor Yellow
        Write-Host "================================================" -ForegroundColor Yellow
        
        if (Test-Path "database/enhanced_schema_v2.sql") {
            Write-Host "SQL file found. Opening it..." -ForegroundColor Green
            notepad "database/enhanced_schema_v2.sql"
        } else {
            Write-Host "SQL file not found at database/enhanced_schema_v2.sql" -ForegroundColor Red
        }
    }
    "6" {
        Write-Host "[ACTION] Opening all necessary resources..." -ForegroundColor Green
        
        # Open Supabase SQL Editor
        Start-Process "https://app.supabase.com/project/pcexiuwtmhqdpyhaxfwm/sql/new"
        Start-Sleep 2
        
        # Open Supabase Storage
        Start-Process "https://app.supabase.com/project/pcexiuwtmhqdpyhaxfwm/storage/buckets"
        Start-Sleep 2
        
        # Build the project
        Write-Host "Building project..." -ForegroundColor Yellow
        npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Build successful!" -ForegroundColor Green
            
            # Start dev server if not running
            if (-not $devServerRunning) {
                Write-Host "Starting development server..." -ForegroundColor Yellow
                Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
                Start-Sleep 5
            }
            
            # Open the order page
            Start-Process "http://localhost:5173/order"
            
        } else {
            Write-Host "Build failed! Fix the errors first." -ForegroundColor Red
        }
    }
    default {
        Write-Host "[INFO] No action taken." -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "TROUBLESHOOTING TIPS:" -ForegroundColor Cyan
Write-Host "- If you get database errors, make sure you've run the SQL schema" -ForegroundColor Gray
Write-Host "- If file uploads fail, create the order_attachments storage bucket" -ForegroundColor Gray  
Write-Host "- Check browser console (F12) for JavaScript errors" -ForegroundColor Gray
Write-Host "- Make sure you're logged in before testing order placement" -ForegroundColor Gray
Write-Host ""
Write-Host "Good luck! The order placement should work after these fixes." -ForegroundColor Green