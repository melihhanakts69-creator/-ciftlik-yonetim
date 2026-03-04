import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaPaperPlane, FaPlus, FaRobot, FaUserAlt, FaHistory, FaTrash } from 'react-icons/fa';
import * as api from '../../services/api';

const fadeIn = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%{transform:scale(0.8);opacity:0.5}50%{transform:scale(1.2);opacity:1}100%{transform:scale(0.8);opacity:0.5}`;

const ChatContainer = styled.div`
  display: flex;
  height: 650px;
  max-height: 75vh;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  font-family: 'Inter', sans-serif;
  @media(max-width: 768px) {
    flex-direction: column;
    height: 80vh;
  }
`;

const Sidebar = styled.div`
  width: 280px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  @media(max-width: 768px) {
    width: 100%;
    height: 160px;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
`;

const NewChatBtn = styled.button`
  width: 100%;
  padding: 12px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  &:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
  }
`;

const HistoryList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

const HistoryItem = styled.div`
  padding: 12px 14px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${p => p.$active ? '#e2e8f0' : 'transparent'};
  color: ${p => p.$active ? '#0f172a' : '#475569'};
  font-weight: ${p => p.$active ? '600' : '500'};
  font-size: 13px;
  transition: background 0.2s;
  &:hover { background: ${p => p.$active ? '#e2e8f0' : '#f1f5f9'}; }
  
  .title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
`;

const ChatHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  color: #1e293b;
  font-size: 16px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(10px);
  z-index: 10;
`;

const MessagesBox = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  scroll-behavior: smooth;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

const WelcomeScreen = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  text-align: center;
  padding: 40px;
  .icon {
    font-size: 64px;
    color: #e2e8f0;
    margin-bottom: 20px;
  }
  h2 { color: #334155; margin-bottom: 10px; font-weight: 800; }
  p { line-height: 1.6; max-width: 400px; font-size: 14px; }
`;

const MsgRow = styled.div`
  display: flex;
  gap: 16px;
  animation: ${fadeIn} 0.3s ease forwards;
  flex-direction: ${p => p.$isUser ? 'row-reverse' : 'row'};
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: ${p => p.$isUser ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, #10b981, #059669)'};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  box-shadow: 0 4px 10px ${p => p.$isUser ? 'rgba(59,130,246,0.3)' : 'rgba(16,185,129,0.3)'};
`;

const Bubble = styled.div`
  max-width: 75%;
  padding: 16px 20px;
  border-radius: 16px;
  font-size: 14.5px;
  line-height: 1.6;
  background: ${p => p.$isUser ? '#f8fafc' : '#fff'};
  border: 1px solid ${p => p.$isUser ? '#e2e8f0' : '#10b981'};
  color: ${p => p.$isUser ? '#334155' : '#0f172a'};
  box-shadow: ${p => p.$isUser ? 'none' : '0 4px 14px rgba(16,185,129,0.08)'};
  border-top-right-radius: ${p => p.$isUser ? '4px' : '16px'};
  border-top-left-radius: ${p => p.$isUser ? '16px' : '4px'};
  
  p { margin: 0 0 10px; &:last-child { margin: 0; } }
  strong { font-weight: 700; color: ${p => p.$isUser ? '#0f172a' : '#065f46'}; }
  ul { padding-left: 20px; margin: 10px 0; }
  li { margin-bottom: 4px; }
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 8px 0;
  .dot {
    width: 6px; height: 6px; border-radius: 50%; background: #94a3b8;
    animation: ${pulse} 1.4s infinite ease-in-out;
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
`;

const InputContainer = styled.div`
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const InputBox = styled.div`
  display: flex;
  align-items: flex-end;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 8px 12px;
  transition: all 0.2s;
  &:focus-within {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px;
  font-size: 15px;
  font-family: inherit;
  color: #1e293b;
  resize: none;
  max-height: 120px;
  min-height: 24px;
  line-height: 1.5;
  outline: none;
  &::placeholder { color: #94a3b8; }
`;

const SendBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${p => p.disabled ? '#e2e8f0' : 'linear-gradient(135deg, #10b981, #059669)'};
  color: ${p => p.disabled ? '#94a3b8' : '#fff'};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 8px;
  margin-bottom: 2px;
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16,185,129,0.3);
  }
`;


// TEXT FORMATTER HELPER
const formatText = (text) => {
    return text.split('\n').map((line, i) => {
        // Simple bolding: **text**
        let formattedLine = line;
        if (formattedLine.includes('**')) {
            const parts = formattedLine.split('**');
            formattedLine = parts.map((part, index) => index % 2 === 1 ? <strong key={index}>{part}</strong> : part);
        }

        if (line.startsWith('* ') || line.startsWith('- ')) {
            return <li key={i}>{formattedLine.slice(2)}</li>;
        }
        if (line.trim() === '') return <br key={i} />;
        return <p key={i}>{formattedLine}</p>;
    });
};


export default function ChatSistemi({ type = 'genel', title = 'AI Danışman', icon = <FaRobot /> }) {
    const [history, setHistory] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // İlk yüklemede geçmiş sohbetleri getir
    useEffect(() => {
        loadHistory();
    }, [type]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadHistory = async () => {
        try {
            const res = await api.getAiHistory();
            // Sadece bu tipe ait olanları veya hepsini filtrele
            const filtered = res.data.filter(c => c.type === type);
            setHistory(filtered);
        } catch (error) {
            console.error('Geçmiş yüklenemedi:', error);
        }
    };

    const loadChat = async (id) => {
        try {
            setLoading(true);
            const res = await api.getAiChat(id);
            if (res.data) {
                setMessages(res.data.messages);
                setActiveChatId(id);
            }
        } catch (error) {
            console.error('Sohbet yüklenemedi', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = () => {
        setActiveChatId(null);
        setMessages([]);
        setInput('');
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            const res = await api.askAi(type, { soru: userMsg, chatId: activeChatId });

            // Eğer yeni sohbetse, chatId döndü, onu set et ve geçmişi güncelle
            if (res.data.chatId && res.data.chatId !== activeChatId) {
                setActiveChatId(res.data.chatId);
                loadHistory();
            }

            setMessages(prev => [...prev, { role: 'model', text: res.data.yanit }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'model',
                text: error.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    };

    return (
        <ChatContainer>
            {/* SOL SİDEBAR - GEÇMİŞ */}
            <Sidebar>
                <SidebarHeader>
                    <NewChatBtn onClick={handleNewChat}>
                        <FaPlus /> Yeni Sohbet
                    </NewChatBtn>
                </SidebarHeader>
                <HistoryList>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', padding: '0 4px' }}>
                        Geçmiş Sohbetler
                    </div>
                    {history.length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                            Henüz geçmiş yok.
                        </div>
                    )}
                    {history.map(chat => (
                        <HistoryItem
                            key={chat._id}
                            $active={activeChatId === chat._id}
                            onClick={() => loadChat(chat._id)}
                        >
                            <FaHistory style={{ color: activeChatId === chat._id ? '#10b981' : '#94a3b8' }} />
                            <div className="title">{chat.title || 'İsimsiz Sohbet'}</div>
                        </HistoryItem>
                    ))}
                </HistoryList>
            </Sidebar>

            {/* SAĞ ANA ALAN */}
            <MainArea>
                <ChatHeader>
                    {icon} {title}
                </ChatHeader>

                {messages.length === 0 ? (
                    <WelcomeScreen>
                        <div className="icon">{icon}</div>
                        <h2>Nasıl Yardımcı Olabilirim?</h2>
                        <p>Aklınızdaki soruları hemen sorabilirsiniz. Tüm konuşmalarımız kayıt altında tutulacak ve geçmişten devam edebileceksiniz.</p>
                    </WelcomeScreen>
                ) : (
                    <MessagesBox>
                        {messages.map((msg, idx) => (
                            <MsgRow key={idx} $isUser={msg.role === 'user'}>
                                <Avatar $isUser={msg.role === 'user'}>
                                    {msg.role === 'user' ? <FaUserAlt size={14} /> : icon}
                                </Avatar>
                                <Bubble $isUser={msg.role === 'user'}>
                                    {formatText(msg.text)}
                                </Bubble>
                            </MsgRow>
                        ))}

                        {loading && (
                            <MsgRow $isUser={false}>
                                <Avatar $isUser={false}>{icon}</Avatar>
                                <Bubble $isUser={false}>
                                    <TypingIndicator>
                                        <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                                    </TypingIndicator>
                                </Bubble>
                            </MsgRow>
                        )}
                        <div ref={messagesEndRef} />
                    </MessagesBox>
                )}

                <InputContainer>
                    <InputBox>
                        <TextArea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            placeholder="Sizi dinliyorum, mesajınızı yazın..."
                            rows={1}
                        />
                        <SendBtn
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            title="Gönder (Enter)"
                        >
                            <FaPaperPlane />
                        </SendBtn>
                    </InputBox>
                </InputContainer>
            </MainArea>
        </ChatContainer>
    );
}
