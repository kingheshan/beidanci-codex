// store.jsx — global app state + router
// Centralized store for XP, hearts, streak, gems, current study session, etc.
// Plus a hash-based router (#/route/path).

// ─── Router ──────────────────────────────────────────────────
const RouterCtx = React.createContext(null);

function RouterProvider({ children, root = '/home' }) {
  // We use a simple ?screen= query in hash so nested apps can have independent
  // routers within the same page.
  const [route, setRoute] = React.useState(root);
  const navigate = React.useCallback((to) => {
    setRoute(to);
  }, []);
  return (
    <RouterCtx.Provider value={{ route, navigate }}>
      {children}
    </RouterCtx.Provider>
  );
}

function useRouter() { return React.useContext(RouterCtx); }

function Route({ path, children }) {
  const r = useRouter();
  if (r.route !== path) return null;
  return children;
}

// ─── App store ───────────────────────────────────────────────
const StoreCtx = React.createContext(null);

function StoreProvider({ children, seed = {} }) {
  const [state, setState] = React.useState({
    xp: 820,
    hearts: 4,
    streak: 28,
    gems: 1280,
    level: 23,
    masteredCount: 1284,
    bookTotal: 1600,
    bookName: '中考核心 1600',
    // study session state
    session: null,
    // toast
    toast: null,
    ...seed,
  });

  const update = React.useCallback((patch) => {
    setState(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  const award = React.useCallback(({ xp = 0, gems = 0, hearts = 0 } = {}) => {
    setState(prev => ({
      ...prev,
      xp: prev.xp + xp,
      gems: prev.gems + gems,
      hearts: Math.max(0, Math.min(5, prev.hearts + hearts)),
    }));
  }, []);

  const toast = React.useCallback((message, kind = 'info', duration = 1800) => {
    const id = Date.now();
    setState(prev => ({ ...prev, toast: { id, message, kind } }));
    setTimeout(() => {
      setState(prev => prev.toast && prev.toast.id === id ? { ...prev, toast: null } : prev);
    }, duration);
  }, []);

  return (
    <StoreCtx.Provider value={{ state, update, award, toast }}>
      {children}
    </StoreCtx.Provider>
  );
}

function useStore() { return React.useContext(StoreCtx); }

// ─── Toast component ─────────────────────────────────────────
function Toast() {
  const { state } = useStore();
  if (!state.toast) return null;
  const { message, kind } = state.toast;
  const colors = {
    info: { bg: 'var(--c-ink)', color: '#fff' },
    success: { bg: 'var(--c-success)', color: '#fff' },
    warning: { bg: 'var(--c-warning)', color: '#fff' },
    danger: { bg: 'var(--c-danger)', color: '#fff' },
  }[kind] || {};
  return (
    <div style={{
      position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
      padding: '10px 16px', borderRadius: 999,
      background: colors.bg, color: colors.color,
      fontSize: 12, fontWeight: 700,
      boxShadow: 'var(--sh-pop)', zIndex: 100,
      animation: 'toastIn .3s var(--ease)',
      whiteSpace: 'nowrap',
    }}>{message}</div>
  );
}

// global keyframes (injected once)
if (typeof document !== 'undefined' && !document.getElementById('aibd-keyframes')) {
  const s = document.createElement('style');
  s.id = 'aibd-keyframes';
  s.textContent = `
    @keyframes toastIn { from { opacity:0; transform:translate(-50%,-10px); } to { opacity:1; transform:translate(-50%,0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideRight { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
    @keyframes pop { 0% { transform:scale(0.6); opacity:0; } 60% { transform:scale(1.08); } 100% { transform:scale(1); opacity:1; } }
    @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
    @keyframes wiggle { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-4px); } 75% { transform:translateX(4px); } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 0 0 var(--c-primary); } 50% { box-shadow: 0 0 0 12px transparent; } }
    @keyframes confettiFall {
      0% { transform: translateY(-20px) rotate(0); opacity:1; }
      100% { transform: translateY(400px) rotate(720deg); opacity:0; }
    }
    @keyframes shake { 0%,100% { transform:translateX(0); } 20%,60% { transform:translateX(-6px); } 40%,80% { transform:translateX(6px); } }
    @keyframes fillProgress { from { width: 0%; } }
    @keyframes ringRotate { from { transform:rotate(0); } to { transform:rotate(360deg); } }
    @keyframes wave { 0%,100% { transform:scaleY(0.4); } 50% { transform:scaleY(1); } }
    @keyframes flipCard { 0% { transform:rotateY(0); } 50% { transform:rotateY(90deg); } 100% { transform:rotateY(0); } }
    @keyframes drift { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
    .aibd-anim-pop { animation: pop .35s var(--ease); }
    .aibd-anim-shake { animation: shake .45s var(--ease); }
    .aibd-anim-slideUp { animation: slideUp .35s var(--ease); }
    .aibd-anim-drift { animation: drift 3s ease-in-out infinite; }
    button { font-family: inherit; }
    button:active:not(:disabled) { transform: translateY(1px); }
  `;
  document.head.appendChild(s);
}

Object.assign(window, {
  RouterProvider, useRouter, Route,
  StoreProvider, useStore, Toast,
});
