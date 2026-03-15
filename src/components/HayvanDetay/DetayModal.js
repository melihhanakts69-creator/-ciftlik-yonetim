import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1100;
  padding: 20px; overflow-y: auto;
`;
const ModalBox = styled.div`
  background: #fff; border-radius: 16px; width: 100%; max-width: 440px;
  box-shadow: 0 24px 48px rgba(0,0,0,0.15); max-height: 90vh; overflow-y: auto;
`;
const ModalHeader = styled.div`
  padding: 20px 24px; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
  h2 { margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; }
  button { background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px; }
`;
const ModalBody = styled.div`padding: 24px;`;
const FormGroup = styled.div`margin-bottom: 16px;`;
const FormLabel = styled.label`display: block; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em;`;
const FormInput = styled.input`
  width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 14px; color: #0f172a; outline: none; box-sizing: border-box;
  &:focus { border-color: #4CAF50; box-shadow: 0 0 0 3px rgba(76,175,80,0.12); }
`;
const FormTextarea = styled.textarea`
  width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 14px; color: #0f172a; outline: none; box-sizing: border-box; min-height: 80px; resize: vertical;
  &:focus { border-color: #4CAF50; box-shadow: 0 0 0 3px rgba(76,175,80,0.12); }
`;
const BtnRow = styled.div`display: flex; gap: 12px; margin-top: 24px;`;
const Btn = styled.button`
  flex: 1; padding: 12px 20px; border: none; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer;
  transition: all 0.2s;
`;
const BtnSecondary = styled(Btn)`background: #f1f5f9; color: #64748b;`;
const BtnPrimary = styled(Btn)`background: linear-gradient(135deg, #4CAF50, #45a049); color: #fff;`;

export function EditModal({ title, onClose, onSubmit, loading, children }) {
  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Kapat">×</button>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={onSubmit}>
            {children}
            <BtnRow>
              <BtnSecondary type="button" onClick={onClose}>İptal</BtnSecondary>
              <BtnPrimary type="submit" disabled={loading}>{loading ? 'Kaydediliyor…' : 'Kaydet'}</BtnPrimary>
            </BtnRow>
          </form>
        </ModalBody>
      </ModalBox>
    </Overlay>
  );
}

export { FormGroup, FormLabel, FormInput, FormTextarea };
