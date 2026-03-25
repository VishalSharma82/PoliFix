# Script to download common UI sounds for PoliFix
$soundsDir = Join-Path $PSScriptRoot "..", "public", "sounds"

if (!(Test-Path $soundsDir)) {
    New-Item -ItemType Directory -Path $soundsDir -Force
}

$sounds = @{
    "click.mp3"   = "https://www.soundjay.com/buttons/sounds/button-16.mp3"
    "slide.mp3"   = "https://www.soundjay.com/buttons/sounds/button-17.mp3"
    "success.mp3" = "https://www.soundjay.com/buttons/sounds/button-3.mp3"
    "error.mp3"   = "https://www.soundjay.com/buttons/sounds/button-10.mp3"
}

foreach ($sound in $sounds.GetEnumerator()) {
    $dest = Join-Path $soundsDir $sound.Key
    Write-Host "Downloading $($sound.Key)..."
    try {
        Invoke-WebRequest -Uri $sound.Value -OutFile $dest -ErrorAction Stop
        Write-Host "Success: $($sound.Key)" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download $($sound.Key): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nAll sounds processed. Please commit and push the public/sounds folder." -ForegroundColor Cyan
