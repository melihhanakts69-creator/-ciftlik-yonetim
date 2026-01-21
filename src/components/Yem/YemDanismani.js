import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
    FaUserMd, FaChartLine, FaCheck, FaExclamationCircle,
    FaArrowRight, FaLightbulb, FaCopy, FaLeaf, FaDna, FaFire, FaWeight, FaPercentage
} from 'react-icons/fa';

// --- ANIMATIONS ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

// --- STYLED COMPONENTS ---

const Container = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 30px;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.04);
  height: fit-content;
  border: 1px solid rgba(0,0,0,0.03);
  position: sticky;
  top: 20px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const GroupButton = styled.button`
  width: 100%;
  padding: 18px 20px;
  margin-bottom: 12px;
  border: none;
  background: ${props => props.active ? 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#555'};
  border-radius: 16px;
  text-align: left;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.active ? '0 8px 20px rgba(46, 125, 50, 0.25)' : 'none'};
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)' : '#f1f3f4'};
    transform: translateX(5px);
  }

  svg {
    opacity: ${props => props.active ? 1 : 0.5};
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.03);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 6px;
    background: ${props => props.accent || 'transparent'};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;

  .icon-wrapper {
    width: 50px;
    height: 50px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: ${props => props.iconBg || '#eee'};
    color: ${props => props.iconColor || '#333'};
  }

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: #1a1a1a;
    letter-spacing: -0.5px;
  }
`;

const GuidelineGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const GuidelineItem = styled.div`
  background: white;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.06);
    border-color: #e0f2f1;
    
    .icon {
      transform: scale(1.1) rotate(5deg);
    }
  }

  .icon {
    font-size: 24px;
    margin-bottom: 12px;
    color: ${props => props.color || '#2e7d32'};
    transition: transform 0.3s;
  }
  
  .val { 
    font-size: 22px; 
    font-weight: 900; 
    color: #1a1a1a; 
    margin: 5px 0;
    background: linear-gradient(45deg, #1a1a1a, #43a047);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .label { font-size: 13px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .unit { font-size: 12px; color: #999; font-weight: 500; margin-top: 4px; }
`;

const RecipeCard = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: #81c784;
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(46, 125, 50, 0.08);

    .copy-btn {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #f5f5f5;
    padding-bottom: 15px;
    
    h4 { margin: 0; color: #1a1a1a; font-size: 17px; font-weight: 700; }
    .tag { 
        font-size: 11px; 
        background: #e8f5e9; 
        color: #2e7d32; 
        padding: 6px 12px; 
        border-radius: 30px; 
        font-weight: 700; 
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }
  }

  .ingredients {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }

  .ing-item {
     padding: 8px 16px;
     background: #fafafa;
     border-radius: 12px;
     font-size: 13px;
     color: #444;
     border: 1px solid #f0f0f0;
     display: flex;
     align-items: center;
     gap: 8px;

     b { color: #2e7d32; }
  }

  .copy-btn {
    position: absolute;
    top: 24px;
    right: 24px;
    background: white;
    border: 1px solid #ddd;
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #555;
    transition: all 0.2s;
    opacity: 0;
    transform: translateY(5px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);

    &:hover {
        background: #2e7d32;
        color: white;
        border-color: #2e7d32;
    }
    
    @media (max-width: 768px) {
        opacity: 1;
        transform: translateY(0);
        position: static;
        margin-top: 15px;
        width: full;
        justify-content: center;
    }
  }
`;

const TipBox = styled.div`
    background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    gap: 15px;
    align-items: flex-start;
    color: #616161;

    .icon-box {
        background: rgba(255,179,0,0.2);
        color: #f57f17;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    ul {
        margin: 0;
        padding-left: 15px;
        line-height: 1.6;
        font-size: 14px;
        color: #5d4037;
        
        li { margin-bottom: 6px; &:last-child { margin-bottom: 0; } }
    }
`;

// --- DATA ---
const ADVISOR_DATA = {
    sagmal: {
        title: "Sağmal İnekler (Laktasyon)",
        guidelines: [
            { label: "Ham Protein", value: "16 - 18", unit: "% KM", icon: <FaDna />, color: "#e91e63" },
            { label: "Enerji (NEL)", value: "1.65 - 1.75", unit: "Mcal/kg", icon: <FaFire />, color: "#ff9800" },
            { label: "Kuru Madde", value: "20 - 24", unit: "kg/gün", icon: <FaWeight />, color: "#2196f3" },
            { label: "NDF", value: "30 - 35", unit: "% KM", icon: <FaPercentage />, color: "#9c27b0" }
        ],
        tips: [
            "Yüksek süt verimi için kaba yem kalitesini artırın.",
            "Sıcak havalarda yem tüketimi düşebilir, enerji yoğunluğunu artırın.",
            "Asidoz riskine karşı partikül boyutunu (2-3cm) kontrol edin."
        ],
        recipes: [
            {
                name: "🏆 Yüksek Verim Lideri (35L+)",
                type: "TMR / MIX",
                ingredients: [
                    { name: "Mısır Silajı", amount: 20 },
                    { name: "Yonca Kuru Ot", amount: 4 },
                    { name: "Süt Yemi (21 HP)", amount: 8.5 },
                    { name: "Soya Küspesi", amount: 1.5 },
                    { name: "Saman", amount: 0.8 },
                    { name: "Bypass Yağ", amount: 0.3 }
                ]
            },
            {
                name: "💰 Ekonomik Denge (20-25L)",
                type: "TMR",
                ingredients: [
                    { name: "Mısır Silajı", amount: 18 },
                    { name: "Buğday Samanı", amount: 3 },
                    { name: "Süt Yemi (19 HP)", amount: 7 },
                    { name: "Arpa Ezme", amount: 2 },
                    { name: "Mermer Tozu", amount: 0.1 }
                ]
            }
        ]
    },
    kuru: {
        title: "Kuru Dönem (Doğuma 2 Ay)",
        guidelines: [
            { label: "Ham Protein", value: "12 - 14", unit: "% KM", icon: <FaDna />, color: "#ef5350" },
            { label: "Enerji (NEL)", value: "1.30 - 1.40", unit: "Mcal/kg", icon: <FaFire />, color: "#ffb74d" },
            { label: "Kuru Madde", value: "12 - 14", unit: "kg/gün", icon: <FaWeight />, color: "#42a5f5" },
        ],
        tips: [
            "Kalsiyum alımını sınırlayarak süt hummasını (hipokalsemi) önleyin.",
            "Aşırı yağlanmadan kaçının (Hedef VKS: 3.25 - 3.50).",
            "Doğuma 2 hafta kala 'Buharda Hazırlık' (Close-up) yemlemesine geçin."
        ],
        recipes: [
            {
                name: "🛡️ Kuru Dönem Koruma",
                type: "Kaba Yem Ağırlıklı",
                ingredients: [
                    { name: "Mısır Silajı", amount: 10 },
                    { name: "Yulaf Kuru Otu", amount: 4 },
                    { name: "Buğday Samanı", amount: 3 },
                    { name: "Düve/Kuru Yemi", amount: 2 }
                ]
            }
        ]
    },
    besi: {
        title: "Besi Danaları (Bitiş Dönemi)",
        guidelines: [
            { label: "Ham Protein", value: "13 - 15", unit: "% KM", icon: <FaDna />, color: "#ab47bc" },
            { label: "Enerji (ME)", value: "2.6 - 2.9", unit: "Mcal/kg", icon: <FaFire />, color: "#ff7043" },
            { label: "Kuru Madde", value: "%2.2", unit: "C.A.", icon: <FaPercentage />, color: "#26c6da" },
        ],
        tips: [
            "Besi sonunda karkas kalitesi için enerji yoğunluğunu artırın.",
            "Protein ihtiyacı yaş ilerledikçe azalır, nişasta ihtiyacı artar.",
            "Temiz ve taze su tüketimi yemden yararlanmayı %15 artırır."
        ],
        recipes: [
            {
                name: "🚀 Hızlı Bitiş (Randıman)",
                type: "Yoğun Enerji",
                ingredients: [
                    { name: "Mısır Silajı", amount: 8 },
                    { name: "Saman", amount: 1 },
                    { name: "Besi Yemi", amount: 6 },
                    { name: "Arpa/Mısır Ezme", amount: 4.5 },
                    { name: "Ayçiçek Küspesi", amount: 0.5 }
                ]
            }
        ]
    }
};

const YemDanismani = () => {
    const [selectedGroup, setSelectedGroup] = useState('sagmal');
    const groupedData = ADVISOR_DATA[selectedGroup];

    const handleCopy = (recipe) => {
        const text = `📋 ${recipe.name}\n` +
            recipe.ingredients.map(i => `- ${i.name}: ${i.amount}kg`).join('\n');

        navigator.clipboard.writeText(text).then(() => {
            alert('Harika! Reçete kopyalandı.');
        }).catch(() => { });
    };

    return (
        <Container>
            <Sidebar>
                <div style={{ padding: '0 0 20px 0', borderBottom: '1px solid #eee', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 18, color: '#1a1a1a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FaUserMd color="#2e7d32" /> Uzman Paneli
                    </h3>
                    <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Hayvan grubunu seçin, ideal rasyonu görün.</p>
                </div>

                <GroupButton active={selectedGroup === 'sagmal'} onClick={() => setSelectedGroup('sagmal')}>
                    <span>🐄 Sağmal İnek</span>
                    <FaArrowRight size={14} />
                </GroupButton>
                <GroupButton active={selectedGroup === 'kuru'} onClick={() => setSelectedGroup('kuru')}>
                    <span>🤰 Kuru Dönem</span>
                    <FaArrowRight size={14} />
                </GroupButton>
                <GroupButton active={selectedGroup === 'besi'} onClick={() => setSelectedGroup('besi')}>
                    <span>🐂 Besi Danası</span>
                    <FaArrowRight size={14} />
                </GroupButton>

                <div style={{ marginTop: 25, padding: 20, background: '#e3f2fd', borderRadius: 16, border: '1px solid #bbdefb' }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <FaExclamationCircle color="#1976d2" size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div style={{ fontSize: 12, color: '#0d47a1', lineHeight: '1.5', fontWeight: 500 }}>
                            <strong style={{ display: 'block', marginBottom: 4 }}>Yasal Uyarı</strong>
                            Bu rasyonlar genel ortalamalara göre hazırlanmıştır. Hayvanlarınızın özel durumu için veterinerinize danışın.
                        </div>
                    </div>
                </div>
            </Sidebar>

            <Content>
                {/* --- HEADER GUIDELINES --- */}
                <Card accent="#2e7d32">
                    <CardHeader iconBg="#e8f5e9" iconColor="#2e7d32">
                        <div className="icon-wrapper">
                            <FaChartLine />
                        </div>
                        <div>
                            <h3>{groupedData.title}</h3>
                            <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>Besleme Referans Değerleri</span>
                        </div>
                    </CardHeader>

                    <GuidelineGrid>
                        {groupedData.guidelines.map((g, i) => (
                            <GuidelineItem key={i} color={g.color}>
                                <div className="icon">{g.icon}</div>
                                <div className="label">{g.label}</div>
                                <div className="val">{g.value}</div>
                                <div className="unit">{g.unit}</div>
                            </GuidelineItem>
                        ))}
                    </GuidelineGrid>

                    <TipBox>
                        <div className="icon-box"><FaLightbulb /></div>
                        <div>
                            <strong style={{ color: '#f57f17', display: 'block', marginBottom: 5 }}>Uzman Tavsiyeleri</strong>
                            <ul>
                                {groupedData.tips.map((tip, i) => (
                                    <li key={i}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    </TipBox>
                </Card>

                {/* --- RECIPES --- */}
                <Card accent="#1565c0">
                    <CardHeader iconBg="#e3f2fd" iconColor="#1565c0">
                        <div className="icon-wrapper">
                            <FaLeaf />
                        </div>
                        <div>
                            <h3>Örnek Rasyonlar</h3>
                            <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>Profesyonelçe hazırlanmış dengeli menüler</span>
                        </div>
                    </CardHeader>

                    {groupedData.recipes.map((recipe, i) => (
                        <RecipeCard key={i}>
                            <button className="copy-btn" onClick={() => handleCopy(recipe)}>
                                <FaCopy /> Kopyala
                            </button>

                            <div className="header">
                                <div>
                                    <h4>{recipe.name}</h4>
                                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Önerilen Karışım Tipi</div>
                                </div>
                                <span className="tag">{recipe.type}</span>
                            </div>

                            <div className="ingredients">
                                {recipe.ingredients.map((ing, k) => (
                                    <div key={k} className="ing-item">
                                        <FaCheck size={10} color="#2e7d32" />
                                        <span>{ing.name}:</span>
                                        <b>{ing.amount} kg</b>
                                    </div>
                                ))}
                            </div>
                        </RecipeCard>
                    ))}
                </Card>
            </Content>
        </Container>
    );
};

export default YemDanismani;
