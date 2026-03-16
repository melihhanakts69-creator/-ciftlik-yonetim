import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSeedling, FaCheck, FaUtensils, FaEdit } from 'react-icons/fa';
import * as api from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import { colors } from '../../styles/colors';

const Card = styled.div`
  background: white;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.04);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .badge {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 700;
    background: ${props => props.$tamamlandi ? colors.bg.green : colors.bg.orange};
    color: ${props => props.$tamamlandi ? colors.primary : colors.warning};
  }
`;

const GrupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
`;

const GrupItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 12px;
  background: ${props => props.$yapildi ? '#F1F8E9' : '#FAFAFA'};
  border-left: 4px solid ${props => props.$renk || colors.primary};
  transition: all 0.2s;

  &:hover {
    transform: translateX(2px);
  }
`;

const GrupInfo = styled.div`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: 14px;
    color: #333;
    margin-bottom: 2px;
  }

  span {
    font-size: 11px;
    color: #999;
  }
`;

const YemleBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$yapildi ? '#C8E6C9' : colors.primary};
  color: ${props => props.$yapildi ? colors.primary : 'white'};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76,175,80,0.3);
  }

  &:disabled {
    cursor: default;
    opacity: 0.9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: #999;
  font-size: 13px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);

  h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #333;
  }

  .btn-row {
    display: flex;
    gap: 12px;
    margin-top: 20px;
  }

  button {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: none;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-ayni {
    background: ${colors.primary};
    color: white;
  }

  .btn-duzenle {
    background: #f5f5f5;
    color: #333;
  }

  .btn-iptal {
    background: #eee;
    color: #666;
  }
`;

const BugunYemlemeCard = ({ mod = 'grup', compact = false }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalGrup, setModalGrup] = useState(null);

  const load = async () => {
    try {
      const res = await api.getYemlemeBugun();
      setData(res.data);
    } catch (e) {
      console.error('Yemleme bugün yüklenemedi', e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleYemleme = async (grup, planlananlaAyni = true, verilenKalemler) => {
    setLoading(true);
    try {
      await api.postYemleme({
        grupId: grup.grup._id,
        tarih: data.tarih,
        planlananlaAyni,
        verilenKalemler
      });
      setModalGrup(null);
      await load();
      showSuccess('Yemleme kaydedildi!');
    } catch (err) {
      showError(err.response?.data?.message || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  if (!data) return null;

  if (data.gruplar.length === 0) {
    return (
      <Card>
        <Header>
          <h3><FaSeedling color={colors.primary} /> Bugün Yemleme</h3>
        </Header>
        <EmptyState>
          Grup yok veya grupta hayvan yok.
          <br />
          <button
            onClick={() => navigate('/yem-merkezi')}
            style={{ marginTop: 12, padding: '8px 16px', borderRadius: 8, border: 'none', background: colors.primary, color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}
          >
            Yem Merkezi →
          </button>
        </EmptyState>
      </Card>
    );
  }

  const gruplar = data.gruplar || [];

  return (
    <>
      <Card style={compact ? { boxShadow: 'none', padding: 16 } : undefined}>
        <Header $tamamlandi={data.ozet?.tamamlandi}>
          <h3>
            <FaSeedling color={colors.primary} />
            Bugün Yemleme
          </h3>
          <span className="badge">
            {data.ozet?.yapilanGrup || 0}/{data.ozet?.toplamGrup || 0} grup
          </span>
        </Header>
        {mod === 'grup' ? (
          <GrupList>
            {gruplar.map((g) => (
              <GrupItem key={g.grup._id} $yapildi={g.yapildi} $renk={g.grup.renk}>
                <GrupInfo>
                  <strong>{g.grup.ad}</strong>
                  <span>
                    {g.basCount} baş · Planlanan: {g.planlanenKg?.toFixed(0) || 0} kg
                  </span>
                </GrupInfo>
                <YemleBtn
                  $yapildi={g.yapildi}
                  disabled={g.yapildi || loading}
                  onClick={() => {
                    if (g.yapildi) return;
                    if (!g.planlanenKg || g.planlanenKg === 0) {
                      showError('Gruba rasyon atanmamış. Yem Merkezi\'nden rasyon atayın.');
                      navigate('/yem-merkezi');
                      return;
                    }
                    setModalGrup(g);
                  }}
                >
                  {g.yapildi ? (
                    <><FaCheck /> Yapıldı</>
                  ) : (
                    <><FaUtensils /> Yemle</>
                  )}
                </YemleBtn>
              </GrupItem>
            ))}
          </GrupList>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['inek', 'duve', 'buzagi', 'tosun', 'karma'].map(tur => {
              const turGruplari = gruplar.filter(g => (g.grup?.tip || 'karma') === tur);
              if (turGruplari.length === 0) return null;
              const toplamBas = turGruplari.reduce((s, g) => s + (g.basCount || 0), 0);
              const tamamlandi = turGruplari.every(g => g.yapildi);
              const turLabel = tur === 'inek' ? 'İnekler' : tur === 'duve' ? 'Düveler' : tur === 'buzagi' ? 'Buzağılar' : tur === 'tosun' ? 'Tosunlar' : 'Karma';
              const turIcon = tur === 'inek' ? '🐄' : tur === 'duve' ? '🐮' : tur === 'buzagi' ? '🐣' : tur === 'tosun' ? '🐂' : '📋';
              return (
                <div
                  key={tur}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8,
                    background: tamamlandi ? '#f0fdf4' : '#f9fafb',
                    border: `1px solid ${tamamlandi ? '#bbf7d0' : '#e5e7eb'}`
                  }}
                >
                  <span style={{ fontSize: 18 }}>{turIcon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{turLabel}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{toplamBas} baş · {turGruplari.length} grup</div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                    background: tamamlandi ? '#dcfce7' : '#fef3c7',
                    color: tamamlandi ? '#166534' : '#92400e'
                  }}>
                    {tamamlandi ? 'Yapıldı' : 'Bekliyor'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {modalGrup && (
        <ModalOverlay onClick={() => setModalGrup(null)}>
          <Modal onClick={e => e.stopPropagation()}>
            <h4>
              {modalGrup.grup.ad} — Verilen miktar planlananla aynı mı?
            </h4>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px 0' }}>
              Planlanan: {modalGrup.planlanenKg?.toFixed(0)} kg ({modalGrup.basCount} baş)
            </p>
            <div className="btn-row">
              <button
                className="btn-ayni"
                onClick={() => handleYemleme(modalGrup, true)}
                disabled={loading}
              >
                Evet, aynen
              </button>
              <button
                className="btn-duzenle"
                onClick={() => {
                  showError('Manuel düzenleme yakında eklenecek. Şimdilik "Evet, aynen" kullanın.');
                }}
              >
                Hayır, düzenle
              </button>
            </div>
            <div className="btn-row">
              <button
                className="btn-iptal"
                onClick={() => setModalGrup(null)}
              >
                İptal
              </button>
            </div>
          </Modal>
        </ModalOverlay>
      )}
    </>
  );
};

export default BugunYemlemeCard;
