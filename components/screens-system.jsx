// screens-system.jsx — Brand system showcase + Web version + Settings

// ─── Brand System Card ───────────────────────────────────────
function BrandSystem() {
  return (
    <div style={{
      width: 720, padding: 32, background: 'var(--c-surface)', borderRadius: 28,
      fontFamily: 'var(--font-body-cn)', color: 'var(--c-ink)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        <Wordy size={70} pose="wave" mood="happy"/>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-primary)', letterSpacing: '0.1em' }}>BRAND IDENTITY</div>
          <div className="aibd-display" style={{ fontSize: 32, lineHeight: 1.1, marginTop: 2 }}>爱上背单词</div>
          <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 4 }}>AI 陪你高效、有趣背单词 · For K12 Students</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Palette */}
        <div>
          <SectionLabel>主色板</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Swatch color="var(--c-primary)" name="Primary" hex="#6C5CE7" big/>
            <Swatch color="var(--c-accent)" name="Accent" hex="#FFD60A" inkLight/>
            <Swatch color="var(--c-pink)" name="Pink" hex="#FF6B9D"/>
            <Swatch color="var(--c-mint)" name="Mint" hex="#00D4AA"/>
            <Swatch color="var(--c-coral)" name="Coral" hex="#FF8A65"/>
            <Swatch color="var(--c-sky)" name="Sky" hex="#54C7FF"/>
          </div>
        </div>

        {/* Typography */}
        <div>
          <SectionLabel>字体系统</SectionLabel>
          <div style={{ padding: 14, background: 'var(--c-surface-soft)', borderRadius: 14, marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: 'var(--c-ink-muted)', fontWeight: 700, marginBottom: 4 }}>DISPLAY · 得意黑 + Bricolage</div>
            <div className="aibd-display" style={{ fontSize: 24, lineHeight: 1 }}>爱上背单词</div>
            <div className="aibd-display-en" style={{ fontSize: 22, lineHeight: 1.1, marginTop: 2 }}>Persistent</div>
          </div>
          <div style={{ padding: 14, background: 'var(--c-surface-soft)', borderRadius: 14 }}>
            <div style={{ fontSize: 9, color: 'var(--c-ink-muted)', fontWeight: 700, marginBottom: 4 }}>BODY · Noto Sans SC + Jakarta</div>
            <div style={{ fontSize: 14, lineHeight: 1.4 }}>每天 20 个新词，30 个复习</div>
            <div style={{ fontSize: 13, lineHeight: 1.4, fontFamily: 'var(--font-body-en)' }}>20 new words, 30 reviews daily</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <SectionLabel>Wordy · 形态进化</SectionLabel>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', padding: '8px 0' }}>
          <EvolutionStep level={1} form="bean" name="Bean" desc="Lv. 1-10 · 圆形态"/>
          <EvolutionStep level={2} form="sprout" name="Sprout" desc="Lv. 11-20 · 发芽"/>
          <EvolutionStep level={3} form="star" name="Star" desc="Lv. 21-30 · 星之形态"/>
          <EvolutionStep level={4} form="rocket" name="Rocket" desc="Lv. 31+ · 终极"/>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <SectionLabel>基础组件</SectionLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <CTA color="var(--c-primary)" size="md" full={false}>开始学习</CTA>
          <CTA color="var(--c-success)" size="md" full={false}>认识</CTA>
          <CTA color="var(--c-surface)" textColor="var(--c-ink)" size="md" full={false} style={{ boxShadow: '0 2px 0 var(--c-line)', border: '1.5px solid var(--c-line)' }}>跳过</CTA>
          <CTA color="var(--c-danger)" size="md" full={false}>不认识</CTA>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <StreakChip days={28}/>
          <GemPill count={1280}/>
          <HeartPill count={4}/>
          <Tag color="var(--c-primary)" bg="var(--c-primary-soft)">中考核心</Tag>
          <Tag color="var(--c-coral)" bg="#FFE9DE"><Icon.sparkle s={10}/> AI 情景</Tag>
          <Tag color="var(--c-success)" bg="#DCFCE7" size="xs">+12 XP</Tag>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <ProgressRing value={0.74} size={60} stroke={7} color="var(--c-primary)">
            <div className="aibd-display-en" style={{ fontSize: 14, fontWeight: 800 }}>74%</div>
          </ProgressRing>
          <div style={{ flex: 1 }}>
            <ProgressBar value={0.6} height={10}/>
            <div style={{ height: 6 }}/>
            <ProgressBar value={0.85} height={8} color="var(--c-success)"/>
            <div style={{ height: 6 }}/>
            <ProgressBar value={0.35} height={6} color="var(--c-streak)"/>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>{children}</div>;
}

function Swatch({ color, name, hex, big, inkLight }) {
  const ink = inkLight ? 'var(--c-ink)' : '#fff';
  return (
    <div style={{
      background: color, color: ink,
      borderRadius: 12, padding: 10,
      minHeight: big ? 70 : 52,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div style={{ fontSize: 11, fontWeight: 800 }}>{name}</div>
      <div className="aibd-mono" style={{ fontSize: 10, opacity: 0.85 }}>{hex}</div>
    </div>
  );
}

function EvolutionStep({ level, form, name, desc }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ minHeight: 110, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 4 }}>
        <Wordy size={80} pose={form === 'star' ? 'celebrate' : 'idle'} form={form} mood={form === 'star' ? 'cheer' : 'happy'}/>
      </div>
      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--c-primary)', letterSpacing: '0.1em' }}>LEVEL {level}</div>
      <div className="aibd-display-en" style={{ fontSize: 14, fontWeight: 800, marginTop: 1 }}>{name}</div>
      <div style={{ fontSize: 10, color: 'var(--c-ink-muted)', marginTop: 2 }}>{desc}</div>
    </div>
  );
}

// ─── Web version (desktop) ───────────────────────────────────
function ScreenWebApp() {
  return (
    <div style={{
      width: 1120, height: 700, background: 'var(--c-bg)', borderRadius: 16, overflow: 'hidden',
      display: 'flex', fontFamily: 'var(--font-body-cn)', color: 'var(--c-ink)',
      boxShadow: 'var(--sh-card)',
    }}>
      {/* sidebar */}
      <div style={{ width: 220, background: '#fff', borderRight: '1px solid var(--c-line)', padding: 18, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          <div style={{ width: 32, height: 32 }}>
            <WordyMini size={32}/>
          </div>
          <div className="aibd-display" style={{ fontSize: 16 }}>爱上背单词</div>
        </div>

        {[
          { i: Icon.home, l: '今日学习', on: true, badge: '12' },
          { i: Icon.brain, l: '智能复习', badge: '14' },
          { i: Icon.book, l: '我的词书' },
          { i: Icon.swords, l: '单词 PK' },
          { i: Icon.sparkle, l: 'AI 故事' },
          { i: Icon.trophy, l: '排行榜' },
          { i: Icon.chart, l: '学习数据' },
        ].map((n,i) => (
          <div key={i} style={{
            padding: '10px 12px', borderRadius: 10, marginBottom: 4,
            background: n.on ? 'var(--c-primary-soft)' : 'transparent',
            color: n.on ? 'var(--c-primary)' : 'var(--c-ink-soft)',
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            fontWeight: n.on ? 700 : 500,
          }}>
            <n.i s={18}/>
            <span style={{ flex: 1, fontSize: 13 }}>{n.l}</span>
            {n.badge && <Tag color={n.on ? 'var(--c-primary)' : 'var(--c-ink-muted)'} bg={n.on ? '#fff' : 'var(--c-bg-deep)'} size="xs">{n.badge}</Tag>}
          </div>
        ))}

        <div style={{ flex: 1 }}/>

        <div style={{ padding: 14, background: 'var(--c-primary-soft)', borderRadius: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: 11, color: 'var(--c-primary)', fontWeight: 800, marginBottom: 2 }}>Pro 会员</div>
          <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', lineHeight: 1.4 }}>解锁全部 AI 故事与拍照查词</div>
          <div style={{ position: 'absolute', right: -10, bottom: -16, opacity: 0.6 }}>
            <Wordy size={50} pose="idle" form="rocket"/>
          </div>
          <div style={{ height: 26, padding: '0 10px', background: 'var(--c-primary)', color: '#fff', borderRadius: 8, display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 800, marginTop: 8 }}>查看权益</div>
        </div>
      </div>

      {/* main */}
      <div style={{ flex: 1, display: 'flex' }}>
        <div className="aibd-scroll" style={{ flex: 1, padding: 28, overflow: 'auto' }}>
          {/* greeting */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--c-ink-muted)', fontWeight: 600 }}>2026 · 5 · 18 · 周一</div>
              <div className="aibd-display" style={{ fontSize: 32, marginTop: 4 }}>下午好，小敏 <span style={{ color: 'var(--c-primary)' }}>✨</span></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <StreakChip days={28}/>
              <GemPill count={1280}/>
            </div>
          </div>

          {/* hero */}
          <div style={{
            padding: 28, borderRadius: 24, marginBottom: 18, position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-deep) 60%, #1A1340 100%)',
            color: '#fff', display: 'flex', alignItems: 'center', gap: 20,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 800, letterSpacing: '0.08em' }}>UNIT 3 · 校园生活</div>
              <div className="aibd-display" style={{ fontSize: 36, lineHeight: 1.1, marginTop: 4 }}>今天的旅程开始啦</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 6, maxWidth: 380 }}>20 个新词 + 14 个复习。预计 12 分钟，完成后 Wordy 会进化形态。</div>
              <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
                <button style={{ height: 44, padding: '0 22px', background: '#fff', color: 'var(--c-primary)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  开始今日学习 <Icon.chevronR s={14}/>
                </button>
                <button style={{ height: 44, padding: '0 22px', background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  只看 AI 故事
                </button>
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <Wordy size={180} pose="study" mood="happy"/>
            </div>
          </div>

          {/* 4-tile row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
            <WebStatTile label="今日新词" value="8" sub="还差 12 个" color="var(--c-pink)"/>
            <WebStatTile label="待复习" value="14" sub="3 个生疏" color="var(--c-warning)"/>
            <WebStatTile label="本周 XP" value="1.2k" sub="↑ 12%" color="var(--c-primary)"/>
            <WebStatTile label="掌握度" value="74%" sub="中考核心" color="var(--c-success)"/>
          </div>

          {/* path + side */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
            <Card pad={20}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <div className="aibd-display" style={{ fontSize: 18 }}>学习路径 · 第 3 单元</div>
                <span style={{ fontSize: 11, color: 'var(--c-primary)', fontWeight: 700, cursor: 'pointer' }}>切换词书 ›</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0' }}>
                {['done','done','current','locked','boss'].map((s,i) => (
                  <React.Fragment key={i}>
                    <LessonNode state={s}
                      icon={s === 'done' ? <Icon.check s={22}/> : s === 'current' ? <Icon.zap s={26} fill="#fff"/> : s === 'boss' ? <Icon.trophy s={22}/> : <Icon.mic s={20}/>}
                      label={['入门','进阶','情景','听力','BOSS'][i]}/>
                    {i < 4 && <div style={{ flex: 1, height: 3, background: i < 2 ? 'var(--c-success)' : 'var(--c-line)', borderRadius: 999, opacity: i < 2 ? 1 : 0.6, position: 'relative' }}>
                      {i < 2 && <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'var(--c-success)' }}/>}
                    </div>}
                  </React.Fragment>
                ))}
              </div>
            </Card>
            <Card pad={20} style={{ background: 'linear-gradient(135deg, var(--c-primary-soft) 0%, #fff 80%)' }}>
              <Tag color="var(--c-coral)" bg="#FFE9DE"><Icon.sparkle s={10}/> AI · 今日生成</Tag>
              <div className="aibd-display" style={{ fontSize: 18, marginTop: 8 }}>The Persistent Bookworm</div>
              <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 4, lineHeight: 1.5 }}>
                把今天复习的 12 个词编成一篇校园故事，听 + 读双形态。
              </div>
              <CTA color="var(--c-primary)" size="sm" full={false} style={{ marginTop: 12 }}>开始</CTA>
            </Card>
          </div>
        </div>

        {/* right rail */}
        <div style={{ width: 280, background: '#fff', borderLeft: '1px solid var(--c-line)', padding: 24, overflow: 'auto' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 12 }}>本周连胜</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
            {['一','二','三','四','五','六','日'].map((d,i) => (
              <div key={d} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i < 4 ? 'var(--c-streak)' : i === 4 ? 'var(--c-streak)' : 'var(--c-line)',
                  color: i <= 4 ? '#fff' : 'var(--c-ink-faint)',
                  margin: '0 auto', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800,
                  outline: i === 4 ? '2px solid var(--c-streak)' : 'none', outlineOffset: 2,
                }}>{i <= 3 ? '🔥' : i === 4 ? '!' : ''}</div>
                <div style={{ fontSize: 10, marginTop: 4, color: 'var(--c-ink-muted)' }}>{d}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 10 }}>翡翠组 · 前 10 名晋级</div>
          {[
            { rank: 1, name: '赵雪', xp: 2100 },
            { rank: 2, name: '林浩', xp: 1240 },
            { rank: 5, name: '吴小敏 (你)', xp: 820, me: true },
          ].map(r => (
            <div key={r.rank} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
              background: r.me ? 'var(--c-primary-soft)' : 'transparent',
              borderRadius: 8, marginBottom: 4,
            }}>
              <div className="aibd-display-en" style={{ width: 18, fontWeight: 800, fontSize: 12, color: 'var(--c-ink-muted)' }}>{r.rank}</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: r.me ? 800 : 500 }}>{r.name}</div>
              <div className="aibd-display-en" style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-primary)' }}>{r.xp}</div>
            </div>
          ))}

          <div style={{ height: 16 }}/>
          <Card pad={14} style={{ background: 'var(--c-bg-deep)', boxShadow: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Icon.camera s={16}/>
              <div style={{ fontSize: 12, fontWeight: 800 }}>拍照查词</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', lineHeight: 1.5 }}>
              拍下课本一页，AI 自动圈出生词，一键加入复习计划。
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function WebStatTile({ label, value, sub, color }) {
  return (
    <Card pad={16}>
      <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div className="aibd-display-en" style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 4 }}>{sub}</div>
    </Card>
  );
}

// ─── Settings (plan + book selection) ────────────────────────
function ScreenSettings() {
  return (
    <div style={{ height: '100%', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '50px 18px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--c-ink-soft)', padding: 0 }}>
          <Icon.chevronL s={22}/>
        </button>
        <div className="aibd-display" style={{ fontSize: 18, flex: 1 }}>学习计划</div>
      </div>

      <div className="aibd-scroll" style={{ flex: 1, padding: '4px 14px 24px', overflow: 'auto' }}>
        <Card pad={16} style={{ marginBottom: 12 }}>
          <SectionLabel>每日新词量</SectionLabel>
          <div className="aibd-display-en" style={{ fontSize: 36, fontWeight: 800, color: 'var(--c-primary)', textAlign: 'center', margin: '6px 0' }}>20<span style={{ fontSize: 14, color: 'var(--c-ink-muted)' }}>词 / 天</span></div>
          <div style={{ height: 30, position: 'relative', padding: '0 8px' }}>
            {/* slider track */}
            <div style={{ position: 'absolute', top: 14, left: 8, right: 8, height: 4, background: 'var(--c-line)', borderRadius: 999 }}>
              <div style={{ position: 'absolute', left: 0, width: '40%', height: '100%', background: 'var(--c-primary)', borderRadius: 999 }}/>
            </div>
            {/* thumb */}
            <div style={{ position: 'absolute', top: 6, left: '40%', width: 20, height: 20, borderRadius: '50%', background: '#fff', border: '3px solid var(--c-primary)', boxShadow: '0 2px 6px rgba(108,92,231,0.3)' }}/>
            {/* ticks */}
            {[5,15,30,50,80].map((t,i) => (
              <div key={t} style={{ position: 'absolute', top: 22, left: `${i * 25}%`, transform: 'translateX(-50%)', fontSize: 10, color: 'var(--c-ink-muted)' }}>{t}</div>
            ))}
          </div>
          <div style={{ marginTop: 26, fontSize: 11, color: 'var(--c-ink-muted)', textAlign: 'center' }}>
            ⏱ 预计每天用时 <b style={{ color: 'var(--c-ink)' }}>12 分钟</b> · 90 天学完
          </div>
        </Card>

        <Card pad={16} style={{ marginBottom: 12 }}>
          <SectionLabel>当前词书</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 60, height: 76, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--c-primary), var(--c-primary-deep))',
              color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              padding: 8, fontFamily: 'var(--font-display-en)',
            }}>
              <div style={{ fontSize: 7, opacity: 0.7 }}>中考</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>1600</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-ink)' }}>中考核心 1600</div>
              <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 1 }}>人教版 · 1284 / 1600 已学</div>
              <ProgressBar value={0.8} height={5}/>
            </div>
          </div>
        </Card>

        <Card pad={16} style={{ marginBottom: 12 }}>
          <SectionLabel>提醒</SectionLabel>
          <SettingRow label="每日学习提醒" right={<Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">19:00</Tag>}/>
          <SettingRow label="复习提醒" right={<Toggle on/>}/>
          <SettingRow label="学习连胜保护" right={<Toggle on/>}/>
          <SettingRow label="AI 个性化例句" right={<Toggle on/>} last/>
        </Card>

        <Card pad={16}>
          <SectionLabel>偏好</SectionLabel>
          <SettingRow label="发音口音" right={<span style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>美音 ›</span>}/>
          <SettingRow label="兴趣标签" right={<span style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>足球 · 动漫 · 4 ›</span>}/>
          <SettingRow label="深色模式" right={<Toggle/>} last/>
        </Card>
      </div>
    </div>
  );
}

function SettingRow({ label, right, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: last ? 'none' : '1px solid var(--c-line)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--c-ink)' }}>{label}</span>
      {right}
    </div>
  );
}

function Toggle({ on }) {
  return (
    <div style={{
      width: 40, height: 22, borderRadius: 999,
      background: on ? 'var(--c-primary)' : 'var(--c-ink-faint)',
      position: 'relative', transition: 'background .2s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)', transition: 'left .2s',
      }}/>
    </div>
  );
}

Object.assign(window, { BrandSystem, ScreenWebApp, ScreenSettings });
