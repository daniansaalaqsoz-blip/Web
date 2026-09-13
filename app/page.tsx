'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Link as LinkIcon, Mail, RefreshCcw, ShieldAlert, ShieldCheck, ShoppingCart, Clock, Trash2 } from 'lucide-react';

type LogEntry = {
  id: string;
  timestamp: number;
  email: string;
  status: 'sent' | 'activated' | 'error';
  details?: string;
};

export default function AdminDashboard() {
  const [pingStatus, setPingStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [magicLink, setMagicLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isActivated, setIsActivated] = useState(false);
  
  // Membaca localStorage langsung saat inisialisasi state (Bebas error ESLint)
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('am_activation_logs');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });
  
  const [confirmClear, setConfirmClear] = useState(false);

  const addLog = (logEmail: string, logStatus: 'sent' | 'activated' | 'error', details?: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      email: logEmail,
      status: logStatus,
      details
    };
    setLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 50); // Keep last 50 logs
      localStorage.setItem('am_activation_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const clearLogs = () => {
    if (confirmClear) {
      setLogs([]);
      localStorage.removeItem('am_activation_logs');
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  useEffect(() => {
    const checkPing = async () => {
      setPingStatus('loading');
      try {
        const res = await fetch('/api/am?action=ping');
        if (res.ok) {
          setPingStatus('online');
        } else {
          setPingStatus('offline');
        }
      } catch {
        setPingStatus('offline');
      }
    };
    checkPing();
  }, []);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Format email tidak valid.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/am', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim magic link.');
      }

      setSuccessMsg('Magic link berhasil dikirim ke email pembeli.');
      addLog(email, 'sent', 'Magic link terkirim');
      setStep(2);
    } catch (err: any) {
      setError(err.message);
      addLog(email, 'error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicLink) {
      setError('URL Magic Link wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/am', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verif', email, url: magicLink })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memverifikasi magic link.');
      }

      setIsActivated(true);
      setSuccessMsg('Aktivasi berhasil!');
      addLog(email, 'activated');
    } catch (err: any) {
      setError(err.message);
      addLog(email, 'error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setEmail('');
    setMagicLink('');
    setError(null);
    setSuccessMsg(null);
    setIsActivated(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] font-sans selection:bg-[#CCFBF1] selection:text-[#0F766E] pb-12">
      <header className="bg-white border-b border-[#E4E4E0] px-4 py-3 sticky top-0 z-40 shadow-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white shadow-sm">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Alight Motion</h1>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAFAF8] rounded-full border border-[#E4E4E0] text-[11px] font-semibold text-[#6B6B68]">
            {pingStatus === 'loading' && <RefreshCcw className="w-3.5 h-3.5 animate-spin text-[#6B6B68]" />}
            {pingStatus === 'online' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
            {pingStatus === 'offline' && <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />}
            <span className="uppercase tracking-wider">{pingStatus}</span>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 w-full max-w-xl mx-auto mt-4 sm:mt-8 flex flex-col gap-6">
        <div className="bg-white border border-[#E4E4E0] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E4E4E0] bg-[#FAFAF8]/50">
            <h2 className="text-base font-semibold">Proses Aktivasi</h2>
            <p className="text-sm text-[#6B6B68] mt-1">Selesaikan 2 tahap di bawah untuk memproses.</p>
          </div>

          <div className="p-5">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-sm flex gap-2 items-start">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-tight">{error}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-[#CCFBF1] border border-[#0F766E]/20 text-[#0F766E] text-sm flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-tight font-medium">{successMsg}</p>
              </div>
            )}

            <div className="flex flex-col gap-6 relative">
              {/* Vertical line indicator */}
              <div className="absolute left-3 top-8 bottom-8 w-[2px] bg-[#E4E4E0] z-0"></div>

              {/* Step 1 */}
              <div className={`relative z-10 flex gap-4 transition-opacity duration-300 ${step === 2 && !isActivated ? 'opacity-50' : ''}`}>
                <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold mt-1 ${step >= 1 ? 'bg-[#0F766E] text-white' : 'bg-[#E4E4E0] text-[#6B6B68]'}`}>
                  1
                </div>
                <div className="flex-1 pb-2">
                  <h3 className="font-semibold text-sm mb-3">Kirim Magic Link</h3>
                  <form onSubmit={handleSendLink} className="flex flex-col gap-3">
                    <div>
                      <label htmlFor="email" className="sr-only">Email Pembeli</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B68]" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={step > 1 || loading}
                          placeholder="email@gmail.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E4E4E0] rounded-lg text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] disabled:bg-[#FAFAF8] disabled:text-[#6B6B68] transition-all"
                          required
                        />
                      </div>
                    </div>
                    {step === 1 && (
                      <button 
                        type="submit" 
                        disabled={loading || !email}
                        className="flex items-center justify-center gap-2 bg-[#0F766E] hover:bg-[#0d6b63] text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Kirim Link'}
                      </button>
                    )}
                  </form>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`relative z-10 flex gap-4 transition-opacity duration-300 ${step === 1 ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold mt-1 ${step === 2 ? 'bg-[#0F766E] text-white' : 'bg-[#E4E4E0] text-[#6B6B68]'}`}>
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-3">Verifikasi & Aktifkan</h3>
                  <form onSubmit={handleVerify} className="flex flex-col gap-3">
                    <div>
                      <label htmlFor="magicLink" className="sr-only">URL Magic Link</label>
                      <div className="relative">
                        <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B68]" />
                        <input
                          id="magicLink"
                          type="url"
                          value={magicLink}
                          onChange={(e) => setMagicLink(e.target.value)}
                          disabled={loading || isActivated}
                          placeholder="https://alight.link/..."
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E4E4E0] rounded-lg text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] disabled:bg-[#FAFAF8] disabled:text-[#6B6B68] transition-all"
                          required
                        />
                      </div>
                    </div>
                    {!isActivated && (
                      <button 
                        type="submit" 
                        disabled={loading || !magicLink}
                        className="flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-black text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Verifikasi'}
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-[#E4E4E0] bg-[#FAFAF8]/50 flex justify-end">
             <button 
               onClick={resetForm}
               disabled={loading || (step === 1 && !email)}
               className="text-xs font-medium text-[#6B6B68] hover:text-[#1A1A1A] transition-colors px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Reset Form
             </button>
          </div>
        </div>

        {/* History Log Section */}
        <div className="bg-white border border-[#E4E4E0] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E4E4E0] bg-[#FAFAF8]/50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-[#1A1A1A]">
              <Clock className="w-4 h-4 text-[#6B6B68]" />
              <h2 className="text-sm font-semibold">Riwayat Aktivasi</h2>
            </div>
            {logs.length > 0 && (
              <button 
                onClick={clearLogs} 
                className={`text-xs font-medium transition-colors flex items-center gap-1 ${
                  confirmClear ? 'text-rose-600 bg-rose-50 px-2 py-1 rounded-md' : 'text-[#6B6B68] hover:text-rose-600'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {confirmClear ? 'Yakin Hapus?' : ' '}
              </button>
            )}
          </div>
          <div className="divide-y divide-[#E4E4E0] max-h-72 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6B6B68]">Belum ada riwayat aktivasi tersimpan.</div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="p-3 sm:px-4 hover:bg-[#FAFAF8] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{log.email}</p>
                    <p className="text-[11px] text-[#6B6B68] mt-0.5">{new Date(log.timestamp).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {log.details && (
                      <span className="text-[11px] text-[#6B6B68] max-w-[140px] truncate" title={log.details}>
                        {log.details}
                      </span>
                    )}
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${
                      log.status === 'activated' ? 'bg-[#CCFBF1] text-[#0F766E] border-[#0F766E]/20' :
                      log.status === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-white text-[#4B5563] border-[#E4E4E0]'
                    }`}>
                      {log.status === 'activated' ? 'Sukses' : log.status === 'error' ? 'Gagal' : 'Terkirim'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
