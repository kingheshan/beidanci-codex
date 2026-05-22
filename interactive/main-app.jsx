// main-app.jsx — Top-level: design canvas hosting both Phone and Web apps
// + a cover/rationale card. Tweaks panel switches theme.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "purple",
  "showCover": true
}/*EDITMODE-END*/;

function MainApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', t.theme);
  }, [t.theme]);

  return (
    <>
      <DesignCanvas>
        {t.showCover && (
          <DCSection id="cover" title="0 · 设计概览" subtitle="可点击的产品级原型 · 直接交付开发">
            <DCArtboard id="rationale" label="设计大纲" width={680} height={780}>
              <RationaleV2/>
            </DCArtboard>
          </DCSection>
        )}

        <DCSection id="mobile" title="1 · 移动端可点击原型" subtitle="点击 artboard 进入沉浸全屏模式 · Tab/路由/状态机/动画全部可用">
          <DCArtboard id="mobile-app" label="iPhone App · 完整流程" width={340} height={730}>
            <PhoneApp initialRoute="/home"/>
          </DCArtboard>
          <DCArtboard id="mobile-onboarding" label="Onboarding 引导" width={340} height={730}>
            <PhoneApp initialRoute="/onboarding"/>
          </DCArtboard>
          <DCArtboard id="mobile-story" label="AI 每日故事" width={340} height={730}>
            <PhoneApp initialRoute="/story"/>
          </DCArtboard>
          <DCArtboard id="mobile-pk" label="单词 PK 对战" width={340} height={730}>
            <PhoneApp initialRoute="/pk"/>
          </DCArtboard>
          <DCArtboard id="mobile-map" label="记忆图谱" width={340} height={730}>
            <PhoneApp initialRoute="/map/w3"/>
          </DCArtboard>
        </DCSection>

        <DCSection id="mobile-extra" title="1.5 · 移动端新增模块" subtitle="错题本 · 拍照查词 · 付费墙 · 家长端 · 全部基于 API mock 联通">
          <DCArtboard id="mobile-mistakes" label="📛 错题本" width={340} height={730}>
            <PhoneApp initialRoute="/mistakes"/>
          </DCArtboard>
          <DCArtboard id="mobile-camera" label="📷 拍照查词 OCR" width={340} height={730}>
            <PhoneApp initialRoute="/camera"/>
          </DCArtboard>
          <DCArtboard id="mobile-pro" label="👑 PRO 付费墙" width={340} height={730}>
            <PhoneApp initialRoute="/pro"/>
          </DCArtboard>
          <DCArtboard id="parent-app" label="👨‍👩‍👧 家长端 App" width={380} height={720}>
            <ParentApp/>
          </DCArtboard>
        </DCSection>

        <DCSection id="web" title="2 · Web 桌面端可点击原型" subtitle="侧边栏路由 · 9 大页面 · 学习模式悬浮层">
          <DCArtboard id="web-app" label="Web 端 · 完整应用" width={1300} height={820}>
            <WebApp/>
          </DCArtboard>
        </DCSection>

        <DCSection id="brand" title="3 · 品牌与设计系统" subtitle="作为开发参考保留">
          <DCArtboard id="brand-card" label="设计系统" width={720} height={680}>
            <BrandSystem/>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="主题色">
          <TweakRadio
            label="Palette"
            value={t.theme}
            options={[
              { value: 'purple', label: '电光紫' },
              { value: 'orange', label: '晨光橘' },
              { value: 'green',  label: '森林绿' },
            ]}
            onChange={(v) => setTweak('theme', v)}
          />
        </TweakSection>
        <TweakSection label="文档">
          <TweakToggle
            label="显示设计大纲"
            value={t.showCover}
            onChange={(v) => setTweak('showCover', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function RationaleV2() {
  const Pill = ({ children, color }) => (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 999,
      background: `color-mix(in srgb, ${color} 12%, white)`, color,
      fontSize: 10, fontWeight: 800, letterSpacing: '0.04em', marginRight: 4,
    }}>{children}</span>
  );

  return (
    <div style={{
      width: 680, height: 780, background: '#fff', borderRadius: 28, padding: 36,
      fontFamily: 'var(--font-body-cn)', color: 'var(--c-ink)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
        <Wordy size={70} pose="wave" mood="happy"/>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-primary)', letterSpacing: '0.1em' }}>PRODUCT-LEVEL INTERACTIVE PROTOTYPE</div>
          <div className="aibd-display" style={{ fontSize: 30, lineHeight: 1.1, marginTop: 2 }}>爱上背单词 · v1.0</div>
          <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 4 }}>
            可点击的完整产品 · 中国 K12 学生 · 移动 + Web 双端 · 可直接交付开发
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 22, flex: 1 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-primary)', marginBottom: 10, letterSpacing: '0.06em' }}>已实现的可玩功能</div>

          <Block n="1" title="6 种刷词交互（全部可玩）" colors={['var(--c-primary)']}>
            <Pill color="var(--c-primary)">状态机</Pill>
            <Pill color="var(--c-pink)">动画</Pill>
            <Pill color="var(--c-mint)">反馈</Pill>
            选择闯关 · 卡片翻转（含手势滑动）· 拼写填空（字母池 + 自动校验）· 听音辨义（音速调节 + 模拟播放）· AI 情景填空 · 图像联想
          </Block>

          <Block n="2" title="AI 三大特色全部可玩" colors={['var(--c-coral)']}>
            <Pill color="var(--c-coral)">AI</Pill>
            <b>每日故事</b>：跟读播放器 + 单词点击弹窗 + 理解题 / <b>单词 PK</b>：倒计时 + 对手模拟器 + 胜负结算 / <b>记忆图谱</b>：交互式力导图
          </Block>

          <Block n="3" title="完整学习闭环" colors={['var(--c-success)']}>
            <Pill color="var(--c-success)">流程</Pill>
            Onboarding 4 步 → 首页路径 → 选模式 → 学习状态机 → 结果庆祝 → SRS 复习
          </Block>

          <Block n="4" title="Web 端 9 个独立页面" colors={['var(--c-primary-deep)']}>
            <Pill color="var(--c-primary-deep)">桌面</Pill>
            Dashboard · 刷词模式 · 智能复习 · 词书 · 单词详情 · 排行榜 · PK · AI 故事 · 个人主页 · 设置
          </Block>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-success)', marginBottom: 10, letterSpacing: '0.06em' }}>如何使用</div>
          <div style={{ padding: 14, background: 'var(--c-success)', color: '#fff', borderRadius: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>🎮 试玩方式</div>
            <div style={{ fontSize: 11, lineHeight: 1.6, opacity: 0.95 }}>
              点击右上角 <b>↗</b> 进入全屏模式。手机端 artboard 是真的可点击 App，可来回切换 Tab、开始学习、做题、看故事。
            </div>
          </div>

          <div style={{ padding: 14, background: 'var(--c-primary-soft)', borderRadius: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-primary)', marginBottom: 4 }}>💻 给开发的提示</div>
            <ul style={{ paddingLeft: 16, margin: 0, fontSize: 11, color: 'var(--c-ink-soft)', lineHeight: 1.7 }}>
              <li>所有状态、动画、组件已模块化解耦</li>
              <li>设计 tokens 在 <code style={{ background: '#fff', padding: '0 4px', borderRadius: 3 }}>styles/tokens.css</code></li>
              <li>3 套主题通过 <code style={{ background: '#fff', padding: '0 4px', borderRadius: 3 }}>data-theme</code> 切换</li>
              <li>路由、Store、Session 状态机标准化</li>
              <li>组件接口清晰，可直接对接后端 API</li>
            </ul>
          </div>

          <div style={{ padding: 14, background: '#FFE9DE', borderRadius: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-coral)', marginBottom: 4 }}>🎨 视觉系统</div>
            <ul style={{ paddingLeft: 16, margin: 0, fontSize: 11, color: 'var(--c-ink-soft)', lineHeight: 1.7 }}>
              <li>Wordy 吉祥物 4 形态进化</li>
              <li>3 种调性可在 Tweaks 切换</li>
              <li>得意黑 + Bricolage + Noto Sans SC</li>
              <li>动画用 CSS keyframes，组件级</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ padding: 12, background: 'var(--c-bg)', borderRadius: 12, marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 24 }}>👉</div>
        <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', lineHeight: 1.5 }}>
          请把第二个 artboard <b style={{ color: 'var(--c-ink)' }}>「iPhone App · 完整流程」</b>展开全屏试玩。
          Tab 栏可以切换 4 大功能区，首页点开始学习 → 选择 6 种模式 → 完整答题流程 → 庆祝结果 → 返回首页。
        </div>
      </div>
    </div>
  );
}

function Block({ n, title, colors, children }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
      <div style={{
        flexShrink: 0, width: 26, height: 26, borderRadius: '50%',
        background: colors[0], color: '#fff',
        display: 'grid', placeItems: 'center',
        fontFamily: 'var(--font-display-en)', fontWeight: 800, fontSize: 12,
      }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--c-ink-soft)', marginTop: 4, lineHeight: 1.55 }}>{children}</div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MainApp/>);
