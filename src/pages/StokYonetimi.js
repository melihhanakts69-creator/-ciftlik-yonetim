import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaPlus, FaTimes } from 'react-icons/fa';
import * as api from '../services/api';
import { toast } from 'react-toastify';

const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px 40px;
  font-family: 'Inter', system-ui, sans-serif;
  animation: ${fadeIn} 0.35s ease;

  @media (max-width: 768px) {
    padding: 0 12px 80px;
  }
`;

const TabRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const TabBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid ${p => p.$active ? '#16a34a' : '#e5e7eb'};
  background: ${p => p.$active ? '#dcfce7' : '#fff'};
  color: ${p => p.$active ? '#166534' : '#6b7280'};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #16a34a;
    background: #f0fdf4;
  }
`;

const TabBadge = styled.span`
  background: #dc2626;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
`;

const ContentCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
`;

const KritikBanner = ({ stoklar, onAlimPlanla }) => (
  <div style={{
    background: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: 10,
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  }}>
    <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
    <span style={{ flex: 1, fontSize: 13, color: '#92400e', fontWeight: 500 }}>
      {stoklar.length} yem kritik seviyede:{' '}
      <strong>{stoklar.map(s => s.urunAdi).join(', ')}</strong>
    </span>
    <button
      onClick={onAlimPlanla}
      style={{
        background: '#d97706', color: '#fff', border: 'none',
        borderRadius: 20, padding: '4px 14px',
        fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
      }}
    >
      Alım Planla
    </button>
  </div>
);

const StokItem = ({ stok, onGuncelle, onDuzenle }) => {
  const gun = stok.gunlukTuketim > 0
    ? Math.floor(stok.miktar / stok.gunlukTuketim)
    : 999;

  const renk = gun >= 30 ? '#16a34a' : gun >= 14 ? '#d97706' : '#dc2626';
  const pct = Math.min((gun / 60) * 100, 100);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 0', borderBottom: '1px solid #f3f4f6'
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: gun < 14 ? '#fef2f2' : '#f0fdf4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16
      }}>
        🌾
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
          {stok.urunAdi}
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
          {stok.birimFiyat ? `${stok.birimFiyat} ₺/${stok.birim}` : ''}
          {stok.gunlukTuketim > 0 ? ` · günlük ${stok.gunlukTuketim} ${stok.birim}` : ''}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
          {Number(stok.miktar).toLocaleString('tr-TR')} {stok.birim}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: renk, marginTop: 2 }}>
          {gun >= 999 ? '—' : `${gun} gün yeter`}
        </div>
        <div style={{
          width: 80, height: 3, background: '#f3f4f6',
          borderRadius: 2, marginTop: 6, overflow: 'hidden'
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: renk,
            width: `${pct}%`,
            transition: 'width .6s ease'
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        <button
          onClick={() => onGuncelle(stok._id, 'ekle', 100)}
          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: '#166534', cursor: 'pointer' }}
        >
          +100
        </button>
        <button
          onClick={() => onDuzenle(stok)}
          style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: '#6b7280', cursor: 'pointer' }}
        >
          Düzenle
        </button>
      </div>
    </div>
  );
};

const YemDeposu = ({ stoklar, alimOnerisi, onGuncelle, onDuzenle, onYeniStok }) => (
  <>
    <ContentCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Yem Listesi</span>
        <button
          onClick={onYeniStok}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#16a34a', color: '#fff', border: 'none',
            borderRadius: 8, padding: '6px 12px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer'
          }}
        >
          <FaPlus size={10} /> Yeni Yem
        </button>
      </div>
      {stoklar.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af', fontSize: 13 }}>
          Henüz yem stoku yok. Yeni Yem ile ekleyin.
        </div>
      ) : (
        stoklar.map(s => (
          <StokItem key={s._id} stok={s} onGuncelle={onGuncelle} onDuzenle={onDuzenle} />
        ))
      )}
    </ContentCard>

    {alimOnerisi?.oneriler?.length > 0 && (
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 12, padding: 16, marginTop: 16
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 12
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
            🛒 30 günlük alım önerisi
          </span>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            Toplam tahmini:{' '}
            <strong style={{ color: '#111827' }}>
              {(alimOnerisi.toplamMaliyet || 0).toLocaleString('tr-TR')} ₺
            </strong>
          </span>
        </div>

        {alimOnerisi.oneriler.map(o => (
          <div key={o._id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 0', borderBottom: '1px solid #f3f4f6'
          }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{o.urunAdi}</span>
              <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>
                {o.yeterlilikGun} gün yeter
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
              {o.gerekliKg} {o.birim || 'kg'} al
            </span>
            {o.tahminiMaliyet > 0 && (
              <span style={{ fontSize: 11, color: '#9ca3af' }}>
                ~{o.tahminiMaliyet.toLocaleString('tr-TR')} ₺
              </span>
            )}
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px',
              borderRadius: 20,
              background: o.oncelik === 'acil' ? '#fef2f2' : '#fef3c7',
              color: o.oncelik === 'acil' ? '#991b1b' : '#92400e'
            }}>
              {o.oncelik === 'acil' ? 'Acil' : 'Bu hafta'}
            </span>
          </div>
        ))}
      </div>
    )}
  </>
);

const DigerStokItem = ({ stok, onDuzenle }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 0', borderBottom: '1px solid #f3f4f6'
  }}>
    <div style={{
      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
      background: '#f3f4f6',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 16
    }}>
      💊
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{stok.urunAdi}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
        {stok.kategori} · Min: {stok.kritikSeviye} {stok.birim}
      </div>
    </div>
    <div style={{ textAlign: 'right', flexShrink: 0 }}>
      <div style={{
        fontSize: 13, fontWeight: 600,
        color: stok.miktar <= stok.kritikSeviye ? '#dc2626' : '#111827'
      }}>
        {Number(stok.miktar).toLocaleString('tr-TR')} {stok.birim}
      </div>
    </div>
    <button
      onClick={() => onDuzenle(stok)}
      style={{
        background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6,
        padding: '4px 10px', fontSize: 11, color: '#6b7280', cursor: 'pointer'
      }}
    >
      Düzenle
    </button>
  </div>
);

const DigerStok = ({ stoklar, onDuzenle, onYeniStok }) => (
  <ContentCard>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>İlaç & Ekipman</span>
      <button
        onClick={onYeniStok}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#16a34a', color: '#fff', border: 'none',
          borderRadius: 8, padding: '6px 12px',
          fontSize: 12, fontWeight: 600, cursor: 'pointer'
        }}
      >
        <FaPlus size={10} /> Yeni Ekle
      </button>
    </div>
    {stoklar.length === 0 ? (
      <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af', fontSize: 13 }}>
        Henüz ilaç/ekipman stoku yok.
      </div>
    ) : (
      stoklar.map(s => (
        <DigerStokItem key={s._id} stok={s} onDuzenle={onDuzenle} />
      ))
    )}
  </ContentCard>
);

const CATS = ['Yem', 'İlaç', 'Vitamin', 'Ekipman', 'Diğer'];
const EMPTY = {
  urunAdi: '',
  kategori: 'Diğer',
  miktar: 0,
  birim: 'adet',
  kritikSeviye: 10,
  birimFiyat: 0,
  sonKullanmaTarihi: '',
  lotNo: '',
  tedarikci: '',
  notlar: '',
  yemKutuphanesiId: undefined
};

export default function StokYonetimi({ embedded }) {
  const [tab, setTab] = useState('yem');
  const [stoklar, setStoklar] = useState([]);
  const [alimOnerisi, setAlimOnerisi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAlimModal, setShowAlimModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [yemKutuphanesi, setYemKutuphanesi] = useState([]);
  const [yemDetay, setYemDetay] = useState(null);
  const [aktifIlaclar, setAktifIlaclar] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getStoklar(),
      api.getAlimOnerisi().catch(() => ({ data: null })),
      api.getYemKutuphanesi().catch(() => ({ data: [] }))
    ]).then(([stokRes, alimRes, ykRes]) => {
      setStoklar(stokRes.data || []);
      setAlimOnerisi(alimRes?.data || null);
      setYemKutuphanesi(Array.isArray(ykRes?.data) ? ykRes.data : []);
    }).catch(() => toast.error('Stok verileri yüklenemedi'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.getSaglikKayitlari({ durum: 'devam_ediyor' })
      .then(r => {
        const kayitlar = r.data?.kayitlar ?? r.data ?? [];
        const arr = Array.isArray(kayitlar) ? kayitlar : [];
        const ilaclar = [];
        arr.forEach(kayit => {
          if (kayit.tip === 'tohumlama' || kayit.tip === 'asi') return;
          (kayit.ilaclar || []).forEach(ilac => {
            if (ilac.ilacAdi) {
              ilaclar.push({
                ilacAdi: ilac.ilacAdi,
                doz: ilac.doz,
                hayvanIsim: kayit.hayvanIsim || kayit.hayvanKupeNo,
                tarih: kayit.tarih,
                kayitId: kayit._id,
              });
            }
          });
        });
        setAktifIlaclar(ilaclar);
      })
      .catch(() => {});
  }, []);

  const load = () => {
    api.getStoklar().then(r => setStoklar(r.data || []));
    api.getAlimOnerisi().catch(() => null).then(r => setAlimOnerisi(r?.data || null));
  };

  const yemStoklar = stoklar.filter(s => s.kategori === 'Yem');
  const digerStoklar = stoklar.filter(s => s.kategori !== 'Yem');
  const kritikYemler = yemStoklar.filter(s =>
    s.gunlukTuketim > 0 && (s.miktar / s.gunlukTuketim) < 14
  );
  const kritikStoklar = kritikYemler;

  const handleGuncelle = async (id, islem, miktar) => {
    try {
      await api.updateStok(id, { miktar, islem });
      toast.success('Stok güncellendi');
      load();
    } catch { toast.error('Güncelleme hatası'); }
  };

  const handleDuzenle = (item) => {
    setEditing(item);
    const yemId = item.yemKutuphanesiId?._id || item.yemKutuphanesiId;
    const yem = yemId ? yemKutuphanesi.find(y => String(y._id) === String(yemId)) : null;
    setYemDetay(yem || null);
    const skt = item.sonKullanmaTarihi;
    setForm({
      urunAdi: item.urunAdi,
      kategori: item.kategori,
      miktar: item.miktar,
      birim: item.birim,
      kritikSeviye: item.kritikSeviye ?? 10,
      birimFiyat: item.birimFiyat ?? 0,
      sonKullanmaTarihi: skt ? (typeof skt === 'string' ? skt.slice(0, 10) : new Date(skt).toISOString().slice(0, 10)) : '',
      lotNo: item.lotNo || '',
      tedarikci: item.tedarikci || '',
      notlar: item.notlar || '',
      yemKutuphanesiId: item.yemKutuphanesiId || undefined
    });
    setShowModal(true);
  };

  const openYeni = () => {
    setEditing(null);
    setYemDetay(null);
    setForm({ ...EMPTY, kategori: tab === 'yem' ? 'Yem' : 'İlaç' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      miktar: Number(form.miktar),
      kritikSeviye: Number(form.kritikSeviye),
      birimFiyat: Number(form.birimFiyat) || 0,
      sonKullanmaTarihi: form.sonKullanmaTarihi || null,
      lotNo: form.lotNo || '',
      tedarikci: form.tedarikci || '',
      notlar: form.notlar || ''
    };
    try {
      if (editing) {
        await api.updateStok(editing._id, payload);
        toast.success('Stok güncellendi');
      } else {
        await api.createStok(payload);
        toast.success('Stok eklendi');
      }
      setShowModal(false);
      setEditing(null);
      setForm(EMPTY);
      load();
    } catch { toast.error('İşlem başarısız'); }
  };

  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 14 }}>Yükleniyor…</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {kritikStoklar.length > 0 && (
        <KritikBanner stoklar={kritikStoklar} onAlimPlanla={() => setShowAlimModal(true)} />
      )}

      <TabRow>
        <TabBtn $active={tab === 'yem'} onClick={() => setTab('yem')}>
          🌿 Yem Deposu
          {kritikYemler.length > 0 && <TabBadge>{kritikYemler.length}</TabBadge>}
        </TabBtn>
        <TabBtn $active={tab === 'diger'} onClick={() => setTab('diger')}>
          💊 İlaç & Ekipman
        </TabBtn>
      </TabRow>

      {tab === 'yem' && (
        <YemDeposu
          stoklar={yemStoklar}
          alimOnerisi={alimOnerisi}
          onGuncelle={handleGuncelle}
          onDuzenle={handleDuzenle}
          onYeniStok={openYeni}
        />
      )}
      {tab === 'diger' && (
        <>
          {aktifIlaclar.length > 0 && (
            <div style={{
              background: '#fff', border: '1px solid #fde68a',
              borderRadius: 12, overflow: 'hidden', marginBottom: 12
            }}>
              <div style={{ padding: '10px 14px', background: '#fffbeb', borderBottom: '1px solid #fde68a', fontSize: 12, fontWeight: 600, color: '#92400e' }}>
                💊 Aktif Tedavide Kullanılan İlaçlar ({aktifIlaclar.length})
              </div>
              {aktifIlaclar.map((ilac, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: i < aktifIlaclar.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>💊</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{ilac.ilacAdi}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                      🐄 {ilac.hayvanIsim} · {ilac.doz || 'Doz belirtilmemiş'} · {new Date(ilac.tarih).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: '#fef2f2', color: '#991b1b' }}>
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          )}
          <DigerStok stoklar={digerStoklar} onDuzenle={handleDuzenle} onYeniStok={openYeni} />
        </>
      )}

      {/* Edit/Add Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>
                {editing ? 'Stok Düzenle' : 'Yeni Stok Ekle'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 5 }}>Ürün Adı *</label>
                <input
                  required
                  value={form.urunAdi}
                  onChange={upd('urunAdi')}
                  placeholder="örn: Arpa, Penisilin, Şırınga"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 5 }}>Kategori *</label>
                  <select value={form.kategori} onChange={upd('kategori')} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}>
                    <option value="Yem">🌿 Yem</option>
                    <option value="İlaç">💊 İlaç</option>
                    <option value="Antibiyotik">🧪 Antibiyotik</option>
                    <option value="Vitamin">💉 Vitamin</option>
                    <option value="Aşı">🩺 Aşı</option>
                    <option value="Ekipman">🔧 Ekipman</option>
                    <option value="Diğer">📦 Diğer</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 5 }}>Birim *</label>
                  <select value={form.birim} onChange={upd('birim')} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}>
                    <option value="kg">kg</option>
                    <option value="lt">litre</option>
                    <option value="adet">adet</option>
                    <option value="doz">doz</option>
                    <option value="kutu">kutu</option>
                    <option value="torba">torba</option>
                    <option value="şişe">şişe</option>
                    <option value="ml">ml</option>
                    <option value="gram">gram</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 5 }}>Mevcut Miktar *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number" required min={0} step="0.1"
                      value={form.miktar}
                      onChange={e => setForm(p => ({ ...p, miktar: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '9px 36px 9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, boxSizing: 'border-box' }}
                    />
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#9ca3af' }}>{form.birim}</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 5 }}>Birim Fiyat</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number" min={0} step="0.01"
                      value={form.birimFiyat}
                      onChange={e => setForm(p => ({ ...p, birimFiyat: Number(e.target.value) }))}
                      placeholder="0.00"
                      style={{ width: '100%', padding: '9px 36px 9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, boxSizing: 'border-box' }}
                    />
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#9ca3af' }}>₺/{form.birim}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 5 }}>Kritik Seviye</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number" min={0}
                      value={form.kritikSeviye}
                      onChange={e => setForm(p => ({ ...p, kritikSeviye: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '9px 36px 9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, boxSizing: 'border-box' }}
                    />
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#9ca3af' }}>{form.birim}</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 5 }}>Tedarikçi</label>
                  <input
                    value={form.tedarikci}
                    onChange={upd('tedarikci')}
                    placeholder="Tedarikçi adı"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {['İlaç', 'Antibiyotik', 'Vitamin', 'Aşı'].includes(form.kategori) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 12, background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 5 }}>Son Kullanma Tarihi</label>
                    <input
                      type="date"
                      value={form.sonKullanmaTarihi || ''}
                      onChange={upd('sonKullanmaTarihi')}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 5 }}>Lot / Seri No</label>
                    <input
                      value={form.lotNo || ''}
                      onChange={upd('lotNo')}
                      placeholder="LOT12345"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {form.kategori === 'Yem' && yemKutuphanesi.length > 0 && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 5 }}>
                    Yem Kütüphanesi Eşleştirme
                    <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6, color: '#9ca3af' }}>(rasyon hesabı için)</span>
                  </label>
                  <select
                    value={form.yemKutuphanesiId || ''}
                    onChange={e => {
                      const secilenId = e.target.value || undefined;
                      const secilenYem = yemKutuphanesi.find(y => y._id === secilenId);
                      setForm(p => ({ ...p, yemKutuphanesiId: secilenId, ...(secilenYem?.birimFiyat != null ? { birimFiyat: secilenYem.birimFiyat } : {}) }));
                      setYemDetay(secilenYem || null);
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                  >
                    <option value="">— Seç (opsiyonel) —</option>
                    {yemKutuphanesi.map(y => <option key={y._id} value={y._id}>{y.ad}</option>)}
                  </select>
                  {yemDetay && (
                    <div style={{
                      background: '#f0fdf4', border: '1px solid #bbf7d0',
                      borderRadius: 8, padding: '10px 14px', marginTop: 4
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: '#166534', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                        Besin Değerleri (1 kg)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        {[
                          { lbl: 'Kuru Madde', val: `%${yemDetay.kuruMadde || 0}` },
                          { lbl: 'Ham Protein', val: `%${yemDetay.protein || 0}` },
                          { lbl: 'Enerji', val: `${yemDetay.enerji || 0} Mcal` },
                          { lbl: 'Nişasta', val: `%${yemDetay.nisasta || 0}` },
                        ].map((item, i) => (
                          <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: '#16a34a', marginBottom: 2 }}>{item.lbl}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>{item.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.4px', display: 'block', marginBottom: 5 }}>Notlar</label>
                <textarea
                  value={form.notlar || ''}
                  onChange={upd('notlar')}
                  placeholder="Ek bilgi veya hatırlatma..."
                  rows={2}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              {form.miktar > 0 && form.birimFiyat > 0 && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#166534' }}>Toplam stok değeri</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>
                    {(form.miktar * form.birimFiyat).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                >
                  {editing ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alım Önerisi Modal */}
      {showAlimModal && alimOnerisi?.oneriler?.length > 0 && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
          }}
          onClick={() => setShowAlimModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 16, padding: 24, maxWidth: 480, width: '100%',
              boxShadow: '0 24px 60px rgba(0,0,0,0.2)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>🛒 Alım Önerisi</h3>
              <button onClick={() => setShowAlimModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><FaTimes /></button>
            </div>
            <div style={{ marginBottom: 12, fontSize: 12, color: '#6b7280' }}>
              Toplam tahmini: <strong style={{ color: '#111827' }}>{(alimOnerisi.toplamMaliyet || 0).toLocaleString('tr-TR')} ₺</strong>
            </div>
            {alimOnerisi.oneriler.map(o => (
              <div key={o._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{o.urunAdi}</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{o.yeterlilikGun} gün</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{o.gerekliKg} kg</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: o.oncelik === 'acil' ? '#fef2f2' : '#fef3c7', color: o.oncelik === 'acil' ? '#991b1b' : '#92400e' }}>{o.oncelik === 'acil' ? 'Acil' : 'Bu hafta'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
