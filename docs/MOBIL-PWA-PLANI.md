# Agrolina Mobil PWA Entegrasyon Planı

Mobil deneyimi uygulamanın kalbi yapacak şekilde, web üzerinden indirilebilir (PWA) ve tüm özelliklerden eksiksiz bir mobil entegrasyon planı.

---

## 1. Temel Kural: PC ve Mobil Ayrımı

**PC (masaüstü) tasarımına dokunulmayacak.** Sadece mobil tarafı entegre edeceğiz.

| Ortam | Yerleşim | Dokunma (touch) |
|-------|----------|------------------|
| **PC (≥769px)** | Mevcut haliyle kalacak: sol sidebar, üst TopBar, tablolar, mevcut padding/margin. Hiçbir layout değişikliği yapılmayacak. | **Yok.** Swipe, büyük tap alanları, touch-only davranış eklenmeyecek. Sadece mouse/klavye. |
| **Mobil (≤768px)** | **Tamamen ayrı yerleşim:** alt bar (bottom nav), mobil header, kart listeler, safe area. Sidebar sadece drawer olarak açılacak. | **Var.** Tüm dokunma kuralları (min 44px hedefler, swipe, pull-to-refresh vb.) sadece mobilde uygulanacak. |

### Uygulama prensibi

- **Media query / `isMobile`:** Mobil shell (BottomNav, mobil header, safe area) **sadece** `max-width: 768px` (veya `useMediaQuery`) ile render edilecek. 769px ve üzerinde bu bileşenler **hiç render edilmeyecek**.
- **PC’ye dokunma:** Layout.js, Sidebar.js, TopBar.js içinde desktop (≥769px) davranışı **değiştirilmeyecek**. Sadece `@media (max-width: 768px)` bloklarına yeni stiller ve **yeni mobil bileşenler** (örn. BottomNav) eklenecek; desktop branch’i olduğu gibi kalacak.
- **Touch event’ler:** `onTouchStart`, `onSwipe`, büyük buton alanları gibi dokunma odaklı kod yalnızca mobil görünümde (mobil bileşenler veya mobil media query içinde) kullanılacak; PC bileşenlerinde touch handler eklenmeyecek.

Böylece **yerleşkeler farklı** olacak (PC = sidebar + tablo, Mobil = bottom nav + kart) ve **dokunma sadece mobilde** entegre edilecek.

---

## 2. Hedefler

- **Web’den indirilebilir:** PWA olarak “Ana ekrana ekle” ile tam ekran, uygulama gibi kullanım.
- **Mobil öncelikli (sadece mobil):** Bar’lar, safe area’lar, dokunma alanları kusursuz; hiçbir özellik eksik kalmayacak.
- **PC’ye dokunma yok:** Masaüstü layout ve etkileşim aynen korunacak; touch sadece mobilde.
- **Tek kod tabanı:** Mevcut React SPA korunacak; mobil için ayrı uygulama yok.
- **Rol bazlı deneyim:** Çiftçi, sütçü, toplayıcı, veteriner — hepsi mobilde tam desteklenecek.

---

## 3. Fazlar Özeti

| Faz | İçerik | Tahmini süre |
|-----|--------|--------------|
| **Faz 1** | PWA altyapısı (SW, manifest, meta, install prompt) | 1–2 gün |
| **Faz 2** | Mobil shell (bottom nav, header, safe area) | 2–3 gün |
| **Faz 3** | Liste sayfaları mobil (tablo → kart/stack) | 2–3 gün |
| **Faz 4** | Form/modal ve detay sayfaları mobil | 1–2 gün |
| **Faz 5** | Offline + bildirim + test & iyileştirme | 1–2 gün |

---

## 4. Faz 1: PWA Altyapısı (İndirilebilir Yapı)

### 3.1 Service Worker (Workbox)

- **Amaç:** Cache-first/network-first stratejileri ile sayfa ve API’lerin güvenli kullanımı; offline’da shell + son veriler.
- **Yapılacaklar:**
  - `workbox-webpack-plugin` (veya `craco`/eject sonrası) ile build’e SW ekleme.
  - `src/index.js` içinde `serviceWorkerRegistration.register()` — production’da aktif.
  - Stratejiler:
    - **Shell (HTML, JS, CSS):** CacheFirst.
    - **API istekleri:** NetworkFirst (fallback cache), hassas sayfalar için NetworkOnly.
    - **Statik asset’ler (resim, font):** CacheFirst.
  - `manifest.json` zaten mevcut; `start_url`, `display: standalone`, `orientation` kontrolü.

### 3.2 Manifest Güncellemeleri

- `display`: `"standalone"` (mevcut).
- `orientation`: `"portrait-primary"` (mevcut) — mobilde portre öncelikli.
- **Eklenecek:**
  - `scope`: `"/"` (SPA root).
  - `id`: Benzersiz uygulama id (opsiyonel, güncelleme davranışı için).
  - Rol bazlı shortcut’lar (ör. Sütçü: “Süt kaydı”, “İnekler”; Veteriner: “Hastalar”, “Takvim”) — mevcut shortcut’lar genişletilebilir.

### 3.3 Meta ve iOS

- `index.html` içinde:
  - `viewport`: `width=device-width, initial-scale=1, viewport-fit=cover` (notch/safe area için).
  - `theme-color` (zaten var).
  - `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title` (mevcut).
  - Gerekirse farklı cihazlar için `apple-touch-startup-image` boyutları.

### 3.4 “Ana Ekrana Ekle” (Install Prompt)

- **Web:** `beforeinstallprompt` dinlenip, uygun bir zamanda (ör. ilk giriş sonrası veya ayarlar sayfası) “Uygulamayı yükle” butonu gösterilecek.
- **iOS:** “Safari’de Paylaş > Ana Ekrana Ekle” için kısa bir bilgi metni/banner (özellikle ilk ziyarette).

Bu adımlarla uygulama **web üzerinden indirilebilir** hale gelir.

---

## 5. Faz 2: Mobil Shell — Bar’lar ve Yerleşim (Kusursuz Yapı)

**Önemli:** Aşağıdaki shell (bottom nav, mobil header, safe area) **sadece mobilde** (≤768px) kullanılacak. PC’de mevcut Layout (sidebar + TopBar) aynen kalacak; bu bileşenler desktop’ta render edilmeyecek.

### 5.1 Breakpoint Stratejisi

- **Mobil:** `max-width: 768px` (mevcut).
- **Tablet:** `768px – 1024px` (isteğe bağlı ara davranış).
- **Desktop:** `1024px+`.

Tüm yeni bileşenler bu breakpoint’lere göre davranacak.

### 5.2 Bottom Navigation (Mobilde Ana Navigasyon)

- **Nerede:** Sadece `max-width: 768px`; desktop’ta sidebar aynen kalacak.
- **İçerik:** Role göre 4–5 ana sayfa:
  - **Ortak:** Ana Sayfa, Bildirimler, Ayarlar (veya Menü).
  - **Çiftçi/Sütçü:** Ana Sayfa, İnekler, Süt Kaydı, Yem / Sağlık (veya “Daha fazla” ile menü), Ayarlar/Menü.
  - **Veteriner:** Ana Sayfa, Hastalar, Danışmalar/Takvim, Rapor/Finans, Ayarlar.
  - **Toplayıcı:** Ana Sayfa, Takvim, Ayarlar.
- **Teknik:**
  - Sabit (fixed) bottom bar; `padding-bottom` ile içerik alanı notch/home indicator’a taşmayacak (`env(safe-area-inset-bottom)`).
  - Yükseklik: en az 56px + safe area; dokunma hedefleri 44px+.
  - Aktif sayfa vurgusu (renk + ikon).
  - Sidebar’daki “Menü” veya “Daha fazla” ile kalan sayfalara link (drawer veya tam liste).

### 5.3 Üst Bar (Header)

- **Mobil:** Mevcut TopBar sadeleştirilebilir: sol’da menü (hamburger) + sayfa başlığı, sağ’da bildirim + profil.
  - Arama: mobilde header’da küçük ikon; tıklanınca tam ekran arama overlay’i (isteğe bağlı).
- **Yükseklik:** 56px + `env(safe-area-inset-top)` (notch’lu cihazlar).
- **Sticky:** Scroll’da sabit kalmalı; içerik `padding-top` ile bar altından başlamalı.

### 5.4 Sidebar (Mobil)

- Mevcut drawer davranışı korunacak.
- Bottom nav’daki “Menü” veya “Daha fazla” ile açılacak; tüm sayfalar buradan erişilebilir olacak (hiçbir özellik eksik kalmayacak).

### 5.5 Ana İçerik Alanı

- **Padding:** Üst: header yüksekliği + 16px; Alt: bottom nav yüksekliği + 16px; Yan: 16px.
- **Safe area:** `padding: env(safe-area-inset-top) ... env(safe-area-inset-bottom)` layout container’da kullanılacak.
- **Scroll:** Tek kolon, overflow-y: auto; sayfa bazlı kaydırma.

Bu yapı ile bar’lar ve yerleşim mobilde **kusursuz** ve tutarlı olacak.

---

## 6. Faz 3: Liste Sayfaları — Tablolar → Mobil Kart/Stack

**PC’de değişiklik yok:** Masaüstünde tablolar olduğu gibi kalacak. Aşağıdaki dönüşüm **sadece** `max-width: 768px` için geçerli.

Aşağıdaki sayfalar tablo kullandığı için mobilde kart veya dikey stack’e dönüştürülecek (yatay scroll yok):

| Sayfa | Mevcut | Mobil görünüm |
|-------|--------|----------------|
| İnekler | Tablo | Kart listesi (küpe no, isim, durum, kısa bilgi; tıklanınca detay) |
| Buzağılar | Tablo | Kart listesi |
| Düveler | Tablo | Kart listesi |
| Tosunlar | Tablo | Kart listesi |
| Süt kayıtları / listeler | Tablo | Kart veya grouped list (tarih bazlı) |
| Yem merkezi / stok | Tablo | Kart listesi |
| Sağlık merkezi listeleri | Tablo | Kart listesi |
| Finansal kayıtlar | Tablo | Kart listesi |
| Veteriner: Hastalar | Tablo | Kart listesi |
| Raporlar | Tablo/grafik | Grafik aşağı kaydırılabilir; tablo yerine kart özeti |

- **Ortak bileşen:** `MobileCardList` veya `ResponsiveTable` — **768px altında** kart, **769px ve üzerinde** mevcut tablo (PC’ye dokunulmaz).
- Filtreler mobilde drawer veya üstte collapse edilebilir bar (FilterBar mevcut ise ona responsive davranış).

Hiçbir liste sayfası mobilde “yarım” veya sadece yatay kaydırmaya bırakılmayacak; **tüm özellikler** erişilebilir olacak.

---

## 7. Faz 4: Form, Modal ve Detay Sayfaları

### 7.1 Formlar

- Süt kaydı, yem ekleme, hayvan ekleme, sağlık kaydı vb. tüm formlar:
  - Mobilde tek kolon, büyük input/buton (min 44px dokunma).
  - Gerekirse adım adım (step) form ile ekranı bölme.

### 7.2 Modaller

- Mobilde tam ekran veya yarım ekran (bottom sheet) tercih edilebilir.
  - Örn. `SatisModal`, `TopluSutGirisi`, `YemEkleModal` — `max-width: 768px` için full-screen veya sheet.

### 7.3 Detay Sayfaları

- İnek/Buzağı/Düve/Tosun detay: Sekmeler mobilde üstte scroll’lanabilir pill’ler veya accordion.
  - Grafikler (recharts) responsive; mobilde tek kolon, kaydırılabilir.

Bu sayede **hiçbir özellikten eksik kalmayan** tam mobil deneyim sağlanır.

---

## 8. Faz 5: Offline, Bildirim ve Son Dokunuşlar

### 8.1 Offline

- Service worker ile shell ve son kullanılan sayfalar cache’te.
  - API: NetworkFirst + cache fallback (hassas işlemler NetworkOnly).
  - Offline’da “Çevrimdışısınız” banner’ı + mümkünse son cache’lenmiş veriyi gösterme.

### 8.2 Push Bildirimleri (İsteğe Bağlı)

- Web Push API + backend (FCM veya kendi endpoint).
  - Bildirim izni; veteriner randevu, doğum hatırlatması vb. için kullanılabilir.

### 8.3 Test ve İyileştirme

- Gerçek cihazlarda (iOS Safari, Android Chrome) “Ana ekrana ekle” + standalone açılış.
  - Safe area, bottom nav tıklanabilirliği, klavye açılınca layout.
- Lighthouse (PWA, performance, accessibility); eksikleri kapatma.

---

## 9. Özellik Eşlemesi (Eksiksiz Sistem)

Aşağıdaki modüller mobilde (bottom nav + sidebar menü ile) **tam erişilebilir** olacak:

| Modül | Sayfa/Özellik | Mobil erişim |
|-------|----------------|--------------|
| Genel | Ana sayfa, Ayarlar, Bildirimler, Abonelik | Bottom nav / Sidebar |
| Hayvanlar | İnekler, Buzağılar, Düveler, Tosunlar + tüm detaylar | Sidebar + listeler kart |
| Süt | Süt kaydı (tek/toplu) | Bottom nav + form |
| Takvim | Takvim, timeline | Sidebar |
| Sağlık | Sağlık merkezi, aşı, tedavi | Sidebar + kart listeler |
| Yem | Yem merkezi, rasyon, stok | Sidebar + kart listeler |
| Stok | Stok yönetimi | Sidebar |
| Finans | Finansal, karlılık (çiftçi) | Sidebar + kart/grafik |
| Aktivite / Rapor | Aktiviteler, Raporlar | Sidebar |
| Veteriner | Dashboard, Hastalar, Danışmalar, Finans, Reçete/Stok, Takvim, Rapor | Bottom nav + Sidebar |
| Toplayıcı | Dashboard, Takvim | Bottom nav + Sidebar |
| Admin | /admin | Link (mobilde de çalışır) |

Tüm bu sayfalar aynı route’lar ile açılacak; sadece layout ve bileşen görünümleri mobilde değişecek.

---

## 10. Teknik Kontrol Listesi

- [ ] **PC layout değişmedi:** 769px ve üzerinde sidebar + TopBar + tablolar aynen; touch handler yok.
- [ ] **Mobil shell sadece mobilde:** BottomNav ve mobil header yalnızca `max-width: 768px` / `useMediaQuery` ile render.
- [ ] Service worker build’e ekli ve production’da register.
- [ ] `manifest.json` scope, display, orientation, shortcut’lar güncel.
- [ ] `viewport-fit=cover` + safe-area-inset’ler layout’ta kullanılıyor.
- [ ] Mobilde bottom navigation (role bazlı) + sabit header.
- [ ] Tüm liste sayfaları 768px altında kart veya stack.
- [ ] Form/modal mobilde tek kolon veya sheet.
- [ ] Install prompt (web) + iOS “Ana ekrana ekle” bilgisi.
- [ ] API base URL (apiClient + build) tutarlı.
- [ ] Lighthouse PWA skoru ve gerçek cihaz testi.

---

## 11. Özet

- **Faz 1:** PWA’yı indirilebilir yap (SW, manifest, meta, install).
- **Faz 2:** Mobil shell’i kusursuz yap (bottom nav, header, safe area, sidebar drawer).
- **Faz 3:** Tüm listeleri mobilde kart/stack ile eksiksiz sun.
- **Faz 4:** Form/modal/detay sayfalarını mobil uyumlu yap.
- **Faz 5:** Offline, bildirim (opsiyonel), test ve iyileştirme.

Bu plan ile mobil, uygulamanın **kalbi** olacak; bar’lar ve yerleşim kusursuz, **hiçbir özellik eksik kalmayacak** ve sistem tek kod tabanında güzel bir şekilde oturacak.
