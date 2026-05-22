// web-extras.jsx — Web versions of Mistakes, Camera, Paywall
// Use the same API mock layer; production-grade with loading skeletons.

// ─── Web Mistakes Notebook ───────────────────────────────────
function WebMistakes() {
  const r = useRouter();
  const [filter, setFilter] = React.useState('all');
  const { data, loading } = useApi(() => api.getMistakes({ filter }), [filter]);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <div>
          <div className="aibd-display" style={{ fontSize: 30 }}>错题本</div>
          <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 4 }}>
            AI 自动追踪你的弱项 · 重做错题效率提升 3 倍
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ height: 40, padding: '0 16px', background: '#fff', border: '1px solid var(--c-line)', borderRadius: 10, fontSize: 13, color: 'var(--c-ink)', cursor: 'pointer' }}>
            导出 PDF
          </button>
          <CTA color="var(--c-danger)" size="md" full={false} icon={<Icon.zap s={16} fill="#fff"/>} onClick={() => alert('开始错词重做（移动端可玩）')}>
            重做错词
          </CTA>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
        <WebTile label="本月错词" value={loading ? '—' : (data?.length || 0).toString()} sub="↓ 比上月 -32%" color="var(--c-danger)" icon={<Icon.heart s={16}/>}/>
        <WebTile label="高频错（≥2 次）" value="3" sub="紧急复习" color="var(--c-warning)" icon={<Icon.brain s={16}/>}/>
        <WebTile label="已纠正" value="284" sub="累计 · 不再考错" color="var(--c-success)" icon={<Icon.check s={16}/>}/>
        <WebTile label="纠错效率" value="89%" sub="本月正确率" color="var(--c-primary)" icon={<Icon.chart s={16}/>}/>
      </div>

      <Card pad={22}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="aibd-display" style={{ fontSize: 17 }}>所有错词</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['all','全部'],['frequent','高频错'],['mc','选择'],['spell','拼写'],['listen','听力']].map(([id, l]) => (
              <button key={id} onClick={() => setFilter(id)} style={{
                padding: '5px 12px', borderRadius: 999, border: 'none',
                background: filter === id ? 'var(--c-danger)' : 'var(--c-bg)',
                color: filter === id ? '#fff' : 'var(--c-ink-soft)',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--c-surface-soft)', borderRadius: 12, marginBottom: 6 }}>
                <Skeleton w={42} h={42} radius={10}/>
                <Skeleton w={100} h={16}/>
                <Skeleton w={140} h={12}/>
              </div>
            ))}
          </>
        ) : data?.map((m, i) => {
          const w = findWord(m.wordId);
          if (!w) return null;
          return (
            <button key={m.wordId} onClick={() => r.navigate('/word/' + m.wordId)} style={{
              width: '100%', padding: '14px 18px', background: 'var(--c-surface-soft)',
              border: 'none', borderRadius: 12, marginBottom: 6, display: 'flex',
              alignItems: 'center', gap: 16, cursor: 'pointer', textAlign: 'left',
              animation: 'slideUp .3s var(--ease) backwards', animationDelay: `${i * 0.04}s`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, position: 'relative',
                background: 'color-mix(in srgb, var(--c-danger) 12%, white)',
                color: 'var(--c-danger)', display: 'grid', placeItems: 'center',
              }}>
                <span className="aibd-display-en" style={{ fontSize: 18, fontWeight: 800 }}>{w.word[0].toUpperCase()}</span>
                <div style={{
                  position: 'absolute', top: -5, right: -5, width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--c-danger)', color: '#fff', fontSize: 10, fontWeight: 800,
                  display: 'grid', placeItems: 'center',
                }}>{m.wrongTimes}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span className="aibd-display-en" style={{ fontSize: 17, fontWeight: 700 }}>{w.word}</span>
                  <span style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>{w.pos} {w.cn}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 4 }}>
                  {modeIcon(m.mode)} · {m.reason}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <ProgressRing value={m.mastery} size={36} stroke={4} color="var(--c-danger)">
                  <div className="aibd-display-en" style={{ fontSize: 10, fontWeight: 800 }}>{Math.round(m.mastery * 100)}</div>
                </ProgressRing>
                <div style={{ fontSize: 10, color: 'var(--c-ink-muted)', marginTop: 4 }}>{m.lastWrong}</div>
              </div>
            </button>
          );
        })}
      </Card>
    </div>
  );
}

// ─── Web Camera (OCR) ────────────────────────────────────────
function WebCamera() {
  const [phase, setPhase] = React.useState('upload'); // upload | scanning | result
  const [result, setResult] = React.useState(null);
  const [picked, setPicked] = React.useState(new Set());
  const fileRef = React.useRef(null);
  const { toast } = useStore();

  const trigger = () => {
    setPhase('scanning');
    api.ocrPhoto().then(r => {
      setResult(r);
      setPicked(new Set(r.words.filter(w => !w.known).map(w => w.id)));
      setPhase('result');
    });
  };

  if (phase === 'upload') {
    return (
      <div style={{ padding: 28, maxWidth: 900, margin: '0 auto' }}>
        <Tag color="var(--c-mint)" bg="#D4F8EF"><Icon.camera s={12}/> AI OCR</Tag>
        <div className="aibd-display" style={{ fontSize: 30, marginTop: 12 }}>拍照 / 上传查词</div>
        <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 4 }}>
          拍下课本、试卷、单词表，AI 自动识别全部英文词，一键加入复习计划。
        </div>

        <div style={{
          marginTop: 24, padding: 60, background: '#fff', border: '3px dashed var(--c-line)',
          borderRadius: 22, textAlign: 'center', cursor: 'pointer',
          transition: 'border-color .2s, background .2s',
        }} onClick={() => trigger()}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📸</div>
          <div className="aibd-display" style={{ fontSize: 22, color: 'var(--c-ink)' }}>点击上传或拖入图片</div>
          <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 6 }}>支持 JPG / PNG / HEIC · 单张最多 4MB</div>
          <div style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <button onClick={(e) => { e.stopPropagation(); trigger(); }} style={{ height: 40, padding: '0 18px', background: 'var(--c-primary)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              选择文件
            </button>
            <button onClick={(e) => { e.stopPropagation(); trigger(); }} style={{ height: 40, padding: '0 18px', background: 'var(--c-bg)', color: 'var(--c-ink)', border: '1px solid var(--c-line)', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              📋 粘贴图片
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 24 }}>
          {[
            { i: '🎯', t: '自动识别', s: 'OCR 精度 99%，含手写体' },
            { i: '🧠', t: 'AI 圈生词', s: '区分新词 / 已学 / 待复习' },
            { i: '⚡', t: '一键加入', s: '勾选后自动加进 SRS 队列' },
          ].map((tip, i) => (
            <Card key={i} pad={18}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>{tip.i}</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{tip.t}</div>
              <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 4, lineHeight: 1.5 }}>{tip.s}</div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'scanning') {
    return (
      <div style={{ padding: 28, maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ padding: 80, background: '#1a1a1f', borderRadius: 22, color: '#fff' }}>
          <div style={{ width: 100, height: 100, margin: '0 auto', position: 'relative' }}>
            {[0,1,2].map(i => <div key={i} style={{ position: 'absolute', inset: 0, border: '2px solid var(--c-accent)', borderRadius: '50%', animation: `pop 1.8s ease-out ${i * 0.4}s infinite`, opacity: 0.5 }}/>)}
            <div style={{ position: 'absolute', inset: 25, borderRadius: '50%', background: 'var(--c-primary)', display: 'grid', placeItems: 'center' }}>
              <Icon.sparkle s={36} fill="#fff"/>
            </div>
          </div>
          <div className="aibd-display" style={{ fontSize: 22, marginTop: 24 }}>AI 识别中...</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>Wordy 正在逐行扫描，给生词加圈</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 28, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
        <div>
          <Tag color="var(--c-mint)" bg="#D4F8EF" size="xs">识别完成</Tag>
          <div className="aibd-display" style={{ fontSize: 22, marginTop: 8 }}>检出 {result.detected} 个英文词，建议复习 {picked.size} 个</div>
        </div>
        <button onClick={() => setPhase('upload')} style={{ height: 36, padding: '0 14px', background: '#fff', border: '1px solid var(--c-line)', borderRadius: 10, fontSize: 12, cursor: 'pointer' }}>重新上传</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        <Card pad={0} style={{ overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'relative', height: 380, background: '#f4ecd8', padding: 28, color: '#3a3a3a', fontFamily: 'serif', fontSize: 14, lineHeight: 1.9 }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>Lesson 5 · The Bookworm</div>
            <div style={{ maxWidth: 380 }}>
              Mia is an ambitious student. She wants to achieve her dream.
              Her teacher says she is persistent and willing to determine her
              own path with perseverance and aspiration for a brighter future.
            </div>
            {result.words.map(w => (
              <div key={w.id} style={{
                position: 'absolute', left: `${w.x}%`, top: `${w.y}%`,
                padding: '2px 8px', fontSize: 11, fontWeight: 800, borderRadius: 5,
                background: w.isNew ? 'var(--c-coral)' : (w.known ? 'var(--c-success)' : 'var(--c-warning)'),
                color: '#fff', boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
                animation: 'pop .4s var(--ease) backwards', animationDelay: `${0.05 * parseInt(w.id.replace(/\D/g,'') || 0)}s`,
              }}>{w.word}</div>
            ))}
          </div>
          <div style={{ padding: 12, display: 'flex', gap: 6, justifyContent: 'center', background: '#fff', borderTop: '1px solid var(--c-line)' }}>
            <Tag color="var(--c-success)" bg="#DCFCE7" size="xs">● 已学</Tag>
            <Tag color="var(--c-warning)" bg="rgba(255,176,32,0.15)" size="xs">● 待复习</Tag>
            <Tag color="var(--c-coral)" bg="#FFE9DE" size="xs">● 新词</Tag>
          </div>
        </Card>

        <Card pad={20}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>识别词汇 · 已选 {picked.size}</div>
            <button onClick={() => setPicked(new Set(result.words.map(w => w.id)))} style={{ fontSize: 11, color: 'var(--c-primary)', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer' }}>全选</button>
          </div>
          <div style={{ maxHeight: 290, overflow: 'auto' }} className="aibd-scroll">
            {result.words.map(w => {
              const wd = findWord(w.id) || { word: w.word, cn: w.isNew ? '（新词）' : '', pos: '' };
              const isP = picked.has(w.id);
              return (
                <div key={w.id} onClick={() => { const n = new Set(picked); n.has(w.id) ? n.delete(w.id) : n.add(w.id); setPicked(n); }} style={{
                  padding: '10px 12px', background: isP ? 'var(--c-primary-soft)' : 'var(--c-surface-soft)',
                  border: `1.5px solid ${isP ? 'var(--c-primary)' : 'transparent'}`,
                  borderRadius: 10, marginBottom: 6, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5,
                    background: isP ? 'var(--c-primary)' : '#fff',
                    border: `2px solid ${isP ? 'var(--c-primary)' : 'var(--c-line)'}`,
                    display: 'grid', placeItems: 'center', color: '#fff',
                  }}>{isP && <Icon.check s={12}/>}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span className="aibd-display-en" style={{ fontSize: 13, fontWeight: 700 }}>{w.word}</span>
                      {w.isNew && <Tag color="var(--c-coral)" bg="#FFE9DE" size="xs">NEW</Tag>}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--c-ink-soft)' }}>{wd.pos} {wd.cn}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => { toast(`已添加 ${picked.size} 个词`, 'success'); }} style={{
            width: '100%', marginTop: 12, height: 44, background: 'var(--c-primary)', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer',
            boxShadow: 'var(--sh-cta)',
          }}>
            加入复习计划（{picked.size}）
          </button>
        </Card>
      </div>
    </div>
  );
}

// ─── Web Paywall ─────────────────────────────────────────────
function WebPaywall() {
  const { data: plans, loading } = useApi(() => api.getPlans(), []);
  const [picked, setPicked] = React.useState('yearly');
  const { toast } = useStore();
  return (
    <div style={{
      background: 'linear-gradient(180deg, #1A1340 0%, #2B1F6E 100%)', color: '#fff',
      minHeight: '100%', padding: 40, position: 'relative', overflow: 'hidden',
    }}>
      {[...Array(40)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${(i * 23) % 100}%`, top: `${(i * 13) % 100}%`,
          width: 3 + (i % 3), height: 3 + (i % 3),
          background: ['var(--c-accent)','#fff','var(--c-pink)'][i % 3],
          borderRadius: '50%', opacity: 0.4,
          animation: `drift ${3 + (i % 4)}s ease-in-out ${i * 0.1}s infinite`,
        }}/>
      ))}

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Wordy size={130} pose="celebrate" mood="cheer" form="rocket"/>
          <div className="aibd-display" style={{ fontSize: 42, marginTop: 12 }}>
            <span style={{ background: 'linear-gradient(90deg, var(--c-accent), var(--c-pink))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>升级 PRO</span>
          </div>
          <div style={{ fontSize: 15, opacity: 0.85, marginTop: 6 }}>解锁全部 AI 能力 · 加速 3 倍背单词</div>
        </div>

        {/* feature comparison table */}
        <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', borderRadius: 22, padding: 28, border: '1px solid rgba(255,255,255,0.15)', marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16, fontSize: 12, fontWeight: 800 }}>
            <div></div>
            <div style={{ textAlign: 'center', opacity: 0.6 }}>免费版</div>
            <div style={{ textAlign: 'center', color: 'var(--c-accent)' }}>👑 PRO</div>
          </div>
          {[
            ['每日 AI 故事', '1 次/天', '不限'],
            ['拍照查词 OCR', '5 次/月', '不限'],
            ['AI 个性化例句', '✗', '✓'],
            ['完整记忆图谱', '✗', '✓'],
            ['单词 PK 段位赛', '青铜段位', '冲击王者'],
            ['专属 Pro 徽章', '✗', '✓'],
            ['去除广告', '✗', '✓'],
            ['深度学习报告', '基础', '可导出 PDF'],
          ].map(([f, free, pro], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 13 }}>
              <div>{f}</div>
              <div style={{ textAlign: 'center', opacity: 0.6 }}>{free}</div>
              <div style={{ textAlign: 'center', color: 'var(--c-accent)', fontWeight: 700 }}>{pro}</div>
            </div>
          ))}
        </div>

        {/* plans */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 22 }}>
          {loading ? <Skeleton w="100%" h={130}/> : plans?.map(p => {
            const sel = picked === p.id;
            return (
              <button key={p.id} onClick={() => setPicked(p.id)} style={{
                padding: 22, borderRadius: 18,
                background: sel ? '#fff' : 'rgba(255,255,255,0.10)',
                color: sel ? 'var(--c-primary-deep)' : '#fff',
                border: `2px solid ${sel ? 'var(--c-accent)' : 'rgba(255,255,255,0.18)'}`,
                cursor: 'pointer', position: 'relative', textAlign: 'left',
              }}>
                {p.tag && (
                  <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', padding: '3px 12px', borderRadius: 999, background: 'var(--c-accent)', color: 'var(--c-ink)', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>{p.tag}</div>
                )}
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7 }}>{p.name}</div>
                <div className="aibd-display-en" style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}>¥{p.price}</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
                  {p.perMonth ? `约 ¥${p.perMonth}/月` : '一次买断终身使用'}
                  {p.save > 0 && ` · 省 ¥${p.save}`}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={() => toast('🎉 升级成功！', 'success')} style={{
            height: 56, padding: '0 56px', background: 'var(--c-accent)', color: 'var(--c-ink)',
            border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(255,214,10,0.4)',
          }}>立即升级 PRO 🚀</button>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 14 }}>
            支持微信 / 支付宝 · 可随时取消 · 7 天无理由退款
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WebMistakes, WebCamera, WebPaywall });
