# Parses the "2026 Boats for Jon" Google Sheet, exported as .xlsx, into JSON.
#
# The Sheet is the BACKSTOP source, not the publishing source: one tab per
# dealer, columns A-E = YEAR | BRAND | MODEL | DEALER LISTING LINK | BRAND LINK.
# The tab name is the only place the dealer is recorded, which is why the Drive
# connector's plain-text read of this file is useless (it flattens the tabs and
# drops their names). Export as xlsx and the names survive.
#
# Emits: { "<tab name>": [ { r, year, brand, model, link, brandLink }, ... ] }
#
# Usage: powershell -File scripts/parse-boats-sheet.ps1 -Path <file.xlsx>

param(
  [string]$Path = "$(Split-Path $PSScriptRoot -Parent)\design-specs\rebrand\2026-Boats-for-Jon.xlsx"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $Path)) { throw "Sheet export not found: $Path" }

$work = Join-Path ([System.IO.Path]::GetTempPath()) ("bsheet-" + [System.IO.Path]::GetRandomFileName())
New-Item -ItemType Directory -Force $work | Out-Null
Copy-Item $Path "$work\wb.zip"
Expand-Archive "$work\wb.zip" "$work\x" -Force

[xml]$ssx = Get-Content "$work\x\xl\sharedStrings.xml" -Raw -Encoding UTF8
$ss = @()
foreach ($si in $ssx.sst.si) {
  if ($si.t -is [System.Xml.XmlElement]) { $ss += $si.t.'#text' }
  elseif ($null -ne $si.t) { $ss += [string]$si.t }
  else { $ss += (($si.r | ForEach-Object { if ($_.t -is [System.Xml.XmlElement]) { $_.t.'#text' } else { [string]$_.t } }) -join '') }
}

[xml]$wb = Get-Content "$work\x\xl\workbook.xml" -Raw -Encoding UTF8
[xml]$rels = Get-Content "$work\x\xl\_rels\workbook.xml.rels" -Raw -Encoding UTF8
$relMap = @{}
foreach ($rel in $rels.Relationships.Relationship) { $relMap[$rel.Id] = $rel.Target }

$out = [ordered]@{}
foreach ($sh in $wb.workbook.sheets.sheet) {
  $rid = $sh.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
  $target = $relMap[$rid]
  if (-not $target) { continue }
  [xml]$ws = Get-Content "$work\x\xl\$target" -Raw -Encoding UTF8

  $rows = @()
  foreach ($row in $ws.worksheet.sheetData.row) {
    if ([int]$row.r -eq 1) { continue }   # header
    $cells = @{}
    foreach ($c in $row.c) {
      $v = ""
      if ($c.t -eq 's') { $v = $ss[[int]$c.v] }
      elseif ($c.t -eq 'inlineStr') { $v = $c.is.t }
      elseif ($null -ne $c.v) { $v = [string]$c.v }
      $v = ([string]$v).Trim() -replace '\.0$', ''
      if ($v -ne "") { $cells[($c.r -replace '\d', '')] = $v }
    }
    if ($cells.Count -eq 0) { continue }
    $rows += [pscustomobject][ordered]@{
      r         = [int]$row.r
      year      = $(if ($cells.ContainsKey('A')) { $cells['A'] } else { "" })
      brand     = $(if ($cells.ContainsKey('B')) { $cells['B'] } else { "" })
      model     = $(if ($cells.ContainsKey('C')) { $cells['C'] } else { "" })
      link      = $(if ($cells.ContainsKey('D')) { $cells['D'] } else { "" })
      brandLink = $(if ($cells.ContainsKey('E')) { $cells['E'] } else { "" })
    }
  }
  $out[$sh.name] = $rows
}

Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue
$out | ConvertTo-Json -Depth 5
