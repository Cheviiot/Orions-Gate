# Setup script for Orion's Gate icon generation (Windows)
# Detects and installs necessary dependencies

Write-Host "🎨 Orion's Gate Icon Setup Script (Windows)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check for ImageMagick
Write-Host "Checking for dependencies..." -ForegroundColor Yellow

if (Test-CommandExists convert) {
    Write-Host "✅ ImageMagick is installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  ImageMagick (convert) not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "ImageMagick is required for icon generation." -ForegroundColor Yellow
    Write-Host "Install it from: https://imagemagick.org/script/download.php#windows" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or install via Chocolatey (if installed):" -ForegroundColor Yellow
    Write-Host "  choco install imagemagick" -ForegroundColor Cyan
    Write-Host ""
    
    $response = Read-Host "Continue without ImageMagick? (y/n)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host ""
        Write-Host "❌ Setup cancelled" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Generate icons
Write-Host "🖼️  Generating icons..." -ForegroundColor Yellow
npm run generate-icons

Write-Host ""
Write-Host "✅ Icon setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Build for Windows:"
Write-Host "      npm run make:win" -ForegroundColor Cyan
Write-Host ""
Write-Host "   2. Test the application:"
Write-Host "      npm run dev" -ForegroundColor Cyan
Write-Host ""
