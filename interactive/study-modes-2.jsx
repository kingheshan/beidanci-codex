// study-modes-2.jsx — Spell + Listen + Context + Image modes

// ─── Mode 3 · 拼写填空 ────────────────────────────────────────
function StudySpell({ words, onClose, onDone }) {
  const sess = useStudySession({ words });
  const w = sess.current;
  const target = (w?.word || '').toUpperCase();
  const [typed, setTyped] = React.useState('');

  // Generate a shuffled letter pad: all needed letters + 3 distractors
  const pad = React.useMemo(() => {
    if (!w) return [];
    const need = target.split('');
    const distractors = ['X','Z','Q','J','K','Y'].filter(c => !need.includes(c)).slice(0, 4);
    return [...need, ...distractors].sort((a, b) => a.localeCompare(b) + (a.charCodeAt(0) % 3) - 1);
  }, [w]);
  const [usedIdx, setUsedIdx] = React.useState([]);

  React.useEffect(() => { setTyped(''); setUsedIdx([]); }, [sess.idx]);

  // Auto-submit when all slots filled
  React.useEffect(() => {
    if (sess.phase !== 'asking') return;
    if (typed.length === target.length && target.length > 0) {
      const correct = typed === target;
      setTimeout(() => sess.submit(correct), 250);
    }
  }, [typed, target, sess.phase]);

  if (sess.phase === 'done') {
    onDone?.(sess.results);
    return <StudyDoneStub results={sess.results} onClose={onClose}/>;
  }

  const tapLetter = (i) => {
    if (sess.phase !== 'asking') return;
    if (usedIdx.includes(i)) return;
    if (typed.length >= target.length) return;
    setTyped(typed + pad[i]);
    setUsedIdx([...usedIdx, i]);
  };
  const backspace = () => {
    if (sess.phase !== 'asking' || typed.length === 0) return;
    setTyped(typed.slice(0, -1));
    setUsedIdx(usedIdx.slice(0, -1));
  };

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <StudyHeader progress={sess.progress} hearts={sess.hearts} idx={sess.idx} total={sess.total} onClose={onClose}/>
      <div style={{ flex: 1, padding: '0 16px 200px', display: 'flex', flexDirection: 'column', animation: 'slideRight .3s var(--ease)' }} key={w.id}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <Tag color="var(--c-primary)" bg="var(--c-primary-soft)">拼写</Tag>
        </div>

        <div style={{ padding: 16, background: '#fff', borderRadius: 20, boxShadow: 'var(--sh-card)', textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--c-primary)', fontWeight: 800 }}>{w.pos}</div>
          <div className="aibd-display" style={{ fontSize: 20, color: 'var(--c-ink)', marginTop: 4 }}>{w.cn}</div>
          <button style={{
            marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', background: 'var(--c-primary-soft)', borderRadius: 999,
            color: 'var(--c-primary)', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
          }}>
            <Icon.speaker s={12}/> 听发音
          </button>
        </div>

        {/* slots */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center', marginBottom: 16 }}
             className={sess.shake ? 'aibd-anim-shake' : ''}>
          {target.split('').map((c, i) => {
            const filled = i < typed.length;
            const isOk = sess.phase === 'revealing' && typed[i] === c;
            const isErr = sess.phase === 'revealing' && typed[i] !== c;
            return (
              <div key={i} style={{
                width: 22, height: 30, borderRadius: 6,
                background: filled
                  ? (isErr ? 'var(--c-danger)' : isOk ? 'var(--c-success)' : 'var(--c-primary)')
                  : 'transparent',
                color: filled ? '#fff' : 'var(--c-ink)',
                border: filled ? 'none' : '2px solid var(--c-ink-faint)',
                borderBottom: filled ? 'none' : '3px solid var(--c-ink-muted)',
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--font-display-en)', fontWeight: 800, fontSize: 14,
                transition: 'all .2s var(--ease)',
                animation: filled && i === typed.length - 1 ? 'pop .25s' : '',
              }}>{filled ? typed[i] : ''}</div>
            );
          })}
        </div>

        {/* hint */}
        <div style={{ padding: '8px 12px', background: 'rgba(255,176,32,0.12)', borderRadius: 10, fontSize: 11, color: '#8A5A00', textAlign: 'center', marginBottom: 14 }}>
          💡 {w.etym}
        </div>

        <div style={{ flex: 1 }}/>

        {/* letter pad */}
        <div style={{ padding: 14, background: '#fff', borderRadius: 20, boxShadow: 'var(--sh-card)', marginBottom: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center', marginBottom: 8 }}>
            {pad.map((k, i) => {
              const used = usedIdx.includes(i);
              return (
                <button key={i} onClick={() => tapLetter(i)} disabled={used} style={{
                  width: 32, height: 36, borderRadius: 8, border: 'none',
                  background: used ? 'var(--c-bg-deep)' : 'var(--c-surface-soft)',
                  color: used ? 'var(--c-ink-faint)' : 'var(--c-ink)',
                  fontFamily: 'var(--font-display-en)', fontWeight: 800, fontSize: 14,
                  boxShadow: used ? 'none' : '0 2px 0 var(--c-line)',
                  cursor: used ? 'default' : 'pointer',
                  opacity: used ? 0.4 : 1, transition: 'all .15s',
                }}>{k}</button>
              );
            })}
          </div>
          <button onClick={backspace} style={{
            width: '100%', padding: '6px', borderRadius: 8, border: 'none',
            background: 'transparent', color: 'var(--c-ink-muted)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>← 删除</button>
        </div>
      </div>
      {sess.phase === 'revealing' && <StudyFeedback correct={typed === target} word={w} onNext={sess.next}/>}
    </div>
  );
}

// ─── Mode 4 · 听音辨义 ────────────────────────────────────────
function StudyListen({ words, onClose, onDone }) {
  const sess = useStudySession({ words });
  const w = sess.current;
  const [playing, setPlaying] = React.useState(false);
  const [picked, setPicked] = React.useState(null);
  const [speed, setSpeed] = React.useState(1);

  const options = React.useMemo(() => {
    if (!w) return [];
    const others = WORDS.filter(x => x.id !== w.id).slice(0, 3);
    const arr = [{ ...w, isCorrect: true }, ...others.map(o => ({ ...o, isCorrect: false }))];
    return arr.sort((a, b) => (a.word.length * 7 + w.id.charCodeAt(1)) % 13 - 6);
  }, [w]);

  React.useEffect(() => { setPicked(null); setPlaying(false); }, [sess.idx]);

  // Auto-play on entry
  React.useEffect(() => {
    if (sess.phase !== 'asking' || !w) return;
    const t = setTimeout(() => { setPlaying(true); setTimeout(() => setPlaying(false), 1200); }, 250);
    return () => clearTimeout(t);
  }, [w?.id, sess.phase]);

  if (sess.phase === 'done') {
    onDone?.(sess.results);
    return <StudyDoneStub results={sess.results} onClose={onClose}/>;
  }

  const replay = () => { setPlaying(true); setTimeout(() => setPlaying(false), 1200); };
  const onPick = (o) => {
    if (sess.phase !== 'asking' || picked) return;
    setPicked(o);
    sess.submit(o.isCorrect);
  };

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <StudyHeader progress={sess.progress} hearts={sess.hearts} idx={sess.idx} total={sess.total} onClose={onClose}/>
      <div style={{ flex: 1, padding: '0 16px 200px', display: 'flex', flexDirection: 'column', animation: 'slideRight .3s var(--ease)' }} key={w.id}>
        <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', fontWeight: 700, marginBottom: 12 }}>
          听一听，选出正确的释义
        </div>

        <div onClick={replay} style={{
          padding: '24px 14px', background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-deep) 100%)',
          borderRadius: 24, textAlign: 'center', marginBottom: 14, color: '#fff',
          position: 'relative', overflow: 'hidden', cursor: 'pointer',
        }}>
          {/* expanding rings while playing */}
          {playing && [0,1,2].map(i => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 60, height: 60, borderRadius: '50%',
              border: '2px solid #fff', opacity: 0.5,
              transform: 'translate(-50%,-50%)',
              animation: `pop 1.2s ease-out ${i * 0.3}s infinite`,
              pointerEvents: 'none',
            }}/>
          ))}
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#fff', color: 'var(--c-primary)',
            display: 'inline-grid', placeItems: 'center', marginBottom: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            position: 'relative', zIndex: 2,
            transform: playing ? 'scale(1.08)' : 'scale(1)', transition: 'transform .2s',
          }}>
            <Icon.speaker s={28}/>
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, fontWeight: 700, letterSpacing: '0.06em', position: 'relative', zIndex: 2 }}>
            点击重听 · 倍速 {speed}×
          </div>
          {/* speed pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 8, position: 'relative', zIndex: 2 }}>
            {[0.75, 1, 1.25].map(s => (
              <button key={s} onClick={(e) => { e.stopPropagation(); setSpeed(s); }} style={{
                padding: '2px 10px', borderRadius: 999,
                background: s === speed ? '#fff' : 'rgba(255,255,255,0.18)',
                color: s === speed ? 'var(--c-primary)' : '#fff',
                border: 'none', fontSize: 10, fontWeight: 800, cursor: 'pointer',
              }}>{s}×</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map((o, i) => {
            let s = 'idle';
            if (picked) {
              if (o.id === picked.id) s = o.isCorrect ? 'correct' : 'wrong';
              else if (sess.phase === 'revealing' && o.isCorrect) s = 'correct';
              else s = 'disabled';
            }
            return (
              <ChoiceButton key={o.id} shortcut={String.fromCharCode(65 + i)} label={o.cnLong} state={s} onClick={() => onPick(o)}/>
            );
          })}
        </div>
      </div>
      {sess.phase === 'revealing' && <StudyFeedback correct={picked?.isCorrect} word={w} onNext={sess.next}/>}
    </div>
  );
}

// ─── Mode 5 · 例句情景 (AI 个性化) ────────────────────────────
function StudyContext({ words, onClose, onDone }) {
  const sess = useStudySession({ words });
  const w = sess.current;
  const [picked, setPicked] = React.useState(null);

  React.useEffect(() => setPicked(null), [sess.idx]);

  const options = React.useMemo(() => {
    if (!w) return [];
    const others = WORDS.filter(x => x.id !== w.id).slice(0, 3);
    return [{ ...w, isCorrect: true }, ...others.map(o => ({ ...o, isCorrect: false }))]
      .sort((a, b) => (a.word.length + w.id.length) % 7 - 3);
  }, [w]);

  if (sess.phase === 'done') {
    onDone?.(sess.results);
    return <StudyDoneStub results={sess.results} onClose={onClose}/>;
  }

  const sentence = w?.examples?.[1] || w?.examples?.[0]; // prefer the AI one
  const tokens = (sentence?.en || '').split(new RegExp(`(${w.word})`, 'i'));

  const onPick = (o) => {
    if (sess.phase !== 'asking' || picked) return;
    setPicked(o);
    sess.submit(o.isCorrect);
  };

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <StudyHeader progress={sess.progress} hearts={sess.hearts} idx={sess.idx} total={sess.total} onClose={onClose}/>
      <div style={{ flex: 1, padding: '0 16px 200px', display: 'flex', flexDirection: 'column', animation: 'slideRight .3s var(--ease)' }} key={w.id}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Tag color="var(--c-coral)" bg="#FFE9DE"><Icon.sparkle s={10}/> AI 情景</Tag>
          <span style={{ fontSize: 10, color: 'var(--c-ink-muted)' }}>{sentence?.tag}</span>
        </div>

        <div style={{
          height: 110, borderRadius: 18, marginBottom: 14, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-pink) 60%, var(--c-coral) 100%)',
        }}>
          <div style={{ position: 'absolute', top: 12, right: 12, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', animation: 'drift 4s ease-in-out infinite' }}/>
          <div style={{ position: 'absolute', bottom: 8, left: 12, color: '#fff' }}>
            <div style={{ fontSize: 9, opacity: 0.85, fontWeight: 700, letterSpacing: '0.08em' }}>SCENE</div>
            <div className="aibd-display" style={{ fontSize: 15, marginTop: 1 }}>校园 · 你在初三</div>
          </div>
        </div>

        <div style={{ padding: 14, background: '#fff', borderRadius: 18, boxShadow: 'var(--sh-card)', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', fontWeight: 700, marginBottom: 6 }}>选出正确的词填入空格</div>
          <div className="aibd-display-en" style={{ fontSize: 16, color: 'var(--c-ink)', lineHeight: 1.5 }}>
            {tokens.map((t, i) => t.toLowerCase() === w.word.toLowerCase() ? (
              <span key={i} style={{
                display: 'inline-block', padding: '2px 14px', minWidth: 80, textAlign: 'center',
                background: picked ? (picked.isCorrect ? 'var(--c-success)' : 'var(--c-danger)') : 'var(--c-accent)',
                borderRadius: 6, color: picked ? '#fff' : 'var(--c-ink)', fontWeight: 800,
              }}>{picked ? picked.word : '______'}</span>
            ) : <span key={i}>{t}</span>)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 8, lineHeight: 1.5 }}>
            「{sentence?.cn}」
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {options.map((o, i) => {
            let s = 'idle';
            if (picked) {
              if (o.id === picked.id) s = o.isCorrect ? 'correct' : 'wrong';
              else if (sess.phase === 'revealing' && o.isCorrect) s = 'correct';
              else s = 'disabled';
            }
            return (
              <ChoiceButton key={o.id} en={o.word} label={o.cn} state={s} onClick={() => onPick(o)}/>
            );
          })}
        </div>
      </div>
      {sess.phase === 'revealing' && <StudyFeedback correct={picked?.isCorrect} word={w} onNext={sess.next}/>}
    </div>
  );
}

// ─── Mode 6 · 图像联想 ────────────────────────────────────────
function StudyImageMemory({ words, onClose, onDone }) {
  const sess = useStudySession({ words });
  const w = sess.current;
  const [picked, setPicked] = React.useState(null);

  React.useEffect(() => setPicked(null), [sess.idx]);

  // Per-word: 1 correct image concept + 3 distractor concepts
  const grid = React.useMemo(() => {
    if (!w) return [];
    const concepts = {
      w1: { ok: { emoji: '⛰️', color: 'linear-gradient(135deg,#6C5CE7,#4A3BC7)', caption: '攀登不止' },
            d: [{ emoji: '🌪️', color: 'linear-gradient(135deg,#54C7FF,#1B7FB8)', caption: '风暴' },
                { emoji: '🛏️', color: 'linear-gradient(135deg,#FF8A65,#E55A2B)', caption: '休息' },
                { emoji: '⚡', color: 'linear-gradient(135deg,#FFB020,#E07B00)', caption: '闪电' }] },
      w2: { ok: { emoji: '🎯', color: 'linear-gradient(135deg,#FF6B9D,#C9314D)', caption: '目标向上' },
            d: [{ emoji: '🍔', color: 'linear-gradient(135deg,#FFB020,#E07B00)', caption: '满足' },
                { emoji: '🌊', color: 'linear-gradient(135deg,#54C7FF,#1B7FB8)', caption: '海洋' },
                { emoji: '🛋️', color: 'linear-gradient(135deg,#FF8A65,#E55A2B)', caption: '舒适' }] },
      w3: { ok: { emoji: '🏆', color: 'linear-gradient(135deg,#FFD60A,#E0A500)', caption: '到达终点' },
            d: [{ emoji: '🌧️', color: 'linear-gradient(135deg,#54C7FF,#1B7FB8)', caption: '失败' },
                { emoji: '🛑', color: 'linear-gradient(135deg,#FF5A6F,#C9314D)', caption: '停止' },
                { emoji: '😴', color: 'linear-gradient(135deg,#9890B5,#5B5582)', caption: '懈怠' }] },
      w4: { ok: { emoji: '🌍', color: 'linear-gradient(135deg,#00D4AA,#0E8B5C)', caption: '我们的世界' },
            d: [{ emoji: '🚗', color: 'linear-gradient(135deg,#FF5A6F,#C9314D)', caption: '汽车' },
                { emoji: '📱', color: 'linear-gradient(135deg,#9890B5,#5B5582)', caption: '设备' },
                { emoji: '🍕', color: 'linear-gradient(135deg,#FFB020,#E07B00)', caption: '食物' }] },
      w5: { ok: { emoji: '🌱', color: 'linear-gradient(135deg,#2ECC71,#1F9D58)', caption: '可持续的生长' },
            d: [{ emoji: '🔥', color: 'linear-gradient(135deg,#FF6B6B,#C9314D)', caption: '燃烧' },
                { emoji: '💨', color: 'linear-gradient(135deg,#54C7FF,#1B7FB8)', caption: '消散' },
                { emoji: '⚡', color: 'linear-gradient(135deg,#FFB020,#E07B00)', caption: '一瞬' }] },
      w6: { ok: { emoji: '✊', color: 'linear-gradient(135deg,#6C5CE7,#4A3BC7)', caption: '下定决心' },
            d: [{ emoji: '🤷', color: 'linear-gradient(135deg,#9890B5,#5B5582)', caption: '犹豫' },
                { emoji: '🎲', color: 'linear-gradient(135deg,#FF8A65,#E55A2B)', caption: '随机' },
                { emoji: '💭', color: 'linear-gradient(135deg,#54C7FF,#1B7FB8)', caption: '幻想' }] },
    }[w.id];
    if (!concepts) return [];
    const arr = [{ ...concepts.ok, ok: true }, ...concepts.d.map(d => ({ ...d, ok: false }))];
    return arr.sort((a, b) => (a.caption.length + w.id.length) % 5 - 2);
  }, [w]);

  if (sess.phase === 'done') {
    onDone?.(sess.results);
    return <StudyDoneStub results={sess.results} onClose={onClose}/>;
  }

  const onPick = (g, i) => {
    if (sess.phase !== 'asking' || picked !== null) return;
    setPicked(i);
    sess.submit(g.ok);
  };

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <StudyHeader progress={sess.progress} hearts={sess.hearts} idx={sess.idx} total={sess.total} onClose={onClose}/>
      <div style={{ flex: 1, padding: '0 16px 200px', display: 'flex', flexDirection: 'column', animation: 'slideRight .3s var(--ease)' }} key={w.id}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', fontWeight: 700, marginBottom: 6 }}>下面哪幅图能表示</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#fff', borderRadius: 999, boxShadow: 'var(--sh-card)' }}>
            <div className="aibd-display-en" style={{ fontSize: 20, color: 'var(--c-ink)' }}>{w.word}</div>
            <button style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--c-primary-soft)', color: 'var(--c-primary)', display: 'grid', placeItems: 'center', border: 'none', cursor: 'pointer' }}>
              <Icon.speaker s={13}/>
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {grid.map((g, i) => {
            const isPicked = picked === i;
            const showCorrect = sess.phase === 'revealing' && g.ok;
            const showWrong = sess.phase === 'revealing' && isPicked && !g.ok;
            return (
              <button key={i} onClick={() => onPick(g, i)} style={{
                aspectRatio: '1 / 1.05', borderRadius: 18, background: g.color,
                opacity: picked !== null && !isPicked && !g.ok ? 0.5 : 1,
                border: showCorrect ? '4px solid var(--c-success)' : showWrong ? '4px solid var(--c-danger)' : '3px solid transparent',
                outline: showCorrect ? '4px solid rgba(0,212,170,0.3)' : showWrong ? '4px solid rgba(255,90,111,0.3)' : 'none',
                position: 'relative', cursor: picked !== null ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: 10, overflow: 'hidden',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                transition: 'all .25s', animation: showCorrect ? 'pop .35s' : '',
              }}>
                <div style={{ fontSize: 44, position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%,-50%)', animation: showCorrect ? 'pop .4s' : '' }}>{g.emoji}</div>
                <div style={{ position: 'relative', zIndex: 1, color: '#fff', fontSize: 11, fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.4)', textAlign: 'left' }}>{g.caption}</div>
              </button>
            );
          })}
        </div>
        <div style={{ flex: 1 }}/>
        <button style={{
          width: '100%', padding: '10px', background: 'rgba(108,92,231,0.08)', border: 'none', borderRadius: 12,
          color: 'var(--c-primary)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12,
        }}>
          <Icon.sparkle s={14}/> 让 Wordy 给我编个谐音故事
        </button>
      </div>
      {sess.phase === 'revealing' && <StudyFeedback correct={picked !== null && grid[picked]?.ok} word={w} onNext={sess.next}/>}
    </div>
  );
}

Object.assign(window, { StudySpell, StudyListen, StudyContext, StudyImageMemory });
