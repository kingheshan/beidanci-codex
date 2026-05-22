// web-app.jsx — Production-level Web app
// Sidebar + multi-page layout: Dashboard / Study / Review / Dictionary /
// Leaderboard / Profile / Settings + a Study session overlay that uses the
// same study mode components from the phone app.

function WebApp() {
  return (
    <div style={{
      width: 1280, height: 800, background: 'var(--c-bg)', borderRadius: 12, overflow: 'hidden',
      fontFamily: 'var(--font-body-cn)', color: 'var(--c-ink)',
      boxShadow: 'var(--sh-card)', display: 'flex',
    }}>
      <RouterProvider root="/dashboard">
        <StoreProvider>
          <WebShell/>
        </StoreProvider>
      </RouterProvider>
    </div>
  );
}

function WebShell() {
  const r = useRouter();
  // study session overlay state
  const [studySession, setStudySession] = React.useState(null); // { mode, words }
  const [results, setResults] = React.useState(null);

  return (
    <>
      <WebSidebar/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <WebTopBar onStudy={(mode) => setStudySession({ mode, words: WORDS.slice(0, 5) })}/>
        <div className="aibd-scroll" style={{ flex: 1, overflow: 'auto' }}>
          {r.route === '/dashboard' && <WebDashboard onStudy={(mode) => setStudySession({ mode, words: WORDS.slice(0, 5) })}/>}
          {r.route === '/study' && <WebStudyHub onPick={(mode) => setStudySession({ mode, words: WORDS.slice(0, 5) })}/>}
          {r.route === '/review' && <WebReview onStudy={() => setStudySession({ mode: 'mc', words: WORDS })}/>}
          {r.route === '/dictionary' && <WebDictionary/>}
          {r.route.startsWith('/word/') && <WebWordDetail wordId={r.route.replace('/word/','')}/>}
          {r.route === '/leaderboard' && <WebLeaderboard/>}
          {r.route === '/mistakes' && <WebMistakes/>}
          {r.route === '/camera' && <WebCamera/>}
          {r.route === '/pro' && <WebPaywall/>}
          {r.route === '/pk' && <WebPK/>}
          {r.route === '/story' && <WebStory/>}
          {r.route === '/me' && <WebProfile/>}
          {r.route === '/settings' && <WebSettings/>}
        </div>
        <Toast/>
      </div>

      {/* Study overlay */}
      {studySession && (
        <WebStudyOverlay
          mode={studySession.mode}
          words={studySession.words}
          onClose={() => { setStudySession(null); setResults(null); }}
          onDone={(rs) => { setResults(rs); }}
          results={results}
        />
      )}
    </>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────
function WebSidebar() {
  const r = useRouter();
  const { state } = useStore();
  const sections = [
    { id: '/dashboard', l: '今日学习', icon: Icon.home },
    { id: '/study', l: '刷词模式', icon: Icon.zap },
    { id: '/review', l: '智能复习', icon: Icon.brain, badge: '14' },
    { id: '/mistakes', l: '错题本', icon: Icon.heart, badge: '5' },
    { id: '/dictionary', l: '我的词书', icon: Icon.book },
    { id: '/camera', l: '拍照查词', icon: Icon.camera },
  ];
  const ai = [
    { id: '/story', l: 'AI 每日故事', icon: Icon.sparkle, hot: true },
    { id: '/pk', l: '单词 PK', icon: Icon.swords },
    { id: '/pro', l: '升级 PRO', icon: Icon.star, gold: true },
  ];
  const personal = [
    { id: '/leaderboard', l: '排行榜', icon: Icon.trophy },
    { id: '/me', l: '个人主页', icon: Icon.user },
    { id: '/settings', l: '设置', icon: Icon.filter },
  ];

  const NavBlock = ({ items, label }) => (
    <>
      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '0.1em', padding: '12px 14px 6px' }}>{label}</div>
      {items.map(it => {
        const on = r.route === it.id || (it.id === '/dictionary' && r.route.startsWith('/word/'));
        return (
          <button key={it.id} onClick={() => r.navigate(it.id)} style={{
            width: '100%', padding: '10px 14px', borderRadius: 10,
            background: on ? 'var(--c-primary-soft)' : 'transparent',
            color: on ? 'var(--c-primary)' : 'var(--c-ink-soft)',
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            fontWeight: on ? 700 : 500, border: 'none', textAlign: 'left',
            position: 'relative',
          }}>
            <it.icon s={18}/>
            <span style={{ flex: 1, fontSize: 13 }}>{it.l}</span>
            {it.badge && <Tag color={on ? 'var(--c-primary)' : 'var(--c-ink-muted)'} bg={on ? '#fff' : 'var(--c-bg-deep)'} size="xs">{it.badge}</Tag>}
            {it.hot && <div style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--c-coral)' }}/>}
            {it.gold && <div style={{ fontSize: 12 }}>👑</div>}
          </button>
        );
      })}
    </>
  );

  return (
    <div style={{ width: 240, background: '#fff', borderRight: '1px solid var(--c-line)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 36, height: 36 }}>
          <Wordy size={36} pose="wave" mood="happy" glow={false}/>
        </div>
        <div>
          <div className="aibd-display" style={{ fontSize: 16, lineHeight: 1 }}>爱上背单词</div>
          <div style={{ fontSize: 9, color: 'var(--c-ink-muted)' }}>AI · K12</div>
        </div>
      </div>

      <div style={{ padding: '0 8px', flex: 1, overflow: 'auto' }} className="aibd-scroll">
        <NavBlock items={sections} label="学习"/>
        <NavBlock items={ai} label="AI 工具"/>
        <NavBlock items={personal} label="个人"/>
      </div>

      <div style={{ padding: 12 }}>
        <div style={{ padding: 12, background: 'linear-gradient(135deg, var(--c-primary-soft), #fff)', borderRadius: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: 10, color: 'var(--c-primary)', fontWeight: 800, letterSpacing: '0.06em' }}>PRO 会员</div>
          <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 2, lineHeight: 1.4 }}>解锁全部 AI 故事 + 拍照查词</div>
          <button style={{ height: 28, padding: '0 12px', background: 'var(--c-primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 800, marginTop: 8, cursor: 'pointer' }}>查看权益</button>
          <div style={{ position: 'absolute', right: -10, bottom: -16, opacity: 0.5 }}>
            <Wordy size={44} pose="idle" form="rocket"/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Top bar ─────────────────────────────────────────────────
function WebTopBar({ onStudy }) {
  const { state } = useStore();
  return (
    <div style={{
      height: 60, padding: '0 24px', borderBottom: '1px solid var(--c-line)',
      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
        <input type="text" placeholder="搜索单词、词根、例句..." style={{
          width: '100%', height: 36, paddingLeft: 36, paddingRight: 12,
          background: 'var(--c-bg)', border: '1px solid var(--c-line)',
          borderRadius: 10, fontSize: 13, color: 'var(--c-ink)', outline: 'none',
        }}/>
        <svg style={{ position: 'absolute', left: 10, top: 9 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-ink-muted)" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4" strokeLinecap="round"/></svg>
      </div>
      <div style={{ flex: 1 }}/>
      <StreakChip days={state.streak}/>
      <GemPill count={state.gems}/>
      <button onClick={() => onStudy('mc')} style={{
        height: 36, padding: '0 18px', background: 'var(--c-primary)', color: '#fff',
        border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: 'var(--sh-cta)',
      }}>
        <Icon.zap s={16} fill="#fff"/> 开始学习
      </button>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────
function WebDashboard({ onStudy }) {
  const r = useRouter();
  const { state } = useStore();
  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--c-ink-muted)', fontWeight: 600 }}>2026 · 5 · 18 · 周一</div>
          <div className="aibd-display" style={{ fontSize: 30, marginTop: 4 }}>下午好，小敏 <span style={{ color: 'var(--c-primary)' }}>✨</span></div>
        </div>
      </div>

      {/* hero */}
      <div style={{
        padding: 28, borderRadius: 22, marginBottom: 18, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-deep) 60%, #1A1340 100%)',
        color: '#fff', display: 'flex', alignItems: 'center', gap: 20, minHeight: 200,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 800, letterSpacing: '0.08em' }}>UNIT 3 · 校园生活</div>
          <div className="aibd-display" style={{ fontSize: 32, lineHeight: 1.1, marginTop: 4 }}>今天的旅程开始啦</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6, maxWidth: 360 }}>20 个新词 + 14 个复习。预计 12 分钟，完成后 Wordy 会进化形态。</div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button onClick={() => onStudy('mc')} style={{ height: 42, padding: '0 20px', background: '#fff', color: 'var(--c-primary)', border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              开始今日学习 <Icon.chevronR s={14}/>
            </button>
            <button onClick={() => r.navigate('/story')} style={{ height: 42, padding: '0 20px', background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              只看 AI 故事
            </button>
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ProgressBar value={0.6} height={6} color="var(--c-accent)" bg="rgba(255,255,255,0.18)"/>
            <span className="aibd-mono" style={{ fontSize: 11, opacity: 0.85, flexShrink: 0 }}>12 / 20</span>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Wordy size={180} pose="study" mood="happy"/>
        </div>
      </div>

      {/* 4 stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
        <WebTile label="今日新词" value="8" sub="还差 12 个" color="var(--c-pink)" icon={<Icon.zap s={16}/>}/>
        <WebTile label="待复习" value="14" sub="3 个生疏" color="var(--c-warning)" icon={<Icon.brain s={16}/>}/>
        <WebTile label="本周 XP" value="1.2k" sub="↑ 12%" color="var(--c-primary)" icon={<Icon.chart s={16}/>}/>
        <WebTile label="掌握度" value="74%" sub="中考核心" color="var(--c-success)" icon={<Icon.check s={16}/>}/>
      </div>

      {/* 2-col body */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
        <Card pad={22}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <div className="aibd-display" style={{ fontSize: 17 }}>学习路径 · 第 3 单元</div>
            <button onClick={() => r.navigate('/dictionary')} style={{ fontSize: 11, color: 'var(--c-primary)', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer' }}>切换词书 ›</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0' }}>
            {LESSONS.map((L, i) => {
              const icon = L.type === 'intro' ? <Icon.check s={20}/> :
                L.type === 'level' ? <Icon.star s={22} fill="#fff"/> :
                L.type === 'context' ? <Icon.zap s={24} fill="#fff"/> :
                L.type === 'listen' ? <Icon.mic s={20}/> :
                <Icon.trophy s={22}/>;
              return (
                <React.Fragment key={L.id}>
                  <LessonNode state={L.state} icon={icon} label={L.title}/>
                  {i < LESSONS.length - 1 && (
                    <div style={{ flex: 1, height: 3, background: LESSONS[i+1].state === 'locked' || L.state === 'locked' ? 'var(--c-line)' : 'var(--c-success)', borderRadius: 999 }}/>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button onClick={() => r.navigate('/study')} style={{ flex: 1, height: 40, padding: '0 14px', background: 'var(--c-primary-soft)', color: 'var(--c-primary)', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
              所有刷词模式
            </button>
          </div>
        </Card>

        <Card pad={22} style={{ background: 'linear-gradient(135deg, var(--c-coral) 0%, var(--c-pink) 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <Tag color="#fff" bg="rgba(255,255,255,0.25)"><Icon.sparkle s={10}/> AI · 今日新生成</Tag>
          <div className="aibd-display" style={{ fontSize: 22, marginTop: 10 }}>The Persistent Bookworm</div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4, lineHeight: 1.5, maxWidth: 220 }}>
            把今天复习的 12 个词编成校园故事，听 + 读双形态。
          </div>
          <CTA color="#fff" textColor="var(--c-coral)" size="sm" full={false} style={{ marginTop: 14 }} onClick={() => r.navigate('/story')}>
            <Icon.speaker s={14}/> 开始
          </CTA>
          <div style={{ position: 'absolute', right: -10, bottom: -16, fontSize: 80, opacity: 0.25 }}>📚</div>
        </Card>
      </div>

      {/* AI lab strip */}
      <div style={{ marginTop: 18 }}>
        <div className="aibd-display" style={{ fontSize: 17, marginBottom: 10 }}>AI 实验室</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <AILab title="单词 PK" sub="2 分钟实时对战" icon="⚔️" onClick={() => r.navigate('/pk')} color="var(--c-pink)"/>
          <AILab title="记忆星云" sub="错词关联图谱" icon="🧠" onClick={() => r.navigate('/word/w1')} color="var(--c-primary)"/>
          <AILab title="拍照查词" sub="OCR + AI 圈词" icon="📷" onClick={() => alert('打开摄像头')} color="var(--c-mint)"/>
        </div>
      </div>
    </div>
  );
}
function WebTile({ label, value, sub, color, icon }) {
  return (
    <Card pad={18}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color }}>
        {icon}
        <span style={{ fontSize: 11, color: 'var(--c-ink-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <div className="aibd-display-en" style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 4 }}>{sub}</div>
    </Card>
  );
}
function AILab({ title, sub, icon, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      padding: '16px 18px', background: '#fff', border: 'none', borderRadius: 16,
      boxShadow: 'var(--sh-card)', display: 'flex', alignItems: 'center', gap: 14,
      cursor: 'pointer', textAlign: 'left', transition: 'transform .15s var(--ease), box-shadow .15s',
    }}>
      <div style={{
        width: 50, height: 50, borderRadius: 14,
        background: `color-mix(in srgb, ${color} 15%, white)`,
        display: 'grid', placeItems: 'center', fontSize: 26,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-ink)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', marginTop: 2 }}>{sub}</div>
      </div>
      <Icon.chevronR s={16}/>
    </button>
  );
}

// ─── Study Hub ───────────────────────────────────────────────
function WebStudyHub({ onPick }) {
  const modes = [
    { id: 'mc', t: '选择闯关', s: '看中文，选英文', icon: '🎯', color: 'var(--c-primary)', desc: '经典 Duolingo 体验。配合 SRS 算法，给你刚好够难的题。' },
    { id: 'flip', t: '卡片翻转', s: '左右滑评估熟悉度', icon: '🃏', color: 'var(--c-pink)', desc: 'Quizlet 风。翻面看释义，左滑「不熟」右滑「认识」。' },
    { id: 'spell', t: '拼写填空', s: '主动回忆，深度记忆', icon: '⌨️', color: 'var(--c-mint)', desc: '看中文，从字母池里拼出英文。最有效但也最难。' },
    { id: 'listen', t: '听音辨义', s: '锻炼听力反应', icon: '🎧', color: 'var(--c-sky)', desc: '只播放音频，选择正确释义。可调倍速。' },
    { id: 'context', t: '例句情景', s: 'AI 个性化句子', icon: '✨', color: 'var(--c-coral)', desc: 'AI 根据你的兴趣生成例句，挖空让你选词。' },
    { id: 'image', t: '图像联想', s: '视觉记忆，适合视觉型', icon: '🖼️', color: 'var(--c-warning)', desc: '用图像和情景而非单字面理解词义。' },
  ];
  return (
    <div style={{ padding: 28 }}>
      <div className="aibd-display" style={{ fontSize: 30 }}>选择刷词方式</div>
      <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 4, marginBottom: 22 }}>
        6 种科学验证的记忆方法，按你今天的状态自由切换。
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {modes.map(m => (
          <button key={m.id} onClick={() => onPick(m.id)} style={{
            padding: 22, background: '#fff', border: 'none', borderRadius: 18,
            boxShadow: 'var(--sh-card)', cursor: 'pointer', textAlign: 'left',
            transition: 'transform .15s, box-shadow .15s', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: `color-mix(in srgb, ${m.color} 15%, white)`,
              display: 'grid', placeItems: 'center', fontSize: 30, marginBottom: 14,
            }}>{m.icon}</div>
            <div className="aibd-display" style={{ fontSize: 18 }}>{m.t}</div>
            <div style={{ fontSize: 12, color: m.color, fontWeight: 700, marginTop: 2 }}>{m.s}</div>
            <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 8, lineHeight: 1.5 }}>{m.desc}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: m.color, fontSize: 12, fontWeight: 800, marginTop: 14 }}>
              开始 <Icon.chevronR s={14}/>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Review ──────────────────────────────────────────────────
function WebReview({ onStudy }) {
  const r = useRouter();
  const [filter, setFilter] = React.useState('all');
  const filtered = QUEUE.filter(q => filter === 'all' || q.state === filter);
  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
        <div>
          <div className="aibd-display" style={{ fontSize: 30 }}>智能复习</div>
          <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 4 }}>
            基于艾宾浩斯遗忘曲线 · 14 个词等待复习
          </div>
        </div>
        <CTA color="var(--c-primary)" size="md" full={false} onClick={onStudy} icon={<Icon.zap s={18} fill="#fff"/>}>
          开始复习 14 词
        </CTA>
      </div>

      {/* stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
        <WebTile label="待复习" value="14" sub="今日队列" color="var(--c-warning)" icon={<Icon.brain s={16}/>}/>
        <WebTile label="已掌握" value="284" sub="七日内不会再考" color="var(--c-success)" icon={<Icon.check s={16}/>}/>
        <WebTile label="生疏" value="9" sub="需要立刻复习" color="var(--c-danger)" icon={<Icon.heart s={16}/>}/>
        <WebTile label="本周完成" value="42" sub="↑ 比上周 +12%" color="var(--c-primary)" icon={<Icon.chart s={16}/>}/>
      </div>

      <Card pad={22}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="aibd-display" style={{ fontSize: 17 }}>队列</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['all','全部'],['weak','生疏'],['fuzzy','模糊'],['familiar','熟悉'],['mastered','掌握']].map(([id, l]) => (
              <button key={id} onClick={() => setFilter(id)} style={{
                padding: '5px 12px', borderRadius: 999, border: 'none',
                background: filter === id ? 'var(--c-primary)' : 'var(--c-bg)',
                color: filter === id ? '#fff' : 'var(--c-ink-soft)',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          {filtered.map((q, i) => {
            const w = findWord(q.wordId);
            if (!w) return null;
            const stateColor = { weak: 'var(--c-danger)', fuzzy: 'var(--c-warning)', familiar: 'var(--c-primary)', mastered: 'var(--c-success)' }[q.state];
            const stateLabel = { weak: '生疏', fuzzy: '模糊', familiar: '熟悉', mastered: '掌握' }[q.state];
            return (
              <button key={q.wordId} onClick={() => r.navigate('/word/' + w.id)} style={{
                width: '100%', padding: '12px 16px', background: 'var(--c-surface-soft)',
                border: 'none', borderRadius: 12, marginBottom: 6, display: 'flex',
                alignItems: 'center', gap: 16, cursor: 'pointer', textAlign: 'left',
                animation: 'slideUp .3s var(--ease) backwards', animationDelay: `${i * 0.03}s`,
              }}>
                <ProgressRing value={q.mastery} size={42} stroke={5} color={stateColor}>
                  <div className="aibd-display-en" style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-ink)' }}>{Math.round(q.mastery * 100)}</div>
                </ProgressRing>
                <div style={{ flex: 1 }}>
                  <div className="aibd-display-en" style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-ink)' }}>{w.word}</div>
                  <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 1 }}>{w.cn}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <Tag color={stateColor} bg={`color-mix(in srgb, ${stateColor} 15%, white)`} size="xs">{stateLabel}</Tag>
                  <div style={{ fontSize: 10, color: 'var(--c-ink-muted)' }}>下次: {q.due}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { WebApp, WebShell, WebSidebar, WebTopBar, WebDashboard, WebStudyHub, WebReview, WebTile });
