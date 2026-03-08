import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as api from '../services/api';

const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 24px 56px;
  background: #f8fafc;
  min-height: calc(100vh - 100px);
`;

const Header = styled.header`
  margin-bottom: 24px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  .title { font-size: 11px; font-weight: 700; color: #0ea5e9; letter-spacing: 0.08em; margin: 0 0 6px; text-transform: uppercase; }
  .name { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
  .desc { font-size: 13px; color: #64748b; margin-top: 8px; }
`;

const Section = styled.section`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  h3 { margin: 0 0 16px; font-size: 14px; font-weight: 700; color: #475569; }
  ul { margin: 0; padding: 0; list-style: none; }
  li { padding: 10px 0; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
  li:last-child { border-bottom: none; }
  .sayi { font-weight: 700; color: #0ea5e9; }
`;

const Ozet = styled.div`
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  .label { font-size: 12px; font-weight: 600; opacity: 0.9; }
  .value { font-size: 28px; font-weight: 800; }
`;

export default function VeterinerRapor() {
  const [rapor, setRapor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVeterinerRaporAylik()
      .then(res => setRapor(res.data))
      .catch(() => setRapor(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Page><Header><p className="title">Rapor</p><h1 className="name">Aylık özet</h1></Header><p>Yükleniyor…</p></Page>;

  const { enCokHastalik = [], enCokIlac = [], problemliCiftlikler = [], toplamKayit = 0 } = rapor || {};

  return (
    <Page>
      <Header>
        <p className="title">Rapor</p>
        <h1 className="name">Klinik raporlama ve istatistikler</h1>
        <p className="desc">Bu ay en çok hangi hastalık, hangi ilaç ve hangi çiftlikte daha fazla kayıt oluştu.</p>
      </Header>

      <Ozet>
        <div className="label">Bu ay toplam kayıt</div>
        <div className="value">{toplamKayit}</div>
      </Ozet>

      <Section>
        <h3>En çok karşılaşılan hastalık / tanı</h3>
        {enCokHastalik.length === 0 ? <p style={{ margin: 0, color: '#64748b' }}>Veri yok.</p> : (
          <ul>
            {enCokHastalik.map((x, i) => (
              <li key={i}><span>{x.ad}</span><span className="sayi">{x.sayi}</span></li>
            ))}
          </ul>
        )}
      </Section>

      <Section>
        <h3>En çok kullanılan ilaç</h3>
        {enCokIlac.length === 0 ? <p style={{ margin: 0, color: '#64748b' }}>Veri yok.</p> : (
          <ul>
            {enCokIlac.map((x, i) => (
              <li key={i}><span>{x.ad}</span><span className="sayi">{x.sayi}</span></li>
            ))}
          </ul>
        )}
      </Section>

      <Section>
        <h3>En çok kayıt oluşan çiftlikler</h3>
        {problemliCiftlikler.length === 0 ? <p style={{ margin: 0, color: '#64748b' }}>Veri yok.</p> : (
          <ul>
            {problemliCiftlikler.map((x, i) => (
              <li key={i}><span>{x.isletmeAdi || x.isim || 'Çiftlik'}</span><span className="sayi">{x.kayitSayisi} kayıt</span></li>
            ))}
          </ul>
        )}
      </Section>
    </Page>
  );
}
