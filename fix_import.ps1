$file = "src\pages\AdminPanel.js"

# Read raw bytes
$bytes = [System.IO.File]::ReadAllBytes($file)

Write-Host "Total bytes:" $bytes.Length
Write-Host "First 10 bytes:" ($bytes[0..9] -join ' ')

# Strip ALL leading BOM occurrences (EF BB BF) - loop until none left
$start = 0
while ($start + 2 -lt $bytes.Length -and $bytes[$start] -eq 0xEF -and $bytes[$start + 1] -eq 0xBB -and $bytes[$start + 2] -eq 0xBF) {
    $start += 3
    Write-Host "Stripped one BOM at offset" ($start - 3)
}

Write-Host "Final start offset:" $start

# Decode actual content from that offset as UTF-8
$utf8 = New-Object System.Text.UTF8Encoding($false)
$content = $utf8.GetString($bytes, $start, $bytes.Length - $start)

# Sanity check: first char should be 'i' for 'import'
Write-Host "First 30 chars:" $content.Substring(0, [Math]::Min(30, $content.Length))

# Write back as UTF-8 without BOM
[System.IO.File]::WriteAllText($file, $content, $utf8)
Write-Host "Done. Length:" $content.Length
