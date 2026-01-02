import Login from './components/Auth/Login';
import * as api from './services/api';
import Buzagilar from './components/Buzagilar';
import Tosunlar from './components/Tosunlar';
import Duveler from './components/Duveler';
import YemDeposu from './components/YemDeposu';
import InekDetay from './components/InekDetay';
import YaklasanDogumlar from './components/YaklasanDogumlar';
import TohumlamaKontrol from './components/TohumlamaKontrol';
import TopluSutGirisi from './components/TopluSutGirisi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

// Yem önerisi hesapla
const yemOnerisiHesapla = (inek, bugunSut) => {
  const hedefSut = 10; // litre
  const sutFarki = hedefSut - bugunSut;
  
  // Temel yem miktarları (kg)
  let karmaYem = bugunSut * 0.4; // Her litre süt için 0.4 kg
  let arpa = 2; // Sabit
  let saman = 3; // Sabit
  
  // Eğer hedefin altındaysa karma yemi artır
  if (sutFarki > 0) {
    karmaYem += sutFarki * 0.3;
  }
  
  // İneğin kilosuna göre ayarla
  const kiloFaktor = inek.kilo / 550; // 550 kg referans
  karmaYem = karmaYem * kiloFaktor;
  
  return {
    karmaYem: Math.round(karmaYem * 10) / 10,
    arpa: Math.round(arpa * 10) / 10,
    saman: Math.round(saman * 10) / 10,
    sutFarki: Math.round(sutFarki * 10) / 10,
    durum: sutFarki > 2 ? 'düşük' : sutFarki > 0 ? 'normal' : 'iyi'
  };
};

// Bugünün tarihini al (YYYY-MM-DD formatında)
const bugunTarih = () => {
  const tarih = new Date();
  return tarih.toISOString().split('T')[0];
};

// Tarih formatla (YYYY-MM-DD -> Gün.Ay.Yıl)
const tarihFormatla = (tarih) => {
  if (!tarih) return '';
  const [yil, ay, gun] = tarih.split('-');
  return `${gun}.${ay}.${yil}`;
};

// Son N günü getir
const sonNGun = (n) => {
  const tarihler = [];
  for (let i = 0; i < n; i++) {
    const tarih = new Date();
    tarih.setDate(tarih.getDate() - i);
    tarihler.push(tarih.toISOString().split('T')[0]);
  }
  return tarihler;
};

function App() {
  // Login kontrolü
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [kullanici, setKullanici] = useState(null);
  const [secilenInek, setSecilenInek] = useState(null);
  const [topluSutEkrani, setTopluSutEkrani] = useState(false);

  // Sayfa yüklendiğinde token kontrol et
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setGirisYapildi(true);
      setKullanici(JSON.parse(user));
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setGirisYapildi(true);
    setKullanici(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('inekler');
    localStorage.removeItem('buzagilar');
    localStorage.removeItem('duveler');
    localStorage.removeItem('sutKayitlari');
    setGirisYapildi(false);
    setKullanici(null);
  };
  // Sayfalar
  const [aktifSayfa, setAktifSayfa] = useState('ana');
  
  // İnek listesi - başlangıçta boş
  const [inekler, setInekler] = useState([]);
  // Buzağı listesi
  const [buzagilar, setBuzagilar] = useState([]);
  
  // Düve listesi
  const [duveler, setDuveler] = useState([]);
  // Tosunlar
  const [tosunlar, setTosunlar] = useState([]);

  // Günlük süt kayıtları
  const [sutKayitlari, setSutKayitlari] = useState([]);

    // TOPLU SİLME İÇİN YENİ STATE'LER:
  const [topluSilEkrani, setTopluSilEkrani] = useState(false);
  const [seciliKayitlar, setSeciliKayitlar] = useState([]);
  const [topluSilTarihi, setTopluSilTarihi] = useState(new Date().toISOString().split('T')[0]);
  const [topluSilSagim, setTopluSilSagim] = useState('sabah');
  const [aramaTarihi, setAramaTarihi] = useState('');
  const [seciliTarih, setSeciliTarih] = useState(null);
  const [manuelGirisEkrani, setManuelGirisEkrani] = useState(false);
  
  // Düzenleme modu
  const [duzenlenecekInek, setDuzenlenecekInek] = useState(null);
  const [detayInek, setDetayInek] = useState(null);
  
  // Rapor filtreleme
  const [secilenTarih, setSecilenTarih] = useState(bugunTarih());
  const [raporTipi, setRaporTipi] = useState('gunluk'); // gunluk, haftalik, aylik, tumu
  
 // Süt kayıtlarını API'den yükle
  useEffect(() => {
    if (girisYapildi) {
      sutKayitlariYukle();
    }
  }, [girisYapildi]);

  const sutKayitlariYukle = async () => {
    try {
      const response = await api.getSutKayitlari();
      const kayitlarData = response.data.map(kayit => ({
        ...kayit,
        id: kayit._id
      }));
      setSutKayitlari(kayitlarData);
    } catch (error) {
      console.error('Süt kayıtları yüklenemedi:', error);
    }
  };
  // TARİH/SAĞIM BAZLI TOPLU SİL
  const topluSilTarih = async () => {
    const onay = window.confirm(
      `⚠️ ${new Date(topluSilTarihi).toLocaleDateString('tr-TR')} tarihli ` +
      `${topluSilSagim === 'ikisi' ? 'TÜM' : (topluSilSagim === 'sabah' ? 'SABAH' : 'AKŞAM')} ` +
      `sağım kayıtları silinecek!\n\nEmin misiniz?`
    );

    if (!onay) return;

    try {
      const response = await api.topluSilTarihSagim({
        tarih: topluSilTarihi,
        sagim: topluSilSagim
      });

      alert(`✅ ${response.data.silinenSayisi} kayıt silindi!`);
      setTopluSilEkrani(false);
      sutKayitlariYukle();
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Kayıtlar silinemedi!'));
    }
  };

  // SEÇİLİ KAYITLARI SİL
  const topluSilSecili = async () => {
    if (seciliKayitlar.length === 0) {
      alert('⚠️ Lütfen silinecek kayıtları seçin!');
      return;
    }

    const onay = window.confirm(
      `⚠️ ${seciliKayitlar.length} kayıt silinecek!\n\nEmin misiniz?`
    );

    if (!onay) return;

    try {
      const response = await api.topluSilSecili(seciliKayitlar);
      alert(`✅ ${response.data.silinenSayisi} kayıt silindi!`);
      setSeciliKayitlar([]);
      sutKayitlariYukle();
    } catch (error) {
      alert('❌ Hata: ' + (error.response?.data?.message || 'Kayıtlar silinemedi!'));
    }
  };

  // CHECKBOX DEĞİŞİMİ
  const checkboxDegistir = (kayitId) => {
    if (seciliKayitlar.includes(kayitId)) {
      setSeciliKayitlar(seciliKayitlar.filter(id => id !== kayitId));
    } else {
      setSeciliKayitlar([...seciliKayitlar, kayitId]);
    }
  };

  // TÜMÜNÜ SEÇ/BIRAK
  const tumunuSec = () => {
    if (seciliKayitlar.length === sutKayitlari.length) {
      setSeciliKayitlar([]);
    } else {
      setSeciliKayitlar(sutKayitlari.map(k => k._id));
    }
  };
  // TARİHLERE GÖRE GRUPLA
  const tarihleregoreGrupla = () => {
    const gruplar = {};
    
    sutKayitlari.forEach(kayit => {
      if (!gruplar[kayit.tarih]) {
        gruplar[kayit.tarih] = [];
      }
      gruplar[kayit.tarih].push(kayit);
    });
    
    return Object.keys(gruplar)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(tarih => ({
        tarih,
        kayitlar: gruplar[tarih],
        toplam: gruplar[tarih].reduce((sum, k) => sum + k.litre, 0),
        adet: gruplar[tarih].length
      }));
  };



  // Bugünün kayıtları
  const bugunKayitlari = sutKayitlari.filter(k => k.tarih === bugunTarih());
// Buzağıları API'den yükle
  useEffect(() => {
    if (girisYapildi) {
      buzagilariYukle();
    }
  }, [girisYapildi]);

  const buzagilariYukle = async () => {
    try {
      const response = await api.getBuzagilar();
      const buzagilarData = response.data.map(buzagi => ({
        ...buzagi,
        id: buzagi._id
      }));
      setBuzagilar(buzagilarData);
    } catch (error) {
      console.error('Buzağılar yüklenemedi:', error);
    }
  };

 

 // Düveleri API'den yükle
  useEffect(() => {
    if (girisYapildi) {
      duveleriYukle();
    }
  }, [girisYapildi]);

  const duveleriYukle = async () => {
    try {
      const response = await api.getDuveler();
      const duvelerData = response.data.map(duve => ({
        ...duve,
        id: duve._id
      }));
      setDuveler(duvelerData);
    } catch (error) {
      console.error('Düveler yüklenemedi:', error);
    }
  };

   // Tosunları API'den yükle
  useEffect(() => {
    if (girisYapildi) {
      tosunlariYukle();
    }
  }, [girisYapildi]);

  const tosunlariYukle = async () => {
    try {
      const response = await api.getTosunlar();
      const tosunlarData = response.data.map(tosun => ({
        ...tosun,
        id: tosun._id
      }));
      setTosunlar(tosunlarData);
    } catch (error) {
      console.error('Tosunlar yüklenemedi:', error);
    }
  };


 // Login yapıldığında inekleri yükle
  useEffect(() => {
    if (girisYapildi) {
      inekleriYukle();
    }
  }, [girisYapildi]);

 

  // Yeni inek bilgileri
  const [yeniInekIsim, setYeniInekIsim] = useState('');
  const [yeniInekYas, setYeniInekYas] = useState('');
  const [yeniInekKilo, setYeniInekKilo] = useState('');
  const [yeniInekKupeNo, setYeniInekKupeNo] = useState('');
  const [yeniInekDogumTarihi, setYeniInekDogumTarihi] = useState('');
  const [yeniInekBuzagiSayisi, setYeniInekBuzagiSayisi] = useState('0');
  const [yeniInekNotlar, setYeniInekNotlar] = useState('');

 // Yeni inek ekle
  const inekEkle = async () => {
    if (yeniInekIsim && yeniInekYas && yeniInekKilo && yeniInekKupeNo) {
      try {
        const response = await api.createInek({
          isim: yeniInekIsim,
          yas: parseInt(yeniInekYas),
          kilo: parseInt(yeniInekKilo),
          kupeNo: yeniInekKupeNo,
          dogumTarihi: yeniInekDogumTarihi,
          buzagiSayisi: parseInt(yeniInekBuzagiSayisi) || 0,
          notlar: yeniInekNotlar
        });
        
        // MongoDB'den gelen ineği listeye ekle (_id'yi id'ye çevir)
        const yeniInek = { ...response.data, id: response.data._id };
        setInekler([...inekler, yeniInek]);
        
        // Formu temizle
        setYeniInekIsim('');
        setYeniInekYas('');
        setYeniInekKilo('');
        setYeniInekKupeNo('');
        setYeniInekDogumTarihi('');
        setYeniInekBuzagiSayisi('0');
        setYeniInekNotlar('');
        
        alert('İnek başarıyla eklendi! 🐄');
        setAktifSayfa('inekler');
      } catch (error) {
        alert('❌ Hata: ' + (error.response?.data?.message || 'İnek eklenemedi!'));
      }
    } else {
      alert('Lütfen zorunlu alanları doldurun!');
    }
  };
 // İnek güncelle
  const inekGuncelle = async () => {
    if (duzenlenecekInek) {
      try {
        const response = await api.updateInek(duzenlenecekInek._id || duzenlenecekInek.id, {
          isim: duzenlenecekInek.isim,
          yas: duzenlenecekInek.yas,
          kilo: duzenlenecekInek.kilo,
          kupeNo: duzenlenecekInek.kupeNo,
          dogumTarihi: duzenlenecekInek.dogumTarihi,
          buzagiSayisi: duzenlenecekInek.buzagiSayisi,
          notlar: duzenlenecekInek.notlar
        });

        const guncelInek = { ...response.data, id: response.data._id };
        const guncelInekler = inekler.map(inek => 
          inek.id === guncelInek.id ? guncelInek : inek
        );
        setInekler(guncelInekler);
        setDuzenlenecekInek(null);
        alert('İnek bilgileri güncellendi! ✅');
        setAktifSayfa('inekler');
      } catch (error) {
        alert('❌ Hata: ' + (error.response?.data?.message || 'İnek güncellenemedi!'));
      }
    }
  };

  // İnek sil
  const inekSil = async (id) => {
    if (window.confirm('Bu ineği silmek istediğinden emin misin?')) {
      try {
        await api.deleteInek(id);
        setInekler(inekler.filter(i => i.id !== id));
        setSutKayitlari(sutKayitlari.filter(s => s.inekId !== id));
        alert('İnek silindi! 🗑️');
        setDetayInek(null);
        setAktifSayfa('inekler');
      } catch (error) {
        alert('❌ Hata: ' + (error.response?.data?.message || 'İnek silinemedi!'));
      }
    }
  };

  // İnek performans hesapla
  const inekPerformansHesapla = (inekId) => {
    const inekKayitlari = sutKayitlari.filter(k => k.inekId === inekId);
    if (inekKayitlari.length === 0) {
      return { ortalama: 0, toplam: 0, gunSayisi: 0 };
    }
    const toplam = inekKayitlari.reduce((sum, k) => sum + k.litre, 0);
    return {
      ortalama: (toplam / inekKayitlari.length).toFixed(1),
      toplam: toplam.toFixed(1),
      gunSayisi: inekKayitlari.length
    };
  };
  // İnekleri API'den yükle
  const inekleriYukle = async () => {
    try {
      const response = await api.getInekler();
      // MongoDB'den gelen _id'yi id'ye çevir
      const ineklarData = response.data.map(inek => ({
        ...inek,
        id: inek._id
      }));
      setInekler(ineklarData);
    } catch (error) {
      console.error('İnekler yüklenemedi:', error);
    }
  };
  
  // Filtrelenmiş kayıtları getir
  const filtrelenmisKayitlar = () => {
    if (raporTipi === 'gunluk') {
      return sutKayitlari.filter(k => k.tarih === secilenTarih);
    } else if (raporTipi === 'haftalik') {
      const son7Gun = sonNGun(7);
      return sutKayitlari.filter(k => son7Gun.includes(k.tarih));
    } else if (raporTipi === 'aylik') {
      const son30Gun = sonNGun(30);
      return sutKayitlari.filter(k => son30Gun.includes(k.tarih));
    } else {
      return sutKayitlari;
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '1000px' }}>
      {!girisYapildi ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1>🐄 Çiftlik Yönetim Sistemi</h1>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
                {kullanici?.isletmeAdi}
              </p>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                {kullanici?.isim}
              </p>
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Çıkış Yap
              </button>
            </div>
           </div>

      {/* Menü Butonları */}       
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setAktifSayfa('ana')}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: aktifSayfa === 'ana' ? '#4CAF50' : '#ddd',
            color: aktifSayfa === 'ana' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            marginBottom: '5px'
          }}
        >
          Ana Sayfa
        </button>
        
        <button 
          onClick={() => {
            setAktifSayfa('inekler');
            setDetayInek(null);
            setDuzenlenecekInek(null);
          }}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: aktifSayfa === 'inekler' ? '#4CAF50' : '#ddd',
            color: aktifSayfa === 'inekler' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            marginBottom: '5px'
          }}
        >
          İnekler ({inekler.length})
        </button>
        
        

        <button 
          onClick={() => setAktifSayfa('sut')}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: aktifSayfa === 'sut' ? '#4CAF50' : '#ddd',
            color: aktifSayfa === 'sut' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            marginBottom: '5px'
          }}
        >
          🥛 Süt Kaydı
        </button>

        <button 
          onClick={() => setAktifSayfa('yem')}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: aktifSayfa === 'yem' ? '#4CAF50' : '#ddd',
            color: aktifSayfa === 'yem' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            marginBottom: '5px'
          }}
        >
          🌾 Yem Önerisi
        </button>

        <button 
          onClick={() => setAktifSayfa('raporlar')}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: aktifSayfa === 'raporlar' ? '#4CAF50' : '#ddd',
            color: aktifSayfa === 'raporlar' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '5px'
          }}
        >
          📊 Raporlar
        </button>
        <button 
          onClick={() => setAktifSayfa('buzagilar')}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: aktifSayfa === 'buzagilar' ? '#4CAF50' : '#ddd',
            color: aktifSayfa === 'buzagilar' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '5px',
            marginRight: '10px'
          }}
        >
          🍼 Buzağılar
        </button>

        <button 
          onClick={() => setAktifSayfa('duveler')}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: aktifSayfa === 'duveler' ? '#4CAF50' : '#ddd',
            color: aktifSayfa === 'duveler' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '5px'
          }}
        >
          🐄 Düveler
        </button>
        <button
              onClick={() => setAktifSayfa('tosunlar')}
              style={{
                padding: '12px 20px',
                backgroundColor: aktifSayfa === 'tosunlar' ? '#FF9800' : '#f5f5f5',
                color: aktifSayfa === 'tosunlar' ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: aktifSayfa === 'tosunlar' ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              🐂 Tosunlar
            </button>
        <button 
              onClick={() => setAktifSayfa('yem-deposu')}
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px',
                backgroundColor: aktifSayfa === 'yem-deposu' ? '#4CAF50' : '#ddd',
                color: aktifSayfa === 'yem-deposu' ? 'white' : 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginBottom: '5px',
                marginRight: '10px'
              }}
            >
              🌾 Yem Deposu
            </button>
      </div>

      {/* Ana Sayfa */}
      {aktifSayfa === 'ana' && (
        <div>
          <h2>📊 Özet</h2>
          {inekler.length > 0 ? (
            <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px' }}>
              <p><strong>Toplam İnek:</strong> {inekler.length}</p>
              <p><strong>Ortalama Yaş:</strong> {(inekler.reduce((sum, inek) => sum + inek.yas, 0) / inekler.length).toFixed(1)} yıl</p>
              <p><strong>Ortalama Kilo:</strong> {(inekler.reduce((sum, inek) => sum + inek.kilo, 0) / inekler.length).toFixed(0)} kg</p>
              <p><strong>Toplam Kayıt:</strong> {sutKayitlari.length} gün</p>
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ccc' }}>
                <p><strong>🍼 Buzağılar:</strong></p>
                <p style={{ marginLeft: '20px' }}>
                  Toplam: {buzagilar.length} | 
                  Dişi: {buzagilar.filter(b => b.cinsiyet === 'disi').length} | 
                  Erkek: {buzagilar.filter(b => b.cinsiyet === 'erkek').length}
                </p>
                {buzagilar.filter(b => {
                  const farkAy = Math.floor((new Date() - new Date(b.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
                  return farkAy >= 6;
                }).length > 0 && (
                  <p style={{ marginLeft: '20px', color: '#4CAF50', fontWeight: 'bold' }}>
                    ✅ Düveye geçmeye hazır: {buzagilar.filter(b => {
                      const farkAy = Math.floor((new Date() - new Date(b.dogumTarihi)) / (1000 * 60 * 60 * 24 * 30));
                      return farkAy >= 6;
                    }).length}
                  </p>
                )}
              </div>

              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ccc' }}>
                <p><strong>🐄 Düveler:</strong></p>
                <p style={{ marginLeft: '20px' }}>
                  Toplam: {duveler.length} | 
                  Gebe: {duveler.filter(d => d.tohumlamaTarihi).length} | 
                  Tohumlama Bekliyor: {duveler.filter(d => !d.tohumlamaTarihi).length}
                </p>
                {duveler.filter(d => {
                  if (!d.tohumlamaTarihi) return false;
                  const tohumlama = new Date(d.tohumlamaTarihi);
                  const buzagilama = new Date(tohumlama);
                  buzagilama.setDate(buzagilama.getDate() + 283);
                  const kalanGun = Math.ceil((buzagilama - new Date()) / (1000 * 60 * 60 * 24));
                  return kalanGun <= 30 && kalanGun > 0;
                }).length > 0 && (
                  <p style={{ marginLeft: '20px', color: '#FF9800', fontWeight: 'bold' }}>
                    ⚠️ 30 gün içinde buzağılayacak: {duveler.filter(d => {
                      if (!d.tohumlamaTarihi) return false;
                      const tohumlama = new Date(d.tohumlamaTarihi);
                      const buzagilama = new Date(tohumlama);
                      buzagilama.setDate(buzagilama.getDate() + 283);
                      const kalanGun = Math.ceil((buzagilama - new Date()) / (1000 * 60 * 60 * 24));
                      return kalanGun <= 30 && kalanGun > 0;
                    }).length}
                  </p>
                )}
              </div>
               <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ccc' }}>
                <p><strong>🐂 Tosunlar:</strong></p>
                <p style={{ marginLeft: '20px' }}>
                  Toplam: {tosunlar.length}
                </p>
              </div>

              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ccc' }}>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>
                 🐮 TOPLAM HAYVAN: {inekler.length + buzagilar.length + duveler.length + tosunlar.length}
                </p>
              </div>
              {bugunKayitlari.length > 0 && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ccc' }}>
                  <p><strong>🥛 Bugünün Süt Verimi:</strong></p>
                  <p>Toplam: {bugunKayitlari.reduce((sum, k) => sum + k.litre, 0).toFixed(1)} litre</p>
                  <p>Kayıt yapılan: {bugunKayitlari.length} / {inekler.length} inek</p>
                </div>
              )}
            </div>
          ) : (
            <p>Henüz inek eklenmemiş.</p>
          )}
        
          {/* YAKLASAN DOĞUMLAR */}
          <div style={{ marginTop: '30px' }}>
            <YaklasanDogumlar onInekSec={setSecilenInek} />
          </div>
          
             {/* TOHUMLAMA KONTROLLERİ */}
          <div style={{ marginTop: '30px' }}>
            <TohumlamaKontrol />
          </div>
        </div>
      )}

      {/* İnek Listesi */}
      {aktifSayfa === 'inekler' && !detayInek && !duzenlenecekInek && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>🐮 İnekler ({inekler.length})</h2>
            <button
              onClick={() => setInekEkrani(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              + İnek Ekle
            </button>
          </div>
          {inekler.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {inekler.map((inek) => {
                const performans = inekPerformansHesapla(inek.id);
                return (
                  <div 
                    key={inek.id}
                    style={{
                      backgroundColor: '#f0f0f0',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: '0 0 5px 0' }}>
                          {inek.isim} <span style={{ color: '#666', fontSize: '14px' }}>(Küpe: {inek.kupeNo})| Küpe: {inek.kupeNo}</span>
                        </h3>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          {inek.yas} yaşında | {inek.kilo} kg | {inek.buzagiSayisi} buzağı
                        </p>
                        {performans.gunSayisi > 0 && (
                          <p style={{ margin: '5px 0', color: '#2e7d32', fontWeight: 'bold' }}>
                            📊 Ortalama: {performans.ortalama} lt/gün ({performans.gunSayisi} gün)
                          </p>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => setSecilenInek(inek)}
                          style={{
                            padding: '8px 15px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '5px'
                          }}
                        >
                          📋 Detay
                        </button>
                        <button
                          onClick={() => {
                            setDuzenlenecekInek({...inek});
                          }}
                          style={{
                            padding: '8px 15px',
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '5px'
                          }}
                        >
                          ✏️ Düzenle
                        </button>
                        <button
                          onClick={() => inekSil(inek.id)}
                          style={{
                            padding: '8px 15px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Sil
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>Henüz inek eklenmemiş.</p>
          )}
        </div>
      )}

      {/* İnek Detay Sayfası */}
      {detayInek && (
        <div>
          <button
            onClick={() => setDetayInek(null)}
            style={{
              padding: '8px 15px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← Geri
          </button>

          <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
            <h2>🐄 {detayInek.isim} - Detaylı Profil</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
              <div>
                <p><strong>ID:</strong> #{detayInek.id}</p>
                <p><strong>Küpe Numarası:</strong> {detayInek.kupeNo}</p>
                <p><strong>Yaş:</strong> {detayInek.yas} yıl</p>
                <p><strong>Kilo:</strong> {detayInek.kilo} kg</p>
              </div>
              <div>
                <p><strong>Doğum Tarihi:</strong> {detayInek.dogumTarihi ? new Date(detayInek.dogumTarihi).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</p>
                <p><strong>Buzağı Sayısı:</strong> {detayInek.buzagiSayisi}</p>
              </div>
            </div>

            {detayInek.notlar && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                <strong>📝 Notlar:</strong>
                <p style={{ margin: '5px 0 0 0' }}>{detayInek.notlar}</p>
              </div>
            )}

            {(() => {
              const performans = inekPerformansHesapla(detayInek.id);
              return performans.gunSayisi > 0 ? (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
                  <h3>📊 Süt Performansı</h3>
                  <p><strong>Toplam Kayıt:</strong> {performans.gunSayisi} gün</p>
                  <p><strong>Toplam Süt:</strong> {performans.toplam} litre</p>
                  <p><strong>Günlük Ortalama:</strong> {performans.ortalama} litre</p>
                </div>
              ) : (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                  <p>⚠️ Henüz süt kaydı bulunmuyor.</p>
                </div>
              );
            })()}

            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => {
                  setDuzenlenecekInek({...detayInek});
                  setDetayInek(null);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                ✏️ Düzenle
              </button>
              <button
                onClick={() => inekSil(detayInek.id)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🗑️ Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İnek Düzenleme Formu */}
      {duzenlenecekInek && (
        <div>
          <button
            onClick={() => setDuzenlenecekInek(null)}
            style={{
              padding: '8px 15px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← İptal
          </button>

          <h2>✏️ İnek Bilgilerini Düzenle</h2>
          <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                İnek İsmi: *
              </label>
              <input 
                type="text"
                value={duzenlenecekInek.isim}
                onChange={(e) => setDuzenlenecekInek({...duzenlenecekInek, isim: e.target.value})}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Yaş (yıl): *
                </label>
                <input 
                  type="number"
                  value={duzenlenecekInek.yas}
                  onChange={(e) => setDuzenlenecekInek({...duzenlenecekInek, yas: parseInt(e.target.value)})}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    fontSize: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Kilo (kg): *
                </label>
                <input 
                  type="number"
                  value={duzenlenecekInek.kilo}
                  onChange={(e) => setDuzenlenecekInek({...duzenlenecekInek, kilo: parseInt(e.target.value)})}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    fontSize: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Küpe Numarası: *
                </label>
                <input 
                  type="text"
                  value={duzenlenecekInek.kupeNo}
                  onChange={(e) => setDuzenlenecekInek({...duzenlenecekInek, kupeNo: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    fontSize: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Doğum Tarihi:
                </label>
                <input 
                  type="date"
                  value={duzenlenecekInek.dogumTarihi}
                  onChange={(e) => setDuzenlenecekInek({...duzenlenecekInek, dogumTarihi: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    fontSize: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Buzağı Sayısı:
              </label>
              <input 
                type="number"
                value={duzenlenecekInek.buzagiSayisi}
                onChange={(e) => setDuzenlenecekInek({...duzenlenecekInek, buzagiSayisi: parseInt(e.target.value) || 0})}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Notlar:
              </label>
              <textarea 
                value={duzenlenecekInek.notlar}
                onChange={(e) => setDuzenlenecekInek({...duzenlenecekInek, notlar: e.target.value})}
                rows="4"
                placeholder="Sağlık durumu, özel notlar..."
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontFamily: 'Arial'
                }}
              />
            </div>

            <button 
              onClick={inekGuncelle}
              style={{ 
                padding: '12px 30px', 
                fontSize: '16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '20px'
              }}
            >
              ✅ Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Yeni İnek Ekle Formu */}
      {aktifSayfa === 'ekle' && (
        <div>
          <h2>➕ Yeni İnek Ekle</h2>
          <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                İnek İsmi: *
              </label>
              <input 
                type="text"
                value={yeniInekIsim}
                onChange={(e) => setYeniInekIsim(e.target.value)}
                placeholder="Örn: Pamuk"
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Yaş (yıl): *
                </label>
                <input 
                  type="number"
                  value={yeniInekYas}
                  onChange={(e) => setYeniInekYas(e.target.value)}
                  placeholder="Örn: 4"
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    fontSize: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Kilo (kg): *
                </label>
                <input 
                  type="number"
                  value={yeniInekKilo}
                  onChange={(e) => setYeniInekKilo(e.target.value)}
                  placeholder="Örn: 550"
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    fontSize: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Küpe Numarası: *
                </label>
                <input 
                  type="text"
                  value={yeniInekKupeNo}
                  onChange={(e) => setYeniInekKupeNo(e.target.value)}
                  placeholder="Örn: 007"
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    fontSize: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Doğum Tarihi:
                </label>
                <input 
                  type="date"
                  value={yeniInekDogumTarihi}
                  onChange={(e) => setYeniInekDogumTarihi(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    fontSize: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Buzağı Sayısı:
              </label>
              <input 
                type="number"
                value={yeniInekBuzagiSayisi}
                onChange={(e) => setYeniInekBuzagiSayisi(e.target.value)}
                placeholder="0"
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Notlar:
              </label>
              <textarea 
                value={yeniInekNotlar}
                onChange={(e) => setYeniInekNotlar(e.target.value)}
                rows="4"
                placeholder="Sağlık durumu, özel notlar..."
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontFamily: 'Arial'
                }}
              />
            </div>

            <button 
              onClick={inekEkle}
              style={{ 
                padding: '12px 30px', 
                fontSize: '16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '20px'
              }}
            >
              İnek Ekle
            </button>
          </div>
        </div>
      )}

      {/* Süt Kayıt Sayfası */}
      {aktifSayfa === 'sut' && (
        <div>
          <h2>🥛 Günlük Süt Kaydı</h2>
          <h2>🥛 Süt Kayıtları</h2>

          {/* TOPLU İŞLEM BUTONLARI */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
                        <button                                    
              onClick={() => setManuelGirisEkrani(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ➕ Manuel Süt Girişi
            </button> 

            <button
              onClick={() => setTopluSilEkrani(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
                
              }}
              
            >
              🗑️ Tarih/Sağım Bazlı Sil
              
            </button>

            {seciliKayitlar.length > 0 && (
              <button
                onClick={topluSilSecili}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#FF5722',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🗑️ Seçilenleri Sil ({seciliKayitlar.length})
              </button>
            )}

            {sutKayitlari.length > 0 && (
              <button
                onClick={tumunuSec}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#9E9E9E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {seciliKayitlar.length === sutKayitlari.length ? '☐ Tümünü Bırak' : '☑️ Tümünü Seç'}
              </button>
            )}
          </div>
          {/* TOPLU GİRİŞ BUTONU */}
          <div style={{
            backgroundColor: '#4CAF50',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          onClick={() => setTopluSutEkrani(true)}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div>
              <h3 style={{ margin: 0, color: 'white', fontSize: '20px' }}>
                ⚡ Toplu Süt Girişi
              </h3>
              <p style={{ margin: '5px 0 0 0', color: 'white', opacity: 0.9, fontSize: '14px' }}>
                Sabah/Akşam sağımı tüm inekler için bir kerede girin
              </p>
            </div>
            <div style={{
              fontSize: '40px',
              color: 'white',
              opacity: 0.8
            }}>
              ➕
            </div>
          </div>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Tarih: <strong>{new Date().toLocaleDateString('tr-TR')}</strong>
          </p>

        
          {/* SÜT KAYITLARI - TAKVİM GÖRÜNÜMÜ */}
          {!seciliTarih ? (
            // TARİH SEÇİCİ
            <div>
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginTop: 0 }}>📅 Tarih Seçerek Kayıtları Görüntüle</h3>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="date"
                    value={aramaTarihi}
                    onChange={(e) => setAramaTarihi(e.target.value)}
                    style={{
                      padding: '12px',
                      fontSize: '16px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      flex: 1,
                      minWidth: '200px'
                    }}
                  />
                  
                  <button
                    onClick={() => {
                      if (!aramaTarihi) {
                        alert('Lütfen bir tarih seçin!');
                        return;
                      }
                      
                      const kayitlar = sutKayitlari.filter(k => k.tarih === aramaTarihi);
                      
                      if (kayitlar.length === 0) {
                        alert('⚠️ Bu tarihte kayıt bulunamadı!');
                        return;
                      }
                      
                      setSeciliTarih(aramaTarihi);
                    }}
                    disabled={!aramaTarihi}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: aramaTarihi ? '#4CAF50' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: aramaTarihi ? 'pointer' : 'not-allowed',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    📊 Detayları Göster
                  </button>
                </div>
              </div>

              {/* SON KAYITLAR ÖZETİ */}
              {sutKayitlari.length > 0 && (
                <div style={{
                  backgroundColor: '#e3f2fd',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ marginTop: 0 }}>📈 Son Kayıtlar</h3>
                  <p style={{ color: '#666', marginBottom: '15px' }}>
                    Toplam <strong>{sutKayitlari.length}</strong> kayıt var
                  </p>
                  
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <strong>Kayıt olan tarihler:</strong>
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {[...new Set(sutKayitlari.map(k => k.tarih))]
                        .sort((a, b) => new Date(b) - new Date(a))
                        .map(tarih => (
                          <button
                            key={tarih}
                            onClick={() => {
                              setAramaTarihi(tarih);
                              setSeciliTarih(tarih);
                            }}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: 'white',
                              border: '1px solid #2196F3',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: '#2196F3',
                              fontWeight: 'bold'
                            }}
                          >
                            {new Date(tarih).toLocaleDateString('tr-TR')}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // SEÇİLİ TARİHİN DETAYI
            <div>
              <button
                onClick={() => setSeciliTarih(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '20px'
                }}
              >
                ← Geri
              </button>

              <h3 style={{ marginBottom: '20px' }}>
                📅 {new Date(seciliTarih).toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>

              {['sabah', 'aksam'].map(sagim => {
                const kayitlar = sutKayitlari.filter(k => k.tarih === seciliTarih && k.sagim === sagim);
                
                if (kayitlar.length === 0) return null;

                const toplamSut = kayitlar.reduce((sum, k) => sum + k.litre, 0);

                return (
                  <div key={sagim} style={{ marginBottom: '30px' }}>
                    <div style={{
                      backgroundColor: sagim === 'sabah' ? '#fff3e0' : '#e3f2fd',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '15px'
                    }}>
                      <h4 style={{ margin: 0, fontSize: '18px' }}>
                        {sagim === 'sabah' ? '🌅 SABAH' : '🌙 AKŞAM'} 
                        <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
                          ({kayitlar.length} kayıt - {toplamSut.toFixed(1)} lt)
                        </span>
                      </h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {kayitlar.map((kayit) => (
                        <div
                          key={kayit._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '15px',
                            backgroundColor: seciliKayitlar.includes(kayit._id) ? '#e3f2fd' : '#f5f5f5',
                            borderRadius: '8px',
                            border: seciliKayitlar.includes(kayit._id) ? '2px solid #2196F3' : '1px solid #ddd'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={seciliKayitlar.includes(kayit._id)}
                            onChange={() => checkboxDegistir(kayit._id)}
                            style={{
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer'
                            }}
                          />

                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                              {kayit.inekIsim}
                            </div>
                          </div>

                          <div style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#4CAF50',
                            minWidth: '80px',
                            textAlign: 'right'
                          }}>
                            {kayit.litre} lt
                          </div>

                          <button
                            onClick={async () => {
                              if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
                                try {
                                  await api.deleteSutKaydi(kayit._id);
                                  setSutKayitlari(sutKayitlari.filter(k => k._id !== kayit._id));
                                  alert('✅ Kayıt silindi!');
                                } catch (error) {
                                  alert('❌ Hata: Kayıt silinemedi!');
                                }
                              }
                            }}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
         {/* BUGÜNÜN ÖZETİ */}
          {bugunKayitlari.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <div 
                onClick={() => {
                  setAramaTarihi(bugunTarih());
                  setSeciliTarih(bugunTarih());
                }}
                style={{
                  padding: '20px',
                  backgroundColor: '#e8f5e9',
                  borderRadius: '12px',
                  border: '2px solid #4CAF50',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.borderColor = '#2E7D32';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = '#4CAF50';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', color: '#2E7D32' }}>
                      📅 Bugün - {new Date().toLocaleDateString('tr-TR')}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {bugunKayitlari.length} / {inekler.length} inek kayıt yapıldı
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>
                      {bugunKayitlari.reduce((sum, k) => sum + k.litre, 0).toFixed(1)} lt
                    </div>
                    <div style={{ fontSize: '14px', color: '#2E7D32', fontWeight: 'bold' }}>
                      Detayları Gör →
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>
      )}

      {/* Yem Önerisi Sayfası */}
      {aktifSayfa === 'yem' && (
        <div>
          <h2>🌾 Günlük Yem Önerisi</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Tarih: <strong>{new Date().toLocaleDateString('tr-TR')}</strong>
          </p>

          {inekler.length > 0 ? (
            <div>
              {bugunKayitlari.length > 0 ? (
                <div>
                  {inekler.map((inek) => {
                    const sutKayit = bugunKayitlari.find(k => k.inekId === inek.id);
                    
                    if (!sutKayit) {
                      return (
                        <div 
                          key={inek.id}
                          style={{ 
                            backgroundColor: '#fff3cd', 
                            padding: '15px', 
                            borderRadius: '8px',
                            marginBottom: '15px',
                            border: '1px solid #ffc107'
                          }}
                        >
                          <h3 style={{ margin: '0 0 10px 0' }}>
                            {inek.isim} ((Küpe: {inek.kupeNo}))
                          </h3>
                          <p style={{ color: '#856404' }}>
                            ⚠️ Bugün süt kaydı yapılmamış. Önce süt kaydı yapmalısın!
                          </p>
                        </div>
                      );
                    }

                    const oneri = yemOnerisiHesapla(inek, sutKayit.litre);
                    
                    return (
                      <div 
                        key={inek.id}
                        style={{ 
                          backgroundColor: oneri.durum === 'iyi' ? '#e8f5e9' : oneri.durum === 'düşük' ? '#ffebee' : '#f0f0f0',
                          padding: '15px', 
                          borderRadius: '8px',
                          marginBottom: '15px',
                          border: `2px solid ${oneri.durum === 'iyi' ? '#4CAF50' : oneri.durum === 'düşük' ? '#f44336' : '#ddd'}`
                        }}
                      >
                        <h3 style={{ margin: '0 0 10px 0' }}>
                          {inek.isim} ((Küpe: {inek.kupeNo}))
                        </h3>
                        
                        <div style={{ marginBottom: '15px' }}>
                          <p style={{ margin: '5px 0' }}>
                            <strong>Bugünkü Süt:</strong> {sutKayit.litre} litre
                            {oneri.durum === 'düşük' && ' 📉 (Hedefin altında)'}
                            {oneri.durum === 'iyi' && ' ✅ (Hedefin üstünde!)'}
                          </p>
                          <p style={{ margin: '5px 0' }}>
                            <strong>Hedef:</strong> 10 litre
                            {oneri.sutFarki > 0 && ` (${oneri.sutFarki} litre eksik)`}
                          </p>
                        </div>

                        <div style={{ 
                          backgroundColor: 'white', 
                          padding: '15px', 
                          borderRadius: '6px',
                          border: '1px solid #ddd'
                        }}>
                          <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>
                            📦 Önerilen Yem Miktarları:
                          </h4>
                          
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid #ddd' }}>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Yem Türü</th>
                                <th style={{ padding: '8px', textAlign: 'right' }}>Miktar (kg)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px' }}>🌾 Karma Yem (Protein %18)</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                                  {oneri.karmaYem} kg
                                </td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px' }}>🌾 Arpa</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                                  {oneri.arpa} kg
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: '8px' }}>🌿 Kuru Ot/Saman</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                                  {oneri.saman} kg
                                </td>
                              </tr>
                              <tr style={{ borderTop: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
                                <td style={{ padding: '8px', fontWeight: 'bold' }}>TOPLAM</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', fontSize: '18px' }}>
                                  {(oneri.karmaYem + oneri.arpa + oneri.saman).toFixed(1)} kg
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          {oneri.durum === 'düşük' && (
                            <div style={{ 
                              marginTop: '15px', 
                              padding: '10px', 
                              backgroundColor: '#ffebee',
                              borderRadius: '4px',
                              color: '#c62828'
                            }}>
                              <strong>💡 Öneri:</strong> Süt verimi düşük. Karma yem miktarı artırıldı. 
                              Ayrıca ineğin sağlık durumunu kontrol et.
                            </div>
                          )}
                          
                          {oneri.durum === 'iyi' && (
                            <div style={{ 
                              marginTop: '15px', 
                              padding: '10px', 
                              backgroundColor: '#e8f5e9',
                              borderRadius: '4px',
                              color: '#2e7d32'
                            }}>
                              <strong>✅ Harika!</strong> Bu inek hedefin üzerinde süt veriyor. 
                              Mevcut yem düzenine devam et.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ 
                    backgroundColor: '#e3f2fd', 
                    padding: '20px', 
                    borderRadius: '8px',
                    marginTop: '20px',
                    border: '2px solid #2196F3'
                  }}>
                    <h3 style={{ margin: '0 0 15px 0' }}>📊 Bugünün Genel Yem İhtiyacı</h3>
                    
                    {(() => {
                      let toplamKarma = 0;
                      let toplamArpa = 0;
                      let toplamSaman = 0;
                      
                      inekler.forEach(inek => {
                        const sutKayit = bugunKayitlari.find(k => k.inekId === inek.id);
                        if (sutKayit) {
                          const oneri = yemOnerisiHesapla(inek, sutKayit.litre);
                          toplamKarma += oneri.karmaYem;
                          toplamArpa += oneri.arpa;
                          toplamSaman += oneri.saman;
                        }
                      });
                      
                      return (
                        <div>
                          <p style={{ fontSize: '16px', margin: '8px 0' }}>
                            <strong>🌾 Toplam Karma Yem:</strong> {toplamKarma.toFixed(1)} kg
                          </p>
                          <p style={{ fontSize: '16px', margin: '8px 0' }}>
                            <strong>🌾 Toplam Arpa:</strong> {toplamArpa.toFixed(1)} kg
                          </p>
                          <p style={{ fontSize: '16px', margin: '8px 0' }}>
                            <strong>🌿 Toplam Saman:</strong> {toplamSaman.toFixed(1)} kg
                          </p>
                          <p style={{ 
                            fontSize: '20px', 
                            margin: '15px 0 0 0', 
                            padding: '15px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            fontWeight: 'bold'
                          }}>
                            <strong>📦 TOPLAM YEM İHTİYACI:</strong> {(toplamKarma + toplamArpa + toplamSaman).toFixed(1)} kg
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div style={{ 
                  backgroundColor: '#fff3cd', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #ffc107'
                }}>
                  <p style={{ color: '#856404', fontSize: '16px' }}>
                    ⚠️ Bugün henüz süt kaydı yapılmamış. 
                    Yem önerisi için önce <strong>Günlük Süt Kaydı</strong> sayfasından kayıt yapmalısın!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p>Önce inek eklemelisin!</p>
          )}
        </div>
      )}

      {/* RAPORLAR SAYFASI - YENİ! */}
      {aktifSayfa === 'raporlar' && (
        <div>
          <h2>📊 Raporlar ve Geçmiş Kayıtlar</h2>
          
          {/* Filtre Seçenekleri */}
          <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setRaporTipi('gunluk')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: raporTipi === 'gunluk' ? '#2196F3' : '#ddd',
                  color: raporTipi === 'gunluk' ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                📅 Günlük
              </button>
              <button
                onClick={() => setRaporTipi('haftalik')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: raporTipi === 'haftalik' ? '#2196F3' : '#ddd',
                  color: raporTipi === 'haftalik' ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                📅 Son 7 Gün
              </button>
              <button
                onClick={() => setRaporTipi('aylik')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: raporTipi === 'aylik' ? '#2196F3' : '#ddd',
                  color: raporTipi === 'aylik' ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                📅 Son 30 Gün
              </button>
              <button
                onClick={() => setRaporTipi('tumu')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: raporTipi === 'tumu' ? '#2196F3' : '#ddd',
                  color: raporTipi === 'tumu' ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                📅 Tüm Kayıtlar
              </button>
            </div>

            {raporTipi === 'gunluk' && (
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Tarih Seç:
                </label>
                <input
                  type="date"
                  value={secilenTarih}
                  onChange={(e) => setSecilenTarih(e.target.value)}
                  max={bugunTarih()}
                  style={{
                    padding: '8px',
                    fontSize: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>
            )}
          </div>

          {/* Rapor İçeriği */}
          {(() => {
            const kayitlar = filtrelenmisKayitlar();
            
            if (kayitlar.length === 0) {
              return (
                <div style={{
                  backgroundColor: '#fff3cd',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #ffc107'
                }}>
                  <p style={{ color: '#856404' }}>
                    ⚠️ Bu dönem için kayıt bulunamadı.
                  </p>
                </div>
              );
            }

            // Özet istatistikler
            const toplamSut = kayitlar.reduce((sum, k) => sum + k.litre, 0);
            const ortalamaSut = toplamSut / kayitlar.length;
            
            // Benzersiz tarihler
            const benzersizTarihler = [...new Set(kayitlar.map(k => k.tarih))].sort().reverse();
            
            // İnek bazında toplam
            const inekBazinda = {};
            kayitlar.forEach(k => {
              if (!inekBazinda[k.inekId]) {
                inekBazinda[k.inekId] = {
                  isim: k.inekIsim,
                  toplam: 0,
                  adet: 0
                };
              }
              inekBazinda[k.inekId].toplam += k.litre;
              inekBazinda[k.inekId].adet += 1;
            });

            return (
              <div>
                {/* Genel Özet */}
                <div style={{
                  backgroundColor: '#e3f2fd',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '2px solid #2196F3'
                }}>
                  <h3 style={{ margin: '0 0 15px 0' }}>📈 Genel Özet</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div>
                      <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>Toplam Kayıt</p>
                      <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>{kayitlar.length}</p>
                    </div>
                    <div>
                      <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>Toplam Süt</p>
                      <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>{toplamSut.toFixed(1)} lt</p>
                    </div>
                    <div>
                      <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>Ortalama</p>
                      <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>{ortalamaSut.toFixed(1)} lt</p>
                    </div>
                  </div>
                </div>
               {/* GRAFİKLER - YENİ! */}
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 15px 0' }}>📈 Grafikler</h3>
                  
                  {/* Günlük Süt Trendi - Çizgi Grafik */}
                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #ddd'
                  }}>
                    <h4 style={{ margin: '0 0 15px 0' }}>📊 Günlük Süt Trendi</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={(() => {
                        // Tarihlere göre grupla
                        const tarihGrup = {};
                        kayitlar.forEach(k => {
                          if (!tarihGrup[k.tarih]) {
                            tarihGrup[k.tarih] = 0;
                          }
                          tarihGrup[k.tarih] += k.litre;
                        });
                        
                        // Grafik için veri hazırla
                        return Object.entries(tarihGrup)
                          .sort((a, b) => a[0].localeCompare(b[0]))
                          .map(([tarih, toplam]) => ({
                            tarih: tarihFormatla(tarih),
                            'Toplam Süt (Lt)': parseFloat(toplam.toFixed(1))
                          }));
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tarih" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="Toplam Süt (Lt)" 
                          stroke="#4CAF50" 
                          strokeWidth={2}
                          dot={{ fill: '#4CAF50', r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* İnek Bazında Karşılaştırma - Çubuk Grafik */}
                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #ddd'
                  }}>
                    <h4 style={{ margin: '0 0 15px 0' }}>🐄 İnek Bazında Karşılaştırma</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={(() => {
                        return Object.entries(inekBazinda)
                          .sort((a, b) => b[1].toplam - a[1].toplam)
                          .map(([inekId, data]) => ({
                            isim: data.isim,
                            'Toplam Süt (Lt)': parseFloat(data.toplam.toFixed(1)),
                            'Ortalama (Lt)': parseFloat((data.toplam / data.adet).toFixed(1))
                          }));
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="isim" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Toplam Süt (Lt)" fill="#2196F3" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="Ortalama (Lt)" fill="#4CAF50" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
               {/* İnek Bazında Performans */}
                <div style={{
                  backgroundColor: '#e8f5e9',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ margin: '0 0 15px 0' }}>🐄 İnek Bazında Performans</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>İnek</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Kayıt Sayısı</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Toplam Süt</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Ortalama</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(inekBazinda)
                        .sort((a, b) => b[1].toplam - a[1].toplam)
                        .map(([inekId, data]) => (
                          <tr key={inekId} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{data.isim}</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>{data.adet} gün</td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                              {data.toplam.toFixed(1)} lt
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#2e7d32' }}>
                              {(data.toplam / data.adet).toFixed(1)} lt
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>

                {/* Detaylı Kayıt Listesi */}
                <div style={{
                  backgroundColor: '#f0f0f0',
                  padding: '20px',
                  borderRadius: '8px'
                }}>
                  <h3 style={{ margin: '0 0 15px 0' }}>📋 Detaylı Kayıtlar</h3>
                  
                  {benzersizTarihler.map(tarih => {
                    const gunKayitlari = kayitlar.filter(k => k.tarih === tarih);
                    const gunToplam = gunKayitlari.reduce((sum, k) => sum + k.litre, 0);
                    
                    return (
                      <div 
                        key={tarih}
                        style={{
                          backgroundColor: 'white',
                          padding: '15px',
                          borderRadius: '8px',
                          marginBottom: '15px',
                          border: '1px solid #ddd'
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '10px',
                          paddingBottom: '10px',
                          borderBottom: '2px solid #4CAF50'
                        }}>
                          <h4 style={{ margin: 0 }}>
                            📅 {tarihFormatla(tarih)}
                          </h4>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                              {gunKayitlari.length} kayıt
                            </p>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>
                              {gunToplam.toFixed(1)} litre
                            </p>
                          </div>
                        </div>
                        
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            {gunKayitlari.map((kayit, index) => (
                              <tr 
                                key={kayit.id}
                                style={{ 
                                  borderBottom: index < gunKayitlari.length - 1 ? '1px solid #eee' : 'none'
                                }}
                              >
                                <td style={{ padding: '8px' }}>{kayit.inekIsim}</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                                  {kayit.litre} litre
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}
      {/* Buzağılar Sayfası */}
      {aktifSayfa === 'buzagilar' && (
        <Buzagilar 
          buzagilar={buzagilar} 
          setBuzagilar={setBuzagilar}
          inekler={inekler}
        />
      )}

      {/* Düveler Sayfası */}
      {aktifSayfa === 'duveler' && (
        <Duveler 
          duveler={duveler} 
          setDuveler={setDuveler}
        />
      )}
       {/* Tosunlar Sayfası */}
      {aktifSayfa === 'tosunlar' && (
        <Tosunlar />
      )}
        </>
      )}
      {/* Yem Deposu Sayfası */}
      {aktifSayfa === 'yem-deposu' && (
        <YemDeposu />
      )}
      {/* İnek Detay Sayfası */}
      {secilenInek && (
        <InekDetay 
          inek={secilenInek}
          onGeri={() => setSecilenInek(null)}
          onInekGuncelle={(guncelInek) => {
            const yeniInekler = inekler.map(inek => 
              inek._id === guncelInek._id ? { ...inek, ...guncelInek } : inek
            );
            setInekler(yeniInekler);
          }}
        />
      )}
        {/* TOPLU SÜT GİRİŞİ MODAL */}
      {topluSutEkrani && (
        <TopluSutGirisi
          onKapat={() => setTopluSutEkrani(false)}
          onKaydet={() => {
            setTopluSutEkrani(false);
            // Süt kayıtlarını yeniden yükle
            window.location.reload();
          }}
        />
      )}
      {/* MANUEL SÜT GİRİŞİ MODAL */}
      {manuelGirisEkrani && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>➕ Manuel Süt Girişi</h2>
              <button
                onClick={() => setManuelGirisEkrani(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕ Kapat
              </button>
            </div>

            <p style={{ color: '#666', marginBottom: '20px' }}>
              Tarih: <strong>{new Date().toLocaleDateString('tr-TR')}</strong>
            </p>

            {inekler.length > 0 ? (
              <div>
                {inekler.map((inek) => {
                  const bugunKayit = bugunKayitlari.find(k => k.inekId === inek.id);
                  
                  return (
                    <div 
                      key={inek.id} 
                      style={{ 
                        backgroundColor: '#f0f0f0', 
                        padding: '15px', 
                        borderRadius: '8px',
                        marginBottom: '15px',
                        border: bugunKayit ? '2px solid #4CAF50' : '1px solid #ddd'
                      }}
                    >
                      <h3 style={{ margin: '0 0 10px 0' }}>
                        {inek.isim} (Küpe: {inek.kupeNo})
                      </h3>
                      
                      {bugunKayit ? (
                        <div style={{ color: '#4CAF50' }}>
                          ✅ Kayıt yapıldı: <strong>{bugunKayit.litre} litre</strong>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="number"
                            placeholder="Süt miktarı (litre)"
                            id={`manuel-sut-${inek.id}`}
                            step="0.1"
                            style={{
                              padding: '8px',
                              fontSize: '14px',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              width: '150px'
                            }}
                          />
                          <button
                            onClick={async () => {
                              const input = document.getElementById(`manuel-sut-${inek.id}`);
                              const litre = parseFloat(input.value);
                              
                              if (litre && litre > 0) {
                                try {
                                  const response = await api.createSutKaydi({
                                    inekId: inek.id,
                                    inekIsim: inek.isim,
                                    tarih: bugunTarih(),
                                    litre: litre,
                                    sagim: 'sabah'
                                  });
                                  
                                  const yeniKayit = { ...response.data, id: response.data._id };
                                  setSutKayitlari([...sutKayitlari, yeniKayit]);
                                  input.value = '';
                                  alert('✅ Kayıt eklendi!');
                                } catch (error) {
                                  alert('❌ Hata: ' + (error.response?.data?.message || 'Süt kaydı eklenemedi!'));
                                }
                              } else {
                                alert('Geçerli bir süt miktarı girin!');
                              }
                            }}
                            style={{
                              padding: '8px 15px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Kaydet
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {bugunKayitlari.length > 0 && (
                  <div style={{ 
                    backgroundColor: '#e8f5e9', 
                    padding: '15px', 
                    borderRadius: '8px',
                    marginTop: '20px'
                  }}>
                    <h3>📊 Bugünün Özeti</h3>
                    <p><strong>Kayıt Yapılan İnek:</strong> {bugunKayitlari.length} / {inekler.length}</p>
                    <p><strong>Toplam Süt:</strong> {bugunKayitlari.reduce((sum, k) => sum + k.litre, 0).toFixed(1)} litre</p>
                    <p><strong>Ortalama:</strong> {(bugunKayitlari.reduce((sum, k) => sum + k.litre, 0) / bugunKayitlari.length).toFixed(1)} litre/inek</p>
                  </div>
                )}
              </div>
            ) : (
              <p>Önce inek eklemelisin!</p>
            )}
          </div>
        </div>
      )}
      {/* TARİH/SAĞIM BAZLI SİLME MODAL */}
      {topluSilEkrani && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginTop: 0, color: '#f44336' }}>🗑️ Tarih/Sağım Bazlı Toplu Silme</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Tarih:
              </label>
              <input
                type="date"
                value={topluSilTarihi}
                onChange={(e) => setTopluSilTarihi(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Sağım:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="topluSilSagim"
                    value="sabah"
                    checked={topluSilSagim === 'sabah'}
                    onChange={(e) => setTopluSilSagim(e.target.value)}
                    style={{ marginRight: '8px', cursor: 'pointer' }}
                  />
                  🌅 Sadece Sabah
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="topluSilSagim"
                    value="aksam"
                    checked={topluSilSagim === 'aksam'}
                    onChange={(e) => setTopluSilSagim(e.target.value)}
                    style={{ marginRight: '8px', cursor: 'pointer' }}
                  />
                  🌙 Sadece Akşam
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="topluSilSagim"
                    value="ikisi"
                    checked={topluSilSagim === 'ikisi'}
                    onChange={(e) => setTopluSilSagim(e.target.value)}
                    style={{ marginRight: '8px', cursor: 'pointer' }}
                  />
                  ⚠️ Her İkisi de
                </label>
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff3e0',
              border: '2px solid #FF9800',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              ⚠️ <strong>Dikkat:</strong> Bu işlem geri alınamaz! Seçtiğiniz tarih ve sağım için tüm kayıtlar kalıcı olarak silinecektir.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setTopluSilEkrani(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#e0e0e0',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                İptal
              </button>
              <button
                onClick={topluSilTarih}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                🗑️ Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default App;
                  