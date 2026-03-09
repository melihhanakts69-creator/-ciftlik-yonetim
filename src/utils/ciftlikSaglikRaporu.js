import jsPDF from 'jspdf';

export function indirCiftlikSaglikRaporu(data) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const { ciftci, veteriner, donem, inekSayisi, toplamKayit, toplamAsi, toplamMaliyet, hastalikDagilimi, devamEdenTedavi, kayitlar, asilar } = data;

    const mavi = [37, 99, 235];
    const koyu = [15, 23, 42];
    const gri = [100, 116, 139];
    const yesil = [16, 185, 129];
    const acikGri = [241, 245, 249];

    let y = 0;

    // ── Başlık bloğu ──────────────────────────────────────────────────────────
    doc.setFillColor(...mavi);
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Çiftlik Aylık Sağlık Raporu', 14, 14);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dönem: ${donem || ''}`, 14, 22);
    doc.text(`Hazırlayan: Dr. ${veteriner?.isim || ''}${veteriner?.klinikAdi ? ' · ' + veteriner.klinikAdi : ''}`, 14, 29);

    doc.setFontSize(10);
    doc.text(`Oluşturma: ${new Date().toLocaleDateString('tr-TR')}`, 150, 22);

    y = 46;

    // ── Çiftlik Bilgileri ────────────────────────────────────────────────────
    doc.setFillColor(...acikGri);
    doc.roundedRect(12, y, 186, 24, 3, 3, 'F');

    doc.setTextColor(...koyu);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(ciftci?.isletmeAdi || ciftci?.isim || 'Çiftlik', 18, y + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gri);
    const ciftciAlt = [ciftci?.isim, ciftci?.sehir, ciftci?.telefon].filter(Boolean).join('  ·  ');
    doc.text(ciftciAlt, 18, y + 16);

    y += 32;

    // ── Özet Metrikler ───────────────────────────────────────────────────────
    const metrikler = [
        { label: 'Hayvan Sayısı', value: String(inekSayisi || 0), renk: mavi },
        { label: 'Bu Ay Kayıt', value: String(toplamKayit || 0), renk: [139, 92, 246] },
        { label: 'Uygulanan Aşı', value: String(toplamAsi || 0), renk: yesil },
        { label: 'Devam Eden Tedavi', value: String(devamEdenTedavi || 0), renk: [245, 158, 11] },
        { label: 'Toplam Maliyet', value: `${(toplamMaliyet || 0).toLocaleString('tr-TR')} ₺`, renk: [239, 68, 68] },
    ];

    const kutu = 36;
    metrikler.forEach((m, i) => {
        const x = 12 + i * (kutu + 2.2);
        doc.setFillColor(...m.renk);
        doc.roundedRect(x, y, kutu, 22, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(m.value, x + kutu / 2, y + 10, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const labelLines = doc.splitTextToSize(m.label, kutu - 4);
        doc.text(labelLines, x + kutu / 2, y + 17, { align: 'center' });
    });

    y += 30;

    // ── Hastalık Dağılımı ────────────────────────────────────────────────────
    if (hastalikDagilimi && hastalikDagilimi.length > 0) {
        doc.setTextColor(...mavi);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Hastalık / Tanı Dağılımı', 14, y);
        y += 6;

        hastalikDagilimi.slice(0, 8).forEach((h, i) => {
            const barMax = hastalikDagilimi[0].sayi;
            const barW = Math.round((h.sayi / barMax) * 100);

            doc.setFillColor(...acikGri);
            doc.roundedRect(14, y, 180, 7, 1, 1, 'F');

            doc.setFillColor(...mavi);
            doc.roundedRect(14, y, Math.max(barW * 1.2, 4), 7, 1, 1, 'F');

            doc.setTextColor(...koyu);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(h.ad, 18, y + 5);

            doc.setFont('helvetica', 'bold');
            doc.text(`${h.sayi}`, 192, y + 5, { align: 'right' });

            y += 9;
        });
        y += 4;
    }

    // ── Kayıt Tablosu ────────────────────────────────────────────────────────
    if (kayitlar && kayitlar.length > 0) {
        if (y > 220) { doc.addPage(); y = 16; }

        doc.setTextColor(...mavi);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Sağlık Kayıtları', 14, y);
        y += 6;

        // Tablo başlığı
        doc.setFillColor(...mavi);
        doc.rect(12, y, 186, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Tarih', 14, y + 5.5);
        doc.text('Hayvan', 38, y + 5.5);
        doc.text('Tanı / Durum', 80, y + 5.5);
        doc.text('Durum', 148, y + 5.5);
        doc.text('Maliyet', 175, y + 5.5);
        y += 8;

        kayitlar.slice(0, 25).forEach((k, i) => {
            if (y > 270) { doc.addPage(); y = 16; }
            if (i % 2 === 0) {
                doc.setFillColor(248, 250, 252);
                doc.rect(12, y, 186, 8, 'F');
            }
            doc.setTextColor(...koyu);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');

            const tarih = k.tarih ? new Date(k.tarih).toLocaleDateString('tr-TR') : '-';
            const hayvan = doc.splitTextToSize(`${k.hayvanKupeNo || k.hayvanIsim || '-'}`, 36);
            const tani = doc.splitTextToSize(k.tani || '-', 60);
            const durumLabel = { devam_ediyor: 'Devam', iyilesti: 'İyileşti', kronik: 'Kronik', oldu: 'Öldü' };
            const maliyet = k.maliyet ? `${k.maliyet} ₺` : '-';

            doc.text(tarih, 14, y + 5);
            doc.text(hayvan, 38, y + 5);
            doc.text(tani, 80, y + 5);
            doc.text(durumLabel[k.durum] || k.durum || '-', 148, y + 5);
            doc.text(maliyet, 175, y + 5);
            y += 8;
        });

        y += 4;
    }

    // ── Uygulanan Aşılar ─────────────────────────────────────────────────────
    if (asilar && asilar.length > 0) {
        if (y > 230) { doc.addPage(); y = 16; }

        doc.setTextColor(...mavi);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Uygulanan Aşılar', 14, y);
        y += 6;

        asilar.forEach((a, i) => {
            if (y > 270) { doc.addPage(); y = 16; }
            if (i % 2 === 0) {
                doc.setFillColor(240, 253, 244);
                doc.rect(12, y, 186, 7, 'F');
            }
            doc.setTextColor(...koyu);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            const tarih = a.uygulamaTarihi ? new Date(a.uygulamaTarihi).toLocaleDateString('tr-TR') : '-';
            doc.text(tarih, 14, y + 5);
            doc.text(a.asiAdi || '-', 50, y + 5);
            doc.text(a.hayvanKupeNo || a.hayvanIsim || 'Sürü', 130, y + 5);
            y += 7;
        });
    }

    // ── Alt Bilgi ────────────────────────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...gri);
        doc.text(
            `Sayfa ${i} / ${pageCount}  —  Bu rapor Çiftlik Yönetim Sistemi tarafından oluşturulmuştur.`,
            105, 292, { align: 'center' }
        );
    }

    doc.save(`saglik-raporu-${(ciftci?.isletmeAdi || ciftci?.isim || 'ciftlik').replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 7)}.pdf`);
}
