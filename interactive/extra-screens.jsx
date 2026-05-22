// extra-screens.jsx — Mistakes notebook + Camera OCR + Paywall (phone)
// All hooked into the API mock layer for realistic loading states.

// ─── 错题本 ──────────────────────────────────────────────────
function PhoneMistakes({ onClose }) {
  const r = useRouter();
  const [filter, setFilter] = React.useState('all');
  const { data, loading } = useApi(() => api.getMistakes({ filter }), [filter]);

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)' }}>
      <PhoneHeader title="错题本" onBack={onClose} right={
        <button style={{ fontSize: 11, color: 'var(--c-primary)', fontWeight: 800, background: 'transparent', border: 'none', cursor: 'pointer' }}>导出 PDF</button>
      }/>

      <div className="aibd-scroll" style={{ position: 'absolute', inset: '88px 0 80px', overflow: 'auto', padding: '0 14px 16px' }}>
        {/* hero stats */}
        <Card pad={14} style={{ background: 'linear-gradient(135deg, #FFE4E4 0%, #fff 80%)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: 'var(--c-danger)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 24 }}>📛</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', fontWeight: 700 }}>本月错词</div>
              <div className="aibd-display-en" style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-ink)', lineHeight: 1, marginTop: 2 }}>
                {loading ? <Skeleton w={50} h={28}/> : data?.length} <span style={{ fontSize: 12, color: 'var(--c-ink-muted)' }}>个</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--c-success)', fontWeight: 700 }}>↓ 比上月</div>
              <div className="aibd-display-en" style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-success)' }}>-32%</div>
            </div>
          </div>
        </Card>

        {/* filter chips */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflow: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'all', l: '全部' },
            { id: 'frequent', l: '高频错（≥2 次）' },
            { id: 'mc', l: '选择' },
            { id: 'spell', l: '拼写' },
            { id: 'listen', l: '听力' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '5px 12px', borderRadius: 999, border: 'none',
              background: filter === f.id ? 'var(--c-danger)' : '#fff',
              color: filter === f.id ? '#fff' : 'var(--c-ink-soft)',
              fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
              boxShadow: filter === f.id ? '0 4px 0 #C9314D' : 'var(--sh-card)',
            }}>{f.l}</button>
          ))}
        </div>

        {loading ? (
          <>
            {[0,1,2,3].map(i => (
              <Card key={i} pad={12} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Skeleton w={40} h={40} radius={20}/>
                  <div style={{ flex: 1 }}>
                    <Skeleton w={100} h={14} style={{ marginBottom: 6 }}/>
                    <Skeleton w={140} h={10}/>
                  </div>
                </div>
              </Card>
            ))}
          </>
        ) : data?.map((m, i) => {
          const w = findWord(m.wordId);
          if (!w) return null;
          return (
            <button key={m.wordId} onClick={() => r.navigate('/word/' + m.wordId)} style={{
              width: '100%', padding: '12px 14px', background: '#fff', border: 'none',
              borderRadius: 14, marginBottom: 8, cursor: 'pointer', textAlign: 'left',
              boxShadow: 'var(--sh-card)',
              display: 'flex', alignItems: 'center', gap: 12,
              animation: 'slideUp .25s var(--ease) backwards', animationDelay: `${i * 0.04}s`,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, position: 'relative',
                background: 'color-mix(in srgb, var(--c-danger) 12%, white)',
                color: 'var(--c-danger)', display: 'grid', placeItems: 'center',
              }}>
                <span className="aibd-display-en" style={{ fontSize: 16, fontWeight: 800 }}>{w.word[0].toUpperCase()}</span>
                <div style={{
                  position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--c-danger)', color: '#fff', fontSize: 9, fontWeight: 800,
                  display: 'grid', placeItems: 'center',
                }}>{m.wrongTimes}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span className="aibd-display-en" style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-ink)' }}>{w.word}</span>
                  <span style={{ fontSize: 10, color: 'var(--c-ink-muted)' }}>{w.cn}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--c-ink-soft)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {modeIcon(m.mode)} {m.reason}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <ProgressRing value={m.mastery} size={28} stroke={3} color="var(--c-danger)"/>
                <div style={{ fontSize: 8, color: 'var(--c-ink-muted)', marginTop: 2 }}>{m.lastWrong}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* sticky CTA */}
      <div style={{ position: 'absolute', bottom: 16, left: 14, right: 14, zIndex: 35 }}>
        <CTA color="var(--c-danger)" size="lg" icon={<Icon.zap s={20} fill="#fff"/>}
          onClick={() => r.navigate('/study/mc')}>
          再练这 {data?.length || 5} 个错词
        </CTA>
      </div>
    </div>
  );
}
function modeIcon(mode) {
  return ({ mc: '🎯 选择题', spell: '⌨️ 拼写', listen: '🎧 听力', image: '🖼️ 图像', context: '✨ 情景', flip: '🃏 翻卡' })[mode] || mode;
}

// ─── 拍照查词 ────────────────────────────────────────────────
function PhoneCamera({ onClose }) {
  const r = useRouter();
  const { toast } = useStore();
  const [phase, setPhase] = React.useState('camera'); // camera | scanning | result
  const [picked, setPicked] = React.useState(new Set());
  const [result, setResult] = React.useState(null);

  const snap = () => {
    setPhase('scanning');
    api.ocrPhoto().then(r => {
      setResult(r);
      setPicked(new Set(r.words.filter(w => !w.known).map(w => w.id)));
      setPhase('result');
    });
  };

  const togglePick = (id) => {
    const n = new Set(picked);
    n.has(id) ? n.delete(id) : n.add(id);
    setPicked(n);
  };

  if (phase === 'camera') {
    return (
      <div style={{ height: '100%', background: '#000', position: 'relative', color: '#fff' }}>
        {/* simulated viewfinder */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(ellipse at 50% 50%, rgba(108,92,231,0.18), transparent 70%),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 30px),
            #1a1a1f
          `,
        }}/>

        {/* mocked textbook page */}
        <div style={{
          position: 'absolute', inset: '120px 30px 200px',
          background: '#f4ecd8', borderRadius: 12,
          padding: 24, color: '#3a3a3a',
          transform: 'perspective(700px) rotateX(8deg)',
          fontFamily: 'serif', fontSize: 11, lineHeight: 1.8,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Lesson 5 · The Bookworm</div>
          <div>
            Mia is an <u>ambitious</u> student. She wants to <u>achieve</u> her dream.
            Her teacher says she is <u>persistent</u> and willing to <u>determine</u>
            her own path with <u>perseverance</u> and <u>aspiration</u> for...
          </div>
        </div>

        {/* viewfinder frame */}
        <div style={{
          position: 'absolute', inset: '110px 24px 190px',
          border: '2px solid rgba(255,255,255,0.4)', borderRadius: 14,
          pointerEvents: 'none',
        }}>
          {['tl','tr','bl','br'].map(c => (
            <div key={c} style={{
              position: 'absolute', width: 22, height: 22,
              border: '3px solid var(--c-accent)',
              ...({ tl: { top: -2, left: -2, borderRight: 'none', borderBottom: 'none', borderTopLeftRadius: 14 },
                   tr: { top: -2, right: -2, borderLeft: 'none', borderBottom: 'none', borderTopRightRadius: 14 },
                   bl: { bottom: -2, left: -2, borderRight: 'none', borderTop: 'none', borderBottomLeftRadius: 14 },
                   br: { bottom: -2, right: -2, borderLeft: 'none', borderTop: 'none', borderBottomRightRadius: 14 } }[c]),
            }}/>
          ))}
        </div>

        {/* top header */}
        <div style={{ position: 'absolute', top: 46, left: 0, right: 0, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', color: '#fff', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <Icon.x s={20}/>
          </button>
          <div style={{ padding: '5px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', fontSize: 11, fontWeight: 700 }}>
            <Icon.sparkle s={11}/> AI · OCR 圈词
          </div>
          <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', color: '#fff', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            ⚡
          </button>
        </div>

        {/* bottom shutter */}
        <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, padding: '0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', cursor: 'pointer' }}>🖼️</button>
          <button onClick={snap} style={{
            width: 72, height: 72, borderRadius: '50%', background: '#fff',
            border: '4px solid rgba(255,255,255,0.4)', cursor: 'pointer',
            display: 'grid', placeItems: 'center', transition: 'transform .1s',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--c-primary)' }}/>
          </button>
          <button style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', cursor: 'pointer' }}>🔁</button>
        </div>

        <div style={{ position: 'absolute', bottom: 130, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
          对准课本，自动识别页面所有英文单词
        </div>
      </div>
    );
  }

  if (phase === 'scanning') {
    return (
      <div style={{ height: '100%', background: '#000', position: 'relative', color: '#fff', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, margin: '0 auto', position: 'relative' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                position: 'absolute', inset: 0, border: '2px solid var(--c-accent)', borderRadius: '50%',
                animation: `pop 1.8s ease-out ${i * 0.4}s infinite`, opacity: 0.5,
              }}/>
            ))}
            <div style={{ position: 'absolute', inset: 20, borderRadius: '50%', background: 'var(--c-primary)', display: 'grid', placeItems: 'center' }}>
              <Icon.sparkle s={28} fill="#fff"/>
            </div>
          </div>
          <div className="aibd-display" style={{ fontSize: 18, marginTop: 18 }}>AI 识别中...</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>Wordy 正在帮你圈出生词</div>
        </div>
      </div>
    );
  }

  // RESULT phase
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', position: 'relative' }}>
      <PhoneHeader title="识别结果" onBack={() => setPhase('camera')} right={
        <Tag color="var(--c-mint)" bg="#D4F8EF" size="xs">{result.detected} 个英文词</Tag>
      }/>

      <div className="aibd-scroll" style={{ position: 'absolute', inset: '88px 0 90px', overflow: 'auto', padding: '0 14px' }}>
        {/* photo preview with bounding boxes */}
        <div style={{
          position: 'relative', height: 180, borderRadius: 14, overflow: 'hidden',
          background: '#f4ecd8', marginBottom: 14,
        }}>
          <div style={{ padding: 14, color: '#3a3a3a', fontFamily: 'serif', fontSize: 10, lineHeight: 1.7 }}>
            <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 6 }}>Lesson 5 · The Bookworm</div>
            <div>Mia is an ambitious student. She wants to achieve her dream. Her teacher says she is persistent and willing to determine her own path with perseverance and aspiration for...</div>
          </div>
          {result.words.map(w => (
            <div key={w.id} style={{
              position: 'absolute', left: `${w.x}%`, top: `${w.y}%`,
              padding: '1px 6px', fontSize: 9, fontWeight: 800, borderRadius: 4,
              background: w.isNew ? 'var(--c-coral)' : (w.known ? 'var(--c-success)' : 'var(--c-warning)'),
              color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              animation: 'pop .4s var(--ease) backwards',
              animationDelay: `${0.05 * parseInt(w.id.replace(/\D/g, '') || 0)}s`,
            }}>{w.word}</div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 12, fontSize: 9 }}>
          <Tag color="var(--c-success)" bg="#DCFCE7" size="xs">● 已学</Tag>
          <Tag color="var(--c-warning)" bg="rgba(255,176,32,0.15)" size="xs">● 待复习</Tag>
          <Tag color="var(--c-coral)" bg="#FFE9DE" size="xs">● 新词</Tag>
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-ink-soft)', marginBottom: 8, letterSpacing: '0.06em' }}>
          建议加入复习计划 · 已选 {picked.size}
        </div>

        {result.words.map(w => {
          const word = findWord(w.id) || { word: w.word, cn: w.isNew ? '（新词）' : '', pos: '' };
          const isPicked = picked.has(w.id);
          return (
            <button key={w.id} onClick={() => togglePick(w.id)} style={{
              width: '100%', padding: '10px 14px',
              background: isPicked ? 'var(--c-primary-soft)' : '#fff',
              border: `2px solid ${isPicked ? 'var(--c-primary)' : 'transparent'}`,
              borderRadius: 12, marginBottom: 6, cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: 'var(--sh-card)',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: isPicked ? 'var(--c-primary)' : '#fff',
                border: `2px solid ${isPicked ? 'var(--c-primary)' : 'var(--c-line)'}`,
                display: 'grid', placeItems: 'center', color: '#fff',
              }}>{isPicked && <Icon.check s={14}/>}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span className="aibd-display-en" style={{ fontSize: 14, fontWeight: 700 }}>{w.word}</span>
                  {w.isNew && <Tag color="var(--c-coral)" bg="#FFE9DE" size="xs">NEW</Tag>}
                  {w.known && <Tag color="var(--c-success)" bg="#DCFCE7" size="xs">已掌握</Tag>}
                </div>
                <div style={{ fontSize: 10, color: 'var(--c-ink-soft)', marginTop: 2 }}>
                  {word.pos} {word.cn} · 置信度 {Math.round(w.conf * 100)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ position: 'absolute', bottom: 16, left: 14, right: 14, zIndex: 35 }}>
        <CTA color="var(--c-primary)" size="lg" icon={<Icon.plus s={20}/>}
          onClick={() => { toast(`已添加 ${picked.size} 个词到复习计划`, 'success'); setTimeout(() => r.navigate('/review'), 600); }}>
          加入复习计划（{picked.size} 个）
        </CTA>
      </div>
    </div>
  );
}

// ─── 付费墙 (Paywall) ───────────────────────────────────────
function PhonePaywall({ onClose }) {
  const r = useRouter();
  const { toast } = useStore();
  const { data: plans, loading } = useApi(() => api.getPlans(), []);
  const [picked, setPicked] = React.useState('yearly');

  return (
    <div style={{ height: '100%', background: 'linear-gradient(180deg, #1A1340 0%, #2B1F6E 60%, #1A1340 100%)', position: 'relative', color: '#fff', overflow: 'hidden' }}>
      {/* sparkles bg */}
      {[...Array(30)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${(i * 31) % 100}%`, top: `${(i * 17) % 100}%`,
          width: 3 + (i % 3), height: 3 + (i % 3),
          background: ['var(--c-accent)','#fff','var(--c-pink)'][i % 3],
          borderRadius: '50%', opacity: 0.4 + (i % 3) * 0.2,
          animation: `drift ${3 + (i % 4)}s ease-in-out ${i * 0.1}s infinite`,
        }}/>
      ))}

      <div style={{ padding: '46px 16px 0', position: 'relative', zIndex: 2 }}>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: '#fff', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <Icon.x s={18}/>
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <Wordy size={110} pose="celebrate" mood="cheer" form="rocket"/>
          </div>
          <div className="aibd-display" style={{ fontSize: 26, marginTop: 10 }}>
            <span style={{ background: 'linear-gradient(90deg, var(--c-accent), var(--c-pink))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>升级 PRO</span>
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>解锁全部 AI 能力 · 加速 3 倍背单词</div>
        </div>
      </div>

      <div className="aibd-scroll" style={{ position: 'absolute', inset: '230px 0 240px', overflow: 'auto', padding: '0 16px', zIndex: 2 }}>
        {/* feature comparison */}
        <div style={{
          padding: 16, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
          borderRadius: 18, border: '1px solid rgba(255,255,255,0.15)', marginBottom: 12,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-accent)', letterSpacing: '0.08em', marginBottom: 12 }}>PRO 独享</div>
          {[
            { icon: '✨', t: 'AI 每日故事', s: '不限次数（免费 1 次/天）', free: false },
            { icon: '📷', t: '拍照查词 OCR', s: '无限识别（免费 5 次/月）', free: false },
            { icon: '🧠', t: '记忆图谱', s: '完整词根 + 词族关联', free: false },
            { icon: '🎯', t: 'AI 个性化例句', s: '根据你的兴趣生成', free: false },
            { icon: '⚔️', t: '单词 PK 段位赛', s: '冲击王者段位', free: false },
            { icon: '🏆', t: '专属 Pro 徽章', s: '排行榜身份标识', free: false },
            { icon: '🚫', t: '去除全部广告', s: '纯净学习体验', free: false },
            { icon: '📊', t: '深度学习数据', s: '导出周报 / 月报 PDF', free: false },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <div style={{ fontSize: 20 }}>{f.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{f.t}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 1 }}>{f.s}</div>
              </div>
              <Icon.check s={18}/>
            </div>
          ))}
        </div>

        {/* social proof */}
        <div style={{
          padding: 14, background: 'rgba(255,214,10,0.12)', borderRadius: 14, marginBottom: 12,
          border: '1px solid rgba(255,214,10,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            ⭐⭐⭐⭐⭐
            <span style={{ fontSize: 11, fontWeight: 700 }}>4.9 · 12 万 + Pro 用户</span>
          </div>
          <div style={{ fontSize: 11, opacity: 0.85, fontStyle: 'italic' }}>
            "升级 Pro 三个月，词汇量从 800 涨到 2500。AI 故事真的很会写。" — 北京 初三 子萱
          </div>
        </div>
      </div>

      {/* sticky bottom plan picker */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px 22px', zIndex: 5, background: 'linear-gradient(180deg, transparent 0%, #1A1340 30%)' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {loading ? <Skeleton w="100%" h={68}/> : plans?.map(p => {
            const sel = picked === p.id;
            return (
              <button key={p.id} onClick={() => setPicked(p.id)} style={{
                flex: 1, padding: '10px 8px', borderRadius: 12,
                background: sel ? '#fff' : 'rgba(255,255,255,0.10)',
                color: sel ? 'var(--c-primary-deep)' : '#fff',
                border: `2px solid ${sel ? 'var(--c-accent)' : 'rgba(255,255,255,0.18)'}`,
                cursor: 'pointer', position: 'relative',
              }}>
                {p.tag && (
                  <div style={{
                    position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
                    padding: '1px 8px', borderRadius: 999, background: 'var(--c-accent)',
                    color: 'var(--c-ink)', fontSize: 9, fontWeight: 800, whiteSpace: 'nowrap',
                  }}>{p.tag}</div>
                )}
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7 }}>{p.name}</div>
                <div className="aibd-display-en" style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
                  ¥{p.price}
                </div>
                <div style={{ fontSize: 9, opacity: 0.6, marginTop: 1 }}>
                  {p.perMonth ? `¥${p.perMonth}/月` : '一次买断'}
                  {p.save > 0 && ` · 省 ¥${p.save}`}
                </div>
              </button>
            );
          })}
        </div>
        <CTA color="var(--c-accent)" textColor="var(--c-ink)" size="lg"
          onClick={() => { toast('🎉 升级成功！'); setTimeout(onClose, 1000); }}>
          立即升级 PRO 🚀
        </CTA>
        <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
          支持微信 / 支付宝 · 可随时取消 · 隐私协议
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PhoneMistakes, PhoneCamera, PhonePaywall, modeIcon });
