import React from 'react';
import styled from 'styled-components';

const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  color: #1a1a1a;
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 0;
`;

const Header = styled.header`
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  .title { font-size: 15px; font-weight: 600; color: #6b7280; letter-spacing: 0.02em; margin: 0 0 4px; }
  .name { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
  .desc { font-size: 14px; color: #6b7280; margin-top: 8px; }
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 32px 28px;
  text-align: center;
  .icon { font-size: 48px; margin-bottom: 16px; opacity: 0.7; }
  .head { font-size: 17px; font-weight: 700; color: #111827; margin-bottom: 8px; }
  .text { font-size: 14px; color: #6b7280; line-height: 1.5; margin: 0; }
`;

export default function Danismalar() {
  return (
    <Page>
      <Header>
        <p className="title">Danışmalar</p>
        <h1 className="name">Danışma talepleri</h1>
        <p className="desc">Kayıtlı çiftliklerinizden gelen soru ve danışma talepleri burada listelenir.</p>
      </Header>
      <Card>
        <div className="icon">💬</div>
        <p className="head">Henüz danışma talebi yok</p>
        <p className="text">
          Çiftlikleriniz size buradan soru veya danışma talebi gönderebilecek. Gelen talepler burada görünecek ve yanıtlayabileceksiniz.
        </p>
      </Card>
    </Page>
  );
}
