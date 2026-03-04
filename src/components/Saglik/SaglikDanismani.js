import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
    FaRobot, FaPaperPlane, FaSearch, FaChevronDown, FaChevronUp,
    FaSpinner, FaExclamationTriangle, FaStethoscope, FaLightbulb,
    FaHeartbeat, FaUserMd, FaPhone, FaBell
} from 'react-icons/fa';
import axios from 'axios';

const API = process.env.NODE_ENV === 'production'
    ? 'https://ciftlik-yonetim.onrender.com'
    : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

// --- ANIMATIONS ---
const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const pulse = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}`;
const blink = keyframes`0%,100%{opacity:1}50%{opacity:0}`;

// --- STYLED ---
const Wrap = styled.div`display:flex;flex-direction:column;gap:20px;animation:${fadeIn} .4s ease;`;

// ── Uyarı Banner (Sabit) ──
const VetBanner = styled.div`
  background:linear-gradient(135deg,#fff1f2,#ffe4e6);
  border:2px solid #fecaca;border-radius:16px;padding:16px 20px;
  display:flex;align-items:center;gap:14px;animation:${fadeIn} .3s ease;
`;
const BannerIcon = styled.div`
  width:42px;height:42px;border-radius:12px;background:#fee2e2;color:#dc2626;
  display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;
  animation:${pulse} 2.5s ease-in-out infinite;
`;
const BannerText = styled.div`
  flex:1;
  strong{display:block;font-size:14px;font-weight:800;color:#991b1b;margin-bottom:3px;}
  span{font-size:12px;color:#b91c1c;line-height:1.5;}
`;
const VetBtn = styled.a`
  padding:8px 16px;background:#dc2626;color:#fff;border-radius:10px;font-size:12px;
  font-weight:800;text-decoration:none;display:flex;align-items:center;gap:6px;white-space:nowrap;
  &:hover{background:#b91c1c;}
`;

// ── Tab Bar ──
const TabRow = styled.div`display:flex;gap:8px;background:#fff;padding:6px;border-radius:14px;box-shadow:0 1px 6px rgba(0,0,0,.06);width:fit-content;`;
const TBtn = styled.button`
  padding:10px 20px;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;
  display:flex;align-items:center;gap:7px;transition:all .2s;
  background:${p => p.$a ? 'linear-gradient(135deg,#f43f5e,#e11d48)' : 'transparent'};
  color:${p => p.$a ? '#fff' : '#64748b'};
  box-shadow:${p => p.$a ? '0 4px 12px rgba(244,63,94,.3)' : 'none'};
  &:hover{background:${p => p.$a ? 'linear-gradient(135deg,#f43f5e,#e11d48)' : '#fef2f2'};color:${p => p.$a ? '#fff' : '#e11d48'};}
`;
const AiBadge = styled.span`background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:9px;padding:2px 6px;border-radius:999px;font-weight:800;`;

// ── Chat ──
const ChatCard = styled.div`background:#fff;border-radius:20px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.06);`;
const ChatHeader = styled.div`
  display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #f1f5f9;
  h3{margin:0;font-size:18px;font-weight:800;color:#0f172a;}
  .sub{font-size:12px;color:#64748b;margin:2px 0 0;}
`;
const AiIcon = styled.div`
  width:44px;height:44px;border-radius:13px;background:linear-gradient(135deg,#f43f5e,#e11d48);
  display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;flex-shrink:0;
`;
const MessagesBox = styled.div`
  min-height:220px;max-height:420px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;
  padding:4px 0 16px;
  &::-webkit-scrollbar{width:4px;}
  &::-webkit-scrollbar-track{background:#f8fafc;}
  &::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}
`;
const Msg = styled.div`display:flex;gap:10px;${p => p.$user ? css`flex-direction:row-reverse;` : ''};animation:${fadeIn} .25s ease;`;
const MsgBubble = styled.div`
  max-width:80%;padding:12px 16px;border-radius:${p => p.$user ? '18px 4px 18px 18px' : '4px 18px 18px 18px'};
  font-size:14px;line-height:1.65;white-space:pre-wrap;word-break:break-word;
  background:${p => p.$user ? 'linear-gradient(135deg,#f43f5e,#e11d48)' : p.$alert ? '#fff1f2' : '#f8fafc'};
  color:${p => p.$user ? '#fff' : p.$alert ? '#991b1b' : '#1e293b'};
  border:${p => p.$user ? 'none' : p.$alert ? '1px solid #fecaca' : '1px solid #f1f5f9'};
`;
const MsgAvatar = styled.div`
  width:32px;height:32px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
  background:${p => p.$user ? '#f43f5e' : '#fff1f2'};color:${p => p.$user ? '#fff' : '#e11d48'};font-size:15px;
`;
const ThinkingDot = styled.span`width:6px;height:6px;border-radius:50%;background:#94a3b8;display:inline-block;margin:0 2px;animation:${blink} 1.2s ${p => p.$d || 0}s infinite;`;
const InputRow = styled.div`display:flex;gap:10px;margin-top:4px;`;
const ChatInput = styled.textarea`
  flex:1;padding:12px 16px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:14px;
  font-family:inherit;resize:none;outline:none;line-height:1.5;max-height:120px;
  &:focus{border-color:#f43f5e;box-shadow:0 0 0 3px rgba(244,63,94,.1);}
  &::placeholder{color:#94a3b8;}
`;
const SendBtn = styled.button`
  width:46px;height:46px;border-radius:12px;border:none;font-size:18px;cursor:pointer;flex-shrink:0;
  background:${p => p.$dis ? '#e2e8f0' : 'linear-gradient(135deg,#f43f5e,#e11d48)'};
  color:${p => p.$dis ? '#94a3b8' : '#fff'};transition:all .2s;
  &:hover:not(:disabled){transform:scale(1.05);}
  svg{${p => p.$spin ? css`animation:${spin} 1s linear infinite;` : ''}}
`;
const QuickBtns = styled.div`display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;`;
const QBtn = styled.button`
  padding:7px 13px;border:1.5px solid #fecdd3;border-radius:999px;background:#fff1f2;color:#e11d48;
  font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;
  &:hover{background:#fecdd3;border-color:#f87171;}
`;

// ── Acil Bölümü ──
const EmergencyCard = styled.div`background:linear-gradient(135deg,#fff1f2,#ffe4e6);border:2px solid #fca5a5;border-radius:18px;padding:22px;`;
const EmergencyTitle = styled.div`font-size:16px;font-weight:800;color:#991b1b;display:flex;align-items:center;gap:9px;margin-bottom:16px;`;
const EmList = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;`;
const EmItem = styled.div`background:#fff;border:1px solid #fca5a5;border-radius:12px;padding:14px 16px;`;
const EmHead = styled.div`font-size:14px;font-weight:800;color:#991b1b;margin-bottom:5px;display:flex;align-items:center;gap:7px;`;
const EmDesc = styled.div`font-size:12px;color:#b91c1c;line-height:1.55;`;

// ── Yakın Veterinerler ──
const VetCard = styled.div`background:#fff;border-radius:20px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.06);`;
const PlaceholderVet = styled.div`
  background:#f8fafc;border:2px dashed #e2e8f0;border-radius:14px;padding:32px;
  text-align:center;color:#94a3b8;
  .icon{font-size:40px;margin-bottom:12px;}
  p{margin:0;font-size:13px;line-height:1.6;}
`;

// ── FAQ ──
const FaqCard = styled.div`background:#fff;border-radius:20px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.06);`;
const FaqSearch = styled.div`position:relative;margin-bottom:18px;svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:13px;}`;
const FaqInp = styled.input`width:100%;padding:11px 14px 11px 38px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:13px;outline:none;box-sizing:border-box;&:focus{border-color:#f43f5e;}`;
const FaqItem = styled.div`border:1.5px solid ${p => p.$open ? '#f43f5e' : '#f1f5f9'};border-radius:13px;margin-bottom:10px;overflow:hidden;transition:border-color .2s;`;
const FaqQ = styled.button`width:100%;padding:14px 18px;background:${p => p.$open ? '#fff1f2' : '#fff'};border:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:14px;font-weight:700;color:#0f172a;text-align:left;transition:background .2s;`;
const FaqA = styled.div`padding:14px 18px 16px;font-size:13px;color:#475569;line-height:1.65;background:#fff8f9;border-top:1px solid #fecdd3;`;
const NoFaq = styled.div`text-align:center;padding:32px;color:#94a3b8;font-size:13px;`;

// ─── DATA ───────────────────────────────────────────────────────────────────
const SAGLIK_FAQ = [
    { q: 'Mastit (meme iltihabı) belirtileri nelerdir?', a: 'Mastitte sütün topaklaşması veya sarımsı renk alması, meme dokusunun şişmesi, kızarması ve ısınması, hayvanın acı hissetmesi ve süt veriminin düşmesi gözlemlenir. Hafif vakalarda sütü sık sağmak (günde 3-4 kez) yardımcı olabilir, ancak mutlaka veteriner muayenesi yapılmalıdır.' },
    { q: 'Ketozis (aseton hastalığı) nedir?', a: 'Ketozis, özellikle doğumdan sonraki ilk 4-6 haftada yüksek verimli ineklerde görülen metabolik bir hastalıktır. Enerji açığı nedeniyle yağ dokusunun hızlı yıkılmasıyla oluşan keton cisimcikleri birikir. Belirtiler: süt veriminde ani düşüş, iştah kaybı, sütte/nefeste aseton kokusu. Acil veteriner desteği gerektirir.' },
    { q: 'Şap hastalığı belirtileri nelerdir?', a: 'Şap, ağız-burun-ayak bölgelerinde su dolu kabarcıklar, aşırı salya akışı, topalama, ateş (40-41°C) ve süt veriminde düşüşle karakterize viral bir hastalıktır. Bildirimi zorunlu, karantina gerektiren bir hastalıktır. Şap şüphesinde derhal il/ilçe tarım müdürlüğüne ve veterinerinize bildirin.' },
    { q: 'Gebelik toksemisi nedir?', a: 'Gebeliğin son döneminde (özellikle ikiz gebesilik) enerji yetersizliği nedeniyle gelişen metabolik bozukluktur. Belirtiler: durgunluk, iştahsızlık, denge kaybı. Önlem: kuru dönem beslenmesini dikkatli yönetmek, doğuma yakın enerji alımını artırmak. Veteriner müdahalesi gerekir.' },
    { q: 'Süt humması (hipokalsemi) ne zaman görülür?', a: 'Doğumu takiben ilk 72 saat içinde, özellikle yaşlı ve yüksek verimli ineklerde görülür. Düşük kan kalsiyum düzeyi nedeniyle hayvan ayağa kalkamaz, kaslar gevşer. Kuru dönemde düşük kalsiyumlu rasyon ve D vitamini takviyesi ile önlenir. Tedavi: veteriner tarafından IV kalsiyum uygulaması.' },
    { q: 'İnekler ne zaman aşılanmalı?', a: 'Temel aşı takvimi: Şap aşısı yılda 2 kez (veya 6 ayda bir), Brucella aşısı (dişiler için, uygun yaşta), Clostridial hastalıklar için kombine aşı yılda bir. Bölgenize göre ek aşılar (IBR, BVD, Leptospira) gerekebilir. Kesin aşı takvimi için bölgenizdeki veterinere danışın.' },
    { q: 'Karın şişkinliği (timpani/gaz) nasıl anlaşılır?', a: 'Sol böğürde belirgin şişlik, hayvanın huzursuzluğu, kalçayı tekmelemesi ve nefes darlığı gözlemlenir. Sol böğür bölgesine vurulduğunda balon sesi duyulur. Hafif vakalarda yürüyüş yaptırmak, baş yukarıda tutmak yardımcı olabilir. Ciddi vakalarda veteriner müdahalesi şarttır.' },
    { q: 'Doğum sonrası eşin atılmaması ne zaman sorun olur?', a: 'Doğumdan sonra 12 saat geçmesine rağmen eş atılmadıysa bu sorun olarak kabul edilir. 24 saate kadar beklenebilir, zorla çekilmemeli, uterusa enfeksiyon riski artar. 24 saat sonra veteriner eşin çıkarılması ve antibiyotik uygulaması için çağrılmalıdır.' },
    { q: 'Ham iştahsızlığın nedenleri nelerdir?', a: 'İştahsızlık birçok hastalığın belirtisi olabilir: ketozis, retikülitis (demir yutma), rumen asidozu, ağrı, yüksek ateş, yeni yem geçişi veya stres. 24 saatten uzun süren iştahsızlıkta veteriner muayenesi gereklidir.' },
    { q: 'Topallama neden olur, nasıl önlenir?', a: 'Topallama nedenleri: ayak tırnak hastalıkları (digital dermatit, beyaz hat hastalığı), rumen asidozu (sole ülseri), enfeksiyöz ayak hastalıkları. Önlem: yılda 2 kez tırnak bakımı, temiz ve kuru zemin, fenbendazol-bizmut içeren ayak banyoları, uygun rasyon (NDF dengesi).' },
];

const EMERGENCY_ITEMS = [
    { emoji: '🌡️', title: 'Yüksek Ateş (>40°C)', desc: 'Hızlı nefes, titreme, sütün kesilmesi eşlik ediyorsa ACİL veteriner bağlantısı yapın.' },
    { emoji: '🤰', title: 'Doğum Güçlüğü (Distosi)', desc: 'Sancılar 30-60 dakika içinde buzağı çıkmıyorsa müdahale gerekir. Veterineri arayın.' },
    { emoji: '💧', title: 'Şiddetli İshal', desc: 'Kanlı veya koyu kahverengi ishal, dehidrasyon belirtileri varsa acil sıvı tedavisi gereklidir.' },
    { emoji: '😮‍💨', title: 'Nefes Darlığı', desc: 'Ağzı açık, hızlı nefes, burun açıklıkları açılıp kapanıyorsa solunum yolu acildir.' },
    { emoji: '⬇️', title: 'Yere Yatıp Kalkamama', desc: 'Süt humması, ketozis veya yaralanma olabilir. Hemen veteriner çağrılmalıdır.' },
    { emoji: '👁️', title: 'Göz Akıntısı + Ateş', desc: 'IBR veya şap gibi bulaşıcı hastalık belirtisi olabilir. Hayvanı izole edin, veteriner çağrın.' },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────
const SaglikDanismani = () => {
    const [mainTab, setMainTab] = useState('ai');
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            text: '🩺 Merhaba! Ben Agrolina Sağlık Danışmanı\'yım.\n\nHayvanlarınızdaki belirtiler, hastalıklar, koruyucu önlemler veya aşı takvimleri hakkında genel bilgi verebilirim.\n\n⚠️ Lütfen unutmayın: Bu sistem genel bilgi amaçlıdır. Herhangi bir sağlık sorunu için mutlaka veteriner hekiminize başvurun.'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [faqSearch, setFaqSearch] = useState('');
    const [openFaq, setOpenFaq] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const filteredFaq = SAGLIK_FAQ.filter(f =>
        f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
        f.a.toLowerCase().includes(faqSearch.toLowerCase())
    );

    const handleSend = async (text) => {
        const soru = (text || input).trim();
        if (!soru || loading) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: soru }]);
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API}/api/ai/saglik`, { soru }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(prev => [...prev, { role: 'ai', text: res.data.yanit, alert: true }]);
        } catch (e) {
            const errMsg = e.response?.data?.message || e.message || 'Bilinmeyen hata';
            setMessages(prev => [...prev, { role: 'ai', text: `❌ Hata: ${errMsg}`, alert: true }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const QUICK = ['Mastit belirtileri nelerdir?', 'Doğum sonrası ineği nasıl izlemeliyim?', 'Hangi aşıları ne zaman yaptırmalıyım?'];

    return (
        <Wrap>
            {/* ── Kalıcı Veteriner Uyarı Banneri ── */}
            <VetBanner>
                <BannerIcon><FaExclamationTriangle /></BannerIcon>
                <BannerText>
                    <strong>⚠️ Önemli Sağlık Uyarısı</strong>
                    <span>Bu yapay zeka sistemi yalnızca genel bilgi sağlar, kesinlikle teşhis koymaz. Hayvanınızda herhangi bir sağlık sorunu fark ettiğinizde mutlaka bir veteriner hekime başvurun. Geç kalınan müdahaleler ölüme neden olabilir.</span>
                </BannerText>
                <VetBtn href="tel:444-0882">
                    <FaPhone size={12} /> Veteriner
                </VetBtn>
            </VetBanner>

            {/* ── Tab Bar ── */}
            <TabRow>
                <TBtn $a={mainTab === 'ai'} onClick={() => setMainTab('ai')}><FaRobot /> AI Danışman <AiBadge>YENİ</AiBadge></TBtn>
                <TBtn $a={mainTab === 'acil'} onClick={() => setMainTab('acil')}><FaExclamationTriangle /> Acil Belirtiler</TBtn>
                <TBtn $a={mainTab === 'faq'} onClick={() => setMainTab('faq')}><FaLightbulb /> Sık Sorulanlar</TBtn>
                <TBtn $a={mainTab === 'veterinerler'} onClick={() => setMainTab('veterinerler')}><FaStethoscope /> Veterinerler</TBtn>
            </TabRow>

            {/* ── AI TAB ── */}
            {mainTab === 'ai' && (
                <ChatCard>
                    <ChatHeader>
                        <AiIcon><FaHeartbeat /></AiIcon>
                        <div>
                            <h3>Sağlık AI Danışmanı</h3>
                            <div className="sub">Gemini 2.0 Flash · Büyükbaş Sağlık · Her yanıtta veteriner uyarısı</div>
                        </div>
                    </ChatHeader>

                    <QuickBtns>
                        {QUICK.map((q, i) => <QBtn key={i} onClick={() => handleSend(q)}>{q}</QBtn>)}
                    </QuickBtns>

                    <MessagesBox>
                        {messages.map((m, i) => (
                            <Msg key={i} $user={m.role === 'user'}>
                                <MsgAvatar $user={m.role === 'user'}>{m.role === 'user' ? '👤' : '🩺'}</MsgAvatar>
                                <MsgBubble $user={m.role === 'user'} $alert={m.alert}>{m.text}</MsgBubble>
                            </Msg>
                        ))}
                        {loading && (
                            <Msg>
                                <MsgAvatar>🩺</MsgAvatar>
                                <MsgBubble style={{ padding: '14px 18px' }}>
                                    <ThinkingDot $d={0} /><ThinkingDot $d={0.2} /><ThinkingDot $d={0.4} />
                                </MsgBubble>
                            </Msg>
                        )}
                        <div ref={messagesEndRef} />
                    </MessagesBox>

                    <InputRow>
                        <ChatInput
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Belirtileri yazın... (örn: İneğim 2 gündür yemek yemiyor, ateşi var)"
                            rows={2}
                            disabled={loading}
                        />
                        <SendBtn $dis={!input.trim() || loading} $spin={loading} onClick={() => handleSend()} disabled={!input.trim() || loading}>
                            {loading ? <FaSpinner /> : <FaPaperPlane />}
                        </SendBtn>
                    </InputRow>
                </ChatCard>
            )}

            {/* ── ACİL TAB ── */}
            {mainTab === 'acil' && (
                <EmergencyCard>
                    <EmergencyTitle>
                        <FaExclamationTriangle /> Acil Müdahale Gerektiren Belirtiler
                    </EmergencyTitle>
                    <EmList>
                        {EMERGENCY_ITEMS.map((item, i) => (
                            <EmItem key={i}>
                                <EmHead>{item.emoji} {item.title}</EmHead>
                                <EmDesc>{item.desc}</EmDesc>
                            </EmItem>
                        ))}
                    </EmList>
                    <div style={{ marginTop: 18, background: '#fff', borderRadius: 12, padding: '14px 18px', border: '1px solid #fca5a5', fontSize: 13, color: '#991b1b', fontWeight: 600, lineHeight: 1.6 }}>
                        🚨 Yukarıdaki belirtilerden herhangi birini fark ettiğinizde beklemeyin — veterinerinizi veya en yakın veteriner kliniğini derhal arayın.
                    </div>
                </EmergencyCard>
            )}

            {/* ── FAQ TAB ── */}
            {mainTab === 'faq' && (
                <FaqCard>
                    <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 9 }}>
                        <FaLightbulb color="#f59e0b" /> Sık Sorulan Sağlık Soruları
                    </h3>
                    <FaqSearch>
                        <FaSearch />
                        <FaqInp value={faqSearch} onChange={e => setFaqSearch(e.target.value)} placeholder="Hastalık veya belirtiye göre ara..." />
                    </FaqSearch>
                    {filteredFaq.length === 0
                        ? <NoFaq>🩺 Arama sonucu bulunamadı. <button style={{ color: '#e11d48', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }} onClick={() => { setMainTab('ai'); }}>AI\'ya sor →</button></NoFaq>
                        : filteredFaq.map((f, i) => (
                            <FaqItem key={i} $open={openFaq === i}>
                                <FaqQ $open={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    {f.q}
                                    {openFaq === i ? <FaChevronUp size={12} color="#e11d48" /> : <FaChevronDown size={12} color="#94a3b8" />}
                                </FaqQ>
                                {openFaq === i && (
                                    <FaqA>
                                        {f.a}
                                        <div style={{ marginTop: 10, padding: '8px 12px', background: '#fff1f2', borderRadius: 8, fontSize: 12, color: '#991b1b', fontWeight: 600 }}>
                                            ⚠️ Bu bilgiler genel amaçlıdır. Veteriner hekiminize danışmadan ilaç uygulamayın.
                                        </div>
                                    </FaqA>
                                )}
                            </FaqItem>
                        ))
                    }
                </FaqCard>
            )}

            {/* ── VETERİNERLER TAB ── */}
            {mainTab === 'veterinerler' && (
                <VetCard>
                    <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 9 }}>
                        <FaUserMd color="#e11d48" /> Yakın Veterinerler
                    </h3>
                    <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>Agrolina platformuna kayıtlı ve aktif veteriner hekimler burada görünecek.</p>
                    <PlaceholderVet>
                        <div className="icon">🩺</div>
                        <p>
                            <strong style={{ color: '#475569', display: 'block', marginBottom: 6, fontSize: 15 }}>Yakında Aktif!</strong>
                            Veteriner hekimler Agrolina'ya kayıt olduğunda ve profilleri onaylandığında burada görünecekler.
                            Çiftliğinize en yakın çevrimiçi veterinerle iletişime geçebileceksiniz.
                            <br /><br />
                            <span style={{ color: '#94a3b8', fontSize: 12 }}>Acil durumlarda il/ilçe tarım müdürlüğünüzü veya yakın veteriner kliniğini arayın.</span>
                        </p>
                    </PlaceholderVet>
                    <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 16px' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7 }}><FaBell /> Bildirim Al</div>
                            <div style={{ fontSize: 12, color: '#4ade80' }}>Yakın veteriner sisteme katıldığında sizi bilgilendireceğiz.</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 200, background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, padding: '14px 16px' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#991b1b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7 }}><FaPhone /> 7/24 Hattı</div>
                            <div style={{ fontSize: 12, color: '#b91c1c' }}>Gıda ve Kontrol Genel Müdürlüğü: 444-0882</div>
                        </div>
                    </div>
                </VetCard>
            )}
        </Wrap>
    );
};

export default SaglikDanismani;
