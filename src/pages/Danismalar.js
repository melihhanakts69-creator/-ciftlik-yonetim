import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  color: #1a1a1a;
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 100px);
`;

const Header = styled.header`
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  .title { font-size: 12px; font-weight: 600; color: #6b7280; letter-spacing: 0.04em; margin: 0 0 4px; text-transform: uppercase; }
  .name { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
  .desc { font-size: 14px; color: #6b7280; margin-top: 6px; }
`;

const Layout = styled.div`
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 400px;
  @media (max-width: 768px) { flex-direction: column; }
`;

const ThreadList = styled.div`
  width: 280px;
  flex-shrink: 0;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) { width: 100%; max-height: 220px; }
`;

const ThreadListHeader = styled.div`
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px; font-weight: 600; color: #374151;
`;

const ThreadItem = styled.div`
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
  &:hover { background: #f3f4f6; }
  ${p => p.$active && 'background: #fff; border-left: 3px solid #111827;'}
  .name { font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 2px; }
  .preview { font-size: 12px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .meta { font-size: 11px; color: #9ca3af; margin-top: 4px; }
  .unread { display: inline-block; background: #111827; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 10px; margin-left: 6px; }
`;

const ChatPanel = styled.div`
  flex: 1;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
`;

const ChatHeader = styled.div`
  padding: 16px 18px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  .name { font-size: 16px; font-weight: 700; color: #111827; }
  .sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
`;

const MsgList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 240px;
  max-height: 420px;
  background: #eef2f7;
`;

const MsgBubble = styled.div`
  max-width: 78%;
  padding: 11px 14px;
  font-size: 13px;
  line-height: 1.45;
  word-break: break-word;
  border: none;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  ${p => p.$ben
    ? 'align-self: flex-end; background: #0ea5e9; color: #fff; border-radius: 14px 14px 4px 14px;'
    : 'align-self: flex-start; background: #fff; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 14px 14px 14px 4px;'}
  .time { font-size: 10px; margin-top: 4px; opacity: 0.85; }
  ${p => !p.$ben && '.time { color: #64748b; opacity: 1; }'}
`;

const ChatInput = styled.div`
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 10px;
  align-items: flex-end;
  textarea {
    flex: 1;
    min-height: 44px;
    max-height: 120px;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    font-size: 13px;
    resize: none;
    font-family: inherit;
    background: #fafafa;
  }
  textarea:focus { outline: none; border-color: #d1d5db; background: #fff; }
  button {
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 13px; font-weight: 600;
    border: none; cursor: pointer;
    background: #111827; color: #fff;
  }
  button:hover { background: #374151; }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  background: #fafafa;
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
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
                      <MsgBubble key={m._id} $ben={benim}>
                        <div>{m.mesaj}</div>
                        <div className="time">{m.createdAt ? new Date(m.createdAt).toLocaleString('tr-TR') : ''}</div>
                      </MsgBubble>
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
