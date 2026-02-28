$file = "src\pages\AdminPanel.js"
$enc1252 = [System.Text.Encoding]::GetEncoding(1252)
$utf8 = [System.Text.Encoding]::UTF8

# Read with Windows-1252
$bytes = [System.IO.File]::ReadAllBytes($file)
$content = $enc1252.GetString($bytes)

$importLine = "import { DashboardSection, UsersSection, BlogSection, SettingsSection } from './AdminSections';" + [Environment]::NewLine

if ($content -notlike "*AdminSections*") {
    $content = $importLine + $content
    Write-Host "Import added"
} else {
    Write-Host "Import already exists"
}

# Remove placeholder if it exists
$content = $content -replace "// PLACEHOLDER_FOR_SECTIONS`r`n", ""
$content = $content -replace "// PLACEHOLDER_FOR_SECTIONS`n", ""

[System.IO.File]::WriteAllText($file, $content, $utf8)
Write-Host "Done! Length:" $content.Length
