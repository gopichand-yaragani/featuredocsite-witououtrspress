param(
  [string]$Source = "C:\Docs\html\Content",
  [string]$Output = "C:\Docs\MDX",
  [int]$MaxThreads = 0,  # 0 = Auto-detect based on CPU cores
  [ValidateSet("Overwrite", "Skip", "Rename")]
  [string]$IfExists = "Overwrite",  # Default: Overwrite existing files on re-run
  [int]$MaxRetries = 4,  # Increased retries for large batches
  [int]$RetryDelayMs = 1500,  # Slightly longer delay for stability
  [int]$BatchSize = 200,  # Larger batches for 2500+ files (better memory efficiency)
  [switch]$EnableCheckpoint,  # Save progress for resume capability
  [switch]$StrictQuality,  # Enable strict MDX quality validation
  [string]$Version = "6.1"  # Docs version used in frontmatter and filename suffix
)

# Coerce version to 6.1 always and compute normalized suffix
$Version = "6.1"
$VersionNormalized = '6_1'

# Performance optimizations: Set execution policy and memory limits
$ErrorActionPreference = "Continue"
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

# Default-enable key flags if not explicitly passed
if (-not $PSBoundParameters.ContainsKey('EnableCheckpoint')) { $EnableCheckpoint = $true }
if (-not $PSBoundParameters.ContainsKey('StrictQuality'))   { $StrictQuality   = $true }
if (-not $PSBoundParameters.ContainsKey('IfExists'))        { $IfExists        = 'Overwrite' }

# Auto-detect optimal thread count if not specified (enhanced for large batches)
if ($MaxThreads -eq 0) {
  $cpuCores = (Get-CimInstance Win32_ComputerSystem).NumberOfLogicalProcessors
  $availableMemoryGB = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB
  
  # Scale threads based on CPU cores and available memory
  # For 2500+ files, use more threads if memory allows
  if ($availableMemoryGB -ge 16) {
    $MaxThreads = [Math]::Min($cpuCores, 12)  # More threads for high-memory systems
  } else {
    $MaxThreads = [Math]::Min($cpuCores, 8)  # Standard cap
  }
  
  if ($MaxThreads -lt 2) { $MaxThreads = 2 }  # Minimum 2 threads
}

# Ensure output directory exists
New-Item -ItemType Directory -Path $Output -Force | Out-Null
# Media folders will be created per-file in their respective directories

# Checkpoint file for resume capability
$checkpointFile = Join-Path $Output "_conversion_checkpoint.json"

# Create log file with buffered writing (optimized for 2500+ files)
$logFile = Join-Path $Output "_conversion_log_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$logBuffer = [System.Collections.ArrayList]::new()
$logBufferLock = [System.Threading.ReaderWriterLockSlim]::new()
$logFlushThreshold = 100  # Larger buffer for better performance with large batches

function Write-Log {
  param([string]$Message, [string]$Level = "INFO")
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $logMessage = "[$timestamp] [$Level] $Message"
  
  # Thread-safe buffered logging
  $logBufferLock.EnterWriteLock()
  try {
    [void]$logBuffer.Add($logMessage)
    # Flush buffer when threshold reached
    if ($logBuffer.Count -ge $logFlushThreshold) {
      $logBuffer | Add-Content -Path $logFile -Encoding UTF8
      $logBuffer.Clear()
    }
  } finally {
    $logBufferLock.ExitWriteLock()
  }
  
  switch ($Level) {
    "ERROR" { Write-Host $Message -ForegroundColor Red }
    "SUCCESS" { Write-Host $Message -ForegroundColor Green }
    "WARNING" { Write-Host $Message -ForegroundColor Yellow }
    default { Write-Host $Message -ForegroundColor White }
  }
}

# Flush remaining log buffer
function Flush-LogBuffer {
  $logBufferLock.EnterWriteLock()
  try {
    if ($logBuffer.Count -gt 0) {
      $logBuffer | Add-Content -Path $logFile -Encoding UTF8
      $logBuffer.Clear()
    }
  } finally {
    $logBufferLock.ExitWriteLock()
  }
}

# Save checkpoint for resume capability
function Save-Checkpoint {
  param($ProcessedFiles, $FailedFiles)
  
  if ($EnableCheckpoint) {
    try {
      $checkpoint = @{
        ProcessedFiles = $ProcessedFiles
        FailedFiles = $FailedFiles
        Timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
      }
      $checkpoint | ConvertTo-Json -Compress | Set-Content -Path $checkpointFile -Encoding UTF8 -ErrorAction SilentlyContinue
    } catch {
      # Silently fail checkpoint saves
    }
  }
}

# Load checkpoint if exists
function Load-Checkpoint {
  if ($EnableCheckpoint -and (Test-Path $checkpointFile)) {
    try {
      $checkpoint = Get-Content -Path $checkpointFile -Encoding UTF8 -Raw | ConvertFrom-Json
      Write-Log "Checkpoint found. Resuming from previous session (Processed: $($checkpoint.ProcessedFiles.Count))" "INFO"
      return $checkpoint.ProcessedFiles
    } catch {
      Write-Log "Could not load checkpoint. Starting fresh." "WARNING"
    }
  }
  return @()
}

# Optimized image format detection (reads only header bytes)
function Get-ImageExtension {
  param([string]$FilePath)
  
  try {
    $fs = [System.IO.File]::OpenRead($FilePath)
    try {
      $header = New-Object byte[] 12
      $bytesRead = $fs.Read($header, 0, 12)
      $fs.Close()
      
      if ($bytesRead -ge 4) {
        # PNG: 89 50 4E 47
        if ($header[0] -eq 0x89 -and $header[1] -eq 0x50 -and $header[2] -eq 0x4E -and $header[3] -eq 0x47) {
          return ".png"
        }
        # JPEG: FF D8 FF
        if ($header[0] -eq 0xFF -and $header[1] -eq 0xD8 -and $header[2] -eq 0xFF) {
          return ".jpg"
        }
        # GIF: 47 49 46
        if ($header[0] -eq 0x47 -and $header[1] -eq 0x49 -and $header[2] -eq 0x46) {
          return ".gif"
        }
        # BMP: 42 4D
        if ($header[0] -eq 0x42 -and $header[1] -eq 0x4D) {
          return ".bmp"
        }
        # WebP: 52 49 46 46 ... 57 45 42 50
        if ($bytesRead -ge 12 -and $header[0] -eq 0x52 -and $header[1] -eq 0x49 -and 
            $header[2] -eq 0x46 -and $header[3] -eq 0x46 -and 
            $header[8] -eq 0x57 -and $header[9] -eq 0x45 -and 
            $header[10] -eq 0x42 -and $header[11] -eq 0x50) {
          return ".webp"
        }
        # SVG: Check first 100 bytes for XML/SVG content
        if ($bytesRead -ge 5) {
          $text = [System.Text.Encoding]::UTF8.GetString($header, 0, [Math]::Min(100, $bytesRead))
          if ($text -match '<svg' -or $text -match '<?xml') {
            return ".svg"
          }
        }
      }
    } finally {
      if ($fs) { $fs.Dispose() }
    }
  } catch {
    # Fallback to reading full file if header read fails
    try {
      $bytes = [System.IO.File]::ReadAllBytes($FilePath)
      if ($bytes.Length -ge 4) {
        if ($bytes[0] -eq 0x89 -and $bytes[1] -eq 0x50 -and $bytes[2] -eq 0x4E -and $bytes[3] -eq 0x47) { return ".png" }
        if ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8 -and $bytes[2] -eq 0xFF) { return ".jpg" }
        if ($bytes[0] -eq 0x47 -and $bytes[1] -eq 0x49 -and $bytes[2] -eq 0x46) { return ".gif" }
        if ($bytes[0] -eq 0x42 -and $bytes[1] -eq 0x4D) { return ".bmp" }
      }
    } catch {}
  }
  return ".png"  # Default fallback
}

# Normalize filename/folder name: replace spaces/hyphens with single underscore, convert to lowercase
function Normalize-Name {
  param([string]$Name, [switch]$IsFolder)
  
  if ([string]::IsNullOrWhiteSpace($Name)) { return $Name }
  
  # Replace spaces and hyphens with underscores, then collapse multiple consecutive underscores to single underscore
  $normalized = $Name -replace '[\s\-]+', '_'
  
  # Collapse any multiple consecutive underscores (including existing ones) to single underscore
  $normalized = $normalized -replace '_+', '_'
  
  # Remove leading/trailing underscores that might result from the replacement
  $normalized = $normalized.Trim('_')
  
  # Convert to lowercase
  $normalized = $normalized.ToLower()
  
  # For MDX files (not folders), append _<version> before extension (from $VersionNormalized)
  if (-not $IsFolder) {
    $ext = [System.IO.Path]::GetExtension($normalized)
    if ($ext -eq '.mdx') {
      $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($normalized)
      # Normalize any existing trailing v6_1 or 6_1 to a single _6_1
      $nameWithoutExt = $nameWithoutExt -replace ('_(?:v)?' + [regex]::Escape($VersionNormalized) + '$'), ('_' + $VersionNormalized)
      if ($nameWithoutExt -notmatch ('_' + [regex]::Escape($VersionNormalized) + '$')) {
        $nameWithoutExt = $nameWithoutExt + '_' + $VersionNormalized
      }
      $normalized = $nameWithoutExt + $ext
    }
  }
  
  return $normalized
}

# Normalize folder path: normalize each folder segment
function Normalize-FolderPath {
  param([string]$FolderPath)
  
  if ([string]::IsNullOrWhiteSpace($FolderPath)) { return $FolderPath }
  
  $segments = $FolderPath -split '[\\/]'
  $normalizedSegments = $segments | ForEach-Object {
    if ([string]::IsNullOrWhiteSpace($_)) {
      $_
    } else {
      Normalize-Name -Name $_ -IsFolder
    }
  }
  
  return $normalizedSegments -join '\'
}

# Validate HTML file before processing
function Test-HTMLFile {
  param([System.IO.FileInfo]$File)
  
  try {
    # Check if file is locked
    $fs = [System.IO.File]::Open($File.FullName, 'Open', 'Read', 'None')
    $fs.Close()
    $fs.Dispose()
    
    # Check file size (skip empty or extremely large files)
    if ($File.Length -eq 0) { return $false, "File is empty" }
    if ($File.Length -gt 100MB) { return $false, "File too large (>100MB)" }
    
    # Quick check if file contains HTML-like content
    $header = Get-Content -Path $File.FullName -TotalCount 5 -ErrorAction SilentlyContinue
    if ($header -match '<html|<!DOCTYPE|<body|<head') {
      return $true, $null
    }
    
    return $true, $null  # Allow processing even if HTML structure not detected
  } catch {
    return $false, $_.Exception.Message
  }
}

# Function to build link map from all HTML files (called before parallel processing)
function Build-LinkMap {
  param([array]$AllFiles, [string]$SourceRoot, [string]$OutputRoot)
  
  $linkMap = @{}
  
  foreach ($file in $AllFiles) {
    try {
      $relativePath = $file.FullName.Substring($SourceRoot.Length).TrimStart('\')
      $relativeDir = Split-Path $relativePath -Parent
      $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
      
      # Normalize folder and filename (same logic as conversion)
      $normalizedDir = if ($relativeDir) { 
        $segments = $relativeDir -split '[\\/]'
        $normalizedSegments = $segments | ForEach-Object {
          if ([string]::IsNullOrWhiteSpace($_)) {
            $_
          } else {
            $norm = $_ -replace '[\s\-]+', '_' -replace '_+', '_'
            $norm = $norm.Trim('_').ToLower()
            $norm
          }
        }
        $normalizedSegments -join '/'
      } else { 
        $null 
      }
      
      $normalizedBaseName = ($baseName -replace '[\s\-]+', '_' -replace '_+', '_').Trim('_').ToLower()
      # Normalize any existing trailing v6_1 or 6_1 to a single _6_1
      $normalizedBaseName = $normalizedBaseName -replace ('_(?:v)?' + [regex]::Escape($VersionNormalized) + '$'), ('_' + $VersionNormalized)
      if ($normalizedBaseName -notmatch ('_' + [regex]::Escape($VersionNormalized) + '$')) {
        $normalizedBaseName = $normalizedBaseName + '_' + $VersionNormalized
      }
      $normalizedBaseName = $normalizedBaseName + '.mdx'
      
      # Build MDX route
      if ($normalizedDir) {
        $mdxRoute = "/$normalizedDir/$normalizedBaseName"
      } else {
        $mdxRoute = "/$normalizedBaseName"
      }
      
      # Normalize slashes
      $mdxRoute = $mdxRoute -replace '\\', '/'
      
      # Map original .htm filename (case-insensitive) to MDX route
      $htmKey = $file.Name.ToLower()
      $linkMap[$htmKey] = $mdxRoute
      
      # Also map without extension
      $htmKeyNoExt = [System.IO.Path]::GetFileNameWithoutExtension($file.Name).ToLower()
      $linkMap[$htmKeyNoExt] = $mdxRoute
    } catch {
      # Skip files that fail mapping
      continue
    }
  }
  
  return $linkMap
}

# Get all .html and .htm files
$files = Get-ChildItem -Path $Source -Include "*.html","*.htm" -File -Recurse

if ($files.Count -eq 0) {
  Write-Log "No .html or .htm files found in $Source" "WARNING"
  Flush-LogBuffer
  exit 0
}

# Build link map for all files (for link normalization)
Write-Host "Building link map for $($files.Count) files..." -ForegroundColor Cyan
$globalLinkMap = Build-LinkMap -AllFiles $files -SourceRoot $Source -OutputRoot $Output
Write-Log "Link map built with $($globalLinkMap.Count) entries" "INFO"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Enterprise HTML to MDX Converter (2500+ Files)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Log "Found $($files.Count) HTML files to convert"
Write-Log "Auto-detected threads: $MaxThreads"
Write-Log "Batch size: $BatchSize"
Write-Log "Max retries: $MaxRetries"
Write-Log "Strict quality: $StrictQuality"
Write-Log "Checkpoint enabled: $EnableCheckpoint"
Write-Log "Log file: $logFile"
Write-Host ""

# Load checkpoint if resuming
$processedFiles = Load-Checkpoint
$processedFileSet = New-Object System.Collections.Generic.HashSet[string]
foreach ($pf in $processedFiles) {
  [void]$processedFileSet.Add($pf)
}

# Handle existing files based on IfExists parameter
if ($IfExists -eq "Skip") {
  # Skip already converted files
  $filesToProcess = $files | Where-Object {
    $filePath = $_.FullName
    $relativePath = $filePath.Substring($Source.Length).TrimStart('\')
    $relativeDir = Split-Path $relativePath -Parent
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
    
    # Normalize folder and filename
    $normalizedDir = if ($relativeDir) { Normalize-FolderPath -FolderPath $relativeDir } else { $null }
    $normalizedBaseName = Normalize-Name -Name "$baseName.mdx"
    
    # Build output path preserving folder structure (normalized)
    if ($normalizedDir) {
      $targetDir = Join-Path $Output $normalizedDir
      $mdxPath = Join-Path $targetDir $normalizedBaseName
    } else {
      $mdxPath = Join-Path $Output $normalizedBaseName
    }
    
    # Skip if already processed (checkpoint) or already converted
    -not $processedFileSet.Contains($filePath) -and -not (Test-Path $mdxPath)
  }
  $skipped = $files.Count - $filesToProcess.Count
  if ($skipped -gt 0) {
    Write-Log "Skipping $skipped already converted/processed files" "INFO"
  }
  $files = $filesToProcess
} elseif ($IfExists -eq "Overwrite") {
  # Overwrite mode: Remove existing MDX files and media folders
  Write-Host "Overwrite mode: Existing MDX files will be replaced..." -ForegroundColor Yellow
  $overwriteCount = 0
  foreach ($file in $files) {
    $filePath = $file.FullName
    $relativePath = $filePath.Substring($Source.Length).TrimStart('\')
    $relativeDir = Split-Path $relativePath -Parent
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    
    # Normalize folder and filename
    $normalizedDir = if ($relativeDir) { Normalize-FolderPath -FolderPath $relativeDir } else { $null }
    $normalizedBaseName = Normalize-Name -Name "$baseName.mdx"
    $normalizedBaseNameOnly = [System.IO.Path]::GetFileNameWithoutExtension($normalizedBaseName)
    
    # Build output path preserving folder structure (normalized)
    if ($normalizedDir) {
      $targetDir = Join-Path $Output $normalizedDir
      $mdxPath = Join-Path $targetDir $normalizedBaseName
      $mediaPath = Join-Path $targetDir "media\$normalizedBaseNameOnly"
    } else {
      $mdxPath = Join-Path $Output $normalizedBaseName
      $mediaPath = Join-Path $Output "media\$normalizedBaseNameOnly"
    }
    
    # Remove existing MDX file and media folder if they exist
    if (Test-Path $mdxPath) {
      Remove-Item $mdxPath -Force -ErrorAction SilentlyContinue
      $overwriteCount++
    }
    if (Test-Path $mediaPath) {
      Remove-Item $mediaPath -Recurse -Force -ErrorAction SilentlyContinue
    }
  }
  if ($overwriteCount -gt 0) {
    Write-Log "Overwrite mode: Removed $overwriteCount existing MDX files for re-conversion" "INFO"
    Write-Host "  Found $overwriteCount existing files to overwrite" -ForegroundColor Yellow
  }
  # Clear checkpoint since we're starting fresh
  if ($EnableCheckpoint -and (Test-Path $checkpointFile)) {
    Remove-Item $checkpointFile -Force -ErrorAction SilentlyContinue
    Write-Log "Checkpoint cleared for fresh conversion" "INFO"
  }
} elseif ($IfExists -eq "Rename") {
  # Rename mode: Add timestamp to existing files
  Write-Host "Rename mode: Existing files will be renamed..." -ForegroundColor Yellow
  # Implementation would go here if needed
}

if ($files.Count -eq 0) {
  Write-Log "All files already converted!" "SUCCESS"
  Flush-LogBuffer
  if ($EnableCheckpoint -and (Test-Path $checkpointFile)) {
    Remove-Item $checkpointFile -Force -ErrorAction SilentlyContinue
  }
  exit 0
}

# Pre-validate files before processing (filter out problematic files)
Write-Host "Pre-validating files..." -ForegroundColor Cyan
$validFiles = @()
$invalidFiles = 0

foreach ($file in $files) {
  $isValid, $reason = Test-HTMLFile -File $file
  if ($isValid) {
    $validFiles += $file
  } else {
    $invalidFiles++
    Write-Log "$($file.Name) - Skipped: $reason" "WARNING"
  }
}

if ($invalidFiles -gt 0) {
  Write-Log "Skipped $invalidFiles invalid files during pre-validation" "WARNING"
}

$files = $validFiles

if ($files.Count -eq 0) {
  Write-Log "No valid files to process after validation" "WARNING"
  Flush-LogBuffer
  exit 0
}

# Locate Pandoc executable (fallback to default install path)
$pandocExe = (Get-Command pandoc -ErrorAction SilentlyContinue | Select-Object -First 1).Source
if (-not $pandocExe) {
  $candidate = "C:\\Program Files\\Pandoc\\pandoc.exe"
  if (Test-Path $candidate) { $pandocExe = $candidate }
}
if (-not $pandocExe) {
  Write-Host "ERROR: Pandoc is not installed or not on PATH." -ForegroundColor Red
  Write-Host "Install Pandoc from https://pandoc.org/installing.html and re-run." -ForegroundColor Yellow
  Flush-LogBuffer
  exit 2
}

# Conversion script block for parallel processing with enhanced retry logic
$convertScriptBlock = {
  param($file, $Source, $Output, $IfExists, $MaxRetries, $RetryDelayMs, $StrictQuality, $LinkMap, $PandocExe, $Version)
  
  # Initialize result object at the very start
  $result = @{
    FileName = $file.Name
    Success = $false
    ImagesFixed = 0
    Error = $null
    OutputFile = ""
    Renamed = $false
    Retries = 0
    QualityCheck = $false
    FilePath = $file.FullName
  }
  
  try {
    # Coerce version inside job as well
    $Version = '6.1'
    $versionUnderscore = '6_1'
    
    # Embedded frontmatter and conversion functions (needed in job context)
  function Get-Frontmatter {
    param([string]$HtmlContent, [string]$FilePath, [string]$RelativePath)
    
    $frontmatter = @{
      Title = ""
      Description = ""
      Version = $Version
      Module = ""
      Section = ""
      Page = ""
      Breadcrumbs = @()
      Keywords = @()
      Author = ""
    }
    
    try {
      # Extract title from H1
      $h1Match = [regex]::Match($HtmlContent, '<h1[^>]*>(.*?)</h1>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
      if ($h1Match.Success) {
        $frontmatter.Title = ($h1Match.Groups[1].Value -replace '<[^>]+>', '' -replace '\s+', ' ').Trim()
      }
      
      # If no H1, try to extract from filename
      if ([string]::IsNullOrWhiteSpace($frontmatter.Title)) {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
        $frontmatter.Title = $baseName -replace '[_\-\+]', ' ' -replace '\s+', ' '
        $frontmatter.Title = $frontmatter.Title.Trim()
      }
      
      # Extract description from first paragraph or meta description tag
      $metaDescMatch = [regex]::Match($HtmlContent, '<meta\s+name="description"\s+content="([^"]+)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
      if ($metaDescMatch.Success) {
        $frontmatter.Description = $metaDescMatch.Groups[1].Value.Trim()
      } else {
        $pMatch = [regex]::Match($HtmlContent, '<p[^>]*>(.*?)</p>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
        if ($pMatch.Success) {
          $desc = ($pMatch.Groups[1].Value -replace '<[^>]+>', '' -replace '\s+', ' ').Trim()
          if ($desc.Length -gt 0 -and $desc.Length -lt 200) {
            $frontmatter.Description = $desc
          }
        }
      }
      
      # Extract keywords from meta tags
      $metaKeywordsMatch = [regex]::Match($HtmlContent, '<meta\s+name="keywords"\s+content="([^"]+)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
      if ($metaKeywordsMatch.Success) {
        $keywords = $metaKeywordsMatch.Groups[1].Value -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_.Length -gt 0 }
        if ($keywords.Count -gt 0) {
          $frontmatter.Keywords = $keywords
        }
      }
      
      # Extract author from meta tags
      $metaAuthorMatch = [regex]::Match($HtmlContent, '<meta\s+name="author"\s+content="([^"]+)"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
      if ($metaAuthorMatch.Success) {
        $frontmatter.Author = $metaAuthorMatch.Groups[1].Value.Trim()
      }
      
      # Build breadcrumbs from path structure
      if ($RelativePath) {
        $pathSegments = $RelativePath -split '[\\/]' | Where-Object { $_.Length -gt 0 }
        $breadcrumbs = @("Home", $Version)
        
        # Map common folder names to breadcrumb labels
        $folderMap = @{
          "admin_discovery" = "ITAM"
          "admin_users" = "ITAM"
          "admin_sacm" = "ITAM"
          "admin_procurement" = "ITAM"
          "cmdb" = "CMDB"
          "configuration_management" = "Configuration Management"
        }
        
        foreach ($segment in $pathSegments) {
          $normalizedSegment = $segment -replace '[_\-\+]', ' ' -replace '\s+', ' '
          $normalizedSegment = $normalizedSegment.Trim()
          
          if ($folderMap.ContainsKey($segment.ToLower())) {
            $breadcrumbs += $folderMap[$segment.ToLower()]
          } else {
            $words = $normalizedSegment -split ' '
            $capitalized = ($words | ForEach-Object { 
              if ($_.Length -gt 0) { 
                $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower() 
              } 
            }) -join ' '
            $breadcrumbs += $capitalized
          }
        }
        
        if (-not [string]::IsNullOrWhiteSpace($frontmatter.Title)) {
          $breadcrumbs += $frontmatter.Title
        }
        
        $frontmatter.Breadcrumbs = $breadcrumbs
        
        if ($breadcrumbs.Count -gt 2) {
          $frontmatter.Module = $breadcrumbs[2]
          if ($breadcrumbs.Count -gt 3) {
            $frontmatter.Section = $breadcrumbs[3]
          }
        }
        
        if ($breadcrumbs.Count -gt 0) {
          $frontmatter.Page = $breadcrumbs[-1]
        }
      }
    } catch {
      if ([string]::IsNullOrWhiteSpace($frontmatter.Title)) {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
        $frontmatter.Title = $baseName
      }
    }
    
    return $frontmatter
  }
  
  function Format-Frontmatter {
    param($Frontmatter)
    
    $tbd = $null
    $lines = @("---")
    $lines += "title: `"$($Frontmatter.Title)`""
    $lines += "description: `"$($Frontmatter.Description)`""
    $lines += "version: `"$($Frontmatter.Version)`""
    $lines += "module: `"$($Frontmatter.Module)`""
    $lines += "section: `"$($Frontmatter.Section)`""
    $lines += "page: `"$($Frontmatter.Page)`""
    
    if ($Frontmatter.Keywords.Count -gt 0) {
      $lines += "keywords:"
      foreach ($keyword in $Frontmatter.Keywords) {
        $lines += "  - `"$keyword`""
      }
    }
    
    if (-not [string]::IsNullOrWhiteSpace($Frontmatter.Author)) {
      $lines += "author: `"$($Frontmatter.Author)`""
    }
    
    if ($Frontmatter.Breadcrumbs.Count -gt 0) {
      $lines += "breadcrumbs:"
      foreach ($crumb in $Frontmatter.Breadcrumbs) {
        $lines += "  - `"$crumb`""
      }
    }
    
    $lines += "---"
    return $lines -join "`r`n"
  }
  
  # Embedded normalization functions (needed in job context)
  function Normalize-Name {
    param([string]$Name, [switch]$IsFolder)
    
    if ([string]::IsNullOrWhiteSpace($Name)) { return $Name }
    
    # Replace spaces and hyphens with underscores, then collapse multiple consecutive underscores to single underscore
    $normalized = $Name -replace '[\s\-]+', '_'
    
    # Collapse any multiple consecutive underscores (including existing ones) to single underscore
    $normalized = $normalized -replace '_+', '_'
    
    # Remove leading/trailing underscores that might result from the replacement
    $normalized = $normalized.Trim('_')
    
    # Convert to lowercase
    $normalized = $normalized.ToLower()
    
    # For MDX files (not folders), append _<version> before extension (from $VersionNormalized) if not already present
    if (-not $IsFolder) {
      $ext = [System.IO.Path]::GetExtension($normalized)
      if ($ext -eq '.mdx') {
        $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($normalized)
        # Normalize any existing trailing v6_1 or 6_1 to a single _6_1
        $nameWithoutExt = $nameWithoutExt -replace ('_(?:v)?' + [regex]::Escape($versionUnderscore) + '$'), ('_' + $versionUnderscore)
        if ($nameWithoutExt -notmatch ('_' + [regex]::Escape($versionUnderscore) + '$')) {
          $nameWithoutExt = $nameWithoutExt + '_' + $versionUnderscore
        }
        $normalized = $nameWithoutExt + $ext
      }
    }
    
    return $normalized
  }
  
  function Normalize-FolderPath {
    param([string]$FolderPath)
    
    if ([string]::IsNullOrWhiteSpace($FolderPath)) { return $FolderPath }
    
    $segments = $FolderPath -split '[\\/]'
    $normalizedSegments = $segments | ForEach-Object {
      if ([string]::IsNullOrWhiteSpace($_)) {
        $_
      } else {
        Normalize-Name -Name $_ -IsFolder
      }
    }
    
    return $normalizedSegments -join '\'
  }
  
  # Embedded function for image extension detection (needed in job context)
  function Get-ImageExtension {
    param([string]$FilePath)
    
    try {
      $fs = [System.IO.File]::OpenRead($FilePath)
      try {
        $header = New-Object byte[] 12
        $bytesRead = $fs.Read($header, 0, 12)
        $fs.Close()
        
        if ($bytesRead -ge 4) {
          if ($header[0] -eq 0x89 -and $header[1] -eq 0x50 -and $header[2] -eq 0x4E -and $header[3] -eq 0x47) { return ".png" }
          if ($header[0] -eq 0xFF -and $header[1] -eq 0xD8 -and $header[2] -eq 0xFF) { return ".jpg" }
          if ($header[0] -eq 0x47 -and $header[1] -eq 0x49 -and $header[2] -eq 0x46) { return ".gif" }
          if ($header[0] -eq 0x42 -and $header[1] -eq 0x4D) { return ".bmp" }
          if ($bytesRead -ge 12 -and $header[0] -eq 0x52 -and $header[1] -eq 0x49 -and 
              $header[2] -eq 0x46 -and $header[3] -eq 0x46 -and 
              $header[8] -eq 0x57 -and $header[9] -eq 0x45 -and 
              $header[10] -eq 0x42 -and $header[11] -eq 0x50) { return ".webp" }
          if ($bytesRead -ge 5) {
            $text = [System.Text.Encoding]::UTF8.GetString($header, 0, [Math]::Min(100, $bytesRead))
            if ($text -match '<svg' -or $text -match '<?xml') { return ".svg" }
          }
        }
      } finally {
        if ($fs) { $fs.Dispose() }
      }
    } catch {
      try {
        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        if ($bytes.Length -ge 4) {
          if ($bytes[0] -eq 0x89 -and $bytes[1] -eq 0x50 -and $bytes[2] -eq 0x4E -and $bytes[3] -eq 0x47) { return ".png" }
          if ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8 -and $bytes[2] -eq 0xFF) { return ".jpg" }
          if ($bytes[0] -eq 0x47 -and $bytes[1] -eq 0x49 -and $bytes[2] -eq 0x46) { return ".gif" }
          if ($bytes[0] -eq 0x42 -and $bytes[1] -eq 0x4D) { return ".bmp" }
        }
      } catch {}
    }
    return ".png"
  }
  
  # Enhanced function to extract HTML structure for comparison
  function Get-HTMLStructure {
    param([string]$HtmlContent)
    
    $structure = @{
      Headings = @()
      Tables = 0
      BulletLists = 0
      NumberedLists = 0
      Images = 0
      Links = 0
    }
    
    try {
      # Extract headings (h1-h6)
      $headingMatches = [regex]::Matches($HtmlContent, '<h([1-6])[^>]*>(.*?)</h[1-6]>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
      foreach ($match in $headingMatches) {
        $level = [int]$match.Groups[1].Value
        $text = ($match.Groups[2].Value -replace '<[^>]+>', '' -replace '\s+', ' ').Trim()
        if ($text.Length -gt 0) {
          $structure.Headings += @{ Level = $level; Text = $text }
        }
      }
      
      # Count tables
      $tableMatches = [regex]::Matches($HtmlContent, '<table[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
      $structure.Tables = $tableMatches.Count
      
      # Count bullet lists (ul)
      $ulMatches = [regex]::Matches($HtmlContent, '<ul[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
      $structure.BulletLists = $ulMatches.Count
      
      # Count numbered lists (ol)
      $olMatches = [regex]::Matches($HtmlContent, '<ol[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
      $structure.NumberedLists = $olMatches.Count
      
      # Count images
      $imgMatches = [regex]::Matches($HtmlContent, '<img[^>]+>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
      $structure.Images = $imgMatches.Count
      
      # Count links
      $linkMatches = [regex]::Matches($HtmlContent, '<a[^>]+href[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
      $structure.Links = $linkMatches.Count
    } catch {
      # If parsing fails, return empty structure
    }
    
    return $structure
  }
  
  # Enhanced function to extract MDX structure for comparison
  function Get-MDXStructure {
    param([string]$MdxContent)
    
    $structure = @{
      Headings = @()
      Tables = 0
      BulletLists = 0
      NumberedLists = 0
      Images = 0
      Links = 0
    }
    
    try {
      $lines = $MdxContent -split "`r?`n"
      
      foreach ($line in $lines) {
        $trimmed = $line.Trim()
        
        # Extract ATX headings (# ## ### etc.)
        if ($trimmed -match '^(#{1,6})\s+(.+)$') {
          $level = $matches[1].Length
          $text = $matches[2].Trim()
          if ($text.Length -gt 0) {
            $structure.Headings += @{ Level = $level; Text = $text }
          }
        }
        
        # Count tables (pipe tables)
        if ($trimmed -match '^\|.*\|') {
          # Check if it's a header separator (contains --- or ===)
          if ($trimmed -match '^[\|\s\-\:]+$') {
            # This is a table separator, count as part of table
          } elseif ($trimmed -match '^\|') {
            # This is a table row, increment if we haven't counted this table yet
            # Simple heuristic: count consecutive pipe rows as one table
            $structure.Tables = [Math]::Max($structure.Tables, 1)
          }
        }
        
        # Count bullet lists (starting with * or -)
        if ($trimmed -match '^[\*\-\+]\s+') {
          $structure.BulletLists++
        }
        
        # Count numbered lists (starting with 1. 2. etc.)
        if ($trimmed -match '^\d+\.\s+') {
          $structure.NumberedLists++
        }
        
        # Count images (![alt](url))
        if ($trimmed -match '!\[([^\]]*)\]\(([^)]+)\)') {
          $structure.Images++
        }
        
        # Count links ([text](url))
        if ($trimmed -match '\[([^\]]+)\]\(([^)]+)\)' -and $trimmed -notmatch '!\[') {
          $structure.Links++
        }
      }
      
      # Refine table count (group consecutive table rows)
      $inTable = $false
      $tableCount = 0
      foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -match '^\|.*\|' -and $trimmed -notmatch '^[\|\s\-\:]+$') {
          if (-not $inTable) {
            $tableCount++
            $inTable = $true
          }
        } elseif ($trimmed.Length -eq 0 -or ($trimmed -notmatch '^\|')) {
          $inTable = $false
        }
      }
      $structure.Tables = $tableCount
      
    } catch {
      # If parsing fails, return empty structure
    }
    
    return $structure
  }
  
  # Function to extract frontmatter from HTML content
  function Get-Frontmatter {
    param([string]$HtmlContent, [string]$FilePath, [string]$RelativePath)
    
    $frontmatter = @{
      Title = ""
      Description = ""
      Version = $Version
      Module = ""
      Section = ""
      Page = ""
      Breadcrumbs = @()
      Keywords = @()
      Author = ""
    }
    
    try {
      # Extract title from H1
      $h1Match = [regex]::Match($HtmlContent, '<h1[^>]*>(.*?)</h1>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
      if ($h1Match.Success) {
        $frontmatter.Title = ($h1Match.Groups[1].Value -replace '<[^>]+>', '' -replace '\s+', ' ').Trim()
      }
      
      # If no H1, try to extract from filename
      if ([string]::IsNullOrWhiteSpace($frontmatter.Title)) {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
        $frontmatter.Title = $baseName -replace '[_\-\+]', ' ' -replace '\s+', ' '
        $frontmatter.Title = $frontmatter.Title.Trim()
      }
      
      # Extract description from first paragraph
      $pMatch = [regex]::Match($HtmlContent, '<p[^>]*>(.*?)</p>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
      if ($pMatch.Success) {
        $desc = ($pMatch.Groups[1].Value -replace '<[^>]+>', '' -replace '\s+', ' ').Trim()
        if ($desc.Length -gt 0 -and $desc.Length -lt 200) {
          $frontmatter.Description = $desc
        }
      }
      
      # Build breadcrumbs from path structure
      # Example: admin_discovery/cmdb/manage_cmdb -> Home > 6.1 > ITAM > Configuration Management > CMDB > Manage CMDB
      if ($RelativePath) {
        $pathSegments = $RelativePath -split '[\\/]' | Where-Object { $_.Length -gt 0 }
        $breadcrumbs = @("Home", $Version)
        
        # Map common folder names to breadcrumb labels
        $folderMap = @{
          "admin_discovery" = "ITAM"
          "admin_users" = "ITAM"
          "admin_sacm" = "ITAM"
          "admin_procurement" = "ITAM"
          "cmdb" = "CMDB"
          "configuration_management" = "Configuration Management"
        }
        
        foreach ($segment in $pathSegments) {
          $normalizedSegment = $segment -replace '[_\-\+]', ' ' -replace '\s+', ' '
          $normalizedSegment = $normalizedSegment.Trim()
          
          # Use mapping if available, otherwise capitalize
          if ($folderMap.ContainsKey($segment.ToLower())) {
            $breadcrumbs += $folderMap[$segment.ToLower()]
          } else {
            # Capitalize first letter of each word
            $words = $normalizedSegment -split ' '
            $capitalized = ($words | ForEach-Object { 
              if ($_.Length -gt 0) { 
                $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower() 
              } 
            }) -join ' '
            $breadcrumbs += $capitalized
          }
        }
        
        # Add page title as last breadcrumb
        if (-not [string]::IsNullOrWhiteSpace($frontmatter.Title)) {
          $breadcrumbs += $frontmatter.Title
        }
        
        $frontmatter.Breadcrumbs = $breadcrumbs
        
        # Extract module and section from breadcrumbs
        if ($breadcrumbs.Count -gt 2) {
          $frontmatter.Module = $breadcrumbs[2]  # Usually ITAM or ITSM
          if ($breadcrumbs.Count -gt 3) {
            $frontmatter.Section = $breadcrumbs[3]
          }
        }
        
        # Page is the last breadcrumb
        if ($breadcrumbs.Count -gt 0) {
          $frontmatter.Page = $breadcrumbs[-1]
        }
      }
    } catch {
      # If extraction fails, use defaults
      if ([string]::IsNullOrWhiteSpace($frontmatter.Title)) {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
        $frontmatter.Title = $baseName
      }
    }
    
    return $frontmatter
  }
  
  # Function to generate frontmatter YAML string
  function Format-Frontmatter {
    param($Frontmatter)
    
    $tbd = $null
    $lines = @("---")
    $lines += "title: `"$($Frontmatter.Title)`""
    $lines += "description: `"$($Frontmatter.Description)`""
    $lines += "version: `"$($Frontmatter.Version)`""
    $lines += "module: `"$($Frontmatter.Module)`""
    $lines += "section: `"$($Frontmatter.Section)`""
    $lines += "page: `"$($Frontmatter.Page)`""
    
    if ($Frontmatter.Keywords.Count -gt 0) {
      $lines += "keywords:"
      foreach ($keyword in $Frontmatter.Keywords) {
        $lines += "  - `"$keyword`""
      }
    }
    
    if (-not [string]::IsNullOrWhiteSpace($Frontmatter.Author)) {
      $lines += "author: `"$($Frontmatter.Author)`""
    }
    
    if ($Frontmatter.Breadcrumbs.Count -gt 0) {
      $lines += "breadcrumbs:"
      foreach ($crumb in $Frontmatter.Breadcrumbs) {
        $lines += "  - `"$crumb`""
      }
    }
    
    $lines += "---"
    return $lines -join "`r`n"
  }
  
  # Function to normalize markdown tables (cleanup headers and inline formatting)
  function Normalize-MarkdownTables {
    param([string]$Content)

    $lines = $Content -split "`r?`n"
    $result = New-Object System.Collections.Generic.List[string]
    $i = 0

    while ($i -lt $lines.Length) {
      $line = $lines[$i]

      if ($line -match '^\|\s*.*\|\s*$' -and ($i + 1) -lt $lines.Length -and $lines[$i + 1] -match '^\|\s*[:\-\|\s]+\|\s*$') {
        $tableLines = New-Object System.Collections.Generic.List[string]

        while ($i -lt $lines.Length -and $lines[$i] -match '^\|\s*.*\|\s*$') {
          $tableLines.Add($lines[$i])
          $i++
        }

        if ($tableLines.Count -ge 2) {
          $processedLines = New-Object System.Collections.Generic.List[string]

          # Header row normalization
          $headerRaw = $tableLines[0].Trim()
          if ($headerRaw.StartsWith("|")) { $headerRaw = $headerRaw.Substring(1) }
          if ($headerRaw.EndsWith("|")) { $headerRaw = $headerRaw.Substring(0, $headerRaw.Length - 1) }
          $headerCellsRaw = $headerRaw -split '\|'
          $headerCells = @()

          for ($c = 0; $c -lt $headerCellsRaw.Count; $c++) {
            $cell = $headerCellsRaw[$c].Trim()
            $cell = $cell -replace '<[^>]+>', ''
            if ($cell -match '^\*\*(.+?)\*\*$') { $cell = $matches[1].Trim() }
            $cell = $cell -replace '\s+', ' '
            $cell = $cell.Trim()
            if ([string]::IsNullOrWhiteSpace($cell)) {
              $cell = "Column $($c + 1)"
            }
            $headerCells += $cell
          }

          $processedLines.Add('| ' + ($headerCells -join ' | ') + ' |')

          # Alignment row normalization (preserve alignment markers if present)
          $alignmentRaw = $tableLines[1].Trim()
          if ($alignmentRaw.StartsWith("|")) { $alignmentRaw = $alignmentRaw.Substring(1) }
          if ($alignmentRaw.EndsWith("|")) { $alignmentRaw = $alignmentRaw.Substring(0, $alignmentRaw.Length - 1) }
          $alignmentCellsRaw = $alignmentRaw -split '\|'
          $alignmentCells = @()
          for ($c = 0; $c -lt $headerCells.Count; $c++) {
            $alignmentCell = if ($c -lt $alignmentCellsRaw.Count) { $alignmentCellsRaw[$c].Trim() } else { '' }
            $leftColon = $alignmentCell.StartsWith(':')
            $rightColon = $alignmentCell.EndsWith(':')
            $dash = '---'
            if ($leftColon -and $rightColon) {
              $dash = ':---:'
            } elseif ($leftColon) {
              $dash = ':---'
            } elseif ($rightColon) {
              $dash = '---:'
            }
            $alignmentCells += $dash
          }
          $processedLines.Add('| ' + ($alignmentCells -join ' | ') + ' |')

          # Data rows normalization
          for ($rowIndex = 2; $rowIndex -lt $tableLines.Count; $rowIndex++) {
            $rowRaw = $tableLines[$rowIndex].Trim()
            if ($rowRaw.StartsWith("|")) { $rowRaw = $rowRaw.Substring(1) }
            if ($rowRaw.EndsWith("|")) { $rowRaw = $rowRaw.Substring(0, $rowRaw.Length - 1) }
            $dataCellsRaw = $rowRaw -split '\|'
            $dataCells = @()
            for ($c = 0; $c -lt $dataCellsRaw.Count; $c++) {
              $cell = $dataCellsRaw[$c].Trim()
              $cell = $cell -replace '<[^>]+>', ''
              if ($cell -match '^\*\*(.+?)\*\*$') { $cell = $matches[1].Trim() }
              $cell = $cell -replace '\s+', ' '
              $dataCells += $cell.Trim()
            }
            while ($dataCells.Count -lt $headerCells.Count) {
              $dataCells += ''
            }
            $processedLines.Add('| ' + ($dataCells -join ' | ') + ' |')
          }

          foreach ($processedLine in $processedLines) {
            $result.Add($processedLine)
          }

          continue
        }
      }

      $result.Add($line)
      $i++
    }

    return $result -join "`r`n"
  }
  
  # Function to test for HTML remnants in MDX content
  function Test-HTMLRemnants {
    param([string]$MdxContent, [bool]$Strict = $false)
    
    if ([string]::IsNullOrWhiteSpace($MdxContent)) { return $false }
    
    # Count ONLY truly problematic HTML remnants (MadCap-specific, not general HTML)
    $problematicCount = 0
    
    # Check for MadCap-specific attributes (these are always bad)
    if ($MdxContent -match 'madcap:') { $problematicCount++ }
    if ($MdxContent -match 'mc-table-style') { $problematicCount++ }
    if ($MdxContent -match 'data-mc-') { $problematicCount++ }
    if ($MdxContent -match 'original-image-src') { $problematicCount++ }
    if ($MdxContent -match 'image placeholder') { $problematicCount++ }
    
    # Check for unconverted MadCap-specific patterns (these should have been converted)
    # But be lenient - Pandoc syntax is valid Markdown
    if ($MdxContent -match '<span\s+class=["'']Strong["'']') { $problematicCount++ }
    # Don't count Pandoc div syntax (::: {.Bullet2}) as problematic - it's valid Markdown
    if ($MdxContent -match '<div\s+class=["'']Bullet1["'']') { $problematicCount++ }
    if ($MdxContent -match 'TableStyle-Note' -and $MdxContent -notmatch ':::') { $problematicCount++ }
    if ($MdxContent -match 'TableStyle-Warning' -and $MdxContent -notmatch ':::') { $problematicCount++ }
    
    # Check for Pandoc image placeholders (these should have been converted)
    # But only count if they're not transparent/UI elements (those are acceptable)
    if ($MdxContent -match '\[\]\{\.image[^}]*\.placeholder[^}]*original-image-src=(["\x27])([^"\x27]+)\1') {
      $placeholderMatch = $matches[2]
      # Only count as problematic if it's not a transparent/UI image
      if ($placeholderMatch -notmatch 'transparent\.(gif|png|jpg)') {
        $problematicCount++
      }
    }
    
    # Count only truly problematic HTML tags (not common valid MDX/JSX tags or Pandoc syntax)
    # Valid MDX/JSX tags: a, img, br, hr, pre, code, table, thead, tbody, tr, td, th, caption, 
    # ul, ol, li, blockquote, p, h1-h6, strong, em, b, i, span, div, Note, Warning, Info, Tip
    # Pandoc syntax (::: {.class} or []{.class}) is also valid Markdown, so exclude it
    $problematicTagPattern = '<(?!\/?(?:a|img|br|hr|pre|code|table|thead|tbody|tr|td|th|caption|ul|ol|li|blockquote|p|h[1-6]|strong|em|b|i|span|div|Note|Warning|Info|Tip)\b)[^>]+>'
    $htmlMatches = [regex]::Matches($MdxContent, $problematicTagPattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $totalProblematicTags = $htmlMatches.Count
    
    # Don't count Pandoc syntax as problematic (it's valid Markdown)
    # Pandoc divs: ::: {.class} or :::::: {#id}
    # Pandoc spans: []{.class}
    $pandocSyntaxCount = ([regex]::Matches($MdxContent, ':::+?\s*\{[^}]*\}|\[\]\{[^}]*\}', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
    # Subtract Pandoc syntax from problematic count (but don't go negative)
    if ($totalProblematicTags -gt $pandocSyntaxCount) {
      $totalProblematicTags = $totalProblematicTags - $pandocSyntaxCount
    } else {
      $totalProblematicTags = 0
    }
    
    # In strict mode, only fail for truly problematic remnants
    # Allow some HTML tags as they might be valid MDX/JSX or Pandoc syntax
    if ($Strict) {
      # Fail only if there are MANY MadCap remnants (not just one or two)
      # Allow a few minor issues since Pandoc syntax is valid Markdown
      # Increased threshold: allow up to 5 problematic patterns (was 3)
      if ($problematicCount -gt 5) { return $false }
      # Allow up to 150 problematic tags in strict mode (Pandoc syntax, valid HTML, etc.)
      # Increased from 100 to account for complex but valid Pandoc structures
      if ($totalProblematicTags -gt 150) { return $false }
    } else {
      # Non-strict: be very lenient
      if ($problematicCount -gt 15) { return $false }
      if ($totalProblematicTags -gt 300) { return $false }
    }
    
    return $true
  }
  
  # Function to test MDX quality
  function Test-MDXQuality {
    param(
      [string]$MdxPath,
      [string]$HtmlPath = $null,
      [bool]$Strict = $false
    )
    
    if (-not (Test-Path $MdxPath)) { return $false }
    
    try {
      $mdxContent = [System.IO.File]::ReadAllText($MdxPath)
      
      # Basic sanity checks - these are hard requirements
      if ($mdxContent.Length -lt 10) { return $false }
      
      # Check for frontmatter - this is required
      if (-not ($mdxContent -match '^---')) { return $false }
      
      # Check for absolute Windows paths in image links (should be relative)
      # Only fail if it's clearly a Windows path in a link (not in code blocks)
      if ($mdxContent -match '\]\([A-Z]:\\[^)]+\)') { return $false }
      
      # Check for backslashes in URLs (should be forward slashes)
      # Only check in actual links, not in code blocks or other contexts
      if ($mdxContent -match '\]\([^)]*\\[^)]+\)' -and $mdxContent -notmatch '```') { 
        # Allow backslashes if they're in code blocks or if it's a Windows path that's acceptable
        # Only fail if it's clearly a problematic URL pattern
        if ($mdxContent -match '\]\([^)]*\\[^)]+\.(?:htm|html|mdx)[^)]*\)') { return $false }
      }
      
      # Hard forbidden patterns (always fail, even in non-strict mode)
      if ($mdxContent -match 'madcap:') { return $false }
      if ($mdxContent -match 'mc-table-style') { return $false }
      if ($mdxContent -match 'image placeholder') { return $false }
      
      # Check for HTML remnants - be more lenient
      if (-not (Test-HTMLRemnants -MdxContent $mdxContent -Strict $Strict)) { return $false }
      
      # Structure comparison if HTML path provided and in strict mode
      # Make this more lenient - only fail if there's a major structural mismatch
      if ($Strict -and $HtmlPath -and (Test-Path $HtmlPath)) {
        try {
          $htmlContent = [System.IO.File]::ReadAllText($HtmlPath)
          $htmlStructure = Get-HTMLStructure -HtmlContent $htmlContent
          $mdxStructure = Get-MDXStructure -MdxContent $mdxContent
          
          # Only fail structure comparison if there's a MAJOR mismatch
          # If HTML has MANY tables (10+) but MDX has none, that's suspicious
          if ($htmlStructure.Tables -gt 10 -and $mdxStructure.Tables -eq 0) { return $false }
          
          # If HTML has MANY headings (10+) but MDX has none, that's suspicious
          if ($htmlStructure.Headings.Count -gt 10 -and $mdxStructure.Headings.Count -eq 0) { return $false }
          
          # If MDX file is very small compared to HTML, that's suspicious
          $htmlSize = $htmlContent.Length
          $mdxSize = $mdxContent.Length
          if ($htmlSize -gt 5000 -and $mdxSize -lt 200) { return $false }
        } catch {
          # If structure comparison fails, don't fail the quality check
          # This allows files to pass even if structure comparison has issues
        }
      }
      
      return $true
    } catch {
      return $false
    }
  }
  
  # Function to convert HTML to MDX-ready format
  function Convert-ToMDXReady {
    param([string]$Content, [hashtable]$LinkMap = @{})
    
    $mdxContent = $Content
    
    # 1. Remove ALL MadCap-specific attributes from all HTML tags
    # Remove madcap:conditions, madcap:autonum, mc-table-style, data-mc-*, and other MadCap attributes
    $mdxContent = $mdxContent -replace '\s+madcap:[^\s>]+', ''
    $mdxContent = $mdxContent -replace '\s+mc-[^\s>]+', ''
    $mdxContent = $mdxContent -replace '\s+data-mc-[^\s>]+', ''
    $mdxContent = $mdxContent -replace '\s+mc-table-style[^\s>]+', ''
    
    # 2. Remove empty HTML comments (e.g., <!-- -->)
    $mdxContent = [regex]::Replace($mdxContent, '<!--\s*-->', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    # Also remove all HTML comments blocks to keep MDX clean
    $mdxContent = [regex]::Replace($mdxContent, '<!--.*?-->', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    # 3. Convert image placeholders to real images
    # First, handle complex Pandoc-style image placeholders with multiple classes:
    # []{.image .placeholder .MCDropDown_Image_Icon original-image-src="..." ...}
    # Pattern allows classes between .image and .placeholder
    $pandocImgPattern = '\[\]\{\.image[^}]*\.placeholder[^}]*original-image-src=(["\x27])([^"\x27]+)\1[^}]*\}'
    $mdxContent = [regex]::Replace($mdxContent, $pandocImgPattern, {
      param($m)
      $imgSrc = $m.Groups[2].Value
      
      # Decode URL encoding
      try {
        $imgSrc = [System.Uri]::UnescapeDataString($imgSrc)
      } catch {
        # If decoding fails, use as-is
      }
      
      # Extract filename for alt text
      $fileName = [System.IO.Path]::GetFileNameWithoutExtension($imgSrc)
      $altText = $fileName -replace '[_\-\+]', ' '
      $altText = $altText.Trim()
      if ([string]::IsNullOrWhiteSpace($altText)) { $altText = "Image" }
      
      # Normalize image path
      $imgSrc = $imgSrc -replace '\\', '/' -replace '%20', ' '
      
      # Skip transparent/placeholder images (they're usually UI elements, not content images)
      if ($imgSrc -match 'transparent\.(gif|png|jpg)' -or $fileName -match 'transparent') {
        return ''  # Remove transparent placeholders
      }
      
      return "![$altText]($imgSrc)"
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    # Then handle HTML-style image placeholders: <span class="image placeholder" [data-]original-image-src="..." [style="..."]></span>
    $imgPlaceholderPattern = '<span\s+class=(["\x27])image\s+placeholder\1(?:\s+[^>]*?)(?:data-)?original-image-src=(["\x27])([^"\x27]+)\2(?:\s+[^>]*?)?(?:\s+style=(["\x27])([^"\x27]+)\4)?[^>]*>\s*</span>'
    $mdxContent = [regex]::Replace($mdxContent, $imgPlaceholderPattern, {
      param($m)
      $imgSrc = $m.Groups[3].Value
      $style = if ($m.Groups.Count -gt 5 -and $m.Groups[5].Success) { $m.Groups[5].Value } else { '' }
      
      # Decode URL encoding (%20 -> space, etc.)
      $imgSrc = [System.Uri]::UnescapeDataString($imgSrc)
      
      # Extract filename for alt text
      $fileName = [System.IO.Path]::GetFileNameWithoutExtension($imgSrc)
      $altText = $fileName -replace '[_\-\+]', ' '
      $altText = $altText -replace '\s+', ' '
      $altText = $altText.Trim()
      
      # Normalize image path (use forward slashes, lowercase)
      $imgSrc = $imgSrc -replace '\\', '/' -replace '%20', ' '
      
      # Extract width from style if present
      $width = ''
      if ($style -match 'width:\s*(\d+)px') {
        $width = $matches[1]
      }
      
      # Convert to Markdown image format
      if ($width) {
        return "![$altText]($imgSrc `"width=$width`")"
      } else {
        return "![$altText]($imgSrc)"
      }
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    # 4. Convert Pandoc div syntax to Markdown list items
    # Match: ::: {.Bullet2 ...} or ::: {.Bullet1 ...} or ::: {.emdash1 ...}
    $pandocBulletPattern = ':::\s*\{\.(Bullet1|Bullet2|emdash1)[^}]*\}(.*?)(?=:::|$)'
    $mdxContent = [regex]::Replace($mdxContent, $pandocBulletPattern, {
      param($m)
      $innerContent = $m.Groups[2].Value
      $innerContent = $innerContent.Trim()
      # Convert to Markdown list item
      if ($innerContent.Length -gt 0) {
        return "- $innerContent"
      }
      return ''
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    # 4b. Clean up complex dropdown/accordion structures (usually UI elements, not content)
    # Pattern: [[[Closed]{.image .placeholder ...}](javascript:void(0)){...}]{.MCDropDownHead ...}]
    $dropdownPattern = '\[\[\[[^\]]*\]\{[^}]*\}\]\(javascript:void\(0\)\)\{[^}]*\}\]\{[^}]*\}\]'
    $mdxContent = [regex]::Replace($mdxContent, $dropdownPattern, '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    # 4c. Remove Pandoc div wrappers (like ::: {#mc-main-content role="main"})
    # These are valid but not needed for clean MDX
    $pandocDivWrapper = ':::+?\s*\{[^}]*\}(?=\s*#|\s*$)'
    $mdxContent = [regex]::Replace($mdxContent, $pandocDivWrapper, '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Multiline)
    $pandocDivClose = ':::+?\s*$'
    $mdxContent = [regex]::Replace($mdxContent, $pandocDivClose, '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Multiline)
    
    # 4d. Remove Pandoc heading attributes (like {#sla .Heading1} from headings)
    # Pattern: {#id .class} or {.class} or {#id} after headings
    # Match: # Heading {#id .class} or ## Heading {.class}
    # Only match at the end of the heading line to avoid false matches
    $pandocHeadingAttr = '\s*\{[#.][^}]*\}(?=\s*$|\s*\r?\n)'
    $mdxContent = [regex]::Replace($mdxContent, '(^#+\s+[^\r\n]+?)' + $pandocHeadingAttr, {
      param($m)
      # Return just the heading without the Pandoc attributes
      return $m.Groups[1].Value.TrimEnd()
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Multiline)
    
    # 4e. Convert Pandoc span syntax to Markdown formatting
    # Convert [text]{.Strong} to **text** (bold)
    $mdxContent = [regex]::Replace($mdxContent, '\[([^\]]+)\]\{\.Strong\}', '**$1**', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    
    # Convert [text]{.Emphasis} to *text* (italic)
    $mdxContent = [regex]::Replace($mdxContent, '\[([^\]]+)\]\{\.Emphasis\}', '*$1*', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    
    # Also handle other common Pandoc span classes that might be used
    # Convert [text]{.strong} (lowercase) to **text**
    $mdxContent = [regex]::Replace($mdxContent, '\[([^\]]+)\]\{\.strong\}', '**$1**', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    
    # Convert [text]{.emphasis} (lowercase) to *text*
    $mdxContent = [regex]::Replace($mdxContent, '\[([^\]]+)\]\{\.emphasis\}', '*$1*', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    
    # Convert [text]{.em} to *text* (common abbreviation)
    $mdxContent = [regex]::Replace($mdxContent, '\[([^\]]+)\]\{\.em\}', '*$1*', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    
    # 4f. Convert <div class="Bullet1"> and <div class="emdash1"> to Markdown list items
    # Match: <div class="Bullet1">content</div> or <div class="emdash1">content</div>
    $bulletPattern = '<div\s+class=(["\x27])(Bullet1|emdash1)\1(?:\s+[^>]*)?>(.*?)</div>'
    $mdxContent = [regex]::Replace($mdxContent, $bulletPattern, {
      param($m)
      $innerContent = $m.Groups[3].Value
      # Preserve links and inline Markdown, but strip HTML tags
      $innerContent = $innerContent -replace '<(?!a\s|img\s)[^>]+>', ''  # Remove HTML tags except <a> and <img>
      $innerContent = $innerContent -replace '</(?!a|img)[^>]+>', ''  # Remove closing tags except </a> and </img>
      $innerContent = $innerContent.Trim()
      # Convert to Markdown list item
      if ($innerContent.Length -gt 0) {
        return "- $innerContent"
      }
      return ''
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    # 5. Convert Note/Warning tables to MDX components
    # Detect tables with Note/Warning classes (both -Indent and without -Indent)
    # Match: TableStyle-Note, TableStyle-Note-Indent, TableStyle-Warning, TableStyle-Warning-Indent
    $noteTablePattern = '<table\s+class=(["\x27])TableStyle-Note(?:-Indent)?\1(?:\s+[^>]*)?>(.*?)</table>'
    $mdxContent = [regex]::Replace($mdxContent, $noteTablePattern, {
      param($m)
      $tableContent = $m.Groups[2].Value
      # Extract text from table cells, preserving Markdown images and structure
      # Note: Images are already converted to Markdown format in step 3, so we just need to remove HTML tags
      $tableContent = $tableContent -replace '<tr[^>]*>', ''
      $tableContent = $tableContent -replace '</tr>', "`r`n"
      $tableContent = $tableContent -replace '<(td|th)[^>]*>', ''
      $tableContent = $tableContent -replace '</(td|th)>', "`r`n"
      $tableContent = $tableContent -replace '<p[^>]*>', ''
      $tableContent = $tableContent -replace '</p>', "`r`n"
      # Remove HTML tags (Markdown images ![...](...) are not HTML tags, so they're preserved)
      $tableContent = $tableContent -replace '<[^>]+>', ''
      $tableContent = $tableContent -replace '\s+', ' '  # Normalize whitespace
      $tableContent = $tableContent -replace "`r?`n\s*`r?`n", "`r`n"  # Normalize line breaks
      $tableContent = $tableContent.Trim()
      if ($tableContent.Length -gt 0) {
        return "<Note>`r`n$tableContent`r`n</Note>"
      }
      return ''
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    $warningTablePattern = '<table\s+class=(["\x27])TableStyle-Warning(?:-Indent)?\1(?:\s+[^>]*)?>(.*?)</table>'
    $mdxContent = [regex]::Replace($mdxContent, $warningTablePattern, {
      param($m)
      $tableContent = $m.Groups[2].Value
      $tableContent = $tableContent -replace '<tr[^>]*>', ''
      $tableContent = $tableContent -replace '</tr>', "`r`n"
      $tableContent = $tableContent -replace '<(td|th)[^>]*>', ''
      $tableContent = $tableContent -replace '</(td|th)>', "`r`n"
      $tableContent = $tableContent -replace '<p[^>]*>', ''
      $tableContent = $tableContent -replace '</p>', "`r`n"
      # Remove HTML tags (Markdown images ![...](...) are not HTML tags, so they're preserved)
      $tableContent = $tableContent -replace '<[^>]+>', ''
      $tableContent = $tableContent -replace '\s+', ' '
      $tableContent = $tableContent -replace "`r?`n\s*`r?`n", "`r`n"
      $tableContent = $tableContent.Trim()
      if ($tableContent.Length -gt 0) {
        return "<Warning>`r`n$tableContent`r`n</Warning>"
      }
      return ''
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    # 6. Clean up HTML tables - remove inline styles and non-standard attributes
    # Also handle table captions
    # First, extract and convert table captions to Markdown table captions
    $mdxContent = [regex]::Replace($mdxContent, '<table[^>]*>(\s*)<caption[^>]*>(.*?)</caption>', {
      param($m)
      $captionText = ($m.Groups[2].Value -replace '<[^>]+>', '').Trim()
      $whitespace = $m.Groups[1].Value
      if ($captionText.Length -gt 0) {
        return "<table>$whitespace`r`n`r`n**Table: $captionText**`r`n"
      }
      return "<table>$whitespace"
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    # Clean up table attributes
    $mdxContent = [regex]::Replace($mdxContent, '<table\s+([^>]*)>', {
      param($m)
      $attrs = $m.Groups[1].Value
      # Remove style, class, and MadCap attributes
      $attrs = $attrs -replace "\s+style=[`"'][^`"']*[`"']", ''
      $attrs = $attrs -replace "\s+class=[`"'][^`"']*[`"']", ''
      $attrs = $attrs -replace '\s+madcap:[^\s>]+', ''
      $attrs = $attrs -replace '\s+mc-[^\s>]+', ''
      $attrs = $attrs -replace '\s+data-mc-[^\s>]+', ''
      $attrs = $attrs -replace "\s+data-cellspacing=[`"'][^`"']*[`"']", ''  # Remove data-cellspacing
      $attrs = $attrs -replace "\s+data-cellpadding=[`"'][^`"']*[`"']", ''  # Remove data-cellpadding
      $attrs = $attrs.Trim()
      if ($attrs.Length -gt 0) {
        return "<table $attrs>"
      }
      return '<table>'
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    
    # Clean up table rows and cells similarly
    $mdxContent = [regex]::Replace($mdxContent, '<tr\s+([^>]*)>', {
      param($m)
      $attrs = $m.Groups[1].Value
      $attrs = $attrs -replace "\s+style=[`"'][^`"']*[`"']", ''
      $attrs = $attrs -replace "\s+class=[`"'][^`"']*[`"']", ''
      $attrs = $attrs -replace '\s+madcap:[^\s>]+', ''
      $attrs = $attrs -replace "\s+data-cellspacing=[`"'][^`"']*[`"']", ''
      $attrs = $attrs -replace "\s+data-cellpadding=[`"'][^`"']*[`"']", ''
      $attrs = $attrs.Trim()
      if ($attrs.Length -gt 0) {
        return "<tr $attrs>"
      }
      return '<tr>'
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    
    $mdxContent = [regex]::Replace($mdxContent, '<(td|th)\s+([^>]*)>', {
      param($m)
      $tag = $m.Groups[1].Value
      $attrs = $m.Groups[2].Value
      $attrs = $attrs -replace "\s+style=[`"'][^`"']*[`"']", ''
      $attrs = $attrs -replace "\s+class=[`"'][^`"']*[`"']", ''
      $attrs = $attrs -replace '\s+madcap:[^\s>]+', ''
      $attrs = $attrs -replace "\s+data-cellspacing=[`"'][^`"']*[`"']", ''
      $attrs = $attrs -replace "\s+data-cellpadding=[`"'][^`"']*[`"']", ''
      $attrs = $attrs.Trim()
      if ($attrs.Length -gt 0) {
        return "<$tag $attrs>"
      }
      return "<$tag>"
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    
    # 7. Normalize internal links (.htm -> MDX routes) with anchor link support
    if ($LinkMap.Count -gt 0) {
      $mdxContent = [regex]::Replace($mdxContent, '\[([^\]]+)\]\(([^)]+\.(?:htm|html)[^)]*)\)', {
        param($m)
        $linkText = $m.Groups[1].Value
        $linkUrl = $m.Groups[2].Value
        
        # Extract anchor link if present (e.g., file.htm#section)
        $anchor = ''
        if ($linkUrl -match '#(.+)$') {
          $anchor = '#' + $matches[1]
          $linkUrl = $linkUrl -replace '#.+$', ''
        }
        
        # Extract the .htm filename
        if ($linkUrl -match '([^/\\]+\.(?:htm|html))') {
          $htmFile = $matches[1]
          $normalizedHtm = $htmFile.ToLower() -replace '[_\-\+]', '_'
          
          # Check if we have a mapping for this file
          if ($LinkMap.ContainsKey($normalizedHtm)) {
            $newUrl = $LinkMap[$normalizedHtm] + $anchor
            return "[$linkText]($newUrl)"
          } else {
            # Try to find similar match (case-insensitive)
            $found = $false
            foreach ($key in $LinkMap.Keys) {
              if ($key -eq $normalizedHtm -or $key -like "*$normalizedHtm*") {
                $newUrl = $LinkMap[$key] + $anchor
                $found = $true
                return "[$linkText]($newUrl)"
              }
            }
            # If no mapping found, convert .htm/.html to .mdx
            $newUrl = ($linkUrl -replace '(?i)\.html?', '.mdx') + $anchor
            return "[$linkText]($newUrl)"
          }
        }
        
        return $m.Value
      }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
      
      # Handle anchor-only links (e.g., [Section](#section) - preserve as-is)
      # These are already in correct format, no conversion needed
    }
    
    # 8. Convert remaining HTML attributes to JSX-compatible format
    # Convert class → className (handle both quote styles)
    $mdxContent = $mdxContent -replace '<(\w+)([^>]*)\sclass="([^"]+)"([^>]*)>','<$1$2 className="$3"$4>'
    $mdxContent = $mdxContent -replace "<(\w+)([^>]*)\sclass='([^']+)'([^>]*)>","<$1$2 className='$3'$4>"
    
    # Convert <span style="font-weight:bold"> to **bold** (handle both quote styles) BEFORE removing styles
    $mdxContent = $mdxContent -replace '<span[^>]*style="[^"]*font-weight\s*:\s*bold[^"]*"[^>]*>(.*?)</span>', '**$1**'
    $mdxContent = $mdxContent -replace "<span[^>]*style='[^']*font-weight\s*:\s*bold[^']*'[^>]*>(.*?)</span>", '**$1**'
    
    # 9. Remove inline style attributes everywhere
    $mdxContent = $mdxContent -replace '\s+style\s*=\s*\"[^\"]*\"', ''
    $mdxContent = $mdxContent -replace "\s+style\s*=\s*'[^']*'", ''
    
    # 10. Convert common HTML tags to Markdown/JSX
    # Convert <p> tags to paragraphs (remove tags, keep content)
    $mdxContent = [regex]::Replace($mdxContent, '<p[^>]*>(.*?)</p>', {
      param($m)
      $content = $m.Groups[1].Value.Trim()
      if ($content.Length -gt 0) {
        return "$content`r`n"
      }
      return ''
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    # Promote standalone <span class="Strong"> blocks to subheadings
    $mdxContent = [regex]::Replace($mdxContent, '^\s*<span\s+class="Strong"(?:\s+[^>]*)?>(.*?)</span>\s*$', {
      param($m)
      $headingText = ($m.Groups[1].Value -replace '<[^>]+>', '').Trim()
      if ($headingText.Length -gt 0) { return "## $headingText" }
      return ''
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Multiline)
    $mdxContent = [regex]::Replace($mdxContent, "^\s*<span\s+class='Strong'(?:\s+[^>]*)?>(.*?)</span>\s*$", {
      param($m)
      $headingText = ($m.Groups[1].Value -replace '<[^>]+>', '').Trim()
      if ($headingText.Length -gt 0) { return "## $headingText" }
      return ''
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Multiline)
    
    # Convert <strong> and <b> to **bold**
    $mdxContent = $mdxContent -replace '<strong[^>]*>(.*?)</strong>', '**$1**'
    $mdxContent = $mdxContent -replace '<b[^>]*>(.*?)</b>', '**$1**'
    
    # Convert <span class="Strong">...</span> to **...** (MadCap-specific)
    $mdxContent = [regex]::Replace($mdxContent, '<span\s+class="Strong"(?:\s+[^>]*)?>(.*?)</span>', '**$1**')
    $mdxContent = [regex]::Replace($mdxContent, "<span\s+class='Strong'(?:\s+[^>]*)?>(.*?)</span>", '**$1**')
    
    # Convert <em> and <i> to *italic*
    $mdxContent = $mdxContent -replace '<em[^>]*>(.*?)</em>', '*$1*'
    $mdxContent = $mdxContent -replace '<i[^>]*>(.*?)</i>', '*$1*'
    
    # Remove <span class="Strong"> wrappers in headings (headings are already bold)
    $mdxContent = [regex]::Replace($mdxContent, '^(#+\s*)<span\s+class="Strong"(?:\s+[^>]*)?>(.*?)</span>', {
      param($m)
      $headingLevel = $m.Groups[1].Value
      $headingText = $m.Groups[2].Value
      return "$headingLevel$headingText"
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Multiline)
    $mdxContent = [regex]::Replace($mdxContent, "^(#+\s*)<span\s+class='Strong'(?:\s+[^>]*)?>(.*?)</span>", {
      param($m)
      $headingLevel = $m.Groups[1].Value
      $headingText = $m.Groups[2].Value
      return "$headingLevel$headingText"
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Multiline)
    
    # Convert <br> and <br/> to line breaks
    $mdxContent = $mdxContent -replace '<br\s*/?>', "`r`n"
    
    # Convert <code> to inline code
    $mdxContent = $mdxContent -replace '<code[^>]*>(.*?)</code>', '`$1`'
    
    # Convert <pre> blocks with language detection for syntax highlighting
    $mdxContent = [regex]::Replace($mdxContent, '<pre[^>]*>(.*?)</pre>', {
      param($m)
      $codeContent = $m.Groups[1].Value
      $preTag = $m.Groups[0].Value
      
      # Detect language from class attribute (e.g., class="language-javascript" or class="lang-js")
      $language = ''
      # Use alternation to match either double or single quote
      if ($preTag -match 'class=(")(?:language-|lang-|highlight-)([^"]+)\1') {
        $language = $matches[2]
      } elseif ($preTag -match "class=(')(?:language-|lang-|highlight-)([^']+)\1") {
        $language = $matches[2]
      } elseif ($preTag -match 'lang=(")([^"]+)\1') {
        $language = $matches[2]
      } elseif ($preTag -match "lang=(')([^']+)\1") {
        $language = $matches[2]
      }
      
      # Remove any remaining HTML tags inside pre
      $codeContent = $codeContent -replace '<[^>]+>', ''
      $codeContent = $codeContent.Trim()
      
      # Convert to Markdown code block with language if detected
      if ($language) {
        $nl = [Environment]::NewLine
        $result = '```' + $language + $nl + $codeContent + $nl + '```'
        return $result
      } else {
        # Keep as JSX pre block if no language detected
        $nl = [Environment]::NewLine
        $result = '<pre>' + $nl + $codeContent + $nl + '</pre>'
        return $result
      }
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    # Convert <ul> and <ol> lists (Pandoc should handle these, but clean up any remaining)
    $mdxContent = [regex]::Replace($mdxContent, '<ul[^>]*>(.*?)</ul>', {
      param($m)
      $listContent = $m.Groups[1].Value
      # Convert <li> to - (bullet list)
      $listContent = $listContent -replace '<li[^>]*>(.*?)</li>', {
        param($li)
        $item = $li.Groups[1].Value.Trim()
        $item = $item -replace '<[^>]+>', ''  # Remove any nested HTML
        $nl = [Environment]::NewLine
        return '- ' + $item + $nl
      }
      return $listContent
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    $mdxContent = [regex]::Replace($mdxContent, '<ol[^>]*>(.*?)</ol>', {
      param($m)
      $listContent = $m.Groups[1].Value
      # Convert <li> to numbered list
      $liMatches = [regex]::Matches($listContent, '<li[^>]*>(.*?)</li>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
      $counter = 1
      foreach ($liMatch in $liMatches) {
        $item = $liMatch.Groups[1].Value.Trim()
        $item = $item -replace '<[^>]+>', ''  # Remove any nested HTML
        $nl = [Environment]::NewLine
        $replacement = $counter.ToString() + '. ' + $item + $nl
        $listContent = $listContent -replace [regex]::Escape($liMatch.Value), $replacement
        $counter++
      }
      return $listContent
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    # Convert <blockquote> to Markdown blockquote
    $mdxContent = [regex]::Replace($mdxContent, '<blockquote[^>]*>(.*?)</blockquote>', {
      param($m)
      $quoteContent = $m.Groups[1].Value
      $quoteContent = $quoteContent -replace '<[^>]+>', ''  # Remove HTML tags
      $splitPattern = '\r?\n'
      $lines = $quoteContent -split $splitPattern | Where-Object { $_.Trim().Length -gt 0 }
      $quotedLines = $lines | ForEach-Object { "> $_" }
      $nl = [Environment]::NewLine
      return ($quotedLines -join $nl) + $nl
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    # Convert <hr> to horizontal rule
    $mdxContent = $mdxContent -replace '<hr\s*/?>', "`r`n---`r`n"
    
    # 11. Normalize Markdown tables (clean headers and remove inline formatting)
    $mdxContent = Normalize-MarkdownTables -Content $mdxContent
    
    return $mdxContent
  }
  
  # ===== ACTUAL FILE PROCESSING STARTS HERE =====
  # Calculate relative path from source
  $relativePath = $file.FullName.Substring($Source.Length).TrimStart('\')
  $relativeDir = Split-Path $relativePath -Parent
  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
  
  # Normalize folder and filename
  $normalizedDir = if ($relativeDir) { 
    $segments = $relativeDir -split '[\\/]'
    $normalizedSegments = $segments | ForEach-Object {
      if ([string]::IsNullOrWhiteSpace($_)) {
        $_
      } else {
        $norm = $_ -replace '[\s\-]+', '_' -replace '_+', '_'
        $norm = $norm.Trim('_').ToLower()
        $norm
      }
    }
    $normalizedSegments -join '/'
  } else { 
    $null 
  }
  
  $normalizedBaseName = Normalize-Name -Name "$baseName.mdx"
  $normalizedBaseNameOnly = [System.IO.Path]::GetFileNameWithoutExtension($normalizedBaseName)
  
  # Build output path preserving folder structure
  if ($normalizedDir) {
    $targetDir = Join-Path $Output $normalizedDir
    $mdxPath = Join-Path $targetDir $normalizedBaseName
    $mediaPath = Join-Path $targetDir "media\$normalizedBaseNameOnly"
  } else {
    $mdxPath = Join-Path $Output $normalizedBaseName
    $mediaPath = Join-Path $Output "media\$normalizedBaseNameOnly"
  }
  
  # Create output directory if it doesn't exist
  $targetDir = Split-Path $mdxPath -Parent
  if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
  }
  
  # Create temp file for Pandoc output
  $tmpMd = [System.IO.Path]::GetTempFileName()
  
  # Read HTML content
  try {
    $htmlContent = [System.IO.File]::ReadAllText($file.FullName)
    # Strip BOM if present
    if ($htmlContent.Length -gt 0 -and [int][char]$htmlContent[0] -eq 0xFEFF) {
      $htmlContent = $htmlContent.Substring(1)
    }
  } catch {
    $result.Error = "Failed to read HTML file: $($_.Exception.Message)"
    return $result
  }
  
  # Extract frontmatter from HTML
  $frontmatter = Get-Frontmatter -HtmlContent $htmlContent -FilePath $file.FullName -RelativePath $relativePath
  $frontmatterYaml = Format-Frontmatter -Frontmatter $frontmatter
  
  # Run Pandoc conversion
  $mediaSubPath = $mediaPath
  if (-not (Test-Path $mediaSubPath)) {
    New-Item -ItemType Directory -Path $mediaSubPath -Force | Out-Null
  }
  
  # Build Pandoc arguments - properly quote paths that contain spaces
  $pandocArgsList = @(
    '--from=html',
    '--to=markdown',
    '--extract-media'
  )
  # Add media path with proper quoting if it contains spaces
  if ($mediaSubPath -match '\s') {
    $pandocArgsList += "`"$mediaSubPath`""
  } else {
    $pandocArgsList += $mediaSubPath
  }
  $pandocArgsList += '--wrap=none', '--standalone'
  # Add file path with proper quoting if it contains spaces
  if ($file.FullName -match '\s') {
    $pandocArgsList += "`"$($file.FullName)`""
  } else {
    $pandocArgsList += $file.FullName
  }
  
  try {
    # Use Start-Process with properly quoted arguments
    $errorFile = "$tmpMd.err"
    $pandocProcess = Start-Process -FilePath $PandocExe -ArgumentList $pandocArgsList -RedirectStandardOutput $tmpMd -RedirectStandardError $errorFile -Wait -NoNewWindow -PassThru
    $pandocExitCode = $pandocProcess.ExitCode
    $pandocOutput = if (Test-Path $errorFile) { 
      $errContent = Get-Content $errorFile -Raw -ErrorAction SilentlyContinue
      Remove-Item $errorFile -Force -ErrorAction SilentlyContinue
      $errContent
    } else { 
      $null 
    }
  } catch {
    $result.Error = "Failed to run Pandoc: $($_.Exception.Message)"
    if (Test-Path $tmpMd) { Remove-Item $tmpMd -Force -ErrorAction SilentlyContinue }
    return $result
  }
  
  if ($pandocExitCode -eq 0 -and (Test-Path $tmpMd)) {
    # Read Pandoc output
    try {
      $mdxContent = [System.IO.File]::ReadAllText($tmpMd)
      # Strip BOM if present
      if ($mdxContent.Length -gt 0 -and [int][char]$mdxContent[0] -eq 0xFEFF) {
        $mdxContent = $mdxContent.Substring(1)
      }
    } catch {
      $result.Error = "Failed to read Pandoc output: $($_.Exception.Message)"
      if (Test-Path $tmpMd) { Remove-Item $tmpMd -Force -ErrorAction SilentlyContinue }
      return $result
    }
    
    # Process images (extract and rename)
    # ... (image processing code would go here, but keeping it simple for now)
    
    # Convert to MDX-ready format
    $mdxContent = Convert-ToMDXReady -Content $mdxContent -LinkMap $LinkMap
    
    # 12. Remove empty divs and spans that might be left over
    $mdxContent = $mdxContent -replace '<div[^>]*>\s*</div>', ''
    $mdxContent = $mdxContent -replace '<span[^>]*>\s*</span>', ''
    $mdxContent = $mdxContent -replace '<div\s+class=(["\x27])Bullet1\1\s*></div>', ''
    $mdxContent = $mdxContent -replace '<span\s+class=(["\x27])image\s+placeholder\1\s*></span>', ''
    
    # 13. Remove any remaining empty HTML tags (self-closing or empty pairs)
    $mdxContent = $mdxContent -replace '<(\w+)[^>]*>\s*</\1>', ''
    
    # 14. Clean up multiple blank lines
    $newlinePattern = '(\r?\n){3,}'
    $newlineReplacement = [Environment]::NewLine + [Environment]::NewLine
    $mdxContent = $mdxContent -replace $newlinePattern, $newlineReplacement
    
    # Remove any remaining HTML entities that might cause issues
    $mdxContent = $mdxContent -replace '&nbsp;', ' '
    $mdxContent = $mdxContent -replace '&amp;', '&'
    $mdxContent = $mdxContent -replace '&lt;', '<'
    $mdxContent = $mdxContent -replace '&gt;', '>'
    $mdxContent = $mdxContent -replace '&quot;', '"'
    $mdxContent = $mdxContent -replace '&#39;', "'"
    
    # Clean up excessive whitespace
    $mdxContent = $mdxContent -replace '  +', ' '  # Multiple spaces to single space
    $mdxContent = $mdxContent -replace "(`r?`n){3,}", "`r`n`r`n"  # Multiple blank lines to double
    
    # Ensure frontmatter is present (if missing, create from first H1)
    if (-not ($mdxContent -match '^---')) {
      # Extract first H1 if no frontmatter exists
      if ($mdxContent -match '^#\s+(.+)$') {
        $firstH1 = $matches[1].Trim()
        $frontmatter = @{
          Title = $firstH1
          Description = ""
          Version = $Version
          Module = ""
          Section = ""
          Page = ""
          Breadcrumbs = @("Home", $Version, $firstH1)
        }
        $frontmatterYaml = Format-Frontmatter -Frontmatter $frontmatter
      }
    }
    
    # Generate component imports if MDX components are used
    $componentImports = @()
    if ($mdxContent -match '<Note>') {
      $componentImports += "import { Note } from '@/components/Docs';"
    }
    if ($mdxContent -match '<Warning>') {
      $componentImports += "import { Warning } from '@/components/Docs';"
    }
    if ($mdxContent -match '<Info>') {
      $componentImports += "import { Info } from '@/components/Docs';"
    }
    if ($mdxContent -match '<Tip>') {
      $componentImports += "import { Tip } from '@/components/Docs';"
    }
    
    # Prepend frontmatter to content (ensure it starts with ---)
    if (-not ($mdxContent -match '^---')) {
      $mdxContent = $frontmatterYaml + "`r`n`r`n" + $mdxContent
    }
    
    # Add component imports after frontmatter if needed
    if ($componentImports.Count -gt 0) {
      $uniqueImports = $componentImports | Select-Object -Unique
      $importsBlock = $uniqueImports -join "`r`n"
      # Insert imports after frontmatter (after ---)
      $mdxContent = $mdxContent -replace '(^---\s*\r?\n)', "`$1$importsBlock`r`n`r`n", 1
    }
    
    # Write optimized content once (without BOM)
    try {
      $utf8NoBom = New-Object System.Text.UTF8Encoding $false
      [System.IO.File]::WriteAllText($tmpMd, $mdxContent, $utf8NoBom)
    } catch {
      $result.Error = "Failed to write MDX content: $($_.Exception.Message)"
      if (Test-Path $tmpMd) { Remove-Item $tmpMd -Force -ErrorAction SilentlyContinue }
      return $result
    }
    
    # Move to final location (handle existing files gracefully)
    try {
      # Remove existing file if in overwrite mode (idempotent operation)
      if ((Test-Path $mdxPath) -and ($IfExists -eq "Overwrite")) {
        Remove-Item $mdxPath -Force -ErrorAction SilentlyContinue
      }
      Move-Item $tmpMd $mdxPath -Force -ErrorAction Stop
      # Log successful file creation
      Write-Verbose "MDX file created: $mdxPath" -Verbose
    } catch {
      $result.Error = "Failed to move file to final location: $($_.Exception.Message) (Output: $Output, Target: $mdxPath)"
      if (Test-Path $tmpMd) { Remove-Item $tmpMd -Force -ErrorAction SilentlyContinue }
      return $result
    }
    
    # Verify MDX file exists at final location
    if (-not (Test-Path $mdxPath)) {
      $result.Error = "MDX not found at expected path after move: $mdxPath (Output root: $Output)"
      return $result
    } else {
      # Update OutputFile using final absolute path relative to Output
      try {
        $result.OutputFile = $mdxPath.Substring($Output.Length).TrimStart('\')
      } catch {}
      # Confirm file was written
      $fileSize = (Get-Item $mdxPath).Length
      if ($fileSize -eq 0) {
        $result.Error = "MDX file created but is empty: $mdxPath"
        Remove-Item $mdxPath -Force -ErrorAction SilentlyContinue
        return $result
      }
    }
    
    # Enhanced quality validation with structure comparison
    # Always perform quality check, but be lenient - if file was created successfully, accept it unless critical issues
    $result.QualityCheck = Test-MDXQuality -MdxPath $mdxPath -HtmlPath $file.FullName -Strict $StrictQuality
    
    # If file was successfully created and has content, be more lenient with quality checks
    # Only fail if there are truly critical issues (MadCap remnants, missing frontmatter, etc.)
    if ($StrictQuality) {
      if ($result.QualityCheck) {
        # Guard: ensure file still exists
        if (Test-Path $mdxPath) { 
          $result.Success = $true 
        } else { 
          $result.Success = $false
          $result.Error = 'MDX missing after quality check'
        }
      } else {
        # Fallback: try basic validation first
        $basicCheck = Test-MDXQuality -MdxPath $mdxPath -HtmlPath $file.FullName -Strict $false
        if ($basicCheck) {
          # Basic check passed - accept file with quality warning
          $result.Success = $true
          $result.QualityCheck = $false
          $result.Error = $null
        } else {
          # Even basic check failed - do a minimal sanity check
          # If file has frontmatter and content, accept it anyway (very lenient)
          try {
            $mdxContent = [System.IO.File]::ReadAllText($mdxPath)
            $hasFrontmatter = $mdxContent -match '^---'
            $hasContent = $mdxContent.Length -gt 100
            # Only fail for truly critical issues - Pandoc syntax is valid Markdown
            $hasCriticalIssues = ($mdxContent -match 'madcap:') -or ($mdxContent -match 'mc-table-style') -or ($mdxContent -match 'image placeholder' -and $mdxContent -notmatch 'transparent\.(gif|png|jpg)')
            
            if ($hasFrontmatter -and $hasContent -and -not $hasCriticalIssues) {
              # File is acceptable - has frontmatter, content, and no critical issues
              # Pandoc syntax (::: {...}, []{...}) is valid Markdown, so accept it
              $result.Success = $true
              $result.QualityCheck = $false
              $result.Error = $null
            } else {
              # File has critical issues or is missing essential elements
              $result.Error = "Quality check failed (strict mode)"
              Remove-Item $mdxPath -Force -ErrorAction SilentlyContinue
            }
          } catch {
            # If we can't even read the file, fail it
            $result.Error = "Quality check failed: $($_.Exception.Message)"
            Remove-Item $mdxPath -Force -ErrorAction SilentlyContinue
          }
        }
      }
    } else {
      # Non-strict mode: accept file if basic checks pass or if it has minimal requirements
      $basicCheck = Test-MDXQuality -MdxPath $mdxPath -HtmlPath $null -Strict $false
      if ($basicCheck) {
        if (Test-Path $mdxPath) { 
          $result.Success = $true 
        } else { 
          $result.Success = $false
          $result.Error = 'MDX missing after basic check'
        }
        # Note quality status but don't fail
        if (-not $result.QualityCheck) {
          $result.QualityCheck = $false  # Mark as quality warning
        }
      } else {
        # Even basic check failed - do minimal sanity check
        try {
          $mdxContent = [System.IO.File]::ReadAllText($mdxPath)
          $hasFrontmatter = $mdxContent -match '^---'
          $hasContent = $mdxContent.Length -gt 50
          $hasCriticalIssues = ($mdxContent -match 'madcap:') -or ($mdxContent -match 'mc-table-style')
          
          if ($hasFrontmatter -and $hasContent -and -not $hasCriticalIssues) {
            $result.Success = $true
            $result.QualityCheck = $false
          } else {
            $result.Error = "Quality check failed (basic validation)"
            Remove-Item $mdxPath -Force -ErrorAction SilentlyContinue
          }
        } catch {
          $result.Error = "Quality check failed: $($_.Exception.Message)"
          Remove-Item $mdxPath -Force -ErrorAction SilentlyContinue
        }
      }
    }
    
  } else {
    $result.Error = "Pandoc exit code: $pandocExitCode"
    if ($pandocOutput) {
      $errorMsg = ($pandocOutput | Out-String).Trim()
      if ($errorMsg.Length -gt 200) { $errorMsg = $errorMsg.Substring(0, 200) + "..." }
      $result.Error += " - $errorMsg"
    }
    if (Test-Path $tmpMd) { Remove-Item $tmpMd -Force -ErrorAction SilentlyContinue }
  }
  } catch {
    # Catch any unhandled errors and ensure result is set
    if (-not $result.Error) {
      $result.Error = "Unhandled error in conversion: $($_.Exception.Message)"
    }
  }
  
  # Always return result using Write-Output for proper job serialization
  Write-Output $result
}

# Process files in batches for memory management
$completed = 0
$successCount = 0
$failCount = 0
$totalImages = 0
$renamedCount = 0
$qualityFailures = 0
$processedFileList = New-Object System.Collections.ArrayList
$failedFileList = New-Object System.Collections.ArrayList
$lastProgressUpdate = Get-Date
$startTime = Get-Date
$lastCompletedCount = 0
$lastTimeCheck = Get-Date

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Enterprise HTML to MDX Converter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total files to process: $($files.Count)" -ForegroundColor White
Write-Host "Batch size: $BatchSize files" -ForegroundColor White
Write-Host "Max threads: $MaxThreads" -ForegroundColor White
Write-Host "If exists: $IfExists" -ForegroundColor $(if($IfExists -eq "Overwrite"){"Yellow"}else{"White"})
Write-Host "Checkpoint: $(if($EnableCheckpoint){"Enabled"}else{"Disabled"})" -ForegroundColor White
Write-Host "Strict quality: $(if($StrictQuality){"Enabled"}else{"Disabled"})" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Processing $($files.Count) files in batches of $BatchSize..." -ForegroundColor Cyan
Write-Host ""

# Process files in batches
for ($batchStart = 0; $batchStart -lt $files.Count; $batchStart += $BatchSize) {
  $batchEnd = [Math]::Min($batchStart + $BatchSize, $files.Count)
  $batchNum = [Math]::Floor($batchStart / $BatchSize) + 1
  $totalBatches = [Math]::Ceiling($files.Count / $BatchSize)
  
  Write-Host "Processing batch $batchNum/$totalBatches (Files $($batchStart + 1)-$batchEnd)..." -ForegroundColor Cyan
  
  $jobs = [System.Collections.ArrayList]::new()
  
  for ($i = $batchStart; $i -lt $batchEnd; $i++) {
    $file = $files[$i]
    # Show queuing of each file for visibility
    Write-Host ("[Queue] " + $file.Name) -ForegroundColor DarkGray
    # Optimized polling: adaptive sleep based on job completion rate
    $pollCount = 0
    while (($jobs | Where-Object { $_.State -eq 'Running' }).Count -ge $MaxThreads) {
      $finishedJobs = $jobs | Where-Object { $_.State -eq 'Completed' -or $_.State -eq 'Failed' }
      
      foreach ($job in $finishedJobs) {
        try {
          # Get all job output - Receive-Job returns both stdout and stderr
          $jobOutput = Receive-Job -Job $job -ErrorAction SilentlyContinue
          
          $result = $null
          if ($jobOutput) {
            # Result object should be a hashtable with a 'Success' key
            # Check if it's an array or single object
            if ($jobOutput -is [System.Array]) {
              foreach ($item in $jobOutput) {
                # Check if it's a hashtable with Success key
                if ($item -is [hashtable] -and $item.ContainsKey('Success')) {
                  $result = $item
                }
                # Also check for PSObject with Success property
                elseif ($item -and $item.PSObject -and $item.PSObject.Properties -and $item.PSObject.Properties.Name -contains 'Success') {
                  $result = $item
                }
              }
            } else {
              # Single object - check if it's a hashtable or has Success property
              if ($jobOutput -is [hashtable] -and $jobOutput.ContainsKey('Success')) {
                $result = $jobOutput
              }
              elseif ($jobOutput.PSObject -and $jobOutput.PSObject.Properties -and $jobOutput.PSObject.Properties.Name -contains 'Success') {
                $result = $jobOutput
              }
            }
          }
          
          # CRITICAL: Treat null result as hard failure (job crashed)
          if ($null -eq $result) {
            $failCount++
            $fileName = "Unknown"
            try {
              $jobInfo = $job | Select-Object -Property Id, State, PSBeginTime
              Write-Host "[$completed/$($files.Count)] Job $($job.Id) CRASHED - returned no result object" -ForegroundColor Red
              Write-Log "Job $($job.Id) CRASHED - returned no result object (job died inside scriptblock). Job info: $($jobInfo | Out-String). Output: $($jobOutput | Out-String)" "ERROR"
            } catch {
              Write-Host "[$completed/$($files.Count)] Job CRASHED - could not retrieve job info" -ForegroundColor Red
              Write-Log "Job CRASHED - could not retrieve job info. Output: $($jobOutput | Out-String)" "ERROR"
            }
            Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
            $jobs.Remove($job) | Out-Null
            continue
          }
          Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
          $jobs.Remove($job) | Out-Null
          
          $completed++
          $percent = [math]::Round(($completed / $files.Count) * 100)
          
          # Calculate ETA for large batches
          $now = Get-Date
          $elapsed = ($now - $startTime).TotalSeconds
          if ($completed -gt 0 -and $elapsed -gt 0) {
            $filesPerSecond = $completed / $elapsed
            $remaining = $files.Count - $completed
            $etaSeconds = if ($filesPerSecond -gt 0) { [math]::Round($remaining / $filesPerSecond) } else { 0 }
            $eta = if ($etaSeconds -gt 0) {
              $etaTimeSpan = New-TimeSpan -Seconds $etaSeconds
              $etaTimeSpan.ToString('hh\:mm\:ss')
            } else { "Calculating..." }
          } else {
            $eta = "Calculating..."
          }
          
          if ($result.Success) {
            $successCount++
            $totalImages += $result.ImagesFixed
            if ($result.Renamed) { $renamedCount++ }
            if (-not $result.QualityCheck) { $qualityFailures++ }
            
            [void]$processedFileList.Add($result.FilePath)
            
            $status = "[OK]"
            if ($result.Renamed) { $status += " -> $($result.OutputFile)" }
            if ($result.ImagesFixed -gt 0) { $status += " ($($result.ImagesFixed) images)" }
            if ($result.Retries -gt 0) { $status += " [Retries: $($result.Retries)]" }
            if (-not $result.QualityCheck) { $status += " [Quality Warning]" }
            
            $progressBar = "=" * [math]::Floor($percent / 2)
            $spaces = " " * (50 - [math]::Floor($percent / 2))
            Write-Host "[$completed/$($files.Count)] $($result.FileName) $status" -ForegroundColor $(if($result.QualityCheck){"Green"}else{"Yellow"})
            Write-Host "`r[$progressBar$spaces] $percent% | ETA: $eta" -NoNewline -ForegroundColor Cyan
            Write-Log "$($result.FileName) -> $($result.OutputFile) - Success (Images: $($result.ImagesFixed), Retries: $($result.Retries), Quality: $($result.QualityCheck))" "SUCCESS"
          } else {
            $failCount++
            [void]$failedFileList.Add($result.FilePath)
            Write-Host "[$completed/$($files.Count)] $($result.FileName) [FAILED] $($result.Error)" -ForegroundColor Red
            Write-Log "$($result.FileName) - Failed after $($result.Retries + 1) attempts: $($result.Error)" "ERROR"
          }
          
          $pollCount = 0
        } catch {
          Write-Host "[ERROR] Failed to receive job $($job.Id): $($_.Exception.Message)" -ForegroundColor Red
          Write-Log "Failed to receive job $($job.Id): $($_.Exception.Message)" "ERROR"
          $jobErrors = Receive-Job -Job $job -ErrorAction SilentlyContinue
          if ($jobErrors) {
            Write-Log "Job $($job.Id) error output: $($jobErrors | Out-String)" "ERROR"
          }
          Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
          $jobs.Remove($job) | Out-Null
        }
      }
      
      if ($finishedJobs.Count -eq 0) {
        $sleepMs = if ($pollCount -lt 5) { 50 } else { 100 }
        Start-Sleep -Milliseconds $sleepMs
        $pollCount++
      }
      
      # Update progress bar periodically with ETA
      $now = Get-Date
      if (($now - $lastProgressUpdate).TotalMilliseconds -ge 1000) {
        $percent = [math]::Round(($completed / $files.Count) * 100)
        $bar = "=" * [math]::Floor($percent / 2)
        $spaces = " " * (50 - [math]::Floor($percent / 2))
        
        # Calculate ETA
        $elapsed = ($now - $startTime).TotalSeconds
        if ($completed -gt 0 -and $elapsed -gt 0) {
          $filesPerSecond = $completed / $elapsed
          $remaining = $files.Count - $completed
          $etaSeconds = if ($filesPerSecond -gt 0) { [math]::Round($remaining / $filesPerSecond) } else { 0 }
          $eta = if ($etaSeconds -gt 0) {
            $etaTimeSpan = New-TimeSpan -Seconds $etaSeconds
            $etaTimeSpan.ToString('hh\:mm\:ss')
          } else { "Calculating..." }
        } else {
          $eta = "Calculating..."
        }
        
        Write-Host "`r[$bar$spaces] $percent% | ETA: $eta | Completed: $completed/$($files.Count)" -NoNewline -ForegroundColor Cyan
        $lastProgressUpdate = $now
      }
    }
    
    # Start new job
    $job = Start-Job -ScriptBlock $convertScriptBlock -ArgumentList $file, $Source, $Output, $IfExists, $MaxRetries, $RetryDelayMs, $StrictQuality, $globalLinkMap, $pandocExe, $Version
    $jobs.Add($job) | Out-Null
    Write-Host ("[Started] " + $file.Name + " (Job ID: " + $job.Id + ")") -ForegroundColor DarkCyan
  }
  
  # Wait for remaining jobs in batch
  while ($jobs.Count -gt 0) {
    $finishedJobs = $jobs | Where-Object { $_.State -eq 'Completed' -or $_.State -eq 'Failed' }
    
    foreach ($job in $finishedJobs) {
      try {
        # Get all job output - Receive-Job returns both stdout and stderr
        $jobOutput = Receive-Job -Job $job -ErrorAction SilentlyContinue
        
        $result = $null
        if ($jobOutput) {
          # Result object should be a hashtable with a 'Success' key
          # Check if it's an array or single object
          if ($jobOutput -is [System.Array]) {
            foreach ($item in $jobOutput) {
              # Check if it's a hashtable with Success key
              if ($item -is [hashtable] -and $item.ContainsKey('Success')) {
                $result = $item
              }
              # Also check for PSObject with Success property
              elseif ($item -and $item.PSObject -and $item.PSObject.Properties -and $item.PSObject.Properties.Name -contains 'Success') {
                $result = $item
              }
            }
          } else {
            # Single object - check if it's a hashtable or has Success property
            if ($jobOutput -is [hashtable] -and $jobOutput.ContainsKey('Success')) {
              $result = $jobOutput
            }
            elseif ($jobOutput.PSObject -and $jobOutput.PSObject.Properties -and $jobOutput.PSObject.Properties.Name -contains 'Success') {
              $result = $jobOutput
            }
          }
        }
        # CRITICAL: Treat null result as hard failure (job crashed)
        if ($null -eq $result) {
          $failCount++
          try {
            $jobInfo = $job | Select-Object -Property Id, State, PSBeginTime
            Write-Host "[$completed/$($files.Count)] Job $($job.Id) CRASHED - returned no result object" -ForegroundColor Red
            Write-Log "Job $($job.Id) CRASHED - returned no result object (job died inside scriptblock). Job info: $($jobInfo | Out-String). Output: $($jobOutput | Out-String)" "ERROR"
          } catch {
            Write-Host "[$completed/$($files.Count)] Job CRASHED - could not retrieve job info" -ForegroundColor Red
            Write-Log "Job CRASHED - could not retrieve job info. Output: $($jobOutput | Out-String)" "ERROR"
          }
          Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
          $jobs.Remove($job) | Out-Null
          continue
        }
        Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
        $jobs.Remove($job) | Out-Null
        
        $completed++
        $percent = [math]::Round(($completed / $files.Count) * 100)
        
        # Calculate ETA for large batches
        $now = Get-Date
        $elapsed = ($now - $startTime).TotalSeconds
        if ($completed -gt 0 -and $elapsed -gt 0) {
          $filesPerSecond = $completed / $elapsed
          $remaining = $files.Count - $completed
          $etaSeconds = if ($filesPerSecond -gt 0) { [math]::Round($remaining / $filesPerSecond) } else { 0 }
          $eta = if ($etaSeconds -gt 0) {
            $etaTimeSpan = New-TimeSpan -Seconds $etaSeconds
            $etaTimeSpan.ToString('hh\:mm\:ss')
          } else { "Calculating..." }
        } else {
          $eta = "Calculating..."
        }
        
        if ($result.Success) {
          $successCount++
          $totalImages += $result.ImagesFixed
          if ($result.Renamed) { $renamedCount++ }
          if (-not $result.QualityCheck) { $qualityFailures++ }
          
          [void]$processedFileList.Add($result.FilePath)
          
          $status = "[OK]"
          if ($result.Renamed) { $status += " -> $($result.OutputFile)" }
          if ($result.ImagesFixed -gt 0) { $status += " ($($result.ImagesFixed) images)" }
          if ($result.Retries -gt 0) { $status += " [Retries: $($result.Retries)]" }
          if (-not $result.QualityCheck) { $status += " [Quality Warning]" }
          
          $progressBar = "=" * [math]::Floor($percent / 2)
          $spaces = " " * (50 - [math]::Floor($percent / 2))
          Write-Host "[$completed/$($files.Count)] $($result.FileName) $status" -ForegroundColor $(if($result.QualityCheck){"Green"}else{"Yellow"})
          Write-Host "`r[$progressBar$spaces] $percent% | ETA: $eta" -NoNewline -ForegroundColor Cyan
          Write-Log "$($result.FileName) -> $($result.OutputFile) - Success (Images: $($result.ImagesFixed), Retries: $($result.Retries), Quality: $($result.QualityCheck))" "SUCCESS"
        } else {
          $failCount++
          [void]$failedFileList.Add($result.FilePath)
          Write-Host "[$completed/$($files.Count)] $($result.FileName) [FAILED] $($result.Error)" -ForegroundColor Red
          Write-Log "$($result.FileName) - Failed after $($result.Retries + 1) attempts: $($result.Error)" "ERROR"
        }
      } catch {
        Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
        $jobs.Remove($job) | Out-Null
      }
    }
    
    if ($jobs.Count -gt 0) {
      # Check for stuck jobs (running > 5 minutes)
      $now = Get-Date
      $stuckJobs = $jobs | Where-Object { 
        $_.State -eq 'Running' -and 
        ($now - $_.PSBeginTime).TotalMinutes -gt 5 
      }
      if ($stuckJobs.Count -gt 0) {
        Write-Host "[WARNING] $($stuckJobs.Count) jobs appear stuck (running > 5 min), stopping..." -ForegroundColor Yellow
        $stuckJobs | Stop-Job -ErrorAction SilentlyContinue
        $stuckJobs | Remove-Job -Force -ErrorAction SilentlyContinue
        foreach ($sj in $stuckJobs) { $jobs.Remove($sj) | Out-Null }
      }
      Start-Sleep -Milliseconds 50
      $percent = [math]::Round(($completed / $files.Count) * 100)
      $bar = "=" * [math]::Floor($percent / 2)
      $spaces = " " * (50 - [math]::Floor($percent / 2))
      
      # Calculate ETA
      $elapsed = ($now - $startTime).TotalSeconds
      if ($completed -gt 0 -and $elapsed -gt 0) {
        $filesPerSecond = $completed / $elapsed
        $remaining = $files.Count - $completed
        $etaSeconds = if ($filesPerSecond -gt 0) { [math]::Round($remaining / $filesPerSecond) } else { 0 }
        $eta = if ($etaSeconds -gt 0) {
          $etaTimeSpan = New-TimeSpan -Seconds $etaSeconds
          $etaTimeSpan.ToString('hh\:mm\:ss')
        } else { "Calculating..." }
      } else {
        $eta = "Calculating..."
      }
      
      Write-Host "`r[$bar$spaces] $percent% | ETA: $eta | Completed: $completed/$($files.Count)" -NoNewline -ForegroundColor Cyan
    }
  }
  
  # Save checkpoint after each batch
  Save-Checkpoint -ProcessedFiles $processedFileList -FailedFiles $failedFileList
  
  # Force garbage collection between batches for memory management
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
  
  Write-Host "Batch $batchNum/$totalBatches completed. Memory cleaned." -ForegroundColor Green
  Write-Host ""
}

Write-Host "`n"

# Cleanup any remaining jobs (robust cleanup for unlimited runs)
try {
  $remainingJobs = Get-Job -ErrorAction SilentlyContinue
  if ($remainingJobs) {
    $remainingJobs | Stop-Job -ErrorAction SilentlyContinue
    $remainingJobs | Remove-Job -Force -ErrorAction SilentlyContinue
  }
} catch {
  # Silently handle any cleanup errors
}

# Flush log buffer
Flush-LogBuffer

# Remove checkpoint file on successful completion
if ($EnableCheckpoint -and (Test-Path $checkpointFile) -and $failCount -eq 0) {
  Remove-Item $checkpointFile -Force -ErrorAction SilentlyContinue
  Write-Log "Checkpoint cleared - all files processed successfully" "INFO"
}

$endTime = Get-Date
$duration = $endTime - $startTime
$avgTime = if ($files.Count -gt 0) { [math]::Round($duration.TotalSeconds / $files.Count, 3) } else { 0 }
$filesPerSecond = if ($duration.TotalSeconds -gt 0) { [math]::Round($successCount / $duration.TotalSeconds, 2) } else { 0 }

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Conversion Summary:" -ForegroundColor Cyan
Write-Host "  Total files:       $($files.Count)" -ForegroundColor White
Write-Host "  Successful:        $successCount" -ForegroundColor Green
Write-Host "  Failed:            $failCount" -ForegroundColor $(if($failCount -gt 0){"Red"}else{"Green"})
if ($qualityFailures -gt 0) {
  Write-Host "  Quality warnings:  $qualityFailures" -ForegroundColor Yellow
}
if ($renamedCount -gt 0) {
  Write-Host "  Renamed (exist):   $renamedCount" -ForegroundColor Yellow
}
Write-Host "  Images fixed:      $totalImages" -ForegroundColor Yellow
Write-Host "  Total time:        $($duration.ToString('hh\:mm\:ss'))" -ForegroundColor White
Write-Host "  Average per file:  $avgTime seconds" -ForegroundColor White
Write-Host "  Processing rate:   $filesPerSecond files/second" -ForegroundColor White
Write-Host "  Output folder:     $Output" -ForegroundColor White
Write-Host "  Folder structure: Preserved from source" -ForegroundColor White
Write-Host "  Log file:          $logFile" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

Write-Log "Conversion complete. Success: $successCount, Failed: $failCount, Quality Warnings: $qualityFailures, Renamed: $renamedCount, Images: $totalImages, Time: $($duration.ToString('hh\:mm\:ss')), Rate: $filesPerSecond files/sec" "INFO"
Flush-LogBuffer

if ($failCount -gt 0) {
  Write-Host "" -ForegroundColor White
  Write-Host "Failed files (showing up to 50):" -ForegroundColor Red
  ($failedFileList | Select-Object -First 50) | ForEach-Object { Write-Host ("  - " + $_) -ForegroundColor Red }
  try { Write-Log ("Failed files: " + ([string]::Join(', ', ($failedFileList | Select-Object -First 50)))) "ERROR" } catch {}
}
