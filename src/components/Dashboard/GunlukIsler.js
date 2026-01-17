import React, { useState } from 'react';
import styled from 'styled-components';
import { bildirimTamamlandiIsaretle } from '../../services/api';

const WidgetContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 25px;
  border: 1px solid rgba(0,0,0,0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  color: #2e7d32;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatusBadge = styled.span`
  background: ${props => props.count > 0 ? '#ff5252' : '#4caf50'};
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 15px;
  border-radius: 8px;
  background: ${props => props.isOverdue ? '#fff8f8' : '#f8f9fa'};
  border-left: 4px solid ${props => props.color};
  transition: all 0.2s;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
`;

const TaskContent = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const TaskTitle = styled.h4`
  margin: 0 0 5px 0;
  font-size: 1rem;
  color: #333;
`;

const TaskDesc = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
`;

const ActionButton = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 6px;
  color: #555;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  align-self: center;
  white-space: nowrap;

  &:hover {
    border-color: #2e7d32;
    color: #2e7d32;
    background: #e8f5e9;
  }
`;

const DateBadge = styled.span`
  font-size: 0.75rem;
  color: ${props => props.isOverdue ? '#d32f2f' : '#1976d2'};
  font-weight: 600;
  display: block;
  margin-top: 5px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px;
  color: #888;
  font-style: italic;
  background: #fafafa;
  border-radius: 8px;
`;

const GunlukIsler = ({ data, onRefresh }) => {
    const [loadingMap, setLoadingMap] = useState({});

    // Verileri grupla: Gecikenler + Bugün + Yaklaşanlar
    const allTasks = [
        ...(data?.geciken || []).map(t => ({ ...t, isOverdue: true })),
        ...(data?.bugun || []),
        ...(data?.yaklaşan || [])
    ];

    const handleComplete = async (id) => {
        try {
            setLoadingMap(prev => ({ ...prev, [id]: true }));
            await bildirimTamamlandiIsaretle(id);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Görev tamamlanamadı:', error);
            alert('İşlem başarısız oldu.');
        } finally {
            setLoadingMap(prev => ({ ...prev, [id]: false }));
        }
    };

    const getIconAndColor = (tip) => {
        switch (tip) {
            case 'dogum': return { icon: '🤰', color: '#9c27b0' };
            case 'asi': return { icon: '💉', color: '#f44336' };
            case 'muayene': return { icon: '🩺', color: '#2196f3' };
            case 'kuru_donem': return { icon: '🩸', color: '#ff9800' };
            case 'sutten_kesme': return { icon: '🍼', color: '#795548' };
            default: return { icon: '📝', color: '#607d8b' };
        }
    };

    return (
        <WidgetContainer>
            <Header>
                <Title>
                    <span>✅</span> Bugünün İşleri
                </Title>
                <StatusBadge count={data?.geciken?.length || 0}>
                    {data?.geciken?.length > 0 ? `${data.geciken.length} Geciken İş` : 'Her Şey Yolunda'}
                </StatusBadge>
            </Header>

            <TaskList>
                {allTasks.length === 0 ? (
                    <EmptyState>
                        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>🎉</span>
                        Bugün için yapılacak bir iş yok. Keyfine bak!
                    </EmptyState>
                ) : (
                    allTasks.map(task => {
                        const style = getIconAndColor(task.tip);
                        const isLoading = loadingMap[task._id];
                        const date = new Date(task.hatirlatmaTarihi).toLocaleDateString('tr-TR');

                        return (
                            <TaskItem key={task._id} color={style.color} isOverdue={task.isOverdue}>
                                <div style={{ fontSize: '1.5rem', background: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                    {style.icon}
                                </div>
                                <TaskContent>
                                    <TaskTitle>{task.baslik}</TaskTitle>
                                    <TaskDesc>{task.mesaj}</TaskDesc>
                                    <DateBadge isOverdue={task.isOverdue}>
                                        {task.isOverdue ? `⚠️ Gecikmiş (${date})` : `📅 ${date}`}
                                    </DateBadge>
                                </TaskContent>
                                <ActionButton onClick={() => handleComplete(task._id)} disabled={isLoading}>
                                    {isLoading ? '...' : (task.isOverdue ? 'Şimdi Yapıldı' : 'Tamamla')}
                                </ActionButton>
                            </TaskItem>
                        );
                    })
                )}
            </TaskList>
        </WidgetContainer>
    );
};

export default GunlukIsler;
