# Agrolina – Mobil İndirme ve Güncelleme

## Mobilden iniyor mu?

**Evet.** Şu koşullarda mobil cihaza “uygulama gibi” yüklenebilir:

1. **Site HTTPS’te yayında olmalı**  
   (Vercel, Render vb. deployment; `localhost` sadece geliştirme içindir.)

2. **Android (Chrome / Edge)**  
   - Tarayıcı bazen otomatik “Yükle” / “Uygulamayı yükle” önerir.  
   - Uygulama içinde (giriş yaptıktan sonra) **TopBar’da** veya **Menü (sidebar)** altında **“Uygulamayı İndir”** butonu görünür (sadece indirilebilir durumda).

3. **iOS (Safari)**  
   - “Uygulamayı İndir” butonu **“Ana Ekrana Ekle”** açıklamasıyla çıkar.  
   - Gerçek kurulum: Safari’de **Paylaş → Ana Ekrana Ekle**.

4. **Service Worker**  
   Sadece **production build**’de çalışır (`npm run build` + deploy). Geliştirme ortamında (`npm start`) SW kayıt olmaz; indirme yine çalışabilir ama offline/cache tam olmaz.

---

## İndirdikten sonra güncelleme nasıl gelir?

### Otomatik (uygulama açıkken)

1. Yeni sürüm deploy edilir (yeni `sw.js` + JS/CSS).
2. Kullanıcı PWA’yı veya siteyi **açık tutar** (arka planda bile).
3. Tarayıcı arka planda yeni Service Worker’ı indirir ve yükler.
4. Sayfada **“Yeni sürüm var. Yenilemek ister misiniz?”** penceresi çıkar.
5. Kullanıcı **Tamam** derse sayfa yenilenir ve **yeni sürüm** yüklenir.

### Manuel (Ayarlar)

- **Ayarlar → Mobil Uygulama & Güncellemeler** bölümünde **“Güncellemeleri kontrol et”** butonu var.
- Bu buton tarayıcının güncelleme kontrolünü tetikler.  
  Yeni sürüm varsa yine **“Yeni sürüm var. Yenilemek ister misiniz?”** penceresi çıkar; Tamam deyince sayfa yenilenir.

### Teknik akış (kısa)

- `registration.update()` → tarayıcı `sw.js`’i kontrol eder.  
- Dosya değiştiyse yeni SW kurulur, `onUpdate` çağrılır → confirm gösterilir.  
- Kullanıcı onaylarsa `SKIP_WAITING` gönderilir → yeni SW devreye girer → `controllerchange` → sayfa `reload` edilir.

---

## Özet

| Soru | Cevap |
|------|--------|
| Mobilden iniyor mu? | Evet; HTTPS’te yayındayken, Android’de “Uygulamayı İndir”, iOS’ta “Ana Ekrana Ekle”. |
| Güncelleme nasıl gelir? | Uygulama açıkken otomatik kontrol; çıkan pencerede “Yenile” ile yeni sürüm yüklenir. İstersen Ayarlar’dan “Güncellemeleri kontrol et” ile manuel tetiklenir. |
