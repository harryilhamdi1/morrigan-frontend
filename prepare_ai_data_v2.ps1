$files = @("Wave 1 2024.csv", "Wave 2 2024.csv", "Wave 3 2024.csv", "Wave 1 2025.csv", "Wave 2 2025.csv")
$finalData = @()
$ignores = @("tidak ada", "tdkada", "sudah bagus", "cukup", "baik", "oke", "ok", "aman", "tidak", "gak ada", "ngga ada", "ga ada", "bagus", "keren", "mantap", "memuaskan", "sangat baik", "tidak ada komentar", "belum ada", "semua baik", "good", "-", "n/a", "na", ".", "...", "...")

foreach ($file in $files) {
    if (Test-Path "CSV\$file") {
        # Using Import-Csv handles quoted multiline fields correctly
        $data = Import-Csv -Path "CSV\$file" -Delimiter ';'
        $headerNames = $data[0].psobject.Properties.Name
        # The feedback column is usually the last one or named "Informasikan hal-hal..."
        $feedbackCol = $headerNames | Where-Object { $_ -like "*Informasikan hal-hal yang dirasakan*" } | Select-Object -First 1
        $idCol = $headerNames[0] # Usually the first column is Review Number
        $siteCol = $headerNames[1] # Usually the second is Site Code
        
        foreach ($row in $data) {
            $id = $row.$idCol
            $site = $row.$siteCol
            $feedback = $row.$feedbackCol
            
            if ($feedback -and $feedback.Trim().Length -gt 3) {
               $val = $feedback.Trim()
               $lowerF = $val.ToLower() -replace '[^a-z]', ''
               
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
                       SiteCode = $site
                       Feedback = $val
                   }
               }
            }
        }
    }
}

$finalData | ConvertTo-Json -Depth 5 | Out-File -FilePath "records_to_classify_v2.json" -Encoding utf8
$finalData.Count
