# One-shot photo rescue for boats whose dealer pages block scripted fetches.
# Image URLs were extracted via a real browser session on 2026-08-25 (pages are
# bot-gated but their image CDNs are not). Downloads into public/boats/ using
# the same <slug>-<n>.<ext> convention as scripts/import-show-boats.mjs, which
# treats on-disk photos as cache — re-run the importer after this to fold the
# photos into data/show-boats.json.
#
# STILL MISSING after this script (resume TODO):
#   - tiara-yachts-39ls        (tiarayachts.com lazy-loads; re-extract in browser)
#   - regulator-35 / regulator-31 / regulator-24xo
#     (comstockyachtsales.com sits behind an interactive Cloudflare challenge we
#      won't bypass; get photos from regulatormarine.com model pages instead)

$ErrorActionPreference = "Continue"
$dst = "C:\Users\jon\dev\vbs-website\public\boats"
New-Item -ItemType Directory -Force $dst | Out-Null
$UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

$map = @{
  "regal-36xo" = @(
    "https://shelteredcovemarina.com/wp-content/uploads/2025/11/2026-regal-36-xo-power-9998913-20260518131915630-1-1036x691.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2025/11/2026-regal-36-xo-power-9998913-20260518131915866-2-1036x691.jpg"
  )
  "regal-26xo" = @(
    "https://shelteredcovemarina.com/wp-content/uploads/2025/09/2026-regal-26-xo-power-9949004-20251205100652380-1.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2025/09/2026-regal-26-xo-power-9949004-20251205100652546-2.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2025/09/2026-regal-26-xo-power-9949004-20251205100652939-4.jpg"
  )
  "barletta-pontoons-l25uc" = @(
    "https://shelteredcovemarina.com/wp-content/uploads/2026/04/2026-barletta-lusso-25uc-power-10152501-20260522112355887-1-1036x691.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2026/04/2026-barletta-lusso-25uc-power-10060493-20260120083349763-1-1036x691.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2026/04/2026-barletta-lusso-25uc-power-10060493-20260120083349865-2-1036x691.jpg"
  )
  "barletta-pontoons-c24m" = @(
    "https://shelteredcovemarina.com/wp-content/uploads/2025/08/2026-barletta-c24m-power-9850634-20260616070909940-1-1036x691.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2025/08/2026-barletta-c24m-power-9850634-20260616070910212-2-1036x691.jpg"
  )
  "barletta-pontoons-c22qc" = @(
    "https://shelteredcovemarina.com/wp-content/uploads/2026/04/2026-barletta-cabrio-22qc-power-10135200-20260626130710235-1.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2026/04/2026-barletta-cabrio-22qc-power-10135200-20260626130709689-3.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2026/04/2026-barletta-cabrio-22qc-power-10135200-20260626130709873-4.jpg"
  )
  "barletta-pontoons-a22uc" = @(
    "https://shelteredcovemarina.com/wp-content/uploads/2026/04/2026-barletta-aria-22uc-power-10135002-20260609073807223-1-1036x691.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2026/04/2026-barletta-aria-22uc-power-10135002-20260609073807611-2-1036x691.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2026/04/2026-barletta-aria-22uc-power-10135002-20260609073808402-4-1036x691.jpg"
  )
  "starcraft-svx-230-dc-ob" = @(
    "https://shelteredcovemarina.com/wp-content/uploads/2025/11/2025-starcraft-svx-230-dc-ob-power-9632450-20241210093117476-1_XLARGE-1036x691.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2025/11/2025-starcraft-svx-230-dc-ob-power-9632450-20241210093113437-1_XLARGE-1036x691.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2025/11/2025-starcraft-svx-230-dc-ob-power-9632450-20241210093115537-1_XLARGE-1036x691.jpg"
  )
  "starcraft-svx-210-dc-ob" = @(
    "https://shelteredcovemarina.com/wp-content/uploads/2026/08/2026-starcraft-svx-210-dc-ob-power-10092539-20260302100518320-1-1036x691.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2026/08/2026-starcraft-svx-210-dc-ob-power-10092539-20260302100518532-2-1036x691.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2026/08/2026-starcraft-svx-210-dc-ob-power-10092539-20260302100518698-3-1036x691.jpg"
  )
  "starcraft-svx-211-ob" = @(
    "https://shelteredcovemarina.com/wp-content/uploads/2025/11/2026-starcraft-svx-211-ob-dc-power-10016004-20260324125717972-1.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2025/11/2026-starcraft-svx-211-ob-dc-power-10016004-20260324125715680-2.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2025/11/2026-starcraft-svx-211-ob-dc-power-10016004-20260324125718103-2-1036x691.jpg"
  )
  "starcraft-svx-190-dc-ob" = @(
    "https://shelteredcovemarina.com/wp-content/uploads/2026/08/2026-starcraft-svx-190-dc-ob-power-10283168-20260812052642401-2-1036x691.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2026/08/2026-starcraft-svx-190-dc-ob-power-10092543-20260302095421472-2-1036x691.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2026/08/2026-starcraft-svx-190-dc-ob-power-10092543-20260302095421629-3-1036x691.jpg"
  )
  "starcraft-svx-191-ob" = @(
    "https://shelteredcovemarina.com/wp-content/uploads/2025/11/2026-starcraft-svx-191-ob-power-10016060-20260707075930786-1-1036x691.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2025/11/2026-starcraft-svx-191-ob-power-10016060-20260707075931099-3.jpg",
    "https://shelteredcovemarina.com/wp-content/uploads/2025/11/2026-starcraft-svx-191-ob-power-10016060-20260707075931306-4.jpg"
  )
  "boston-whaler-220-dauntless" = @(
    "https://www.bostonwhaler.com/adobe/dynamicmedia/deliver/dm-aid--6fe94123-d7d9-41d3-8fbd-3750212440f2/220-dauntless.jpg?quality=85",
    "https://www.bostonwhaler.com/adobe/dynamicmedia/deliver/dm-aid--3dc648be-e34e-4015-90e4-fd288ab66eb5/2021-whaler-220-7r402443-cc.jpg?quality=85",
    "https://www.bostonwhaler.com/adobe/dynamicmedia/deliver/dm-aid--4617929e-8926-4d32-815a-2e69594deb4b/2021-whaler-220-7r403323-cc.jpg?quality=85",
    "https://www.bostonwhaler.com/adobe/dynamicmedia/deliver/dm-aid--fd9ac2e5-279f-4519-8eca-922ee4d7531c/2021-whaler-220-7r402515-cc.jpg?quality=85"
  )
  "boston-whaler-325-conquest" = @(
    "https://www.bostonwhaler.com/adobe/dynamicmedia/deliver/dm-aid--d9ba19aa-639d-4cb8-81ac-13a8485fcb01/325-conquest.jpg?quality=85",
    "https://www.bostonwhaler.com/adobe/dynamicmedia/deliver/dm-aid--a7831d8a-5b5b-42c1-ac40-8e90b5f319be/boston-whaler-conquest-325-2025-2021-325-129-cc.jpg?quality=85",
    "https://www.bostonwhaler.com/adobe/dynamicmedia/deliver/dm-aid--4c83a649-bd15-460e-9398-eea6dd48bf5f/boston-whaler-conquest-325-2025-2021-325-32-cc.jpg?quality=85",
    "https://www.bostonwhaler.com/adobe/dynamicmedia/deliver/dm-aid--ee053862-1385-4ca4-a1b1-8a2dff50bc9c/boston-whaler-conquest-325-2025-gallery-image-2-cc.jpg?quality=85"
  )
  "navan-t-30-center-console" = @(
    "https://www.navan-boats.com/adobe/dynamicmedia/deliver/dm-aid--34dd40a1-c414-41ef-ac34-62e71c6cb180/t30-2026-running-02.jpg?quality=85",
    "https://www.navan-boats.com/adobe/dynamicmedia/deliver/dm-aid--2e4e47b0-b738-49a2-97f5-2851b4a7a232/navan-t30-2026-78.jpg?quality=85",
    "https://www.navan-boats.com/adobe/dynamicmedia/deliver/dm-aid--c7bda30b-ab2d-400e-bf6d-6da9bf364c7a/navan-t30-2026-5.jpg?quality=85"
  )
  "navan-s30" = @(
    "https://www.navan-boats.com/adobe/dynamicmedia/deliver/dm-aid--e8d5aac1-806e-4aaf-ac5d-7e581dbd96b2/navan-product-by-mileovision-dsc02196-bearbeitet.jpg?quality=85",
    "https://www.navan-boats.com/adobe/dynamicmedia/deliver/dm-aid--ad72563e-bb08-4c7e-9cdb-0856f70696a3/navan-product-by-mileovision-dsc03885-kopie-2.jpg?quality=85",
    "https://www.navan-boats.com/adobe/dynamicmedia/deliver/dm-aid--c347ddc2-df3a-4728-bc51-a7ee79579a38/a7r08120.jpg?quality=85"
  )
  "key-west-249-fs" = @(
    "https://assets.mobile.production.ldv-svcs.live/iv/dealer/21071/original_image-21071-20260715-181532-e6336e4fbbfe0a62.jpg"
  )
}

$ok = 0; $fail = 0
foreach ($slug in $map.Keys) {
  $n = 0
  foreach ($u in $map[$slug]) {
    $n++
    $ext = "jpg"
    $file = Join-Path $dst "$slug-$n.$ext"
    if (Test-Path $file) { Write-Output "skip  $slug-$n (exists)"; $ok++; continue }
    try {
      Invoke-WebRequest -Uri $u -UserAgent $UA -TimeoutSec 60 -UseBasicParsing -OutFile $file -Headers @{ "Referer" = ($u -replace '^(https?://[^/]+).*', '$1/') }
      $sz = (Get-Item $file).Length
      if ($sz -lt 12000) { Remove-Item $file -Force; Write-Output "tiny  $slug-$n ($sz b, discarded)"; $fail++ }
      else { Write-Output "ok    $slug-$n ($([math]::Round($sz/1KB)) KB)"; $ok++ }
    } catch {
      Write-Output ("fail  $slug-$n : " + $_.Exception.Message.Split("`n")[0])
      $fail++
    }
    Start-Sleep -Milliseconds 250
  }
}
Write-Output "downloaded/kept: $ok, failed: $fail"
