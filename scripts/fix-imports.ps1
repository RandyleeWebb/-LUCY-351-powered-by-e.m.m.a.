# FIX ALL IMPORT PATHS — Add .js Extensions for ESM
# This script fixes all imports to use .js extension (Node.js 20+ ESM requirement)

Write-Host "🔧 Fixing import paths for ESM compatibility..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "src" -Recurse -Filter "*.ts*" -File | Where-Object { $_.Extension -match '\.(ts|tsx)$' }
$fixCount = 0

foreach ($file in $files) {
	$content = Get-Content $file.FullName -Raw
	$originalContent = $content

	# Fix AgentEventBus paths
	$content = $content -replace "from ['\`"]\.\.\/AgentEventBus['\`"]", "from '../agents/AgentEventBus.js'"
	$content = $content -replace "from ['\`"]\.\.\/\.\.\/AgentEventBus['\`"]", "from '../../agents/AgentEventBus.js'"

	# Fix imports that are missing .js extension (except node_modules, React, external packages)
	# Pattern: from './Something' or from '../Something' -> from './Something.js' or from '../Something.js'
	$content = $content -replace "from (['\`"])(\.\.?\/[^'\`"]*?)(['\`"])", {
		param($match)
		$quote = $match.Groups[1].Value
		$path = $match.Groups[2].Value
		$endQuote = $match.Groups[3].Value

		# Skip if already has extension, or is external package, or is React/lucide-react
		if ($path -match '\.(js|ts|tsx|jsx|json|css)$' -or $path -notmatch '\/' -or $path -match '^(react|lucide-react)') {
			return $match.Value
		}

		return "from ${quote}${path}.js${endQuote}"
	}

	if ($content -ne $originalContent) {
		Set-Content -Path $file.FullName -Value $content -NoNewline
		Write-Host "  ✅ Fixed: $($file.FullName -replace '.*\\src\\', 'src\')" -ForegroundColor Green
		$fixCount++
	}
}

Write-Host ""
Write-Host "✅ Fixed $fixCount files" -ForegroundColor Green
Write-Host ""
Write-Host "Now clean cache and restart:" -ForegroundColor Yellow
Write-Host "  Remove-Item -Recurse -Force node_modules\.vite" -ForegroundColor White
Write-Host "  npm run validate:nodes" -ForegroundColor White
Write-Host "  npm run start:dashboard" -ForegroundColor White
# 1. Go to the dashboard terminal
# 2. Press Ctrl+C to stop it
# 3. Restart:
npm run start:dashboard# Navigate to project root (if not already there)
cd "C:\Users\Randy Webb\3D Objects\LucyClean_AGI_OS_v3"

# Run the fix script
.\scripts\fix-imports.ps1