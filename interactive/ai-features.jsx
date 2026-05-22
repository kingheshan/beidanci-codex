// ai-features.jsx — production-grade AI features
// 1. AI Daily Story — read along with word tap, audio progress, comprehension Q
// 2. Word PK — real-time match w/ countdown timer, opponent simulator
// 3. AI Memory Map — interactive force-graph of word relations

// ─── 1 · AI Daily Story (read-along) ──────────────────────────
function DailyStory({ onClose }) {
  const r = useRouter();
  const { toast } = useStore();
  const [activeP, setActiveP] = React.useState(-1);      // paragraph being read
  const [playing, setPlaying] = React.useState(false);
  const [pop, setPop] = React.useState(null);            // popover {wid, x, y}
  const intervalRef = React.useRef(null);

  // Auto-advance reading: 2.4s per paragraph
  React.useEffect(() => {
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      setActiveP(p => {
        if (p + 1 >= STORY.paragraphs.length) {
          setPlaying(false);
          return p;
        }
        return p + 1;
      });
    }, 2400);
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  const togglePlay = () => {
    if (activeP < 0) setActiveP(0);
    setPlaying(p => !p);
  };

  const onWordTap = (wid, e) => {
    e.stopPropagation();
    setPop({ wid });
  };

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', position: 'relative' }}>
      <PhoneHeader title="" onBack={onClose} right={
        <Tag color="var(--c-coral)" bg="#FFE9DE" size="xs"><Icon.sparkle s={10}/> AI 故事</Tag>
      }/>

      <div className="aibd-scroll" style={{ position: 'absolute', inset: '88px 0 90px', overflow: 'auto', padding: '0 16px' }}>
        {/* hero */}
        <div style={{
          height: 170, borderRadius: 22, marginBottom: 16, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--c-coral) 0%, var(--c-pink) 60%, var(--c-primary) 100%)',
        }}>
          <div style={{ position: 'absolute', inset: 0, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: '#fff' }}>
            <div style={{ fontSize: 9, opacity: 0.85, fontWeight: 700, letterSpacing: '0.1em' }}>EPISODE {STORY.ep} · 校园物语</div>
            <div className="aibd-display" style={{ fontSize: 22, marginTop: 2 }}>{STORY.title}</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{STORY.cn} · 用今天复习的 12 个词写就</div>
          </div>
          <div style={{
            position: 'absolute', top: 16, right: 16, width: 60, height: 76,
            background: 'rgba(255,255,255,0.92)', borderRadius: 4, transform: 'rotate(8deg)',
            boxShadow: '0 8px 22px rgba(0,0,0,0.22)',
            animation: 'drift 4s ease-in-out infinite',
          }}>
            <div style={{ height: 11, background: 'var(--c-primary)', borderRadius: '4px 4px 0 0'}}/>
            <div style={{ padding: 5 }}>
              {[1,1,0.8,1,0.7].map((w,i) => <div key={i} style={{ height: 2, background: 'var(--c-ink-faint)', marginBottom: 3, width: `${w * 100}%` }}/>)}
            </div>
          </div>
        </div>

        {/* paragraphs */}
        <div style={{ marginBottom: 16 }}>
          {STORY.paragraphs.map((p, pi) => (
            <p key={pi} style={{
              fontSize: 16, color: 'var(--c-ink)', lineHeight: 1.85,
              fontFamily: 'var(--font-display-en)',
              padding: '8px 10px', borderRadius: 10,
              background: pi === activeP ? 'var(--c-primary-soft)' : 'transparent',
              transition: 'background .3s', margin: '0 -10px 6px',
            }}>
              {p.tokens.map((tok, ti) => tok.plain ? (
                <span key={ti}>{tok.t}</span>
              ) : (
                <span key={ti} onClick={(e) => onWordTap(tok.wid, e)} style={{
                  background: 'var(--c-accent)', padding: '0 4px', borderRadius: 4,
                  color: 'var(--c-ink)', fontWeight: 700, cursor: 'pointer',
                  boxShadow: pop?.wid === tok.wid ? '0 0 0 2px var(--c-primary)' : 'none',
                  transition: 'box-shadow .15s',
                }}>{tok.t}</span>
              ))}
            </p>
          ))}
        </div>

        {/* words occurred */}
        <Card pad={14} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-ink-soft)', marginBottom: 8, letterSpacing: '0.06em' }}>
            出现的复习词 · 5 / 12
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {WORDS.slice(0, 5).map(w => (
              <button key={w.id} onClick={() => r.navigate('/word/' + w.id)} style={{
                padding: '4px 10px', background: 'var(--c-primary-soft)', border: 'none',
                color: 'var(--c-primary-ink)', borderRadius: 999, fontSize: 11, fontWeight: 700,
                fontFamily: 'var(--font-display-en)', cursor: 'pointer',
              }}>{w.word}</button>
            ))}
            <div style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              fontFamily: 'var(--font-display-en)', color: 'var(--c-ink-muted)',
              border: '1px dashed var(--c-ink-faint)',
            }}>+ 7 more</div>
          </div>
        </Card>

        {/* comprehension */}
        <Card pad={14} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-coral)', marginBottom: 6, letterSpacing: '0.06em' }}>
            <Icon.sparkle s={10}/> AI 理解检测
          </div>
          <div style={{ fontSize: 13, color: 'var(--c-ink)', marginBottom: 10, lineHeight: 1.5 }}>
            What kind of student was Mia?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <ChoiceButton shortcut="A" label="An ambitious and persistent ninth grader" state="idle"/>
            <ChoiceButton shortcut="B" label="A lazy student who often gives up" state="idle"/>
          </div>
        </Card>
      </div>

      {/* fixed player bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 88,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--c-line)',
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 30,
      }}>
        <button onClick={togglePlay} style={{
          width: 46, height: 46, borderRadius: '50%', border: 'none',
          background: 'var(--c-primary)', color: '#fff', cursor: 'pointer',
          display: 'grid', placeItems: 'center', boxShadow: 'var(--sh-cta)',
        }}>
          {playing ? <Icon.pause s={20}/> : <Icon.speaker s={22}/>}
        </button>
        <div style={{ flex: 1 }}>
          <ProgressBar value={(activeP + 1) / STORY.paragraphs.length} height={6} color="var(--c-primary)"/>
          <div className="aibd-mono" style={{ fontSize: 10, color: 'var(--c-ink-muted)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
            <span>0:{String((activeP + 1) * 24).padStart(2,'0')}</span>
            <span>2:24</span>
          </div>
        </div>
        <button style={{
          height: 36, padding: '0 14px', borderRadius: 999, border: '1px solid var(--c-line)',
          background: '#fff', color: 'var(--c-ink-soft)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>跟读</button>
      </div>

      {/* word popover */}
      {pop && <WordPopover wid={pop.wid} onClose={() => setPop(null)}/>}
    </div>
  );
}

function WordPopover({ wid, onClose }) {
  const w = findWord(wid);
  if (!w) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 50, animation: 'fadeIn .2s' }}/>
      <div style={{
        position: 'absolute', bottom: 100, left: 16, right: 16, zIndex: 51,
        background: '#fff', borderRadius: 20, padding: 16, boxShadow: 'var(--sh-pop)',
        animation: 'slideUp .3s var(--ease)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div className="aibd-display-en" style={{ fontSize: 22, color: 'var(--c-ink)' }}>{w.word}</div>
            <div className="aibd-mono" style={{ fontSize: 11, color: 'var(--c-ink-muted)', marginTop: 2 }}>{w.ipa}</div>
          </div>
          <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--c-primary)', color: '#fff', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Icon.speaker s={16}/>
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--c-primary)', fontWeight: 800 }}>{w.pos}</div>
        <div className="aibd-display" style={{ fontSize: 18, color: 'var(--c-ink)', marginTop: 2 }}>{w.cn}</div>
        <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 6, padding: 10, background: 'var(--c-surface-soft)', borderRadius: 10 }}>
          💡 {w.etym}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <CTA color="var(--c-surface)" textColor="var(--c-ink)" size="sm" style={{ flex: 1, boxShadow: '0 2px 0 var(--c-line)', border: '1.5px solid var(--c-line)' }}>加入复习</CTA>
          <CTA color="var(--c-primary)" size="sm" style={{ flex: 1 }} onClick={onClose}>知道了</CTA>
        </div>
      </div>
    </>
  );
}

// ─── 2 · Word PK match ───────────────────────────────────────
function PKMatch({ onClose }) {
  const { award, toast } = useStore();
  const [phase, setPhase] = React.useState('matching');  // matching | playing | won | lost
  const [round, setRound] = React.useState(0);
  const [myHP, setMyHP] = React.useState(1);
  const [oppHP, setOppHP] = React.useState(1);
  const [secLeft, setSecLeft] = React.useState(10);
  const [picked, setPicked] = React.useState(null);
  const [oppReact, setOppReact] = React.useState(null);  // 'fast' | 'slow' | 'wrong'
  const timerRef = React.useRef(null);

  const total = 6;
  const questions = WORDS.slice(0, total);

  // simulated matchmaking
  React.useEffect(() => {
    if (phase !== 'matching') return;
    const t = setTimeout(() => setPhase('playing'), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  // countdown
  React.useEffect(() => {
    if (phase !== 'playing') return;
    clearInterval(timerRef.current);
    setSecLeft(10);
    timerRef.current = setInterval(() => {
      setSecLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          // timeout = wrong
          handleAnswer(null);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [round, phase]);

  // opponent answers randomly between 2-7s
  React.useEffect(() => {
    if (phase !== 'playing') return;
    const oppMs = 2000 + Math.random() * 5000;
    const oppCorrect = Math.random() < 0.7;
    const t = setTimeout(() => {
      setOppReact(oppCorrect ? 'fast' : 'wrong');
      if (!oppCorrect) {
        setOppHP(h => Math.max(0, h - 0.18));
      }
    }, oppMs);
    return () => clearTimeout(t);
  }, [round, phase]);

  function handleAnswer(opt) {
    clearInterval(timerRef.current);
    setPicked(opt);
    const w = questions[round];
    const correct = opt?.id === w.id;
    if (!correct) setMyHP(h => Math.max(0, h - 0.18));
    setTimeout(() => {
      const me2 = correct ? myHP : Math.max(0, myHP - 0.18);
      // advance
      if (round + 1 >= total) {
        setPhase(me2 > oppHP ? 'won' : 'lost');
        if (me2 > oppHP) award({ xp: 80, gems: 30 });
      } else {
        setRound(round + 1);
        setPicked(null);
        setOppReact(null);
      }
    }, 1400);
  }

  const w = questions[round];
  const opts = React.useMemo(() => {
    if (!w) return [];
    const others = WORDS.filter(x => x.id !== w.id).slice(0, 3);
    return [w, ...others].sort((a, b) => (a.id.charCodeAt(1) - b.id.charCodeAt(1) + round * 3) % 7 - 3);
  }, [w, round]);

  if (phase === 'matching') return <PKMatching onCancel={onClose}/>;
  if (phase === 'won' || phase === 'lost') return <PKResult won={phase === 'won'} myHP={myHP} oppHP={oppHP} onClose={onClose}/>;

  return (
    <div style={{ height: '100%', background: 'linear-gradient(180deg, #1A1340 0%, #2B1F6E 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <svg viewBox="0 0 320 700" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, opacity: 0.12 }}>
        <path d="M0 200 L 320 200 M0 400 L 320 400" stroke="#fff" strokeWidth="0.5"/>
        <path d="M50 0 L 50 700 M270 0 L 270 700" stroke="#fff" strokeWidth="0.5" strokeDasharray="2 6"/>
      </svg>

      <div style={{ padding: '46px 16px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}><Icon.x s={22}/></button>
          <Tag color="#fff" bg="rgba(255,255,255,0.15)" size="xs"><Icon.swords s={10}/> 第 {round + 1} 题 / {total}</Tag>
          <div className="aibd-display-en" style={{ fontSize: 18, color: secLeft <= 3 ? 'var(--c-danger)' : 'var(--c-accent)', fontWeight: 800, animation: secLeft <= 3 ? 'pulse 1s infinite' : '' }}>
            0:{String(secLeft).padStart(2, '0')}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
          <PKPlayer name="你" hp={myHP} color="var(--c-primary)"/>
          <div className="aibd-display" style={{ fontSize: 28, color: 'var(--c-accent)', alignSelf: 'center' }}>VS</div>
          <PKPlayer name="璐璐" hp={oppHP} color="var(--c-pink)" right reacting={oppReact}/>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 16px', position: 'relative', zIndex: 2, marginTop: 30 }}>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: 8 }}>选出意为</div>
        <div style={{
          padding: '20px 16px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
          borderRadius: 18, textAlign: 'center', marginBottom: 14,
          border: '1px solid rgba(255,255,255,0.15)',
          animation: 'pop .35s var(--ease)',
        }} key={round}>
          <div className="aibd-display" style={{ fontSize: 24, color: 'var(--c-accent)' }}>「{w.cn}」</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{w.pos}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {opts.map((o) => {
            const isPicked = picked?.id === o.id;
            const correct = o.id === w.id;
            let bg = 'rgba(255,255,255,0.10)', col = '#fff';
            if (picked) {
              if (isPicked && correct) { bg = 'var(--c-success)'; col = '#fff'; }
              else if (isPicked && !correct) { bg = 'var(--c-danger)'; col = '#fff'; }
              else if (correct) { bg = 'var(--c-success)'; col = '#fff'; }
              else { bg = 'rgba(255,255,255,0.05)'; col = 'rgba(255,255,255,0.5)'; }
            }
            return (
              <button key={o.id} onClick={() => !picked && handleAnswer(o)} disabled={!!picked} style={{
                minHeight: 64, padding: 12, borderRadius: 14, cursor: picked ? 'default' : 'pointer',
                background: bg, color: col, border: '1px solid rgba(255,255,255,0.18)',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
                boxShadow: isPicked && correct ? '0 0 16px var(--c-success)' : 'none',
                transition: 'all .2s',
              }}>
                <div style={{ fontSize: 11, opacity: 0.75 }}>{o.cn}</div>
                <div className="aibd-display-en" style={{ fontSize: 16, fontWeight: 800 }}>{o.word}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PKPlayer({ name, hp, color, right, reacting }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: right ? 'flex-end' : 'flex-start', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: right ? 'row-reverse' : 'row' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: color,
          display: 'grid', placeItems: 'center',
          boxShadow: reacting === 'fast' ? `0 0 0 4px ${color}66` : 'none',
          transition: 'box-shadow .2s',
        }}>
          <WordyMini size={32}/>
        </div>
        <div style={{ textAlign: right ? 'right' : 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 700 }}>{name}</div>
          <div style={{ fontSize: 9, opacity: 0.7 }}>{reacting === 'wrong' ? '❌ 答错' : reacting === 'fast' ? '⚡ 答对' : ''}</div>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <ProgressBar value={hp} height={6} color={hp < 0.3 ? 'var(--c-danger)' : color} bg="rgba(255,255,255,0.12)"/>
      </div>
    </div>
  );
}

function PKMatching({ onCancel }) {
  return (
    <div style={{ height: '100%', background: 'linear-gradient(180deg, #1A1340 0%, #2B1F6E 100%)', color: '#fff', display: 'grid', placeItems: 'center', position: 'relative' }}>
      <button onClick={onCancel} style={{ position: 'absolute', top: 56, left: 16, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><Icon.x s={22}/></button>
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 30px' }}>
          {/* expanding rings */}
          {[0,1,2].map(i => (
            <div key={i} style={{
              position: 'absolute', inset: 0, border: '2px solid var(--c-accent)', borderRadius: '50%',
              animation: `pop 2s ease-out ${i * 0.6}s infinite`, opacity: 0.4,
            }}/>
          ))}
          <div style={{ position: 'absolute', inset: 40, borderRadius: '50%', background: 'var(--c-primary)', display: 'grid', placeItems: 'center' }}>
            <WordyMini size={80}/>
          </div>
        </div>
        <div className="aibd-display" style={{ fontSize: 22 }}>正在匹配对手...</div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>翡翠组 · Lv. 21-25</div>
      </div>
    </div>
  );
}

function PKResult({ won, myHP, oppHP, onClose }) {
  return (
    <div style={{
      height: '100%',
      background: won ? 'linear-gradient(180deg, var(--c-primary) 0%, var(--c-primary-deep) 100%)' : 'linear-gradient(180deg, #4D2330 0%, #2B1340 100%)',
      color: '#fff', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      {/* confetti */}
      {won && [...Array(20)].map((_,i) => (
        <div key={i} style={{
          position: 'absolute', top: -20,
          left: `${(i * 17) % 100}%`,
          width: 8, height: 8,
          background: ['var(--c-accent)','var(--c-pink)','var(--c-mint)','#fff'][i%4],
          borderRadius: i%2 ? '50%' : 1,
          animation: `confettiFall ${2 + (i%3)}s ease-in ${(i * 0.1)}s infinite`,
        }}/>
      ))}
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center' }}>
          <Wordy size={120} pose={won ? 'celebrate' : 'idle'} mood={won ? 'cheer' : 'sad'} form={won ? 'star' : 'bean'}/>
          <div className="aibd-display" style={{ fontSize: 32, marginTop: 16 }}>{won ? 'VICTORY!' : 'DEFEAT'}</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
            {won ? '+ 80 XP · + 30 💎' : '再来一局！'}
          </div>
        </div>
      </div>
      <div style={{ padding: '0 16px 28px', position: 'relative', zIndex: 2 }}>
        <CTA color="#fff" textColor={won ? 'var(--c-primary-deep)' : '#1A1340'} size="lg" onClick={onClose}>
          {won ? '继续' : '再来一局'}
        </CTA>
      </div>
    </div>
  );
}

// ─── 3 · AI Memory Map (interactive force graph) ─────────────
function MemoryMap({ wordId, onClose, onNavigate }) {
  const w = findWord(wordId) || WORDS[0];
  const [selected, setSelected] = React.useState(null);

  const nodes = React.useMemo(() => {
    const center = { id: w.id, label: w.word, pos: w.pos, kind: 'center', x: 50, y: 50 };
    const relPos = [
      { x: 18, y: 22 }, { x: 78, y: 22 }, { x: 12, y: 65 }, { x: 86, y: 65 },
      { x: 50, y: 12 }, { x: 30, y: 85 }, { x: 75, y: 88 },
    ];
    const rels = w.related.slice(0, 4).map((r, i) => ({
      id: 'r' + i, label: r.w, sub: r.t, kind: r.kind, x: relPos[i].x, y: relPos[i].y,
    }));
    return [center, ...rels];
  }, [w]);

  const kindColor = {
    syn: 'var(--c-success)',
    ant: 'var(--c-danger)',
    derive: 'var(--c-primary)',
    center: 'var(--c-primary-deep)',
  };

  return (
    <div style={{ height: '100%', background: 'linear-gradient(180deg, #1A1340 0%, #2B1F6E 100%)', color: '#fff', position: 'relative' }}>
      <PhoneHeader title="" onBack={onClose} right={
        <Tag color="#fff" bg="rgba(255,255,255,0.18)" size="xs"><Icon.sparkle s={10}/> AI 记忆图谱</Tag>
      }/>

      {/* graph */}
      <div style={{ position: 'absolute', inset: '88px 0 200px' }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {nodes.slice(1).map(n => (
            <g key={n.id}>
              <line x1="50" y1="50" x2={n.x} y2={n.y}
                stroke={kindColor[n.kind]} strokeWidth="0.4"
                strokeDasharray="1 1.5" opacity="0.5"/>
            </g>
          ))}
        </svg>

        {/* nodes */}
        {nodes.map(n => {
          const isCenter = n.kind === 'center';
          const size = isCenter ? 86 : 64;
          return (
            <button key={n.id} onClick={() => !isCenter && setSelected(n)} style={{
              position: 'absolute', left: `${n.x}%`, top: `${n.y}%`,
              transform: 'translate(-50%,-50%)',
              width: size, height: size, borderRadius: '50%',
              border: 'none', cursor: isCenter ? 'default' : 'pointer',
              background: isCenter
                ? `radial-gradient(circle at 30% 30%, var(--c-primary), var(--c-primary-deep))`
                : '#fff',
              color: isCenter ? '#fff' : 'var(--c-ink)',
              boxShadow: isCenter
                ? '0 12px 32px rgba(108,92,231,0.5), inset 0 -4px 8px rgba(0,0,0,0.15)'
                : '0 6px 18px rgba(0,0,0,0.3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              animation: isCenter ? 'pulse 2.5s ease-in-out infinite' : 'pop .4s var(--ease)',
              animationDelay: `${0.05 * parseInt(n.id.replace(/\D/g,'') || 0)}s`,
              padding: 0,
            }}>
              <div className="aibd-display-en" style={{ fontSize: isCenter ? 14 : 11, fontWeight: 800, padding: '0 4px', textAlign: 'center', lineHeight: 1.1 }}>
                {n.label}
              </div>
              {!isCenter && (
                <div style={{ fontSize: 8, color: kindColor[n.kind], marginTop: 2, fontWeight: 700 }}>{n.sub}</div>
              )}
              {!isCenter && (
                <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: kindColor[n.kind], color: '#fff', fontSize: 8, fontWeight: 800, display: 'grid', placeItems: 'center', textTransform: 'uppercase' }}>
                  {n.kind[0]}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* legend + bottom card */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 16, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        color: 'var(--c-ink)', maxHeight: 200, zIndex: 30,
      }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 10 }}>
          <Tag color="var(--c-success)" bg="#DCFCE7" size="xs">S · 同义</Tag>
          <Tag color="var(--c-danger)" bg="#FFE2E5" size="xs">A · 反义</Tag>
          <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">D · 派生</Tag>
        </div>
        {selected ? (
          <div style={{ animation: 'slideUp .25s var(--ease)' }}>
            <div className="aibd-display-en" style={{ fontSize: 18, color: 'var(--c-ink)' }}>{selected.label}</div>
            <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 2 }}>{selected.sub}</div>
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--c-ink-muted)' }}>
              点击中心词查看完整释义
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 12, color: 'var(--c-ink-soft)' }}>
            点击外圈节点查看关联词
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { DailyStory, PKMatch, MemoryMap, WordPopover });
