param(
  [string]$Source = "C:\Docs\Word",
  [string]$Output = "C:\Docs\Markdown"
)

function New-SafeName([string]$name) {
  $n = $name -replace '\+','_'
  # optional: normalize any odd chars too (uncomment next line if needed)
  # $n = $n -replace '[^A-Za-z0-9._ -]','_'
  return $n
}

New-Item -ItemType Directory -Path $Output -Force | Out-Null
$temp = Join-Path $Output "_tmp_docx"
New-Item -ItemType Directory -Path $temp -Force | Out-Null

# Try Word COM once (fastest). If not available, we'll try LibreOffice later per-file.
$wordApp = $null
try { $wordApp = New-Object -ComObject Word.Application } catch {}

$files = Get-ChildItem $Source -Recurse -File | Where-Object {
  $_.Extension -in (".doc", ".docx")
}

foreach ($f in $files) {
  try {
    $base     = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
    $safeBase = New-SafeName $base

    # 1) Ensure we have a .docx to feed Pandoc
    $docxPath = $null
    if ($f.Extension -ieq ".docx") {
      if ($safeBase -ne $base) {
        $docxPath = Join-Path $temp ($safeBase + ".docx")
        Copy-Item $f.FullName $docxPath -Force
      } else {
        $docxPath = $f.FullName
      }
    } else {
      # .doc → .docx
      $docxPath = Join-Path $temp ($safeBase + ".docx")
      if ($wordApp) {
        $doc = $wordApp.Documents.Open($f.FullName, $false, $true)
        $wdFormatXMLDocument = 16
        $doc.SaveAs($docxPath, $wdFormatXMLDocument)
        $doc.Close($false)
      } else {
        # Fallback to LibreOffice if Word is not installed
        $soffice = Get-Command soffice -ErrorAction SilentlyContinue
        if (-not $soffice) {
          Write-Warning "No Word COM and no LibreOffice found. Skipping: $($f.FullName)"
          continue
        }
        & $soffice.Source "soffice" "--headless" "--convert-to" "docx" "--outdir" $temp $f.FullName | Out-Null
        if (-not (Test-Path $docxPath)) {
          Write-Warning "LibreOffice failed to convert: $($f.FullName)"
          continue
        }
      }
    }

    # 2) Build MD output paths
    $relDir    = Split-Path ($f.FullName.Substring($Source.Length).TrimStart('\')) -Parent
    $targetDir = if ($relDir) { Join-Path $Output $relDir } else { $Output }
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

    $mdPath    = Join-Path $targetDir ($safeBase + ".md")
    $mediaDir  = Join-Path $targetDir ("media\" + $safeBase)
    New-Item -ItemType Directory -Path $mediaDir -Force | Out-Null

    # Avoid accidental overwrite by timestamping duplicates
    if (Test-Path $mdPath) {
      $stamp  = (Get-Date).ToString("yyyyMMddHHmmss")
      $mdPath = Join-Path $targetDir ($safeBase + "_" + $stamp + ".md")
      $mediaDir  = Join-Path $targetDir ("media\" + $safeBase + "_" + $stamp)
      New-Item -ItemType Directory -Path $mediaDir -Force | Out-Null
    }

    # 3) Pandoc to GFM Markdown
    pandoc -s $docxPath -t gfm -o $mdPath --extract-media=$mediaDir

    # 4) Normalize image/link paths for VS Code preview
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

    Write-Host "OK: $($f.Name) -> $mdPath"
  } catch {
    Write-Warning "Failed: $($f.FullName) - $($_.Exception.Message)"
  }
}

if ($wordApp) { $wordApp.Quit() }