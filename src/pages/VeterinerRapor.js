import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import * as api from '../services/api';
import VetPageShell from '../components/Vet/VetPageShell';

const RENKLER = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#14b8a6'];

export default function VeterinerRapor() {
  const navigate = useNavigate();
  const [donem, setDonem] = useState('Bu Ay');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ aylik: null, hastalik: [], cari: null });

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.getVeterinerRaporAylik(),
      api.getVeterinerHastalikDagilimi(),
      api.getVeterinerCari(),
    ]).then(([aRes, hRes, cRes]) => {
      setData({
        aylik: aRes.value?.data || null,
        hastalik: hRes.value?.data || [],
        cari: cRes.value?.data || null,
      });
    }).finally(() => setLoading(false));
  }, [donem]);

  const { aylik, hastalik, cari } = data;

  const hastalikList = Array.isArray(hastalik)
    ? hastalik.map(h => ({ name: h._id || h.tani || 'Diğer', value: h.count ?? h.toplamSayi ?? 0 }))
        .sort((a, b) => b.value - a.value).slice(0, 8)
    : [];

  const trendData = aylik?.aylikTrend || [];
  const borcluList = (cari?.list || []).filter(c => (c.bakiye || 0) > 0);

  const KPI = [
    { lbl: 'Toplam Kayıt', val: aylik?.toplamKayit ?? 0, ico: '📋', color: '#374151', bg: '#f3e8ff' },
    { lbl: 'Bu Ay Gelir', val: aylik?.toplamGelir ? `${aylik.toplamGelir.toLocaleString('tr-TR')} ₺` : '0 ₺', ico: '💰', color: '#16a34a', bg: '#dcfce7' },
    { lbl: 'Aktif Çiftlik', val: aylik?.ciftlikSayisi ?? 0, ico: '🏡', color: '#2563eb', bg: '#dbeafe' },
    { lbl: 'Açık Alacak', val: cari?.toplamBakiye > 0 ? `${cari.toplamBakiye.toLocaleString('tr-TR')} ₺` : '—', ico: '⚠️', color: cari?.toplamBakiye > 0 ? '#d97706' : '#9ca3af', bg: '#fef3c7' },
  ];

  return (
    <VetPageShell
      title="Raporlar"
      subtitle={new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
      actions={
        <div style={{ display: 'flex', gap: 6 }}>
          {['Bu Ay', '3 Ay', '6 Ay'].map(d => (
            <button key={d} onClick={() => setDonem(d)} style={{
              padding: '6px 12px', borderRadius: 20, border: '1px solid', fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: donem === d ? '#dbeafe' : '#fff',
              color: donem === d ? '#1e40af' : '#6b7280',
              borderColor: donem === d ? '#2563eb' : '#e5e7eb'
            }}>{d}</button>
          ))}
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
        {KPI.map((k, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{k.ico}</div>
              <span style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.4px' }}>{k.lbl}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: k.color, letterSpacing: '-.3px' }}>
              {loading ? '—' : k.val}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Tanı Dağılımı</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>Bu dönem sağlık kayıtları</div>
          {hastalikList.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={hastalikList} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} %${(percent * 100).toFixed(0)}`} labelLine={false} fontSize={10}>
                  {hastalikList.map((_, i) => <Cell key={i} fill={RENKLER[i % RENKLER.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v} kayıt`]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>Veri yok</div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>En Sık Tanılar</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>Kayıt sayısına göre</div>
          {hastalikList.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hastalikList} layout="vertical" margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#374151' }} width={90} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v} kayıt`]} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>Veri yok</div>
          )}
        </div>
      </div>

      {trendData.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Aylık Kayıt Trendi</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="ay" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="kayit" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Kayıt" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Cari Durum
          <button onClick={() => navigate('/finans')} style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Finansa Git →</button>
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>Müşteri bazında borç takibi</div>
        {borcluList.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>✅ Açık alacak yok</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {borcluList.slice(0, 6).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < borcluList.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#92400e', flexShrink: 0 }}>
                  {(c.isletmeAdi || c.isim || 'Ç')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#111827' }}>{c.isletmeAdi || c.isim || 'Çiftlik'}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#d97706' }}>{c.bakiye.toLocaleString('tr-TR')} ₺</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VetPageShell>
  );
}
