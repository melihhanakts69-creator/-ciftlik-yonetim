/**
 * Cron Scheduler — Otomatik bildirim görevleri
 * Render/Heroku'da çalışır (sleep mode'da bile cron tetiklenir).
 */
const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/User');
const { otomatikGorevleriKontrolEt } = require('./otomatikGorevler');

function startScheduler() {
  // Her 6 saatte bir tüm çiftçi hesapları için otomatik görevleri çalıştır
  cron.schedule('0 */6 * * *', async () => {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Scheduler] DB bağlı değil, atlanıyor');
      return;
    }
    try {
      const users = await User.find({ rol: 'ciftci', aktif: true }).select('_id').lean();
      console.log(`[Scheduler] Otomatik görevler başlatıldı — ${users.length} çiftçi`);
      for (const u of users) {
        try {
          await otomatikGorevleriKontrolEt(u._id);
        } catch (e) {
          console.error('[Scheduler] Hata (userId:', u._id, '):', e.message);
        }
      }
      console.log('[Scheduler] Otomatik görevler tamamlandı');
    } catch (err) {
      console.error('[Scheduler] Genel hata:', err);
    }
  }, { timezone: 'Europe/Istanbul' });

  console.log('✅ Scheduler başlatıldı (her 6 saatte bir otomatik bildirimler)');
}

module.exports = { startScheduler };
