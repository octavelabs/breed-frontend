'use client';

import { ArrowLeft2, ArrowRight2, Timer1, TickCircle } from 'iconsax-react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { EdifyMonthResponse, edifyService } from '@/lib/api-services';

export interface EdifyTabHandle {
  startTimer: () => void;
  stopTimer: () => void;
}

interface EdifyTabProps {
  onTimerStateChange?: (state: TimerState) => void;
  autoStart?: { category?: string };
}

interface BulletinCtx {
  bulletinId: string;
  title: string;
  category: string;
  points: string[];
}

const FOCUS_OPTIONS = [
  { id: 'PERSONAL_DEVOTION', label: 'Personal Devotion' },
  { id: 'INTERCESSION', label: 'Intercession' },
  { id: 'HEALING', label: 'Healing' },
  { id: 'NATION_AND_CHURCH', label: 'Nation & Church' },
  { id: 'THANKSGIVING_AND_TESTIMONIES', label: 'Thanksgiving' },
  { id: 'FAMILY', label: 'Family' },
  { id: 'PURPOSE_AND_CALLING', label: 'Purpose & Calling' },
  { id: 'OTHER', label: 'Other' },
];

const DURATION_PRESETS = [5, 10, 15, 20, 30, 45, 60, 90];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function edifyHeat(totalMin: number): string {
  if (totalMin === 0) return '#F0F2F4';
  if (totalMin < 15) return '#E7C8FF';
  if (totalMin < 30) return '#C084FC';
  if (totalMin < 45) return '#9333EA';
  return '#5B21B6';
}

function formatElapsed(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

type TimerState = 'idle' | 'running' | 'details';

const EdifyTab = forwardRef<EdifyTabHandle, EdifyTabProps>((props, ref) => {
  const { onTimerStateChange, autoStart } = props;
  // ── Timer ─────────────────────────────────────────────────────────────────
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<Date | null>(null);
  const stoppedAtRef = useRef<Date | null>(null);
  const [bulletinCtx, setBulletinCtx] = useState<BulletinCtx | null>(null);
  const [checkedPoints, setCheckedPoints] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (timerState !== 'running') return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [timerState]);

  // Auto-cap at 90 minutes
  useEffect(() => {
    if (timerState === 'running' && elapsed >= 5400) {
      stoppedAtRef.current = new Date();
      setTimerState('details');
    }
  }, [elapsed, timerState]);

  function startTimer() {
    if (timerState !== 'idle') return;
    startTimeRef.current = new Date();
    setElapsed(0);
    setTimerState('running');
  }

  function stopTimer() {
    stoppedAtRef.current = new Date();
    if (bulletinCtx && !reflection) {
      setReflection(`Prayed through: ${bulletinCtx.title}`);
    }
    setTimerState('details');
  }

  useEffect(() => { onTimerStateChange?.(timerState); }, [timerState, onTimerStateChange]);

  useImperativeHandle(ref, () => ({ startTimer, stopTimer }), [timerState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-start from deep-link (e.g. "Start Praying" from a bulletin)
  useEffect(() => {
    if (!autoStart) return;
    try {
      const raw = sessionStorage.getItem('edify_bulletin_ctx');
      if (raw) {
        const ctx = JSON.parse(raw) as BulletinCtx;
        setBulletinCtx(ctx);
        sessionStorage.removeItem('edify_bulletin_ctx');
        const valid = FOCUS_OPTIONS.find((f) => f.id === ctx.category);
        if (valid) setCategory(valid.id);
      } else if (autoStart.category) {
        const valid = FOCUS_OPTIONS.find((f) => f.id === autoStart.category);
        if (valid) setCategory(valid.id);
      }
    } catch {}
    startTimer();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Session details form ──────────────────────────────────────────────────
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [reflection, setReflection] = useState('');
  const [prayerPoints, setPrayerPoints] = useState('');
  const [verseRef, setVerseRef] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveSession(skip = false) {
    setSaving(true);
    try {
      const durationMin = Math.max(1, Math.round(elapsed / 60));

      // Merge custom focus + reflection note + prayer points into one reflection string
      let effectiveReflection: string | undefined;
      let effectiveCategory: string | undefined;
      if (!skip) {
        effectiveCategory = category === 'OTHER' ? undefined : (category || undefined);
        const parts: string[] = [];
        if (category === 'OTHER' && customCategory.trim()) parts.push(`Focus: ${customCategory.trim()}`);
        if (reflection.trim()) parts.push(reflection.trim());
        if (prayerPoints.trim()) parts.push(`Prayer Points:\n${prayerPoints.trim()}`);
        effectiveReflection = parts.length > 0 ? parts.join('\n\n') : undefined;
      }

      await edifyService.createLog({
        durationMin,
        category: effectiveCategory,
        reflection: effectiveReflection,
        verseRef: skip ? undefined : (verseRef || undefined),
        loggedAt: (stoppedAtRef.current ?? new Date()).toISOString(),
      });
      setTimerState('idle');
      setElapsed(0);
      setCategory('');
      setCustomCategory('');
      setReflection('');
      setPrayerPoints('');
      setVerseRef('');
      setBulletinCtx(null);
      setCheckedPoints(new Set());
      startTimeRef.current = null;
      stoppedAtRef.current = null;
      loadMonth(viewYear, viewMonth);
    } catch {
      // noop
    } finally {
      setSaving(false);
    }
  }

  // ── Past session form ─────────────────────────────────────────────────────
  const [showPast, setShowPast] = useState(false);
  const [pastDuration, setPastDuration] = useState(15);
  const [pastDatetime, setPastDatetime] = useState('');
  const [pastCategory, setPastCategory] = useState('');
  const [pastCustomCategory, setPastCustomCategory] = useState('');
  const [pastReflection, setPastReflection] = useState('');
  const [pastPrayerPoints, setPastPrayerPoints] = useState('');
  const [pastVerse, setPastVerse] = useState('');
  const [pastSaving, setPastSaving] = useState(false);

  async function savePastSession() {
    if (!pastDatetime) return;
    setPastSaving(true);
    try {
      const effectiveCategory = pastCategory === 'OTHER' ? undefined : (pastCategory || undefined);
      const parts: string[] = [];
      if (pastCategory === 'OTHER' && pastCustomCategory.trim()) parts.push(`Focus: ${pastCustomCategory.trim()}`);
      if (pastReflection.trim()) parts.push(pastReflection.trim());
      if (pastPrayerPoints.trim()) parts.push(`Prayer Points:\n${pastPrayerPoints.trim()}`);
      const effectiveReflection = parts.length > 0 ? parts.join('\n\n') : undefined;

      await edifyService.createLog({
        durationMin: pastDuration,
        category: effectiveCategory,
        reflection: effectiveReflection,
        verseRef: pastVerse || undefined,
        loggedAt: new Date(pastDatetime).toISOString(),
      });
      setShowPast(false);
      setPastDuration(15);
      setPastDatetime('');
      setPastCategory('');
      setPastCustomCategory('');
      setPastReflection('');
      setPastPrayerPoints('');
      setPastVerse('');
      loadMonth(viewYear, viewMonth);
    } catch {
      // noop
    } finally {
      setPastSaving(false);
    }
  }

  // ── Heatmap ───────────────────────────────────────────────────────────────
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [monthData, setMonthData] = useState<EdifyMonthResponse | null>(null);
  const [heatLoading, setHeatLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(todayStr);

  const loadMonth = useCallback((y: number, m: number) => {
    setHeatLoading(true);
    edifyService
      .getMonthLogs(y, m)
      .then((res: any) => setMonthData((res?.data ?? res) as EdifyMonthResponse))
      .catch(() => null)
      .finally(() => setHeatLoading(false));
  }, []);

  useEffect(() => { loadMonth(viewYear, viewMonth); }, [viewYear, viewMonth, loadMonth]);

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth - 1, 1).getDay();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth() + 1;

  const calendarCells: Array<{ day: number | null; dateStr: string | null }> = [];
  for (let i = 0; i < firstDow; i++) calendarCells.push({ day: null, dateStr: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ day: d, dateStr });
  }

  function prevMonth() {
    if (viewMonth === 1) { setViewYear((y) => y - 1); setViewMonth(12); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (isCurrentMonth) return;
    if (viewMonth === 12) { setViewYear((y) => y + 1); setViewMonth(1); }
    else setViewMonth((m) => m + 1);
  }

  const selectedDaySessions = selectedDay ? (monthData?.byDate[selectedDay]?.sessions ?? []) : null;

  // ── Day detail panel ──────────────────────────────────────────────────────
  const DayDetail = () => {
    if (!selectedDay || !selectedDaySessions) {
      return (
        <div className="rounded-2xl border border-[#F0F2F4] bg-white p-6 flex flex-col items-center justify-center text-center min-h-[200px] gap-3">
          <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
            <Timer1 size={24} color="#5B26B1" variant="Bold" />
          </div>
          <p className="text-sm font-semibold text-[#180426]">Prayer History</p>
          <p className="text-xs text-[#60666B] max-w-[180px]">
            Tap a day on the calendar to see your sessions
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-[#F0F2F4] bg-white p-5">
        <p className="text-sm font-bold text-[#180426] mb-1">
          {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        {selectedDaySessions.length > 0 && (
          <p className="text-xs text-[#60666B] mb-4">
            {monthData?.byDate[selectedDay]?.totalMin ?? 0} min total
          </p>
        )}
        {selectedDaySessions.length === 0 ? (
          <p className="text-sm text-[#60666B] py-4">No sessions logged this day.</p>
        ) : (
          <div>
            {selectedDaySessions.map((s, idx) => (
              <div
                key={s.id}
                className={`flex items-start gap-3 py-3 ${idx > 0 ? 'border-t border-[#F0F2F4]' : ''}`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#F5EBFF] flex items-center justify-center shrink-0">
                  <Timer1 size={18} color="#5B26B1" variant="Bold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#180426]">{s.durationMin} min</span>
                    {s.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#F5EBFF] text-[#5B26B1] font-medium">
                        {FOCUS_OPTIONS.find((f) => f.id === s.category)?.label ?? s.category}
                      </span>
                    )}
                  </div>
                  {s.reflection && (
                    <p className="text-xs text-[#60666B] mt-1 line-clamp-3">{s.reflection}</p>
                  )}
                  {s.verseRef && (
                    <p className="text-xs text-[#870BD6] mt-1 font-medium">{s.verseRef}</p>
                  )}
                  <p className="text-[10px] text-[#B9C2CA] mt-1">
                    {new Date(s.loggedAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:gap-8 lg:items-start">

      {/* ── Left column ── */}
      <div className="space-y-6 pb-12">

        {/* Timer card */}
        <div className="rounded-2xl bg-[#180426] p-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#870BD6] opacity-20 blur-3xl pointer-events-none" />

          {timerState === 'idle' && (
            <div className="relative z-10 flex flex-col items-center py-4 gap-5">
              <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Timer1 size={36} color="#C084FC" variant="Bold" />
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-bold">Personal Prayer Timer</p>
                <p className="text-[#8B8FA3] text-sm mt-1">Tap to begin your session</p>
              </div>
              <button
                onClick={startTimer}
                className="bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white font-semibold rounded-full px-8 py-3 text-sm cursor-pointer"
              >
                Start Praying
              </button>
            </div>
          )}

          {timerState === 'running' && (
            <div className="relative z-10 flex flex-col items-center py-4 gap-5">
              <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Timer1 size={36} color="#A967F1" variant="Bold" />
              </div>
              <div className="text-center">
                <p className="text-6xl font-bold text-white font-mono leading-none tabular-nums">
                  {formatElapsed(elapsed)}
                </p>
                <p className="text-[#8B8FA3] text-sm mt-2">Session in progress</p>
              </div>
              <button
                onClick={stopTimer}
                className="bg-white/15 border border-white/20 text-white font-semibold rounded-full px-8 py-3 text-sm cursor-pointer hover:bg-white/25 transition-colors"
              >
                Stop Session
              </button>

              {/* Bulletin prayer point context card */}
              {bulletinCtx && bulletinCtx.points.length > 0 && (
                <div className="w-full mt-2 bg-white/10 border border-white/15 rounded-2xl p-4">
                  <p className="text-[#C084FC] text-xs font-bold uppercase tracking-wider mb-3">Prayer Points</p>
                  <div className="space-y-2.5">
                    {bulletinCtx.points.map((point, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCheckedPoints((prev) => {
                          const next = new Set(prev);
                          next.has(idx) ? next.delete(idx) : next.add(idx);
                          return next;
                        })}
                        className="w-full flex items-start gap-3 text-left cursor-pointer group"
                      >
                        <span className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${checkedPoints.has(idx) ? 'border-[#C084FC] bg-[#C084FC]' : 'border-white/30 group-hover:border-white/60'}`}>
                          {checkedPoints.has(idx) && <TickCircle size={10} color="white" variant="Bold" />}
                        </span>
                        <span className={`text-sm leading-relaxed transition-colors ${checkedPoints.has(idx) ? 'text-white/40 line-through' : 'text-white/80'}`}>
                          {point}
                        </span>
                      </button>
                    ))}
                  </div>
                  {checkedPoints.size > 0 && (
                    <p className="text-xs text-[#C084FC] mt-3">
                      {checkedPoints.size} of {bulletinCtx.points.length} covered
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {timerState === 'details' && (
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-bold text-base">Session Complete</p>
                  {bulletinCtx && (
                    <p className="text-[#C084FC] text-xs mt-0.5 truncate max-w-[220px]">{bulletinCtx.title}</p>
                  )}
                </div>
                <span className="text-[#C084FC] font-mono font-bold text-sm bg-white/10 px-3 py-1.5 rounded-full">
                  {Math.max(1, Math.round(elapsed / 60))} min
                </span>
              </div>

              <div>
                <p className="text-[#8B8FA3] text-xs mb-2">Focus (optional)</p>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setCategory((c) => (c === opt.id ? '' : opt.id))}
                      className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                        category === opt.id
                          ? 'bg-[#870BD6] border-[#870BD6] text-white'
                          : 'border-white/20 text-[#8B8FA3] hover:border-white/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {category === 'OTHER' && (
                  <input
                    autoFocus
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Describe your focus…"
                    className="mt-2 w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-[#8B8FA3] outline-none focus:border-[#870BD6] transition-colors"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[#8B8FA3] text-xs mb-2">Reflection note (optional)</p>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="What did you learn or experience during this session?"
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-[#8B8FA3] resize-none outline-none focus:border-[#870BD6] transition-colors"
                  />
                </div>
                <div>
                  <p className="text-[#8B8FA3] text-xs mb-2">Prayer points (optional)</p>
                  <textarea
                    value={prayerPoints}
                    onChange={(e) => setPrayerPoints(e.target.value)}
                    placeholder={"What did you pray about?"}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-[#8B8FA3] resize-none outline-none focus:border-[#870BD6] transition-colors"
                  />
                </div>
              </div>

              <div>
                <p className="text-[#8B8FA3] text-xs mb-2">Bible verse (optional)</p>
                <input
                  type="text"
                  value={verseRef}
                  onChange={(e) => setVerseRef(e.target.value)}
                  placeholder="e.g. Philippians 4:6"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-[#8B8FA3] outline-none focus:border-[#870BD6] transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => saveSession(false)}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white font-semibold rounded-full py-3 text-sm cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Session'}
                </button>
                <button
                  onClick={() => saveSession(true)}
                  disabled={saving}
                  className="px-5 border border-white/20 text-[#8B8FA3] font-medium rounded-full py-3 text-sm cursor-pointer hover:text-white transition-colors disabled:opacity-50"
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Log a past session */}
        <div>
          <button
            onClick={() => setShowPast((s) => !s)}
            className="text-sm text-[#870BD6] font-semibold underline underline-offset-2 cursor-pointer"
          >
            {showPast ? 'Cancel' : '+ Log a past session'}
          </button>

          {showPast && (
            <div className="mt-4 rounded-2xl border border-[#E7C8FF] bg-[#F5EBFF] p-5 space-y-4">
              <p className="text-sm font-bold text-[#180426]">Log a Past Session</p>

              <div>
                <p className="text-xs text-[#60666B] mb-2">Duration</p>
                <div className="flex flex-wrap gap-2">
                  {DURATION_PRESETS.map((min) => (
                    <button
                      key={min}
                      onClick={() => setPastDuration(min)}
                      className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors font-medium ${
                        pastDuration === min
                          ? 'bg-[#870BD6] border-[#870BD6] text-white'
                          : 'border-[#E7C8FF] text-[#60666B] bg-white hover:border-[#870BD6]'
                      }`}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-[#60666B] mb-2">When did you pray?</p>
                <input
                  type="datetime-local"
                  value={pastDatetime}
                  max={now.toISOString().slice(0, 16)}
                  onChange={(e) => setPastDatetime(e.target.value)}
                  className="w-full border border-[#E7C8FF] bg-white rounded-xl px-3 py-2 text-sm text-[#180426] outline-none focus:border-[#870BD6] transition-colors"
                />
              </div>

              <div>
                <p className="text-xs text-[#60666B] mb-2">Focus (optional)</p>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setPastCategory((c) => (c === opt.id ? '' : opt.id))}
                      className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                        pastCategory === opt.id
                          ? 'bg-[#870BD6] border-[#870BD6] text-white'
                          : 'border-[#E7C8FF] text-[#60666B] bg-white hover:border-[#870BD6]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {pastCategory === 'OTHER' && (
                  <input
                    autoFocus
                    type="text"
                    value={pastCustomCategory}
                    onChange={(e) => setPastCustomCategory(e.target.value)}
                    placeholder="Describe your focus…"
                    className="mt-2 w-full border border-[#E7C8FF] bg-white rounded-xl px-3 py-2 text-sm text-[#180426] placeholder-[#B9C2CA] outline-none focus:border-[#870BD6] transition-colors"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <textarea
                  value={pastReflection}
                  onChange={(e) => setPastReflection(e.target.value)}
                  placeholder="Reflection note (optional)"
                  rows={3}
                  className="w-full border border-[#E7C8FF] bg-white rounded-xl px-3 py-2 text-sm text-[#180426] placeholder-[#B9C2CA] resize-none outline-none focus:border-[#870BD6] transition-colors"
                />
                <textarea
                  value={pastPrayerPoints}
                  onChange={(e) => setPastPrayerPoints(e.target.value)}
                  placeholder={"Prayer points (optional)\nPoint 1\nPoint 2"}
                  rows={3}
                  className="w-full border border-[#E7C8FF] bg-white rounded-xl px-3 py-2 text-sm text-[#180426] placeholder-[#B9C2CA] resize-none outline-none focus:border-[#870BD6] transition-colors"
                />
              </div>

              <input
                type="text"
                value={pastVerse}
                onChange={(e) => setPastVerse(e.target.value)}
                placeholder="Bible verse (optional)"
                className="w-full border border-[#E7C8FF] bg-white rounded-xl px-3 py-2 text-sm text-[#180426] placeholder-[#B9C2CA] outline-none focus:border-[#870BD6] transition-colors"
              />

              <button
                onClick={savePastSession}
                disabled={!pastDatetime || pastSaving}
                className="w-full bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white font-semibold rounded-full py-3 text-sm cursor-pointer disabled:opacity-50"
              >
                {pastSaving ? 'Saving…' : 'Save Session'}
              </button>
            </div>
          )}
        </div>

        {/* Heatmap */}
        <div className="rounded-2xl border border-[#F0F2F4] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F2F4] transition-colors cursor-pointer"
            >
              <ArrowLeft2 size={16} color="#60666B" />
            </button>
            <p className="text-sm font-bold text-[#180426]">
              {MONTH_NAMES[viewMonth - 1]} {viewYear}
            </p>
            <button
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F2F4] transition-colors cursor-pointer disabled:opacity-30"
            >
              <ArrowRight2 size={16} color="#60666B" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-medium text-[#B9C2CA] py-1">{d}</div>
            ))}
          </div>

          {heatLoading ? (
            <div className="grid grid-cols-7 gap-1">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="aspect-square rounded-md bg-[#F0F2F4] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, i) => {
                if (!cell.day || !cell.dateStr) return <div key={i} className="aspect-square" />;
                const totalMin = monthData?.byDate[cell.dateStr]?.totalMin ?? 0;
                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDay;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay((d) => (d === cell.dateStr ? null : cell.dateStr))}
                    title={`${cell.dateStr}: ${totalMin} min`}
                    className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-[#870BD6] ring-offset-1'
                        : isToday
                        ? 'ring-2 ring-[#C084FC] ring-offset-1'
                        : ''
                    }`}
                    style={{ backgroundColor: edifyHeat(totalMin) }}
                  >
                    <span className={totalMin > 0 ? 'text-white' : 'text-[#B9C2CA]'}>{cell.day}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F0F2F4]">
            <span className="text-xs text-[#60666B]">Minutes prayed</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#60666B]">Less</span>
              {[0, 5, 20, 35, 60].map((n) => (
                <div key={n} className="w-4 h-4 rounded-sm" style={{ backgroundColor: edifyHeat(n) }} />
              ))}
              <span className="text-xs text-[#60666B]">More</span>
            </div>
          </div>
        </div>

        {/* Day detail — mobile only */}
        <div className="lg:hidden">
          <DayDetail />
        </div>
      </div>

      {/* ── Right column: day detail — desktop only ── */}
      <div className="hidden lg:block lg:sticky lg:top-6">
        <DayDetail />
      </div>
    </div>
  );
});

EdifyTab.displayName = 'EdifyTab';

export default EdifyTab;
