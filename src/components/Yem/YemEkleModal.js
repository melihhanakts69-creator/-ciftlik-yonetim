import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaSave, FaSearch, FaMagic } from 'react-icons/fa';
import * as api from '../../services/api';

// --- STYLED COMPONENTS ---
const Overlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
  padding: 16px; box-sizing: border-box;
  overflow-y: auto; -webkit-overflow-scrolling: touch;
  @media (max-width: 768px) {
    align-items: flex-start; padding: 12px;
    padding-top: max(12px, env(safe-area-inset-top));
    padding-bottom: max(24px, env(safe-area-inset-bottom));
  }
`;
const ModalContainer = styled.div`
  background: white; width: 100%; max-width: 550px; border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15); padding: 25px; position: relative;
  max-height: calc(100vh - 32px); overflow-y: auto; flex-shrink: 0;
  -webkit-overflow-scrolling: touch;
  @media (max-width: 768px) {
    max-height: calc(100vh - 24px); border-radius: 14px;
    padding: 20px; padding-bottom: calc(20px + env(safe-area-inset-bottom, 0));
    margin: auto 0;
  }
`;
const CloseButton = styled.button`
  position: absolute; top: 20px; right: 20px; background: none; border: none;
  font-size: 20px; cursor: pointer; color: #94a3b8; transition: .2s;
  &:hover { color: #1e293b; transform: rotate(90deg); }
`;
const Title = styled.h2`
  color: #0f172a; margin: 0 0 20px 0; font-size: 1.5rem; font-weight: 800;
  display: flex; align-items: center; gap: 10px;
`;
const Form = styled.form`display: flex; flex-direction: column; gap: 16px;`;
const InputGroup = styled.div`
  display: flex; flex-direction: column; gap: 6px; position: relative;
  label { font-weight: 700; font-size: 0.85rem; color: #475569; }
  input { 
    padding: 12px 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; color: #1e293b; background: #f8fafc; transition: .2s;
    &:focus { border-color: #16a34a; background: #fff; outline: none; box-shadow: 0 0 0 3px rgba(22,163,74,.1); }
  }
`;
const SearchWrap = styled.div`
  position: relative;
  input { padding-left: 36px; width: 100%; box-sizing: border-box; }
  .icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
`;
const SuggestionList = styled.div`
  position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #e2e8f0;
  border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); z-index: 10; margin-top: 5px;
  max-height: 200px; overflow-y: auto;
`;
const SuggestionItem = styled.div`
  padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem;
  display: flex; justify-content: space-between; align-items: center;
  &:hover { background: #f0fdf4; color: #047857; }
  &:last-child { border-bottom: none; }
  .badge { font-size: 0.75rem; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #475569; }
`;
const AlertBox = styled.div`
  background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46;
  padding: 12px; border-radius: 10px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; font-weight: 600;
`;
const ActionButtons = styled.div`display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;`;
const Button = styled.button`
  padding: 12px 24px; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: .2s; font-size: 0.95rem;
  &.cancel { background: #f1f5f9; color: #475569; &:hover { background: #e2e8f0; } }
  &.save { background: linear-gradient(135deg, #16a34a, #16a34a); color: white; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(22,163,74,.3); &:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(22,163,74,.4); } }
`;

// --- GLOBAL MASTER FEED DB ---
const MASTER_DB = [
  { ad: 'Arpa Ezme', kategori: 'Tahıl', kuruMadde: 88, protein: 11, enerji: 2.8, nisasta: 55 },
  { ad: 'Yonca Kuru Otu', kategori: 'Kaba Yem', kuruMadde: 90, protein: 16, enerji: 2.1, nisasta: 2 },
  { ad: 'Yonca Silajı', kategori: 'Kaba Yem', kuruMadde: 35, protein: 18, enerji: 2.2, nisasta: 2 },
  { ad: 'Mısır Silajı', kategori: 'Kaba Yem', kuruMadde: 32, protein: 8, enerji: 2.5, nisasta: 30 },
  { ad: 'Buğday Samanı', kategori: 'Kaba Yem', kuruMadde: 90, protein: 3, enerji: 1.6, nisasta: 0 },
  { ad: 'Arpa Samanı', kategori: 'Kaba Yem', kuruMadde: 90, protein: 3.5, enerji: 1.65, nisasta: 0 },
  { ad: 'Ryegrass', kategori: 'Kaba Yem', kuruMadde: 20, protein: 16, enerji: 2.5, nisasta: 10 },
  { ad: 'Mısır Flake', kategori: 'Tahıl', kuruMadde: 88, protein: 9, enerji: 3.2, nisasta: 72 },
  { ad: 'Soya Küspesi', kategori: 'Protein', kuruMadde: 90, protein: 48, enerji: 3.3, nisasta: 5 },
  { ad: 'Ayçiçek Küspesi (%28)', kategori: 'Protein', kuruMadde: 90, protein: 28, enerji: 2.0, nisasta: 2 },
  { ad: 'Pamuk Tohumu Küspesi', kategori: 'Protein', kuruMadde: 90, protein: 28, enerji: 2.1, nisasta: 2 },
  { ad: 'Süt Yemi (%19)', kategori: 'Karma Yem', kuruMadde: 88, protein: 19, enerji: 2.7, nisasta: 25 },
  { ad: 'Süt Yemi (%21)', kategori: 'Karma Yem', kuruMadde: 88, protein: 21, enerji: 2.7, nisasta: 25 },
  { ad: 'Besi Yemi', kategori: 'Karma Yem', kuruMadde: 88, protein: 14, enerji: 2.8, nisasta: 35 },
  { ad: 'Buzağı Başlangıç Yemi', kategori: 'Karma Yem', kuruMadde: 89, protein: 20, enerji: 3.0, nisasta: 35 },
  { ad: 'Buğday Kepeği', kategori: 'Yan Ürün', kuruMadde: 89, protein: 15, enerji: 2.3, nisasta: 20 },
  { ad: 'Pancar Posası (Yaş)', kategori: 'Yan Ürün', kuruMadde: 22, protein: 9, enerji: 2.6, nisasta: 1 }
];

const YemEkleModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    ad: '', birimFiyat: '', kuruMadde: '', protein: '', enerji: '', nisasta: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [autoFilled, setAutoFilled] = useState(false);

  const handleSearch = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, ad: val });
    setAutoFilled(false);

    if (val.length >= 2) {
      const matches = MASTER_DB.filter(item =>
        item.ad.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (item) => {
    setFormData({
      ...formData,
      ad: item.ad,
      kuruMadde: item.kuruMadde,
      protein: item.protein,
      enerji: item.enerji,
      nisasta: item.nisasta
    });
    setSuggestions([]);
    setAutoFilled(true);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createYemItem({
        ...formData,
        birimFiyat: parseFloat(formData.birimFiyat),
        kuruMadde: parseFloat(formData.kuruMadde || 0),
        protein: parseFloat(formData.protein || 0),
        enerji: parseFloat(formData.enerji || 0),
        nisasta: parseFloat(formData.nisasta || 0)
      });
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Yem kaydedilirken hata oluştu.');
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}><FaTimes /></CloseButton>
        <Title>Yeni Yem Girişi</Title>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <label>Yem Kütüphanesinden Ara (Örn: Arpa, Yonca, Soya Küspesi)</label>
            <SearchWrap>
              <FaSearch className="icon" />
              <input
                name="ad" required autoComplete="off"
                value={formData.ad}
                onChange={handleSearch}
                placeholder="Yem adı yazın..."
              />
            </SearchWrap>
            {suggestions.length > 0 && (
              <SuggestionList>
                {suggestions.map((item, idx) => (
                  <SuggestionItem key={idx} onClick={() => selectSuggestion(item)}>
                    <strong>{item.ad}</strong>
                    <span className="badge">{item.kategori}</span>
                  </SuggestionItem>
                ))}
              </SuggestionList>
            )}
          </InputGroup>

          {autoFilled && (
            <AlertBox>
              <FaMagic /> Besin değerleri kütüphaneden otomatik dolduruldu!
            </AlertBox>
          )}

          <InputGroup>
            <label>Banka/Maliyet Fiyatı (TL/kg)</label>
            <input name="birimFiyat" type="number" step="0.01" required value={formData.birimFiyat} onChange={handleChange} placeholder="Örn: 5.50" />
          </InputGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, background: '#f8fafc', padding: 15, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <InputGroup>
              <label>Kuru Madde (%)</label>
              <input name="kuruMadde" type="number" step="0.1" value={formData.kuruMadde} onChange={handleChange} placeholder="%" />
            </InputGroup>
            <InputGroup>
              <label>Ham Protein (HP %)</label>
              <input name="protein" type="number" step="0.1" value={formData.protein} onChange={handleChange} placeholder="%" />
            </InputGroup>
            <InputGroup>
              <label>Enerji (ME - Mcal)</label>
              <input name="enerji" type="number" step="0.01" value={formData.enerji} onChange={handleChange} placeholder="Mcal" />
            </InputGroup>
            <InputGroup>
              <label>Nişasta (%)</label>
              <input name="nisasta" type="number" step="0.1" value={formData.nisasta} onChange={handleChange} placeholder="%" />
            </InputGroup>
          </div>

          <ActionButtons>
            <Button type="button" className="cancel" onClick={onClose}>İptal</Button>
            <Button type="submit" className="save"><FaSave /> Kaydet</Button>
          </ActionButtons>
        </Form>
      </ModalContainer>
    </Overlay>
  );
};

export default YemEkleModal;
