// shell.jsx — Phone app shell: status bar, tab bar, container
// Provides the iPhone frame + bottom tabs for the main app. Modal screens
// (study modes, word detail, etc.) take over the whole frame.

function PhoneShell({ children }) {
  return (
    <div style={{
      width: 320, height: 690, borderRadius: 44,
      background: '#000', padding: 4, position: 'relative',
      boxShadow: '0 30px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: 'var(--font-body-cn)',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden',
        background: 'var(--c-bg)', position: 'relative',
      }}>
        {/* dynamic island */}
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: 100, height: 28, borderRadius: 20, background: '#000', zIndex: 60,
        }}/>
        {/* status bar */}
        <PhoneStatusBar/>
        {children}
        <Toast/>
        {/* home indicator */}
        <div style={{
          position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
          width: 110, height: 4, borderRadius: 999, background: 'rgba(0,0,0,0.3)', zIndex: 70,
        }}/>
      </div>
    </div>
  );
}

function PhoneStatusBar() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 46, zIndex: 50,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 24px', color: 'var(--c-ink)', fontFamily: '"SF Pro", system-ui',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>9:41</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <svg width="15" height="10" viewBox="0 0 15 10"><rect x="0" y="6" width="2.4" height="4" rx="0.6" fill="currentColor"/><rect x="3.8" y="4" width="2.4" height="6" rx="0.6" fill="currentColor"/><rect x="7.6" y="2" width="2.4" height="8" rx="0.6" fill="currentColor"/><rect x="11.4" y="0" width="2.4" height="10" rx="0.6" fill="currentColor"/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="19" height="10" rx="3" stroke="currentColor" fill="none"/><rect x="2" y="2" width="16" height="7" rx="1.6" fill="currentColor"/></svg>
      </div>
    </div>
  );
}

// Phone bottom tab bar — wired to router
function PhoneTabBar() {
  const r = useRouter();
  const items = [
    { id: '/home', label: '学习', icon: Icon.home },
    { id: '/review', label: '复习', icon: Icon.brain },
    { id: '/rank', label: '排行', icon: Icon.trophy },
    { id: '/me', label: '我的', icon: Icon.user },
  ];
  // Only show on tabbed routes
  const isTabRoute = items.some(i => i.id === r.route);
  if (!isTabRoute) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 72,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--c-line)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start',
      paddingTop: 10, zIndex: 40,
    }}>
      {items.map(it => {
        const on = it.id === r.route;
        return (
          <button key={it.id} onClick={() => r.navigate(it.id)} style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: on ? 'var(--c-primary)' : 'var(--c-ink-muted)', padding: '4px 12px',
            transition: 'transform .15s var(--ease)',
            transform: on ? 'scale(1.05)' : 'scale(1)',
          }}>
            <it.icon s={24}/>
            <span style={{ fontSize: 10, fontWeight: on ? 700 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Generic full-screen scroll body that respects the safe areas
function PhoneBody({ children, padded = true, scroll = true, withTabBar = true, bg = 'var(--c-bg)' }) {
  return (
    <div className={scroll ? 'aibd-scroll' : ''} style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: withTabBar ? 72 : 0,
      overflow: scroll ? 'auto' : 'hidden',
      background: bg, padding: padded ? '46px 0 0' : 0,
    }}>{children}</div>
  );
}

// Header bar used inside non-tab screens (back arrow + title)
function PhoneHeader({ title, onBack, right }) {
  const r = useRouter();
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 88,
      paddingTop: 46, padding: '46px 16px 0',
      display: 'flex', alignItems: 'center', gap: 8, zIndex: 30,
      background: 'transparent',
    }}>
      <button onClick={onBack || (() => r.navigate('/home'))} style={{
        width: 32, height: 32, border: 'none', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)',
        borderRadius: '50%', cursor: 'pointer', color: 'var(--c-ink)',
        display: 'grid', placeItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
      }}>
        <Icon.chevronL s={18}/>
      </button>
      <div className="aibd-display" style={{ flex: 1, fontSize: 16, color: 'var(--c-ink)' }}>{title}</div>
      {right}
    </div>
  );
}

Object.assign(window, { PhoneShell, PhoneTabBar, PhoneBody, PhoneHeader, PhoneStatusBar });
