// screens-home.jsx — Home / Today's plan / Learn path

// ─── Home A: 路径式 (Duolingo / 百词斩 style) ──────────────────
function ScreenHomeA() {
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '50px 18px 14px', background: 'linear-gradient(180deg, var(--c-primary-soft) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              padding: '4px 10px 4px 4px', borderRadius: 999, background: '#fff',
              display: 'flex', alignItems: 'center', gap: 6, boxShadow: 'var(--sh-card)',
            }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--c-primary-soft)', display: 'grid', placeItems: 'center' }}>
                <Icon.book s={14}/>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink)' }}>中考核心 1600</div>
              <Icon.chevronR s={12}/>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <StreakChip days={28} size="sm"/>
            <GemPill count={1280} size="sm"/>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Wordy size={64} pose="wave" mood="happy" glow={false}/>
          <div>
            <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', fontWeight: 600 }}>下午好，小敏 ✨</div>
            <div className="aibd-display" style={{ fontSize: 19, color: 'var(--c-ink)', lineHeight: 1.15, marginTop: 2 }}>
              今天还差 <span style={{ color: 'var(--c-primary)' }}>8 个词</span><br/>就能解锁新形态
            </div>
          </div>
        </div>

        {/* Today's progress */}
        <div style={{ marginTop: 14, padding: '10px 14px', background: '#fff', borderRadius: 16, boxShadow: 'var(--sh-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink-soft)' }}>今日任务 12 / 20</span>
            <span style={{ fontSize: 10, color: 'var(--c-primary)', fontWeight: 700 }}>预计还需 6 分钟</span>
          </div>
          <ProgressBar value={0.6} height={8}/>
        </div>
      </div>

      {/* Learning path */}
      <div className="aibd-scroll" style={{ flex: 1, padding: '14px 0 90px', overflow: 'auto', position: 'relative' }}>
        <div style={{ padding: '4px 18px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ height: 1, flex: 1, background: 'var(--c-line)' }}/>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-ink-muted)', letterSpacing: '0.08em' }}>UNIT 3 · 校园生活</span>
          <div style={{ height: 1, flex: 1, background: 'var(--c-line)' }}/>
        </div>

        {/* Zig-zag path with curved connectors */}
        <div style={{ position: 'relative', padding: '8px 0' }}>
          {/* dashed connector lines */}
          <svg viewBox="0 0 280 460" preserveAspectRatio="none" style={{ position: 'absolute', top: 30, left: 0, right: 0, height: 460, width: '100%', zIndex: 0, opacity: 0.35 }}>
            <path d="M70 0 Q200 60 210 120 Q220 180 90 240 Q-30 300 90 360 Q190 410 210 440"
              stroke="var(--c-primary)" strokeWidth="3" strokeDasharray="5 7" fill="none"/>
          </svg>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Done */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 50 }}>
              <LessonNode state="done" icon={<Icon.check s={28}/>} label="入门 · 20词"/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 38 }}>
              <LessonNode state="done" icon={<Icon.star s={28} fill="#fff"/>} label="进阶 · 20词"/>
            </div>
            {/* Current */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  padding: '4px 10px', background: 'var(--c-primary)', color: '#fff',
                  borderRadius: 12, fontSize: 10, fontWeight: 800,
                  position: 'relative',
                }}>
                  开始
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--c-primary)' }}/>
                </div>
                <LessonNode state="current" icon={<Icon.zap s={32} fill="#fff"/>} label="" big/>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink)', textAlign: 'center', maxWidth: 130 }}>
                  情景闯关 · 20词
                </div>
              </div>
            </div>
            {/* Locked */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 50 }}>
              <LessonNode state="locked" icon={<Icon.mic s={26}/>} label="听力 · 15词"/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 38 }}>
              <LessonNode state="boss" icon={<Icon.trophy s={28}/>} label="BOSS战"/>
            </div>
          </div>
        </div>

        {/* Quick entries */}
        <div style={{ padding: '20px 14px 0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-ink-soft)', marginBottom: 10, letterSpacing: '0.04em' }}>更多工具</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <QuickCard icon={<Icon.brain s={18}/>} title="智能复习" sub="14 个词等你" color="var(--c-primary)" bg="var(--c-primary-soft)"/>
            <QuickCard icon={<Icon.swords s={18}/>} title="单词PK" sub="2 分钟对战" color="var(--c-pink)" bg="#FFE4ED"/>
            <QuickCard icon={<Icon.sparkle s={18}/>} title="AI 每日故事" sub="今日已生成" color="var(--c-coral)" bg="#FFE9DE"/>
            <QuickCard icon={<Icon.camera s={18}/>} title="拍照查词" sub="OCR 一键加" color="var(--c-mint)" bg="#D4F8EF"/>
          </div>
        </div>
      </div>

      <TabBar active="home"/>
    </div>
  );
}

function QuickCard({ icon, title, sub, color, bg }) {
  return (
    <div style={{
      padding: '12px 12px', borderRadius: 16, background: bg, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, background: '#fff', color,
        display: 'grid', placeItems: 'center', marginBottom: 8,
      }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-ink)' }}>{title}</div>
      <div style={{ fontSize: 10, color: 'var(--c-ink-muted)', marginTop: 1 }}>{sub}</div>
    </div>
  );
}

// ─── Home B: 卡片瀑布式 (more 'Apple/Drops' aesthetic) ─────────
function ScreenHomeB() {
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '50px 18px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', fontWeight: 600 }}>2026 · 5 月 18 日 周一</div>
            <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)', lineHeight: 1.15, marginTop: 2 }}>
              今天，<span style={{ color: 'var(--c-primary)' }}>你来定节奏</span>
            </div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--c-primary-soft)', display: 'grid', placeItems: 'center' }}>
            <WordyMini size={32}/>
          </div>
        </div>
      </div>

      <div className="aibd-scroll" style={{ flex: 1, padding: '6px 14px 90px', overflow: 'auto' }}>
        {/* Hero: today plan */}
        <div style={{
          padding: 18, borderRadius: 24,
          background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-deep) 100%)',
          color: '#fff', position: 'relative', overflow: 'hidden', marginBottom: 12,
        }}>
          <div style={{ position: 'absolute', right: -20, top: -10, opacity: 0.9 }}>
            <Wordy size={130} pose="study" mood="happy" glow={false}/>
          </div>
          <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 700, letterSpacing: '0.06em' }}>今日学习</div>
          <div className="aibd-display-en" style={{ fontSize: 44, lineHeight: 1, marginTop: 4 }}>12<span style={{ fontSize: 18, opacity: 0.7 }}>/20</span></div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>预计 6 分钟完成</div>
          <div style={{ marginTop: 14 }}>
            <ProgressBar value={0.6} height={8} color="var(--c-accent)" bg="rgba(255,255,255,0.25)"/>
          </div>
          <button style={{
            marginTop: 14, height: 40, padding: '0 18px', border: 'none', borderRadius: 12,
            background: '#fff', color: 'var(--c-primary)', fontWeight: 800, fontSize: 14,
            display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          }}>继续学习 <Icon.chevronR s={14}/></button>
        </div>

        {/* 3 method tiles */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <TileCard icon={<Icon.zap s={18}/>} label="新词" count={8} color="var(--c-pink)"/>
          <TileCard icon={<Icon.brain s={18}/>} label="复习" count={14} color="var(--c-primary)"/>
          <TileCard icon={<Icon.mic s={18}/>} label="听写" count={6} color="var(--c-mint)"/>
        </div>

        {/* AI daily story card */}
        <Card pad={14} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Tag color="var(--c-coral)" bg="#FFE9DE" size="xs"><Icon.sparkle s={10}/> AI 每日故事</Tag>
            <Tag color="var(--c-ink-muted)" bg="var(--c-bg-deep)" size="xs">3 分钟</Tag>
          </div>
          <div className="aibd-display" style={{ fontSize: 16, color: 'var(--c-ink)', lineHeight: 1.3, marginBottom: 4 }}>
            The Persistent Bookworm
          </div>
          <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', lineHeight: 1.5 }}>
            把今天复习的 12 个词编进一篇校园故事，听 + 读双形态。
          </div>
        </Card>

        {/* Streak ring */}
        <Card pad={14} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ProgressRing value={0.75} size={64} stroke={8} color="var(--c-streak)">
            <div style={{ textAlign: 'center' }}>
              <div className="aibd-display-en" style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-streak)' }}>28</div>
              <div style={{ fontSize: 8, color: 'var(--c-ink-muted)', fontWeight: 700 }}>DAYS</div>
            </div>
          </ProgressRing>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)' }}>连胜 28 天 🔥</div>
            <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 2 }}>
              再坚持 2 天解锁<span style={{ color: 'var(--c-streak)', fontWeight: 700 }}>「月度学霸」</span>徽章
            </div>
          </div>
        </Card>
      </div>
      <TabBar active="home"/>
    </div>
  );
}

function TileCard({ icon, label, count, color }) {
  return (
    <div style={{
      flex: 1, padding: '12px 10px', background: 'var(--c-surface)', borderRadius: 16,
      boxShadow: 'var(--sh-card)',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: 'var(--c-surface-soft)',
        color, display: 'grid', placeItems: 'center', marginBottom: 4,
      }}>{icon}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div className="aibd-display-en" style={{ fontSize: 20, fontWeight: 800, color: 'var(--c-ink)', marginTop: 1 }}>{count}</div>
    </div>
  );
}

Object.assign(window, { ScreenHomeA, ScreenHomeB });
