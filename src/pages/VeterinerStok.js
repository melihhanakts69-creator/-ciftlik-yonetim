import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { FaPlus, FaPills, FaTrash, FaEdit } from 'react-icons/fa';
import { GiFertilizerBag, GiSpotedFlower } from 'react-icons/gi';
import * as api from '../services/api';

const PageContainer = styled.div`
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  position: relative;
  min-height: calc(100vh - 80px);
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;

  &::before {
    content: '';
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: 
      radial-gradient(circle at 15% 50%, rgba(16, 185, 129, 0.04) 0%, transparent 25%),
      radial-gradient(circle at 85% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 25%);
    background-color: #f8fafc;
    z-index: -1;
  }
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; flex-wrap: wrap; gap: 20px;
  h1 { font-size: 42px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.03em; line-height: 1.1;}
  p { color: #64748b; font-size: 18px; margin: 8px 0 0 0; font-weight: 500; }
  .btn-add { background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: white; border: none; padding: 18px 32px; border-radius: 16px; font-size: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4); }
  .btn-add:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 15px 35px -10px rgba(37, 99, 235, 0.5); }
`;

const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: #ffffff; border-radius: 24px; padding: 32px; border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex; align-items: center; gap: 24px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.06);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  &:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); border-color: #cbd5e1; }
  .icon { width: 72px; height: 72px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0;}
  .info .val { font-size: 36px; font-weight: 900; color: #0f172a; margin-bottom: 4px; line-height: 1; letter-spacing: -0.02em;}
  .info .lbl { font-size: 14px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;}
`;

const Card = styled.div`
  background: #ffffff; border-radius: 28px; padding: 40px; box-shadow: 0 15px 50px -15px rgba(0,0,0,0.06); border: 1px solid rgba(226, 232, 240, 0.8); overflow: hidden;
`;

const Table = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0; text-align: left;
  th { background: #f8fafc; color: #475569; font-size: 13px; font-weight: 800; text-transform: uppercase; padding: 20px 24px; border-bottom: 2px solid #e2e8f0; letter-spacing: 0.1em; }
  th:first-child { border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
  th:last-child { border-top-right-radius: 16px; border-bottom-right-radius: 16px; }
  td { padding: 24px; border-bottom: 1px solid #f1f5f9; font-size: 16px; color: #0f172a; font-weight: 600; transition: all 0.3s; }
  tbody tr { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer;}
  tbody tr:hover td { background: #f8fafc; }
  tbody tr:hover { transform: scale(1.01); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); }
  
  .badge { padding: 8px 16px; border-radius: 24px; font-size: 13px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;}
  .bg-blue { background: #e0f2fe; color: #0284c7; }
  .bg-orange { background: #ffedd5; color: #ea580c; }
  .bg-green { background: #dcfce7; color: #16a34a; }
  .bg-red { background: #fee2e2; color: #dc2626; }

  .actions button {
    background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 20px; margin-right: 20px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .actions button:hover { color: #3b82f6; transform: scale(1.2) translateY(-2px); }
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
  background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000;
`;

const ModalBox = styled.div`
  background: #fff; width: 90%; max-width: 560px; border-radius: 32px; padding: 48px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  h2 { margin: 0 0 32px 0; font-size: 28px; color: #0f172a; font-weight: 900; letter-spacing: -0.02em;}
  
  .form-group {
    margin-bottom: 24px;
    label { display: block; font-size: 14px; font-weight: 800; color: #475569; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
    input, select, textare {
      width: 100%; padding: 18px 24px; border: 2px solid #e2e8f0; border-radius: 16px;
      font-size: 16px; font-weight: 500; outline: none; transition: all 0.3s; background: #f8fafc; box-sizing: border-box;
      &:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
    }
  }

  .buttons { display: flex; gap: 16px; margin-top: 40px; }
  .btn-submit { flex: 2; background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: white; border: none; padding: 20px; border-radius: 16px; font-weight: 800; font-size: 16px; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.3);}
  .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(59, 130, 246, 0.4); }
  .btn-cancel { flex: 1; background: #f1f5f9; color: #64748b; border: none; padding: 20px; border-radius: 16px; font-weight: 800; font-size: 16px; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);}
  .btn-cancel:hover { background: #e2e8f0; color: #0f172a; }
  textarea {
    width: 100%; padding: 18px 24px; border: 2px solid #e2e8f0; border-radius: 16px;
    font-size: 16px; font-weight: 500; outline: none; transition: all 0.3s; background: #f8fafc; box-sizing: border-box; resize: vertical; min-height: 100px;
    &:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
  }
`;

export default function VeterinerStok() {
  const [stoklar, setStoklar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ urunAdi: '', kategori: 'İlaç', miktar: '', birim: 'kutu', kritikSeviye: 5 });

  const fetchStok = async () => {
    try {
      const res = await api.getStoklar();
      const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const vetItems = (items || []).filter(s => s.kategori !== 'Yem');
      setStoklar(vetItems);
    } catch (e) {
      toast.error('Klinik stok bilgileri çekilemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStok(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.createStok({
        ...form,
        miktar: Number(form.miktar),
        kritikSeviye: Number(form.kritikSeviye)
      });
      toast.success('Stok kaydedildi.');
      setModalOpen(false);
      fetchStok();
    } catch (e) {
      toast.error('Kaydedilirken hata oluştu.');
    }
  };

  const getKatBadgeClass = (kat) => {
    if (kat === 'İlaç') return 'bg-blue';
    if (kat === 'Vitamin' || kat === 'Tohum') return 'bg-green';
    if (kat === 'Ekipman') return 'bg-orange';
    return 'bg-blue';
  };

  return (
    <PageContainer>
      <Header>
        <div>
          <h1>Klinik Reçete ve Tohum Stoğu</h1>
          <p>Deponuzdaki veterinerlik ürünleri ve suni tohumlama materyalleri (sperma vs).</p>
        </div>
        <button className="btn-add" onClick={() => { setForm({ urunAdi: '', kategori: 'İlaç', miktar: '', birim: 'kutu', kritikSeviye: 5 }); setModalOpen(true); }}>
          <FaPlus /> Yeni Ürün Ekle
        </button>
      </Header>

      <StatsGrid>
        <StatCard>
          <div className="icon" style={{ background: '#E3F2FD', color: '#1976D2' }}><FaPills /></div>
          <div className="info">
            <div className="val">{stoklar.filter(s => s.kategori === 'İlaç').length}</div>
            <div className="lbl">Aktif İlaç Sayısı</div>
          </div>
        </StatCard>
        <StatCard>
          <div className="icon" style={{ background: '#E8F5E9', color: '#2E7D32' }}><GiSpotedFlower /></div>
          <div className="info">
            <div className="val">{stoklar.filter(s => s.kategori === 'Tohum').reduce((a, b) => a + b.miktar, 0)}</div>
            <div className="lbl">Toplam Tohum / Sperma</div>
          </div>
        </StatCard>
        <StatCard>
          <div className="icon" style={{ background: '#FFEBEE', color: '#D32F2F' }}><FaTrash /></div>
          <div className="info">
            <div className="val">{stoklar.filter(s => s.miktar <= s.kritikSeviye).length}</div>
            <div className="lbl">Kritik Seviyedeki Stoklar</div>
          </div>
        </StatCard>
      </StatsGrid>

      <Card>
        {loading ? (<div>Yükleniyor...</div>) : (
          <Table>
            <thead>
              <tr>
                <th>Ürün Adı</th>
                <th>Kategori</th>
                <th>Mevcut Miktar</th>
                <th>Kritik Seviye</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {stoklar.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>Henüz bir malzeme/tohum eklenmemiş.</td></tr>
              ) : stoklar.map(s => (
                <tr key={s._id}>
                  <td><strong>{s.urunAdi}</strong></td>
                  <td><span className={`badge ${getKatBadgeClass(s.kategori)}`}>{s.kategori}</span></td>
                  <td style={{ color: s.miktar <= s.kritikSeviye ? '#D32F2F' : '#2E7D32', fontWeight: 700 }}>
                    {s.miktar} {s.birim}
                  </td>
                  <td>{s.kritikSeviye} {s.birim}</td>
                  <td className="actions">
                    <button><FaEdit /></button>
                    <button style={{ color: '#ef4444' }}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {modalOpen && (
        <ModalOverlay>
          <ModalBox>
            <h2>Stok Kalemi Ekle</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Ürün / Tohum Adı</label>
                <input required value={form.urunAdi} onChange={e => setForm({ ...form, urunAdi: e.target.value })} placeholder="Örn: Holstein Sperma, Mastitis Kremi" />
              </div>
              <div className="form-group">
                <label>Kategori</label>
                <select value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
                  <option value="İlaç">İlaç & Antibiyotik</option>
                  <option value="Vitamin">Vitamin & Mineral</option>
                  <option value="Tohum">Suni Tohum / Sperma</option>
                  <option value="Ekipman">Klinik Ekipman</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Miktar</label>
                  <input required type="number" min="0" value={form.miktar} onChange={e => setForm({ ...form, miktar: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Birim</label>
                  <select value={form.birim} onChange={e => setForm({ ...form, birim: e.target.value })}>
                    <option value="adet">Adet</option>
                    <option value="kutu">Kutu</option>
                    <option value="doz">Doz</option>
                    <option value="ml">ML</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Uyarı Seviyesi (Minimum Stok)</label>
                <input type="number" value={form.kritikSeviye} onChange={e => setForm({ ...form, kritikSeviye: e.target.value })} />
              </div>

              <div className="buttons">
                <button type="submit" className="btn-submit">Kaydet</button>
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>İptal</button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}
