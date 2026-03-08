import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  color: #1a1a1a;
  max-width: 1000px;
  margin: 0 auto;
  padding: 28px 24px 56px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 100px);
  background: #f8fafc;
`;

const Header = styled.header`
  margin-bottom: 24px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  .title { font-size: 11px; font-weight: 700; color: #0ea5e9; letter-spacing: 0.08em; margin: 0 0 6px; text-transform: uppercase; }
  .name { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
  .desc { font-size: 13px; color: #64748b; margin-top: 8px; line-height: 1.5; }
`;

const Layout = styled.div`
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 480px;
  @media (max-width: 768px) { flex-direction: column; }
`;

const ThreadList = styled.div`
  width: 300px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  @media (max-width: 768px) { width: 100%; max-height: 240px; }
`;

const ThreadListHeader = styled.div`
  padding: 16px 18px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  font-size: 12px; font-weight: 700; color: #475569; letter-spacing: 0.03em; text-transform: uppercase;
`;

const ThreadItem = styled.div`
  padding: 16px 18px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s, border-color 0.15s;
  &:hover { background: #f8fafc; }
  ${p => p.$active && 'background: #eff6ff !important; border-left: 4px solid #0ea5e9;'}
  .name { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .preview { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.4; }
  .meta { font-size: 11px; color: #94a3b8; margin-top: 6px; display: flex; align-items: center; gap: 6px; }
  .unread { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; padding: 0 6px; background: #0ea5e9; color: #fff; font-size: 11px; font-weight: 600; border-radius: 9px; }
`;

const ChatPanel = styled.div`
  flex: 1;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
`;

const ChatHeader = styled.div`
  padding: 18px 22px;
  background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
  border-bottom: 1px solid #e2e8f0;
  .name { font-size: 17px; font-weight: 700; color: #0f172a; }
  .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
`;

const MsgList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 280px;
  max-height: 440px;
  background: #f1f5f9;
`;

const BubbleWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${p => p.$ben ? 'flex-end' : 'flex-start'};
  max-width: 100%;
`;

const SenderLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${p => p.$ben ? '#0284c7' : '#64748b'};
  margin-bottom: 4px;
  padding: 0 4px;
`;

const MsgBubble = styled.div`
  max-width: 75%;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  ${p => p.$ben
    ? 'background: #0ea5e9; color: #fff; border-radius: 16px 16px 4px 16px;'
    : 'background: #fff; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px 16px 16px 4px;'}
  .time { font-size: 10px; margin-top: 6px; }
  ${p => p.$ben && '.time { opacity: 0.9; }'}
  ${p => !p.$ben && '.time { color: #64748b; }'}
`;

const ChatInput = styled.div`
  padding: 16px 22px;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  align-items: flex-end;
  textarea {
    flex: 1;
    min-height: 48px;
    max-height: 120px;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    font-size: 14px;
    resize: none;
    font-family: inherit;
    background: #f8fafc;
  }
  textarea:focus { outline: none; border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.15); background: #fff; }
  button {
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 14px; font-weight: 600;
    border: none; cursor: pointer;
    background: #0ea5e9; color: #fff;
  }
  button:hover { background: #0284c7; }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 28px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  margin: 20px 24px;
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
    api.getProfile().then(res => { if (!cancelled && res?.data) setBenimId(res.data.parentUserId || res.data._id); }).catch(() => {});
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
          {loading ? (
            <div style={{ padding: 20, fontSize: 13, color: '#6b7280' }}>Yükleniyor…</div>
          ) : threads.length === 0 ? (
            <div style={{ padding: 20, fontSize: 13, color: '#9ca3af' }}>Henüz konuşma yok.</div>
          ) : (
            threads.map(t => {
              const ou = t.otherUser || {};
              const oid = ou._id || ou;
              const name = ou.isletmeAdi || ou.isim || 'Çiftlik';
              return (
                <ThreadItem
                  key={oid}
                  $active={selectedId === oid}
                  onClick={() => setSelectedId(oid)}
                >
                  <div className="name">{name}</div>
                  {t.lastMessage && <div className="preview">{t.lastMessage}</div>}
                  <div className="meta">
                    {t.lastAt ? new Date(t.lastAt).toLocaleDateString('tr-TR') : ''}
                    {t.unreadCount > 0 && <span className="unread">{t.unreadCount}</span>}
                  </div>
                </ThreadItem>
              );
            })
          )}
        </ThreadList>

        <ChatPanel>
          {!selectedId ? (
            <EmptyState>Sol listeden bir konuşma seçin veya çiftlikler size mesaj gönderdiğinde burada görünecek.</EmptyState>
          ) : (
            <>
              <ChatHeader>
                <div className="name">{selectedUser?.isletmeAdi || selectedUser?.isim || 'Çiftlik'}</div>
                <div className="sub">{selectedUser?.isim}{selectedUser?.isletmeAdi ? ` · ${selectedUser.isletmeAdi}` : ''}</div>
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
                        <SenderLabel $ben={benim}>{benim ? 'Siz' : 'Çiftlik'}</SenderLabel>
                        <MsgBubble $ben={benim}>
                          <div>{m.mesaj}</div>
                          <div className="time">{m.createdAt ? new Date(m.createdAt).toLocaleString('tr-TR') : ''}</div>
                        </MsgBubble>
                      </BubbleWrap>
                    );
                  })
                )}
              </MsgList>
              <ChatInput>
                <textarea
                  value={mesajMetin}
                  onChange={e => setMesajMetin(e.target.value)}
                  placeholder="Yanıtınızı yazın..."
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGonder(e); } }}
                />
                <button type="button" onClick={handleGonder} disabled={!mesajMetin.trim() || gonderiyor}>
                  {gonderiyor ? '…' : 'Gönder'}
                </button>
              </ChatInput>
            </>
          )}
        </ChatPanel>
      </Layout>
    </Page>
  );
}
