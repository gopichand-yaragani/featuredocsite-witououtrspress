@echo off
echo ========================================
echo Enterprise HTML to MDX Converter
echo Enhanced Mode (2500+ Files)
echo ========================================
echo.
echo Running with enterprise features enabled:
echo   - Overwrite mode: Existing MDX files will be replaced
echo   - Strict quality validation
echo   - Checkpoint/resume capability
echo   - Optimized batch processing (200 files per batch)
echo   - Enhanced retry mechanism (4 retries)
echo   - Auto-scaling threads based on CPU/Memory
echo   - Preserves folder structure from source
echo   - Preserves original image filenames
echo   - Filename normalization: spaces/hyphens to single underscore, lowercase
echo   - MDX files: _6_1 suffix before .mdx extension
echo   - MDX-ready conversion: removes MadCap attributes; converts HTML tags to Markdown/MDX
echo   - Frontmatter generation: extracts title, description, breadcrumbs
echo   - Converts image placeholders to real images
echo   - Converts Bullet1 divs to Markdown list items
echo   - Converts Note/Warning tables to MDX components (^<Note^>, ^<Warning^>)
echo   - Link normalization: converts .htm links to MDX routes
echo   - Cleans up HTML tables (removes inline styles, MadCap attributes, data-cellspacing, data-cellpadding)
echo   - Converts class to className; removes inline styles
echo   - Enhanced validation: checks for frontmatter, MadCap attributes, .htm links
echo   - BOM stripping: removes UTF-8 BOM characters from files
echo   - HTML cleanup: aggressively removes remaining HTML syntax
echo   - Converts common HTML tags (p, div, span, strong, em, etc.) to Markdown
echo   - Removes empty HTML comments left by Flare (^<!-- --^>)
echo   - Converts ^<span class="Strong"^> to Markdown (promotes standalone spans to headings)
echo   - Removes Pandoc heading attributes (e.g., {#id .class} from headings)
echo   - Converts Pandoc span syntax: [text]{.Strong} to **text** (bold)
echo   - Converts Pandoc span syntax: [text]{.Emphasis} to *text* (italic)
echo   - Converts ^<div class="Bullet1"^> and ^<div class="emdash1"^> to list items
echo   - Converts TableStyle-Note and TableStyle-Warning tables to MDX components
echo   - Converts image placeholders (original-image-src, data-original-image-src) to real images
echo   - Normalizes heading structure (only one H1 per file, subsequent H1s become H2)
echo   - Normalizes Markdown tables (headers, alignment, removes HTML spans from cells)
echo   - Removes all MadCap attributes: madcap:*, mc-table-style, data-mc-*, data-cellspacing, data-cellpadding
echo   - Validates MDX quality: detects unclosed tags, HTML remnants, validates all conversions
echo   - Post-processing: removes orphaned HTML tags, cleans up entities, normalizes whitespace
echo   - Ensures frontmatter is always present in every MDX file (creates from H1 if missing)
echo   - ENTERPRISE FEATURES:
echo     * Anchor link support: preserves #section links in converted MDX routes
echo     * Code block language detection: auto-detects syntax highlighting languages
echo     * Table caption conversion: converts ^<caption^> tags to Markdown table captions
echo     * Component import generation: auto-generates imports for MDX components (Note, Warning, etc.)
echo     * Enhanced metadata extraction: extracts keywords, author from HTML meta tags
echo   - Robust error handling for unlimited runs
echo   - Idempotent operations (safe to run multiple times)
echo   - Default source: C:\Docs\html\Content
echo   - Default output: C:\Docs\MDX
echo.
echo NOTE: On re-run, existing MDX files will be overwritten
echo       with fresh conversions from the HTML source files.
echo       Script is designed to handle unlimited runs safely.
echo.

set "SRC=%~1"
if "%SRC%"=="" set "SRC=C:\Docs\html\Content"
set "OUT=%~2"
if "%OUT%"=="" set "OUT=C:\Docs\MDX"

REM Pre-check: Ensure Pandoc is available
where pandoc >nul 2>&1
if errorlevel 1 (
  if exist "C:\Program Files\Pandoc\pandoc.exe" (
    echo Found Pandoc at default path.
  ) else (
    echo ERROR: Pandoc is not installed or not on PATH.
    echo Download and install Pandoc, then re-run: https://pandoc.org/installing.html
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
  )
)

REM Optional: warn if source folder is missing
if not exist "%SRC%" (
  echo WARNING: Source folder not found: %SRC%
  echo Update -Source in the PowerShell call or create the folder.
  echo Continuing anyway...
  echo.
)

powershell -NoProfile -NoLogo -ExecutionPolicy Bypass -File "%~dp0bulk-convert-html-to-mdx-fast.ps1" -Source "%SRC%" -Output "%OUT%" -StrictQuality -EnableCheckpoint -BatchSize 200 -MaxRetries 4 -IfExists Overwrite
echo.
echo Conversion complete! Check the log file for details.
echo.
echo Press any key to exit...
pause >nul

