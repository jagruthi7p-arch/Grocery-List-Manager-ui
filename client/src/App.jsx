
    import React, { useState, useEffect, useRef, useMemo, createContext, useContext, useCallback } from 'react';
  import axios from 'axios';

  // JWT auth: attach Bearer token to every API request
  axios.interceptors.request.use(cfg => {
    const t = localStorage.getItem('token');
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
  });
    const API = (location.protocol === 'file:' ? 'http://localhost:5000' : '') + '/api';

    const CATEGORIES = [
      { name:'Produce',   color:'#7B9B7A', bg:'#E8EFE3' },
      { name:'Fruits',    color:'#D97757', bg:'#F8E3D6' },
      { name:'Dairy',     color:'#5B7DB1', bg:'#DEE6F2' },
      { name:'Bakery',    color:'#B8895A', bg:'#F0E1CE' },
      { name:'Meat',      color:'#A0524D', bg:'#EFD9D7' },
      { name:'Snacks',    color:'#C8993E', bg:'#F5E5C2' },
      { name:'Beverages', color:'#4F8794', bg:'#D7E5E8' },
      { name:'Pantry',    color:'#8B6F47', bg:'#EBE0CF' },
      { name:'Other',     color:'#6B6B6B', bg:'#E5E2DA' },
    ];
    const CAT_NAMES = CATEGORIES.map(c => c.name);
    const catMeta = (n) => CATEGORIES.find(c => c.name === n) || CATEGORIES[CATEGORIES.length-1];

    const PALETTE = ['#1F3D2C','#D97757','#7B9B7A','#5B7DB1','#B8895A','#A0524D','#4F8794','#C8993E'];
    const colorFor = (id) => PALETTE[Array.from(String(id||'?')).reduce((a,c)=>a+c.charCodeAt(0),0) % PALETTE.length];
    const initials = (s) => (s||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}) : '';

    const Icon = {
      Bag:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l-1.2 12.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>,
      Plus:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
      Trash:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>,
      Arrow:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
      Back:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>,
      Users:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5c2.8.3 5 2.4 5 5"/></svg>,
      List:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
      Copy:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>,
      Logout:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
      Sparkle:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>,
      Live:(p)=><svg {...p} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>,
      Search:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
      Edit:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>,
      X:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
      Check:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
      Bolt:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>,
      Phone:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>,
      Heart:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 6.6c-1.6-1.7-4.2-1.7-5.8 0L12 9.6 9 6.6c-1.6-1.7-4.2-1.7-5.8 0-1.6 1.7-1.6 4.4 0 6.1l8.8 9 8.8-9c1.6-1.7 1.6-4.4 0-6.1z"/></svg>,
      Layers:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/></svg>,
      Lock:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>,
      Cog:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
      Download:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>,
      Globe:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c3 3 4.5 6.5 4.5 10S15 19 12 22M12 2C9 5 7.5 8.5 7.5 12S9 19 12 22"/></svg>,
      Leaf:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-7 8-9 16-9 0 8-2 16-9 16zM4 13c4-3 8-3 12-3"/></svg>,
      Folder:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>,
      File:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z"/><path d="M14 3v6h6"/></svg>,
      Map:(p)=><svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>,
    };

    // ===== TOAST SYSTEM =====
    const ToastCtx = createContext(null);
    function useToast() { return useContext(ToastCtx); }
    function ToastProvider({ children }) {
      const [toasts, setToasts] = useState([]);
      const push = useCallback((message, opts = {}) => {
        const id = Math.random().toString(36).slice(2);
        const t = { id, message, kind: opts.kind || 'info' };
        setToasts(prev => [...prev, t]);
        setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), opts.duration || 3200);
      }, []);
      return (
        <ToastCtx.Provider value={push}>
          {children}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
            {toasts.map(t => {
              const styles = {
                info:    'bg-ink text-cream',
                success: 'bg-forest text-cream',
                error:   'bg-terra text-cream',
                celebrate:'bg-butter text-ink',
              }[t.kind] || 'bg-ink text-cream';
              const Iconel = t.kind === 'success' || t.kind === 'celebrate' ? Icon.Check : t.kind === 'error' ? Icon.X : Icon.Sparkle;
              return (
                <div key={t.id} className={`${styles} px-5 py-3.5 rounded-2xl shadow-lift flex items-center gap-3 max-w-sm animate-toast-in`}>
                  <Iconel className="w-4 h-4 flex-shrink-0"/>
                  <span className="text-sm font-medium">{t.message}</span>
                </div>
              );
            })}
          </div>
        </ToastCtx.Provider>
      );
    }

    // ===== LANDING PAGE =====
    function Landing({ onStart, onAdmin, onArchitecture }) {
      const features = [
        { icon: Icon.Bolt,    color:'#D97757', bg:'#F8E3D6', title:'Instant sync',     desc:'Add an item on your phone, watch it appear on theirs in the same heartbeat.' },
        { icon: Icon.Users,   color:'#1F3D2C', bg:'#E8EFE3', title:'Built for households', desc:'Make a group, share an ID, and you\'re shopping the same list together.' },
        { icon: Icon.Layers,  color:'#5B7DB1', bg:'#DEE6F2', title:'Smart categories', desc:'Items group themselves by aisle so you breeze through the store top to bottom.' },
        { icon: Icon.Heart,   color:'#A0524D', bg:'#EFD9D7', title:'Quietly delightful', desc:'Soft type, warm cream, gentle motion. A grocery list that feels like a notebook.' },
        { icon: Icon.Phone,   color:'#4F8794', bg:'#D7E5E8', title:'Works on any screen', desc:'No install, no app store. Open in a browser on your phone, tablet, or laptop.' },
        { icon: Icon.Lock,    color:'#8B6F47', bg:'#EBE0CF', title:'Your data, your DB',  desc:'Run it online with MongoDB Atlas, or fully offline on your own machine.' },
      ];
      const steps = [
        { n:'01', title:'Make an account',      body:'Takes 10 seconds. Just an email and a password.' },
        { n:'02', title:'Start or join a group', body:'Name your household, or paste a group ID someone shared with you.' },
        { n:'03', title:'Build the list together', body:'Everyone adds, ticks, edits — all in real time, all on the same page.' },
      ];

      return (
        <div className="min-h-screen bg-cream">
          {/* NAV */}
          <header className="sticky top-0 z-30 bg-cream/85 backdrop-blur-md border-b border-line">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-forest text-cream flex items-center justify-center"><Icon.Bag className="w-5 h-5"/></div>
                <span className="font-semibold text-lg tracking-tight">Grocery List Manager</span>
              </div>
              <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
                <a href="#features" className="hover:text-ink transition-colors">Features</a>
                <a href="#how" className="hover:text-ink transition-colors">How it works</a>
                <a href="#preview" className="hover:text-ink transition-colors">A peek inside</a>
              </nav>
              <div className="flex items-center gap-2">
                <button onClick={onStart} className="text-sm font-medium text-muted hover:text-ink transition-colors px-3 py-2">
                  Sign in
                </button>
                <button onClick={onStart} className="text-sm bg-ink hover:bg-forest text-cream font-medium px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 group">
                  Get started <Icon.Arrow className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"/>
                </button>
              </div>
            </div>
          </header>

          {/* HERO */}
          <section className="relative mesh overflow-hidden">
            <div className="absolute top-20 right-12 w-32 h-32 bg-butter/40 rounded-full blur-3xl animate-float"/>
            <div className="absolute bottom-10 left-20 w-40 h-40 bg-sage/30 rounded-full blur-3xl animate-float" style={{animationDelay:'1.5s'}}/>

            <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="animate-fade-up">
                <div className="inline-flex items-center gap-2 bg-paper border border-line rounded-full pl-2 pr-4 py-1.5 mb-7">
                  <span className="bg-forest text-cream text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">New</span>
                  <span className="text-sm text-muted">Real-time shared shopping lists</span>
                </div>

                <h1 className="font-bold text-[clamp(48px,7vw,84px)] leading-[1.0] tracking-tight text-ink">
                  One list.<br/>
                  Your whole<br/>
                  <span className="relative inline-block">
                    <span className="text-terra">household.</span>
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                      <path d="M2 9 Q50 2 100 6 T198 8" stroke="#D97757" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
                    </svg>
                  </span>
                </h1>

                <p className="text-xl text-muted mt-7 max-w-lg leading-relaxed">
                  Grocery List Manager is a soft, shared notebook for groceries. You jot the milk, your partner ticks the bread — everything stays in sync, in real time.
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-9">
                  <button onClick={onStart} className="bg-ink hover:bg-forest text-cream font-medium px-7 py-4 rounded-2xl flex items-center gap-2 group transition-all shadow-lift">
                    Start shopping together <Icon.Arrow className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                  </button>
                  <a href="#how" className="text-ink font-medium px-5 py-4 hover:underline underline-offset-4">
                    See how it works
                  </a>
                </div>

                <div className="flex items-center gap-6 mt-10 text-sm text-muted">
                  <div className="flex items-center gap-2"><Icon.Check className="w-4 h-4 text-sage"/> Free forever</div>
                  <div className="flex items-center gap-2"><Icon.Check className="w-4 h-4 text-sage"/> No installs</div>
                  <div className="flex items-center gap-2"><Icon.Check className="w-4 h-4 text-sage"/> Open source stack</div>
                </div>
              </div>

              {/* HERO MOCKUP */}
              <div className="relative animate-fade-up" style={{animationDelay:'150ms'}}>
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-terra/20 rounded-3xl rotate-12 animate-float" style={{animationDelay:'0.5s'}}/>
                <div className="absolute -bottom-6 -right-4 w-32 h-32 bg-butter/40 rounded-full animate-float" style={{animationDelay:'2s'}}/>

                <div className="relative bg-paper rounded-[36px] shadow-lift border border-line p-7 grain overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted mb-1">Sunday Run</p>
                      <h3 className="text-2xl font-semibold tracking-tight">Weekend groceries</h3>
                    </div>
                    <div className="flex -space-x-2">
                      {['#D97757','#1F3D2C','#5B7DB1'].map((c,i)=>(
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-paper text-cream text-xs font-semibold flex items-center justify-center" style={{background:c}}>
                          {['JM','AL','SK'][i]}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-1.5 bg-cream rounded-full mb-5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sage to-forest rounded-full" style={{width:'62%'}}/>
                  </div>

                  <ul className="space-y-2 text-sm">
                    {[
                      {n:'Avocados',  q:'×3', cat:'Fruits',    done:true},
                      {n:'Sourdough', q:'×1', cat:'Bakery',    done:true},
                      {n:'Oat milk',  q:'×2', cat:'Dairy',     done:false},
                      {n:'Cherry tomatoes', q:'×1', cat:'Produce', done:false},
                      {n:'Dark chocolate', q:'×2', cat:'Snacks', done:false},
                    ].map((it,i)=>{
                      const m = catMeta(it.cat);
                      return (
                        <li key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cream/60 transition-colors">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center ${it.done?'bg-forest':'bg-cream border border-line'}`}>
                            {it.done && <Icon.Check className="w-3 h-3 text-cream"/>}
                          </span>
                          <span className={`flex-1 ${it.done?'line-through opacity-50':''}`}>{it.n}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background:m.bg,color:m.color}}>{it.q}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-5 pt-4 border-t border-line flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-1.5"><Icon.Live className="w-2 h-2 text-sage animate-pulse"/> Live with 3 people</div>
                    <span>5 of 8 packed</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TRUST STRIP */}
          <section className="border-y border-line bg-paper">
            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                {k:'∞',     v:'Shared lists'},
                {k:'9',     v:'Smart categories'},
                {k:'<1s',   v:'Real-time updates'},
                {k:'100%',  v:'Free & open source'},
              ].map((s,i)=>(
                <div key={i}>
                  <div className="text-4xl md:text-5xl font-semibold text-forest tracking-tight">{s.k}</div>
                  <div className="text-sm text-muted mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </section>

          {/* FEATURES */}
          <section id="features" className="max-w-7xl mx-auto px-6 py-28">
            <div className="max-w-2xl mb-16">
              <p className="text-sm uppercase tracking-[0.18em] text-terra mb-3">What's inside</p>
              <h2 className="text-5xl font-semibold tracking-tight mb-4">Small features that make a big difference at the store.</h2>
              <p className="text-lg text-muted">Grocery List Manager isn't trying to be a CRM. It's trying to be the easiest, calmest way to share a list with the people you live with.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f,i)=>(
                <div key={i} className="bg-paper border border-line rounded-3xl p-7 hover:shadow-lift hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{background:f.bg, color:f.color}}>
                    <f.icon className="w-5 h-5"/>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-muted leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section id="how" className="bg-forest text-cream relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-sage/10 blur-3xl"/>
            <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-terra/10 blur-3xl"/>

            <div className="max-w-7xl mx-auto px-6 py-28 relative">
              <div className="max-w-2xl mb-16">
                <p className="text-sm uppercase tracking-[0.18em] text-butter mb-3">How it works</p>
                <h2 className="text-5xl font-semibold tracking-tight mb-4">From "we need eggs" to a shared list in a minute.</h2>
                <p className="text-lg text-cream/70">Three small steps, that's the whole onboarding.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                {steps.map((s,i)=>(
                  <div key={i} className="relative bg-cream/5 border border-cream/10 rounded-3xl p-8 hover:bg-cream/10 transition-all">
                    <div className="text-butter font-semibold text-sm tracking-widest mb-6">{s.n}</div>
                    <h3 className="text-2xl font-semibold mb-3 tracking-tight">{s.title}</h3>
                    <p className="text-cream/70 leading-relaxed">{s.body}</p>
                    {i < steps.length - 1 && (
                      <div className="hidden md:flex absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-cream text-forest items-center justify-center -translate-y-1/2 z-10">
                        <Icon.Arrow className="w-4 h-4"/>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-16 text-center">
                <button onClick={onStart} className="bg-butter hover:bg-cream text-ink font-medium px-7 py-4 rounded-2xl inline-flex items-center gap-2 group transition-all shadow-lift">
                  Try it now — it's free <Icon.Arrow className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                </button>
              </div>
            </div>
          </section>

          {/* PREVIEW SECTION */}
          <section id="preview" className="max-w-7xl mx-auto px-6 py-28">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-terra mb-3">A peek inside</p>
                <h2 className="text-5xl font-semibold tracking-tight mb-5">The list you'll actually want to open.</h2>
                <p className="text-lg text-muted mb-8 leading-relaxed">
                  Categories color themselves. Progress fills as you tick things off. Updates from your partner slide in without you doing a thing. It's a small daily ritual, made nicer.
                </p>

                <ul className="space-y-4">
                  {[
                    {t:'Search as you type',   d:'Filter big lists down to one item in a flash.'},
                    {t:'Inline editing',       d:'Tap an item to rename it or change the quantity.'},
                    {t:'Sweep when you\'re done', d:'One tap clears everything you\'ve already grabbed.'},
                    {t:'Celebrates at 100%',   d:'A tiny burst of color when the list is finished.'},
                  ].map((f,i)=>(
                    <li key={i} className="flex gap-4">
                      <div className="w-9 h-9 rounded-xl bg-sage/20 text-forest flex items-center justify-center flex-shrink-0">
                        <Icon.Check className="w-4 h-4"/>
                      </div>
                      <div>
                        <div className="font-semibold mb-0.5">{f.t}</div>
                        <div className="text-muted text-sm">{f.d}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-terra/10 rounded-full blur-2xl"/>
                <div className="bg-paper border border-line rounded-3xl shadow-lift overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-cream border-b border-line">
                    <span className="w-3 h-3 rounded-full bg-terra/60"/>
                    <span className="w-3 h-3 rounded-full bg-butter"/>
                    <span className="w-3 h-3 rounded-full bg-sage/70"/>
                    <div className="ml-3 text-xs text-muted bg-paper rounded-md px-3 py-1 flex-1 max-w-xs">grocerylistmanager.app/lists</div>
                  </div>
                  {/* Mock app */}
                  <div className="grid grid-cols-3">
                    <div className="border-r border-line p-4 bg-cream/40">
                      <div className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-3">Lists</div>
                      <div className="space-y-1.5">
                        {['Weekly grocery', 'Dinner party', 'Costco run'].map((n,i)=>(
                          <div key={i} className={`text-sm px-3 py-2 rounded-xl ${i===0?'bg-forest text-cream':'text-ink'}`}>{n}</div>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2 p-5">
                      <h4 className="text-lg font-semibold mb-3">Weekly grocery</h4>
                      <div className="h-1 bg-cream rounded-full mb-4 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-sage to-forest" style={{width:'40%'}}/>
                      </div>
                      {[
                        {c:'Produce', items:['Spinach','Lemons']},
                        {c:'Dairy', items:['Greek yogurt']},
                      ].map((g,i)=>{
                        const m = catMeta(g.c);
                        return (
                          <div key={i} className="mb-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="w-1.5 h-1.5 rounded-full" style={{background:m.color}}/>
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted">{g.c}</span>
                            </div>
                            {g.items.map((it,j)=>(
                              <div key={j} className="text-sm px-2 py-1.5 flex items-center gap-2">
                                <span className="w-4 h-4 rounded border border-line"/>
                                <span>{it}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="max-w-7xl mx-auto px-6 pb-28">
            <div className="bg-ink text-cream rounded-[40px] p-12 md:p-20 relative overflow-hidden grain">
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-terra/20 blur-3xl"/>
              <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-butter/15 blur-3xl"/>

              <div className="relative max-w-2xl">
                <h2 className="text-5xl md:text-6xl font-semibold tracking-tight mb-5 leading-[1.05]">
                  Today's the day no one forgets the milk.
                </h2>
                <p className="text-lg text-cream/70 mb-9 max-w-xl">
                  Make a free account and invite the people you live with. It's the calmest, friendliest shopping list you'll share this year.
                </p>
                <button onClick={onStart} className="bg-cream hover:bg-butter text-ink font-medium px-7 py-4 rounded-2xl inline-flex items-center gap-2 group transition-all">
                  Open Grocery List Manager <Icon.Arrow className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                </button>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="border-t border-line">
            <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-forest text-cream flex items-center justify-center"><Icon.Bag className="w-4 h-4"/></div>
                <span className="font-semibold tracking-tight">Grocery List Manager</span>
              </div>
              <p className="text-sm text-muted">Built with React, Express, MongoDB & a lot of cream-colored love.</p>
              <div className="flex items-center gap-3 text-sm text-muted">
                <span className="flex items-center gap-2"><Icon.Live className="w-2 h-2 text-sage"/> All systems calm</span>
                <span className="text-line">·</span>
                <button onClick={onAdmin} className="text-muted hover:text-ink transition-colors flex items-center gap-1.5">
                  <Icon.Lock className="w-3.5 h-3.5"/> Admin
                </button>
                <span className="text-line">·</span>
                <button onClick={onArchitecture} className="text-muted hover:text-ink transition-colors flex items-center gap-1.5">
                  <Icon.Map className="w-3.5 h-3.5"/> How it's built
                </button>
              </div>
            </div>
          </footer>
        </div>
      );
    }

    // ===== AUTH SCREEN =====
    function AuthScreen({ onLogin, onBack }) {
      const [mode, setMode] = useState('login');
      const [form, setForm] = useState({ name:'', email:'', password:'' });
      const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
      const toast = useToast();

      const submit = async (e) => {
        e.preventDefault(); setErr(''); setBusy(true);
        try {
          const url = mode === 'login' ? '/users/login' : '/users/register';
          const { data } = await axios.post(API + url, form);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            toast(mode==='login' ? `Welcome back, ${(data.user?.name || '').split(' ')[0]}` : `Account created — welcome to Grocery List Manager`, { kind:'success' });
            onLogin(data.user);
        } catch (e) {
          setErr(e.response?.data?.error || 'Something went wrong');
        } finally { setBusy(false); }
      };

      return (
        <div className="min-h-screen mesh flex items-stretch">
          <div className="hidden lg:flex flex-col justify-between w-[46%] p-14 relative overflow-hidden">
            <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-ink transition-colors z-10 self-start">
              <Icon.Back className="w-4 h-4"/>
              <span className="text-sm font-medium">Back to home</span>
            </button>

            <div className="z-10 animate-fade-up">
              <p className="text-sm uppercase tracking-[0.18em] text-muted mb-5">A shared kitchen ritual</p>
              <h1 className="font-bold text-[64px] leading-[1.02] tracking-tight text-ink">
                Shop together.<br/>
                <span className="text-terra">Forget nothing.</span>
              </h1>
              <p className="text-lg text-muted mt-6 max-w-md leading-relaxed">
                A quiet little workspace where your household keeps one shared list — updates fly between phones the second someone moves a finger.
              </p>

              <div className="flex gap-8 mt-10 text-sm">
                <div><div className="text-3xl font-semibold text-forest">∞</div><div className="text-muted">Shared lists</div></div>
                <div className="w-px bg-line"/>
                <div><div className="text-3xl font-semibold text-forest flex items-center gap-1.5"><Icon.Live className="w-2.5 h-2.5 text-terra"/> Live</div><div className="text-muted">Real-time sync</div></div>
                <div className="w-px bg-line"/>
                <div><div className="text-3xl font-semibold text-forest">9</div><div className="text-muted">Categories</div></div>
              </div>
            </div>

            <div className="text-xs text-muted z-10">© Grocery List Manager · Built with React, Express, MongoDB</div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 lg:p-14 bg-paper lg:rounded-l-[40px] shadow-soft">
            <div className="w-full max-w-md animate-fade-up">
              <div className="lg:hidden flex items-center justify-between mb-10">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-forest text-cream flex items-center justify-center"><Icon.Bag className="w-5 h-5"/></div>
                  <span className="font-semibold text-lg">Grocery List Manager</span>
                </div>
                <button onClick={onBack} className="text-sm text-muted hover:text-ink">Home</button>
              </div>

              <p className="text-sm uppercase tracking-[0.18em] text-terra mb-3">{mode==='login' ? 'Welcome back' : 'New here?'}</p>
              <h2 className="text-4xl font-semibold tracking-tight mb-2">{mode==='login' ? 'Open your account' : 'Create an account'}</h2>
              <p className="text-muted mb-8">
                {mode==='login' ? 'Pick up the list right where the family left off.' : 'A free, shared shopping list for your people.'}
              </p>

              <div className="inline-flex bg-cream rounded-full p-1 mb-8 border border-line">
                {['login','register'].map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${mode===m ? 'bg-forest text-cream shadow-soft' : 'text-muted hover:text-ink'}`}>
                    {m==='login' ? 'Login' : 'Register'}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-3">
                {mode==='register' && (
                  <input className="field animate-fade-up" placeholder="Your name" required
                    value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
                )}
                <input className="field" type="email" placeholder="Email address" required autoComplete="email"
                  value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
                <input className="field" type="password" placeholder="Password" required autoComplete={mode==='login'?'current-password':'new-password'}
                  value={form.password} onChange={e => setForm({...form, password:e.target.value})} />

                {err && <p className="text-terra text-sm flex items-center gap-2 animate-fade-up">{err}</p>}

                <button disabled={busy} className="group w-full bg-ink hover:bg-forest text-cream font-medium py-4 rounded-2xl transition-all flex items-center justify-center gap-2 mt-2">
                  {busy ? 'Just a sec…' : (mode==='login' ? 'Step inside' : 'Create my account')}
                  <Icon.Arrow className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"/>
                </button>
              </form>

              <p className="text-sm text-muted mt-6 text-center">
                {mode==='login' ? "First time here? " : "Already have an account? "}
                <button onClick={() => setMode(mode==='login'?'register':'login')} className="text-forest font-medium underline-offset-4 hover:underline">
                  {mode==='login' ? 'Make an account' : 'Sign in instead'}
                </button>
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ===== SETTINGS MODAL (account / password) =====
    function SettingsModal({ user, onClose, onUpdate, onLogout }) {
      const [tab, setTab] = useState('password'); // 'password' | 'profile'
      const [pwd, setPwd] = useState({ currentPassword:'', newPassword:'', confirm:'' });
      const [prof, setProf] = useState({ name: user.name, email: user.email });
      const [busy, setBusy] = useState(false);
      const [err, setErr] = useState('');
      const toast = useToast();

      const submitPwd = async (e) => {
        e.preventDefault(); setErr(''); setBusy(true);
        try {
          if (pwd.newPassword.length < 4) throw new Error('New password must be at least 4 characters');
          if (pwd.newPassword !== pwd.confirm) throw new Error('New password and confirmation do not match');
          await axios.put(`${API}/users/${user._id}/password`, {
            currentPassword: pwd.currentPassword, newPassword: pwd.newPassword
          });
          toast('Password updated', { kind:'success' });
          setPwd({ currentPassword:'', newPassword:'', confirm:'' });
        } catch (e) {
          setErr(e.response?.data?.error || e.message || 'Could not update password');
        } finally { setBusy(false); }
      };

      const submitProf = async (e) => {
        e.preventDefault(); setErr(''); setBusy(true);
        try {
          const { data } = await axios.put(`${API}/users/${user._id}`, prof);
          localStorage.setItem('user', JSON.stringify(data));
          onUpdate(data);
          toast('Profile saved', { kind:'success' });
        } catch (e) {
          setErr(e.response?.data?.error || 'Could not save profile');
        } finally { setBusy(false); }
      };

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-up" onClick={onClose}>
          <div className="bg-paper rounded-3xl shadow-lift w-full max-w-lg overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="px-7 py-5 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center text-forest"><Icon.Cog className="w-5 h-5"/></div>
                <div>
                  <div className="font-semibold text-lg leading-tight">Settings</div>
                  <div className="text-xs text-muted">Manage your account</div>
                </div>
              </div>
              <button onClick={onClose} className="text-muted hover:text-ink"><Icon.X className="w-5 h-5"/></button>
            </div>

            <div className="px-7 pt-5">
              <div className="inline-flex bg-cream rounded-full p-1 border border-line">
                {[['password','Change password'],['profile','Profile']].map(([key,label])=>(
                  <button key={key} onClick={()=>{setTab(key); setErr('');}}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${tab===key ? 'bg-forest text-cream shadow-soft' : 'text-muted hover:text-ink'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'password' && (
              <form onSubmit={submitPwd} className="px-7 py-6 space-y-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted">Current password</label>
                  <input className="field mt-1" type="password" required autoComplete="current-password"
                    value={pwd.currentPassword} onChange={e=>setPwd({...pwd, currentPassword:e.target.value})}/>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted">New password</label>
                  <input className="field mt-1" type="password" required minLength={4} autoComplete="new-password"
                    value={pwd.newPassword} onChange={e=>setPwd({...pwd, newPassword:e.target.value})}/>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted">Confirm new password</label>
                  <input className="field mt-1" type="password" required minLength={4} autoComplete="new-password"
                    value={pwd.confirm} onChange={e=>setPwd({...pwd, confirm:e.target.value})}/>
                </div>
                {err && <p className="text-terra text-sm">{err}</p>}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted">At least 4 characters.</p>
                  <button disabled={busy} className="bg-ink hover:bg-forest text-cream font-medium px-5 py-2.5 rounded-xl transition-all">
                    {busy ? 'Saving…' : 'Update password'}
                  </button>
                </div>
              </form>
            )}

            {tab === 'profile' && (
              <form onSubmit={submitProf} className="px-7 py-6 space-y-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted">Name</label>
                  <input className="field mt-1" required value={prof.name}
                    onChange={e=>setProf({...prof, name:e.target.value})}/>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted">Email</label>
                  <input className="field mt-1" type="email" required value={prof.email}
                    onChange={e=>setProf({...prof, email:e.target.value})}/>
                </div>
                {err && <p className="text-terra text-sm">{err}</p>}
                <div className="flex items-center justify-end pt-2">
                  <button disabled={busy} className="bg-ink hover:bg-forest text-cream font-medium px-5 py-2.5 rounded-xl transition-all">
                    {busy ? 'Saving…' : 'Save profile'}
                  </button>
                </div>
              </form>
            )}

            <div className="px-7 py-4 border-t border-line bg-cream/50 flex items-center justify-between">
              <span className="text-xs text-muted">Signed in as <span className="text-ink font-medium">{user.email}</span></span>
              <button onClick={onLogout} className="text-sm text-terra hover:underline flex items-center gap-1.5">
                <Icon.Logout className="w-3.5 h-3.5"/> Sign out
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ===== GROUPS SCREEN =====
    function GroupScreen({ user, onSelectGroup, onLogout, onAdmin, onSettings, onArchitecture }) {
      const [groups, setGroups] = useState([]);
      const [loading, setLoading] = useState(true);
      const [groupName, setGroupName] = useState('');
      const [joinId, setJoinId] = useState('');
      const [creating, setCreating] = useState(false);
      const [joining, setJoining] = useState(false);
      const [copied, setCopied] = useState(null);
      const toast = useToast();

      const load = async () => {
        try { const { data } = await axios.get(`${API}/groups/user/${user._id}`); setGroups(data); }
        finally { setLoading(false); }
      };
      useEffect(() => { load(); }, []);

      const create = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) return;
        await axios.post(`${API}/groups`, { groupName, userId: user._id });
        toast(`Group "${groupName}" created`, { kind:'success' });
        setGroupName(''); setCreating(false); load();
      };

      const join = async (e) => {
        e.preventDefault();
        if (!joinId.trim()) return;
        try {
          await axios.post(`${API}/groups/${joinId.trim()}/join`, { userId: user._id });
          toast('Joined group', { kind:'success' });
          setJoinId(''); setJoining(false); load();
        } catch (e) { toast(e.response?.data?.error || 'Could not join', { kind:'error' }); }
      };

      const copyId = (code, id) => {
        const value = code || id;
        navigator.clipboard.writeText(value);
        setCopied(id); toast(`Code ${value} copied`, { kind:'info' });
        setTimeout(() => setCopied(null), 1500);
      };

      const palette = ['#1F3D2C','#D97757','#7B9B7A','#5B7DB1','#B8895A','#A0524D','#4F8794','#C8993E'];
      const colorFor = (id) => palette[Array.from(String(id)).reduce((a,c)=>a+c.charCodeAt(0),0) % palette.length];
      const initials = (s) => (s||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

      return (
        <div className="min-h-screen bg-cream">
          <header className="sticky top-0 z-20 bg-cream/85 backdrop-blur border-b border-line">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-forest text-cream flex items-center justify-center"><Icon.Bag className="w-5 h-5"/></div>
                <span className="font-semibold text-lg tracking-tight">Grocery List Manager</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted">
                  <Icon.Live className="w-2 h-2 text-sage"/>
                  <span>Synced</span>
                </div>
                <div className="flex items-center gap-3 pl-3 border-l border-line">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-cream" style={{background: colorFor(user._id)}}>
                    {initials(user.name)}
                  </div>
                  <div className="hidden sm:block text-sm">
                    <div className="font-medium leading-tight">{user.name}</div>
                    <div className="text-xs text-muted">{user.email}</div>
                  </div>
                  <button onClick={onSettings} title="Settings" className="text-muted hover:text-ink transition-colors">
                    <Icon.Cog className="w-5 h-5"/>
                  </button>
                  <button onClick={onArchitecture} title="Project architecture" className="text-muted hover:text-ink transition-colors">
                    <Icon.Map className="w-5 h-5"/>
                  </button>
                  <button onClick={onAdmin} title="Admin panel" className="text-muted hover:text-ink transition-colors">
                    <Icon.Lock className="w-5 h-5"/>
                  </button>
                  <button onClick={onLogout} title="Logout" className="text-muted hover:text-terra transition-colors">
                    <Icon.Logout className="w-5 h-5"/>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-6 py-12">
            <div className="mb-12 animate-fade-up">
              <p className="text-sm uppercase tracking-[0.18em] text-terra mb-3">Your shared spaces</p>
              <h1 className="text-5xl font-semibold tracking-tight mb-3">Hi {user.name.split(' ')[0]} <span className="text-muted font-light">—</span> what are we shopping for?</h1>
              <p className="text-lg text-muted max-w-xl">Open a group below to keep adding items, or start something new with the people who share your kitchen.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-14">
              <div className="bg-forest text-cream rounded-3xl p-7 relative overflow-hidden group hover:shadow-lift transition-all">
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-sage/20"/>
                <div className="absolute -right-4 -bottom-12 w-32 h-32 rounded-full bg-terra/15"/>
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-cream/15 flex items-center justify-center mb-4">
                    <Icon.Plus className="w-5 h-5"/>
                  </div>
                  <h3 className="text-2xl font-semibold mb-1">Start a new group</h3>
                  <p className="text-cream/70 mb-5">Family, roommates, your weekend trip — give it a name.</p>
                  {creating ? (
                    <form onSubmit={create} className="flex gap-2 animate-fade-up">
                      <input autoFocus className="flex-1 bg-cream/10 border border-cream/20 rounded-xl px-4 py-3 placeholder-cream/50 outline-none focus:border-cream/60"
                        placeholder="e.g. The Patel Family" value={groupName} onChange={e=>setGroupName(e.target.value)} />
                      <button className="bg-terra hover:bg-terra/90 text-cream px-5 rounded-xl font-medium">Create</button>
                      <button type="button" onClick={()=>{setCreating(false); setGroupName('')}} className="text-cream/60 hover:text-cream px-2">✕</button>
                    </form>
                  ) : (
                    <button onClick={()=>setCreating(true)} className="bg-cream text-forest px-5 py-2.5 rounded-xl font-medium inline-flex items-center gap-2 hover:bg-butter transition-all">
                      Name a group <Icon.Arrow className="w-4 h-4"/>
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-paper border border-line rounded-3xl p-7 relative overflow-hidden hover:shadow-soft transition-all">
                <div className="w-11 h-11 rounded-xl bg-cream flex items-center justify-center mb-4 text-forest">
                  <Icon.Users className="w-5 h-5"/>
                </div>
                <h3 className="text-2xl font-semibold mb-1">Join with a code</h3>
                <p className="text-muted mb-5">Got a 6-character code from a family member? Pop it in.</p>
                {joining ? (
                  <form onSubmit={join} className="flex gap-2 animate-fade-up">
                    <input autoFocus maxLength={8} className="field flex-1 font-mono tracking-[0.3em] text-center uppercase"
                      placeholder="ABC123"
                      value={joinId} onChange={e=>setJoinId(e.target.value.toUpperCase())} />
                    <button className="bg-forest hover:bg-ink text-cream px-5 rounded-xl font-medium">Join</button>
                    <button type="button" onClick={()=>{setJoining(false); setJoinId('')}} className="text-muted hover:text-ink px-2">✕</button>
                  </form>
                ) : (
                  <button onClick={()=>setJoining(true)} className="border border-ink text-ink px-5 py-2.5 rounded-xl font-medium inline-flex items-center gap-2 hover:bg-ink hover:text-cream transition-all">
                    Enter a code <Icon.Arrow className="w-4 h-4"/>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold tracking-tight">Your groups</h2>
              <span className="text-sm text-muted">{groups.length} {groups.length===1?'group':'groups'}</span>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0,1,2].map(i => (
                  <div key={i} className="bg-paper border border-line rounded-3xl p-6">
                    <div className="skeleton w-12 h-12 rounded-2xl mb-5"/>
                    <div className="skeleton h-5 w-2/3 rounded mb-2"/>
                    <div className="skeleton h-4 w-1/3 rounded"/>
                  </div>
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="bg-paper border border-line border-dashed rounded-3xl p-16 text-center animate-fade-up">
                <div className="w-14 h-14 rounded-2xl bg-cream mx-auto flex items-center justify-center text-muted mb-4">
                  <Icon.Users className="w-6 h-6"/>
                </div>
                <p className="font-medium text-lg mb-1">No groups yet</p>
                <p className="text-muted text-sm">Create one above to start a shared shopping list.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((g, i) => {
                  const creatorName = g.createdBy?._id === user._id ? 'you' : (g.createdBy?.name || 'someone');
                  return (
                  <div key={g._id} style={{animationDelay: `${i*60}ms`}}
                    className="group bg-paper border border-line rounded-3xl p-6 hover:shadow-lift hover:-translate-y-0.5 transition-all cursor-pointer animate-pop"
                    onClick={() => onSelectGroup(g)}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-cream font-semibold text-lg" style={{background: colorFor(g._id)}}>
                        {initials(g.groupName)}
                      </div>
                      <div className="flex -space-x-2">
                        {g.members.slice(0,4).map((m,idx) => (
                          <div key={idx} title={m.name} className="w-7 h-7 rounded-full border-2 border-paper flex items-center justify-center text-[10px] font-semibold text-cream" style={{background: colorFor(m._id || String(idx))}}>
                            {initials(m.name || '?')}
                          </div>
                        ))}
                        {g.members.length > 4 && (
                          <div className="w-7 h-7 rounded-full border-2 border-paper bg-cream text-[10px] font-semibold flex items-center justify-center">+{g.members.length-4}</div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-0.5">{g.groupName}</h3>
                    <p className="text-xs text-muted mb-3">Created by {creatorName}</p>

                    <div className="bg-cream/60 rounded-xl px-3 py-2.5 mb-4">
                      <div className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-1.5">
                        Members · {g.members.length}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {g.members.slice(0,5).map((m, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 bg-paper border border-line rounded-full pl-1 pr-2.5 py-0.5 text-xs">
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-cream" style={{background: colorFor(m._id || idx)}}>
                              {initials(m.name)}
                            </span>
                            <span className="text-ink">
                              {m._id === user._id ? 'You' : (m.name || '?').split(' ')[0]}
                              {g.createdBy?._id === m._id && <span className="text-terra ml-0.5">★</span>}
                            </span>
                          </span>
                        ))}
                        {g.members.length > 5 && (
                          <span className="text-xs text-muted self-center">+{g.members.length-5} more</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-line">
                      <button onClick={(e)=>{e.stopPropagation(); copyId(g.inviteCode, g._id)}}
                        className="group/code text-xs flex items-center gap-1.5 bg-cream hover:bg-butter px-2.5 py-1.5 rounded-lg transition-all">
                        <Icon.Copy className="w-3.5 h-3.5 text-muted group-hover/code:text-ink"/>
                        <span className="font-mono font-semibold tracking-wider text-ink">
                          {copied === g._id ? 'Copied!' : (g.inviteCode || '······')}
                        </span>
                      </button>
                      <span className="text-sm font-medium text-forest flex items-center gap-1 group-hover:gap-2 transition-all">
                        Open <Icon.Arrow className="w-4 h-4"/>
                      </span>
                    </div>
                  </div>
                );})}
              </div>
            )}
          </main>
        </div>
      );
    }

    // ===== CONFETTI (tiny burst on 100%) =====
    function Confetti({ show }) {
      if (!show) return null;
      const colors = ['#D97757','#1F3D2C','#7B9B7A','#F4D58D','#5B7DB1','#A0524D'];
      const pieces = Array.from({length:40},(_,i)=>i);
      return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map(i=>{
            const left = Math.random()*100;
            const delay = Math.random()*0.3;
            const dur = 1.5 + Math.random()*1;
            const size = 6 + Math.random()*8;
            const c = colors[i % colors.length];
            const rot = Math.random()*360;
            return (
              <span key={i} style={{
                position:'absolute', left:`${left}%`, top:'-20px',
                width:`${size}px`, height:`${size*0.5}px`, background:c,
                transform:`rotate(${rot}deg)`,
                animation:`confettiFall ${dur}s cubic-bezier(0.4,0.6,0.4,1) ${delay}s forwards`
              }}/>
            );
          })}
          <style>{`@keyframes confettiFall { to { transform: translateY(110vh) rotate(720deg); opacity: 0.4; } }`}</style>
        </div>
      );
    }

    // ===== LIST SCREEN =====
    function ListScreen({ user, group, onBack }) {
      const [lists, setLists] = useState([]);
      const [activeList, setActiveList] = useState(null);
      const [items, setItems] = useState([]);
      const [newListName, setNewListName] = useState('');
      const [showNewList, setShowNewList] = useState(false);
      const [newItem, setNewItem] = useState({ name:'', category:'Other', quantity:'1' });
      const [search, setSearch] = useState('');
      const [editingId, setEditingId] = useState(null);
      const [editDraft, setEditDraft] = useState({ name:'', quantity:'1' });
      const [showConfetti, setShowConfetti] = useState(false);
      const [showMembers, setShowMembers] = useState(false);
      const celebratedRef = useRef(new Set());
      const esRef = useRef(null);
      const toast = useToast();

      const loadLists = async () => {
        const { data } = await axios.get(`${API}/lists/group/${group._id}`);
        setLists(data);
        if (!activeList && data.length > 0) setActiveList(data[0]);
        if (activeList && !data.find(l => l._id === activeList._id)) setActiveList(data[0] || null);
      };
      const loadItems = async (listId) => {
        const { data } = await axios.get(`${API}/items/list/${listId}`);
        setItems(data);
      };

      useEffect(() => { loadLists(); }, []);
      useEffect(() => { if (activeList) loadItems(activeList._id); else setItems([]); }, [activeList]);

      useEffect(() => {
        const es = new EventSource(`${API}/events`);
        esRef.current = es;
        es.onmessage = (msg) => {
          const ev = JSON.parse(msg.data);
          if (!activeList) return;
          if (ev.type === 'item:created' && ev.item.listId === activeList._id) {
            setItems(prev => prev.find(i => i._id === ev.item._id) ? prev : [...prev, ev.item]);
          }
          if (ev.type === 'item:updated' && ev.item.listId === activeList._id) {
            setItems(prev => prev.map(i => i._id === ev.item._id ? ev.item : i));
          }
          if (ev.type === 'item:deleted') {
            setItems(prev => prev.filter(i => i._id !== ev.itemId));
          }
          if (ev.type === 'list:created' || ev.type === 'list:deleted') loadLists();
          if (ev.type === 'list:updated') {
            setLists(prev => prev.map(l => l._id === ev.list._id ? ev.list : l));
            if (activeList && activeList._id === ev.list._id) setActiveList(ev.list);
          }
        };
        return () => es.close();
      }, [activeList]);

      const createList = async (e) => {
        e.preventDefault();
        if (!newListName.trim()) return;
        const { data } = await axios.post(`${API}/lists`, { groupId: group._id, name: newListName, userId: user._id });
        toast(`List "${newListName}" created`, { kind:'success' });
        setNewListName(''); setShowNewList(false);
        setActiveList(data); loadLists();
      };

      const reopenList = async () => {
        if (!activeList) return;
        try {
          const { data } = await axios.put(`${API}/lists/${activeList._id}`, { completedAt: null });
          setActiveList(data);
          setLists(prev => prev.map(l => l._id === data._id ? data : l));
          celebratedRef.current.delete(data._id);
          toast('List reopened — keep adding items', { kind:'info' });
        } catch { toast('Could not reopen list', { kind:'error' }); }
      };

      const addItem = async (e) => {
        e.preventDefault();
        if (!newItem.name.trim() || !activeList) return;
        const payload = { ...newItem, listId: activeList._id };
        const keepCat = newItem.category;
        setNewItem({ name:'', category:keepCat, quantity:'1' });
        try {
          const { data } = await axios.post(`${API}/items`, payload);
          setItems(prev => prev.find(i => i._id === data._id) ? prev : [...prev, data]);
        } catch (err) {
          toast('Could not add item — try again', { kind:'error' });
        }
      };

      const togglePurchased = async (item) => {
        const next = !item.isPurchased;
        setItems(prev => prev.map(i => i._id === item._id ? { ...i, isPurchased: next } : i));
        try { await axios.put(`${API}/items/${item._id}`, { isPurchased: next }); }
        catch { setItems(prev => prev.map(i => i._id === item._id ? { ...i, isPurchased: !next } : i)); }
      };

      const deleteItem = async (id) => {
        const snapshot = items;
        setItems(prev => prev.filter(i => i._id !== id));
        try { await axios.delete(`${API}/items/${id}`); }
        catch { setItems(snapshot); toast('Could not delete item', { kind:'error' }); }
      };

      const deleteList = async (id) => {
        if (!confirm('Delete this entire list?')) return;
        await axios.delete(`${API}/lists/${id}`);
        toast('List deleted', { kind:'info' });
        setActiveList(null); loadLists();
      };

      const startEdit = (item) => { setEditingId(item._id); setEditDraft({ name:item.name, quantity:item.quantity }); };
      const cancelEdit = () => { setEditingId(null); };
      const saveEdit = async (item) => {
        const updates = { name:editDraft.name.trim() || item.name, quantity:editDraft.quantity || item.quantity };
        setItems(prev => prev.map(i => i._id === item._id ? { ...i, ...updates } : i));
        setEditingId(null);
        try { await axios.put(`${API}/items/${item._id}`, updates); }
        catch { toast('Could not save changes', { kind:'error' }); }
      };

      const clearCompleted = async () => {
        const done = items.filter(i => i.isPurchased);
        if (done.length === 0) return;
        if (!confirm(`Clear ${done.length} completed item${done.length===1?'':'s'}?`)) return;
        setItems(prev => prev.filter(i => !i.isPurchased));
        for (const it of done) {
          try { await axios.delete(`${API}/items/${it._id}`); } catch {}
        }
        toast(`Cleared ${done.length} completed item${done.length===1?'':'s'}`, { kind:'success' });
      };

      const stats = useMemo(() => {
        const total = items.length;
        const done  = items.filter(i => i.isPurchased).length;
        const pct   = total ? Math.round((done/total)*100) : 0;
        return { total, done, pct, left:total-done };
      }, [items]);

      // celebration on 100%
      useEffect(() => {
        if (!activeList) return;
        if (stats.total > 0 && stats.done === stats.total && !celebratedRef.current.has(activeList._id)) {
          celebratedRef.current.add(activeList._id);
          setShowConfetti(true);
          toast(`Bag's full — "${activeList.name}" is done!`, { kind:'celebrate', duration:4000 });
          setTimeout(() => setShowConfetti(false), 2800);
        }
        if (stats.done < stats.total) celebratedRef.current.delete(activeList._id);
      }, [stats.total, stats.done, activeList]);

      const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? items.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)) : items;
      }, [items, search]);

      const grouped = useMemo(() => filteredItems.reduce((acc, it) => {
        (acc[it.category] = acc[it.category] || []).push(it);
        return acc;
      }, {}), [filteredItems]);

      return (
        <div className="min-h-screen bg-cream">
          <Confetti show={showConfetti}/>
          <header className="sticky top-0 z-20 bg-cream/85 backdrop-blur border-b border-line">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
              <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-ink transition-colors">
                <Icon.Back className="w-4 h-4"/>
                <span className="text-sm font-medium">Groups</span>
              </button>
              <div className="flex-1 text-center min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-muted truncate">{group.groupName}</p>
                {group.createdBy && (
                  <p className="text-[11px] text-muted/70 truncate">
                    Started by {group.createdBy._id === user._id ? 'you' : (group.createdBy.name || 'someone')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setShowMembers(s=>!s)}
                  className="flex items-center gap-1.5 bg-paper border border-line hover:bg-cream text-sm px-3 py-2 rounded-xl transition-all">
                  <Icon.Users className="w-4 h-4 text-forest"/>
                  <span className="hidden sm:inline font-medium">{(group.members||[]).length}</span>
                </button>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted">
                  <Icon.Live className="w-2 h-2 text-sage animate-pulse"/>
                  <span>Live · {user.name.split(' ')[0]}</span>
                </div>
              </div>
            </div>
            {showMembers && (
              <div className="border-t border-line bg-paper animate-fade-up">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-muted font-semibold mr-2">Members</span>
                  {(group.members||[]).map((m, idx) => {
                    const isCreator = group.createdBy?._id === m._id;
                    const isYou = m._id === user._id;
                    return (
                      <span key={idx} className="inline-flex items-center gap-2 bg-cream border border-line rounded-full pl-1 pr-3 py-1 text-sm">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-cream" style={{background: colorFor(m._id || idx)}}>
                          {initials(m.name)}
                        </span>
                        <span className="text-ink font-medium">{isYou ? 'You' : m.name}</span>
                        {isCreator && <span className="text-[10px] uppercase tracking-wider bg-butter text-ink px-1.5 py-0.5 rounded font-semibold">Creator</span>}
                      </span>
                    );
                  })}
                  {group.inviteCode && (
                    <span className="ml-auto inline-flex items-center gap-2 text-xs text-muted">
                      Invite code:
                      <code className="font-mono font-semibold text-ink bg-cream px-2 py-0.5 rounded">{group.inviteCode}</code>
                    </span>
                  )}
                </div>
              </div>
            )}
          </header>

          <main className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[280px_1fr] gap-8">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-[0.18em] text-muted font-semibold">Lists</h2>
                <button onClick={()=>setShowNewList(s=>!s)} className="w-7 h-7 rounded-lg bg-forest text-cream flex items-center justify-center hover:bg-ink transition-all">
                  <Icon.Plus className="w-4 h-4"/>
                </button>
              </div>

              {showNewList && (
                <form onSubmit={createList} className="mb-3 animate-fade-up">
                  <input autoFocus className="field text-sm" placeholder="List name…"
                    value={newListName} onChange={e=>setNewListName(e.target.value)} />
                </form>
              )}

              <div className="space-y-1.5">
                {lists.length === 0 && !showNewList && (
                  <div className="text-sm text-muted bg-paper border border-line border-dashed rounded-2xl p-5 text-center">
                    No lists yet.<br/><span className="text-xs">Tap + to add one.</span>
                  </div>
                )}
                {lists.map(l => {
                  const active = activeList?._id === l._id;
                  return (
                    <button key={l._id} onClick={()=>setActiveList(l)}
                      className={`w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center gap-3 group ${active ? 'bg-forest text-cream shadow-soft' : 'hover:bg-paper text-ink'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-cream/15' : 'bg-cream'}`}>
                        <Icon.List className="w-4 h-4"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">{l.name}</div>
                        <div className={`text-xs truncate ${active ? 'text-cream/60' : 'text-muted'}`}>
                          {new Date(l.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section>
              {activeList ? (
                <div className="animate-fade-up">
                  <div className="bg-paper rounded-3xl p-7 mb-6 border border-line">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h1 className="text-3xl font-semibold tracking-tight">{activeList.name}</h1>
                          {activeList.completedAt ? (
                            <span className="inline-flex items-center gap-1.5 bg-forest text-cream text-xs font-semibold px-2.5 py-1 rounded-full">
                              <Icon.Check className="w-3 h-3"/> Completed
                            </span>
                          ) : stats.total > 0 ? (
                            <span className="inline-flex items-center gap-1.5 bg-cream border border-line text-muted text-xs font-medium px-2.5 py-1 rounded-full">
                              <Icon.Live className="w-2 h-2 text-sage animate-pulse"/> Active
                            </span>
                          ) : null}
                        </div>
                        <div className="text-sm text-muted space-y-0.5">
                          <div>Created {new Date(activeList.createdAt).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}</div>
                          <div>Created by {activeList.createdBy?._id === user._id ? 'you' : (activeList.createdBy?.name || 'someone')}</div>
                          {activeList.completedAt && (
                            <div className="text-forest font-medium">Completed {new Date(activeList.completedAt).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {stats.done > 0 && !activeList.completedAt && (
                          <button onClick={clearCompleted} title="Clear completed"
                            className="text-xs text-muted hover:text-forest hover:bg-cream px-3 py-2 rounded-lg transition-all flex items-center gap-1.5">
                            <Icon.Check className="w-3.5 h-3.5"/> Clear done
                          </button>
                        )}
                        <button onClick={() => deleteList(activeList._id)} title="Delete list"
                          className="text-muted hover:text-terra transition-colors p-2 rounded-lg hover:bg-cream">
                          <Icon.Trash className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>

                    {stats.total > 0 && (
                      <div className="mb-5">
                        <div className="h-2 bg-cream rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-sage to-forest rounded-full transition-all duration-500" style={{width: `${stats.pct}%`}}/>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-muted">
                          <span>
                            {stats.total === 0 ? 'Empty list' :
                             stats.left === 0 ? 'All done. Time to head home.' :
                             `${stats.left} ${stats.left===1?'item':'items'} still to grab`}
                          </span>
                          <span>{stats.done}/{stats.total} · {stats.pct}%</span>
                        </div>
                      </div>
                    )}

                    {activeList.completedAt ? (
                      <div className="bg-cream border border-line rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-forest text-cream flex items-center justify-center flex-shrink-0">
                            <Icon.Lock className="w-4 h-4"/>
                          </div>
                          <div>
                            <div className="font-semibold text-ink">This list is done</div>
                            <div className="text-sm text-muted">Reopen it to add or change items.</div>
                          </div>
                        </div>
                        <button onClick={reopenList}
                          className="bg-ink hover:bg-forest text-cream font-medium px-5 py-2.5 rounded-xl inline-flex items-center justify-center gap-2 transition-all">
                          <Icon.Sparkle className="w-4 h-4"/> Reopen
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={addItem} className="grid grid-cols-12 gap-2">
                        <input className="col-span-12 sm:col-span-6 field" placeholder="What do you need? e.g. Avocados"
                          value={newItem.name} onChange={e => setNewItem({...newItem, name:e.target.value})} />
                        <input className="col-span-4 sm:col-span-2 field text-center" placeholder="Qty"
                          value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity:e.target.value})} />
                        <select className="col-span-5 sm:col-span-3 field"
                          value={newItem.category} onChange={e => setNewItem({...newItem, category:e.target.value})}>
                          {CAT_NAMES.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <button className="col-span-3 sm:col-span-1 bg-ink hover:bg-forest text-cream rounded-2xl flex items-center justify-center transition-all">
                          <Icon.Plus className="w-5 h-5"/>
                        </button>
                      </form>
                    )}
                  </div>

                  {stats.total > 0 && (
                    <div className="mb-5 relative">
                      <Icon.Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted"/>
                      <input className="field pl-11" placeholder="Search this list…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                      {search && (
                        <button onClick={()=>setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                          <Icon.X className="w-4 h-4"/>
                        </button>
                      )}
                    </div>
                  )}

                  {stats.total === 0 ? (
                    <div className="bg-paper border border-line border-dashed rounded-3xl p-16 text-center">
                      <div className="w-16 h-16 mx-auto bg-cream rounded-2xl flex items-center justify-center mb-4 text-forest">
                        <Icon.Bag className="w-7 h-7"/>
                      </div>
                      <p className="font-medium text-lg mb-1">An empty bag, full of possibility</p>
                      <p className="text-muted">Add your first item above to get the list going.</p>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="bg-paper border border-line border-dashed rounded-3xl p-12 text-center">
                      <p className="font-medium text-lg mb-1">No matches for "{search}"</p>
                      <p className="text-muted text-sm">Try a different word or clear the search.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {CAT_NAMES.filter(c => grouped[c]).map((cat, ci) => {
                        const meta = catMeta(cat);
                        const catItems = grouped[cat];
                        const catDone  = catItems.filter(i=>i.isPurchased).length;
                        return (
                          <div key={cat} style={{animationDelay:`${ci*40}ms`}} className="bg-paper border border-line rounded-3xl overflow-hidden animate-fade-up">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-line" style={{background: meta.bg + '60'}}>
                              <div className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full" style={{background: meta.color}}/>
                                <h3 className="font-semibold tracking-tight">{cat}</h3>
                                <span className="text-xs text-muted">{catItems.length} {catItems.length===1?'item':'items'}</span>
                              </div>
                              <span className="text-xs font-medium" style={{color: meta.color}}>
                                {catDone}/{catItems.length}
                              </span>
                            </div>
                            <ul>
                              {catItems.map(it => {
                                const editing = editingId === it._id;
                                return (
                                  <li key={it._id} className="group flex items-center gap-4 px-6 py-3.5 border-b border-line/60 last:border-0 hover:bg-cream/40 transition-colors">
                                    <input type="checkbox" className="pantry-check" checked={it.isPurchased}
                                      onChange={() => togglePurchased(it)} />
                                    {editing ? (
                                      <form onSubmit={(e)=>{e.preventDefault(); saveEdit(it);}} className="flex-1 flex items-center gap-2 animate-fade-up">
                                        <input autoFocus value={editDraft.name} onChange={e=>setEditDraft({...editDraft, name:e.target.value})}
                                          className="flex-1 bg-cream border border-line rounded-lg px-3 py-1.5 text-sm outline-none focus:border-forest"/>
                                        <input value={editDraft.quantity} onChange={e=>setEditDraft({...editDraft, quantity:e.target.value})}
                                          className="w-14 bg-cream border border-line rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:border-forest"/>
                                        <button type="submit" className="text-forest hover:text-ink p-1.5"><Icon.Check className="w-4 h-4"/></button>
                                        <button type="button" onClick={cancelEdit} className="text-muted hover:text-terra p-1.5"><Icon.X className="w-4 h-4"/></button>
                                      </form>
                                    ) : (
                                      <>
                                        <div className={`flex-1 min-w-0 transition-all ${it.isPurchased ? 'opacity-40' : ''}`}>
                                          <div className={`font-medium ${it.isPurchased ? 'line-through' : ''}`}>{it.name}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{background: meta.bg, color: meta.color}}>
                                            ×{it.quantity}
                                          </span>
                                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => startEdit(it)} title="Edit"
                                              className="text-muted hover:text-forest p-1.5 rounded-lg hover:bg-cream">
                                              <Icon.Edit className="w-3.5 h-3.5"/>
                                            </button>
                                            <button onClick={() => deleteItem(it._id)} title="Delete"
                                              className="text-muted hover:text-terra p-1.5 rounded-lg hover:bg-cream">
                                              <Icon.Trash className="w-3.5 h-3.5"/>
                                            </button>
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-paper border border-line border-dashed rounded-3xl p-20 text-center animate-fade-up">
                  <div className="w-16 h-16 mx-auto bg-cream rounded-2xl flex items-center justify-center mb-4 text-forest">
                    <Icon.Sparkle className="w-7 h-7"/>
                  </div>
                  <p className="font-medium text-xl mb-1">Pick a list, or start a fresh one</p>
                  <p className="text-muted">Use the + button on the left to create your first shopping list for this group.</p>
                </div>
              )}
            </section>
          </main>
        </div>
      );
    }

    // ===== ADMIN SCREEN (global admin panel) =====
    function AdminScreen({ onBack }) {
      const [pwd, setPwd] = useState(() => sessionStorage.getItem('adminPwd') || '');
      const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('adminPwd'));
      const [tab, setTab] = useState('overview'); // overview | users | groups | lists
      const [stats, setStats] = useState(null);
      const [users, setUsers] = useState([]);
      const [groups, setGroups] = useState([]);
      const [lists, setLists] = useState([]);
      const [busy, setBusy] = useState(false);
      const [err, setErr] = useState('');
      const toast = useToast();

      const headers = () => ({ headers: { 'x-admin-password': pwd } });

      const login = async (e) => {
        e.preventDefault(); setErr(''); setBusy(true);
        try {
          await axios.post(`${API}/admin/login`, { password: pwd });
          sessionStorage.setItem('adminPwd', pwd);
          setAuthed(true);
          toast('Welcome, Admin', { kind:'success' });
        } catch (e) { setErr(e.response?.data?.error || 'Could not sign in'); }
        finally { setBusy(false); }
      };

      const signOut = () => {
        sessionStorage.removeItem('adminPwd'); setPwd(''); setAuthed(false);
        setStats(null); setUsers([]); setGroups([]); setLists([]);
      };

      const loadAll = async () => {
        try {
          const [s, u, g, l] = await Promise.all([
            axios.get(`${API}/admin/stats`,  headers()),
            axios.get(`${API}/admin/users`,  headers()),
            axios.get(`${API}/admin/groups`, headers()),
            axios.get(`${API}/admin/lists`,  headers()),
          ]);
          setStats(s.data); setUsers(u.data); setGroups(g.data); setLists(l.data);
        } catch (e) {
          if (e.response?.status === 401) { signOut(); toast('Session expired', { kind:'error' }); }
          else toast('Could not load admin data', { kind:'error' });
        }
      };

      useEffect(() => { if (authed) loadAll(); }, [authed]);

      const removeUser  = async (id, name) => {
        if (!confirm(`Delete user "${name}"? This will also remove them from groups (and delete groups they were the only member of).`)) return;
        try { await axios.delete(`${API}/admin/users/${id}`, headers()); toast('User deleted', { kind:'success' }); loadAll(); }
        catch { toast('Could not delete user', { kind:'error' }); }
      };
      const removeGroup = async (id, name) => {
        if (!confirm(`Delete group "${name}" and ALL its lists & items?`)) return;
        try { await axios.delete(`${API}/admin/groups/${id}`, headers()); toast('Group deleted', { kind:'success' }); loadAll(); }
        catch { toast('Could not delete group', { kind:'error' }); }
      };
      const removeList  = async (id, name) => {
        if (!confirm(`Delete list "${name}" and all its items?`)) return;
        try { await axios.delete(`${API}/admin/lists/${id}`, headers()); toast('List deleted', { kind:'success' }); loadAll(); }
        catch { toast('Could not delete list', { kind:'error' }); }
      };

      // ----- LOGIN GATE -----
      if (!authed) {
        return (
          <div className="min-h-screen mesh flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-paper border border-line rounded-3xl p-10 shadow-lift animate-fade-up">
              <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-ink text-sm mb-8">
                <Icon.Back className="w-4 h-4"/> Back to home
              </button>
              <div className="w-14 h-14 rounded-2xl bg-ink text-cream flex items-center justify-center mb-6">
                <Icon.Lock className="w-6 h-6"/>
              </div>
              <p className="text-sm uppercase tracking-[0.18em] text-terra mb-2">Admin only</p>
              <h2 className="text-3xl font-semibold tracking-tight mb-2">Global admin panel</h2>
              <p className="text-muted mb-7">Enter the admin password to manage all users, groups and lists across Grocery List Manager.</p>
              <form onSubmit={login} className="space-y-3">
                <input className="field" type="password" placeholder="Admin password" autoFocus
                  value={pwd} onChange={e=>setPwd(e.target.value)} />
                {err && <p className="text-terra text-sm">{err}</p>}
                <button disabled={busy || !pwd} className="w-full bg-ink hover:bg-forest text-cream font-medium py-4 rounded-2xl transition-all disabled:opacity-50">
                  {busy ? 'Signing in…' : 'Open admin panel'}
                </button>
              </form>
              <p className="text-xs text-muted mt-6 text-center">Default password is <code className="bg-cream px-1.5 py-0.5 rounded">admin123</code> · change with <code className="bg-cream px-1.5 py-0.5 rounded">ADMIN_PASSWORD</code> env var.</p>
            </div>
          </div>
        );
      }

      // ----- ADMIN UI -----
      const tabs = [
        { id:'overview', label:'Overview', icon: Icon.Sparkle },
        { id:'users',    label:`Users (${users.length})`,   icon: Icon.Users },
        { id:'groups',   label:`Groups (${groups.length})`, icon: Icon.Layers },
        { id:'lists',    label:`Lists (${lists.length})`,   icon: Icon.List },
      ];

      return (
        <div className="min-h-screen bg-cream">
          <header className="sticky top-0 z-20 bg-ink text-cream border-b border-ink/20">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={onBack} className="flex items-center gap-2 text-cream/70 hover:text-cream transition-colors">
                  <Icon.Back className="w-4 h-4"/>
                  <span className="text-sm font-medium">Home</span>
                </button>
                <div className="w-px h-5 bg-cream/20"/>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-terra text-cream flex items-center justify-center"><Icon.Lock className="w-4 h-4"/></div>
                  <span className="font-semibold tracking-tight">Admin Panel</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={loadAll} className="text-xs bg-cream/10 hover:bg-cream/20 px-3 py-1.5 rounded-lg transition-all">Refresh</button>
                <button onClick={signOut} className="text-xs text-cream/70 hover:text-terra transition-colors flex items-center gap-1.5">
                  <Icon.Logout className="w-3.5 h-3.5"/> Sign out
                </button>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 overflow-x-auto">
              {tabs.map(t => (
                <button key={t.id} onClick={()=>setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${tab===t.id ? 'border-terra text-cream' : 'border-transparent text-cream/60 hover:text-cream'}`}>
                  <t.icon className="w-4 h-4"/> {t.label}
                </button>
              ))}
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 py-10">
            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div className="animate-fade-up">
                <p className="text-sm uppercase tracking-[0.18em] text-terra mb-3">System overview</p>
                <h1 className="text-4xl font-semibold tracking-tight mb-8">A bird's-eye view of the whole app.</h1>
                {stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                    {[
                      { k:'Users',           v:stats.users,          color:'#1F3D2C', bg:'#E8EFE3', icon: Icon.Users },
                      { k:'Groups',          v:stats.groups,         color:'#D97757', bg:'#F8E3D6', icon: Icon.Layers },
                      { k:'Lists',           v:stats.lists,          color:'#5B7DB1', bg:'#DEE6F2', icon: Icon.List },
                      { k:'Completed lists', v:stats.completedLists, color:'#7B9B7A', bg:'#E8EFE3', icon: Icon.Check },
                      { k:'Items',           v:stats.items,          color:'#B8895A', bg:'#F0E1CE', icon: Icon.Bag },
                    ].map((s,i)=>(
                      <div key={i} className="bg-paper border border-line rounded-3xl p-6 hover:shadow-soft transition-all">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{background:s.bg, color:s.color}}>
                          <s.icon className="w-5 h-5"/>
                        </div>
                        <div className="text-3xl font-semibold tracking-tight">{s.v}</div>
                        <div className="text-sm text-muted">{s.k}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted">Loading…</div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-paper border border-line rounded-3xl p-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><Icon.Users className="w-4 h-4 text-forest"/> Newest users</h3>
                    <ul className="text-sm divide-y divide-line">
                      {users.slice(0,5).map(u => (
                        <li key={u._id} className="py-2.5 flex items-center justify-between">
                          <span><span className="font-medium">{u.name}</span> <span className="text-muted">· {u.email}</span></span>
                          <span className="text-xs text-muted">{u.groupCount} group{u.groupCount===1?'':'s'}</span>
                        </li>
                      ))}
                      {users.length === 0 && <li className="py-3 text-muted">No users yet.</li>}
                    </ul>
                  </div>
                  <div className="bg-paper border border-line rounded-3xl p-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><Icon.List className="w-4 h-4 text-forest"/> Newest lists</h3>
                    <ul className="text-sm divide-y divide-line">
                      {lists.slice(0,5).map(l => (
                        <li key={l._id} className="py-2.5 flex items-center justify-between">
                          <span><span className="font-medium">{l.name}</span> <span className="text-muted">· {l.groupId?.groupName || '—'}</span></span>
                          <span className="text-xs text-muted">{l.itemDone}/{l.itemTotal}{l.completedAt ? ' · ✓' : ''}</span>
                        </li>
                      ))}
                      {lists.length === 0 && <li className="py-3 text-muted">No lists yet.</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* USERS */}
            {tab === 'users' && (
              <div className="animate-fade-up bg-paper border border-line rounded-3xl overflow-hidden">
                <div className="px-6 py-4 border-b border-line flex items-center justify-between">
                  <h3 className="font-semibold">All users</h3>
                  <span className="text-xs text-muted">{users.length} total</span>
                </div>
                {users.length === 0 ? (
                  <div className="p-10 text-center text-muted">No users yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs uppercase tracking-wider text-muted bg-cream/40">
                        <tr><th className="px-6 py-3 text-left">Name</th><th className="px-6 py-3 text-left">Email</th><th className="px-6 py-3 text-left">Groups</th><th className="px-6 py-3 text-right">Actions</th></tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u._id} className="border-t border-line/60 hover:bg-cream/30">
                            <td className="px-6 py-3.5 flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-cream" style={{background:colorFor(u._id)}}>{initials(u.name)}</span>
                              <span className="font-medium">{u.name}</span>
                            </td>
                            <td className="px-6 py-3.5 text-muted">{u.email}</td>
                            <td className="px-6 py-3.5">{u.groupCount}</td>
                            <td className="px-6 py-3.5 text-right">
                              <button onClick={()=>removeUser(u._id, u.name)} className="text-terra hover:bg-terra/10 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 text-xs font-medium">
                                <Icon.Trash className="w-3.5 h-3.5"/> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* GROUPS */}
            {tab === 'groups' && (
              <div className="animate-fade-up grid md:grid-cols-2 gap-4">
                {groups.length === 0 && <div className="md:col-span-2 bg-paper border border-line border-dashed rounded-3xl p-10 text-center text-muted">No groups yet.</div>}
                {groups.map(g => (
                  <div key={g._id} className="bg-paper border border-line rounded-3xl p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{g.groupName}</h3>
                        <p className="text-xs text-muted">Code <span className="font-mono">{g.inviteCode || '—'}</span> · created by {g.createdBy?.name || '—'} · {fmtDate(g.createdAt)}</p>
                      </div>
                      <button onClick={()=>removeGroup(g._id, g.groupName)} className="text-terra hover:bg-terra/10 p-2 rounded-lg" title="Delete group">
                        <Icon.Trash className="w-4 h-4"/>
                      </button>
                    </div>
                    <div className="text-xs text-muted uppercase tracking-wider mb-2">Members ({g.members.length})</div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {g.members.map((m, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 bg-cream rounded-full pl-1 pr-2.5 py-0.5 text-xs">
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-cream" style={{background:colorFor(m._id || i)}}>{initials(m.name)}</span>
                          {m.name}
                          {g.createdBy?._id === m._id && <span className="text-terra">★</span>}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-muted">{g.listCount} list{g.listCount===1?'':'s'}</div>
                  </div>
                ))}
              </div>
            )}

            {/* LISTS */}
            {tab === 'lists' && (
              <div className="animate-fade-up bg-paper border border-line rounded-3xl overflow-hidden">
                <div className="px-6 py-4 border-b border-line flex items-center justify-between">
                  <h3 className="font-semibold">All lists</h3>
                  <span className="text-xs text-muted">{lists.length} total</span>
                </div>
                {lists.length === 0 ? (
                  <div className="p-10 text-center text-muted">No lists yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs uppercase tracking-wider text-muted bg-cream/40">
                        <tr>
                          <th className="px-6 py-3 text-left">List</th>
                          <th className="px-6 py-3 text-left">Group</th>
                          <th className="px-6 py-3 text-left">Created by</th>
                          <th className="px-6 py-3 text-left">Created</th>
                          <th className="px-6 py-3 text-left">Status</th>
                          <th className="px-6 py-3 text-left">Items</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lists.map(l => (
                          <tr key={l._id} className="border-t border-line/60 hover:bg-cream/30">
                            <td className="px-6 py-3.5 font-medium">{l.name}</td>
                            <td className="px-6 py-3.5 text-muted">{l.groupId?.groupName || '—'}</td>
                            <td className="px-6 py-3.5 text-muted">{l.createdBy?.name || '—'}</td>
                            <td className="px-6 py-3.5 text-muted">{fmtDate(l.createdAt)}</td>
                            <td className="px-6 py-3.5">
                              {l.completedAt
                                ? <span className="bg-forest text-cream text-[10px] font-semibold px-2 py-0.5 rounded-full">Completed</span>
                                : <span className="bg-cream text-muted text-[10px] font-semibold px-2 py-0.5 rounded-full">Active</span>}
                            </td>
                            <td className="px-6 py-3.5">{l.itemDone}/{l.itemTotal}</td>
                            <td className="px-6 py-3.5 text-right">
                              <button onClick={()=>removeList(l._id, l.name)} className="text-terra hover:bg-terra/10 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 text-xs font-medium">
                                <Icon.Trash className="w-3.5 h-3.5"/> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      );
    }

    // ===== ARCHITECTURE SCREEN =====
    function ArchitectureScreen({ onBack }) {
      const [data, setData] = useState(null);
      const [err, setErr]   = useState(null);
      useEffect(() => {
        axios.get('/api/architecture').then(r => setData(r.data)).catch(e => setErr(e.message));
      }, []);

      function FileNode({ node, depth }) {
        const [open, setOpen] = useState(true);
        const pad = { paddingLeft: `${depth * 18}px` };
        if (node.type === 'folder') {
          return (
            <div>
              <div style={pad} className="flex items-start gap-2 py-1 hover:bg-cream-dark/40 rounded cursor-pointer" onClick={() => setOpen(o => !o)}>
                <Icon.Folder className="w-4 h-4 mt-0.5 text-terra flex-shrink-0"/>
                <div className="min-w-0">
                  <div className="font-mono text-sm font-semibold text-ink">{node.name}/</div>
                  {node.desc && <div className="text-xs text-muted">{node.desc}</div>}
                </div>
              </div>
              {open && node.children && node.children.map((c, i) => <FileNode key={i} node={c} depth={depth + 1} />)}
            </div>
          );
        }
        return (
          <div style={pad} className="flex items-start gap-2 py-1">
            <Icon.File className="w-4 h-4 mt-0.5 text-muted flex-shrink-0"/>
            <div className="min-w-0">
              <div className="font-mono text-sm text-ink">{node.name}</div>
              {node.desc && <div className="text-xs text-muted">{node.desc}</div>}
            </div>
          </div>
        );
      }

      if (err)  return <div className="min-h-screen flex items-center justify-center text-terra">Error: {err}</div>;
      if (!data) return <div className="min-h-screen flex items-center justify-center text-muted">Loading architecture…</div>;

      const methodColor = { GET: 'bg-sage/20 text-forest', POST: 'bg-butter/30 text-ink', PUT: 'bg-sky-100 text-sky-700', DELETE: 'bg-terra/20 text-terra' };

      return (
        <div className="min-h-screen bg-cream">
          <header className="border-b border-line bg-cream/95 backdrop-blur sticky top-0 z-30">
            <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
              <button onClick={onBack} className="text-muted hover:text-ink flex items-center gap-2 text-sm">
                <Icon.Back className="w-4 h-4"/> Back
              </button>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-widest text-muted">Project Architecture</div>
                <h1 className="text-2xl font-display text-ink">{data.title}</h1>
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">

            <section>
              <h2 className="text-xl font-display text-ink mb-4">Three-tier architecture</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { tier: 'Frontend',  color: 'bg-butter/40',  techs: data.stack.frontend, desc: 'Renders the UI in the browser. Talks to backend over HTTP + SSE.' },
                  { tier: 'Backend',   color: 'bg-sage/30',    techs: data.stack.backend.concat(data.stack.realtime), desc: 'Express handles REST endpoints and pushes real-time updates.' },
                  { tier: 'Database',  color: 'bg-terra/15',   techs: data.stack.database, desc: 'Stores users, groups, lists, items in MongoDB Atlas.' },
                ].map((t, i) => (
                  <div key={i} className={`${t.color} rounded-3xl p-6 border border-line`}>
                    <div className="text-xs uppercase tracking-widest text-muted">Layer {i+1}</div>
                    <div className="text-lg font-semibold text-ink mb-2">{t.tier}</div>
                    <p className="text-sm text-muted mb-3">{t.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.techs.map((x, j) => <span key={j} className="text-xs bg-cream/80 text-ink rounded-full px-2.5 py-1 border border-line">{x}</span>)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-sm text-muted font-mono">
                Browser  ─[HTTP / SSE]─►  Express  ─[Mongoose]─►  MongoDB Atlas
              </div>
            </section>

            <section>
              <h2 className="text-xl font-display text-ink mb-2">Folder structure</h2>
              <p className="text-sm text-muted mb-4">Click any folder to expand or collapse it. Each file’s job is described below its name.</p>
              <div className="bg-cream-light rounded-3xl border border-line p-5">
                {data.tree.map((n, i) => <FileNode key={i} node={n} depth={0} />)}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-display text-ink mb-4">Database collections (MongoDB)</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {data.collections.map(c => (
                  <div key={c.name} className="bg-cream-light rounded-3xl border border-line p-5">
                    <div className="font-display text-lg text-ink mb-3">{c.name}</div>
                    <div className="space-y-1">
                      {c.fields.map(f => (
                        <div key={f.name} className="flex justify-between text-sm border-b border-line/60 last:border-0 py-1.5">
                          <span className="font-mono text-ink">{f.name}</span>
                          <span className="font-mono text-xs text-muted">{f.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-display text-ink mb-4">REST API endpoints</h2>
              <div className="space-y-5">
                {data.endpoints.map(grp => (
                  <div key={grp.group} className="bg-cream-light rounded-3xl border border-line p-5">
                    <div className="text-xs uppercase tracking-widest text-muted mb-3">{grp.group}</div>
                    <div className="space-y-2">
                      {grp.items.map((e, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-3 text-sm">
                          <span className={`${methodColor[e.method] || 'bg-line text-ink'} font-mono text-xs px-2 py-0.5 rounded font-semibold`}>{e.method}</span>
                          <span className="font-mono text-ink">{e.path}</span>
                          <span className="text-muted text-xs">— {e.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-display text-ink mb-4">Features (vs project spec)</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {data.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 bg-cream-light border border-line rounded-2xl px-4 py-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${f.done ? 'bg-forest text-cream' : 'bg-line text-muted'}`}>
                      {f.done ? <Icon.Check className="w-3 h-3"/> : <Icon.X className="w-3 h-3"/>}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink">{f.title}</div>
                      <div className="text-xs text-muted">{f.ref}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-display text-ink mb-4">How a request travels through the system</h2>
              <ol className="space-y-2 text-sm text-ink list-decimal pl-5">
                <li>You click a button in <span className="font-mono">client/index.html</span> (React).</li>
                <li>React calls <span className="font-mono">axios</span> → hits an Express route in <span className="font-mono">server/routes/*.js</span>.</li>
                <li>The route uses a Mongoose model in <span className="font-mono">server/models/*.js</span> to read or write MongoDB.</li>
                <li>For item / list changes, the route calls <span className="font-mono">broadcast()</span> from <span className="font-mono">server/utils/sse.js</span>.</li>
                <li>Every other browser open on the same list receives the change instantly through <span className="font-mono">/api/events</span>.</li>
              </ol>
            </section>

          </main>
        </div>
      );
    }

    // ===== ROOT =====
    function App() {
      const [user, setUser] = useState(() => {
        try {
          const u = JSON.parse(localStorage.getItem('user'));
          const t = localStorage.getItem('token');
          if (u && !t) { localStorage.removeItem('user'); return null; }
          return u;
        } catch { return null; }
      });
      const [group, setGroup] = useState(null);
      const [view, setView] = useState(user ? 'app' : 'landing'); // landing | auth | app | admin | architecture
      const [showSettings, setShowSettings] = useState(false);

      const logout = () => { localStorage.removeItem('user'); localStorage.removeItem('token'); setUser(null); setGroup(null); setShowSettings(false); setView('landing'); };
      const handleLogin = (u) => { setUser(u); setView('app'); };

      const settingsModal = (showSettings && user) ? (
        <SettingsModal user={user} onClose={() => setShowSettings(false)}
          onUpdate={(u) => setUser(u)} onLogout={logout} />
      ) : null;

      if (view === 'architecture') return <ArchitectureScreen onBack={() => setView(user ? 'app' : 'landing')} />;
      if (view === 'admin') return <><AdminScreen onBack={() => setView(user ? 'app' : 'landing')} />{settingsModal}</>;

      if (!user) {
        if (view === 'landing') return <Landing onStart={() => setView('auth')} onAdmin={() => setView('admin')} onArchitecture={() => setView('architecture')} />;
        return <AuthScreen onLogin={handleLogin} onBack={() => setView('landing')} />;
      }
      if (!group) return <>
        <GroupScreen user={user} onSelectGroup={setGroup} onLogout={logout}
          onAdmin={() => setView('admin')} onSettings={() => setShowSettings(true)}
          onArchitecture={() => setView('architecture')} />
        {settingsModal}
      </>;
      return <>
        <ListScreen user={user} group={group} onBack={() => setGroup(null)} />
        {settingsModal}
      </>;
    }

    export default function Root() { return <ToastProvider><App /></ToastProvider>; }
  