import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;

const Page = styled.div`
  min-height: 100vh; background: linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 100%);
  color: #e2e8f0; font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden;
`;
const TopBar = styled.div`
  display: flex; align-items: center; justify-content: space-between; padding: 16px 24px;
  background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.07);
  position: sticky; top: 0; z-index: 100; backdrop-filter: blur(12px);
`;
const Logo = styled.div`font-size: 18px; font-weight: 900; color: #60a5fa; letter-spacing: -0.5px;`;
const UserBadge = styled.div`
  display: flex; align-items: center; gap: 10px; font-size: 13px; color: #94a3b8;
  span.name { color: #e2e8f0; font-weight: 600; }
`;
const LogoutBtn = styled.button`
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px;
  color: #f87171; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;
  &:hover { background: rgba(239,68,68,0.2); }
`;
const Content = styled.div`max-width: 960px; margin: 0 auto; padding: 28px 20px; animation: ${fadeIn} 0.4s ease;`;
const WelcomeCard = styled.div`
  background: linear-gradient(135deg, rgba(96,165,250,0.12), rgba(59,130,246,0.06));
  border: 1px solid rgba(96,165,250,0.2); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px;
  h1 { font-size: 22px; font-weight: 900; margin: 0 0 6px; }
  p { color: #64748b; font-size: 14px; margin: 0; }
`;
const ComingSoon = styled.div`
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; padding: 40px; text-align: center;
  .big { font-size: 48px; margin-bottom: 14px; }
  h2 { font-size: 18px; font-weight: 800; color: #60a5fa; margin: 0 0 8px; }
  p { color: #475569; font-size: 14px; margin: 0; }
`;
const Grid = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }`;
const StatCard = styled.div`
  background: rgba(96,165,250,0.06); border: 1px solid rgba(96,165,250,0.15);
  border-radius: 14px; padding: 20px;
  .val { font-size: 26px; font-weight: 900; color: #60a5fa; }
  .lbl { font-size: 11px; color: #475569; margin-top: 4px; font-weight: 600; text-transform: uppercase; }
`;

export default function VeterinerDashboard({ kullanici, onLogout }) {
    const [tab, setTab] = useState('anasayfa');

    return (
        <Page>
            <TopBar>
                <Logo>🩺 Agrolina Vet</Logo>
                <UserBadge>
                    🩺 <span className="name">{kullanici?.isim}</span>
                    {kullanici?.onaylandi ? '✅' : <span style={{ color: '#fb923c', fontSize: 11 }}>(Onay Bekleniyor)</span>}
                    <LogoutBtn onClick={onLogout}>Çıkış</LogoutBtn>
                </UserBadge>
            </TopBar>

            <Content>
                <WelcomeCard>
                    <h1>👋 Hoş Geldiniz, Dr. {kullanici?.isim?.split(' ')[0]}</h1>
                    <p>
                        {kullanici?.uzmanlik || 'Veteriner Hekim'} · {kullanici?.klinikAdi || 'Serbest Hekim'} · {kullanici?.sehir || ''}
                        {!kullanici?.onaylandi && (
                            <span style={{ color: '#fb923c', marginLeft: 12, fontWeight: 700 }}>
                                Hesabınız admin onayı bekliyor. Onaylandığında tüm özellikler aktif olacak.
                            </span>
                        )}
                    </p>
                </WelcomeCard>

                <Grid>
                    <StatCard><div className="val">0</div><div className="lbl">Açık Danışma</div></StatCard>
                    <StatCard><div className="val">0</div><div className="lbl">Bu Ayki Randevu</div></StatCard>
                    <StatCard><div className="val">0</div><div className="lbl">Toplam Hasta</div></StatCard>
                </Grid>

                <ComingSoon>
                    <div className="big">🔧</div>
                    <h2>Veteriner Paneli Yakında!</h2>
                    <p>
                        Danışma istekleri, randevu takvimi ve hasta geçmişi burada görünecek.<br />
                        Çiftçilerden gelen sağlık sorularına yanıt verebileceksiniz.
                    </p>
                </ComingSoon>
            </Content>
        </Page>
    );
}
