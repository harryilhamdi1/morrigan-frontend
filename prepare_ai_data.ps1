$files = @("Wave 1 2024.csv", "Wave 2 2024.csv", "Wave 3 2024.csv", "Wave 1 2025.csv", "Wave 2 2025.csv")
$finalData = @()
$ignores = @("tidak ada", "tdkada", "sudah bagus", "cukup", "baik", "oke", "ok", "aman", "tidak", "gak ada", "ngga ada", "ga ada", "bagus", "keren", "mantap", "memuaskan", "sangat baik", "tidak ada komentar", "belum ada", "semua baik", "good", "-", "n/a", "na", ".", "...", "...")

foreach ($file in $files) {
    if (Test-Path "CSV\$file") {
        $reader = [System.IO.File]::OpenText("CSV\$file")
        $isFirst = $true
        while($null -ne ($line = $reader.ReadLine())) {
            if ($isFirst) { $isFirst = $false; continue }
            $columns = $line -split ';'
            if ($columns.Count -lt 10) { continue }
            
            $id = $columns[0].Trim()
            $siteCode = $columns[1].Trim()
            $feedback = $columns[-1].Trim()
            $feedback = $feedback -replace '^"|"$', ''
            
            if ($feedback -notmatch "^\(759291\)" -and $feedback.Length -gt 3) {
               $lowerF = $feedback.ToLower() -replace '[^a-z]', ''
               $shouldIgnore = $false
               foreach ($ignore in $ignores) {
                   if ($lowerF -eq ($ignore -replace '[^a-z]', '')) {
                       $shouldIgnore = $true
                       break
                   }
               }
               if (-not $shouldIgnore) {
                   $finalData += [PSCustomObject]@{
                       ID = $id
                       Wave = $file -replace '.csv', ''
                       SiteCode = $siteCode
                       Feedback = $feedback
                   }
               }
            }
        }
        $reader.Close()
    }
}

$finalData | ConvertTo-Json -Depth 5 | Out-File -FilePath "records_to_classify.json" -Encoding utf8
$finalData.Count
