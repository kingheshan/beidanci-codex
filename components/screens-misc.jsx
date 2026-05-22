// screens-misc.jsx — Word detail, Result, Review queue, Profile, Onboarding,
// Leaderboard, AI memory map, Daily story, PK match

// ─── Word Detail ─────────────────────────────────────────────
function ScreenWordDetail() {
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* hero */}
      <div style={{
        padding: '50px 18px 18px',
        background: 'linear-gradient(180deg, var(--c-primary-soft) 0%, var(--c-bg) 100%)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--c-ink-soft)', padding: 0 }}>
            <Icon.chevronL s={22}/>
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', color: 'var(--c-warning)' }}>
              <Icon.star s={16} fill="currentColor"/>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', color: 'var(--c-ink-soft)' }}>
              <Icon.brain s={16}/>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div className="aibd-display-en" style={{ fontSize: 38, color: 'var(--c-ink)', lineHeight: 1 }}>achieve</div>
          <button style={{
            width: 34, height: 34, borderRadius: '50%', background: 'var(--c-primary)', color: '#fff',
            border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer',
            boxShadow: 'var(--sh-cta)',
          }}><Icon.speaker s={18}/></button>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
          <span className="aibd-mono" style={{ fontSize: 12, color: 'var(--c-ink-muted)' }}>英 /əˈtʃiːv/</span>
          <span className="aibd-mono" style={{ fontSize: 12, color: 'var(--c-ink-muted)' }}>美 /əˈtʃiːv/</span>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <Tag color="var(--c-primary)" bg="var(--c-primary-soft)">中考核心</Tag>
          <Tag color="var(--c-mint)" bg="#D4F8EF">CET-4</Tag>
          <Tag color="var(--c-coral)" bg="#FFE9DE">高频 · #284</Tag>
        </div>
      </div>

      <div className="aibd-scroll" style={{ flex: 1, padding: '4px 18px 24px', overflow: 'auto' }}>
        {/* meanings */}
        <Card pad={14} style={{ marginBottom: 12 }}>
          <Section title="释义">
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-display-en)', fontWeight: 700, fontSize: 11, color: 'var(--c-primary)', minWidth: 24 }}>vt.</span>
              <span style={{ fontSize: 13, color: 'var(--c-ink)' }}>完成；达到（目标）；实现</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-display-en)', fontWeight: 700, fontSize: 11, color: 'var(--c-primary)', minWidth: 24 }}>vi.</span>
              <span style={{ fontSize: 13, color: 'var(--c-ink)' }}>取得成就；成功</span>
            </div>
          </Section>
        </Card>

        {/* AI memory map preview */}
        <Card pad={14} style={{ marginBottom: 12, background: 'linear-gradient(135deg, var(--c-primary-soft) 0%, #fff 80%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Tag color="var(--c-primary)" bg="rgba(255,255,255,0.85)"><Icon.sparkle s={10}/> AI 联想图谱</Tag>
            </div>
            <span style={{ fontSize: 10, color: 'var(--c-ink-muted)' }}>展开</span>
          </div>
          <MemoryMapPreview/>
        </Card>

        {/* examples */}
        <Card pad={14} style={{ marginBottom: 12 }}>
          <Section title="例句">
            <div style={{ padding: '10px 12px', background: 'var(--c-surface-soft)', borderRadius: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: 'var(--c-ink)', lineHeight: 1.5, marginBottom: 4 }}>
                Hard work helps her <b style={{ color: 'var(--c-primary)' }}>achieve</b> her dream of becoming a doctor.
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', lineHeight: 1.5 }}>
                努力工作帮她实现了成为医生的梦想。
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <Tag color="var(--c-coral)" bg="#FFE9DE" size="xs">2024 中考真题</Tag>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--c-primary)', cursor: 'pointer' }}>
                  <Icon.speaker s={14}/>
                </button>
              </div>
            </div>
            <div style={{ padding: '10px 12px', background: 'var(--c-surface-soft)', borderRadius: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--c-ink)', lineHeight: 1.5, marginBottom: 4 }}>
                We <b style={{ color: 'var(--c-primary)' }}>achieved</b> a lot during the school football tournament.
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', lineHeight: 1.5 }}>
                在校足球联赛期间，我们取得了很多成就。
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <Tag color="var(--c-mint)" bg="#D4F8EF" size="xs"><Icon.sparkle s={9}/> AI · 你的兴趣 ⚽</Tag>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--c-primary)', cursor: 'pointer' }}>
                  <Icon.speaker s={14}/>
                </button>
              </div>
            </div>
          </Section>
        </Card>

        {/* word forms */}
        <Card pad={14}>
          <Section title="派生 · 词组">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                ['achievement', 'n. 成就'],
                ['achiever', 'n. 成功者'],
                ['achievable', 'adj. 可达成的'],
                ['achieve a goal', '实现目标'],
              ].map(([a,b]) => (
                <div key={a} style={{
                  padding: '6px 10px', background: 'var(--c-surface-soft)',
                  borderRadius: 999, fontSize: 11, color: 'var(--c-ink)',
                }}>
                  <b style={{ fontFamily: 'var(--font-display-en)' }}>{a}</b>
                  <span style={{ color: 'var(--c-ink-muted)', marginLeft: 4 }}>{b}</span>
                </div>
              ))}
            </div>
          </Section>
        </Card>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-ink-soft)', marginBottom: 6, letterSpacing: '0.06em' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function MemoryMapPreview() {
  // small mind-map sketch
  return (
    <svg viewBox="0 0 280 120" style={{ width: '100%', height: 120 }}>
      {/* lines */}
      <g stroke="var(--c-primary)" strokeWidth="1.6" fill="none" opacity="0.4" strokeDasharray="3 4">
        <path d="M140 60 L 60 30"/>
        <path d="M140 60 L 220 30"/>
        <path d="M140 60 L 50 100"/>
        <path d="M140 60 L 220 100"/>
        <path d="M140 60 L 245 65"/>
      </g>
      {/* center */}
      <g>
        <circle cx="140" cy="60" r="26" fill="var(--c-primary)"/>
        <text x="140" y="56" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" opacity="0.7">vt./vi.</text>
        <text x="140" y="69" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="var(--font-display-en)">achieve</text>
      </g>
      {/* nodes */}
      {[
        {x:60,y:30,t:'accomplish',sub:'同义'},
        {x:220,y:30,t:'achievement',sub:'派生'},
        {x:50,y:100,t:'reach',sub:'近义'},
        {x:220,y:100,t:'fail',sub:'反义'},
      ].map((n,i) => (
        <g key={i}>
          <rect x={n.x - 36} y={n.y - 10} width="72" height="22" rx="11" fill="#fff" stroke="var(--c-primary)" strokeWidth="1.2"/>
          <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--c-ink)" fontFamily="var(--font-display-en)">{n.t}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Result screen (celebration) ─────────────────────────────
function ScreenResult() {
  return (
    <div style={{ height: '100%', background: 'linear-gradient(180deg, var(--c-primary) 0%, var(--c-primary-deep) 60%, var(--c-primary-deep) 100%)', display: 'flex', flexDirection: 'column', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      {/* Confetti dots */}
      {[...Array(24)].map((_, i) => {
        const left = (i * 37) % 320;
        const top = 60 + ((i * 51) % 380);
        const colors = ['var(--c-accent)', 'var(--c-pink)', 'var(--c-mint)', '#fff'];
        const size = 4 + (i % 4) * 2;
        return <div key={i} style={{
          position: 'absolute', left, top, width: size, height: size,
          background: colors[i % 4],
          borderRadius: i % 2 ? '50%' : 2,
          transform: `rotate(${i * 30}deg)`,
          opacity: 0.85,
        }}/>;
      })}

      <div style={{ padding: '60px 18px 0', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>UNIT 3 · 完成</div>
        <div className="aibd-display" style={{ fontSize: 30, lineHeight: 1.1, marginBottom: 10 }}>太厉害了！</div>
        <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>你的连胜增加到 <b style={{ color: 'var(--c-accent)' }}>29 天</b><br/>Wordy 升级到了「<b>星之形态</b>」⭐</div>

        <div style={{ margin: '14px 0', display: 'flex', justifyContent: 'center' }}>
          <Wordy size={140} pose="celebrate" mood="cheer" form="star"/>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 18px', position: 'relative', zIndex: 2 }}>
        <div style={{
          padding: 14, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)',
          borderRadius: 22, marginBottom: 12, border: '1px solid rgba(255,255,255,0.18)',
        }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-around' }}>
            <ResultStat label="XP 经验" value="+ 320" color="var(--c-accent)"/>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }}/>
            <ResultStat label="正确率" value="92%" color="var(--c-mint)"/>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }}/>
            <ResultStat label="用时" value="5:42" color="#fff"/>
          </div>
        </div>

        {/* mastered words */}
        <div style={{
          padding: 14, background: 'rgba(255,255,255,0.95)', borderRadius: 22, color: 'var(--c-ink)',
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-ink-soft)', marginBottom: 10 }}>本节掌握的词</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['achieve','ambitious','persistent','sustainable','environment'].map(w => (
              <div key={w} style={{
                padding: '6px 10px', background: 'var(--c-primary-soft)', color: 'var(--c-primary-ink)',
                borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display-en)',
              }}>{w} ✓</div>
            ))}
            <div style={{
              padding: '6px 10px', background: '#FFE4E4', color: 'var(--c-danger)',
              borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display-en)',
            }}>determine ✗</div>
          </div>
        </div>

        <CTA color="#fff" textColor="var(--c-primary)" size="lg">继续</CTA>
        <button style={{
          marginTop: 10, width: '100%', padding: '12px', background: 'transparent', border: 'none',
          color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>查看错题本 →</button>
      </div>
    </div>
  );
}
function ResultStat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div className="aibd-display-en" style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, opacity: 0.8, marginTop: 3 }}>{label}</div>
    </div>
  );
}

// ─── Review queue (SRS) ──────────────────────────────────────
function ScreenReview() {
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '50px 18px 14px' }}>
        <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)' }}>智能复习</div>
        <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 2 }}>基于艾宾浩斯遗忘曲线为你排队</div>
      </div>

      {/* day stats strip */}
      <div style={{ padding: '0 18px 12px' }}>
        <Card pad={14}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <StatBlock value="14" label="待复习" color="var(--c-warning)" icon={<Icon.brain s={18}/>}/>
            <StatBlock value="284" label="已掌握" color="var(--c-success)" icon={<Icon.check s={18}/>}/>
            <StatBlock value="9" label="生疏" color="var(--c-danger)" icon={<Icon.heart s={18}/>}/>
            <StatBlock value="42" label="本周" color="var(--c-primary)" icon={<Icon.zap s={18}/>}/>
          </div>
          <ProgressBar value={0.74} height={8} color="var(--c-success)"/>
          <div style={{ fontSize: 10, color: 'var(--c-ink-muted)', marginTop: 5, textAlign: 'right' }}>
            本词书 · 掌握度 74%
          </div>
        </Card>
      </div>

      <div className="aibd-scroll" style={{ flex: 1, padding: '4px 18px 90px', overflow: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink-soft)', margin: '8px 0', letterSpacing: '0.06em' }}>
          按记忆强度
        </div>
        {[
          { word: 'persistent', cn: '坚持不懈的', level: 0.15, due: '今日 · 第 3 次', tag: '生疏', tagColor: 'var(--c-danger)' },
          { word: 'sustainable', cn: '可持续的', level: 0.35, due: '今日 · 第 5 次', tag: '模糊', tagColor: 'var(--c-warning)' },
          { word: 'determine', cn: '决定，确定', level: 0.55, due: '明日', tag: '熟悉', tagColor: 'var(--c-primary)' },
          { word: 'achieve', cn: '完成，实现', level: 0.82, due: '3 天后', tag: '掌握', tagColor: 'var(--c-success)' },
          { word: 'environment', cn: '环境', level: 0.92, due: '7 天后', tag: '掌握', tagColor: 'var(--c-success)' },
        ].map((w,i) => (
          <div key={i} style={{
            padding: '12px 14px', background: '#fff', borderRadius: 16,
            boxShadow: 'var(--sh-card)', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <ProgressRing value={w.level} size={42} stroke={5}
              color={w.level < 0.3 ? 'var(--c-danger)' : w.level < 0.6 ? 'var(--c-warning)' : 'var(--c-success)'}>
              <div className="aibd-display-en" style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-ink)' }}>{Math.round(w.level * 100)}</div>
            </ProgressRing>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="aibd-display-en" style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-ink)' }}>{w.word}</div>
              <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 1 }}>{w.cn}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Tag color={w.tagColor} bg={`color-mix(in srgb, ${w.tagColor} 15%, white)`} size="xs">{w.tag}</Tag>
              <div style={{ fontSize: 9, color: 'var(--c-ink-muted)', marginTop: 4 }}>{w.due}</div>
            </div>
          </div>
        ))}
      </div>

      {/* floating CTA */}
      <div style={{ position: 'absolute', bottom: 92, left: 18, right: 18, zIndex: 30 }}>
        <CTA color="var(--c-primary)" size="lg" icon={<Icon.zap s={20} fill="#fff"/>}>开始复习 14 词</CTA>
      </div>

      <TabBar active="review"/>
    </div>
  );
}

// ─── Profile / Stats ─────────────────────────────────────────
function ScreenProfile() {
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* hero */}
      <div style={{ padding: '50px 18px 14px', background: 'linear-gradient(180deg, var(--c-primary) 0%, var(--c-primary-deep) 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: 30, opacity: 0.9 }}>
          <Wordy size={120} pose="idle" mood="happy" form="star" glow={false}/>
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="aibd-display" style={{ fontSize: 22 }}>小敏 同学</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>初三 · 加入第 124 天</div>
          <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
            <div>
              <div className="aibd-display-en" style={{ fontSize: 22, fontWeight: 800 }}>Lv. 23</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>等级</div>
            </div>
            <div>
              <div className="aibd-display-en" style={{ fontSize: 22, fontWeight: 800, color: 'var(--c-accent)' }}>1,284</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>已掌握</div>
            </div>
          </div>
          <div style={{ marginTop: 10, width: 180 }}>
            <ProgressBar value={0.68} height={6} color="var(--c-accent)" bg="rgba(255,255,255,0.18)"/>
            <div style={{ fontSize: 9, opacity: 0.75, marginTop: 3 }}>距 Lv. 24 还差 320 XP</div>
          </div>
        </div>
      </div>

      <div className="aibd-scroll" style={{ flex: 1, padding: '14px 14px 90px', overflow: 'auto' }}>
        {/* heatmap */}
        <Card pad={14} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)' }}>学习地图</div>
            <Tag color="var(--c-streak)" bg="#FFE9D9" size="xs"><Icon.flame s={10}/> 28 天连胜</Tag>
          </div>
          <Heatmap/>
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

        {/* badges */}
        <Card pad={14} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)' }}>徽章 · 12 枚</div>
            <span style={{ fontSize: 11, color: 'var(--c-primary)', fontWeight: 700 }}>全部 ›</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            <Badge color="var(--c-streak)" icon="🔥" label="火热 30 天"/>
            <Badge color="var(--c-primary)" icon="📚" label="千词达成"/>
            <Badge color="var(--c-pink)" icon="⚔️" label="PK 王者"/>
            <Badge color="var(--c-mint)" icon="🌱" label="勤奋初心" dim/>
          </div>
        </Card>

        {/* word book */}
        <Card pad={14}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 10 }}>我的词书</div>
          {[
            { name: '中考核心 1600', sub: '1284 / 1600', pct: 0.8 },
            { name: '新概念第二册', sub: '320 / 850', pct: 0.38, mute: true },
          ].map((b,i) => (
            <div key={i} style={{ marginBottom: i === 0 ? 12 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--c-ink)', fontWeight: 600 }}>
                  {b.name}{i === 0 && <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">在学</Tag>}
                </span>
                <span className="aibd-display-en" style={{ fontSize: 12, color: 'var(--c-ink-muted)', fontWeight: 700 }}>{b.sub}</span>
              </div>
              <ProgressBar value={b.pct} height={6} color={b.mute ? 'var(--c-ink-muted)' : 'var(--c-primary)'}/>
            </div>
          ))}
        </Card>
      </div>

      <TabBar active="me"/>
    </div>
  );
}

function Heatmap() {
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

function Badge({ icon, label, color, dim }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: dim ? 0.4 : 1 }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `color-mix(in srgb, ${color} 15%, white)`,
        border: `2px solid ${color}`,
        display: 'grid', placeItems: 'center', fontSize: 22,
        boxShadow: dim ? 'none' : `0 4px 0 ${color}`,
      }}>{icon}</div>
      <div style={{ fontSize: 9, color: 'var(--c-ink-soft)', fontWeight: 700, textAlign: 'center' }}>{label}</div>
    </div>
  );
}

// ─── Onboarding ──────────────────────────────────────────────
function ScreenOnboarding() {
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 20px 0' }}>
        {/* progress dots */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 30 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: i === 1 ? 22 : 8, height: 8, borderRadius: 999,
              background: i <= 1 ? 'var(--c-primary)' : 'var(--c-ink-faint)',
              transition: 'width .3s var(--ease)',
            }}/>
          ))}
        </div>

        <div style={{ marginBottom: 18 }}>
          <Wordy size={130} pose="think" mood="happy" form="bean"/>
        </div>

        <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)', textAlign: 'center', lineHeight: 1.25, marginBottom: 6 }}>
          你的目标是？
        </div>
        <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', textAlign: 'center', marginBottom: 22 }}>
          帮 Wordy 给你定制学习计划
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '🎓', t: '冲刺中考', s: '词汇量 1600 · 6 个月' },
            { icon: '📘', t: '冲刺高考', s: '词汇量 3500 · 12 个月', active: true },
            { icon: '🌍', t: '雅思 / 托福', s: '6.5+ 起步' },
            { icon: '✨', t: '词汇兴趣', s: '随心学，无压力' },
          ].map((g, i) => (
            <button key={i} style={{
              padding: '14px 16px', background: '#fff',
              border: `2px solid ${g.active ? 'var(--c-primary)' : 'var(--c-line)'}`,
              borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', textAlign: 'left',
              boxShadow: g.active ? '0 2px 0 var(--c-primary)' : '0 2px 0 var(--c-line)',
            }}>
              <div style={{ fontSize: 24 }}>{g.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-ink)' }}>{g.t}</div>
                <div style={{ fontSize: 10, color: 'var(--c-ink-muted)', marginTop: 1 }}>{g.s}</div>
              </div>
              {g.active && <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--c-primary)', color: '#fff', display: 'grid', placeItems: 'center' }}><Icon.check s={14}/></div>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 20px 24px' }}>
        <CTA color="var(--c-primary)" size="lg">下一步</CTA>
      </div>
    </div>
  );
}

// ─── Leaderboard ─────────────────────────────────────────────
function ScreenLeaderboard() {
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '50px 18px 0' }}>
        <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)' }}>翡翠组</div>
        <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 2 }}>本周前 10 名晋级铂金组 · 还剩 2 天</div>
      </div>

      {/* podium */}
      <div style={{ padding: '14px 18px 8px' }}>
        <Card pad={14} style={{ background: 'linear-gradient(135deg, var(--c-primary-soft) 0%, #fff 80%)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 6, paddingTop: 6 }}>
            <Podium rank={2} name="林浩" xp="1.2k" color="#C0C0C0"/>
            <Podium rank={1} name="赵雪" xp="2.1k" color="var(--c-accent)" big/>
            <Podium rank={3} name="王宇" xp="980" color="#CD7F32"/>
          </div>
        </Card>
      </div>

      <div className="aibd-scroll" style={{ flex: 1, padding: '0 18px 90px', overflow: 'auto' }}>
        {[
          { rank: 4, name: '陈思雨', xp: 870 },
          { rank: 5, name: '吴小敏', xp: 820, me: true },
          { rank: 6, name: '刘梓涵', xp: 760 },
          { rank: 7, name: '黄博文', xp: 720 },
          { rank: 8, name: '周一一', xp: 650 },
          { rank: 9, name: '李俊熙', xp: 590 },
          { rank: 10, name: '杨子萱', xp: 540 },
          { rank: 11, name: '徐玥', xp: 480, danger: true },
        ].map(r => (
          <div key={r.rank} style={{
            padding: '10px 14px', background: r.me ? 'var(--c-primary)' : '#fff',
            color: r.me ? '#fff' : 'var(--c-ink)',
            borderRadius: 14, marginBottom: 6,
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: r.me ? 'var(--sh-cta)' : 'var(--sh-card)',
            border: r.danger ? `1px dashed var(--c-danger)` : 'none',
          }}>
            <div className="aibd-display-en" style={{ width: 22, fontWeight: 800, fontSize: 14, textAlign: 'center', opacity: r.me ? 1 : 0.6 }}>{r.rank}</div>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: r.me ? 'rgba(255,255,255,0.25)' : 'var(--c-primary-soft)',
              display: 'grid', placeItems: 'center',
            }}>
              <WordyMini size={26}/>
            </div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: r.me ? 800 : 600 }}>
              {r.name}{r.me && ' (你)'}
            </div>
            <div className="aibd-display-en" style={{ fontWeight: 800, fontSize: 14, color: r.me ? 'var(--c-accent)' : 'var(--c-primary)' }}>{r.xp} XP</div>
          </div>
        ))}
        <div style={{ height: 1, background: 'var(--c-line)', margin: '8px 0' }}/>
        <div style={{ fontSize: 10, color: 'var(--c-ink-muted)', textAlign: 'center', padding: '4px 0' }}>
          ─── 降级线（保级及格 480 XP）───
        </div>
      </div>

      <TabBar active="rank"/>
    </div>
  );
}
function Podium({ rank, name, xp, color, big }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', maxWidth: big ? 90 : 80 }}>
      <div style={{
        width: big ? 54 : 44, height: big ? 54 : 44, borderRadius: '50%',
        background: 'var(--c-primary-soft)', margin: '0 auto', position: 'relative',
        border: `3px solid ${color}`, display: 'grid', placeItems: 'center',
      }}>
        <WordyMini size={big ? 44 : 36}/>
        <div style={{
          position: 'absolute', top: -8, right: -6, width: 22, height: 22, borderRadius: '50%',
          background: color, color: rank === 1 ? 'var(--c-ink)' : '#fff',
          display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 11,
          fontFamily: 'var(--font-display-en)',
        }}>{rank}</div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink)', marginTop: 6 }}>{name}</div>
      <div className="aibd-display-en" style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-primary)' }}>{xp} XP</div>
      <div style={{
        height: big ? 50 : rank === 2 ? 36 : 26,
        background: color, opacity: 0.4, marginTop: 4, borderRadius: '6px 6px 0 0',
      }}/>
    </div>
  );
}

// ─── PK match (special feature) ──────────────────────────────
function ScreenPK() {
  return (
    <div style={{
      height: '100%', background: 'linear-gradient(180deg, #1A1340 0%, #2B1F6E 100%)',
      color: '#fff', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      {/* electric bg lines */}
      <svg viewBox="0 0 320 700" style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
        <path d="M0 200 L 320 200 M0 400 L 320 400" stroke="#fff" strokeWidth="0.5"/>
        <path d="M50 0 L 50 700 M270 0 L 270 700" stroke="#fff" strokeWidth="0.5" strokeDasharray="2 6"/>
      </svg>

      <div style={{ padding: '50px 18px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}><Icon.x s={22}/></button>
          <Tag color="#fff" bg="rgba(255,255,255,0.15)" size="xs"><Icon.swords s={10}/> 单词PK · 第 2 题 / 6</Tag>
          <div className="aibd-display-en" style={{ fontSize: 18, color: 'var(--c-accent)', fontWeight: 800 }}>0:08</div>
        </div>

        {/* Players HUD */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
          <PlayerHUD name="你" hp={0.8} color="var(--c-primary)" me/>
          <div className="aibd-display" style={{ fontSize: 32, color: 'var(--c-accent)', alignSelf: 'center' }}>VS</div>
          <PlayerHUD name="对手 · 璐璐" hp={0.55} color="var(--c-pink)" right/>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 18px', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: 8 }}>选出意为「决定」的词</div>
        <div style={{
          padding: '24px 20px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
          borderRadius: 20, textAlign: 'center', marginBottom: 18,
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <div className="aibd-display" style={{ fontSize: 28, color: 'var(--c-accent)' }}>"决定，确定"</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { en: 'achieve', cn: '完成' },
            { en: 'determine', cn: '决定', tap: true },
            { en: 'destroy', cn: '破坏' },
            { en: 'depend', cn: '依靠' },
          ].map((o,i) => (
            <button key={i} style={{
              height: 70, padding: 12, borderRadius: 16, cursor: 'pointer',
              background: o.tap ? 'var(--c-accent)' : 'rgba(255,255,255,0.10)',
              color: o.tap ? 'var(--c-ink)' : '#fff',
              border: '1px solid rgba(255,255,255,0.18)',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
              boxShadow: o.tap ? '0 0 24px var(--c-accent)' : 'none',
            }}>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{o.cn}</div>
              <div className="aibd-display-en" style={{ fontSize: 18, fontWeight: 800 }}>{o.en}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerHUD({ name, hp, color, me, right }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: right ? 'flex-end' : 'flex-start', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: right ? 'row-reverse' : 'row' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: color, display: 'grid', placeItems: 'center' }}>
          <WordyMini size={32}/>
        </div>
        <div style={{ textAlign: right ? 'right' : 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 700 }}>{name}</div>
          <div style={{ fontSize: 9, opacity: 0.7 }}>{me ? 'Lv.23' : 'Lv.25'}</div>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <ProgressBar value={hp} height={6} color={color} bg="rgba(255,255,255,0.12)"/>
      </div>
    </div>
  );
}

// ─── AI Daily Story ──────────────────────────────────────────
function ScreenDailyStory() {
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '50px 18px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--c-ink-soft)', padding: 0 }}>
          <Icon.chevronL s={22}/>
        </button>
        <div style={{ flex: 1 }}>
          <Tag color="var(--c-coral)" bg="#FFE9DE" size="xs"><Icon.sparkle s={10}/> AI 每日故事</Tag>
        </div>
        <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--c-primary-soft)', color: 'var(--c-primary)', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <Icon.speaker s={16}/>
        </button>
      </div>

      <div className="aibd-scroll" style={{ flex: 1, padding: '0 18px 90px', overflow: 'auto' }}>
        {/* hero */}
        <div style={{
          height: 160, borderRadius: 24, marginBottom: 16, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--c-coral) 0%, var(--c-pink) 60%, var(--c-primary) 100%)',
        }}>
          <div style={{ position: 'absolute', inset: 0, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: '#fff' }}>
            <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 700, letterSpacing: '0.1em' }}>EPISODE 124 · 校园物语</div>
            <div className="aibd-display" style={{ fontSize: 24, marginTop: 2 }}>The Persistent Bookworm</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>用今天复习的 12 个词写就 · 3 分钟</div>
          </div>
          {/* book floating shape */}
          <div style={{
            position: 'absolute', top: 20, right: 20, width: 70, height: 88,
            background: 'rgba(255,255,255,0.85)', borderRadius: 6, transform: 'rotate(8deg)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}>
            <div style={{ height: 14, background: 'var(--c-primary)', borderRadius: '6px 6px 0 0'}}/>
            <div style={{ padding: 6 }}>
              <div style={{ height: 2, background: 'var(--c-ink-faint)', marginBottom: 3 }}/>
              <div style={{ height: 2, background: 'var(--c-ink-faint)', marginBottom: 3, width: '80%' }}/>
              <div style={{ height: 2, background: 'var(--c-ink-faint)', marginBottom: 3 }}/>
              <div style={{ height: 2, background: 'var(--c-ink-faint)', marginBottom: 3, width: '70%' }}/>
            </div>
          </div>
        </div>

        {/* story text */}
        <div style={{ fontSize: 15, color: 'var(--c-ink)', lineHeight: 1.85, fontFamily: 'var(--font-display-en)' }}>
          Mia was an <WordHi w="ambitious"/> ninth grader. Every morning she would <WordHi w="determine"/> to finish her vocabulary list before breakfast. Her classmates thought she was too <WordHi w="persistent"/> ; but Mia knew that small daily effort would help her <WordHi w="achieve"/> her goal of getting into a top high school...
        </div>

        <div style={{ marginTop: 16, padding: 14, background: '#fff', borderRadius: 16, boxShadow: 'var(--sh-card)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-ink-soft)', marginBottom: 8, letterSpacing: '0.06em' }}>
            出现的复习词 (4 / 12)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['ambitious', 'determine', 'persistent', 'achieve', '... 8 more'].map((w,i) => (
              <div key={i} style={{
                padding: '4px 10px', background: i === 4 ? 'transparent' : 'var(--c-primary-soft)',
                color: i === 4 ? 'var(--c-ink-muted)' : 'var(--c-primary-ink)',
                borderRadius: 999, fontSize: 11, fontWeight: 700,
                fontFamily: 'var(--font-display-en)',
                border: i === 4 ? '1px dashed var(--c-ink-faint)' : 'none',
              }}>{w}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 24, left: 18, right: 18 }}>
        <CTA color="var(--c-primary)" size="lg" icon={<Icon.speaker s={18}/>}>跟读练习</CTA>
      </div>
    </div>
  );
}

function WordHi({ w }) {
  return (
    <span style={{
      background: 'var(--c-accent)', padding: '0 4px', borderRadius: 4,
      color: 'var(--c-ink)', fontWeight: 700,
    }}>{w}</span>
  );
}

Object.assign(window, {
  ScreenWordDetail, ScreenResult, ScreenReview,
  ScreenProfile, ScreenOnboarding, ScreenLeaderboard,
  ScreenPK, ScreenDailyStory,
});
