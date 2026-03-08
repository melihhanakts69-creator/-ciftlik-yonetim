import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  color: #0f172a;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px);
  position: relative;
  
  &::before {
    content: '';
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: 
      radial-gradient(circle at 15% 30%, rgba(56, 189, 248, 0.04), transparent 25%),
      radial-gradient(circle at 85% 70%, rgba(99, 102, 241, 0.05), transparent 25%);
    background-color: #f8fafc;
    z-index: -1;
  }
`;

const Header = styled.header`
  margin-bottom: 40px;
  padding: 40px;
  background: #ffffff;
  border-radius: 28px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 15px 50px -15px rgba(0,0,0,0.06);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 8px; height: 100%;
    background: linear-gradient(180deg, #0ea5e9, #2563eb);
    border-radius: 12px 0 0 12px;
  }

  .title { font-size: 14px; font-weight: 900; color: #0ea5e9; letter-spacing: 0.1em; margin: 0 0 12px; text-transform: uppercase; }
  .name { font-size: 36px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.02em; line-height: 1.1;}
  .desc { font-size: 16px; color: #64748b; margin-top: 12px; line-height: 1.5; font-weight: 500;}
`;

const Layout = styled.div`
  display: flex;
  gap: 32px;
  flex: 1;
  height: 650px;
  max-height: 80vh;
  @media (max-width: 1024px) { flex-direction: column; height: auto; max-height: none; }
`;

const ThreadList = styled.div`
  width: 380px;
  flex-shrink: 0;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 28px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 50px -15px rgba(0,0,0,0.06);
  @media (max-width: 1024px) { width: 100%; max-height: 320px; }
`;

const ThreadListHeader = styled.div`
  padding: 28px 32px;
  background: #ffffff;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.01em;
  display: flex; align-items: center; justify-content: space-between;
`;

const ThreadListScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  &::-webkit-scrollbar-track { background: transparent; }
`;

const ThreadItem = styled.div`
  padding: 24px 32px;
  cursor: pointer;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  background: ${p => p.$active ? 'linear-gradient(90deg, rgba(14,165,233,0.06) 0%, rgba(255,255,255,0) 100%)' : 'transparent'};
  
  &:hover { 
    background: ${p => p.$active ? 'linear-gradient(90deg, rgba(14,165,233,0.06) 0%, rgba(255,255,255,0) 100%)' : '#f8fafc'}; 
    padding-left: ${p => p.$active ? '32px' : '36px'};
  }
  
  ${p => p.$active && `
    &::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 6px;
      background: linear-gradient(180deg, #0ea5e9, #2563eb);
      border-radius: 0 6px 6px 0;
    }
  `}

  .header-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
  .name { font-size: 16px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em;}
  .time { font-size: 13px; color: #94a3b8; font-weight: 600; }
  .preview-row { display: flex; justify-content: space-between; align-items: center; gap: 12px;}
  .preview { font-size: 14px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.5; font-weight: ${p => p.$hasUnread ? '700' : '500'};}
  .unread { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 24px; padding: 0 8px; background: #ef4444; color: #fff; font-size: 12px; font-weight: 800; border-radius: 12px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3); }
`;

const ChatPanel = styled.div`
  flex: 1;
  background: #ffffff;
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  box-shadow: 0 15px 50px -15px rgba(0,0,0,0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
`;

const ChatHeader = styled.div`
  padding: 32px;
  background: #ffffff;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 10;
  
  .avatar {
    width: 56px; height: 56px; border-radius: 16px;
    background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
    color: #0284c7;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; font-weight: 900; text-transform: uppercase;
  }
  .info { flex: 1; }
  .name { font-size: 22px; font-weight: 900; color: #0f172a; margin-bottom: 4px; letter-spacing: -0.01em;}
  .sub { font-size: 14px; color: #64748b; font-weight: 600;}
`;

const MsgList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #f8fafc;
  scroll-behavior: smooth;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  &::-webkit-scrollbar-track { background: transparent; }
`;

const BubbleWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${p => p.$ben ? 'flex-end' : 'flex-start'};
  max-width: 100%;
  animation: fadeIn 0.3s ease;
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;

const MsgBubble = styled.div`
  max-width: 70%;
  padding: 14px 18px;
  font-size: 14.5px;
  line-height: 1.5;
  word-break: break-word;
  border: ${p => p.$ben ? 'none' : '1px solid rgba(226, 232, 240, 0.8)'};
  box-shadow: ${p => p.$ben ? '0 4px 14px rgba(14,165,233,0.2)' : '0 4px 14px rgba(0,0,0,0.03)'};
  ${p => p.$ben
    ? 'background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #fff; border-radius: 20px 20px 4px 20px;'
    : 'background: #fff; color: #1e293b; border-radius: 20px 20px 20px 4px;'}
  
  .time { font-size: 11px; margin-top: 8px; text-align: right; font-weight: 500;}
  ${p => p.$ben && '.time { color: rgba(255,255,255,0.7); }'}
  ${p => !p.$ben && '.time { color: #94a3b8; }'}
`;

const ChatInput = styled.div`
  padding: 24px 32px;
  background: #ffffff;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  gap: 20px;
  align-items: flex-end;
  
  .input-wrapper {
    flex: 1;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 20px;
    padding: 14px 20px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    &:focus-within {
      border-color: #0ea5e9;
      background: #fff;
      box-shadow: 0 0 0 4px rgba(14,165,233,0.15);
    }
  }

  textarea {
    width: 100%;
    min-height: 24px;
    max-height: 120px;
    font-size: 16px;
    font-weight: 500;
    resize: none;
    font-family: inherit;
    background: transparent;
    border: none;
    color: #0f172a;
    line-height: 1.5;
    outline: none;
    &::placeholder { color: #94a3b8; }
  }
  
  button {
    width: 56px; height: 56px;
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    border: none; cursor: pointer;
    background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: #fff;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 10px 20px -5px rgba(14,165,233,0.3);
    flex-shrink: 0;
    margin-bottom: 2px;
  }
  button:hover:not(:disabled) { transform: translateY(-4px) scale(1.05); box-shadow: 0 15px 25px -5px rgba(14,165,233,0.4); }
  button:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; color: #f1f5f9;}
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  color: #64748b;
  background: #f8fafc;
  
  .icon-wrap {
    width: 80px; height: 80px;
    border-radius: 50%;
    background: #e2e8f0;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    font-size: 32px;
  }
  
  h3 { font-size: 20px; font-weight: 800; color: #1e293b; margin: 0 0 10px; }
  p { font-size: 15px; line-height: 1.6; max-width: 320px; }
`;

export default function Danismalar() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [mesajlar, setMesajlar] = useState([]);
  const [mesajYukleniyor, setMesajYukleniyor] = useState(false);
  const [mesajMetin, setMesajMetin] = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);
  const [benimId, setBenimId] = useState(null);

  const selectedThread = threads.find(t => (t.otherUser?._id || t.otherUser) === selectedId);
  const selectedUser = selectedThread?.otherUser;

  useEffect(() => {
    let cancelled = false;
    api.getProfile().then(res => {
      if (!cancelled && res?.data) {
        setBenimId(res.data.user?.parentUserId || res.data.user?._id || res.data.parentUserId || res.data._id);
      }
    }).catch(() => { });
    api.getDanismaThreads()
      .then(res => { if (!cancelled) setThreads(Array.isArray(res.data) ? res.data : []); })
      .catch(() => { if (!cancelled) setThreads([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedId) { setMesajlar([]); return; }
    setMesajYukleniyor(true);
    api.getDanismaMesajlar(selectedId)
      .then(res => setMesajlar(Array.isArray(res.data) ? res.data : []))
      .catch(() => setMesajlar([]))
      .finally(() => setMesajYukleniyor(false));
  }, [selectedId]);

  const handleGonder = async (e) => {
    e.preventDefault();
    const metin = (mesajMetin || '').trim();
    if (!metin || !selectedId || gonderiyor) return;
    setGonderiyor(true);
    try {
      await api.postDanismaMesaj(selectedId, metin);
      setMesajMetin('');
      const res = await api.getDanismaMesajlar(selectedId);
      setMesajlar(Array.isArray(res.data) ? res.data : []);
      const listRes = await api.getDanismaThreads();
      setThreads(Array.isArray(listRes.data) ? listRes.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mesaj gönderilemedi.');
    } finally {
      setGonderiyor(false);
    }
  };

  return (
    <Page>
      <Header>
        <p className="title">Danışmalar</p>
        <h1 className="name">Danışma talepleri</h1>
        <p className="desc">Kayıtlı çiftliklerden gelen mesajlar burada listelenir. Yanıtlayabilirsiniz.</p>
      </Header>

      <Layout>
        <ThreadList>
          <ThreadListHeader>Konuşmalar</ThreadListHeader>
          <ThreadListScroll>
            {loading ? (
              <div style={{ padding: 24, fontSize: 14, color: '#64748b', textAlign: 'center' }}>Yükleniyor…</div>
            ) : threads.length === 0 ? (
              <div style={{ padding: 24, fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>Henüz konuşma yok.</div>
            ) : (
              threads.map(t => {
                const ou = t.otherUser || {};
                const oid = ou._id || ou;
                const name = ou.isletmeAdi || ou.isim || 'Çiftlik';
                return (
                  <ThreadItem
                    key={oid}
                    $active={selectedId === oid}
                    $hasUnread={t.unreadCount > 0}
                    onClick={() => setSelectedId(oid)}
                  >
                    <div className="header-row">
                      <div className="name">{name}</div>
                      <div className="time">{t.lastAt ? new Date(t.lastAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                    </div>
                    <div className="preview-row">
                      {t.lastMessage && <div className="preview">{t.lastMessage}</div>}
                      {t.unreadCount > 0 && <span className="unread">{t.unreadCount}</span>}
                    </div>
                  </ThreadItem>
                );
              })
            )}
          </ThreadListScroll>
        </ThreadList>

        <ChatPanel>
          {!selectedId ? (
            <EmptyState>Sol listeden bir konuşma seçin veya çiftlikler size mesaj gönderdiğinde burada görünecek.</EmptyState>
          ) : (
            <>
              <ChatHeader>
                <div className="avatar">
                  {(selectedUser?.isletmeAdi || selectedUser?.isim || 'Ç').charAt(0)}
                </div>
                <div className="info">
                  <div className="name">{selectedUser?.isletmeAdi || selectedUser?.isim || 'Çiftlik Profil'}</div>
                  <div className="sub">{selectedUser?.isim}{selectedUser?.isletmeAdi ? ` · ${selectedUser.isletmeAdi}` : ''}</div>
                </div>
              </ChatHeader>
              <MsgList>
                {mesajYukleniyor ? (
                  <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 13 }}>Yükleniyor…</div>
                ) : mesajlar.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Henüz mesaj yok.</div>
                ) : (
                  mesajlar.map(m => {
                    const gonderenId = (m.gonderenId && (m.gonderenId._id || m.gonderenId)) || '';
                    const benim = String(gonderenId) === String(benimId);
                    return (
                      <BubbleWrap key={m._id} $ben={benim}>
                        <MsgBubble $ben={benim}>
                          <div>{m.mesaj}</div>
                          <div className="time">{m.createdAt ? new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                        </MsgBubble>
                      </BubbleWrap>
                    );
                  })
                )}
              </MsgList>
              <ChatInput>
                <div className="input-wrapper">
                  <textarea
                    value={mesajMetin}
                    onChange={e => {
                      setMesajMetin(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    placeholder="Yanıtınızı yazın..."
                    rows={1}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGonder(e); e.target.style.height = 'auto'; } }}
                  />
                </div>
                <button type="button" onClick={handleGonder} disabled={!mesajMetin.trim() || gonderiyor}>
                  {gonderiyor ? '…' : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>}
                </button>
              </ChatInput>
            </>
          )}
        </ChatPanel>
      </Layout>
    </Page>
  );
}
