@echo off
echo ========================================
echo Bulk Word to Markdown Converter
echo ========================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0bulk-convert-docx-to-md.ps1"
echo.
echo Press any key to exit...
pause >nul

