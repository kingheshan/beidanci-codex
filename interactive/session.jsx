// session.jsx — Study session state machine
// Handles the full study flow: queue → ask → answer → feedback → next → done.
// Mode-agnostic; the mode component drives `submitAnswer(correct)` and we
// move through the queue.
//
// Lifecycle:
//   idle → asking → answering → revealing → (next | done)
// XP awarded on each correct answer; hearts deducted on wrong; mastery
// updated; session.results carries per-word outcomes for the result screen.

function useStudySession({ words = [], mode = 'mc' } = {}) {
  const { state, update, award } = useStore();
  const [idx, setIdx] = React.useState(0);
  const [phase, setPhase] = React.useState('asking');  // asking | revealing | done
  const [results, setResults] = React.useState([]);     // [{wordId, correct, ms}]
  const [shake, setShake] = React.useState(false);
  const t0Ref = React.useRef(Date.now());

  // Reset clock on each new question
  React.useEffect(() => { t0Ref.current = Date.now(); }, [idx]);

  const current = words[idx];
  const total = words.length;
  const progress = (idx + (phase === 'revealing' ? 1 : 0)) / total;

  // Called by the mode component when user answers
  const submit = React.useCallback((correct) => {
    if (phase !== 'asking') return;
    const ms = Date.now() - t0Ref.current;
    setResults(r => [...r, { wordId: current.id, correct, ms }]);
    setPhase('revealing');
    if (correct) {
      award({ xp: 12 });
    } else {
      award({ hearts: -1 });
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [phase, current, award]);

  // Advance to next or finish
  const next = React.useCallback(() => {
    if (phase !== 'revealing') return;
    if (idx + 1 >= total) {
      setPhase('done');
    } else {
      setIdx(idx + 1);
      setPhase('asking');
    }
  }, [phase, idx, total]);

  // Reset for replay
  const restart = React.useCallback(() => {
    setIdx(0);
    setPhase('asking');
    setResults([]);
  }, []);

  return {
    current, idx, total, progress,
    phase, results, shake,
    submit, next, restart,
    correctCount: results.filter(r => r.correct).length,
    hearts: state.hearts,
  };
}

Object.assign(window, { useStudySession });
