// phone-screens-2.jsx — Word detail / Onboarding / Settings

// ─── Word detail ─────────────────────────────────────────────
function PhoneWordDetail({ wordId, onClose }) {
  const r = useRouter();
  const w = findWord(wordId) || WORDS[0];
  const [tab, setTab] = React.useState('def');
  const [fav, setFav] = React.useState(false);
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', position: 'relative' }}>
      {/* hero */}
      <div style={{
        padding: '46px 16px 16px',
        background: 'linear-gradient(180deg, var(--c-primary-soft) 0%, var(--c-bg) 100%)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--c-ink-soft)', padding: 0 }}>
            <Icon.chevronL s={22}/>
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setFav(!fav)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', color: fav ? 'var(--c-warning)' : 'var(--c-ink-faint)', border: 'none', cursor: 'pointer' }}>
              <Icon.star s={16} fill="currentColor"/>
            </button>
            <button onClick={() => r.navigate('/map/' + w.id)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', color: 'var(--c-primary)', border: 'none', cursor: 'pointer' }}>
              <Icon.brain s={16}/>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }} className="aibd-anim-pop">
          <div className="aibd-display-en" style={{ fontSize: 34, color: 'var(--c-ink)', lineHeight: 1 }}>{w.word}</div>
          <button style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--c-primary)', color: '#fff',
            border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer',
            boxShadow: 'var(--sh-cta)',
          }}><Icon.speaker s={16}/></button>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
          <span className="aibd-mono" style={{ fontSize: 11, color: 'var(--c-ink-muted)' }}>{w.ipa}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {w.tags.map(tg => <Tag key={tg} color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">{tg}</Tag>)}
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '0 16px 8px', borderBottom: '1px solid var(--c-line)' }}>
        {[['def','释义/例句'],['map','联想图谱'],['related','派生词组']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '8px 0', flex: 1, border: 'none', background: 'transparent',
            borderBottom: tab === id ? '2px solid var(--c-primary)' : '2px solid transparent',
            color: tab === id ? 'var(--c-primary)' : 'var(--c-ink-muted)',
            fontSize: 12, fontWeight: tab === id ? 800 : 600,
            cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      <div className="aibd-scroll" style={{ position: 'absolute', inset: '212px 0 0', overflow: 'auto', padding: '12px 14px 80px' }}>
        {tab === 'def' && <>
          <Card pad={14} style={{ marginBottom: 10 }}>
            <SectionLabel2>释义</SectionLabel2>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <span style={{ fontFamily: 'var(--font-display-en)', fontWeight: 700, fontSize: 11, color: 'var(--c-primary)', minWidth: 24 }}>{w.pos}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--c-ink)', fontWeight: 600 }}>{w.cn}</div>
                <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 3 }}>{w.cnLong}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, padding: '8px 10px', background: 'var(--c-surface-soft)', borderRadius: 10, fontSize: 11, color: 'var(--c-ink-soft)' }}>
              💡 {w.etym}
            </div>
          </Card>
          <Card pad={14}>
            <SectionLabel2>例句</SectionLabel2>
            {w.examples.map((ex, i) => (
              <div key={i} style={{ padding: '10px 12px', background: 'var(--c-surface-soft)', borderRadius: 12, marginTop: 8 }}>
                <div style={{ fontSize: 13, color: 'var(--c-ink)', lineHeight: 1.5, marginBottom: 4 }}>
                  {ex.en.split(new RegExp(`(${w.word})`, 'i')).map((p, j) => p.toLowerCase() === w.word.toLowerCase()
                    ? <b key={j} style={{ color: 'var(--c-primary)' }}>{p}</b>
                    : <span key={j}>{p}</span>)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', lineHeight: 1.5 }}>{ex.cn}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <Tag color="var(--c-coral)" bg="#FFE9DE" size="xs">{ex.tag}</Tag>
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--c-primary)', cursor: 'pointer', padding: 0 }}>
                    <Icon.speaker s={14}/>
                  </button>
                </div>
              </div>
            ))}
          </Card>
        </>}
        {tab === 'map' && (
          <Card pad={14} style={{ background: 'linear-gradient(135deg, var(--c-primary-soft) 0%, #fff 80%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Tag color="var(--c-primary)" bg="rgba(255,255,255,0.9)"><Icon.sparkle s={10}/> AI 联想图谱</Tag>
              <button onClick={() => r.navigate('/map/' + w.id)} style={{ fontSize: 11, color: 'var(--c-primary)', background: 'transparent', border: 'none', fontWeight: 700, cursor: 'pointer' }}>查看完整 ›</button>
            </div>
            <MiniMap word={w}/>
          </Card>
        )}
        {tab === 'related' && (
          <Card pad={14}>
            <SectionLabel2>派生 · 词组</SectionLabel2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {w.related.map(rel => (
                <div key={rel.w} style={{
                  padding: '6px 10px', background: 'var(--c-surface-soft)',
                  borderRadius: 999, fontSize: 11, color: 'var(--c-ink)',
                }}>
                  <b style={{ fontFamily: 'var(--font-display-en)' }}>{rel.w}</b>
                  <span style={{ color: 'var(--c-ink-muted)', marginLeft: 4 }}>{rel.t}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
function SectionLabel2({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '0.1em' }}>{children}</div>;
}
function MiniMap({ word }) {
  return (
    <svg viewBox="0 0 280 130" style={{ width: '100%', height: 130 }}>
      <g stroke="var(--c-primary)" strokeWidth="1.4" fill="none" opacity="0.4" strokeDasharray="3 4">
        <path d="M140 65 L 60 30"/>
        <path d="M140 65 L 220 30"/>
        <path d="M140 65 L 50 100"/>
        <path d="M140 65 L 230 100"/>
      </g>
      <g>
        <circle cx="140" cy="65" r="28" fill="var(--c-primary)"/>
        <text x="140" y="60" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" opacity="0.7">{word.pos}</text>
        <text x="140" y="74" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="var(--font-display-en)">{word.word}</text>
      </g>
      {word.related.slice(0, 4).map((rel, i) => {
        const pos = [{x:60,y:30},{x:220,y:30},{x:50,y:100},{x:230,y:100}][i];
        const color = { syn: 'var(--c-success)', ant: 'var(--c-danger)', derive: 'var(--c-primary)' }[rel.kind];
        return (
          <g key={i}>
            <rect x={pos.x - 38} y={pos.y - 11} width="76" height="22" rx="11" fill="#fff" stroke={color} strokeWidth="1.2"/>
            <text x={pos.x} y={pos.y + 3} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--c-ink)" fontFamily="var(--font-display-en)">{rel.w}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Onboarding ──────────────────────────────────────────────
function PhoneOnboarding({ onDone }) {
  const [step, setStep] = React.useState(0);
  const [goal, setGoal] = React.useState(1);
  const [grade, setGrade] = React.useState(2);
  const [interests, setInterests] = React.useState(['sports']);
  const [daily, setDaily] = React.useState(20);

  const totalSteps = 4;

  const goals = [
    { i: '🎓', t: '冲刺中考', s: '1600 词 · 6 个月' },
    { i: '📘', t: '冲刺高考', s: '3500 词 · 12 个月' },
    { i: '🌍', t: '雅思 / 托福', s: '6.5+ 起步' },
    { i: '✨', t: '词汇兴趣', s: '随心学，无压力' },
  ];

  const grades = ['初一','初二','初三','高一','高二','高三'];

  const ints = [
    { id: 'sports', i: '⚽', t: '运动' },
    { id: 'anime', i: '🎮', t: '动漫' },
    { id: 'music', i: '🎵', t: '音乐' },
    { id: 'tech', i: '💻', t: '科技' },
    { id: 'food', i: '🍔', t: '美食' },
    { id: 'travel', i: '✈️', t: '旅行' },
  ];

  const next = () => step + 1 >= totalSteps ? onDone?.() : setStep(step + 1);
  const back = () => step > 0 && setStep(step - 1);

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '50px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={back} disabled={step === 0} style={{
          width: 28, height: 28, border: 'none', background: 'transparent',
          color: step === 0 ? 'var(--c-ink-faint)' : 'var(--c-ink-soft)',
          cursor: step === 0 ? 'default' : 'pointer', padding: 0,
        }}><Icon.chevronL s={20}/></button>
        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: i <= step ? 'var(--c-primary)' : 'var(--c-ink-faint)',
              transition: 'background .3s',
            }}/>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--c-ink-muted)', fontWeight: 700 }}>{step + 1}/{totalSteps}</span>
      </div>

      <div className="aibd-scroll" style={{ flex: 1, padding: '20px 20px 0', overflow: 'auto' }} key={step}>
        <div className="aibd-anim-slideUp">
        {step === 0 && (
          <>
            <Wordy size={120} pose="think" mood="happy"/>
            <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)', marginTop: 12 }}>你的目标是？</div>
            <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginBottom: 18 }}>Wordy 会据此定制学习计划</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {goals.map((g, i) => (
                <button key={i} onClick={() => setGoal(i)} style={{
                  padding: '12px 14px', background: '#fff',
                  border: `2px solid ${i === goal ? 'var(--c-primary)' : 'var(--c-line)'}`,
                  borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer', textAlign: 'left',
                  boxShadow: i === goal ? '0 2px 0 var(--c-primary)' : '0 2px 0 var(--c-line)',
                }}>
                  <div style={{ fontSize: 22 }}>{g.i}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{g.t}</div>
                    <div style={{ fontSize: 10, color: 'var(--c-ink-muted)' }}>{g.s}</div>
                  </div>
                  {i === goal && <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--c-primary)', color: '#fff', display: 'grid', placeItems: 'center' }}><Icon.check s={12}/></div>}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📚</div>
            <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)' }}>你在读几年级？</div>
            <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginBottom: 18 }}>用于推荐合适的词书</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {grades.map((g, i) => (
                <button key={g} onClick={() => setGrade(i)} style={{
                  padding: '14px 12px', background: i === grade ? 'var(--c-primary)' : '#fff',
                  color: i === grade ? '#fff' : 'var(--c-ink)',
                  border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: 'var(--sh-card)',
                }}>{g}</button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✨</div>
            <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)' }}>你的兴趣有？</div>
            <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginBottom: 18 }}>AI 会用你的兴趣给你写专属例句</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {ints.map(it => {
                const on = interests.includes(it.id);
                return (
                  <button key={it.id} onClick={() => setInterests(on ? interests.filter(x => x !== it.id) : [...interests, it.id])} style={{
                    padding: '12px 8px', background: on ? 'var(--c-primary)' : '#fff',
                    color: on ? '#fff' : 'var(--c-ink)',
                    border: 'none', borderRadius: 12, cursor: 'pointer',
                    boxShadow: on ? 'var(--sh-cta)' : 'var(--sh-card)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}>
                    <div style={{ fontSize: 28 }}>{it.i}</div>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{it.t}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⏰</div>
            <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)' }}>每天打算学多少词？</div>
            <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginBottom: 24 }}>可以随时调整</div>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="aibd-display-en" style={{ fontSize: 56, fontWeight: 800, color: 'var(--c-primary)', lineHeight: 1 }}>
                {daily}<span style={{ fontSize: 16, color: 'var(--c-ink-muted)' }}> 词 / 天</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 8 }}>
                预计 <b style={{ color: 'var(--c-ink)' }}>{Math.round(daily * 0.6)}</b> 分钟 · {Math.ceil(1600 / daily)} 天完成中考核心
              </div>
            </div>
            <input type="range" min="5" max="80" step="5" value={daily} onChange={e => setDaily(+e.target.value)} style={{
              width: '100%', accentColor: 'var(--c-primary)',
            }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--c-ink-muted)', marginTop: 4 }}>
              <span>5</span><span>20</span><span>40</span><span>60</span><span>80</span>
            </div>
          </>
        )}
        </div>
      </div>

      <div style={{ padding: '14px 18px 24px' }}>
        <CTA color="var(--c-primary)" size="lg" onClick={next}>
          {step + 1 >= totalSteps ? '开始学习 🚀' : '下一步'}
        </CTA>
      </div>
    </div>
  );
}

// ─── Settings ────────────────────────────────────────────────
function PhoneSettings({ onClose }) {
  const [daily, setDaily] = React.useState(20);
  const [reminderOn, setReminderOn] = React.useState(true);
  const [aiOn, setAiOn] = React.useState(true);
  const [streakProt, setStreakProt] = React.useState(true);
  const [dark, setDark] = React.useState(false);

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)' }}>
      <PhoneHeader title="学习计划" onBack={onClose}/>
      <div className="aibd-scroll" style={{ position: 'absolute', inset: '88px 0 0', overflow: 'auto', padding: '0 14px 24px' }}>
        <Card pad={16} style={{ marginBottom: 10 }}>
          <SectionLabel2>每日新词量</SectionLabel2>
          <div className="aibd-display-en" style={{ fontSize: 32, fontWeight: 800, color: 'var(--c-primary)', textAlign: 'center', margin: '6px 0' }}>{daily}<span style={{ fontSize: 13, color: 'var(--c-ink-muted)' }}>词 / 天</span></div>
          <input type="range" min="5" max="80" step="5" value={daily} onChange={e => setDaily(+e.target.value)} style={{ width: '100%', accentColor: 'var(--c-primary)' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--c-ink-muted)', marginTop: 4 }}>
            <span>5</span><span>20</span><span>40</span><span>60</span><span>80</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 10, color: 'var(--c-ink-muted)', textAlign: 'center' }}>
            ⏱ 预计每天用时 <b style={{ color: 'var(--c-ink)' }}>{Math.round(daily * 0.6)}</b> 分钟
          </div>
        </Card>

        <Card pad={16} style={{ marginBottom: 10 }}>
          <SectionLabel2>当前词书</SectionLabel2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <div style={{
              width: 50, height: 64, borderRadius: 6,
              background: 'linear-gradient(135deg, var(--c-primary), var(--c-primary-deep))',
              color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              padding: 6, fontFamily: 'var(--font-display-en)',
            }}>
              <div style={{ fontSize: 7, opacity: 0.7 }}>中考</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>1600</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)' }}>中考核心 1600</div>
              <div style={{ fontSize: 10, color: 'var(--c-ink-soft)', marginTop: 1 }}>人教版 · 1284 / 1600 已学</div>
              <ProgressBar value={0.8} height={5}/>
            </div>
          </div>
        </Card>

        <Card pad={16} style={{ marginBottom: 10 }}>
          <SectionLabel2>提醒</SectionLabel2>
          <SettingRow2 label="每日学习提醒" right={<Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">19:00</Tag>}/>
          <SettingRow2 label="复习提醒" right={<Toggle2 on={reminderOn} onToggle={() => setReminderOn(!reminderOn)}/>}/>
          <SettingRow2 label="学习连胜保护" right={<Toggle2 on={streakProt} onToggle={() => setStreakProt(!streakProt)}/>}/>
          <SettingRow2 label="AI 个性化例句" right={<Toggle2 on={aiOn} onToggle={() => setAiOn(!aiOn)}/>} last/>
        </Card>

        <Card pad={16}>
          <SectionLabel2>偏好</SectionLabel2>
          <SettingRow2 label="发音口音" right={<span style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>美音 ›</span>}/>
          <SettingRow2 label="兴趣标签" right={<span style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>足球 · 动漫 · 4 ›</span>}/>
          <SettingRow2 label="深色模式" right={<Toggle2 on={dark} onToggle={() => setDark(!dark)}/>} last/>
        </Card>
      </div>
    </div>
  );
}
function SettingRow2({ label, right, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: last ? 'none' : '1px solid var(--c-line)' }}>
      <span style={{ fontSize: 13, color: 'var(--c-ink)' }}>{label}</span>
      {right}
    </div>
  );
}
function Toggle2({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width: 40, height: 22, borderRadius: 999, border: 'none', padding: 0,
      background: on ? 'var(--c-primary)' : 'var(--c-ink-faint)',
      position: 'relative', cursor: 'pointer', transition: 'background .2s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)', transition: 'left .2s',
      }}/>
    </button>
  );
}

Object.assign(window, { PhoneWordDetail, PhoneOnboarding, PhoneSettings });
