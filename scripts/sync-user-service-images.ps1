# Kullanıcının sohbette gönderdiği görselleri public/images/services altına kopyalar.
$assets = "C:\Users\Slymn\.cursor\projects\c-Users-Slymn-Documents-cokusta-com\assets"
$dest = Join-Path $PSScriptRoot "..\public\images\services"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

function Copy-Asset($pattern, $outName) {
  $src = Get-ChildItem -Path $assets -Filter "*images_${pattern}*" -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $src) {
    Write-Warning "Bulunamadı: $pattern -> $outName"
    return
  }
  Copy-Item $src.FullName (Join-Path $dest $outName) -Force
  Write-Host "OK $outName"
}

# slug -> asset dosya adındaki anahtar kelime
$map = @{
  "ev-temizligi.png" = "homecl"
  "evden-eve-nakliyat.png" = "evden_eve_tasima"
  "boya-badana.png" = "paint"
  "mutfak-dolabi.png" = "mutfak_dolabi"
  "klima-montaj.png" = "klima"
  "matematik-ozel-ders.png" = "ozel_ders"
  "ofis-temizligi.png" = "office"
  "parke-laminat.png" = "laminat"
  "elektrik-tesisati.png" = "electrik"
  "su-tesisati.png" = "musluk"
  "bahce-duzenleme.png" = "bahcivan"
  "ingilizce-ozel-ders.png" = "ders"
  "mobilya-montaj.png" = "mob_mantaj"
  "sehir-ici-nakliyat.png" = "tasima"
  "banyo-yenileme.png" = "banyo_yenileme"
  "fayans-seramik.png" = "fayans_seramik"
  "alcipan-asma-tavan.png" = "alcipan_asma_tavan"
  "duvar-alci-siva.png" = "siva"
  "duvar-kagidi.png" = "duvar_kagidi"
  "ev-komple-tadilat.png" = "tadilat-55917bed"
  "ic-mimari-danismanlik.png" = "ic_mimar"
  "sehirlerarasi-nakliyat.png" = "sehirler_arasi_tas"
  "ofis-tasima.png" = "ofis_tasima"
  "parca-esya-tasima.png" = "parca_esya"
  "asansorlu-tasima.png" = "asansorlu_tasima"
  "esya-depolama.png" = "esya_depolama"
  "ozel-esya-tasima.png" = "ozel_esya"
  "dogalgaz-tesisati.png" = "dgaz_tesi"
  "kalorifer-tesisati.png" = "kalorifer"
  "kombi-bakim.png" = "kombi_bakim"
  "tikaniklik-acma.png" = "tikaniklikacma"
  "bilgisayar-onarim.png" = "bilgisayar_"
  "televizyon-onarim.png" = "tv_onarim"
  "telefon-tablet-servis.png" = "telefon_tablet"
  "tadilat-sonrasi-temizlik.png" = "tadilat_sonrasi"
  "bos-daire-temizligi.png" = "bos_ev_tem"
  "aydinlatma-montaj.png" = "ayd_nlatma_montaj"
  "tv-duvar-montaj.png" = "tv_montaj"
  "surus-egitimi.png" = "surus_egitim"
  "muzik-ozel-ders.png" = "muzik_ders"
  "cim-bicme.png" = "cim_bicme"
  "havuz-bakimi.png" = "havuz_bak"
  "dis-cephe-boya.png" = "dis-cephe-boya"
  "vip-tasima.png" = "vip_tas"
  "oto-tamir.png" = "oto_onar"
  "tekne-tamiri.png" = "tekne_onar"
}

foreach ($entry in $map.GetEnumerator()) {
  Copy-Asset $entry.Value $entry.Key
}

Write-Host "`nToplam dosya: $((Get-ChildItem $dest -File).Count)"
