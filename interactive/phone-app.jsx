// phone-app.jsx — Phone app router + entry point
// Routes:
//   /onboarding
//   /home
//   /review
//   /rank
//   /me
//   /settings
//   /story
//   /pk
//   /mode-select
//   /study/:mode  (mc | flip | spell | listen | context | image)
//   /word/:id
//   /map/:id
//   /result    (after study session)

function PhoneAppInner() {
  const r = useRouter();
  const [lastResults, setLastResults] = React.useState([]);

  // study mode dispatcher
  const studyMatch = r.route.match(/^\/study\/(\w+)$/);
  const wordMatch = r.route.match(/^\/word\/(\w+)$/);
  const mapMatch = r.route.match(/^\/map\/(\w+)$/);

  if (r.route === '/onboarding') return <PhoneOnboarding onDone={() => r.navigate('/home')}/>;
  if (r.route === '/settings') return <PhoneSettings onClose={() => r.navigate('/home')}/>;
  if (r.route === '/story') return <DailyStory onClose={() => r.navigate('/home')}/>;
  if (r.route === '/pk') return <PKMatch onClose={() => r.navigate('/home')}/>;
  if (r.route === '/mode-select') return <ModeSelect onClose={() => r.navigate('/home')}/>;
  if (r.route === '/mistakes') return <PhoneMistakes onClose={() => r.navigate('/me')}/>;
  if (r.route === '/camera') return <PhoneCamera onClose={() => r.navigate('/home')}/>;
  if (r.route === '/pro') return <PhonePaywall onClose={() => r.navigate('/me')}/>;
  if (r.route === '/result') return <PhoneResult results={lastResults} onClose={() => r.navigate('/home')}/>;
  if (wordMatch) return <PhoneWordDetail wordId={wordMatch[1]} onClose={() => r.navigate('/home')}/>;
  if (mapMatch) return <MemoryMap wordId={mapMatch[1]} onClose={() => r.navigate('/word/' + mapMatch[1])}/>;

  if (studyMatch) {
    const mode = studyMatch[1];
    const words = WORDS.slice(0, 5);
    const onDone = (results) => { setLastResults(results); };
    const onClose = () => r.navigate('/result');
    const Modes = {
      mc: StudyMC, flip: StudyFlip, spell: StudySpell,
      listen: StudyListen, context: StudyContext, image: StudyImageMemory,
    };
    const Cmp = Modes[mode] || StudyMC;
    return <Cmp words={words} onClose={onClose} onDone={onDone}/>;
  }

  // Tab routes
  let body;
  switch (r.route) {
    case '/home': body = <PhoneHome/>; break;
    case '/review': body = <PhoneReview/>; break;
    case '/rank': body = <PhoneLeaderboard/>; break;
    case '/me': body = <PhoneProfile/>; break;
    default: body = <PhoneHome/>;
  }
  return <>{body}<PhoneTabBar/></>;
}

function PhoneApp({ initialRoute = '/home' }) {
  return (
    <RouterProvider root={initialRoute}>
      <StoreProvider>
        <PhoneShell>
          <PhoneAppInner/>
        </PhoneShell>
      </StoreProvider>
    </RouterProvider>
  );
}

Object.assign(window, { PhoneApp, PhoneAppInner });
