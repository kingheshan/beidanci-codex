// phone-screens.jsx — All non-study screens, fully navigable
// Home / Result / Review / Profile / Leaderboard / Onboarding / Word detail
// / Settings / Quick-tools (PK, story, OCR placeholder)

// ─── Home (learning path) ────────────────────────────────────
function PhoneHome() {
  const r = useRouter();
  const { state } = useStore();
  return (
    <PhoneBody>
      {/* Header */}
      <div style={{ padding: '0 16px 12px', background: 'linear-gradient(180deg, var(--c-primary-soft) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={() => r.navigate('/settings')} style={{
            padding: '4px 10px 4px 4px', borderRadius: 999, background: '#fff',
            display: 'flex', alignItems: 'center', gap: 6, boxShadow: 'var(--sh-card)',
            border: 'none', cursor: 'pointer',
          }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--c-primary-soft)', display: 'grid', placeItems: 'center', color: 'var(--c-primary)' }}>
              <Icon.book s={13}/>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink)' }}>{state.bookName}</div>
            <Icon.chevronR s={11}/>
          </button>
          <div style={{ display: 'flex', gap: 5 }}>
            <StreakChip days={state.streak} size="sm"/>
            <GemPill count={state.gems} size="sm"/>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <Wordy size={58} pose="wave" mood="happy" glow={false}/>
          <div>
            <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', fontWeight: 600 }}>下午好，小敏 ✨</div>
            <div className="aibd-display" style={{ fontSize: 17, color: 'var(--c-ink)', lineHeight: 1.15, marginTop: 2 }}>
              今天还差 <span style={{ color: 'var(--c-primary)' }}>8 个词</span>
            </div>
          </div>
        </div>

        <Card pad={12} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink-soft)' }}>今日任务 12 / 20</span>
              <span style={{ fontSize: 10, color: 'var(--c-primary)', fontWeight: 700 }}>剩 6 分钟</span>
            </div>
            <ProgressBar value={0.6} height={7}/>
          </div>
        </Card>
      </div>

      {/* Path */}
      <div style={{ padding: '4px 0 90px' }}>
        <div style={{ padding: '8px 16px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ height: 1, flex: 1, background: 'var(--c-line)' }}/>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-ink-muted)', letterSpacing: '0.08em' }}>UNIT 3 · 校园生活</span>
          <div style={{ height: 1, flex: 1, background: 'var(--c-line)' }}/>
        </div>

        <PathView/>

        {/* Quick entries */}
        <div style={{ padding: '16px 14px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink-soft)', marginBottom: 8, letterSpacing: '0.04em' }}>AI 工具箱</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <QuickTile icon={<Icon.sparkle s={16}/>} title="AI 每日故事" sub="今日已生成" color="var(--c-coral)" bg="#FFE9DE" onClick={() => r.navigate('/story')}/>
            <QuickTile icon={<Icon.swords s={16}/>} title="单词 PK" sub="2 分钟对战" color="var(--c-pink)" bg="#FFE4ED" onClick={() => r.navigate('/pk')}/>
            <QuickTile icon={<Icon.camera s={16}/>} title="拍照查词" sub="OCR 一键加" color="var(--c-mint)" bg="#D4F8EF" onClick={() => r.navigate('/camera')}/>
            <QuickTile icon={<Icon.brain s={16}/>} title="错词记忆星云" sub="可视化弱项" color="var(--c-primary)" bg="var(--c-primary-soft)" onClick={() => r.navigate('/word/w1')}/>
          </div>
        </div>
      </div>
    </PhoneBody>
  );
}

function PathView() {
  const r = useRouter();
  // Visual zig-zag path
  const startStudy = (mode) => r.navigate('/study/' + mode);
  return (
    <div style={{ position: 'relative', padding: '6px 0', minHeight: 420 }}>
      <svg viewBox="0 0 280 420" preserveAspectRatio="none" style={{ position: 'absolute', top: 28, left: 0, right: 0, height: 420, width: '100%', zIndex: 0, opacity: 0.4 }}>
        <path d="M70 0 Q220 40 220 100 Q220 160 90 200 Q-30 240 90 300 Q190 350 210 410"
          stroke="var(--c-primary)" strokeWidth="3" strokeDasharray="5 7" fill="none"/>
      </svg>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 50 }}>
          <LessonNode state="done" icon={<Icon.check s={26}/>} label="入门 · 完成"/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 38 }}>
          <LessonNode state="done" icon={<Icon.star s={26} fill="#fff"/>} label="进阶 · 完成"/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => startStudy('mc')} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <div style={{ padding: '3px 9px', background: 'var(--c-primary)', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 800, position: 'relative', animation: 'drift 2.5s ease-in-out infinite' }}>
              开始
              <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--c-primary)' }}/>
            </div>
            <LessonNode state="current" icon={<Icon.zap s={30} fill="#fff"/>} label="" big/>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink)', textAlign: 'center', maxWidth: 130 }}>
              情景闯关 · 20词
            </div>
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 50 }}>
          <LessonNode state="locked" icon={<Icon.mic s={24}/>} label="听力 · 15词"/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 38 }}>
          <LessonNode state="boss" icon={<Icon.trophy s={26}/>} label="BOSS 战"/>
        </div>
      </div>
    </div>
  );
}

function QuickTile({ icon, title, sub, color, bg, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: 12, borderRadius: 14, background: bg, position: 'relative', overflow: 'hidden',
      border: 'none', cursor: 'pointer', textAlign: 'left',
      transition: 'transform .15s var(--ease)',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9, background: '#fff', color,
        display: 'grid', placeItems: 'center', marginBottom: 8,
      }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-ink)' }}>{title}</div>
      <div style={{ fontSize: 10, color: 'var(--c-ink-muted)', marginTop: 1 }}>{sub}</div>
    </button>
  );
}

// ─── Mode select sheet ───────────────────────────────────────
function ModeSelect({ onClose }) {
  const r = useRouter();
  const modes = [
    { id: 'mc', t: '① 选择闯关', s: 'Duolingo 风格', icon: '🎯', color: 'var(--c-primary)' },
    { id: 'flip', t: '② 卡片翻转', s: 'Quizlet 风格', icon: '🃏', color: 'var(--c-pink)' },
    { id: 'spell', t: '③ 拼写填空', s: '主动回忆', icon: '⌨️', color: 'var(--c-mint)' },
    { id: 'listen', t: '④ 听音辨义', s: '听力训练', icon: '🎧', color: 'var(--c-sky)' },
    { id: 'context', t: '⑤ 例句情景', s: 'AI 个性化', icon: '✨', color: 'var(--c-coral)' },
    { id: 'image', t: '⑥ 图像联想', s: '视觉记忆', icon: '🖼️', color: 'var(--c-warning)' },
  ];
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)' }}>
      <PhoneHeader title="选择刷词方式" onBack={onClose}/>
      <div className="aibd-scroll" style={{ position: 'absolute', inset: '88px 0 0', overflow: 'auto', padding: '0 14px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginBottom: 14 }}>
          不同方式适合不同的记忆偏好，可随时切换。
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {modes.map(m => (
            <button key={m.id} onClick={() => r.navigate('/study/' + m.id)} style={{
              padding: '14px 16px', borderRadius: 16, background: '#fff',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              boxShadow: 'var(--sh-card)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `color-mix(in srgb, ${m.color} 15%, white)`,
                display: 'grid', placeItems: 'center', fontSize: 26,
              }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--c-ink)' }}>{m.t}</div>
                <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', marginTop: 1 }}>{m.s}</div>
              </div>
              <Icon.chevronR s={16}/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Result ──────────────────────────────────────────────────
function PhoneResult({ results, onClose }) {
  const correct = results.filter(r => r.correct).length;
  const total = results.length || 1;
  const pct = Math.round(correct / total * 100);
  const totalMs = results.reduce((sum, r) => sum + r.ms, 0);
  const min = Math.floor(totalMs / 60000);
  const sec = Math.floor((totalMs % 60000) / 1000);
  return (
    <div style={{ height: '100%', background: 'linear-gradient(180deg, var(--c-primary) 0%, var(--c-primary-deep) 100%)', display: 'flex', flexDirection: 'column', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      {/* Confetti */}
      {[...Array(24)].map((_, i) => {
        const colors = ['var(--c-accent)', 'var(--c-pink)', 'var(--c-mint)', '#fff'];
        return <div key={i} style={{
          position: 'absolute',
          left: `${(i * 37) % 100}%`,
          top: -20,
          width: 6 + (i % 3) * 2, height: 6 + (i % 3) * 2,
          background: colors[i % 4],
          borderRadius: i % 2 ? '50%' : 1,
          animation: `confettiFall ${2 + (i % 3) * 0.5}s ease-in ${i * 0.1}s infinite`,
        }}/>;
      })}

      <div style={{ padding: '50px 16px 0', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>UNIT 3 · 完成</div>
        <div className="aibd-display" style={{ fontSize: 26, lineHeight: 1.1, marginBottom: 8 }}>太厉害了！</div>
        <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.5 }}>
          连胜增加到 <b style={{ color: 'var(--c-accent)' }}>29 天</b>
        </div>
        <div style={{ margin: '12px 0', display: 'flex', justifyContent: 'center', animation: 'pop .5s var(--ease)' }}>
          <Wordy size={120} pose="celebrate" mood="cheer" form="star"/>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 16px', position: 'relative', zIndex: 2 }}>
        <div style={{
          padding: 14, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)',
          borderRadius: 20, marginBottom: 12, border: '1px solid rgba(255,255,255,0.18)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <ResStat label="XP" value={`+ ${correct * 12}`} color="var(--c-accent)"/>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }}/>
            <ResStat label="正确率" value={`${pct}%`} color="var(--c-mint)"/>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }}/>
            <ResStat label="用时" value={`${min}:${String(sec).padStart(2,'0')}`} color="#fff"/>
          </div>
        </div>

        <div style={{ padding: 14, background: 'rgba(255,255,255,0.95)', borderRadius: 20, color: 'var(--c-ink)', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-ink-soft)', marginBottom: 10 }}>本节掌握的词</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {results.slice(0, 6).map((res, i) => {
              const w = findWord(res.wordId);
              if (!w) return null;
              return (
                <div key={i} style={{
                  padding: '5px 10px',
                  background: res.correct ? 'var(--c-primary-soft)' : '#FFE4E4',
                  color: res.correct ? 'var(--c-primary-ink)' : 'var(--c-danger)',
                  borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display-en)',
                }}>{w.word} {res.correct ? '✓' : '✗'}</div>
              );
            })}
          </div>
        </div>

        <CTA color="#fff" textColor="var(--c-primary)" size="lg" onClick={onClose}>继续</CTA>
      </div>
    </div>
  );
}
function ResStat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div className="aibd-display-en" style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, opacity: 0.8, marginTop: 3 }}>{label}</div>
    </div>
  );
}

// ─── Review queue ────────────────────────────────────────────
function PhoneReview() {
  const r = useRouter();
  const [filter, setFilter] = React.useState('all');
  const filtered = QUEUE.filter(q => filter === 'all' || q.state === filter);
  return (
    <PhoneBody>
      <div style={{ padding: '0 16px 12px' }}>
        <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)' }}>智能复习</div>
        <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 2 }}>基于艾宾浩斯遗忘曲线</div>
      </div>

      <div style={{ padding: '0 14px 12px' }}>
        <Card pad={14}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <StatBlock value="14" label="待复习" color="var(--c-warning)" icon={<Icon.brain s={16}/>}/>
            <StatBlock value="284" label="已掌握" color="var(--c-success)" icon={<Icon.check s={16}/>}/>
            <StatBlock value="9" label="生疏" color="var(--c-danger)" icon={<Icon.heart s={16}/>}/>
            <StatBlock value="42" label="本周" color="var(--c-primary)" icon={<Icon.zap s={16}/>}/>
          </div>
          <ProgressBar value={0.74} height={7} color="var(--c-success)"/>
          <div style={{ fontSize: 10, color: 'var(--c-ink-muted)', marginTop: 5, textAlign: 'right' }}>
            本词书 · 掌握度 74%
          </div>
        </Card>
      </div>

      {/* filter chips */}
      <div style={{ display: 'flex', gap: 6, padding: '0 14px 8px', overflow: 'auto' }}>
        {[
          { id: 'all', l: '全部' },
          { id: 'weak', l: '生疏' },
          { id: 'fuzzy', l: '模糊' },
          { id: 'familiar', l: '熟悉' },
          { id: 'mastered', l: '掌握' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '5px 12px', borderRadius: 999, border: 'none',
            background: filter === f.id ? 'var(--c-primary)' : '#fff',
            color: filter === f.id ? '#fff' : 'var(--c-ink-soft)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            boxShadow: filter === f.id ? 'var(--sh-cta)' : 'var(--sh-card)',
          }}>{f.l}</button>
        ))}
      </div>

      <div style={{ padding: '4px 14px 160px' }}>
        {filtered.map((q, i) => {
          const w = findWord(q.wordId);
          if (!w) return null;
          const stateLabel = { weak: '生疏', fuzzy: '模糊', familiar: '熟悉', mastered: '掌握' }[q.state];
          const stateColor = { weak: 'var(--c-danger)', fuzzy: 'var(--c-warning)', familiar: 'var(--c-primary)', mastered: 'var(--c-success)' }[q.state];
          return (
            <button key={q.wordId} onClick={() => r.navigate('/word/' + w.id)} style={{
              padding: '10px 14px', background: '#fff', borderRadius: 14,
              boxShadow: 'var(--sh-card)', marginBottom: 8, width: '100%',
              display: 'flex', alignItems: 'center', gap: 12, border: 'none',
              cursor: 'pointer', textAlign: 'left',
              animation: 'slideUp .3s var(--ease) backwards', animationDelay: `${i * 0.04}s`,
            }}>
              <ProgressRing value={q.mastery} size={40} stroke={5} color={stateColor}>
                <div className="aibd-display-en" style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink)' }}>{Math.round(q.mastery * 100)}</div>
              </ProgressRing>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="aibd-display-en" style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-ink)' }}>{w.word}</div>
                <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 1 }}>{w.cn}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Tag color={stateColor} bg={`color-mix(in srgb, ${stateColor} 15%, white)`} size="xs">{stateLabel}</Tag>
                <div style={{ fontSize: 9, color: 'var(--c-ink-muted)', marginTop: 4 }}>下次：{q.due}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ position: 'absolute', bottom: 88, left: 14, right: 14, zIndex: 35 }}>
        <CTA color="var(--c-primary)" size="lg" icon={<Icon.zap s={20} fill="#fff"/>} onClick={() => r.navigate('/study/mc')}>
          开始复习 {filtered.length} 词
        </CTA>
      </div>
    </PhoneBody>
  );
}

// ─── Profile ─────────────────────────────────────────────────
function PhoneProfile() {
  const r = useRouter();
  const { state } = useStore();
  return (
    <PhoneBody padded={false}>
      <div style={{ padding: '50px 16px 14px', background: 'linear-gradient(180deg, var(--c-primary) 0%, var(--c-primary-deep) 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -16, top: 30, opacity: 0.9 }}>
          <Wordy size={110} pose="idle" mood="happy" form="star" glow={false}/>
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="aibd-display" style={{ fontSize: 20 }}>小敏 同学</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>初三 · 加入第 124 天</div>
          <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
            <div>
              <div className="aibd-display-en" style={{ fontSize: 20, fontWeight: 800 }}>Lv. {state.level}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>等级</div>
            </div>
            <div>
              <div className="aibd-display-en" style={{ fontSize: 20, fontWeight: 800, color: 'var(--c-accent)' }}>{state.masteredCount.toLocaleString()}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>已掌握</div>
            </div>
          </div>
          <div style={{ marginTop: 8, width: 160 }}>
            <ProgressBar value={0.68} height={6} color="var(--c-accent)" bg="rgba(255,255,255,0.18)"/>
            <div style={{ fontSize: 9, opacity: 0.75, marginTop: 3 }}>距 Lv. {state.level + 1} 还差 320 XP</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 14px 90px' }}>
        {/* Pro upsell banner */}
        <button onClick={() => r.navigate('/pro')} style={{
          width: '100%', padding: 14, borderRadius: 16, marginBottom: 10,
          background: 'linear-gradient(135deg, #2B1F6E, #1A1340)', color: '#fff',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 12, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--c-accent)', display: 'grid', placeItems: 'center', fontSize: 20, color: 'var(--c-ink)' }}>👑</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-accent)' }}>升级 PRO 会员</div>
            <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>解锁全部 AI 能力 · 限时 ¥14/月</div>
          </div>
          <Icon.chevronR s={16}/>
        </button>

        {/* Quick links */}
        <Card pad={0} style={{ marginBottom: 10 }}>
          {[
            { i: '📛', l: '错题本', s: '5 个高频错词', go: '/mistakes', color: 'var(--c-danger)' },
            { i: '📷', l: '拍照查词', s: 'OCR 圈词加入复习', go: '/camera', color: 'var(--c-mint)' },
            { i: '⚙️', l: '学习计划设置', s: '每日 20 词 · 19:00 提醒', go: '/settings', color: 'var(--c-primary)' },
          ].map((row, i, arr) => (
            <button key={i} onClick={() => r.navigate(row.go)} style={{
              width: '100%', padding: '12px 14px', border: 'none', background: 'transparent',
              cursor: 'pointer', textAlign: 'left',
              borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--c-line)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ fontSize: 22 }}>{row.i}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-ink)' }}>{row.l}</div>
                <div style={{ fontSize: 10, color: 'var(--c-ink-muted)', marginTop: 1 }}>{row.s}</div>
              </div>
              <Icon.chevronR s={14}/>
            </button>
          ))}
        </Card>

        <Card pad={14} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)' }}>学习地图</div>
            <Tag color="var(--c-streak)" bg="#FFE9D9" size="xs"><Icon.flame s={10}/> {state.streak} 天连胜</Tag>
          </div>
          <Heatmap2/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 9, color: 'var(--c-ink-muted)' }}>
            <span>少</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {[0.1, 0.35, 0.6, 0.85, 1].map((v,i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: `color-mix(in srgb, var(--c-primary) ${v * 100}%, white)` }}/>
              ))}
            </div>
            <span>多</span>
          </div>
        </Card>

        <Card pad={14} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)' }}>徽章 · 12 枚</div>
            <span style={{ fontSize: 11, color: 'var(--c-primary)', fontWeight: 700, cursor: 'pointer' }}>全部 ›</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
            <Badge2 color="var(--c-streak)" icon="🔥" label="火热 30 天"/>
            <Badge2 color="var(--c-primary)" icon="📚" label="千词达成"/>
            <Badge2 color="var(--c-pink)" icon="⚔️" label="PK 王者"/>
            <Badge2 color="var(--c-mint)" icon="🌱" label="勤奋初心" dim/>
          </div>
        </Card>

        <Card pad={14}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 10 }}>我的词书</div>
          {[
            { name: state.bookName, sub: `${state.masteredCount} / ${state.bookTotal}`, pct: state.masteredCount / state.bookTotal, current: true },
            { name: '新概念第二册', sub: '320 / 850', pct: 0.38, mute: true },
          ].map((b,i) => (
            <div key={i} style={{ marginBottom: i === 0 ? 12 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--c-ink)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {b.name}
                  {b.current && <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">在学</Tag>}
                </span>
                <span className="aibd-display-en" style={{ fontSize: 12, color: 'var(--c-ink-muted)', fontWeight: 700 }}>{b.sub}</span>
              </div>
              <ProgressBar value={b.pct} height={6} color={b.mute ? 'var(--c-ink-muted)' : 'var(--c-primary)'}/>
            </div>
          ))}
        </Card>
      </div>
    </PhoneBody>
  );
}

function Heatmap2() {
  const weeks = 13, days = 7;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 3 }}>
      {[...Array(weeks)].map((_, w) => (
        <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[...Array(days)].map((_, d) => {
            const v = Math.max(0, Math.min(1, (Math.sin((w * 7 + d) * 0.6) + 0.5) / 1.5));
            const opacity = v < 0.1 ? 0 : v;
            return <div key={d} style={{
              aspectRatio: '1 / 1', borderRadius: 2,
              background: opacity === 0 ? 'var(--c-line)' : `color-mix(in srgb, var(--c-primary) ${opacity * 100}%, white)`,
            }}/>;
          })}
        </div>
      ))}
    </div>
  );
}

function Badge2({ icon, label, color, dim }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: dim ? 0.4 : 1 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `color-mix(in srgb, ${color} 15%, white)`,
        border: `2px solid ${color}`,
        display: 'grid', placeItems: 'center', fontSize: 20,
        boxShadow: dim ? 'none' : `0 3px 0 ${color}`,
      }}>{icon}</div>
      <div style={{ fontSize: 9, color: 'var(--c-ink-soft)', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{label}</div>
    </div>
  );
}

// ─── Leaderboard ─────────────────────────────────────────────
function PhoneLeaderboard() {
  return (
    <PhoneBody>
      <div style={{ padding: '0 16px 12px' }}>
        <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)' }}>翡翠组</div>
        <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 2 }}>本周前 10 名晋级铂金组 · 还剩 2 天</div>
      </div>

      <div style={{ padding: '0 16px 8px' }}>
        <Card pad={14} style={{ background: 'linear-gradient(135deg, var(--c-primary-soft) 0%, #fff 80%)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 6, paddingTop: 4 }}>
            <PodiumCol rank={2} {...LEADERBOARD[1]} color="#C0C0C0"/>
            <PodiumCol rank={1} {...LEADERBOARD[0]} color="var(--c-accent)" big/>
            <PodiumCol rank={3} {...LEADERBOARD[2]} color="#CD7F32"/>
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 16px 80px' }}>
        {LEADERBOARD.slice(3).map((u, i) => (
          <div key={u.rank} style={{
            padding: '8px 12px', background: u.me ? 'var(--c-primary)' : '#fff',
            color: u.me ? '#fff' : 'var(--c-ink)',
            borderRadius: 12, marginBottom: 5,
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: u.me ? 'var(--sh-cta)' : 'var(--sh-card)',
            border: u.danger ? '1px dashed var(--c-danger)' : 'none',
            animation: 'slideUp .3s var(--ease) backwards', animationDelay: `${i * 0.03}s`,
            transform: u.me ? 'scale(1.02)' : 'scale(1)',
          }}>
            <div className="aibd-display-en" style={{ width: 20, fontWeight: 800, fontSize: 13, textAlign: 'center', opacity: u.me ? 1 : 0.6 }}>{u.rank}</div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: u.me ? 'rgba(255,255,255,0.25)' : 'var(--c-primary-soft)', display: 'grid', placeItems: 'center', fontSize: 16 }}>
              {u.avatar}
            </div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: u.me ? 800 : 600 }}>
              {u.name}
            </div>
            <div className="aibd-display-en" style={{ fontWeight: 800, fontSize: 13, color: u.me ? 'var(--c-accent)' : 'var(--c-primary)' }}>{u.xp} XP</div>
          </div>
        ))}
        <div style={{ fontSize: 9, color: 'var(--c-ink-muted)', textAlign: 'center', padding: '8px 0' }}>
          ─── 降级线（保级及格 480 XP）───
        </div>
      </div>
    </PhoneBody>
  );
}

function PodiumCol({ rank, name, xp, avatar, color, big }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', maxWidth: big ? 86 : 76 }}>
      <div style={{
        width: big ? 48 : 40, height: big ? 48 : 40, borderRadius: '50%',
        background: 'var(--c-primary-soft)', margin: '0 auto', position: 'relative',
        border: `3px solid ${color}`, display: 'grid', placeItems: 'center', fontSize: big ? 26 : 22,
      }}>
        {avatar}
        <div style={{
          position: 'absolute', top: -6, right: -4, width: 20, height: 20, borderRadius: '50%',
          background: color, color: rank === 1 ? 'var(--c-ink)' : '#fff',
          display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 10,
          fontFamily: 'var(--font-display-en)',
        }}>{rank}</div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink)', marginTop: 6 }}>{name}</div>
      <div className="aibd-display-en" style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-primary)' }}>{xp}</div>
      <div style={{ height: big ? 44 : rank === 2 ? 30 : 22, background: color, opacity: 0.4, marginTop: 4, borderRadius: '6px 6px 0 0' }}/>
    </div>
  );
}

Object.assign(window, { PhoneHome, ModeSelect, PhoneResult, PhoneReview, PhoneProfile, PhoneLeaderboard });
