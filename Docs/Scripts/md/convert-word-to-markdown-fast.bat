@echo off
echo ========================================
echo Fast Bulk Word to Markdown Converter
echo ========================================
echo.
echo Processing with parallel threads...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0bulk-convert-docx-to-md-fast.ps1"
echo.
echo Conversion complete! Check the log file for details.
echo.
echo Press any key to exit...
pause >nul

