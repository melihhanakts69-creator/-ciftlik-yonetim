import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
    FaUserMd, FaChartLine, FaCheck, FaExclamationCircle,
    FaArrowRight, FaLightbulb, FaCopy, FaLeaf, FaDna, FaFire,
    FaWeight, FaPercentage, FaRobot, FaPaperPlane, FaSearch,
    FaChevronDown, FaChevronUp, FaSpinner
} from 'react-icons/fa';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'https://ciftlik-yonetim.onrender.com';

// --- ANIMATIONS ---
const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const blink = keyframes`0%,100%{opacity:1}50%{opacity:0}`;

// --- STYLED ---
const Wrap = styled.div`display:flex;flex-direction:column;gap:22px;animation:${fadeIn} .4s ease;`;

// ── Tabs ──
const TabRow = styled.div`display:flex;gap:8px;background:#fff;padding:6px;border-radius:14px;box-shadow:0 1px 6px rgba(0,0,0,.06);width:fit-content;`;
const TBtn = styled.button`
  padding:10px 20px;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;
  display:flex;align-items:center;gap:7px;transition:all .2s;
  background:${p => p.$a ? 'linear-gradient(135deg,#4ade80,#16a34a)' : 'transparent'};
  color:${p => p.$a ? '#fff' : '#64748b'};
  box-shadow:${p => p.$a ? '0 4px 12px rgba(74,222,128,.3)' : 'none'};
  &:hover{background:${p => p.$a ? 'linear-gradient(135deg,#4ade80,#16a34a)' : '#f1f5f9'};color:${p => p.$a ? '#fff' : '#0f172a'};}
`;
const AiBadge = styled.span`background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:9px;padding:2px 6px;border-radius:999px;font-weight:800;`;

// ── AI Chat ──
const ChatCard = styled.div`background:#fff;border-radius:20px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.06);`;
const ChatHeader = styled.div`
  display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #f1f5f9;
  h3{margin:0;font-size:18px;font-weight:800;color:#0f172a;}
  .sub{font-size:12px;color:#64748b;margin:2px 0 0;}
`;
const AiIcon = styled.div`
  width:44px;height:44px;border-radius:13px;background:linear-gradient(135deg,#4ade80,#16a34a);
  display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;flex-shrink:0;
`;
const MessagesBox = styled.div`
  min-height:200px;max-height:400px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;
  padding:4px 0 16px;
  &::-webkit-scrollbar{width:4px;}
  &::-webkit-scrollbar-track{background:#f8fafc;}
  &::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}
`;
const Msg = styled.div`
  display:flex;gap:10px;${p => p.$user ? css`flex-direction:row-reverse;` : ''};
  animation:${fadeIn} .25s ease;
`;
const MsgBubble = styled.div`
  max-width:80%;padding:12px 16px;border-radius:${p => p.$user ? '18px 4px 18px 18px' : '4px 18px 18px 18px'};
  font-size:14px;line-height:1.65;white-space:pre-wrap;
  background:${p => p.$user ? 'linear-gradient(135deg,#4ade80,#16a34a)' : '#f8fafc'};
  color:${p => p.$user ? '#fff' : '#1e293b'};
  border:${p => p.$user ? 'none' : '1px solid #f1f5f9'};
  box-shadow:0 2px 8px rgba(0,0,0,.05);
`;
const MsgAvatar = styled.div`
  width:32px;height:32px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
  background:${p => p.$user ? '#4ade80' : '#e8f5e9'};color:${p => p.$user ? '#fff' : '#2e7d32'};font-size:15px;
`;
const ThinkingDot = styled.span`width:6px;height:6px;border-radius:50%;background:#94a3b8;display:inline-block;margin:0 2px;animation:${blink} 1.2s ${p => p.$d || 0}s infinite;`;
const InputRow = styled.div`display:flex;gap:10px;margin-top:4px;`;
const ChatInput = styled.textarea`
  flex:1;padding:12px 16px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:14px;
  font-family:inherit;resize:none;outline:none;line-height:1.5;max-height:120px;
  &:focus{border-color:#4ade80;box-shadow:0 0 0 3px rgba(74,222,128,.1);}
  &::placeholder{color:#94a3b8;}
`;
const SendBtn = styled.button`
  width:46px;height:46px;border-radius:12px;border:none;font-size:18px;cursor:pointer;flex-shrink:0;
  background:${p => p.$dis ? '#e2e8f0' : 'linear-gradient(135deg,#4ade80,#16a34a)'};
  color:${p => p.$dis ? '#94a3b8' : '#fff'};transition:all .2s;
  &:hover:not(:disabled){transform:scale(1.05);}
  svg{${p => p.$spin ? css`animation:${spin} 1s linear infinite;` : ''}}
`;
const QuickBtns = styled.div`display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;`;
const QBtn = styled.button`
  padding:7px 13px;border:1.5px solid #d1fae5;border-radius:999px;background:#f0fdf4;color:#16a34a;
  font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;
  &:hover{background:#d1fae5;border-color:#4ade80;}
`;
const WarningBox = styled.div`
  background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:12px 16px;margin-top:12px;
  display:flex;gap:10px;align-items:flex-start;font-size:12px;color:#1e40af;line-height:1.5;
`;

// ── Static / Kılavuz ──
const Container = styled.div`display:grid;grid-template-columns:300px 1fr;gap:24px;@media(max-width:1024px){grid-template-columns:1fr;}`;
const Sidebar = styled.div`background:#fff;border-radius:20px;padding:22px;box-shadow:0 2px 12px rgba(0,0,0,.05);height:fit-content;position:sticky;top:20px;`;
const GroupBtn = styled.button`
  width:100%;padding:14px 18px;margin-bottom:10px;border:none;
  background:${p => p.$a ? 'linear-gradient(135deg,#2e7d32,#43a047)' : '#f8f9fa'};
  color:${p => p.$a ? '#fff' : '#555'};border-radius:14px;text-align:left;font-weight:700;
  cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:all .3s;
  box-shadow:${p => p.$a ? '0 6px 18px rgba(46,125,50,.25)' : 'none'};
  &:hover{transform:translateX(4px);}
`;
const Card = styled.div`background:#fff;border-radius:20px;padding:26px;box-shadow:0 2px 12px rgba(0,0,0,.05);position:relative;overflow:hidden;
  &::before{content:'';position:absolute;top:0;left:0;width:100%;height:5px;background:${p => p.$accent || 'transparent'};}`;
const CardH = styled.div`display:flex;align-items:center;gap:12px;margin-bottom:22px;
  .ico{width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:22px;background:${p => p.$bg || '#eee'};color:${p => p.$c || '#333'};}
  h3{margin:0;font-size:18px;font-weight:800;color:#1a1a1a;}
`;
const GGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px;`;
const GItem = styled.div`background:#fff;padding:18px;border-radius:18px;border:1px solid #f0f0f0;display:flex;
  flex-direction:column;align-items:center;text-align:center;transition:all .3s;
  &:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(0,0,0,.07);}
  .ico{font-size:22px;margin-bottom:10px;color:${p => p.$c || '#2e7d32'};}
  .val{font-size:20px;font-weight:900;color:#1a1a1a;}
  .lbl{font-size:12px;color:#666;font-weight:600;text-transform:uppercase;margin-top:3px;}
  .unit{font-size:11px;color:#999;margin-top:2px;}
`;
const TipBox = styled.div`background:linear-gradient(135deg,#fff8e1,#ffecb3);border-radius:14px;padding:18px;display:flex;gap:14px;
  .ib{background:rgba(255,179,0,.2);color:#f57f17;width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  ul{margin:0;padding-left:14px;font-size:13px;color:#5d4037;line-height:1.65;li{margin-bottom:5px;}}
`;
const RecipeCard = styled.div`background:#fff;border:1px solid #eee;border-radius:18px;padding:22px;margin-bottom:18px;transition:all .3s;position:relative;
  &:hover{border-color:#81c784;transform:translateY(-2px);box-shadow:0 10px 28px rgba(46,125,50,.08);}
  .hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:1px solid #f5f5f5;padding-bottom:12px;}
  .ings{display:flex;flex-wrap:wrap;gap:8px;}
  .ing{padding:7px 14px;background:#fafafa;border-radius:10px;font-size:12px;color:#444;border:1px solid #f0f0f0;display:flex;align-items:center;gap:6px;b{color:#2e7d32;}}
`;
const CopyBtn = styled.button`background:#fff;border:1px solid #ddd;padding:7px 14px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;color:#555;transition:all .2s;&:hover{background:#2e7d32;color:#fff;border-color:#2e7d32;}`;

// ── FAQ ──
const FaqCard = styled.div`background:#fff;border-radius:20px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.06);`;
const FaqSearch = styled.div`position:relative;margin-bottom:18px;svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:13px;}`;
const FaqInp = styled.input`width:100%;padding:11px 14px 11px 38px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:13px;outline:none;box-sizing:border-box;&:focus{border-color:#4ade80;}`;
const FaqItem = styled.div`border:1.5px solid ${p => p.$open ? '#4ade80' : '#f1f5f9'};border-radius:13px;margin-bottom:10px;overflow:hidden;transition:border-color .2s;`;
const FaqQ = styled.button`width:100%;padding:14px 18px;background:${p => p.$open ? '#f0fdf4' : '#fff'};border:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:14px;font-weight:700;color:#0f172a;text-align:left;transition:background .2s;`;
const FaqA = styled.div`padding:14px 18px 16px;font-size:13px;color:#475569;line-height:1.65;background:#f9fffe;border-top:1px solid #d1fae5;`;
const NoFaq = styled.div`text-align:center;padding:32px;color:#94a3b8;font-size:13px;`;

// ─── DATA ────────────────────────────────────────────────────────────────────
const ADVISOR_DATA = {
    sagmal: {
        title: 'Sağmal İnekler (Laktasyon)',
        guidelines: [
            { label: 'Ham Protein', value: '16–18', unit: '% KM', icon: <FaDna />, color: '#e91e63' },
            { label: 'Enerji (NEL)', value: '1.65–1.75', unit: 'Mcal/kg', icon: <FaFire />, color: '#ff9800' },
            { label: 'Kuru Madde', value: '20–24', unit: 'kg/gün', icon: <FaWeight />, color: '#2196f3' },
            { label: 'NDF', value: '30–35', unit: '% KM', icon: <FaPercentage />, color: '#9c27b0' },
        ],
        tips: [
            'Yüksek süt verimi için kaba yem kalitesini artırın.',
            'Sıcak havalarda yem tüketimi düşebilir, enerji yoğunluğunu artırın.',
            'Asidoz riskine karşı partikül boyutunu (2–3 cm) kontrol edin.',
        ],
        recipes: [
            { name: '🏆 Yüksek Verim Lideri (35L+)', type: 'TMR / MIX', ingredients: [{ name: 'Mısır Silajı', amount: 20 }, { name: 'Yonca Kuru Ot', amount: 4 }, { name: 'Süt Yemi (21 HP)', amount: 8.5 }, { name: 'Soya Küspesi', amount: 1.5 }, { name: 'Saman', amount: 0.8 }, { name: 'Bypass Yağ', amount: 0.3 }] },
            { name: '💰 Ekonomik Denge (20–25L)', type: 'TMR', ingredients: [{ name: 'Mısır Silajı', amount: 18 }, { name: 'Buğday Samanı', amount: 3 }, { name: 'Süt Yemi (19 HP)', amount: 7 }, { name: 'Arpa Ezme', amount: 2 }, { name: 'Mermer Tozu', amount: 0.1 }] },
        ],
    },
    kuru: {
        title: 'Kuru Dönem (Doğuma 2 Ay)',
        guidelines: [
            { label: 'Ham Protein', value: '12–14', unit: '% KM', icon: <FaDna />, color: '#ef5350' },
            { label: 'Enerji (NEL)', value: '1.30–1.40', unit: 'Mcal/kg', icon: <FaFire />, color: '#ffb74d' },
            { label: 'Kuru Madde', value: '12–14', unit: 'kg/gün', icon: <FaWeight />, color: '#42a5f5' },
        ],
        tips: [
            'Kalsiyum alımını sınırlayarak süt hummasını önleyin.',
            'Aşırı yağlanmadan kaçının (Hedef VKS: 3.25–3.50).',
            'Doğuma 2 hafta kala Close-up yemlemesine geçin.',
        ],
        recipes: [
            { name: '🛡️ Kuru Dönem Koruma', type: 'Kaba Yem Ağırlıklı', ingredients: [{ name: 'Mısır Silajı', amount: 10 }, { name: 'Yulaf Kuru Otu', amount: 4 }, { name: 'Buğday Samanı', amount: 3 }, { name: 'Düve/Kuru Yemi', amount: 2 }] },
        ],
    },
    besi: {
        title: 'Besi Danaları (Bitiş Dönemi)',
        guidelines: [
            { label: 'Ham Protein', value: '13–15', unit: '% KM', icon: <FaDna />, color: '#ab47bc' },
            { label: 'Enerji (ME)', value: '2.6–2.9', unit: 'Mcal/kg', icon: <FaFire />, color: '#ff7043' },
            { label: 'Kuru Madde', value: '%2.2', unit: 'C.A.', icon: <FaPercentage />, color: '#26c6da' },
        ],
        tips: [
            'Besi sonunda karkas kalitesi için enerji yoğunluğunu artırın.',
            'Protein ihtiyacı yaş ilerledikçe azalır, nişasta artar.',
            'Temiz ve taze su tüketimi yemden yararlanmayı %15 artırır.',
        ],
        recipes: [
            { name: '🚀 Hızlı Bitiş (Randıman)', type: 'Yoğun Enerji', ingredients: [{ name: 'Mısır Silajı', amount: 8 }, { name: 'Saman', amount: 1 }, { name: 'Besi Yemi', amount: 6 }, { name: 'Arpa/Mısır Ezme', amount: 4.5 }, { name: 'Ayçiçek Küspesi', amount: 0.5 }] },
        ],
    },
};

const YEM_FAQ = [
    { q: 'Sağmal inek için günlük kuru madde ne kadar olmalı?', a: 'Yüksek verimli sağmal ineklerde günlük kuru madde alımı 20–24 kg/gün olmalıdır. Canlı ağırlığın %3–3.5\'i kadar hesabı da kullanılabilir.' },
    { q: 'Mısır silajı ne zaman hasat edilmeli?', a: 'Mısır silajı için ideal hasat zamanı, danelerin %32–35 kuru madde içerdiği süt-hamur olum döneminde (balmumu olum) yapılmalıdır. Brix değeri 18-22 arasında olmalı.' },
    { q: 'Rasyon hazırlarken NDF oranı neden önemli?', a: 'NDF (Nötral Deterjan Fiber) geviş getirmeyi destekler, rumen pH\'ını dengeler ve asidoz riskini azaltır. Sağmal inekler için %30–35 KM düzeyinde olmalıdır.' },
    { q: 'Bypass yağı nedir, ne zaman kullanılır?', a: 'Bypass yağ, rumen fermentasyonundan geçmeden ince bağırsakta emilen enerji kaynağıdır. Yüksek verimli ineklerin erken laktasyonunda enerji açığını kapatmak için 200–500 g/gün düzeyinde kullanılır.' },
    { q: 'Soya küspesi yerine ne kullanabilirim?', a: 'Soya küspesi yerine ayçiçek küspesi, kanola küspesi veya pamuk tohumu küspesi kullanılabilir. Ancak protein kalitesi (amino asit profili) düşeceğinden miktarı %15–20 artırmanız gerekebilir.' },
    { q: 'Yem maliyetini nasıl düşürebilirim?', a: 'Silaj kalitesini artırın (en büyük tasarruf kaynağı), mevsimsel fiyat avantajlarından yararlanmak için tahıl alımı planlayın, bir zootekni uzmanıyla rasyon optimizasyonu yaptırın.' },
    { q: 'Kuru dönemde kaç kg yem verilmeli?', a: 'Kuru dönemde aşırı beslemeyi önlemek için günlük kuru madde alımı 12–14 kg ile sınırlı tutulmalıdır. Yüksek enerjili yem yerine kaliteli kaba yem (yonca, silaj) tercih edin.' },
    { q: 'Besi danalarında günlük canlı ağırlık artışı ne olmalı?', a: 'İyi besleme koşullarında besi danalarında 1.2–1.5 kg/gün canlı ağırlık artışı hedeflenir. Bu, yüksek enerjili (2.6–2.9 Mcal ME/kg KM) rasyon ile desteklenmeli.' },
    { q: 'Yonca mı mısır silajı mı daha iyi?', a: 'Her ikisi farklı amaçlar için kullanılır. Yonca yüksek protein (% 16–18) sağlar; mısır silajı enerji ve nişasta açısından zengindir. İdeal rasyon her ikisini de içerir: mısır silajı 18–20 kg + yonca 3–4 kg/gün.' },
    { q: 'TMR nedir, nasıl hazırlanır?', a: 'TMR (Total Mixed Ration / Tam Karışık Rasyon), tüm yem bileşenlerinin (kaba yem + kesif yem + katkılar) bir arada karıştırılarak verilmesidir. Yem seçiciliğini önler, rumen pH\'ını dengeler. Mikser arabası ile karıştırılır.' },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────
const YemDanismani = () => {
    const [mainTab, setMainTab] = useState('ai'); // 'ai' | 'kilavuz' | 'faq'
    const [selectedGroup, setSelectedGroup] = useState('sagmal');
    const [messages, setMessages] = useState([
        { role: 'ai', text: '👋 Merhaba! Ben Agrolina Yem Danışmanı\'yım. Rasyon, besleme, yem kalitesi ve maliyet optimizasyonu hakkında sorularınızı yanıtlayabilirim. Ne öğrenmek istersiniz?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [faqSearch, setFaqSearch] = useState('');
    const [openFaq, setOpenFaq] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const filteredFaq = YEM_FAQ.filter(f =>
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
            const res = await axios.post(`${API}/api/ai/yem`, { soru }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(prev => [...prev, { role: 'ai', text: res.data.yanit }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'ai', text: '❌ Bağlantı hatası. Lütfen tekrar deneyin.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const groupedData = ADVISOR_DATA[selectedGroup];

    const handleCopy = (recipe) => {
        const text = `📋 ${recipe.name}\n` + recipe.ingredients.map(i => `- ${i.name}: ${i.amount}kg`).join('\n');
        navigator.clipboard.writeText(text).then(() => alert('Reçete kopyalandı!'));
    };

    const QUICK = ['Sağmal inek için ideal rasyon nedir?', 'Mısır silajı miktarı nasıl ayarlanır?', 'Yem maliyetini nasıl düşürebilirim?'];

    return (
        <Wrap>
            {/* Tab Bar */}
            <TabRow>
                <TBtn $a={mainTab === 'ai'} onClick={() => setMainTab('ai')}><FaRobot /> AI Danışman <AiBadge>YENİ</AiBadge></TBtn>
                <TBtn $a={mainTab === 'kilavuz'} onClick={() => setMainTab('kilavuz')}><FaChartLine /> Besleme Kılavuzu</TBtn>
                <TBtn $a={mainTab === 'faq'} onClick={() => setMainTab('faq')}><FaLightbulb /> Sık Sorulanlar</TBtn>
            </TabRow>

            {/* ── AI TAB ── */}
            {mainTab === 'ai' && (
                <ChatCard>
                    <ChatHeader>
                        <AiIcon><FaRobot /></AiIcon>
                        <div>
                            <h3>Yem & Rasyon AI Danışmanı</h3>
                            <div className="sub">Gemini 2.0 Flash · Zootekni Uzmanı · Türkçe</div>
                        </div>
                    </ChatHeader>

                    <QuickBtns>
                        {QUICK.map((q, i) => <QBtn key={i} onClick={() => handleSend(q)}>{q}</QBtn>)}
                    </QuickBtns>

                    <MessagesBox>
                        {messages.map((m, i) => (
                            <Msg key={i} $user={m.role === 'user'}>
                                <MsgAvatar $user={m.role === 'user'}>{m.role === 'user' ? '👤' : '🌿'}</MsgAvatar>
                                <MsgBubble $user={m.role === 'user'}>{m.text}</MsgBubble>
                            </Msg>
                        ))}
                        {loading && (
                            <Msg>
                                <MsgAvatar>🌿</MsgAvatar>
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
                            placeholder="Örn: 30 litrelik inek için ne kadar silaj vermeliyim?"
                            rows={2}
                            disabled={loading}
                        />
                        <SendBtn $dis={!input.trim() || loading} $spin={loading} onClick={() => handleSend()} disabled={!input.trim() || loading}>
                            {loading ? <FaSpinner /> : <FaPaperPlane />}
                        </SendBtn>
                    </InputRow>

                    <WarningBox>
                        <FaExclamationCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>AI önerileri genel bilgi amaçlıdır. Özel rasyon optimizasyonu için bir zootekni uzmanına danışın.</span>
                    </WarningBox>
                </ChatCard>
            )}

            {/* ── KILAVUZ TAB ── */}
            {mainTab === 'kilavuz' && (
                <Container>
                    <Sidebar>
                        <div style={{ paddingBottom: 18, borderBottom: '1px solid #eee', marginBottom: 18 }}>
                            <h3 style={{ fontSize: 16, color: '#1a1a1a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 9, margin: 0 }}>
                                <FaUserMd color="#2e7d32" /> Hayvan Grubu
                            </h3>
                            <p style={{ fontSize: 12, color: '#666', margin: '5px 0 0' }}>Grubunu seç, ideal rasyonu gör</p>
                        </div>
                        {[['sagmal', '🐄 Sağmal İnek'], ['kuru', '🤰 Kuru Dönem'], ['besi', '🐂 Besi Danası']].map(([key, label]) => (
                            <GroupBtn key={key} $a={selectedGroup === key} onClick={() => setSelectedGroup(key)}>
                                <span>{label}</span><FaArrowRight size={13} />
                            </GroupBtn>
                        ))}
                        <WarningBox style={{ marginTop: 10 }}>
                            <FaExclamationCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span>Rasyonlar genel ortalamalara göre hazırlanmıştır.</span>
                        </WarningBox>
                    </Sidebar>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <Card $accent="#2e7d32">
                            <CardH $bg="#e8f5e9" $c="#2e7d32">
                                <div className="ico"><FaChartLine /></div>
                                <div><h3>{groupedData.title}</h3><span style={{ fontSize: 13, color: '#666' }}>Besleme Referans Değerleri</span></div>
                            </CardH>
                            <GGrid>
                                {groupedData.guidelines.map((g, i) => (
                                    <GItem key={i} $c={g.color}>
                                        <div className="ico">{g.icon}</div>
                                        <div className="lbl">{g.label}</div>
                                        <div className="val">{g.value}</div>
                                        <div className="unit">{g.unit}</div>
                                    </GItem>
                                ))}
                            </GGrid>
                            <TipBox>
                                <div className="ib"><FaLightbulb /></div>
                                <div><strong style={{ color: '#f57f17', display: 'block', marginBottom: 4 }}>Uzman Tavsiyeleri</strong><ul>{groupedData.tips.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
                            </TipBox>
                        </Card>

                        <Card $accent="#1565c0">
                            <CardH $bg="#e3f2fd" $c="#1565c0">
                                <div className="ico"><FaLeaf /></div>
                                <div><h3>Örnek Rasyonlar</h3><span style={{ fontSize: 13, color: '#666' }}>Kanıtlanmış dengeli menüler</span></div>
                            </CardH>
                            {groupedData.recipes.map((r, i) => (
                                <RecipeCard key={i}>
                                    <div className="hd">
                                        <div>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a' }}>{r.name}</div>
                                            <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{r.type}</div>
                                        </div>
                                        <CopyBtn onClick={() => handleCopy(r)}><FaCopy size={11} /> Kopyala</CopyBtn>
                                    </div>
                                    <div className="ings">
                                        {r.ingredients.map((ing, k) => (
                                            <div key={k} className="ing"><FaCheck size={9} color="#2e7d32" />{ing.name}: <b>{ing.amount} kg</b></div>
                                        ))}
                                    </div>
                                </RecipeCard>
                            ))}
                        </Card>
                    </div>
                </Container>
            )}

            {/* ── FAQ TAB ── */}
            {mainTab === 'faq' && (
                <FaqCard>
                    <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 9 }}>
                        <FaLightbulb color="#f59e0b" /> Sık Sorulan Sorular
                    </h3>
                    <FaqSearch>
                        <FaSearch />
                        <FaqInp value={faqSearch} onChange={e => setFaqSearch(e.target.value)} placeholder="Soru veya konuya göre ara..." />
                    </FaqSearch>
                    {filteredFaq.length === 0
                        ? <NoFaq>🌿 Arama sonucu bulunamadı. <button style={{ color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }} onClick={() => { setMainTab('ai'); }}>AI\'ya sor →</button></NoFaq>
                        : filteredFaq.map((f, i) => (
                            <FaqItem key={i} $open={openFaq === i}>
                                <FaqQ $open={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    {f.q}
                                    {openFaq === i ? <FaChevronUp size={12} color="#16a34a" /> : <FaChevronDown size={12} color="#94a3b8" />}
                                </FaqQ>
                                {openFaq === i && <FaqA>{f.a}</FaqA>}
                            </FaqItem>
                        ))
                    }
                </FaqCard>
            )}
        </Wrap>
    );
};

export default YemDanismani;
