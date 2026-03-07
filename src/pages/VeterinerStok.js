import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { FaPlus, FaPills, FaTrash, FaEdit } from 'react-icons/fa';
import { GiFertilizerBag, GiSpotedFlower } from 'react-icons/gi';
import * as api from '../services/api';

const PageContainer = styled.div`
  animation: fadeIn 0.4s ease;
  font-family: 'Inter', sans-serif;
  color: #333;
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
  h1 { font-size: 24px; font-weight: 700; color: #2c3e50; margin: 0; }
  p { color: #7f8c8d; font-size: 14px; margin: 4px 0 0 0; }
  .btn-add { background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
  .btn-add:hover { background: #1E88E5; }
`;

const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;
  display: flex; align-items: center; gap: 16px;
  .icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .info .val { font-size: 20px; font-weight: 700; color: #2c3e50; margin-bottom: 2px; }
  .info .lbl { font-size: 13px; color: #7f8c8d; font-weight: 500; }
`;

const Card = styled.div`
  background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.03);
`;

const Table = styled.table`
  width: 100%; border-collapse: collapse; text-align: left;
  th { background: #f8fafc; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; padding: 14px 16px; border-bottom: 1px solid #e2e8f0; }
  td { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #2c3e50; font-weight: 500; }
  tbody tr:hover { background: #f8fafc; }
  
  .badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .bg-blue { background: #E3F2FD; color: #1976D2; }
  .bg-orange { background: #FFF3E0; color: #E65100; }
  .bg-green { background: #E8F5E9; color: #2E7D32; }
  .bg-red { background: #FFEBEE; color: #D32F2F; }

  .actions button {
    background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 16px; margin-right: 12px; transition: 0.2s;
  }
  .actions button:hover { color: #2c3e50; }
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000;
`;

const ModalBox = styled.div`
  background: white; width: 90%; max-width: 500px; border-radius: 16px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  h2 { margin: 0 0 20px 0; font-size: 20px; color: #2c3e50; }
  
  .form-group {
    margin-bottom: 16px;
    label { display: block; font-size: 13px; font-weight: 600; color: #34495e; margin-bottom: 6px; }
    input, select, textarea {
      width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 14px; outline: none; transition: 0.2s; background: #f8fafc; box-sizing: border-box;
      &:focus { border-color: #2196F3; background: white; }
    }
  }

  .buttons { display: flex; gap: 10px; margin-top: 24px; }
  .btn-submit { flex: 2; background: #2196F3; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 700; cursor: pointer; }
  .btn-cancel { flex: 1; background: #f1f5f9; color: #64748b; border: none; padding: 12px; border-radius: 8px; font-weight: 700; cursor: pointer; }
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
        <button className="btn-add" onClick={() => { setForm({urunAdi:'',kategori:'İlaç',miktar:'',birim:'kutu',kritikSeviye:5}); setModalOpen(true); }}>
          <FaPlus /> Yeni Ürün Ekle
        </button>
      </Header>

      <StatsGrid>
        <StatCard>
           <div className="icon" style={{background:'#E3F2FD', color:'#1976D2'}}><FaPills/></div>
           <div className="info">
             <div className="val">{stoklar.filter(s => s.kategori === 'İlaç').length}</div>
             <div className="lbl">Aktif İlaç Sayısı</div>
           </div>
        </StatCard>
        <StatCard>
           <div className="icon" style={{background:'#E8F5E9', color:'#2E7D32'}}><GiSpotedFlower/></div>
           <div className="info">
             <div className="val">{stoklar.filter(s => s.kategori === 'Tohum').reduce((a, b) => a + b.miktar, 0)}</div>
             <div className="lbl">Toplam Tohum / Sperma</div>
           </div>
        </StatCard>
        <StatCard>
           <div className="icon" style={{background:'#FFEBEE', color:'#D32F2F'}}><FaTrash/></div>
           <div className="info">
             <div className="val">{stoklar.filter(s => s.miktar <= s.kritikSeviye).length}</div>
             <div className="lbl">Kritik Seviyedeki Stoklar</div>
           </div>
        </StatCard>
      </StatsGrid>

      <Card>
        {loading ? ( <div>Yükleniyor...</div> ) : (
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
                <tr><td colSpan="5" style={{textAlign:'center', color:'#94a3b8'}}>Henüz bir malzeme/tohum eklenmemiş.</td></tr>
              ) : stoklar.map(s => (
                <tr key={s._id}>
                  <td><strong>{s.urunAdi}</strong></td>
                  <td><span className={`badge ${getKatBadgeClass(s.kategori)}`}>{s.kategori}</span></td>
                  <td style={{ color: s.miktar <= s.kritikSeviye ? '#D32F2F' : '#2E7D32', fontWeight: 700 }}>
                    {s.miktar} {s.birim}
                  </td>
                  <td>{s.kritikSeviye} {s.birim}</td>
                  <td className="actions">
                     <button><FaEdit/></button>
                     <button style={{color:'#ef4444'}}><FaTrash/></button>
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
                <input required value={form.urunAdi} onChange={e => setForm({...form, urunAdi: e.target.value})} placeholder="Örn: Holstein Sperma, Mastitis Kremi" />
              </div>
              <div className="form-group">
                <label>Kategori</label>
                <select value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})}>
                  <option value="İlaç">İlaç & Antibiyotik</option>
                  <option value="Vitamin">Vitamin & Mineral</option>
                  <option value="Tohum">Suni Tohum / Sperma</option>
                  <option value="Ekipman">Klinik Ekipman</option>
                </select>
              </div>
              <div style={{display:'flex', gap:10}}>
                <div className="form-group" style={{flex:2}}>
                  <label>Miktar</label>
                  <input required type="number" min="0" value={form.miktar} onChange={e => setForm({...form, miktar: e.target.value})} />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label>Birim</label>
                  <select value={form.birim} onChange={e => setForm({...form, birim: e.target.value})}>
                     <option value="adet">Adet</option>
                     <option value="kutu">Kutu</option>
                     <option value="doz">Doz</option>
                     <option value="ml">ML</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Uyarı Seviyesi (Minimum Stok)</label>
                <input type="number" value={form.kritikSeviye} onChange={e => setForm({...form, kritikSeviye: e.target.value})} />
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
