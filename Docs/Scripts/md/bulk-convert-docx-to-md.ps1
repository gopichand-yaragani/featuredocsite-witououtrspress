param(
  [string]$Source = "C:\Docs\Word",
  [string]$Output = "C:\Docs\Markdown"
)

# Ensure output and media directories exist
New-Item -ItemType Directory -Path $Output -Force | Out-Null
$mediaRoot = Join-Path $Output "media"
New-Item -ItemType Directory -Path $mediaRoot -Force | Out-Null

# Get all .docx files
$files = Get-ChildItem -Path $Source -Filter "*.docx" -File

Write-Host "Found $($files.Count) .docx files to convert..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($file in $files) {
  try {
    # Get base name without extension
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    
    # Define output paths
    $mdPath = Join-Path $Output "$baseName.md"
    $mediaPath = Join-Path $mediaRoot $baseName
    
    # Ensure media subfolder exists
    New-Item -ItemType Directory -Path $mediaPath -Force | Out-Null
    
    # Run Pandoc conversion with --extract-media
    Write-Host "Converting: $($file.Name)..." -NoNewline
    
    $pandocArgs = @(
      "-s"
      $file.FullName
      "-t"
      "gfm"
      "-o"
      $mdPath
      "--extract-media=$mediaPath"
    )
    
    & pandoc $pandocArgs 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
      Write-Host " [OK]" -ForegroundColor Green
      
      # Fix .tmp files - rename to proper image format
      Write-Host "  - Fixing image extensions..." -NoNewline
      
      $tmpFiles = Get-ChildItem -Path $mediaPath -Filter "*.tmp" -Recurse -File
      $fixedCount = 0
      
      foreach ($tmpFile in $tmpFiles) {
        try {
          # Read first few bytes to detect image type
          $bytes = [System.IO.File]::ReadAllBytes($tmpFile.FullName)
          $ext = ".png"  # default
          
          if ($bytes.Length -ge 4) {
            # PNG signature: 89 50 4E 47
            if ($bytes[0] -eq 0x89 -and $bytes[1] -eq 0x50 -and $bytes[2] -eq 0x4E -and $bytes[3] -eq 0x47) {
              $ext = ".png"
            }
            # JPEG signature: FF D8 FF
            elseif ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8 -and $bytes[2] -eq 0xFF) {
              $ext = ".jpg"
            }
            # GIF signature: 47 49 46
            elseif ($bytes[0] -eq 0x47 -and $bytes[1] -eq 0x49 -and $bytes[2] -eq 0x46) {
              $ext = ".gif"
            }
            # BMP signature: 42 4D
            elseif ($bytes[0] -eq 0x42 -and $bytes[1] -eq 0x4D) {
              $ext = ".bmp"
            }
            # WebP signature: 52 49 46 46 ... 57 45 42 50
            elseif ($bytes.Length -ge 12 -and $bytes[0] -eq 0x52 -and $bytes[1] -eq 0x49 -and 
                    $bytes[2] -eq 0x46 -and $bytes[3] -eq 0x46 -and 
                    $bytes[8] -eq 0x57 -and $bytes[9] -eq 0x45 -and 
                    $bytes[10] -eq 0x42 -and $bytes[11] -eq 0x50) {
              $ext = ".webp"
            }
          }
          
          # Rename .tmp to proper extension
          $newName = $tmpFile.Name -replace '\.tmp$', $ext
          $newPath = Join-Path $tmpFile.DirectoryName $newName
          
          # If target exists, add number
          $counter = 1
          while (Test-Path $newPath) {
            $baseTmp = [System.IO.Path]::GetFileNameWithoutExtension($tmpFile.Name)
            $newName = "$baseTmp-$counter$ext"
            $newPath = Join-Path $tmpFile.DirectoryName $newName
            $counter++
          }
          
          Move-Item $tmpFile.FullName $newPath -Force
          $fixedCount++
          
          # Update markdown file to replace .tmp with correct extension
          $mdContent = Get-Content $mdPath -Raw
          $oldRef = $tmpFile.Name
          $mdContent = $mdContent -replace [regex]::Escape($oldRef), $newName
          Set-Content $mdPath -Value $mdContent -NoNewline
          
        } catch {
          Write-Warning "    Could not fix: $($tmpFile.Name)"
        }
      }
      
      if ($fixedCount -gt 0) {
        Write-Host " Fixed $fixedCount images" -ForegroundColor Yellow
      } else {
        Write-Host " No .tmp files to fix" -ForegroundColor Gray
      }
      
      # Normalize image/link paths for VS Code preview
      try {
        $mdContent = Get-Content $mdPath -Raw
        $mdContent = $mdContent -replace [regex]::Escape($Output) + "[\\/]", ""
        $pattern = '(!\[[^\]]*\]\()([^)]+)(\))'
        $mdContent = [regex]::Replace($mdContent, $pattern, {
          param($m)
          $prefix = $m.Groups[1].Value
          $url = $m.Groups[2].Value -replace '\\','/'
          $suffix = $m.Groups[3].Value
          return $prefix + $url + $suffix
        })
        Set-Content $mdPath -Value $mdContent -NoNewline
      } catch {}
      
      $successCount++
    } else {
      Write-Host " [FAILED - Pandoc exit code: $LASTEXITCODE]" -ForegroundColor Red
      $failCount++
    }
    
  } catch {
    Write-Host " [FAILED: $($_.Exception.Message)]" -ForegroundColor Red
    $failCount++
  }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Conversion Summary:" -ForegroundColor Cyan
Write-Host "  Total files:    $($files.Count)" -ForegroundColor White
Write-Host "  Successful:     $successCount" -ForegroundColor Green
Write-Host "  Failed:         $failCount" -ForegroundColor $(if($failCount -gt 0){"Red"}else{"Green"})
Write-Host "  Output folder:  $Output" -ForegroundColor White
Write-Host "  Media folder:   $mediaRoot" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
