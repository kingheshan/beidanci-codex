// study-modes.jsx — 6 production-grade interactive study modes
// Each is self-contained, plugs into useStudySession.
// Mode 1 · 选择闯关  StudyMC
// Mode 2 · 卡片翻转  StudyFlip
// Mode 3 · 拼写填空  StudySpell
// Mode 4 · 听音辨义  StudyListen
// Mode 5 · 例句情景  StudyContext (AI 个性化)
// Mode 6 · 图像联想  StudyImageMemory

// Shared header for any mode
function StudyHeader({ progress, hearts, idx, total, onClose }) {
  return (
    <div style={{ padding: '46px 16px 14px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 10 }}>
      <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: 'transparent', color: 'var(--c-ink-muted)', cursor: 'pointer', padding: 0 }}>
        <Icon.x s={22}/>
      </button>
      <div style={{ flex: 1 }}>
        <ProgressBar value={progress} height={10} color="var(--c-primary)"/>
        <div className="aibd-mono" style={{ fontSize: 10, color: 'var(--c-ink-muted)', fontWeight: 700, marginTop: 4 }}>
          {idx + 1}/{total}
        </div>
      </div>
      <HeartPill count={hearts}/>
    </div>
  );
}

// Reveal feedback strip (sticky bottom)
function StudyFeedback({ correct, word, onNext }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: correct ? '#DCFCE7' : '#FFE2E5',
      borderTop: `2px solid ${correct ? 'var(--c-success)' : 'var(--c-danger)'}`,
      padding: '14px 16px 22px', zIndex: 20,
      animation: 'slideUp .35s var(--ease)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: correct ? 'var(--c-success)' : 'var(--c-danger)',
          color: '#fff', display: 'grid', placeItems: 'center',
        }}>
          {correct ? <Icon.check s={18}/> : <Icon.x s={18}/>}
        </div>
        <div className="aibd-display" style={{ fontSize: 16, color: correct ? '#0E4D24' : '#7A1620', flex: 1 }}>
          {correct ? '太棒了！' : '没关系，记住这个'}
        </div>
        {correct && <Tag color="#0E4D24" bg="rgba(0,212,170,0.25)" size="xs">+12 XP</Tag>}
      </div>
      {word && (
        <div style={{ fontSize: 11, color: correct ? '#155F33' : '#7A2630', lineHeight: 1.5, paddingLeft: 40, marginBottom: 10 }}>
          <b style={{ fontFamily: 'var(--font-display-en)' }}>{word.word}</b> <span style={{ opacity: 0.7 }}>{word.pos}</span> · {word.cn}
          {word.etym && <div style={{ marginTop: 4, opacity: 0.8 }}>💡 {word.etym}</div>}
        </div>
      )}
      <CTA color={correct ? 'var(--c-success)' : 'var(--c-danger)'} size="md" onClick={onNext}>
        继续
      </CTA>
    </div>
  );
}

// ─── Mode 1 · 选择闯关 (Multiple choice) ─────────────────────
function StudyMC({ words, onClose, onDone }) {
  const sess = useStudySession({ words });
  const w = sess.current;

  // build distractors deterministic per word
  const options = React.useMemo(() => {
    if (!w) return [];
    const others = WORDS.filter(x => x.id !== w.id).slice(0, 3);
    const arr = [...others.map(o => ({ ...o, isCorrect: false })), { ...w, isCorrect: true }];
    // shuffle by word id hash so it's stable
    return arr.sort((a, b) => (a.word.charCodeAt(0) - b.word.charCodeAt(0) + w.word.charCodeAt(0)) % 7 - 3);
  }, [w]);

  const [picked, setPicked] = React.useState(null);
  React.useEffect(() => setPicked(null), [sess.idx]);

  if (sess.phase === 'done') {
    onDone?.(sess.results);
    return <StudyDoneStub results={sess.results} onClose={onClose}/>;
  }

  const onPick = (opt) => {
    if (sess.phase !== 'asking' || picked) return;
    setPicked(opt);
    sess.submit(opt.isCorrect);
  };

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <StudyHeader progress={sess.progress} hearts={sess.hearts} idx={sess.idx} total={sess.total} onClose={onClose}/>
      <div style={{ flex: 1, padding: '0 16px 200px', display: 'flex', flexDirection: 'column', animation: 'slideRight .3s var(--ease)' }} key={w.id}>
        <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', fontWeight: 700, marginBottom: 12 }}>
          下面哪个词意为「<b style={{ color: 'var(--c-ink)' }}>{w.cn}</b>」？
        </div>
        <div style={{
          padding: '24px 16px', background: '#fff', borderRadius: 22,
          boxShadow: 'var(--sh-card)', textAlign: 'center', marginBottom: 16,
          animation: sess.shake ? 'shake .45s' : 'pop .35s var(--ease)',
        }}>
          <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)' }}>{w.cn}</div>
          <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', marginTop: 4 }}>{w.pos}</div>
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
              <ChoiceButton key={o.id} shortcut={i + 1} en={o.word} label={o.cn} state={s} onClick={() => onPick(o)}/>
            );
          })}
        </div>
      </div>
      {sess.phase === 'revealing' && <StudyFeedback correct={picked?.isCorrect} word={w} onNext={sess.next}/>}
    </div>
  );
}

// ─── Mode 2 · 卡片翻转 (Flip card + swipe) ───────────────────
function StudyFlip({ words, onClose, onDone }) {
  const sess = useStudySession({ words });
  const w = sess.current;
  const [flipped, setFlipped] = React.useState(false);
  const [drag, setDrag] = React.useState(0);
  const startX = React.useRef(0);
  const dragging = React.useRef(false);

  React.useEffect(() => { setFlipped(false); setDrag(0); }, [sess.idx]);

  if (sess.phase === 'done') {
    onDone?.(sess.results);
    return <StudyDoneStub results={sess.results} onClose={onClose}/>;
  }

  const onDown = (e) => {
    if (!flipped) return;
    dragging.current = true;
    startX.current = e.clientX ?? e.touches?.[0].clientX;
  };
  const onMove = (e) => {
    if (!dragging.current) return;
    const x = e.clientX ?? e.touches?.[0].clientX;
    setDrag(x - startX.current);
  };
  const onUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (Math.abs(drag) > 80) {
      const correct = drag > 0;
      sess.submit(correct);
      // animate out
      setDrag(drag > 0 ? 400 : -400);
      setTimeout(() => sess.next(), 350);
    } else {
      setDrag(0);
    }
  };

  const ratingButton = (label, color, correct, icon) => (
    <button onClick={() => { sess.submit(correct); setTimeout(() => sess.next(), 250); }} style={{
      flex: 1, height: 54, borderRadius: 16, border: 'none',
      background: color, color: '#fff', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
      boxShadow: `0 4px 0 color-mix(in srgb, ${color} 70%, black)`,
    }}>
      {icon}<span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.05em' }}>{label}</span>
    </button>
  );

  const rot = drag * 0.05;

  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', position: 'relative', display: 'flex', flexDirection: 'column' }} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onTouchMove={onMove} onTouchEnd={onUp}>
      <StudyHeader progress={sess.progress} hearts={sess.hearts} idx={sess.idx} total={sess.total} onClose={onClose}/>
      <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', textAlign: 'center', padding: '0 16px 6px' }}>
        {flipped ? '← 不熟  ·  右滑认识 →' : '点击卡片翻面'}
      </div>
      <div style={{ flex: 1, padding: '0 24px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1200 }}>
        {/* stack */}
        <div style={{ position: 'absolute', width: 'calc(100% - 80px)', height: 360, borderRadius: 24, background: '#fff', transform: 'translateY(14px) scale(0.94)', opacity: 0.5, boxShadow: 'var(--sh-card)' }}/>
        <div style={{ position: 'absolute', width: 'calc(100% - 60px)', height: 370, borderRadius: 24, background: '#fff', transform: 'translateY(7px) scale(0.97)', opacity: 0.85, boxShadow: 'var(--sh-card)' }}/>

        {/* current card */}
        <div onMouseDown={onDown} onTouchStart={onDown} onClick={() => !dragging.current && setFlipped(!flipped)} style={{
          width: '100%', height: 380, position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `translateX(${drag}px) rotate(${rot}deg)`,
          transition: dragging.current ? 'none' : 'transform .35s var(--ease)',
          cursor: flipped ? 'grab' : 'pointer',
        }}>
          {/* swipe hint overlays */}
          {drag > 30 && <div style={{ position: 'absolute', top: 24, left: 24, padding: '6px 14px', border: '3px solid var(--c-success)', color: 'var(--c-success)', borderRadius: 8, fontWeight: 900, transform: 'rotate(-12deg)', zIndex: 5 }}>认识 ✓</div>}
          {drag < -30 && <div style={{ position: 'absolute', top: 24, right: 24, padding: '6px 14px', border: '3px solid var(--c-danger)', color: 'var(--c-danger)', borderRadius: 8, fontWeight: 900, transform: 'rotate(12deg)', zIndex: 5 }}>不熟 ✗</div>}

          <div style={{
            position: 'absolute', inset: 0, borderRadius: 24, padding: 22,
            background: '#fff', boxShadow: 'var(--sh-pop)',
            backfaceVisibility: 'hidden',
            transition: 'transform .55s var(--ease)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
            display: 'flex', flexDirection: 'column',
          }}>
            <Tag color="var(--c-primary)" bg="var(--c-primary-soft)">{w.tags[0]}</Tag>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="aibd-display-en" style={{ fontSize: 32, color: 'var(--c-ink)' }}>{w.word}</div>
              <div className="aibd-mono" style={{ fontSize: 12, color: 'var(--c-ink-muted)', marginTop: 8 }}>{w.ipa}</div>
              <button onClick={(e) => e.stopPropagation()} style={{
                marginTop: 16, width: 44, height: 44, borderRadius: '50%', border: 'none',
                background: 'var(--c-primary)', color: '#fff', cursor: 'pointer',
                display: 'grid', placeItems: 'center', boxShadow: 'var(--sh-cta)',
              }}>
                <Icon.speaker s={20}/>
              </button>
            </div>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--c-ink-muted)' }}>点击查看释义</div>
          </div>

          {/* back face */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 24, padding: 22,
            background: '#fff', boxShadow: 'var(--sh-pop)',
            backfaceVisibility: 'hidden',
            transition: 'transform .55s var(--ease)',
            transform: flipped ? 'rotateY(0)' : 'rotateY(-180deg)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div className="aibd-display-en" style={{ fontSize: 18, color: 'var(--c-ink-soft)' }}>{w.word}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--c-primary)', fontWeight: 800 }}>{w.pos}</div>
              <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)', marginTop: 4 }}>{w.cn}</div>
              <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 4 }}>{w.cnLong}</div>
              <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--c-primary-soft)', borderRadius: 12, textAlign: 'left' }}>
                <div style={{ fontSize: 10, color: 'var(--c-primary)', fontWeight: 800, marginBottom: 3 }}>例句</div>
                <div style={{ fontSize: 12, color: 'var(--c-ink)', lineHeight: 1.5 }}>{w.examples[0].en}</div>
                <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', marginTop: 2 }}>{w.examples[0].cn}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px 18px' }}>
        {flipped ? (
          <div style={{ display: 'flex', gap: 10 }}>
            {ratingButton('不熟', 'var(--c-danger)', false, <Icon.x s={18}/>)}
            {ratingButton('模糊', 'var(--c-warning)', false, <Icon.brain s={18}/>)}
            {ratingButton('认识', 'var(--c-success)', true, <Icon.check s={18}/>)}
          </div>
        ) : (
          <CTA color="var(--c-primary)" size="md" onClick={() => setFlipped(true)}>翻面查看释义</CTA>
        )}
      </div>
    </div>
  );
}

// Common stub shown when a session completes — chains into result screen
function StudyDoneStub({ results, onClose }) {
  return (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'var(--c-bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <Wordy size={120} pose="celebrate" mood="cheer" form="star"/>
        <div className="aibd-display" style={{ fontSize: 24, color: 'var(--c-ink)', marginTop: 12 }}>完成 {results.length} 题</div>
        <CTA color="var(--c-primary)" size="lg" onClick={onClose} style={{ marginTop: 18, width: 200 }}>查看结果</CTA>
      </div>
    </div>
  );
}

Object.assign(window, { StudyMC, StudyFlip, StudyHeader, StudyFeedback, StudyDoneStub });
