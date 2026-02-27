$feedbacks = Get-Content "raw_feedbacks.json" -Raw | ConvertFrom-Json

$categories = @{
    "Service" = @("ramah", "sapa", "senyum", "pelayanan", "melayani", "cuek", "jutek", "sopan", "jutek", "acuh", "bantu", "tawar", "dibantu", "sambut", "judes", "ramah", "welcome", "responsif", "tanggap", "penjelasan", "menjelaskan")
    "Facility" = @("fasilitas", "ac ", "panas", "toilet", "kamar mandi", "wc ", "ruang ganti", "fitting room", "parkir", "sempit", "lampu", "gelap", "koleksi", "stok", "stock", "barang", "ukuran", "size ", "tas ", "sepatu", "tenda", "display", "etalase", "musik", "suara", "lagu")
    "Cleanliness" = @("bersih", "kotor", "debu", "bau", "pesing", "berantakan", "sampah", "rapi", "jorok", "kumuh", "lantai", "kaca")
    "People" = @("pegawai", "staff", "staf", "karyawan", "security", "satpam", "kasir", "spg", "spb", "pramuniaga", "penampilan", "seragam", "nametag", "id card", "rambut", "ngobrol", "bercanda", "main hp")
    "Transaction Process" = @("transaksi", "bayar", "edc", "promo", "struk", "antri", "kasir", "lama", "kertas", "kantong", "plastik", "paper bag", "bag", "member", "eac", "eiger club", "point", "poin", "diskon", "harga")
}

$results = @()
$unclassifiedCount = 0

foreach ($f in $feedbacks) {
    if ([string]::IsNullOrWhiteSpace($f)) { continue }
    
    $lowerF = $f.ToLower()
    $assignedCategory = "Unclassified"
    $matchCount = 0
    $bestCategory = ""
    
    foreach ($cat in $categories.Keys) {
        $hits = 0
        foreach ($keyword in $categories[$cat]) {
            if ($lowerF -match $keyword) {
                $hits++
            }
        }
        if ($hits -gt $matchCount) {
            $matchCount = $hits
            $bestCategory = $cat
        }
    }
    
    if ($matchCount -gt 0) {
        $assignedCategory = $bestCategory
    } else {
        $unclassifiedCount++
    }
    
    $results += [PSCustomObject]@{
        Category = $assignedCategory
        Feedback = $f -replace "`n|`r|;", " "
    }
}

$results | Export-Csv -Path "Master_Qualitative_Feedback.csv" -NoTypeInformation -Delimiter ";" -Encoding UTF8

Write-Host "Total processed: $($results.Count)"
Write-Host "Unclassified: $unclassifiedCount"
