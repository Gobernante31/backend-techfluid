Remove-Item -Recurse -Force .wrangler\tmp\* -ErrorAction SilentlyContinue
Write-Host "Cleaned .wrangler/tmp" -ForegroundColor Green
