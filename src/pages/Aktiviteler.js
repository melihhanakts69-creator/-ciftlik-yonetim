import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import AktivitelerCard from '../components/Dashboard/AktivitelerCard';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
`;

const Aktiviteler = () => {
    const navigate = useNavigate();
    const [aktiviteler, setAktiviteler] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAktiviteler();
    }, []);

    const fetchAktiviteler = async () => {
        try {
            // Limit vermeden çekiyoruz (veya yüksek limit)
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/dashboard/aktiviteler?limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setAktiviteler(data);
        } catch (error) {
            console.error('Aktiviteler yüklenemedi', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <Header>
                <BackButton onClick={() => navigate(-1)}>←</BackButton>
                <Title>Tüm Aktiviteler</Title>
            </Header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Yükleniyor...</div>
            ) : (
                <AktivitelerCard aktiviteler={aktiviteler} />
            )}
        </PageContainer>
    );
};

export default Aktiviteler;
