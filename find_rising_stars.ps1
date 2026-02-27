# find_rising_stars.ps1
$ligaPath = "c:\Users\LENOVO\OneDrive\Desktop\Drive Workspace\Morrigan Report (V2)\CSV\CSE Analysis - Liga ESS.csv"
$mppPath = "c:\Users\LENOVO\OneDrive\Desktop\Drive Workspace\Morrigan Report (V2)\CSV\Retail MPP Tracking (National) - Facility List.csv"

# 1. Read Liga ESS CSV to extract Store IDs
$ligaStoreIds = @{}
Import-Csv $ligaPath | ForEach-Object {
    $shortName = $_.'Short branch name'
    if ($shortName -match "^(\d{4})") {
        $storeId = $matches[1]
        $ligaStoreIds[$storeId] = $true
    }
}

# 2. Read MPP Tracking CSV and find stores not in Liga
$risingStars = @()
Import-Csv $mppPath | ForEach-Object {
    $siteCode = $_.'Site Code'
    $siteName = $_.'Site Name'
    $region = $_.'Region'
    $branch = $_.'Branch'
    $status = $_.'Ket'

    if ($siteCode -match "^\d{4}$" -and $status -ne "Closed") {
        if (-not $ligaStoreIds.ContainsKey($siteCode)) {
            $risingStars += [PSCustomObject]@{
                SiteCode = $siteCode
                SiteName = $siteName
                Region   = $region
                Branch   = $branch
            }
        }
    }
}

Write-Host "`nFound $($risingStars.Count) `"Rising Star`" Stores (Active stores in MPP tracking with NO historical ESS score):`n"
foreach ($store in $risingStars) {
    Write-Host "- [$($store.SiteCode)] $($store.SiteName) ($($store.Region), $($store.Branch))"
}
