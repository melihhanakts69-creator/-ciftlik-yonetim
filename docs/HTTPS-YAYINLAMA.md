# Agrolina – Siteyi HTTPS ile Yayınlama

Projede **Vercel** için ayar zaten var (`vercel.json`). Vercel ve Netlify **varsayılan olarak HTTPS** verir; ekstra sertifika işlemi yok.

---

## 1. Vercel ile yayınlama (önerilen)

### Adımlar

1. **Vercel hesabı**  
   [vercel.com](https://vercel.com) → GitHub/GitLab/Bitbucket ile giriş yap.

2. **Projeyi bağla**  
   - "Add New Project" → "Import Git Repository"  
   - Repoyu seç (örn. `ciftlik-yonetim`)  
   - Root Directory: proje kökü (boş bırak)  
   - Framework: **Create React App** (otomatik algılanır)  
   - Build Command: `npm run build` (veya `vercel.json`’daki kullanılır)  
   - Output Directory: `build`  
   - **Environment Variable** ekle:  
     - `REACT_APP_API_URL` = `https://ciftlik-yonetim.onrender.com/api`  
     (Zaten `vercel.json`’da da tanımlı; yine de burada da ekleyebilirsin.)

3. **Deploy**  
   "Deploy"e tıkla. Birkaç dakika sonra site **https://xxx.vercel.app** adresinde yayında olur. **HTTPS otomatik açıktır.**

4. **Kendi domain’in varsa**  
   Vercel Dashboard → Project → Settings → Domains → "Add" ile domain ekle. Vercel DNS veya CNAME ile yönlendir; HTTPS yine otomatik gelir.

### Özet

- Repo’yu Vercel’e bağla → Deploy → **HTTPS hazır.**  
- Her `git push` (main/master) sonrası isteğe bağlı otomatik deploy açılabilir.

---

## 2. Netlify ile yayınlama (alternatif)

1. [netlify.com](https://netlify.com) → GitHub ile giriş.  
2. "Add new site" → "Import an existing project" → Repoyu seç.  
3. Ayarlar:  
   - Build command: `npm run build`  
   - Publish directory: `build`  
   - Environment variables: `REACT_APP_API_URL` = `https://ciftlik-yonetim.onrender.com/api`  
4. Deploy → Site **https://xxx.netlify.app** ile HTTPS’te yayında olur.

---

## 3. Render ile (sadece frontend)

Backend’i zaten Render’da kullanıyorsun. Frontend’i de Render’da "Static Site" olarak açabilirsin:

1. [render.com](https://render.com) → Dashboard → "New" → "Static Site".  
2. Repoyu bağla.  
3. Build: `npm run build`, Publish: `build`.  
4. Environment: `REACT_APP_API_URL` = `https://ciftlik-yonetim.onrender.com/api`.  
5. Deploy → **HTTPS** otomatik (örn. `https://ciftlik-yonetim.onrender.com` veya verdiği URL).

---

## 4. Kontrol

Yayına aldıktan sonra:

- Adres çubuğunda **https://** ve kilit ikonu olmalı.  
- Mobilde "Uygulamayı İndir" / "Ana Ekrana Ekle" bu HTTPS adresinde çalışır.  
- Service Worker da sadece bu ortamda (production) devreye girer.

---

## Hızlı seçim

| Platform | HTTPS | Not |
|----------|--------|-----|
| **Vercel** | Otomatik | Projede `vercel.json` hazır, repo bağlayıp deploy yeter. |
| **Netlify** | Otomatik | Benzer kurulum, alternatif. |
| **Render** | Otomatik | Backend zaten Render’da; frontend’i Static Site yapabilirsin. |

En pratik yol: **Vercel’e repo’yu bağlayıp "Deploy"** demek; HTTPS otomatik gelir, ekstra sertifika ayarı gerekmez.
