import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  FaBell, FaCheckDouble, FaTrash, FaSyringe, FaBaby,
  FaStethoscope, FaInfoCircle, FaCheck, FaExclamationTriangle,
  FaBoxOpen, FaFilter, FaTrashAlt, FaCalendarAlt
} from 'react-icons/fa';
import * as api from '../services/api';
import { toast } from 'react-toastify';

// --- Styled Components ---

const PageContainer = styled.div`
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;

  h1 {
    font-size: 26px;
    font-weight: 800;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);

  &:hover {
    background: #f9f9f9;
    transform: translateY(-2px);
    color: #333;
  }
  
  &.danger {
    color: #c62828;
    border-color: #ffcdd2;
    &:hover { background: #ffebee; }
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 4px;
  
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: #eee; border-radius: 4px; }
`;

const TabButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.active ? '#4CAF50' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border: 1px solid ${props => props.active ? '#4CAF50' : '#ddd'};
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${props => props.active ? '#43A047' : '#f1f1f1'};
  }
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NotificationCard = styled.div`
  background: ${props => props.unread ? 'white' : '#f8f9fa'};
  border-radius: 12px;
  padding: 16px;
  box-shadow: ${props => props.unread ? '0 4px 12px rgba(0,0,0,0.06)' : 'none'};
  border: ${props => props.unread ? 'none' : '1px solid #eee'};
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border-left: 4px solid ${props => props.color};
  transition: all 0.2s;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.bg};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;

    h3 {
      margin: 0;
      font-size: 15px;
      color: #2c3e50;
      font-weight: 700;
    }

    .date {
      font-size: 11px;
      color: #95a5a6;
    }
  }

  .message {
    margin: 0;
    color: #555;
    font-size: 13px;
    line-height: 1.4;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    transition: background 0.2s;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.check { color: #4CAF50; &:hover { background: #E8F5E9; } }
    &.delete { color: #ef5350; &:hover { background: #FFEBEE; } }
  }
`;

const RandevuDetayOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;
const RandevuDetayKutu = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  border-left: 6px solid #0d9488;
  h3 { margin: 0 0 16px; font-size: 18px; color: #0f172a; }
  .satir { margin-bottom: 12px; font-size: 14px; }
  .satir strong { display: inline-block; min-width: 90px; color: #64748b; }
  .kapat { margin-top: 20px; padding: 10px 20px; border-radius: 10px; border: none; background: #0d9488; color: #fff; font-weight: 600; cursor: pointer; }
  .kapat:hover { background: #0f766e; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #95a5a6;

  svg {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.3;
  }
  p { font-size: 16px; margin: 0; }
`;

function Bildirimler() {
  const navigate = useNavigate();
  const [bildirimler, setBildirimler] = useState([]);
  const [aktifFiltre, setAktifFiltre] = useState('hepsi');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [detayBildirim, setDetayBildirim] = useState(null);

  const filtreler = [
    { id: 'hepsi', label: 'Tümü', icon: <FaBell /> },
    { id: 'okunmamis', label: 'Okunmamış', icon: <FaBell color="#E91E63" /> },
    { id: 'randevu', label: 'Randevu', icon: <FaCalendarAlt /> },
    { id: 'mesajlar', label: 'Mesajlar', icon: <FaInfoCircle /> },
    { id: 'saglik', label: 'Sağlık', icon: <FaStethoscope /> },
    { id: 'ureme', label: 'Doğum/Tohum', icon: <FaBaby /> },
    { id: 'stok', label: 'Stok & Yem', icon: <FaBoxOpen /> },
    { id: 'sistem', label: 'Diğer', icon: <FaInfoCircle /> }
  ];

  useEffect(() => {
    veriYukle();
  }, []);

  const veriYukle = async () => {
    setYukleniyor(true);
    try {
      const res = await api.getBildirimler({ limit: 100 });
      // Sadece aktif bildirimleri göster (soft-delete olmayanlar)
      const aktifler = (res.data.bildirimler || []).filter(b => b.aktif !== false);
      setBildirimler(aktifler);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      toast.error('Bildirimler yüklenemedi');
    } finally {
      setYukleniyor(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'okundu') {
        await api.bildirimOkunduIsaretle(id);
        setBildirimler(prev => prev.map(b => b._id === id ? { ...b, okundu: true } : b));
      } else if (action === 'sil') {
        await api.bildirimSil(id);
        setBildirimler(prev => prev.filter(b => b._id !== id));
        toast.success('Bildirim silindi');
      }
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const tumunuOkunduYap = async () => {
    try {
      await api.tumunuOkunduIsaretle();
      toast.success('Tümü okundu olarak işaretlendi');
      veriYukle();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const okunmuslariSil = async () => {
    if (!window.confirm('Okunmuş tüm bildirimleri silmek istiyor musunuz?')) return;
    try {
      const res = await api.silOkunmusBildirimler();
      toast.success(`${res.data.silinen} bildirim silindi`);
      veriYukle();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    }
  };

  const getStyle = (tip) => {
    switch (tip) {
      case 'asi': return { icon: <FaSyringe />, color: '#E91E63', bg: '#FCE4EC' };
      case 'dogum': return { icon: <FaBaby />, color: '#9C27B0', bg: '#F3E5F5' };
      case 'dogum_beklenen': return { icon: <FaBaby />, color: '#7B1FA2', bg: '#EDE7F6' };
      case 'dogum_gecikme': return { icon: <FaExclamationTriangle />, color: '#dc2626', bg: '#fef2f2' };
      case 'kizginlik': return { icon: <FaExclamationTriangle />, color: '#D32F2F', bg: '#FFEBEE' };
      case 'kuruya_alma':
      case 'kuru_donem': return { icon: <FaExclamationTriangle />, color: '#E65100', bg: '#FFF3E0' };
      case 'muayene':
      case 'tedavi':
      case 'hastalik':
        return { icon: <FaStethoscope />, color: '#2196F3', bg: '#E3F2FD' };
      case 'yem':
      case 'stok':
        return { icon: <FaExclamationTriangle />, color: '#FF9800', bg: '#FFF3E0' };
      case 'tohumlama': return { icon: <FaInfoCircle />, color: '#673AB7', bg: '#EDE7F6' };
      case 'randevu': return { icon: <FaCalendarAlt />, color: '#0d9488', bg: '#ccfbf1' };
      case 'danisma': return { icon: <FaInfoCircle />, color: '#7c3aed', bg: '#ede9fe' };
      default: return { icon: <FaBell />, color: '#4CAF50', bg: '#E8F5E9' };
    }
  };

  const handleRandevuDetayAc = async (b) => {
    setDetayBildirim(b);
    if (!b.okundu) {
      try {
        await api.bildirimOkunduIsaretle(b._id);
        setBildirimler(prev => prev.map(x => x._id === b._id ? { ...x, okundu: true } : x));
      } catch {}
    }
  };

  const filtrelenmis_data = bildirimler.filter(b => {
    if (aktifFiltre === 'hepsi') return true;
    if (aktifFiltre === 'okunmamis') return !b.okundu;
    if (aktifFiltre === 'randevu') return b.tip === 'randevu';
    if (aktifFiltre === 'mesajlar') return b.tip === 'danisma';
    if (aktifFiltre === 'saglik') return ['asi', 'muayene', 'hastalik', 'tedavi', 'saglik'].includes(b.tip);
    if (aktifFiltre === 'ureme') return ['dogum', 'dogum_beklenen', 'dogum_gecikme', 'tohumlama', 'kizginlik', 'kuruya_alma', 'kuru_donem'].includes(b.tip);
    if (aktifFiltre === 'stok') return ['yem', 'stok'].includes(b.tip);
    if (aktifFiltre === 'sistem') return !['asi', 'muayene', 'hastalik', 'tedavi', 'saglik', 'dogum', 'dogum_beklenen', 'dogum_gecikme', 'tohumlama', 'kizginlik', 'kuruya_alma', 'kuru_donem', 'yem', 'stok', 'randevu', 'danisma', 'odeme'].includes(b.tip);
    return true;
  });

  return (
    <PageContainer>
      <Header>
        <h1><FaBell color="#FFC107" /> Bildirimler</h1>
        <ButtonGroup>
          <ActionButton onClick={tumunuOkunduYap}>
            <FaCheckDouble /> Tümünü Oku
          </ActionButton>
          <ActionButton className="danger" onClick={okunmuslariSil}>
            <FaTrashAlt /> Okunmuşları Sil
          </ActionButton>
        </ButtonGroup>
      </Header>

      <TabContainer>
        {filtreler.map(f => (
          <TabButton
            key={f.id}
            active={aktifFiltre === f.id}
            onClick={() => setAktifFiltre(f.id)}
          >
            {f.icon} {f.label}
          </TabButton>
        ))}
      </TabContainer>

      <NotificationList>
        {yukleniyor ? (
          <EmptyState>Yükleniyor...</EmptyState>
        ) : filtrelenmis_data.length === 0 ? (
          <EmptyState>
            <FaBell />
            <p>Bu filtrede bildirim bulunmuyor.</p>
          </EmptyState>
        ) : (
          filtrelenmis_data.map(b => {
            const style = getStyle(b.tip);
            return (
              <NotificationCard
                key={b._id}
                unread={!b.okundu}
                color={style.color}
                onClick={
                  b.tip === 'randevu' ? () => handleRandevuDetayAc(b)
                  : b.tip === 'dogum_gecikme' ? () => { navigate('/'); if (!b.okundu) handleAction(b._id, 'okundu'); }
                  : undefined
                }
                style={(b.tip === 'randevu' || b.tip === 'dogum_gecikme') ? { cursor: 'pointer' } : {}}
              >
                <IconWrapper bg={style.bg} color={style.color}>
                  {style.icon}
                </IconWrapper>

                <Content>
                  <div className="header">
                    <h3>{b.baslik}</h3>
                    <span className="date">{new Date(b.hatirlatmaTarihi).toLocaleDateString('tr-TR')} {new Date(b.hatirlatmaTarihi).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="message">{b.mesaj}</p>
                </Content>

                <ActionButtons onClick={e => e.stopPropagation()}>
                  {!b.okundu && (
                    <button className="check" onClick={() => handleAction(b._id, 'okundu')} title="Okundu işaretle">
                      <FaCheck />
                    </button>
                  )}
                  <button className="delete" onClick={() => handleAction(b._id, 'sil')} title="Sil">
                    <FaTrash />
                  </button>
                </ActionButtons>
              </NotificationCard>
            );
          })
        )}
      </NotificationList>

      {detayBildirim && detayBildirim.tip === 'randevu' && (
        <RandevuDetayOverlay onClick={() => setDetayBildirim(null)}>
          <RandevuDetayKutu onClick={e => e.stopPropagation()}>
            <h3>📅 Randevu detayı</h3>
            {detayBildirim.metadata && (
              <>
                <div className="satir"><strong>Veteriner:</strong> {detayBildirim.metadata.veterinerAdi || '—'}</div>
                <div className="satir"><strong>Konu:</strong> {detayBildirim.metadata.baslik || '—'}</div>
                <div className="satir"><strong>Tarih:</strong> {detayBildirim.metadata.tarih ? new Date(detayBildirim.metadata.tarih).toLocaleDateString('tr-TR') : '—'}</div>
                <div className="satir"><strong>Saat:</strong> {detayBildirim.metadata.saat || 'Belirtilmedi'}</div>
                {detayBildirim.metadata.aciklama && <div className="satir"><strong>Not:</strong> {detayBildirim.metadata.aciklama}</div>}
              </>
            )}
            {!detayBildirim.metadata && <p className="message">{detayBildirim.mesaj}</p>}
            <button type="button" className="kapat" onClick={() => setDetayBildirim(null)}>Kapat</button>
          </RandevuDetayKutu>
        </RandevuDetayOverlay>
      )}

    </PageContainer>
  );
}

export default Bildirimler;
