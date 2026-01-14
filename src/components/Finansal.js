import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { FaPlus, FaFilter, FaArrowUp, FaArrowDown, FaTrash, FaWallet, FaExchangeAlt } from 'react-icons/fa';
import * as api from '../services/api';

// --- Styled Components ---

const PageContainer = styled.div`
  padding: 20px;
  background-color: #f4f7f6;
  min-height: 100vh;
  padding-bottom: 80px; /* FAB için boşluk */

  @media (max-width: 768px) {
    padding: 10px;
    padding-bottom: 80px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    font-size: 28px;
    font-weight: 800;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    
    @media (max-width: 768px) {
      font-size: 24px;
    }
  }

  button {
    @media (max-width: 768px) {
      display: none; /* Mobilde FAB kullanacağız */
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Mobilde tek kolon, ya da 2 */
    gap: 15px;
  }
`;

const StatCard = styled.div`
  background: ${props => props.bg || 'white'};
  border-radius: 16px;
  padding: 20px;
  color: white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;

  h3 {
    margin: 0 0 5px 0;
    font-size: 14px;
    opacity: 0.9;
    font-weight: 500;
  }

  .value {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 5px;
  }

  .label {
    font-size: 12px;
    opacity: 0.8;
  }

  svg {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 40px;
    opacity: 0.2;
  }
`;

const ChartSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  height: 350px;

  h3 {
    margin: 0 0 20px 0;
    color: #2c3e50;
    font-size: 18px;
  }
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    
    h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .content {
    display: ${props => props.isOpen ? 'grid' : 'none'};
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-top: 20px;
  }
`;

const InputGroup = styled.div`
  label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
  }
  
  input, select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    &:focus { border-color: #4CAF50; }
  }
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const TransactionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border-left: 5px solid ${props => props.type === 'gelir' ? '#4CAF50' : '#f44336'};

  .info {
    flex: 1;
    
    .category {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      background: ${props => props.type === 'gelir' ? '#E8F5E9' : '#FFEBEE'};
      color: ${props => props.type === 'gelir' ? '#2E7D32' : '#C62828'};
      margin-bottom: 5px;
    }

    .date {
      font-size: 12px;
      color: #7f8c8d;
    }
    
    .desc {
      font-size: 14px;
      color: #34495e;
      margin-top: 2px;
    }
  }

  .amount {
    font-size: 18px;
    font-weight: 800;
    color: ${props => props.type === 'gelir' ? '#4CAF50' : '#f44336'};
    margin-right: 15px;
  }

  .delete-btn {
    background: #fee;
    color: #e74c3c;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;

    &:hover { background: #fcd; }
  }
`;

const FAB = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: #4CAF50;
  color: white;
  border: none;
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  z-index: 99;
  transition: transform 0.2s;

  &:hover { transform: scale(1.1); }
  &:active { transform: scale(0.95); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 25px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);

  h2 { margin-top: 0; color: #2c3e50; }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: ${props => props.primary ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : '#eee'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  width: ${props => props.full ? '100%' : 'auto'};
`;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

function Finansal() {
  const [kayitlar, setKayitlar] = useState([]);
  const [ozet, setOzet] = useState(null);
  const [eklemeEkrani, setEklemeEkrani] = useState(false);
  const [filtreAcik, setFiltreAcik] = useState(false); // Varsayılan kapalı
  const [filtreleme, setFiltreleme] = useState({ tip: '', baslangic: '', bitis: '' });

  const [form, setForm] = useState({
    tip: 'gider',
    kategori: 'yem',
    miktar: '',
    tarih: new Date().toISOString().split('T')[0],
    aciklama: ''
  });

  const gelirKategorileri = [
    { value: 'sut-satisi', label: '🥛 Süt Satışı' },
    { value: 'hayvan-satisi', label: '🐄 Hayvan Satışı' },
    { value: 'diger-gelir', label: '💰 Diğer Gelir' }
  ];

  const giderKategorileri = [
    { value: 'yem', label: '🌾 Yem' },
    { value: 'veteriner', label: '💉 Veteriner' },
    { value: 'iscilik', label: '👷 İşçilik' },
    { value: 'elektrik', label: '💡 Elektrik' },
    { value: 'su', label: '💧 Su' },
    { value: 'bakim-onarim', label: '🔧 Bakım-Onarım' },
    { value: 'diger-gider', label: '💸 Diğer Gider' }
  ];

  useEffect(() => {
    kayitlariYukle();
    ozetYukle();
  }, [filtreleme]);

  const kayitlariYukle = async () => {
    try {
      const params = {};
      if (filtreleme.tip) params.tip = filtreleme.tip;
      if (filtreleme.baslangic) params.baslangic = filtreleme.baslangic;
      if (filtreleme.bitis) params.bitis = filtreleme.bitis;

      const response = await api.getFinansalKayitlar(params);
      setKayitlar(response.data);
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  const ozetYukle = async () => {
    try {
      const params = {};
      if (filtreleme.baslangic) params.baslangic = filtreleme.baslangic;
      if (filtreleme.bitis) params.bitis = filtreleme.bitis;

      const response = await api.getFinansalOzet(params);
      setOzet(response.data);
    } catch (error) {
      console.error('Özet hata:', error);
    }
  };

  const kayitEkle = async () => {
    if (!form.miktar || form.miktar <= 0) return alert('Miktar giriniz!');

    try {
      await api.createFinansalKayit({
        ...form,
        miktar: parseFloat(form.miktar)
      });
      setEklemeEkrani(false);
      setForm({ ...form, miktar: '', aciklama: '' });
      kayitlariYukle();
      ozetYukle();
    } catch (error) {
      alert('Kayıt başarısız');
    }
  };

  const kayitSil = async (id) => {
    if (!window.confirm('Emin misiniz?')) return;
    try {
      await api.deleteFinansalKayit(id);
      kayitlariYukle();
      ozetYukle();
    } catch (error) {
      alert('Silinemedi');
    }
  };

  const kategoriGetir = (tip, kat) => {
    const list = tip === 'gelir' ? gelirKategorileri : giderKategorileri;
    return list.find(k => k.value === kat)?.label || kat;
  };

  // Grafik Verileri Hazırlama
  const pieData = ozet ? [
    { name: 'Gelir', value: ozet.toplamGelir },
    { name: 'Gider', value: ozet.toplamGider }
  ] : [];

  // Gider Dağılımı (Kategori bazlı basit bir hesaplama - front-end'de yapıyoruz şimdilik)
  const giderDagilimi = kayitlar
    .filter(k => k.tip === 'gider')
    .reduce((acc, curr) => {
      const kat = kategoriGetir('gider', curr.kategori);
      const existing = acc.find(i => i.name === kat);
      if (existing) existing.value += curr.miktar;
      else acc.push({ name: kat, value: curr.miktar });
      return acc;
    }, []);

  return (
    <PageContainer>
      <Header>
        <h1><FaWallet /> Finansal Yönetim</h1>
        <Button primary onClick={() => setEklemeEkrani(true)}>+ Yeni Kayıt</Button>
      </Header>

      {/* Özet Kartlar */}
      {ozet && (
        <StatsGrid>
          <StatCard bg="linear-gradient(135deg, #4CAF50 0%, #45a049 100%)">
            <h3>Toplam Gelir</h3>
            <div className="value">+{ozet.toplamGelir.toLocaleString()} ₺</div>
            <div className="label">Bu dönem</div>
            <FaArrowUp />
          </StatCard>
          <StatCard bg="linear-gradient(135deg, #ef5350 0%, #e53935 100%)">
            <h3>Toplam Gider</h3>
            <div className="value">-{ozet.toplamGider.toLocaleString()} ₺</div>
            <div className="label">Bu dönem</div>
            <FaArrowDown />
          </StatCard>
          <StatCard bg={ozet.netKar >= 0 ? "linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)" : "linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)"}>
            <h3>Net Durum</h3>
            <div className="value">{ozet.netKar.toLocaleString()} ₺</div>
            <div className="label">{ozet.netKar >= 0 ? 'Kârdayız' : 'Zarardayız'}</div>
            <FaExchangeAlt />
          </StatCard>
        </StatsGrid>
      )}

      {/* Grafikler */}
      <ChartSection>
        {/* Gelir Gider Dengesi */}
        <ChartCard>
          <h3>📊 Gelir / Gider Dengesi</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#4CAF50" />
                <Cell fill="#ef5350" />
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gider Dağılımı */}
        <ChartCard>
          <h3>💸 Gider Dağılımı</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={giderDagilimi}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis />
              <RechartsTooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="value" name="Tutar" radius={[4, 4, 0, 0]}>
                {giderDagilimi.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartSection>

      {/* Filtreler */}
      <FilterSection isOpen={filtreAcik}>
        <div className="header" onClick={() => setFiltreAcik(!filtreAcik)}>
          <h3><FaFilter /> Filtrele & Ara</h3>
          <span>{filtreAcik ? '▲' : '▼'}</span>
        </div>
        <div className="content">
          <InputGroup>
            <label>İşlem Tipi</label>
            <select value={filtreleme.tip} onChange={e => setFiltreleme({ ...filtreleme, tip: e.target.value })}>
              <option value="">Tümü</option>
              <option value="gelir">Gelirler</option>
              <option value="gider">Giderler</option>
            </select>
          </InputGroup>
          <InputGroup>
            <label>Başlangıç</label>
            <input type="date" value={filtreleme.baslangic} onChange={e => setFiltreleme({ ...filtreleme, baslangic: e.target.value })} />
          </InputGroup>
          <InputGroup>
            <label>Bitiş</label>
            <input type="date" value={filtreleme.bitis} onChange={e => setFiltreleme({ ...filtreleme, bitis: e.target.value })} />
          </InputGroup>
        </div>
      </FilterSection>

      {/* Liste */}
      <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Son İşlemler</h3>
      <TransactionList>
        {kayitlar.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '30px' }}>Henüz kayıt bulunamadı.</div>
        ) : (
          kayitlar.map(kayit => (
            <TransactionCard key={kayit._id} type={kayit.tip}>
              <div className="info">
                <span className="category">{kategoriGetir(kayit.tip, kayit.kategori)}</span>
                <div className="desc">{kayit.aciklama || 'Açıklama yok'}</div>
                <span className="date">{new Date(kayit.tarih).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="amount">
                {kayit.tip === 'gelir' ? '+' : '-'}{kayit.miktar.toLocaleString()} ₺
              </div>
              <button className="delete-btn" onClick={() => kayitSil(kayit._id)}>
                <FaTrash />
              </button>
            </TransactionCard>
          ))
        )}
      </TransactionList>

      {/* FAB - Mobile Add Button */}
      <FAB onClick={() => setEklemeEkrani(true)}>
        <FaPlus />
      </FAB>

      {/* Modal */}
      {eklemeEkrani && (
        <ModalOverlay onClick={() => setEklemeEkrani(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>{form.tip === 'gelir' ? 'Gelir Ekle' : 'Gider Ekle'}</h2>

            <InputGroup style={{ marginBottom: 15 }}>
              <label>Tip</label>
              <select
                value={form.tip}
                onChange={e => setForm({
                  ...form,
                  tip: e.target.value,
                  kategori: e.target.value === 'gelir' ? 'sut-satisi' : 'yem'
                })}
              >
                <option value="gelir">Gelir</option>
                <option value="gider">Gider</option>
              </select>
            </InputGroup>

            <InputGroup style={{ marginBottom: 15 }}>
              <label>Kategori</label>
              <select value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
                {(form.tip === 'gelir' ? gelirKategorileri : giderKategorileri).map(k => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
            </InputGroup>

            <InputGroup style={{ marginBottom: 15 }}>
              <label>Miktar (₺)</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.miktar}
                onChange={e => setForm({ ...form, miktar: e.target.value })}
              />
            </InputGroup>

            <InputGroup style={{ marginBottom: 15 }}>
              <label>Tarih</label>
              <input
                type="date"
                value={form.tarih}
                onChange={e => setForm({ ...form, tarih: e.target.value })}
              />
            </InputGroup>

            <InputGroup style={{ marginBottom: 20 }}>
              <label>Açıklama</label>
              <input
                type="text"
                placeholder="Detay..."
                value={form.aciklama}
                onChange={e => setForm({ ...form, aciklama: e.target.value })}
              />
            </InputGroup>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button full onClick={() => setEklemeEkrani(false)}>İptal</Button>
              <Button full primary onClick={kayitEkle}>Kaydet</Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

    </PageContainer>
  );
}

export default Finansal;
