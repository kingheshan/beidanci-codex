// screens-study.jsx — 6 study mode variations + Result screen
// 选择闯关 / 卡片翻转 / 拼写填空 / 听音辨义 / 例句情景 / 图像联想

// Shared top bar
function StudyTopBar({ progress = 0.4, hearts = 4, current = 7, total = 20 }) {
  return (
    <div style={{ padding: '50px 18px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <button style={{ width: 28, height: 28, border: 'none', background: 'transparent', color: 'var(--c-ink-muted)', cursor: 'pointer', padding: 0 }}>
        <Icon.x s={24}/>
      </button>
      <div style={{ flex: 1 }}>
        <ProgressBar value={progress} height={10} color="var(--c-primary)"/>
        <div style={{ fontSize: 10, color: 'var(--c-ink-muted)', fontWeight: 700, marginTop: 4, fontFamily: 'var(--font-display-en)' }}>
          {current}/{total}
        </div>
      </div>
      <HeartPill count={hearts}/>
    </div>
  );
}

// ─── Mode 1: 选择闯关 (Multiple choice — Duolingo style) ─────
function StudyMultipleChoice() {
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <StudyTopBar progress={0.35}/>
      <div style={{ flex: 1, padding: '0 18px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', fontWeight: 700, marginBottom: 10 }}>
          下面哪个词意为「坚持不懈的」？
        </div>

        <div style={{
          padding: '24px 16px', background: '#fff', borderRadius: 22,
          boxShadow: 'var(--sh-card)', textAlign: 'center', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div className="aibd-display-en" style={{ fontSize: 34, color: 'var(--c-ink)' }}>persistent</div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: 'var(--c-primary-soft)',
              color: 'var(--c-primary)', display: 'grid', placeItems: 'center', cursor: 'pointer',
            }}>
              <Icon.speaker s={18}/>
            </div>
          </div>
          <div className="aibd-mono" style={{ fontSize: 11, color: 'var(--c-ink-muted)' }}>/pərˈsɪstənt/</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ChoiceButton shortcut="1" en="ambitious" label="雄心勃勃的" state="idle"/>
          <ChoiceButton shortcut="2" en="persistent" label="坚持不懈的" state="correct"/>
          <ChoiceButton shortcut="3" en="permanent" label="永久的，长期的" state="idle"/>
          <ChoiceButton shortcut="4" en="present" label="出席的，现在的" state="idle"/>
        </div>

        <div style={{ flex: 1 }}/>

        {/* feedback strip */}
        <div style={{
          margin: '0 -18px -10px', padding: '16px 18px 24px',
          background: '#DCFCE7', borderTop: '2px solid var(--c-success)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--c-success)', color: '#fff', display: 'grid', placeItems: 'center' }}>
              <Icon.check s={20}/>
            </div>
            <div className="aibd-display" style={{ fontSize: 17, color: '#0E4D24' }}>太棒了！</div>
            <Tag color="#0E4D24" bg="rgba(0,212,170,0.25)" size="xs">+12 XP</Tag>
          </div>
          <div style={{ fontSize: 11, color: '#155F33', lineHeight: 1.5, paddingLeft: 42 }}>
            「per- 贯穿 + sist 站立」→ <b>始终坚持站立 = 坚持不懈的</b>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mode 2: 卡片翻转 (Quizlet flip card) ─────────────────────
function StudyFlipCard() {
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <StudyTopBar progress={0.6} current={12}/>
      <div style={{ flex: 1, padding: '0 18px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', textAlign: 'center', marginBottom: 6 }}>
          点击卡片查看释义 · 左滑不熟，右滑认识
        </div>

        {/* Stack effect */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1000 }}>
          {/* back cards */}
          <div style={{
            position: 'absolute', width: '88%', height: '88%', borderRadius: 24,
            background: '#fff', boxShadow: 'var(--sh-card)', transform: 'translateY(16px) scale(0.94)',
            opacity: 0.5,
          }}/>
          <div style={{
            position: 'absolute', width: '92%', height: '92%', borderRadius: 24,
            background: '#fff', boxShadow: 'var(--sh-card)', transform: 'translateY(8px) scale(0.97)',
            opacity: 0.8,
          }}/>

          {/* top card — flipped to back showing meaning */}
          <div style={{
            width: '100%', height: '100%', borderRadius: 24, background: '#fff',
            boxShadow: 'var(--sh-pop)', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', padding: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Tag color="var(--c-primary)" bg="var(--c-primary-soft)">中考核心</Tag>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon.star s={14}/>
                <span style={{ fontSize: 10, color: 'var(--c-ink-muted)', fontWeight: 700 }}>未掌握</span>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div className="aibd-display-en" style={{ fontSize: 32, color: 'var(--c-ink)', lineHeight: 1.1 }}>ambitious</div>
              <div className="aibd-mono" style={{ fontSize: 12, color: 'var(--c-ink-muted)', marginTop: 6, marginBottom: 14 }}>/æmˈbɪʃəs/</div>
              <div style={{ height: 1, background: 'var(--c-line)', margin: '0 30px 14px' }}/>
              <div style={{ fontSize: 11, color: 'var(--c-primary)', fontWeight: 700, marginBottom: 4 }}>adj.</div>
              <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)' }}>雄心勃勃的</div>
              <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 4 }}>有抱负的；野心勃勃的</div>

              <div style={{ marginTop: 18, padding: '10px 12px', background: 'var(--c-primary-soft)', borderRadius: 12, textAlign: 'left' }}>
                <div style={{ fontSize: 10, color: 'var(--c-primary)', fontWeight: 800, marginBottom: 3 }}>例句</div>
                <div style={{ fontSize: 12, color: 'var(--c-ink)', lineHeight: 1.5 }}>
                  She is an <b style={{ color: 'var(--c-primary)' }}>ambitious</b> student aiming for Tsinghua.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingTop: 8 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: 999, background: i===1 ? 'var(--c-primary)' : 'var(--c-line)' }}/>)}
            </div>
          </div>
        </div>

        {/* Bottom action buttons */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 0 18px' }}>
          <button style={{
            flex: 1, height: 56, borderRadius: 18, border: '2px solid var(--c-line)',
            background: '#fff', color: 'var(--c-danger)', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            boxShadow: '0 2px 0 var(--c-line)',
          }}>
            <Icon.x s={20}/>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.05em' }}>不认识</span>
          </button>
          <button style={{
            flex: 1, height: 56, borderRadius: 18, border: '2px solid var(--c-line)',
            background: '#fff', color: 'var(--c-warning)', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            boxShadow: '0 2px 0 var(--c-line)',
          }}>
            <Icon.brain s={20}/>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.05em' }}>模糊</span>
          </button>
          <button style={{
            flex: 1, height: 56, borderRadius: 18, border: 'none',
            background: 'var(--c-success)', color: '#fff', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            boxShadow: '0 4px 0 #0E8B5C',
          }}>
            <Icon.check s={20}/>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.05em' }}>认识</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mode 3: 拼写填空 (Spelling) ──────────────────────────────
function StudySpelling() {
  const word = 'ENVIRONMENT';
  const typed = 'ENVIRON';
  const slots = word.split('');
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <StudyTopBar progress={0.55} current={11}/>
      <div style={{ flex: 1, padding: '0 18px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Tag color="var(--c-primary)" bg="var(--c-primary-soft)">拼写</Tag>
        </div>

        <div style={{
          padding: 18, background: '#fff', borderRadius: 22, boxShadow: 'var(--sh-card)',
          textAlign: 'center', marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, color: 'var(--c-primary)', fontWeight: 800, marginBottom: 6 }}>n.</div>
          <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)', marginBottom: 4 }}>环境，外界状况</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
            background: 'var(--c-primary-soft)', borderRadius: 999,
            color: 'var(--c-primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>
            <Icon.speaker s={12}/> 听发音
          </div>
        </div>

        {/* slots */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
          {slots.map((c, i) => {
            const filled = i < typed.length;
            return (
              <div key={i} style={{
                width: 22, height: 30, borderRadius: 6,
                background: filled ? 'var(--c-primary)' : 'transparent',
                color: filled ? '#fff' : 'var(--c-ink)',
                border: filled ? 'none' : '2px solid var(--c-ink-faint)',
                borderBottom: filled ? 'none' : '3px solid var(--c-ink-muted)',
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--font-display-en)', fontWeight: 800, fontSize: 15,
              }}>{filled ? c : ''}</div>
            );
          })}
        </div>

        {/* hint */}
        <div style={{
          padding: '8px 12px', background: 'rgba(255,176,32,0.12)', borderRadius: 10,
          fontSize: 11, color: '#8A5A00', textAlign: 'center', marginBottom: 16,
        }}>
          💡 词根 <b>environ-</b> 围绕 + <b>-ment</b> 名词后缀
        </div>

        <div style={{ flex: 1 }}/>

        {/* Word bank / letter pad */}
        <div style={{
          padding: 14, background: '#fff', borderRadius: 20, boxShadow: 'var(--sh-card)',
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {['M','E','N','T','O','I','R','S','A','P','U','C'].map((k,i) => (
              <button key={i} style={{
                width: 36, height: 38, borderRadius: 8, border: 'none',
                background: i < 4 ? 'var(--c-primary-soft)' : '#fff',
                color: 'var(--c-ink)', fontFamily: 'var(--font-display-en)', fontWeight: 800, fontSize: 16,
                boxShadow: '0 2px 0 var(--c-line)',
                cursor: 'pointer',
              }}>{k}</button>
            ))}
          </div>
        </div>

        <CTA size="md" color="var(--c-primary)" style={{ marginBottom: 16 }}>检查</CTA>
      </div>
    </div>
  );
}

// ─── Mode 4: 听音辨义 (Listen & match) ────────────────────────
function StudyListen() {
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <StudyTopBar progress={0.45} current={9}/>
      <div style={{ flex: 1, padding: '0 18px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', fontWeight: 700, marginBottom: 14 }}>
          听一听，选出正确的释义
        </div>

        {/* Big speaker bubble */}
        <div style={{
          padding: '28px 14px', background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-deep) 100%)',
          borderRadius: 28, textAlign: 'center', marginBottom: 16, color: '#fff',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* sound waves */}
          <svg viewBox="0 0 200 80" style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
            {[...Array(5)].map((_,i) => (
              <circle key={i} cx="100" cy="40" r={10 + i * 16} fill="none" stroke="#fff" strokeWidth="2"/>
            ))}
          </svg>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#fff', color: 'var(--c-primary)',
            display: 'inline-grid', placeItems: 'center', marginBottom: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}>
            <Icon.speaker s={30}/>
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, fontWeight: 700, letterSpacing: '0.08em' }}>点击重听 · 倍速 0.75×</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ChoiceButton shortcut="A" label="完成；实现；达到（目标）" state="hover"/>
          <ChoiceButton shortcut="B" label="包围；环绕；环境" state="idle"/>
          <ChoiceButton shortcut="C" label="决定；下决心；确定" state="idle"/>
          <ChoiceButton shortcut="D" label="可持续的；可维持的" state="idle"/>
        </div>

        <div style={{ flex: 1 }}/>

        <button style={{
          alignSelf: 'center', padding: '8px 16px', background: 'transparent', border: 'none',
          color: 'var(--c-ink-muted)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14,
        }}>看字面 <Icon.chevronR s={12}/></button>
      </div>
    </div>
  );
}

// ─── Mode 5: 例句情景 (Contextual sentence) ───────────────────
function StudyContext() {
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <StudyTopBar progress={0.7} current={14}/>
      <div style={{ flex: 1, padding: '0 18px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Tag color="var(--c-coral)" bg="#FFE9DE"><Icon.sparkle s={10}/> AI 情景</Tag>
          <span style={{ fontSize: 10, color: 'var(--c-ink-muted)' }}>校园 · 你在初三</span>
        </div>

        {/* Cinematic image placeholder */}
        <div style={{
          height: 140, borderRadius: 20, marginBottom: 14, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-pink) 60%, var(--c-coral) 100%)',
        }}>
          {/* abstract shapes */}
          <div style={{ position: 'absolute', top: 20, right: 20, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }}/>
          <div style={{ position: 'absolute', bottom: -10, left: -10, width: 80, height: 80, borderRadius: 12, background: 'rgba(255,255,255,0.15)', transform: 'rotate(20deg)' }}/>
          <div style={{ position: 'absolute', bottom: 12, left: 12, color: '#fff' }}>
            <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 700, letterSpacing: '0.08em' }}>SCENE 03</div>
            <div className="aibd-display" style={{ fontSize: 17, marginTop: 2 }}>体育课后的对话</div>
          </div>
        </div>

        {/* Sentence */}
        <div style={{
          padding: 16, background: '#fff', borderRadius: 20, boxShadow: 'var(--sh-card)',
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', fontWeight: 700, marginBottom: 8 }}>选出正确的词填入空格</div>
          <div className="aibd-display-en" style={{ fontSize: 18, color: 'var(--c-ink)', lineHeight: 1.5 }}>
            "If you keep practicing every day, you can{' '}
            <span style={{
              display: 'inline-block', padding: '2px 14px',
              background: 'var(--c-accent)', borderRadius: 6,
              color: 'var(--c-ink)', fontWeight: 800,
            }}>______</span>
            {' '}your goal."
          </div>
          <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 8, lineHeight: 1.5 }}>
            「如果你每天坚持练习，就能 ___ 你的目标。」
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ChoiceButton en="achieve" label="实现，达到" state="hover"/>
          <ChoiceButton en="abandon" label="放弃" state="idle"/>
          <ChoiceButton en="declare" label="宣告" state="idle"/>
          <ChoiceButton en="prevent" label="阻止" state="idle"/>
        </div>

        <div style={{ flex: 1 }}/>
      </div>
    </div>
  );
}

// ─── Mode 6: 图像联想 (Image memory) ──────────────────────────
function StudyImage() {
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <StudyTopBar progress={0.25} current={5}/>
      <div style={{ flex: 1, padding: '0 18px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', fontWeight: 700, marginBottom: 8 }}>下面哪幅图能表示</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#fff', borderRadius: 999, boxShadow: 'var(--sh-card)' }}>
            <div className="aibd-display-en" style={{ fontSize: 22, color: 'var(--c-ink)' }}>sustainable</div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--c-primary-soft)', color: 'var(--c-primary)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Icon.speaker s={14}/>
            </div>
          </div>
          <div className="aibd-mono" style={{ fontSize: 10, color: 'var(--c-ink-muted)', marginTop: 6 }}>/səˈsteɪnəbl/</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1, alignContent: 'start' }}>
          <ImgCard color="linear-gradient(135deg,#4CAF50,#1F8E3D)" emoji="🌱" caption="可持续的生长"/>
          <ImgCard color="linear-gradient(135deg,#FF6B6B,#C9314D)" emoji="🔥" caption="燃烧" dim/>
          <ImgCard color="linear-gradient(135deg,#54C7FF,#1B7FB8)" emoji="💧" caption="流动" dim/>
          <ImgCard color="linear-gradient(135deg,#FFB020,#E07B00)" emoji="⚡" caption="闪电" dim/>
        </div>

        <div style={{ flex: 0, padding: '12px 0' }}>
          <button style={{
            width: '100%', padding: '10px', background: 'rgba(108,92,231,0.08)', border: 'none', borderRadius: 12,
            color: 'var(--c-primary)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Icon.sparkle s={14}/> 让 Wordy 给我编个谐音故事
          </button>
        </div>
      </div>
    </div>
  );
}

function ImgCard({ color, emoji, caption, dim }) {
  return (
    <div style={{
      position: 'relative', aspectRatio: '1 / 1.05', borderRadius: 18,
      background: color, opacity: dim ? 0.55 : 1,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      padding: 10, overflow: 'hidden',
      boxShadow: dim ? 'var(--sh-card)' : '0 8px 20px rgba(0,0,0,0.18)',
      border: dim ? 'none' : '3px solid #fff',
      outline: dim ? 'none' : '3px solid var(--c-primary)',
    }}>
      <div style={{ fontSize: 48, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>{emoji}</div>
      <div style={{ position: 'relative', zIndex: 1, color: '#fff', fontSize: 11, fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>{caption}</div>
    </div>
  );
}

Object.assign(window, {
  StudyMultipleChoice, StudyFlipCard, StudySpelling,
  StudyListen, StudyContext, StudyImage, StudyTopBar,
});
