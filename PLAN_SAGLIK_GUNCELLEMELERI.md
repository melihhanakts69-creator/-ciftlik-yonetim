# Sağlık Modülü Güncellemeleri — Yapılacaklar Planı

> **Not:** Sabah devam edilecek. Komut bekleniyor.

---

## Faz 1 — Panel Sınırları

| # | Görev | Dosya | Açıklama |
|---|-------|-------|----------|
| A1 | `kayitSahibi` alanı ekle | `backend/models/SaglikKaydi.js` | `timestamps: true`'dan önce `kayitSahibi: { tip, sahipId }` ekle |
| A2 | Sütçüyü çıkar | `backend/routes/saglik.js` | Tüm `checkRole(['ciftci','veteriner','sutcu'])` → `checkRole(['ciftci','veteriner'])` |
| A3 | POST'ta kayitSahibi yaz | `backend/routes/saglik.js` | SaglikKaydi oluştururken `kayitSahibi: { tip, sahipId }` ekle |
| A4 | Vet müşteri hayvanı düzenleyemez | `backend/routes/veterinerMusteri.js` | Müşteri hayvanı yazma endpoint'i varsa sil veya 403 dön |
| A5 | Çiftçi reçete sayfasında edit gizle | `src/pages/Hastalar.js` | Rol kontrolü: Vet → Düzenle/Sil, Çiftçi → sadece PDF İndir |

---

## Faz 2 — Antibiyotik → Süt Koruma Zinciri

| # | Görev | Dosya | Açıklama |
|---|-------|-------|----------|
| B1 | ilaclar'a arinma süreleri | `backend/models/SaglikKaydi.js` | `arinmaSuresiSut`, `arinmaSuresiEt` (Number) |
| B2 | Schema'ya yasak alanları | `backend/models/SaglikKaydi.js` | `sutYasakBitis`, `sutYasakAktif`, `etYasakBitis` |
| B3 | Vet kayıt → zincir tetikle | `backend/routes/veterinerMusteri.js` | Sağlık kaydı save sonrası arinma hesapla, bitiş tarihleri yaz |
| B4 | Çiftçiye bildirim | `backend/routes/veterinerMusteri.js` | Bildirim.create — süt yasağı bildirimi |
| B5 | Toplayıcılara bildirim | `backend/routes/veterinerMusteri.js` | User.find toplayici + Bildirim.insertMany |
| B6 | Süt yasak endpoint | `backend/routes/dashboard.js` | `GET /sut-yasak` — aktif yasaklı hayvanlar |
| B7 | SutYasakWidget | `src/components/Dashboard/SutYasakWidget.js` | Yeni component |
| B8 | Dashboard'a widget ekle | `src/components/Dashboard/Dashboard.js` | SutYasakWidget import + Header altına |

---

## Faz 3 — Otomatik Hatırlatıcılar

| # | Görev | Dosya | Açıklama |
|---|-------|-------|----------|
| C1 | Gebelik muayenesi (35–45 gün) | `backend/routes/dashboard.js` | `otomatikGorevleriKontrolEt` içine — Belirsiz + tohumlama |
| C2 | Postpartum kontrol (12–21 gün) | `backend/routes/dashboard.js` | Yeni doğan inekler — rahim/meme kontrolü |
| C3 | Tohumlama zamanı (60+ gün) | `backend/routes/dashboard.js` | Gebe Değil + doğumdan 60+ gün — kızgınlık takibi |

---

## Faz 4 — İlaç Stok Entegrasyonu

| # | Görev | Dosya | Açıklama |
|---|-------|-------|----------|
| D1 | ilaclar'a kullanılanMiktar, birim | `backend/models/SaglikKaydi.js` | `kullanılanMiktar`, `birim` (default 'ml') |
| D2 | saglik.js stok düşümü | `backend/routes/saglik.js` | Kayıt save sonrası — Stok.findOne, miktar düş, kritik bildirim |
| D3 | veterinerMusteri.js stok düşümü | `backend/routes/veterinerMusteri.js` | Aynı mantık, userId → ciftciId (vet kendi stoku) |

---

## Faz 5 — Toplu Aşı

| # | Görev | Dosya | Açıklama |
|---|-------|-------|----------|
| E1 | Toplu aşı tespiti | `backend/routes/saglik.js` | hayvanTipi !== 'hepsi' veya !hayvanId kontrolü |
| E2 | Bireysel AsiTakvimi kayıtları | `backend/routes/saglik.js` | Her hedef hayvana insertMany — maliyet bölüştür |

---

## Faz 6 — Sağlık Skoru

| # | Görev | Dosya | Açıklama |
|---|-------|-------|----------|
| F1 | saglik-skoru endpoint | `backend/routes/dashboard.js` | `GET /saglik-skoru` — inek, tedavi, aşı, ölüm, yasak sayıları |
| F2 | SuruSaglikSkoru widget | `src/components/Dashboard/SuruSaglikSkoru.js` | Yeni component |
| F3 | Dashboard'a skor widget | `src/components/Dashboard/Dashboard.js` | Stats grid'e ekle |

---

## Bağımlılık Sırası

```
Faz 1 (A1–A5)     → Temel model ve yetki
Faz 2 (B1–B8)     → Süt yasağı zinciri (B1–B2 model, B3–B5 backend, B6–B8 frontend)
Faz 3 (C1–C3)     → Hatırlatıcılar (dashboard.js otomatikGorevleriKontrolEt)
Faz 4 (D1–D3)     → Stok düşümü (D1 model, D2–D3 routes)
Faz 5 (E1–E2)     → Toplu aşı (saglik.js)
Faz 6 (F1–F3)     → Sağlık skoru (dashboard endpoint + widget)
```

---

## API Eklemesi Gereken Endpoint'ler

- `GET /api/dashboard/sut-yasak` — Süt yasağı widget
- `GET /api/dashboard/saglik-skoru` — Sağlık skoru widget

---

## Kontrol Listesi (Sabah)

- [ ] Faz 1 tamamlandı mı?
- [ ] Faz 2 tamamlandı mı?
- [ ] Faz 3 tamamlandı mı?
- [ ] Faz 4 tamamlandı mı?
- [ ] Faz 5 tamamlandı mı?
- [ ] Faz 6 tamamlandı mı?
- [ ] api.js'e yeni endpoint'ler eklendi mi?
- [ ] Test: Vet reçete yazınca çiftçiye bildirim gidiyor mu?
- [ ] Test: Süt yasak widget görünüyor mu?
