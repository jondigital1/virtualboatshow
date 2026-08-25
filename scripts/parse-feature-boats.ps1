# Parses design-specs/rebrand/2026-Feature-Boats.xlsm (Giselle's master workbook)
# into a normalized dump of both worksheets. Default output is pipe-delimited text
# (used by the daily change-check snapshot); -AsJson emits structured rows for
# scripts/import-show-boats.mjs.
param([switch]$AsJson)

$ErrorActionPreference = "Stop"
$repo = Split-Path $PSScriptRoot -Parent
$xlsm = Join-Path $repo "design-specs\rebrand\2026-Feature-Boats.xlsm"
$work = Join-Path ([System.IO.Path]::GetTempPath()) ("fboats-" + [System.IO.Path]::GetRandomFileName())
New-Item -ItemType Directory -Force $work | Out-Null
Copy-Item $xlsm "$work\wb.zip"
Expand-Archive "$work\wb.zip" "$work\x" -Force

[xml]$ssx = Get-Content "$work\x\xl\sharedStrings.xml" -Raw -Encoding UTF8
$ss = @()
foreach ($si in $ssx.sst.si) {
  if ($si.t -is [System.Xml.XmlElement]) { $ss += $si.t.'#text' }
  elseif ($null -ne $si.t) { $ss += [string]$si.t }
  else { $ss += (($si.r | ForEach-Object { if ($_.t -is [System.Xml.XmlElement]) { $_.t.'#text' } else { [string]$_.t } }) -join '') }
}

[xml]$wb = Get-Content "$work\x\xl\workbook.xml" -Raw -Encoding UTF8
$sheetNames = @($wb.workbook.sheets.sheet | ForEach-Object { $_.name })

function Col-Index([string]$ref) {
  $letters = ($ref -replace '\d','')
  $n = 0
  foreach ($ch in $letters.ToCharArray()) { $n = $n * 26 + ([int]$ch - 64) }
  return $n
}

$out = @()
$json = [ordered]@{}
for ($i = 0; $i -lt $sheetNames.Count; $i++) {
  $path = "$work\x\xl\worksheets\sheet$($i + 1).xml"
  if (-not (Test-Path $path)) { continue }
  $name = $sheetNames[$i]
  $out += "===== SHEET: $name ====="
  $rows = @()
  [xml]$sx = Get-Content $path -Raw -Encoding UTF8
  foreach ($row in $sx.worksheet.sheetData.row) {
    $cells = @{}
    foreach ($c in $row.c) {
      $val = ""
      if ($c.t -eq 's') { $val = $ss[[int]$c.v] }
      elseif ($c.t -eq 'inlineStr') { $val = $c.is.t }
      elseif ($null -ne $c.v) { $val = [string]$c.v }
      if ($val -ne "") { $cells[(Col-Index $c.r)] = $val.Trim() }
    }
    if ($cells.Count -eq 0) { continue }
    $max = ($cells.Keys | Measure-Object -Maximum).Maximum
    $line = for ($k = 1; $k -le $max; $k++) { if ($cells.ContainsKey($k)) { $cells[$k] } else { "" } }
    $out += "R$($row.r): " + ($line -join " | ")
    $rowObj = [ordered]@{ r = [int]$row.r }
    foreach ($k in ($cells.Keys | Sort-Object)) { $rowObj["c$k"] = $cells[$k] }
    $rows += [pscustomobject]$rowObj
  }
  $json[$name] = $rows
}
Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue

if ($AsJson) {
  $json | ConvertTo-Json -Depth 5
} else {
  $out
}
