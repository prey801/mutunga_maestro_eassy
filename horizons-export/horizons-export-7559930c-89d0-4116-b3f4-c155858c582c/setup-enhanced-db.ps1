# Enhanced Maestro Essays - Database Setup Script
# This script helps you deploy the enhanced database schema

Write-Host "🎯 Enhanced Maestro Essays - Database Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project directory found" -ForegroundColor Green

# Check environment variables
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found!" -ForegroundColor Red
    Write-Host "📝 Please create .env.local with your Supabase credentials" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment file found" -ForegroundColor Green

# Read and validate environment variables
$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "VITE_SUPABASE_URL=([^\r\n]+)") {
    $supabaseUrl = $matches[1]
    Write-Host "✅ Supabase URL configured: $($supabaseUrl.Substring(0, 30))..." -ForegroundColor Green
} else {
    Write-Host "❌ Error: VITE_SUPABASE_URL not found in .env.local" -ForegroundColor Red
    exit 1
}

if ($envContent -match "VITE_SUPABASE_ANON_KEY=([^\r\n]+)") {
    Write-Host "✅ Supabase Anon Key configured" -ForegroundColor Green
} else {
    Write-Host "❌ Error: VITE_SUPABASE_ANON_KEY not found in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. 🗄️  Deploy Database Schema" -ForegroundColor White
Write-Host "   - Open: https://app.supabase.com" -ForegroundColor Gray
Write-Host "   - Go to SQL Editor" -ForegroundColor Gray
Write-Host "   - Run: database/enhanced_schema_v2.sql" -ForegroundColor Gray
Write-Host ""

Write-Host "2. 🔄 Run Migration (if upgrading)" -ForegroundColor White
Write-Host "   - Run: database/migration_utility.sql" -ForegroundColor Gray
Write-Host ""

Write-Host "3. 🧪 Install Dependencies & Test" -ForegroundColor White

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "4. 🚀 Build & Test Application" -ForegroundColor White

# Test build
Write-Host "🔨 Testing build process..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Build failed!" -ForegroundColor Red
    Write-Host "💡 Common issues:" -ForegroundColor Yellow
    Write-Host "   - Check your .env.local file format" -ForegroundColor Gray
    Write-Host "   - Ensure all dependencies are installed" -ForegroundColor Gray
    Write-Host "   - Check for TypeScript errors" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "================" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Important Files Created/Updated:" -ForegroundColor Cyan
Write-Host "   ✓ .env.local - Environment variables" -ForegroundColor Green
Write-Host "   ✓ database/enhanced_schema_v2.sql - Database schema" -ForegroundColor Green
Write-Host "   ✓ database/migration_utility.sql - Migration helper" -ForegroundColor Green
Write-Host "   ✓ src/lib/profileUtils.ts - Profile utilities" -ForegroundColor Green
Write-Host "   ✓ src/contexts/EnhancedAuthContext.jsx - Enhanced auth" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Ready to Deploy!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "Choose your deployment method:" -ForegroundColor Yellow
Write-Host ""

Write-Host "Option 1: Vercel (Recommended)" -ForegroundColor White
Write-Host "   npm install -g vercel" -ForegroundColor Gray
Write-Host "   vercel --prod" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 2: Netlify" -ForegroundColor White
Write-Host "   npm install -g netlify-cli" -ForegroundColor Gray
Write-Host "   netlify deploy --prod --dir=dist" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 3: Test Locally First" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "   Open: http://localhost:5173" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Full deployment guide: DEPLOYMENT_UPDATED.md" -ForegroundColor Gray
Write-Host "   - Database schema details: database/enhanced_schema_v2.sql" -ForegroundColor Gray
Write-Host ""

# Ask user what they want to do next
Write-Host "What would you like to do next?" -ForegroundColor Yellow
Write-Host "1. Start local development server (npm run dev)" -ForegroundColor White
Write-Host "2. Deploy to Vercel" -ForegroundColor White
Write-Host "3. Deploy to Netlify" -ForegroundColor White
Write-Host "4. Exit and deploy manually" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "🚀 Starting development server..." -ForegroundColor Green
        Write-Host "📱 Your app will open at: http://localhost:5173" -ForegroundColor Cyan
        Write-Host "⚠️  Make sure you've run the database schema first!" -ForegroundColor Yellow
        Write-Host ""
        npm run dev
    }
    "2" {
        Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
        # Check if Vercel CLI is installed
        $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
        if (-not $vercelInstalled) {
            Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
            npm install -g vercel
        }
        Write-Host "⚠️  Make sure to set environment variables in Vercel dashboard!" -ForegroundColor Yellow
        vercel --prod
    }
    "3" {
        Write-Host "🚀 Deploying to Netlify..." -ForegroundColor Green
        # Check if Netlify CLI is installed
        $netlifyInstalled = Get-Command netlify -ErrorAction SilentlyContinue
        if (-not $netlifyInstalled) {
            Write-Host "📦 Installing Netlify CLI..." -ForegroundColor Yellow
            npm install -g netlify-cli
        }
        Write-Host "⚠️  Make sure to set environment variables in Netlify dashboard!" -ForegroundColor Yellow
        netlify deploy --prod --dir=dist
    }
    default {
        Write-Host "✅ Setup complete! You can now deploy manually." -ForegroundColor Green
        Write-Host "📖 Check DEPLOYMENT_UPDATED.md for detailed instructions." -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "🎯 Don't forget:" -ForegroundColor Yellow
Write-Host "   1. Deploy the database schema to Supabase" -ForegroundColor Gray
Write-Host "   2. Set up the storage bucket for file uploads" -ForegroundColor Gray
Write-Host "   3. Configure environment variables on your hosting platform" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Good luck with your enhanced Maestro Essays deployment!" -ForegroundColor Green