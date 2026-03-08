import { jsPDF } from 'jspdf';

/**
 * Sağlık kaydından reçete / muayene formu PDF oluşturur ve indirir.
 * @param {Object} kayit - SaglikKaydi (tani, tedavi, ilaclar, hayvanIsim, hayvanKupeNo, tarih, veteriner, tip)
 * @param {string} klinikAdi - Opsiyonel klinik adı
 */
export function indirRecetePdf(kayit, klinikAdi = '') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 20;
  let y = 20;

  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(klinikAdi || 'Veteriner Muayene / Reçete', margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Tarih: ${kayit.tarih ? new Date(kayit.tarih).toLocaleDateString('tr-TR') : '-'}`, margin, y);
  if (kayit.veteriner) doc.text(String(kayit.veteriner).slice(0, 80), margin + 80, y);
  y += 10;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, 210 - margin, y);
  y += 12;

  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.text('Hayvan', margin, y);
  doc.text(`${kayit.hayvanIsim || ''} ${kayit.hayvanKupeNo ? `(Küpe: ${kayit.hayvanKupeNo})` : ''} ${kayit.hayvanTipi || ''}`.trim() || '-', margin + 25, y);
  y += 8;

  doc.text('Tanı / Teşhis', margin, y);
  doc.setFont(undefined, 'normal');
  doc.text(String(kayit.tani || '-').slice(0, 90), margin + 35, y);
  y += 8;

  if (kayit.tedavi) {
    doc.setFont(undefined, 'bold');
    doc.text('Tedavi', margin, y);
    doc.setFont(undefined, 'normal');
    doc.text(String(kayit.tedavi).slice(0, 90), margin + 25, y);
    y += 8;
  }

  if (kayit.ilaclar && kayit.ilaclar.length > 0) {
    doc.setFont(undefined, 'bold');
    doc.text('İlaçlar', margin, y);
    y += 5;
    doc.setFont(undefined, 'normal');
    kayit.ilaclar.forEach(il => {
      doc.text(`• ${il.ilacAdi || '-'}${il.doz ? ` (${il.doz})` : ''}${il.sure ? ` — ${il.sure}` : ''}`, margin + 5, y);
      y += 6;
    });
    y += 4;
  }

  if (kayit.notlar) {
    doc.setFont(undefined, 'bold');
    doc.text('Not', margin, y);
    doc.setFont(undefined, 'normal');
    doc.text(String(kayit.notlar).slice(0, 100), margin + 15, y);
    y += 10;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, 210 - margin, y);
  y += 8;
  doc.setFontSize(9);
  doc.text('Bu belge veteriner muayene / reçete özetidir. İlaç kullanımında prospektüs ve hekim talimatına uyunuz.', margin, y);

  const dosyaAdi = `recete_${(kayit.hayvanKupeNo || kayit._id || 'kayit').toString().slice(0, 20)}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(dosyaAdi);
}
