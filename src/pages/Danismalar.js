import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import * as api from '../services/api';
import VetPageHeader from '../components/Layout/VetPageHeader';

const fadeUp = keyframes`from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}`;
const msgIn = keyframes`from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}`;

const Page = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px 0;
  min-height: calc(100vh - 80px);
  display: flex; flex-direction: column;
  background: #f9fafb;
  animation: ${fadeUp} 0.4s ease;
`;

// ─── Layout ───────────────────────────────────────────────────────────────────
const Layout = styled.div`
  display: flex;
  gap: 18px;
  flex: 1;
  min-height: 0;
  height: calc(100vh - 230px);
  padding-bottom: 24px;
  @media(max-width: 1024px) { flex-direction: column; height: auto; }
`;

// ─── Thread List ──────────────────────────────────────────────────────────────
const ThreadList = styled.div`
  width: 300px; flex-shrink: 0;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
  display: flex; flex-direction: column;
  @media(max-width: 1024px) { width: 100%; max-height: 280px; }
`;

const TLHead = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; justify-content: space-between;
  .tl-title { font-size: 15px; font-weight: 800; color: #0f172a; }
  .tl-count { font-size: 11px; color: #94a3b8; font-weight: 700; }
`;

const TLScroll = styled.div`
  flex: 1; overflow-y: auto;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
`;

const ThreadItem = styled.div`
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f8fafc;
  transition: all 0.15s;
  position: relative;
  background: ${p => p.$active ? 'linear-gradient(90deg,rgba(67,56,202,0.07),transparent)' : 'transparent'};
  ${p => p.$active ? `
    &::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg,#6366f1,#4338ca); border-radius: 0 3px 3px 0; }
  ` : ''}
  &:hover { background: ${p => p.$active ? 'linear-gradient(90deg,rgba(67,56,202,0.07),transparent)' : '#fafbfd'}; }
  &:last-child { border-bottom: none; }

  .ti-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
  .ti-name { font-size: 14px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em; }
  .ti-time { font-size: 11px; color: #94a3b8; font-weight: 600; flex-shrink: 0; margin-left: 8px; }
  .ti-bot { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .ti-preview { font-size: 13px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: ${p => p.$hasUnread ? '700' : '500'}; }
  .ti-unread { min-width: 20px; height: 20px; padding: 0 6px; background: linear-gradient(135deg,#6366f1,#4338ca); color: #fff; font-size: 11px; font-weight: 800; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(99,102,241,0.35); flex-shrink: 0; }

  .ti-avatar { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,#e0e7ff,#c7d2fe); color: #4338ca; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; flex-shrink: 0; margin-bottom: 8px; }
`;

// ─── Chat Panel ───────────────────────────────────────────────────────────────
const ChatPanel = styled.div`
  flex: 1;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex; flex-direction: column;
  overflow: hidden; min-width: 0;
`;

const ChatHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; gap: 14px;
  background: linear-gradient(135deg, #f8f9ff, #fff);
  flex-shrink: 0;

  .ch-avatar { width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg,#e0e7ff,#c7d2fe); color: #4338ca; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; flex-shrink: 0; }
  .ch-info { flex: 1; }
  .ch-name { font-size: 16px; font-weight: 900; color: #0f172a; margin-bottom: 2px; letter-spacing: -0.01em; }
  .ch-sub { font-size: 12px; color: #64748b; font-weight: 600; }
  .ch-status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; font-weight: 600; }
  .ch-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
`;

const MsgList = styled.div`
  flex: 1; overflow-y: auto;
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: 14px;
  background: #f8fafc;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
`;

const BubbleWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${p => p.$ben ? 'flex-end' : 'flex-start'};
  animation: ${msgIn} 0.2s ease;
  gap: 4px;

  .bw-sender { font-size: 11px; font-weight: 700; color: #94a3b8; padding: 0 14px; }
`;

const Bubble = styled.div`
  max-width: 68%;
  padding: 12px 16px;
  font-size: 14px; line-height: 1.55; font-weight: 500;
  word-break: break-word;
  border-radius: ${p => p.$ben ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  ${p => p.$ben
    ? 'background: linear-gradient(135deg, #6366f1, #4338ca); color: #fff; box-shadow: 0 4px 14px rgba(99,102,241,0.25);'
    : 'background: #fff; color: #1e293b; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.05);'}

  .b-time { font-size: 11px; margin-top: 6px; text-align: right; font-weight: 500; color: ${p => p.$ben ? 'rgba(255,255,255,0.65)' : '#94a3b8'}; }
`;

const ChatInput = styled.div`
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #f1f5f9;
  display: flex; gap: 12px; align-items: flex-end;
  flex-shrink: 0;

  .inp-wrap {
    flex: 1; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 12px 16px;
    transition: all 0.2s;
    &:focus-within { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
  }
  textarea { width: 100%; min-height: 20px; max-height: 120px; font-size: 14px; font-weight: 500; resize: none; font-family: inherit; background: transparent; border: none; color: #0f172a; line-height: 1.5; outline: none; &::placeholder { color: #94a3b8; } }
  
  .send-btn {
    width: 46px; height: 46px; border-radius: 14px; border: none; cursor: pointer; flex-shrink: 0; margin-bottom: 2px;
    background: linear-gradient(135deg, #6366f1, #4338ca); color: #fff;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 18px rgba(99,102,241,0.3); transition: all 0.2s;
    &:hover:not(:disabled) { transform: translateY(-2px) scale(1.05); box-shadow: 0 8px 22px rgba(99,102,241,0.4); }
    &:disabled { background: #e2e8f0; box-shadow: none; cursor: not-allowed; color: #94a3b8; }
  }
`;

const EmptyChat = styled.div`
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px; text-align: center; background: #f8fafc;
  .ec-icon { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg,#e0e7ff,#c7d2fe); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 36px; }
  .ec-title { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
  .ec-sub { font-size: 14px; color: #94a3b8; line-height: 1.6; max-width: 300px; }
`;

const DateDivider = styled.div`
  text-align: center; position: relative; margin: 8px 0;
  &::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e2e8f0; }
  span { position: relative; background: #f8fafc; padding: 0 12px; font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 0.06em; }
`;

// ─────────────────────────────────────────────────────────────────────────────
export default function Danismalar() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [mesajlar, setMesajlar] = useState([]);
  const [mesajYukleniyor, setMesajYukleniyor] = useState(false);
  const [mesajMetin, setMesajMetin] = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);
  const [benimId, setBenimId] = useState(null);
  const msgEndRef = useRef(null);
  const taRef = useRef(null);

  const selectedThread = threads.find(t => (t.otherUser?._id || t.otherUser) === selectedId);
  const selectedUser = selectedThread?.otherUser;

  useEffect(() => {
    let cancelled = false;
    api.getProfile().then(res => {
      if (!cancelled && res?.data) {
        setBenimId(res.data.user?.parentUserId || res.data.user?._id || res.data.parentUserId || res.data._id);
      }
    }).catch(() => {});
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

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mesajlar]);

  const handleGonder = async (e) => {
    e?.preventDefault();
    const metin = (mesajMetin || '').trim();
    if (!metin || !selectedId || gonderiyor) return;
    setGonderiyor(true);
    try {
      await api.postDanismaMesaj(selectedId, metin);
      setMesajMetin('');
      if (taRef.current) { taRef.current.style.height = 'auto'; }
      const [mRes, tRes] = await Promise.all([
        api.getDanismaMesajlar(selectedId),
        api.getDanismaThreads()
      ]);
      setMesajlar(Array.isArray(mRes.data) ? mRes.data : []);
      setThreads(Array.isArray(tRes.data) ? tRes.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mesaj gönderilemedi.');
    } finally {
      setGonderiyor(false);
    }
  };

  const totalUnread = threads.reduce((s, t) => s + (t.unreadCount || 0), 0);

  // Mesajları tarihe göre grupla
  const groupedMsgs = (() => {
    const groups = [];
    let lastDate = '';
    mesajlar.forEach(m => {
      const dateStr = m.createdAt ? new Date(m.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      if (dateStr !== lastDate) { groups.push({ type: 'date', label: dateStr }); lastDate = dateStr; }
      groups.push({ type: 'msg', data: m });
    });
    return groups;
  })();

  return (
    <Page>
      <VetPageHeader
        title="Danışma Mesajları"
        subtitle="Çiftçilerden gelen sorular ve danışmalar"
      />

      <Layout>
        {/* Thread List */}
        <ThreadList>
          <TLHead>
            <span className="tl-title">Konuşmalar</span>
            <span className="tl-count">{threads.length}</span>
          </TLHead>
          <TLScroll>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Yükleniyor…</div>
            ) : threads.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
                Henüz konuşma yok.
              </div>
            ) : threads.map(t => {
              const ou = t.otherUser || {};
              const oid = ou._id || ou;
              const name = ou.isletmeAdi || ou.isim || 'Çiftlik';
              const initial = name.charAt(0).toUpperCase();
              return (
                <ThreadItem key={oid} $active={selectedId === oid} $hasUnread={t.unreadCount > 0} onClick={() => setSelectedId(oid)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div className="ti-avatar">{initial}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ti-top">
                        <div className="ti-name">{name}</div>
                        <div className="ti-time">{t.lastAt ? new Date(t.lastAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                      </div>
                      <div className="ti-bot">
                        {t.lastMessage && <div className="ti-preview">{t.lastMessage}</div>}
                        {t.unreadCount > 0 && <span className="ti-unread">{t.unreadCount}</span>}
                      </div>
                    </div>
                  </div>
                </ThreadItem>
              );
            })}
          </TLScroll>
        </ThreadList>

        {/* Chat Panel */}
        <ChatPanel>
          {!selectedId ? (
            <EmptyChat>
              <div className="ec-icon">💬</div>
              <div className="ec-title">Konuşma Seçin</div>
              <div className="ec-sub">Sol listeden bir konuşma seçin. Çiftlikler size mesaj gönderdiğinde burada görünecek.</div>
            </EmptyChat>
          ) : (
            <>
              <ChatHeader>
                <div className="ch-avatar">{(selectedUser?.isletmeAdi || selectedUser?.isim || 'Ç').charAt(0)}</div>
                <div className="ch-info">
                  <div className="ch-name">{selectedUser?.isletmeAdi || selectedUser?.isim || 'Çiftlik'}</div>
                  <div className="ch-sub">{selectedUser?.isim}{selectedUser?.isletmeAdi ? ` · ${selectedUser.isletmeAdi}` : ''}</div>
                </div>
                <div className="ch-status">
                  <div className="ch-dot" />
                  Aktif
                </div>
              </ChatHeader>

              <MsgList>
                {mesajYukleniyor ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: 32 }}>Yükleniyor…</div>
                ) : mesajlar.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: 32 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
                    Henüz mesaj yok. İlk mesajı siz gönderin!
                  </div>
                ) : groupedMsgs.map((item, idx) => {
                  if (item.type === 'date') {
                    return <DateDivider key={`d-${idx}`}><span>{item.label}</span></DateDivider>;
                  }
                  const m = item.data;
                  const gonderenId = (m.gonderenId && (m.gonderenId._id || m.gonderenId)) || '';
                  const benim = String(gonderenId) === String(benimId);
                  return (
                    <BubbleWrap key={m._id} $ben={benim}>
                      {!benim && <span className="bw-sender">{selectedUser?.isim || 'Çiftlik'}</span>}
                      <Bubble $ben={benim}>
                        {m.mesaj}
                        <div className="b-time">
                          {m.createdAt ? new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </Bubble>
                    </BubbleWrap>
                  );
                })}
                <div ref={msgEndRef} />
              </MsgList>

              <ChatInput>
                <div className="inp-wrap">
                  <textarea
                    ref={taRef}
                    value={mesajMetin}
                    onChange={e => {
                      setMesajMetin(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    placeholder="Yanıtınızı yazın… (Enter = gönder, Shift+Enter = yeni satır)"
                    rows={1}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGonder(e);
                        if (taRef.current) taRef.current.style.height = 'auto';
                      }
                    }}
                  />
                </div>
                <button className="send-btn" type="button" onClick={handleGonder} disabled={!mesajMetin.trim() || gonderiyor}>
                  {gonderiyor ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                </button>
              </ChatInput>
            </>
          )}
        </ChatPanel>
      </Layout>
    </Page>
  );
}
