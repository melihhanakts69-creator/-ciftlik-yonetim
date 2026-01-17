import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaMoneyBillWave, FaCalendarAlt, FaUser, FaCheck } from 'react-icons/fa';
import * as api from '../../services/api';

const Overlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 1100;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: white;
  width: 90%; max-width: 500px;
  border-radius: 20px;
  padding: 30px;
  position: relative;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  animation: slideIn 0.3s ease-out;
  max-height: 85vh; /* Ekranın %85'ini geçmesin */
  overflow-y: auto; /* İçerik taşarsa kaydırma çubuğu çıksın */

  @keyframes slideIn {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const CloseButton = styled.button`
  position: absolute; top: 20px; right: 20px;
  background: none; border: none; font-size: 20px; color: #666;
  cursor: pointer; transition: color 0.2s;
  &:hover { color: #f44336; }
`;

const Title = styled.h2`
  margin: 0 0 20px; color: #2c3e50; font-size: 24px;
  display: flex; align-items: center; gap: 10px;
  
  svg { color: #4CAF50; }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block; margin-bottom: 8px; font-weight: 600; color: #34495e; font-size: 14px;
  }
  
  .input-wrapper {
    position: relative;
    
    svg {
      position: absolute; left: 15px; top: 50%; transform: translateY(-50%);
      color: #95a5a6;
    }
    
    input, textarea {
      width: 100%;
      padding: 12px 15px 12px 45px;
      border: 2px solid #ecf0f1;
      border-radius: 12px;
      font-size: 15px;
      transition: border-color 0.2s;
      
      &:focus { border-color: #4CAF50; outline: none; }
    }
    
    textarea { padding-left: 15px; min-height: 80px; resize: vertical; }
  }
`;

const CheckboxGroup = styled.label`
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; margin-bottom: 20px; font-weight: 500; color: #333;
  
  input { width: 18px; height: 18px; accent-color: #4CAF50; }
`;

const ButtonGroup = styled.div`
  display: flex; gap: 15px; margin-top: 30px;
  
  button {
    flex: 1; padding: 14px; border-radius: 12px; font-weight: bold; font-size: 16px;
    cursor: pointer; border: none; transition: transform 0.1s, box-shadow 0.2s;
    
    &:active { transform: scale(0.98); }
  }
  
  .cancel { background: #f0f2f5; color: #7f8c8d; &:hover { background: #e0e6ed; } }
  .confirm { 
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
    color: white; 
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
    &:hover { box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4); }
    &:disabled { opacity: 0.7; cursor: not-allowed; }
  }
`;

const SatisModal = ({ isOpen, onClose, hayvan, onSuccess }) => {
    const [formData, setFormData] = useState({
        fiyat: '',
        aliciSatici: '',
        telefon: '', // Opsiyonel
        tarih: new Date().toISOString().split('T')[0],
        notlar: '',
        tamOdeme: true,
        odenenMiktar: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen || !hayvan) return null;

    const handleSubmit = async () => {
        if (!formData.fiyat || !formData.aliciSatici) {
            alert('Lütfen fiyat ve alıcı adını giriniz.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                hayvanId: hayvan._id,
                hayvanTipi: hayvan.type, // Parent component must pass 'type' prop (inek, duve, etc.) or add logic here
                kupeNo: hayvan.kupeNo,
                fiyat: Number(formData.fiyat),
                aliciSatici: formData.aliciSatici,
                telefon: formData.telefon,
                tarih: formData.tarih,
                notlar: formData.notlar,
                odenenMiktar: formData.tamOdeme ? Number(formData.fiyat) : Number(formData.odenenMiktar)
            };

            await api.createSatisIslemi(payload);
            alert('✅ Satış işlemi başarıyla kaydedildi!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('❌ Satış kaydedilemedi: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Overlay onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <ModalContainer>
                <CloseButton onClick={onClose}><FaTimes /></CloseButton>
                <Title><FaMoneyBillWave /> Satış Yap: {hayvan.isim}</Title>

                <FormGroup>
                    <label>Satış Fiyatı (TL)</label>
                    <div className="input-wrapper">
                        <FaMoneyBillWave />
                        <input
                            type="number"
                            placeholder="0.00"
                            value={formData.fiyat}
                            onChange={e => setFormData({ ...formData, fiyat: e.target.value })}
                        />
                    </div>
                </FormGroup>

                <FormGroup>
                    <label>Alıcı Adı</label>
                    <div className="input-wrapper">
                        <FaUser />
                        <input
                            type="text"
                            placeholder="Ad Soyad"
                            value={formData.aliciSatici}
                            onChange={e => setFormData({ ...formData, aliciSatici: e.target.value })}
                        />
                    </div>
                </FormGroup>

                <FormGroup>
                    <label>İşlem Tarihi</label>
                    <div className="input-wrapper">
                        <FaCalendarAlt />
                        <input
                            type="date"
                            value={formData.tarih}
                            onChange={e => setFormData({ ...formData, tarih: e.target.value })}
                        />
                    </div>
                </FormGroup>

                <CheckboxGroup>
                    <input
                        type="checkbox"
                        checked={formData.tamOdeme}
                        onChange={e => setFormData({ ...formData, tamOdeme: e.target.checked })}
                    />
                    Tamamı Nakit/Peşin Tahsil Edildi
                </CheckboxGroup>

                {!formData.tamOdeme && (
                    <FormGroup>
                        <label>Şu An Tahsil Edilen Miktar (TL)</label>
                        <div className="input-wrapper">
                            <FaMoneyBillWave />
                            <input
                                type="number"
                                placeholder="Örn: 5000"
                                value={formData.odenenMiktar}
                                onChange={e => setFormData({ ...formData, odenenMiktar: e.target.value })}
                            />
                        </div>
                        <small style={{ color: '#e67e22', fontWeight: 'bold' }}>Kalan: {Number(formData.fiyat) - Number(formData.odenenMiktar)} TL (Veresiye olarak kaydedilecek)</small>
                    </FormGroup>
                )}

                <FormGroup>
                    <label>Notlar</label>
                    <div className="input-wrapper">
                        <textarea
                            rows="2"
                            placeholder="Opsiyonel not..."
                            value={formData.notlar}
                            onChange={e => setFormData({ ...formData, notlar: e.target.value })}
                        />
                    </div>
                </FormGroup>

                <ButtonGroup>
                    <button className="cancel" onClick={onClose}>İptal</button>
                    <button className="confirm" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Kaydediliyor...' : 'Satışı Onayla'}
                    </button>
                </ButtonGroup>
            </ModalContainer>
        </Overlay>
    );
};

export default SatisModal;
