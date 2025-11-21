param(
  [string]$Source = "C:\Docs\Word",
  [string]$Output = "C:\Docs\Markdown",
  [int]$MaxThreads = 4,  # Number of parallel conversions (adjust based on CPU cores)
  [ValidateSet("Overwrite", "Skip", "Rename")]
  [string]$IfExists = "Skip"  # What to do if .md file already exists (Skip = faster, only new files)
)

# Ensure output and media directories exist
New-Item -ItemType Directory -Path $Output -Force | Out-Null
$mediaRoot = Join-Path $Output "media"
New-Item -ItemType Directory -Path $mediaRoot -Force | Out-Null

# Create log file
$logFile = Join-Path $Output "_conversion_log_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
function Write-Log {
  param([string]$Message, [string]$Level = "INFO")
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $logMessage = "[$timestamp] [$Level] $Message"
  Add-Content -Path $logFile -Value $logMessage
  
  switch ($Level) {
    "ERROR" { Write-Host $Message -ForegroundColor Red }
    "SUCCESS" { Write-Host $Message -ForegroundColor Green }
    "WARNING" { Write-Host $Message -ForegroundColor Yellow }
    default { Write-Host $Message -ForegroundColor White }
  }
}

# Get all .docx files
$files = Get-ChildItem -Path $Source -Filter "*.docx" -File -Recurse

if ($files.Count -eq 0) {
  Write-Log "No .docx files found in $Source" "WARNING"
  exit 0
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fast Bulk Word to Markdown Converter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Log "Found $($files.Count) .docx files to convert"
Write-Log "Max parallel threads: $MaxThreads"
Write-Log "If file exists: $IfExists"
Write-Log "Log file: $logFile"
Write-Host ""

# Filter out already converted files if IfExists is "Skip"
if ($IfExists -eq "Skip") {
  $filesToProcess = $files | Where-Object {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
    $mdPath = Join-Path $Output "$baseName.md"
    -not (Test-Path $mdPath)
  }
  $skipped = $files.Count - $filesToProcess.Count
  if ($skipped -gt 0) {
    Write-Log "Skipping $skipped already converted files" "INFO"
  }
  $files = $filesToProcess
}

if ($files.Count -eq 0) {
  Write-Log "All files already converted!" "SUCCESS"
  exit 0
}

# Conversion script block for parallel processing
$convertScriptBlock = {
  param($file, $Output, $mediaRoot, $IfExists)
  
  $result = @{
    FileName = $file.Name
    Success = $false
    ImagesFixed = 0
    Error = $null
    OutputFile = ""
    Renamed = $false
  }
  
  try {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $mdPath = Join-Path $Output "$baseName.md"
    $mediaPath = Join-Path $mediaRoot $baseName
    
    # Handle existing files based on IfExists parameter
    if ((Test-Path $mdPath) -and ($IfExists -eq "Rename")) {
      # Find next available number
      $counter = 1
      while (Test-Path $mdPath) {
        $mdPath = Join-Path $Output "$baseName ($counter).md"
        $mediaPath = Join-Path $mediaRoot "$baseName ($counter)"
        $counter++
      }
      $result.Renamed = $true
      $result.OutputFile = [System.IO.Path]::GetFileName($mdPath)
    } else {
      $result.OutputFile = "$baseName.md"
    }
    
    New-Item -ItemType Directory -Path $mediaPath -Force | Out-Null
    
    # Run Pandoc conversion
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
      # Fix .tmp files
      $tmpFiles = Get-ChildItem -Path $mediaPath -Filter "*.tmp" -Recurse -File
      
      foreach ($tmpFile in $tmpFiles) {
        try {
          $bytes = [System.IO.File]::ReadAllBytes($tmpFile.FullName)
          $ext = ".png"  # default
          
          if ($bytes.Length -ge 4) {
            # PNG: 89 50 4E 47
            if ($bytes[0] -eq 0x89 -and $bytes[1] -eq 0x50 -and $bytes[2] -eq 0x4E -and $bytes[3] -eq 0x47) {
              $ext = ".png"
            }
            # JPEG: FF D8 FF
            elseif ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8 -and $bytes[2] -eq 0xFF) {
              $ext = ".jpg"
            }
            # GIF: 47 49 46
            elseif ($bytes[0] -eq 0x47 -and $bytes[1] -eq 0x49 -and $bytes[2] -eq 0x46) {
              $ext = ".gif"
            }
            # BMP: 42 4D
            elseif ($bytes[0] -eq 0x42 -and $bytes[1] -eq 0x4D) {
              $ext = ".bmp"
            }
            # WebP: 52 49 46 46 ... 57 45 42 50
            elseif ($bytes.Length -ge 12 -and $bytes[0] -eq 0x52 -and $bytes[1] -eq 0x49 -and 
                    $bytes[2] -eq 0x46 -and $bytes[3] -eq 0x46 -and 
                    $bytes[8] -eq 0x57 -and $bytes[9] -eq 0x45 -and 
                    $bytes[10] -eq 0x42 -and $bytes[11] -eq 0x50) {
              $ext = ".webp"
            }
          }
          
          $newName = $tmpFile.Name -replace '\.tmp$', $ext
          $newPath = Join-Path $tmpFile.DirectoryName $newName
          
          # Handle duplicates
          $counter = 1
          while (Test-Path $newPath) {
            $baseTmp = [System.IO.Path]::GetFileNameWithoutExtension($tmpFile.Name)
            $newName = "$baseTmp-$counter$ext"
            $newPath = Join-Path $tmpFile.DirectoryName $newName
            $counter++
          }
          
          Move-Item $tmpFile.FullName $newPath -Force
          $result.ImagesFixed++
          
          # Update markdown
          $mdContent = Get-Content $mdPath -Raw
          $oldRef = $tmpFile.Name
          $mdContent = $mdContent -replace [regex]::Escape($oldRef), $newName
          Set-Content $mdPath -Value $mdContent -NoNewline
          
        } catch {
          # Continue on image fix errors
        }
      }
      
      # Normalize image/link paths for VS Code preview
      try {
        $mdContent = Get-Content $mdPath -Raw
        # Remove absolute output root if present
        $mdContent = $mdContent -replace [regex]::Escape($Output) + "[\\/]", ""
        # Force forward slashes within link/image URLs only
        $pattern = '(!\[[^\]]*\]\()([^)]+)(\))'
        $mdContent = [regex]::Replace($mdContent, $pattern, {
          param($m)
          $prefix = $m.Groups[1].Value
          $url = $m.Groups[2].Value -replace '\\','/'
          $suffix = $m.Groups[3].Value
          return $prefix + $url + $suffix
        })
        Set-Content $mdPath -Value $mdContent -NoNewline
      } catch {
        # ignore normalization errors
      }
      
      $result.Success = $true
    } else {
      $result.Error = "Pandoc exit code: $LASTEXITCODE"
    }
    
  } catch {
    $result.Error = $_.Exception.Message
  }
  
  return $result
}

# Process files in parallel with progress
$completed = 0
$successCount = 0
$failCount = 0
$totalImages = 0
$renamedCount = 0
$jobs = [System.Collections.ArrayList]::new()

Write-Host "Processing files..." -ForegroundColor Cyan
$startTime = Get-Date

foreach ($file in $files) {
  # Wait if max threads reached
  while (($jobs | Where-Object { $_.State -eq 'Running' }).Count -ge $MaxThreads) {
    Start-Sleep -Milliseconds 100
    
    # Collect completed jobs
    $finishedJobs = $jobs | Where-Object { $_.State -eq 'Completed' }
    foreach ($job in $finishedJobs) {
      $result = Receive-Job -Job $job
      Remove-Job -Job $job
      $jobs.Remove($job) | Out-Null
      
      $completed++
      $percent = [math]::Round(($completed / $files.Count) * 100)
      
      if ($result.Success) {
        $successCount++
        $totalImages += $result.ImagesFixed
        if ($result.Renamed) { $renamedCount++ }
        
        $status = "[OK]"
        if ($result.Renamed) {
          $status += " -> $($result.OutputFile)"
        }
        if ($result.ImagesFixed -gt 0) {
          $status += " ($($result.ImagesFixed) images)"
        }
        Write-Host "[$completed/$($files.Count)] $($result.FileName) $status" -ForegroundColor Green
        Write-Log "$($result.FileName) -> $($result.OutputFile) - Success (Images: $($result.ImagesFixed))" "SUCCESS"
      } else {
        $failCount++
        Write-Host "[$completed/$($files.Count)] $($result.FileName) [FAILED] $($result.Error)" -ForegroundColor Red
        Write-Log "$($result.FileName) - Failed: $($result.Error)" "ERROR"
      }
      
      # Progress bar
      $bar = "=" * [math]::Floor($percent / 2)
      $spaces = " " * (50 - [math]::Floor($percent / 2))
      Write-Host "`r[$bar$spaces] $percent%" -NoNewline -ForegroundColor Cyan
    }
  }
  
  # Start new job
  $job = Start-Job -ScriptBlock $convertScriptBlock -ArgumentList $file, $Output, $mediaRoot, $IfExists
  $jobs.Add($job) | Out-Null
}

# Wait for remaining jobs
while ($jobs.Count -gt 0) {
  Start-Sleep -Milliseconds 100
  
  $finishedJobs = $jobs | Where-Object { $_.State -eq 'Completed' }
  foreach ($job in $finishedJobs) {
    $result = Receive-Job -Job $job
    Remove-Job -Job $job
    $jobs.Remove($job) | Out-Null
    
    $completed++
    $percent = [math]::Round(($completed / $files.Count) * 100)
    
    if ($result.Success) {
      $successCount++
      $totalImages += $result.ImagesFixed
      if ($result.Renamed) { $renamedCount++ }
      
      $status = "[OK]"
      if ($result.Renamed) {
        $status += " -> $($result.OutputFile)"
      }
      if ($result.ImagesFixed -gt 0) {
        $status += " ($($result.ImagesFixed) images)"
      }
      Write-Host "[$completed/$($files.Count)] $($result.FileName) $status" -ForegroundColor Green
      Write-Log "$($result.FileName) -> $($result.OutputFile) - Success (Images: $($result.ImagesFixed))" "SUCCESS"
    } else {
      $failCount++
      Write-Host "[$completed/$($files.Count)] $($result.FileName) [FAILED] $($result.Error)" -ForegroundColor Red
      Write-Log "$($result.FileName) - Failed: $($result.Error)" "ERROR"
    }
    
    # Progress bar
    $bar = "=" * [math]::Floor($percent / 2)
    $spaces = " " * (50 - [math]::Floor($percent / 2))
    Write-Host "`r[$bar$spaces] $percent%" -NoNewline -ForegroundColor Cyan
  }
}

Write-Host "`n"

$endTime = Get-Date
$duration = $endTime - $startTime
$avgTime = if ($files.Count -gt 0) { [math]::Round($duration.TotalSeconds / $files.Count, 2) } else { 0 }

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Conversion Summary:" -ForegroundColor Cyan
Write-Host "  Total files:       $($files.Count)" -ForegroundColor White
Write-Host "  Successful:        $successCount" -ForegroundColor Green
Write-Host "  Failed:            $failCount" -ForegroundColor $(if($failCount -gt 0){"Red"}else{"Green"})
if ($renamedCount -gt 0) {
  Write-Host "  Renamed (exist):   $renamedCount" -ForegroundColor Yellow
}
Write-Host "  Images fixed:      $totalImages" -ForegroundColor Yellow
Write-Host "  Total time:        $($duration.ToString('mm\:ss'))" -ForegroundColor White
Write-Host "  Average per file:  $avgTime seconds" -ForegroundColor White
Write-Host "  Output folder:     $Output" -ForegroundColor White
Write-Host "  Media folder:      $mediaRoot" -ForegroundColor White
Write-Host "  Log file:          $logFile" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

Write-Log "Conversion complete. Success: $successCount, Failed: $failCount, Renamed: $renamedCount, Images: $totalImages, Time: $($duration.ToString('mm\:ss'))" "INFO"
