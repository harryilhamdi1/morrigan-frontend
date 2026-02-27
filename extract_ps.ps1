$files = @("Wave 1 2024.csv", "Wave 2 2024.csv", "Wave 3 2024.csv", "Wave 1 2025.csv", "Wave 2 2025.csv")
$results = New-Object System.Collections.Generic.HashSet[string]
$ignores = @("tidak ada", "tdkada", "sudah bagus", "cukup", "baik", "oke", "ok", "aman", "tidak", "gak ada", "ngga ada", "ga ada", "bagus", "keren", "mantap", "memuaskan", "sangat baik", "tidak ada komentar", "belum ada", "semua baik", "good", "-", "n/a", "na", ".", "...", "...")

foreach ($file in $files) {
    if (Test-Path "CSV\$file") {
        $reader = [System.IO.File]::OpenText("CSV\$file")
        $isFirst = $true
        while($null -ne ($line = $reader.ReadLine())) {
            if ($isFirst) { $isFirst = $false; continue }
            $columns = $line -split ';'
            # Column index for "Informasikan hal-hal yang dirasakan..." is usually at the very end
            $feedback = $columns[-1].Trim()
            $feedback = $feedback -replace '^"|"$', ''
            if ($feedback -notmatch "^\(759291\)") {
               $lowerF = $feedback.ToLower() -replace '[^a-z]', ''
               if ($lowerF.Length -lt 3) { continue }
               
               $shouldIgnore = $false
               foreach ($ignore in $ignores) {
                   if ($lowerF -eq ($ignore -replace '[^a-z]', '')) {
                       $shouldIgnore = $true
                       break
                   }
               }
               if (-not $shouldIgnore) {
                   [void]$results.Add($feedback)
               }
            }
        }
        $reader.Close()
    }
}

$results | ConvertTo-Json -Depth 10 | Out-File -FilePath "raw_feedbacks.json" -Encoding utf8
$results.Count
