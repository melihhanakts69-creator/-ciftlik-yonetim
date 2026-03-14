import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from 'recharts';
import * as api from '../services/api';
import { FaChartBar, FaTint, FaWallet, FaHeartbeat, FaCalendarAlt, FaArrowUp, FaArrowDown, FaFileExcel, FaFilePdf, FaDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 14px 12px 90px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;

const HeaderLeft = styled.div`
  h1 {
    font-size: 26px;
    font-weight: 800;
    color: #2c3e50;
    margin: 0 0 4px 0;
  }
  p { color: #95a5a6; margin: 0; font-size: 13px; }
`;

const PeriodSelector = styled.div`
  display: flex;
  gap: 4px;
  background: white;
  padding: 4px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;

const ExportGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;

  @media (max-width: 600px) {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }
`;

const ExportBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;
  background: ${p => p.$pdf ? '#ef4444' : '#10b981'}; color: white;
  transition: all 0.2s;
  &:hover { background: ${p => p.$pdf ? '#dc2626' : '#059669'}; transform: translateY(-1px); }
`;


const PeriodBtn = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? '#4CAF50' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};

  &:hover {
    background: ${props => props.$active ? '#4CAF50' : '#f0f0f0'};
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: white;
  padding: 6px;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  
  @media (max-width: 768px) {
    gap: 4px;
    padding: 5px;
    border-radius: 12px;
  }
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  background: ${props => props.$active ? '#4CAF50' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};

  &:hover {
    background: ${props => props.$active ? '#4CAF50' : '#f5f5f5'};
  }

  svg { font-size: 14px; }
  
  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 12px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  animation: ${fadeIn} 0.4s ease;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  border-left: 4px solid ${props => props.color || '#4CAF50'};
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  }

  .label {
    font-size: 12px;
    font-weight: 600;
    color: #95a5a6;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 28px;
    font-weight: 800;
    color: #2c3e50;
    margin: 6px 0 4px;
  }

  .unit {
    font-size: 14px;
    font-weight: 500;
    color: #95a5a6;
  }

  .trend {
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    color: ${props => props.trendUp ? '#4CAF50' : '#ef5350'};
  }
`;

const ChartGrid = styled.div`
  display: ${props => props.$hidden ? 'none' : 'grid'};
  grid-template-columns: ${props => props.cols || '1fr 1fr'};
  gap: 20px;
  margin-bottom: 24px;
  animation: ${fadeIn} 0.5s ease;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);

  h3 {
    margin: 0 0 16px 0;
    font-size: 15px;
    font-weight: 700;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  animation: ${fadeIn} 0.5s ease;
  overflow-x: auto;
  margin-bottom: 24px;

  h3 {
    margin: 0 0 16px 0;
    font-size: 15px;
    font-weight: 700;
    color: #2c3e50;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;

    th {
      text-align: left;
      padding: 10px 12px;
      background: #f8f9fa;
      color: #666;
      font-weight: 600;
      border-bottom: 2px solid #eee;
      white-space: nowrap;
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f5f5f5;
      color: #333;
    }

    tr:hover td {
      background: #fafafa;
    }
  }

  @media (max-width: 768px) {
    table, thead, tbody, tr, th, td { display: block; }
    thead tr { position: absolute; left: -9999px; }
    tr { margin-bottom: 12px; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; overflow: hidden; }
    td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
    td:last-child { border-bottom: none; }
    td::before { content: attr(data-label); font-weight: 700; color: #64748b; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 2px; }
    tr:hover td { background: #fafafa; }
  }
`;

const Badge = styled.span`
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${props => props.bg || '#E8F5E9'};
  color: ${props => props.color || '#2e7d32'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #bbb;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #999;
  font-size: 14px;
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: white; padding: 24px; border-radius: 16px; width: 100%; max-width: 500px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  h3 { margin-top: 0; font-size: 18px; color: #2c3e50; border-bottom: 2px solid #f0f0f0; padding-bottom: 12px; }
  .info-box { background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 14px; color: #475569; line-height: 1.5; }
  .btn-row { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
  @media (max-width: 768px) {
    margin: 16px;
    padding: 18px;
    border-radius: 12px;
    .btn-row { flex-direction: column; button { width: 100%; padding: 12px; } }
  }
`;

const ActionBtn = styled.button`
  padding: 10px 18px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  background: ${p => p.$primary ? '#10b981' : '#e2e8f0'};
  color: ${p => p.$primary ? '#fff' : '#475569'};
  &:hover { background: ${p => p.$primary ? '#059669' : '#cbd5e1'}; }
`;

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4'];

const ViewToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;
const ViewToggleBtns = styled.div`
  display: flex;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
`;
const VTBtn = styled.button`
  display: flex; align-items: center; gap: 5px;
  padding: 7px 14px; border: none; cursor: pointer;
  font-size: 12px; font-weight: 700; transition: all .2s;
  background: ${p => p.$active ? '#1e293b' : 'white'};
  color: ${p => p.$active ? 'white' : '#64748b'};
  &:hover { background: ${p => p.$active ? '#1e293b' : '#f1f5f9'}; }
`;

const Raporlar = () => {
  const [activeTab, setActiveTab] = useState('suru');
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);
  const [exportModal, setExportModal] = useState({ show: false, type: null, data: [] });
  const [showCharts, setShowCharts] = useState(window.innerWidth > 768);
  const [data, setData] = useState({
    inekler: [], duveler: [], buzagilar: [], tosunlar: [],
    sutVerileri: [], finansal: [], saglik: [], alisSatis: []
  });

  useEffect(() => { fetchData(); }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.getInekler(),
        api.getDuveler(),
        api.getBuzagilar(),
        api.getTosunlar(),
        api.topluSutGecmis(period),
        api.getFinansalKayitlar({ gun: period }),
        api.getSaglikKayitlari({ gun: period }),
        api.getAlisSatisKayitlari({ gun: period })
      ]);

      setData({
        inekler: results[0].status === 'fulfilled' ? results[0].value.data : [],
        duveler: results[1].status === 'fulfilled' ? results[1].value.data : [],
        buzagilar: results[2].status === 'fulfilled' ? results[2].value.data : [],
        tosunlar: results[3].status === 'fulfilled' ? results[3].value.data : [],
        sutVerileri: results[4].status === 'fulfilled' ? (results[4].value.data || []).reverse() : [],
        finansal: results[5].status === 'fulfilled' ? (results[5].value.data?.kayitlar || results[5].value.data || []) : [],
        saglik: results[6].status === 'fulfilled' ? (results[6].value.data?.kayitlar || results[6].value.data || []) : [],
        alisSatis: results[7].status === 'fulfilled' ? (results[7].value.data?.kayitlar || results[7].value.data || []) : []
      });
    } catch (err) {
      console.error('Rapor verileri yüklenemedi', err);
    } finally {
      setLoading(false);
    }
  };

  // ========== EXCEL & PDF İŞLEMLERİ ==========
  const prepareExportData = () => {
    switch (activeTab) {
      case 'suru':
        return data.inekler.map(i => ({ Tür: 'İnek', Küpe: i.kupeNo || '-', İsim: i.isim || '-', Durum: i.durum || '-', Laktasyon: i.laktasyonSayisi || 0 }))
          .concat(data.duveler.map(d => ({ Tür: 'Düve', Küpe: d.kupeNo || '-', İsim: d.isim || '-', Durum: d.durum || '-', Laktasyon: '-' })))
          .concat(data.buzagilar.map(b => ({ Tür: 'Buzağı', Küpe: b.kupeNo || '-', İsim: b.isim || '-', Durum: b.cinsiyet || '-', Laktasyon: '-' })))
          .concat(data.tosunlar.map(t => ({ Tür: 'Tosun', Küpe: t.kupeNo || '-', İsim: t.isim || '-', Durum: 'Erkek', Laktasyon: '-' })));
      case 'sut':
        return data.sutVerileri.map(s => ({ Tarih: new Date(s.tarih).toLocaleDateString('tr-TR'), 'Sabah (Lt)': Number(s.sabahToplami || 0), 'Akşam (Lt)': Number(s.aksamToplami || 0), 'Toplam (Lt)': Number(s.toplamSut || 0) }));
      case 'finansal':
        return data.finansal.map(f => ({ Tarih: new Date(f.tarih).toLocaleDateString('tr-TR'), Tür: f.tip === 'gelir' ? 'Gelir' : 'Gider', Kategori: f.kategori || '-', Tutar: Number(f.tutar || 0), Açıklama: f.aciklama || '-' }));
      case 'saglik':
        return data.saglik.map(s => ({ Tarih: new Date(s.tarih).toLocaleDateString('tr-TR'), Tür: s.tip || '-', Hayvan: s.hayvanIsim || s.hayvanTipi || '-', Tanı: s.tani || '-', Durum: s.durum || '-', Maliyet: Number(s.maliyet || 0) }));
      default: return [];
    }
  };

  const handleExportClick = (type) => {
    const expData = prepareExportData();
    if (!expData || expData.length === 0) return alert('Dışa aktarılacak veri bulunamadı.');
    setExportModal({ show: true, type, data: expData });
  };

  const confirmExport = () => {
    const { type, data: exportData } = exportModal;

    if (type === 'excel') {
      const excelData = exportData.map(row => {
        const newRow = {};
        Object.keys(row).forEach(key => {
          const val = row[key];
          newRow[key] = typeof val === 'string' ? val.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : val;
        });
        return newRow;
      });
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rapor");
      XLSX.writeFile(wb, `Agrolina_${activeTab}_Raporu_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else if (type === 'pdf') {
      const replaceTurkishChars = (str) => {
        if (typeof str !== 'string') return str;
        // HTML Entity decode it first in case backend sent some entities
        let decoded = str.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        return decoded
          .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
          .replace(/ü/g, 'u').replace(/Ü/g, 'U')
          .replace(/ş/g, 's').replace(/Ş/g, 'S')
          .replace(/ı/g, 'i').replace(/İ/g, 'I')
          .replace(/ö/g, 'o').replace(/Ö/g, 'O')
          .replace(/ç/g, 'c').replace(/Ç/g, 'C');
      };

      const pdfData = exportData.map(row => {
        const newRow = {};
        Object.keys(row).forEach(key => {
          newRow[replaceTurkishChars(key)] = replaceTurkishChars(row[key]);
        });
        return newRow;
      });

      const doc = new jsPDF();
      doc.setFont("helvetica");
      doc.setFontSize(18);
      doc.text(`Agrolina - ${replaceTurkishChars(activeTab.toUpperCase())} Raporu`, 14, 20);
      doc.setFontSize(11);
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')} | Toplam Kayit: ${pdfData.length}`, 14, 28);

      const columns = Object.keys(pdfData[0]).map(key => ({ header: key, dataKey: key }));

      autoTable(doc, {
        head: [columns.map(c => c.header)],
        body: pdfData.map(row => columns.map(c => row[c.dataKey])),
        startY: 35,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [44, 62, 80] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      doc.save(`Agrolina_${activeTab}_Raporu_${new Date().toISOString().slice(0, 10)}.pdf`);
    }

    setExportModal({ show: false, type: null, data: [] });
  };

  // ========== SÜRÜ TAB ==========
  const renderSuruTab = () => {
    const { inekler, duveler, buzagilar, tosunlar } = data;
    const toplam = inekler.length + duveler.length + buzagilar.length + tosunlar.length;
    const sagmal = inekler.filter(i => i.durum === 'Sağmal' || i.durum === 'sagmal').length;
    const gebe = inekler.filter(i => i.gebe || i.durum === 'Gebe').length + duveler.filter(d => d.gebe || d.durum === 'Gebe').length;

    const dagilim = [
      { name: 'İnek', value: inekler.length, color: '#4CAF50' },
      { name: 'Düve', value: duveler.length, color: '#2196F3' },
      { name: 'Buzağı', value: buzagilar.length, color: '#FF9800' },
      { name: 'Tosun', value: tosunlar.length, color: '#9C27B0' }
    ].filter(d => d.value > 0);

    const durumDagilim = [
      { name: 'Sağmal', value: sagmal, color: '#4CAF50' },
      { name: 'Kuru', value: inekler.length - sagmal, color: '#FF9800' },
      { name: 'Gebe', value: gebe, color: '#E91E63' }
    ].filter(d => d.value > 0);

    const erkek = buzagilar.filter(b => b.cinsiyet === 'Erkek').length + tosunlar.length;
    const disi = buzagilar.filter(b => b.cinsiyet === 'Dişi').length + inekler.length + duveler.length;

    return (
      <>
        <Grid>
          <StatCard color="#4CAF50"><div className="label">Toplam Hayvan</div><div className="value">{toplam}</div><div className="unit">Baş</div></StatCard>
          <StatCard color="#2196F3"><div className="label">Sağmal İnek</div><div className="value">{sagmal}</div><div className="unit">Baş</div></StatCard>
          <StatCard color="#E91E63"><div className="label">Gebe Hayvan</div><div className="value">{gebe}</div><div className="unit">Baş</div></StatCard>
          <StatCard color="#9C27B0"><div className="label">Buzağı</div><div className="value">{buzagilar.length}</div><div className="unit">Baş</div></StatCard>
        </Grid>

        <ChartGrid $hidden={!showCharts}>
          <ChartCard>
            <h3>🐄 Hayvan Dağılımı</h3>
            {dagilim.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={dagilim} innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                    {dagilim.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState>Veri yok</EmptyState>}
          </ChartCard>
          <ChartCard>
            <h3>📊 Durum Dağılımı</h3>
            {durumDagilim.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={durumDagilim}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Adet">
                    {durumDagilim.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState>Veri yok</EmptyState>}
          </ChartCard>
        </ChartGrid>

        <TableWrapper>
          <h3>📋 Sürü Özet Tablosu</h3>
          <table>
            <thead>
              <tr><th>Tür</th><th>Toplam</th><th>Dişi</th><th>Erkek</th><th>Oran</th></tr>
            </thead>
            <tbody>
              <tr><td data-label="Tür">İnek</td><td data-label="Toplam">{inekler.length}</td><td data-label="Dişi">{inekler.length}</td><td data-label="Erkek">—</td><td data-label="Oran">{toplam > 0 ? ((inekler.length / toplam) * 100).toFixed(0) : 0}%</td></tr>
              <tr><td data-label="Tür">Düve</td><td data-label="Toplam">{duveler.length}</td><td data-label="Dişi">{duveler.length}</td><td data-label="Erkek">—</td><td data-label="Oran">{toplam > 0 ? ((duveler.length / toplam) * 100).toFixed(0) : 0}%</td></tr>
              <tr><td data-label="Tür">Buzağı</td><td data-label="Toplam">{buzagilar.length}</td><td data-label="Dişi">{buzagilar.filter(b => b.cinsiyet === 'Dişi').length}</td><td data-label="Erkek">{buzagilar.filter(b => b.cinsiyet === 'Erkek').length}</td><td data-label="Oran">{toplam > 0 ? ((buzagilar.length / toplam) * 100).toFixed(0) : 0}%</td></tr>
              <tr><td data-label="Tür">Tosun</td><td data-label="Toplam">{tosunlar.length}</td><td data-label="Dişi">—</td><td data-label="Erkek">{tosunlar.length}</td><td data-label="Oran">{toplam > 0 ? ((tosunlar.length / toplam) * 100).toFixed(0) : 0}%</td></tr>
              <tr style={{ fontWeight: 700, background: '#f8f9fa' }}><td data-label="Tür">Toplam</td><td data-label="Toplam">{toplam}</td><td data-label="Dişi">{disi}</td><td data-label="Erkek">{erkek}</td><td data-label="Oran">100%</td></tr>
            </tbody>
          </table>
        </TableWrapper>
      </>
    );
  };

  // ========== SÜT TAB ==========
  const renderSutTab = () => {
    const { sutVerileri } = data;
    const chartData = sutVerileri.map(s => ({
      tarih: new Date(s.tarih).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
      miktar: s.toplamSut || 0
    }));

    const toplamSut = sutVerileri.reduce((t, s) => t + (s.toplamSut || 0), 0);
    const ortSut = sutVerileri.length > 0 ? (toplamSut / sutVerileri.length) : 0;
    const maxSut = Math.max(...sutVerileri.map(s => s.toplamSut || 0), 0);
    const minSut = sutVerileri.length > 0 ? Math.min(...sutVerileri.map(s => s.toplamSut || 0)) : 0;

    return (
      <>
        <Grid>
          <StatCard color="#4CAF50"><div className="label">Toplam Üretim</div><div className="value">{toplamSut.toFixed(0)}</div><div className="unit">Litre ({period} gün)</div></StatCard>
          <StatCard color="#2196F3"><div className="label">Günlük Ortalama</div><div className="value">{ortSut.toFixed(1)}</div><div className="unit">Lt/Gün</div></StatCard>
          <StatCard color="#FF9800" trendUp><div className="label">En Yüksek</div><div className="value">{maxSut.toFixed(1)}</div><div className="unit">Lt</div></StatCard>
          <StatCard color="#ef5350"><div className="label">En Düşük</div><div className="value">{minSut.toFixed(1)}</div><div className="unit">Lt</div></StatCard>
        </Grid>

        <ChartGrid cols="1fr" $hidden={!showCharts}>
          <ChartCard>
            <h3>🥛 Süt Üretim Grafiği ({period} Gün)</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sutGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="tarih" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="miktar" stroke="#4CAF50" strokeWidth={2} fill="url(#sutGrad)" name="Süt (Lt)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState>Bu dönem için süt verisi bulunamadı</EmptyState>}
          </ChartCard>
        </ChartGrid>
      </>
    );
  };

  // ========== FİNANSAL TAB ==========
  const renderFinansalTab = () => {
    const { finansal, alisSatis } = data;
    const kayitlar = Array.isArray(finansal) ? finansal : [];
    const alisKayitlar = Array.isArray(alisSatis) ? alisSatis : [];

    const gelirler = kayitlar.filter(k => k.tip === 'gelir');
    const giderler = kayitlar.filter(k => k.tip === 'gider');
    const toplamGelir = gelirler.reduce((t, k) => t + (k.tutar || 0), 0);
    const toplamGider = giderler.reduce((t, k) => t + (k.tutar || 0), 0);

    const satisGelir = alisKayitlar.filter(a => a.tip === 'satis').reduce((t, a) => t + (a.fiyat || 0), 0);
    const alisGider = alisKayitlar.filter(a => a.tip === 'alis').reduce((t, a) => t + (a.fiyat || 0), 0);

    const genelGelir = toplamGelir + satisGelir;
    const genelGider = toplamGider + alisGider;
    const net = genelGelir - genelGider;

    // Kategoriye göre giderler
    const kategoriMap = {};
    giderler.forEach(g => {
      const kat = g.kategori || 'Diğer';
      kategoriMap[kat] = (kategoriMap[kat] || 0) + (g.tutar || 0);
    });
    const kategoriData = Object.entries(kategoriMap).map(([name, value], i) => ({
      name, value, color: COLORS[i % COLORS.length]
    })).sort((a, b) => b.value - a.value);

    return (
      <>
        <Grid>
          <StatCard color="#4CAF50" trendUp><div className="label">Toplam Gelir</div><div className="value">{genelGelir.toLocaleString('tr-TR')}</div><div className="unit">₺</div></StatCard>
          <StatCard color="#ef5350"><div className="label">Toplam Gider</div><div className="value">{genelGider.toLocaleString('tr-TR')}</div><div className="unit">₺</div></StatCard>
          <StatCard color={net >= 0 ? '#4CAF50' : '#ef5350'} trendUp={net >= 0}>
            <div className="label">Net Kâr/Zarar</div>
            <div className="value">{net >= 0 ? '+' : ''}{net.toLocaleString('tr-TR')}</div>
            <div className="unit">₺</div>
            <div className="trend">{net >= 0 ? <><FaArrowUp /> Kârlı</> : <><FaArrowDown /> Zararlı</>}</div>
          </StatCard>
          <StatCard color="#2196F3"><div className="label">Alış/Satış</div><div className="value">{alisKayitlar.length}</div><div className="unit">İşlem</div></StatCard>
        </Grid>

        <ChartGrid $hidden={!showCharts}>
          <ChartCard>
            <h3>💰 Gelir vs Gider</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[
                { name: 'Gelir', tutar: genelGelir },
                { name: 'Gider', tutar: genelGider },
                { name: 'Net', tutar: Math.abs(net) }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip formatter={(val) => `${val.toLocaleString('tr-TR')} ₺`} />
                <Bar dataKey="tutar" radius={[8, 8, 0, 0]} name="Tutar (₺)">
                  <Cell fill="#4CAF50" />
                  <Cell fill="#ef5350" />
                  <Cell fill={net >= 0 ? '#2196F3' : '#FF9800'} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard>
            <h3>📊 Gider Dağılımı</h3>
            {kategoriData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={kategoriData} innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {kategoriData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <RechartsTooltip formatter={(val) => `${val.toLocaleString('tr-TR')} ₺`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState>Gider kaydı bulunamadı</EmptyState>}
          </ChartCard>
        </ChartGrid>
      </>
    );
  };

  // ========== SAĞLIK TAB ==========
  const renderSaglikTab = () => {
    const kayitlar = Array.isArray(data.saglik) ? data.saglik : [];

    const aktif = kayitlar.filter(k => k.durum === 'devam_ediyor').length;
    const iyilesen = kayitlar.filter(k => k.durum === 'iyilesti').length;
    const toplamMaliyet = kayitlar.reduce((t, k) => t + (k.maliyet || 0), 0);

    // Tip dağılımı
    const tipMap = {};
    kayitlar.forEach(k => {
      const tip = k.tip || 'diger';
      tipMap[tip] = (tipMap[tip] || 0) + 1;
    });
    const tipLabels = { hastalik: 'Hastalık', tedavi: 'Tedavi', asi: 'Aşı', muayene: 'Muayene', ameliyat: 'Ameliyat', dogum_komplikasyonu: 'Doğum Komp.' };
    const tipData = Object.entries(tipMap).map(([key, val], i) => ({
      name: tipLabels[key] || key, value: val, color: COLORS[i % COLORS.length]
    }));

    return (
      <>
        <Grid>
          <StatCard color="#E91E63"><div className="label">Toplam Kayıt</div><div className="value">{kayitlar.length}</div><div className="unit">Adet</div></StatCard>
          <StatCard color="#FF9800"><div className="label">Aktif Tedavi</div><div className="value">{aktif}</div><div className="unit">Devam Eden</div></StatCard>
          <StatCard color="#4CAF50"><div className="label">İyileşen</div><div className="value">{iyilesen}</div><div className="unit">Başarılı</div></StatCard>
          <StatCard color="#ef5350"><div className="label">Sağlık Gideri</div><div className="value">{toplamMaliyet.toLocaleString('tr-TR')}</div><div className="unit">₺</div></StatCard>
        </Grid>

        <ChartGrid $hidden={!showCharts}>
          <ChartCard>
            <h3>🏥 Kayıt Türü Dağılımı</h3>
            {tipData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={tipData} innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {tipData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState>Sağlık kaydı bulunamadı</EmptyState>}
          </ChartCard>
          <ChartCard>
            <h3>📊 Durum Dağılımı</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[
                { name: 'Devam', sayi: aktif },
                { name: 'İyileşti', sayi: iyilesen },
                { name: 'Kronik', sayi: kayitlar.filter(k => k.durum === 'kronik').length }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="sayi" radius={[8, 8, 0, 0]} name="Adet">
                  <Cell fill="#FF9800" />
                  <Cell fill="#4CAF50" />
                  <Cell fill="#ef5350" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </ChartGrid>

        {kayitlar.length > 0 && (
          <TableWrapper>
            <h3>📋 Son Sağlık Kayıtları</h3>
            <table>
              <thead>
                <tr><th>Tarih</th><th>Tür</th><th>Tanı</th><th>Hayvan</th><th>Durum</th><th>Maliyet</th></tr>
              </thead>
              <tbody>
                {kayitlar.slice(0, 10).map(k => (
                  <tr key={k._id}>
                    <td data-label="Tarih">{new Date(k.tarih).toLocaleDateString('tr-TR')}</td>
                    <td data-label="Tür"><Badge bg="#E3F2FD" color="#1565C0">{tipLabels[k.tip] || k.tip}</Badge></td>
                    <td data-label="Tanı">{k.tani || '—'}</td>
                    <td data-label="Hayvan">{k.hayvanIsim || k.hayvanTipi || '—'}</td>
                    <td data-label="Durum">
                      <Badge
                        bg={k.durum === 'devam_ediyor' ? '#FFF3E0' : k.durum === 'iyilesti' ? '#E8F5E9' : '#FFEBEE'}
                        color={k.durum === 'devam_ediyor' ? '#E65100' : k.durum === 'iyilesti' ? '#2e7d32' : '#c62828'}
                      >
                        {k.durum === 'devam_ediyor' ? 'Devam' : k.durum === 'iyilesti' ? 'İyileşti' : k.durum === 'kronik' ? 'Kronik' : k.durum || '—'}
                      </Badge>
                    </td>
                    <td data-label="Maliyet">{k.maliyet ? `${k.maliyet.toLocaleString('tr-TR')} ₺` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrapper>
        )}
      </>
    );
  };

  const tabs = [
    { id: 'suru', label: 'Sürü Raporu', icon: <FaChartBar /> },
    { id: 'sut', label: 'Süt Raporu', icon: <FaTint /> },
    { id: 'finansal', label: 'Finansal', icon: <FaWallet /> },
    { id: 'saglik', label: 'Sağlık', icon: <FaHeartbeat /> }
  ];

  return (
    <PageContainer>
      <Header>
        <HeaderLeft>
          <h1>📊 Çiftlik Raporları</h1>
          <p>Detaylı performans analizi ve grafikleri</p>
        </HeaderLeft>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <PeriodSelector>
            {[{ v: 7, l: '7 Gün' }, { v: 30, l: '30 Gün' }, { v: 90, l: '90 Gün' }, { v: 365, l: 'Yıllık' }].map(p => (
              <PeriodBtn key={p.v} $active={period === p.v} onClick={() => setPeriod(p.v)}>
                <FaCalendarAlt style={{ marginRight: 4 }} /> {p.l}
              </PeriodBtn>
            ))}
          </PeriodSelector>
          <ExportGroup>
            <ExportBtn onClick={() => handleExportClick('excel')} title="Excel formatında indir"><FaFileExcel /> Excel</ExportBtn>
            <ExportBtn $pdf onClick={() => handleExportClick('pdf')} title="PDF formatında indir"><FaFilePdf /> PDF</ExportBtn>
          </ExportGroup>
        </div>
      </Header>

      <Tabs>
        {tabs.map(t => (
          <Tab key={t.id} $active={activeTab === t.id} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </Tab>
        ))}
      </Tabs>

      {loading ? (
        <LoadingSpinner>Veriler yükleniyor...</LoadingSpinner>
      ) : (
        <>
          <ViewToggleRow>
            <ViewToggleBtns>
              <VTBtn $active={showCharts} onClick={() => setShowCharts(true)}><FaChartBar size={11} /> Grafik + Tablo</VTBtn>
              <VTBtn $active={!showCharts} onClick={() => setShowCharts(false)}>📋 Sadece Tablo</VTBtn>
            </ViewToggleBtns>
          </ViewToggleRow>
          {activeTab === 'suru' && renderSuruTab()}
          {activeTab === 'sut' && renderSutTab()}
          {activeTab === 'finansal' && renderFinansalTab()}
          {activeTab === 'saglik' && renderSaglikTab()}
        </>
      )}

      {exportModal.show && (
        <ModalOverlay>
          <ModalContent>
            <h3><FaDownload style={{ marginRight: 8, color: '#3b82f6', verticalAlign: 'middle' }} /> Rapor Dışa Aktar</h3>
            <div className="info-box">
              <p style={{ margin: '0 0 8px 0' }}><strong>{period}</strong> günlük <strong>{activeTab.toUpperCase()}</strong> verisini dışa aktarmak üzeresiniz.</p>
              <p style={{ margin: 0 }}>Toplam <strong>{exportModal.data.length}</strong> satır veri <strong>{exportModal.type === 'excel' ? 'Excel (.xlsx)' : 'PDF'}</strong> formatında indirilecektir.</p>
            </div>
            <div className="btn-row">
              <ActionBtn onClick={() => setExportModal({ show: false, type: null, data: [] })}>İptal Et</ActionBtn>
              <ActionBtn $primary onClick={confirmExport}>Onayla ve İndir</ActionBtn>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Raporlar;
