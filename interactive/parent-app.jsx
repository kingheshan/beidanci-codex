// parent-app.jsx — Parent dashboard (independent app)
// Designed as a separate experience for parents, not students. Shows
// child's weekly report, weakness analysis, time tracking, teacher messages.
// Production-grade: connects to api.getParentReport().

function ParentApp() {
  return (
    <div style={{
      width: 380, height: 720, borderRadius: 44, background: '#000', padding: 4,
      boxShadow: '0 30px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: 'var(--font-body-cn)',
    }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden', background: 'var(--c-bg)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 100, height: 28, borderRadius: 20, background: '#000', zIndex: 60 }}/>
        <RouterProvider root="/parent">
          <StoreProvider>
            <ParentInner/>
            <Toast/>
          </StoreProvider>
        </RouterProvider>
        <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: 110, height: 4, borderRadius: 999, background: 'rgba(0,0,0,0.3)', zIndex: 70 }}/>
      </div>
    </div>
  );
}

function ParentInner() {
  const [tab, setTab] = React.useState('home');
  return (
    <>
      <PhoneStatusBar/>
      {tab === 'home' && <ParentHome/>}
      {tab === 'analysis' && <ParentAnalysis/>}
      {tab === 'chat' && <ParentChat/>}
      {tab === 'me' && <ParentMe/>}
      <ParentTabBar tab={tab} setTab={setTab}/>
    </>
  );
}

function ParentTabBar({ tab, setTab }) {
  const items = [
    { id: 'home', l: '今日', icon: Icon.home },
    { id: 'analysis', l: '分析', icon: Icon.chart },
    { id: 'chat', l: '老师', icon: Icon.book },
    { id: 'me', l: '我的', icon: Icon.user },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 72,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--c-line)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start',
      paddingTop: 10, zIndex: 40,
    }}>
      {items.map(it => {
        const on = it.id === tab;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: on ? 'var(--c-primary)' : 'var(--c-ink-muted)', padding: '4px 12px',
          }}>
            <it.icon s={22}/>
            <span style={{ fontSize: 10, fontWeight: on ? 700 : 500 }}>{it.l}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Parent Home (今日) ──────────────────────────────────────
function ParentHome() {
  const { data, loading } = useApi(() => api.getParentReport(), []);

  if (loading) {
    return (
      <div style={{ padding: '60px 16px' }}>
        <Skeleton h={20} w={120} style={{ marginBottom: 16 }}/>
        <Skeleton h={160} radius={20} style={{ marginBottom: 14 }}/>
        <Skeleton h={120} radius={20} style={{ marginBottom: 14 }}/>
      </div>
    );
  }

  const d = data;
  const todayIdx = 4;
  return (
    <div className="aibd-scroll" style={{ position: 'absolute', inset: '46px 0 72px', overflow: 'auto' }}>
      {/* greeting */}
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', fontWeight: 600 }}>2026 · 5 · 18 · 周一</div>
        <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)', marginTop: 4 }}>
          {d.childName}今天<span style={{ color: 'var(--c-success)' }}>表现不错</span> ✨
        </div>
        <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 2 }}>
          {d.grade} · 已连续学习 {d.streak} 天
        </div>
      </div>

      {/* hero card */}
      <div style={{ padding: '14px 14px 0' }}>
        <div style={{
          padding: 18, borderRadius: 22, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-deep) 100%)',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 700, letterSpacing: '0.06em' }}>本周累计</div>
              <div className="aibd-display-en" style={{ fontSize: 38, fontWeight: 800, marginTop: 4, lineHeight: 1 }}>{d.weekXP}<span style={{ fontSize: 14, opacity: 0.7 }}> XP</span></div>
              <div style={{ fontSize: 11, marginTop: 4 }}>↑ <span style={{ color: 'var(--c-accent)' }}>+ {Math.round(d.progressVsLastWeek * 100)}%</span> 比上周</div>
            </div>
            <div style={{ flex: 1 }}/>
            <Wordy size={70} pose="study" mood="happy" form="bean" glow={false}/>
          </div>

          {/* week bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 14, height: 60 }}>
            {d.weekDays.map((day, i) => {
              const v = d.weekMinutes[i];
              const max = Math.max(...d.weekMinutes);
              return (
                <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', minHeight: 2,
                    height: `${(v / max) * 100}%`,
                    background: i === todayIdx ? 'var(--c-accent)' : 'rgba(255,255,255,0.35)',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative',
                  }}>
                    {i === todayIdx && (
                      <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 800, color: 'var(--c-accent)', whiteSpace: 'nowrap', marginBottom: 2 }}>
                        {v} 分钟
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 9, opacity: i === todayIdx ? 1 : 0.6, fontWeight: i === todayIdx ? 700 : 500 }}>{day}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* stats grid */}
      <div style={{ padding: '14px 14px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <PStat label="本周学习" value={`${d.weekMinutes.reduce((a,b)=>a+b,0)} 分钟`} sub={`日均 ${d.weekAvg} 分钟`} color="var(--c-primary)"/>
        <PStat label="本周词量" value={d.weekWords.reduce((a,b)=>a+b,0).toString()} sub="个 · 新学 + 复习" color="var(--c-success)"/>
        <PStat label="同年级排名" value={`Top ${d.timeRank.pct}%`} sub={`超过 ${100 - d.timeRank.pct}% ${d.timeRank.group}`} color="var(--c-coral)"/>
        <PStat label="总进度" value={`${Math.round(d.mastered / d.target * 100)}%`} sub={`${d.mastered} / ${d.target}`} color="var(--c-pink)"/>
      </div>

      {/* badges */}
      <div style={{ padding: '14px 14px 0' }}>
        <Card pad={14}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>本周新徽章</div>
            <Tag color="var(--c-streak)" bg="#FFE9D9" size="xs">+2 枚</Tag>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {d.recentBadges.map((b, i) => (
              <div key={i} style={{
                padding: '8px 12px', background: 'var(--c-primary-soft)', borderRadius: 12,
                fontSize: 12, fontWeight: 700, color: 'var(--c-primary-ink)',
                animation: 'pop .35s var(--ease) backwards', animationDelay: `${i * 0.1}s`,
              }}>{b}</div>
            ))}
          </div>
        </Card>
      </div>

      {/* teacher message preview */}
      <div style={{ padding: '12px 14px 24px' }}>
        <Card pad={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--c-mint)', display: 'grid', placeItems: 'center', fontSize: 22, color: '#fff' }}>{d.teacher.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800 }}>{d.teacher.name}</div>
              <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.teacher.lastMessage}</div>
            </div>
            <div style={{ fontSize: 9, color: 'var(--c-ink-muted)' }}>{d.teacher.time}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PStat({ label, value, sub, color }) {
  return (
    <Card pad={14}>
      <div style={{ fontSize: 10, color: 'var(--c-ink-muted)', fontWeight: 700 }}>{label}</div>
      <div className="aibd-display-en" style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1.2, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--c-ink-soft)', marginTop: 3 }}>{sub}</div>
    </Card>
  );
}

// ─── Parent Analysis ─────────────────────────────────────────
function ParentAnalysis() {
  const { data, loading } = useApi(() => api.getParentReport(), []);
  if (loading) return <div style={{ padding: '60px 16px' }}><Skeleton h={200} radius={20}/></div>;

  return (
    <div className="aibd-scroll" style={{ position: 'absolute', inset: '46px 0 72px', overflow: 'auto' }}>
      <div style={{ padding: '8px 16px 0' }}>
        <div className="aibd-display" style={{ fontSize: 22 }}>能力分析</div>
        <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 2 }}>AI 帮你看清孩子的强弱项</div>
      </div>

      {/* radar chart */}
      <div style={{ padding: '14px 14px 0' }}>
        <Card pad={14}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 10 }}>六维能力雷达</div>
          <RadarChart/>
        </Card>
      </div>

      {/* strengths */}
      <div style={{ padding: '12px 14px 0' }}>
        <Card pad={14}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-success)', marginBottom: 8, letterSpacing: '0.06em' }}>✅ 强项</div>
          {data.strengths.map((s, i) => (
            <div key={i} style={{ padding: '8px 10px', background: '#DCFCE7', borderRadius: 10, fontSize: 12, color: '#0E4D24', marginBottom: 4, fontWeight: 600 }}>
              {s}
            </div>
          ))}
        </Card>
      </div>

      {/* weaknesses */}
      <div style={{ padding: '12px 14px 0' }}>
        <Card pad={14}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-danger)', marginBottom: 8, letterSpacing: '0.06em' }}>⚠️ 待加强</div>
          {data.weakness.map((w, i) => (
            <div key={i} style={{
              padding: '10px 12px', background: '#FFE4E4', borderRadius: 12, marginBottom: 6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#7A1620' }}>{w.type}</span>
                <Tag color="#7A1620" bg="rgba(255,255,255,0.5)" size="xs">{w.count} 个词</Tag>
              </div>
              <div style={{ fontSize: 11, color: '#7A2630', marginTop: 4, lineHeight: 1.4 }}>{w.desc}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* AI advice */}
      <div style={{ padding: '12px 14px 24px' }}>
        <Card pad={14} style={{ background: 'linear-gradient(135deg, var(--c-primary-soft) 0%, #fff 80%)' }}>
          <Tag color="var(--c-primary)" bg="rgba(255,255,255,0.85)"><Icon.sparkle s={10}/> AI 建议</Tag>
          <div style={{ fontSize: 13, color: 'var(--c-ink)', marginTop: 8, lineHeight: 1.6 }}>
            👉 小敏对「形似词」混淆较多。建议在<b style={{ color: 'var(--c-primary)' }}>本周三晚 7 点</b>专项练习 <code>per-</code> 前缀词。每天 10 分钟即可。
          </div>
          <button style={{ marginTop: 10, padding: '8px 14px', background: 'var(--c-primary)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
            一键添加到孩子计划
          </button>
        </Card>
      </div>
    </div>
  );
}

function RadarChart() {
  // 6 axes: 听 / 说 / 读 / 写 / 词根 / 联想
  const axes = ['听力', '拼写', '阅读', '词根', '情景', '记忆'];
  const values = [0.92, 0.88, 0.75, 0.68, 0.84, 0.72];
  const cx = 110, cy = 90, r = 60;
  const pt = (i, mag = 1) => {
    const a = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    return [cx + Math.cos(a) * r * mag, cy + Math.sin(a) * r * mag];
  };
  return (
    <svg viewBox="0 0 220 180" style={{ width: '100%', height: 180 }}>
      {/* concentric polygons */}
      {[0.25, 0.5, 0.75, 1].map((m, i) => (
        <polygon key={i} points={axes.map((_, j) => pt(j, m).join(',')).join(' ')}
          fill="none" stroke="var(--c-line)" strokeWidth="1"/>
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--c-line)" strokeWidth="1"/>;
      })}
      {/* value polygon */}
      <polygon points={values.map((v, i) => pt(i, v).join(',')).join(' ')}
        fill="var(--c-primary)" fillOpacity="0.25" stroke="var(--c-primary)" strokeWidth="2"/>
      {values.map((v, i) => {
        const [x, y] = pt(i, v);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--c-primary)"/>;
      })}
      {axes.map((label, i) => {
        const [x, y] = pt(i, 1.22);
        return (
          <text key={i} x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--c-ink)">{label}</text>
        );
      })}
    </svg>
  );
}

// ─── Parent Chat (teacher messages) ──────────────────────────
function ParentChat() {
  return (
    <div style={{ position: 'absolute', inset: '46px 0 72px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 16px 14px', borderBottom: '1px solid var(--c-line)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--c-mint)', display: 'grid', placeItems: 'center', fontSize: 22 }}>👨‍🏫</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>王老师</div>
          <div style={{ fontSize: 11, color: 'var(--c-success)' }}>● 在线 · 实验中学 · 英语</div>
        </div>
      </div>

      <div className="aibd-scroll" style={{ flex: 1, overflow: 'auto', padding: '14px 14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ textAlign: 'center', fontSize: 9, color: 'var(--c-ink-muted)' }}>今天 14:32</div>

        <Bubble side="left" name="王老师">
          您好，本周小敏的英语作业完成得不错。
        </Bubble>
        <Bubble side="left" name="王老师">
          周一周二的形似词测验有些瑕疵，建议这周末在 App 里重点练一下 <b>per-</b> 前缀。
        </Bubble>
        <Bubble side="left" attach>
          📎 形似词专项 · 推荐课时
        </Bubble>

        <Bubble side="right">
          收到，谢谢老师！小敏这两天确实有点累。
        </Bubble>
        <Bubble side="right">
          周末我让她加一下专项练习。
        </Bubble>

        <div style={{ textAlign: 'center', fontSize: 9, color: 'var(--c-ink-muted)', marginTop: 4 }}>2 小时前</div>
        <Bubble side="left" name="王老师">
          好的，App 里设置了「家长查看」权限，您随时能看她的复习记录。
        </Bubble>
      </div>

      {/* input */}
      <div style={{ padding: '12px 14px 14px', borderTop: '1px solid var(--c-line)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--c-bg-deep)', border: 'none', cursor: 'pointer' }}>＋</button>
        <input type="text" placeholder="回复王老师..." style={{
          flex: 1, height: 36, padding: '0 14px', background: 'var(--c-bg-deep)',
          border: 'none', borderRadius: 999, fontSize: 13, outline: 'none', color: 'var(--c-ink)',
        }}/>
        <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--c-primary)', color: '#fff', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
          <Icon.chevronR s={16}/>
        </button>
      </div>
    </div>
  );
}

function Bubble({ side, name, attach, children }) {
  const me = side === 'right';
  return (
    <div style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start' }}>
      <div style={{ maxWidth: '78%' }}>
        {name && <div style={{ fontSize: 9, color: 'var(--c-ink-muted)', marginBottom: 3, paddingLeft: 6 }}>{name}</div>}
        <div style={{
          padding: '10px 12px', borderRadius: 14,
          background: me ? 'var(--c-primary)' : attach ? 'var(--c-accent)' : '#fff',
          color: me ? '#fff' : 'var(--c-ink)',
          boxShadow: 'var(--sh-card)', fontSize: 12, lineHeight: 1.5,
          borderTopLeftRadius: !me ? 4 : 14,
          borderTopRightRadius: me ? 4 : 14,
        }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Parent Me ───────────────────────────────────────────────
function ParentMe() {
  return (
    <div className="aibd-scroll" style={{ position: 'absolute', inset: '46px 0 72px', overflow: 'auto' }}>
      <div style={{ padding: '8px 16px 0' }}>
        <div className="aibd-display" style={{ fontSize: 22 }}>家长账号</div>
      </div>

      <div style={{ padding: '14px 14px 0' }}>
        <Card pad={16} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--c-primary-soft)', display: 'grid', placeItems: 'center', fontSize: 24 }}>👩</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>吴妈妈</div>
            <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 2 }}>138****8888 · 已绑定小敏</div>
          </div>
          <Tag color="var(--c-primary)" bg="var(--c-primary-soft)" size="xs">家长版</Tag>
        </Card>
      </div>

      <div style={{ padding: '14px 14px 0' }}>
        <Card pad={0}>
          {[
            { i: '🔔', l: '消息通知', r: '已开启' },
            { i: '📊', l: '周报推送', r: '每周日 9:00' },
            { i: '⏰', l: '学习提醒', r: '工作日 19:00' },
            { i: '👨‍👩‍👧', l: '管理孩子账号', r: '1 个' },
            { i: '💰', l: '会员订阅', r: '免费版 ›' },
            { i: '🔐', l: '隐私设置', r: '' },
            { i: '❓', l: '帮助中心', r: '' },
          ].map((row, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--c-line)',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: 22 }}>{row.i}</div>
              <div style={{ flex: 1, fontSize: 14, color: 'var(--c-ink)' }}>{row.l}</div>
              <div style={{ fontSize: 12, color: 'var(--c-ink-muted)' }}>{row.r}</div>
              <Icon.chevronR s={14}/>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ padding: '14px 14px 24px' }}>
        <button style={{
          width: '100%', padding: '12px', background: 'transparent', border: 'none',
          color: 'var(--c-danger)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>退出登录</button>
      </div>
    </div>
  );
}

Object.assign(window, { ParentApp });
