import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaSave } from 'react-icons/fa';
import * as api from '../../services/api';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  padding: 20px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
`;

const Title = styled.h2`
  color: #2c3e50;
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  font-size: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  
  label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #444;
  }

  input, select {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    &:focus { border-color: #2e7d32; outline: none; }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  
  &.cancel { background: #f5f5f5; color: #333; }
  &.save { background: #2e7d32; color: white; display: flex; align-items: center; gap: 5px; }
`;

const YemEkleModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        ad: '',
        birimFiyat: '',
        kuruMadde: '',
        protein: '',
        enerji: '',
        nisasta: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.createYemItem({
                ...formData,
                birimFiyat: parseFloat(formData.birimFiyat),
                kuruMadde: parseFloat(formData.kuruMadde),
                protein: parseFloat(formData.protein),
                enerji: parseFloat(formData.enerji),
                nisasta: parseFloat(formData.nisasta)
            });
            onSave();
            onClose();
            alert('Yem başarıyla eklendi! (Depo kaydı da oluşturuldu)');
        } catch (error) {
            console.error(error);
            alert('Hata oluştu');
        }
    };

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={e => e.stopPropagation()}>
                <CloseButton onClick={onClose}><FaTimes /></CloseButton>
                <Title>Yeni Yem Ekle</Title>

                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <label>Yem Adı (Örn: Mısır Silajı)</label>
                        <input name="ad" required value={formData.ad} onChange={handleChange} placeholder="Yem ismini giriniz" />
                    </InputGroup>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                        <InputGroup>
                            <label>Birim Fiyat (TL/kg)</label>
                            <input name="birimFiyat" type="number" step="0.01" required value={formData.birimFiyat} onChange={handleChange} placeholder="0.00" />
                        </InputGroup>
                        <InputGroup>
                            <label>Kuru Madde (%)</label>
                            <input name="kuruMadde" type="number" step="0.1" value={formData.kuruMadde} onChange={handleChange} placeholder="Örn: 35" />
                        </InputGroup>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 }}>
                        <InputGroup>
                            <label>Ham Protein (HP)</label>
                            <input name="protein" type="number" step="0.1" value={formData.protein} onChange={handleChange} placeholder="%" />
                        </InputGroup>
                        <InputGroup>
                            <label>Enerji (ME)</label>
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
