$body = '{"phone":"05551234567","pin":"1234"}'
Invoke-RestMethod -Uri "https://www.cokusta.com/api/mobile/usta/giris" -Method POST -ContentType "application/json" -Body $body
