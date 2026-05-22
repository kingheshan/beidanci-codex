// web-app-2.jsx — More Web pages + study overlay
// Dictionary, Word Detail, Leaderboard, PK lobby, Story, Profile, Settings,
// + WebStudyOverlay that hosts the mobile study mode components.

// ─── Dictionary (word book) ──────────────────────────────────
function WebDictionary() {
  const r = useRouter();
  const [search, setSearch] = React.useState('');
  const list = WORDS.filter(w =>
    !search || w.word.toLowerCase().includes(search.toLowerCase()) || w.cn.includes(search)
  );
  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
        <div>
          <div className="aibd-display" style={{ fontSize: 30 }}>我的词书</div>
          <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 4 }}>中考核心 1600 · 1284 已掌握</div>
        </div>
        <button style={{ height: 40, padding: '0 16px', background: '#fff', border: '1px solid var(--c-line)', borderRadius: 10, fontSize: 13, fontWeight: 700, color: 'var(--c-ink)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon.plus s={16}/> 添加词书
        </button>
      </div>

      {/* Books strip */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 22, overflow: 'auto', paddingBottom: 8 }}>
        {[
          { name: '中考核心 1600', sub: '人教版', pct: 0.8, color: 'linear-gradient(135deg, var(--c-primary), var(--c-primary-deep))', current: true },
          { name: '新概念二册', sub: '850 词', pct: 0.38, color: 'linear-gradient(135deg, var(--c-coral), #B23B0E)' },
          { name: '高考 3500', sub: '人教版', pct: 0, color: 'linear-gradient(135deg, var(--c-mint), #0E8B5C)' },
          { name: '雅思 6.5+', sub: '8000 词', pct: 0, color: 'linear-gradient(135deg, var(--c-pink), #B33D6F)' },
        ].map((b, i) => (
          <div key={i} style={{
            minWidth: 200, padding: 16, borderRadius: 16, background: b.color, color: '#fff',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 130,
            position: 'relative', overflow: 'hidden', cursor: 'pointer',
            boxShadow: b.current ? '0 8px 24px rgba(108,92,231,0.3)' : 'var(--sh-card)',
            outline: b.current ? '2px solid var(--c-primary)' : 'none',
            outlineOffset: 3,
          }}>
            {b.current && <Tag color="var(--c-ink)" bg="var(--c-accent)" size="xs" style={{ position: 'absolute', top: 12, right: 12 }}>在学</Tag>}
            <div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{b.name}</div>
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{b.sub}</div>
            </div>
            <div>
              <ProgressBar value={b.pct} height={5} color="#fff" bg="rgba(255,255,255,0.2)"/>
              <div className="aibd-mono" style={{ fontSize: 10, marginTop: 4, opacity: 0.85 }}>{Math.round(b.pct * 100)}%</div>
            </div>
          </div>
        ))}
      </div>

      <Card pad={22}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="aibd-display" style={{ fontSize: 17 }}>所有单词</div>
          <div style={{ position: 'relative' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索单词..." style={{
              height: 32, width: 200, paddingLeft: 30, paddingRight: 10,
              background: 'var(--c-surface-soft)', border: '1px solid var(--c-line)', borderRadius: 8,
              fontSize: 12, color: 'var(--c-ink)', outline: 'none',
            }}/>
            <svg style={{ position: 'absolute', left: 8, top: 7 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-ink-muted)" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4" strokeLinecap="round"/></svg>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {list.map(w => (
            <button key={w.id} onClick={() => r.navigate('/word/' + w.id)} style={{
              padding: '12px 14px', background: 'var(--c-surface-soft)', border: '1px solid var(--c-line)',
              borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--c-primary-soft)', color: 'var(--c-primary)', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-display-en)' }}>
                {w.word[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="aibd-display-en" style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-ink)' }}>{w.word}</div>
                <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.pos} {w.cn}</div>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Web word detail ─────────────────────────────────────────
function WebWordDetail({ wordId }) {
  const r = useRouter();
  const w = findWord(wordId) || WORDS[0];
  return (
    <div style={{ padding: 28, maxWidth: 880, margin: '0 auto' }}>
      <button onClick={() => r.navigate('/dictionary')} style={{ background: 'transparent', border: 'none', color: 'var(--c-ink-soft)', display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, marginBottom: 12 }}>
        <Icon.chevronL s={14}/> 返回词书
      </button>

      <div style={{
        padding: 28, borderRadius: 22, marginBottom: 18,
        background: 'linear-gradient(135deg, var(--c-primary-soft) 0%, #fff 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div className="aibd-display-en" style={{ fontSize: 48, color: 'var(--c-ink)', lineHeight: 1 }}>{w.word}</div>
          <button style={{
            width: 42, height: 42, borderRadius: '50%', background: 'var(--c-primary)', color: '#fff',
            border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: 'var(--sh-cta)',
          }}><Icon.speaker s={20}/></button>
        </div>
        <div className="aibd-mono" style={{ fontSize: 13, color: 'var(--c-ink-muted)' }}>{w.ipa}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {w.tags.map(t => <Tag key={t} color="var(--c-primary)" bg="rgba(255,255,255,0.7)">{t}</Tag>)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <Card pad={20}>
          <SectionLabel2>释义</SectionLabel2>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <span style={{ fontFamily: 'var(--font-display-en)', fontWeight: 700, fontSize: 12, color: 'var(--c-primary)' }}>{w.pos}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, color: 'var(--c-ink)', fontWeight: 600 }}>{w.cn}</div>
              <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 4 }}>{w.cnLong}</div>
            </div>
          </div>
          <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--c-surface-soft)', borderRadius: 10, fontSize: 12, color: 'var(--c-ink-soft)' }}>
            💡 {w.etym}
          </div>
        </Card>
        <Card pad={20} style={{ background: 'linear-gradient(135deg, var(--c-primary-soft) 0%, #fff 80%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Tag color="var(--c-primary)" bg="rgba(255,255,255,0.85)"><Icon.sparkle s={10}/> AI 联想图谱</Tag>
            <button onClick={() => r.navigate('/word/' + w.id + '?map')} style={{ fontSize: 11, color: 'var(--c-primary)', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer' }}>展开 ›</button>
          </div>
          <WebMiniMap word={w}/>
        </Card>
      </div>

      <Card pad={22} style={{ marginTop: 14 }}>
        <SectionLabel2>例句 · 含 AI 个性化</SectionLabel2>
        {w.examples.map((ex, i) => (
          <div key={i} style={{ padding: '14px 16px', background: 'var(--c-surface-soft)', borderRadius: 12, marginTop: 10 }}>
            <div style={{ fontSize: 15, color: 'var(--c-ink)', lineHeight: 1.6 }}>
              {ex.en.split(new RegExp(`(${w.word})`, 'i')).map((p, j) => p.toLowerCase() === w.word.toLowerCase()
                ? <b key={j} style={{ color: 'var(--c-primary)' }}>{p}</b>
                : <span key={j}>{p}</span>)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 4 }}>{ex.cn}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <Tag color="var(--c-coral)" bg="#FFE9DE" size="xs">{ex.tag}</Tag>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--c-primary)', cursor: 'pointer' }}>
                <Icon.speaker s={16}/>
              </button>
            </div>
          </div>
        ))}
      </Card>

      <Card pad={22} style={{ marginTop: 14 }}>
        <SectionLabel2>派生 · 词组 · 关联</SectionLabel2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {w.related.map(rel => (
            <div key={rel.w} style={{
              padding: '8px 12px', background: 'var(--c-surface-soft)', border: '1px solid var(--c-line)',
              borderRadius: 999, fontSize: 12, color: 'var(--c-ink)',
            }}>
              <b style={{ fontFamily: 'var(--font-display-en)' }}>{rel.w}</b>
              <span style={{ color: 'var(--c-ink-muted)', marginLeft: 6 }}>{rel.t}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WebMiniMap({ word }) {
  return (
    <svg viewBox="0 0 280 130" style={{ width: '100%', height: 140 }}>
      <g stroke="var(--c-primary)" strokeWidth="1.4" fill="none" opacity="0.4" strokeDasharray="3 4">
        <path d="M140 65 L 60 30"/>
        <path d="M140 65 L 220 30"/>
        <path d="M140 65 L 50 100"/>
        <path d="M140 65 L 230 100"/>
      </g>
      <g>
        <circle cx="140" cy="65" r="32" fill="var(--c-primary)"/>
        <text x="140" y="60" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" opacity="0.7">{word.pos}</text>
        <text x="140" y="74" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="var(--font-display-en)">{word.word}</text>
      </g>
      {word.related.slice(0, 4).map((rel, i) => {
        const pos = [{x:60,y:30},{x:220,y:30},{x:50,y:100},{x:230,y:100}][i];
        const color = { syn: 'var(--c-success)', ant: 'var(--c-danger)', derive: 'var(--c-primary)' }[rel.kind];
        return (
          <g key={i}>
            <rect x={pos.x - 40} y={pos.y - 12} width="80" height="24" rx="12" fill="#fff" stroke={color} strokeWidth="1.4"/>
            <text x={pos.x} y={pos.y + 3} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--c-ink)" fontFamily="var(--font-display-en)">{rel.w}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Leaderboard ─────────────────────────────────────────────
function WebLeaderboard() {
  return (
    <div style={{ padding: 28, maxWidth: 900, margin: '0 auto' }}>
      <div className="aibd-display" style={{ fontSize: 30 }}>翡翠组排行</div>
      <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 4, marginBottom: 22 }}>本周前 10 名晋级铂金组 · 还剩 2 天</div>

      <Card pad={28} style={{ background: 'linear-gradient(135deg, var(--c-primary-soft) 0%, #fff 80%)', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 14 }}>
          <WebPodium rank={2} {...LEADERBOARD[1]} color="#C0C0C0"/>
          <WebPodium rank={1} {...LEADERBOARD[0]} color="var(--c-accent)" big/>
          <WebPodium rank={3} {...LEADERBOARD[2]} color="#CD7F32"/>
        </div>
      </Card>

      <Card pad={22}>
        {LEADERBOARD.slice(3).map((u, i) => (
          <div key={u.rank} style={{
            padding: '12px 16px', background: u.me ? 'var(--c-primary)' : 'transparent',
            color: u.me ? '#fff' : 'var(--c-ink)',
            borderRadius: 12, marginBottom: 4,
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: u.me ? 'var(--sh-cta)' : 'none',
            border: u.danger ? '1px dashed var(--c-danger)' : 'none',
            animation: 'slideUp .3s var(--ease) backwards', animationDelay: `${i * 0.03}s`,
            transform: u.me ? 'scale(1.01)' : 'scale(1)',
          }}>
            <div className="aibd-display-en" style={{ width: 28, fontWeight: 800, fontSize: 16, textAlign: 'center', opacity: u.me ? 1 : 0.5 }}>{u.rank}</div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: u.me ? 'rgba(255,255,255,0.25)' : 'var(--c-primary-soft)', display: 'grid', placeItems: 'center', fontSize: 22 }}>
              {u.avatar}
            </div>
            <div style={{ flex: 1, fontSize: 15, fontWeight: u.me ? 800 : 600 }}>{u.name}</div>
            <div className="aibd-display-en" style={{ fontWeight: 800, fontSize: 17, color: u.me ? 'var(--c-accent)' : 'var(--c-primary)' }}>{u.xp} XP</div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', textAlign: 'center', padding: '10px 0' }}>
          ─── 降级线 ───
        </div>
      </Card>
    </div>
  );
}
function WebPodium({ rank, name, xp, avatar, color, big }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', maxWidth: big ? 140 : 120 }}>
      <div style={{
        width: big ? 70 : 56, height: big ? 70 : 56, borderRadius: '50%',
        background: 'var(--c-primary-soft)', margin: '0 auto', position: 'relative',
        border: `4px solid ${color}`, display: 'grid', placeItems: 'center', fontSize: big ? 38 : 30,
      }}>
        {avatar}
        <div style={{
          position: 'absolute', top: -10, right: -8, width: 28, height: 28, borderRadius: '50%',
          background: color, color: rank === 1 ? 'var(--c-ink)' : '#fff',
          display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-display-en)',
        }}>{rank}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-ink)', marginTop: 10 }}>{name}</div>
      <div className="aibd-display-en" style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-primary)', marginTop: 4 }}>{xp} XP</div>
      <div style={{ height: big ? 80 : rank === 2 ? 60 : 40, background: color, opacity: 0.4, marginTop: 8, borderRadius: '8px 8px 0 0' }}/>
    </div>
  );
}

// ─── PK lobby ────────────────────────────────────────────────
function WebPK() {
  const r = useRouter();
  const [matching, setMatching] = React.useState(false);
  return (
    <div style={{ padding: 28, maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
      <Tag color="var(--c-pink)" bg="#FFE4ED"><Icon.swords s={12}/> 实时对战</Tag>
      <div className="aibd-display" style={{ fontSize: 36, marginTop: 12 }}>单词 PK</div>
      <div style={{ fontSize: 14, color: 'var(--c-ink-soft)', marginTop: 6, marginBottom: 24 }}>
        2 分钟 · 6 题分胜负 · 赢家得 80 XP + 30 💎
      </div>

      {/* hero illustration */}
      <div style={{ padding: 28, background: 'linear-gradient(135deg, #1A1340, #2B1F6E)', borderRadius: 22, color: '#fff', marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, margin: '0 auto', borderRadius: '50%', background: 'var(--c-primary)', display: 'grid', placeItems: 'center' }}>
              <WordyMini size={64}/>
            </div>
            <div className="aibd-display" style={{ fontSize: 18, marginTop: 10 }}>你</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Lv. 23 · 翡翠组</div>
          </div>
          <div className="aibd-display" style={{ fontSize: 36, color: 'var(--c-accent)' }}>VS</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, margin: '0 auto', borderRadius: '50%', background: 'var(--c-pink)', display: 'grid', placeItems: 'center', opacity: matching ? 1 : 0.5 }}>
              {matching ? <WordyMini size={64}/> : <span style={{ fontSize: 36 }}>?</span>}
            </div>
            <div className="aibd-display" style={{ fontSize: 18, marginTop: 10 }}>{matching ? '璐璐' : '匹配中...'}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{matching ? 'Lv. 25 · 翡翠组' : '同段位玩家'}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 22 }}>
        <Card pad={16}><div style={{ fontSize: 24, marginBottom: 4 }}>⚡</div><div style={{ fontSize: 13, fontWeight: 800 }}>实时对战</div><div style={{ fontSize: 11, color: 'var(--c-ink-soft)' }}>10 秒答题</div></Card>
        <Card pad={16}><div style={{ fontSize: 24, marginBottom: 4 }}>🎯</div><div style={{ fontSize: 13, fontWeight: 800 }}>6 题分胜负</div><div style={{ fontSize: 11, color: 'var(--c-ink-soft)' }}>错一题扣血</div></Card>
        <Card pad={16}><div style={{ fontSize: 24, marginBottom: 4 }}>💎</div><div style={{ fontSize: 13, fontWeight: 800 }}>赢家奖励</div><div style={{ fontSize: 11, color: 'var(--c-ink-soft)' }}>80 XP + 30 💎</div></Card>
      </div>

      <button onClick={() => alert('PK 在移动端体验更佳，请切换到手机视图')} style={{
        height: 56, padding: '0 48px', background: 'var(--c-pink)', color: '#fff', border: 'none',
        borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 0 #B33D6F',
      }}>开始匹配</button>
      <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', marginTop: 12 }}>
        PK 在手机视图（左侧 artboard）有完整可玩演示
      </div>
    </div>
  );
}

// ─── Story (Web version) ─────────────────────────────────────
function WebStory() {
  const [active, setActive] = React.useState(-1);
  const [playing, setPlaying] = React.useState(false);
  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setActive(p => {
      if (p + 1 >= STORY.paragraphs.length) { setPlaying(false); return p; }
      return p + 1;
    }), 2400);
    return () => clearInterval(t);
  }, [playing]);
  return (
    <div style={{ padding: 28, maxWidth: 760, margin: '0 auto' }}>
      <Tag color="var(--c-coral)" bg="#FFE9DE"><Icon.sparkle s={12}/> AI · 今日故事</Tag>
      <div className="aibd-display" style={{ fontSize: 36, marginTop: 10 }}>{STORY.title}</div>
      <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 6 }}>
        EP {STORY.ep} · 校园物语 · {STORY.cn} · 用今天复习的 12 个词写就
      </div>

      <div style={{
        height: 220, borderRadius: 24, marginTop: 18, marginBottom: 18, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--c-coral) 0%, var(--c-pink) 60%, var(--c-primary) 100%)',
      }}>
        <div style={{ position: 'absolute', inset: 0, padding: 28, display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={() => { if (active < 0) setActive(0); setPlaying(!playing); }} style={{
            width: 64, height: 64, borderRadius: '50%', background: '#fff', color: 'var(--c-coral)',
            border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          }}>
            {playing ? <Icon.pause s={28}/> : <Icon.speaker s={30}/>}
          </button>
        </div>
        <div style={{
          position: 'absolute', top: 18, right: 18, width: 80, height: 100,
          background: 'rgba(255,255,255,0.92)', borderRadius: 6, transform: 'rotate(8deg)',
          animation: 'drift 4s ease-in-out infinite',
        }}>
          <div style={{ height: 14, background: 'var(--c-primary)', borderRadius: '6px 6px 0 0'}}/>
          <div style={{ padding: 8 }}>{[1,1,0.8,1,0.7,0.9].map((w,i) => <div key={i} style={{ height: 2, background: 'var(--c-ink-faint)', marginBottom: 4, width: `${w * 100}%` }}/>)}</div>
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        {STORY.paragraphs.map((p, pi) => (
          <p key={pi} style={{
            fontSize: 19, color: 'var(--c-ink)', lineHeight: 1.85, fontFamily: 'var(--font-display-en)',
            padding: '12px 16px', borderRadius: 12, marginBottom: 8,
            background: pi === active ? 'var(--c-primary-soft)' : 'transparent', transition: 'background .3s',
          }}>
            {p.tokens.map((tok, ti) => tok.plain ? (
              <span key={ti}>{tok.t}</span>
            ) : (
              <span key={ti} style={{
                background: 'var(--c-accent)', padding: '0 5px', borderRadius: 4,
                color: 'var(--c-ink)', fontWeight: 700, cursor: 'pointer',
              }}>{tok.t}</span>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Profile ─────────────────────────────────────────────────
function WebProfile() {
  const { state } = useStore();
  return (
    <div style={{ padding: 28 }}>
      <div style={{
        padding: 28, borderRadius: 22, marginBottom: 18,
        background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-deep) 100%)',
        color: '#fff', position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', gap: 24,
      }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
          <Wordy size={90} pose="idle" mood="happy" form="star" glow={false}/>
        </div>
        <div style={{ flex: 1 }}>
          <div className="aibd-display" style={{ fontSize: 26 }}>小敏 同学</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>初三 · 加入第 124 天 · @xiaomin_2026</div>
          <div style={{ display: 'flex', gap: 22, marginTop: 12 }}>
            <div><div className="aibd-display-en" style={{ fontSize: 26, fontWeight: 800 }}>Lv. {state.level}</div><div style={{ fontSize: 10, opacity: 0.85 }}>等级</div></div>
            <div><div className="aibd-display-en" style={{ fontSize: 26, fontWeight: 800, color: 'var(--c-accent)' }}>{state.masteredCount.toLocaleString()}</div><div style={{ fontSize: 10, opacity: 0.85 }}>已掌握</div></div>
            <div><div className="aibd-display-en" style={{ fontSize: 26, fontWeight: 800 }}>{state.streak}</div><div style={{ fontSize: 10, opacity: 0.85 }}>连胜天数</div></div>
            <div><div className="aibd-display-en" style={{ fontSize: 26, fontWeight: 800 }}>12</div><div style={{ fontSize: 10, opacity: 0.85 }}>徽章</div></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
        <Card pad={22}>
          <div className="aibd-display" style={{ fontSize: 17, marginBottom: 14 }}>学习地图 · 近 90 天</div>
          <WebHeatmap/>
        </Card>
        <Card pad={22}>
          <div className="aibd-display" style={{ fontSize: 17, marginBottom: 14 }}>徽章</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Badge2 color="var(--c-streak)" icon="🔥" label="火热 30 天"/>
            <Badge2 color="var(--c-primary)" icon="📚" label="千词达成"/>
            <Badge2 color="var(--c-pink)" icon="⚔️" label="PK 王者"/>
            <Badge2 color="var(--c-mint)" icon="🌱" label="勤奋初心" dim/>
          </div>
        </Card>
      </div>

      <Card pad={22} style={{ marginTop: 14 }}>
        <div className="aibd-display" style={{ fontSize: 17, marginBottom: 14 }}>学习记录</div>
        {[
          { date: '今天', acts: [{ t: '完成情景闯关 · 20 词', xp: 240 }, { t: '看了 AI 故事 The Persistent Bookworm', xp: 50 }] },
          { date: '昨天', acts: [{ t: '完成 PK 对战', xp: 80 }, { t: '复习 14 词', xp: 168 }] },
          { date: '5 月 16 日', acts: [{ t: '完成进阶 20 词', xp: 240 }] },
        ].map((d, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', fontWeight: 800, letterSpacing: '0.06em', marginBottom: 6 }}>{d.date}</div>
            {d.acts.map((a, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--c-surface-soft)', borderRadius: 10, marginBottom: 4 }}>
                <div style={{ flex: 1, fontSize: 13 }}>{a.t}</div>
                <Tag color="var(--c-success)" bg="#DCFCE7" size="xs">+{a.xp} XP</Tag>
              </div>
            ))}
          </div>
        ))}
      </Card>
    </div>
  );
}

function WebHeatmap() {
  const weeks = 14, days = 7;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 4 }}>
      {[...Array(weeks)].map((_, w) => (
        <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[...Array(days)].map((_, d) => {
            const v = Math.max(0, Math.min(1, (Math.sin((w * 7 + d) * 0.6) + 0.5) / 1.5));
            const opacity = v < 0.1 ? 0 : v;
            return <div key={d} style={{
              aspectRatio: '1 / 1', borderRadius: 3,
              background: opacity === 0 ? 'var(--c-line)' : `color-mix(in srgb, var(--c-primary) ${opacity * 100}%, white)`,
            }}/>;
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Web settings ────────────────────────────────────────────
function WebSettings() {
  const [daily, setDaily] = React.useState(20);
  return (
    <div style={{ padding: 28, maxWidth: 720, margin: '0 auto' }}>
      <div className="aibd-display" style={{ fontSize: 30 }}>设置</div>
      <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 4, marginBottom: 22 }}>个性化你的学习计划</div>

      <Card pad={22} style={{ marginBottom: 14 }}>
        <SectionLabel2>每日新词量</SectionLabel2>
        <div className="aibd-display-en" style={{ fontSize: 44, fontWeight: 800, color: 'var(--c-primary)', textAlign: 'center', margin: '8px 0' }}>{daily}<span style={{ fontSize: 16, color: 'var(--c-ink-muted)' }}>词/天</span></div>
        <input type="range" min="5" max="80" step="5" value={daily} onChange={e => setDaily(+e.target.value)} style={{ width: '100%', accentColor: 'var(--c-primary)' }}/>
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--c-ink-muted)', textAlign: 'center' }}>
          ⏱ 预计每天用时 <b style={{ color: 'var(--c-ink)' }}>{Math.round(daily * 0.6)}</b> 分钟 · {Math.ceil(1600 / daily)} 天学完
        </div>
      </Card>

      {[
        ['提醒', [
          ['每日学习提醒', '19:00'],
          ['复习提醒', '🟢 已开启'],
          ['连胜保护', '🟢 已开启'],
        ]],
        ['偏好', [
          ['发音口音', '美音'],
          ['兴趣标签', '足球 · 动漫 · 4'],
          ['深色模式', '🔘 关闭'],
          ['AI 个性化例句', '🟢 已开启'],
        ]],
        ['账号', [
          ['手机号', '188****8888'],
          ['绑定家长', '已绑定'],
          ['注销账号', '⚠️'],
        ]],
      ].map(([cat, rows]) => (
        <Card key={cat} pad={22} style={{ marginBottom: 14 }}>
          <SectionLabel2>{cat}</SectionLabel2>
          <div style={{ marginTop: 10 }}>
            {rows.map(([l, r], i) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i === rows.length - 1 ? 'none' : '1px solid var(--c-line)', cursor: 'pointer' }}>
                <span style={{ fontSize: 14, color: 'var(--c-ink)' }}>{l}</span>
                <span style={{ fontSize: 13, color: 'var(--c-ink-soft)', display: 'flex', alignItems: 'center', gap: 4 }}>{r} <Icon.chevronR s={14}/></span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Study overlay ───────────────────────────────────────────
function WebStudyOverlay({ mode, words, onClose, onDone, results }) {
  const Modes = {
    mc: StudyMC, flip: StudyFlip, spell: StudySpell,
    listen: StudyListen, context: StudyContext, image: StudyImageMemory,
  };
  const Cmp = Modes[mode] || StudyMC;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center',
      animation: 'fadeIn .25s',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 380, height: 720, background: 'var(--c-bg)', borderRadius: 28,
        boxShadow: '0 30px 80px rgba(0,0,0,0.4)', overflow: 'hidden', position: 'relative',
        animation: 'pop .35s var(--ease)',
      }}>
        {results ? (
          <PhoneResult results={results} onClose={onClose}/>
        ) : (
          <Cmp words={words} onClose={onClose} onDone={onDone}/>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  WebDictionary, WebWordDetail, WebLeaderboard, WebPK, WebStory, WebProfile, WebSettings, WebStudyOverlay,
});
