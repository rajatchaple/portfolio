// Spaced-repetition + daily-mission engine.
// Mastery 0..5 drives review intervals (SM-2 simplified). Weekends are free
// buffer days — no new cards introduced, streak doesn't break.

import interviewPrepData from './interviewPrepData';
import { tiers, practical } from './interviewPrepTiers';

export const dateKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const addDays = (isoDate, n) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return dateKey(dt);
};

export const isWeekend = isoDate => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const wd = dt.getDay();
  return wd === 0 || wd === 6;
};

const SR_INTERVALS = [1, 1, 3, 7, 14, 30];
export const NEW_CARDS_PER_DAY = 3;
export const MAX_REVIEW_CARDS = 10;
export const MASTERY_MAX = 5;

export const advance = (cur, gotItRight, today = dateKey()) => {
  const old = cur || { mastery: 0, correctCount: 0, wrongCount: 0 };
  const newMastery = gotItRight
    ? Math.min(MASTERY_MAX, old.mastery + 1)
    : Math.max(1, old.mastery - 1);
  const days = gotItRight ? SR_INTERVALS[newMastery] : 1;
  return {
    mastery: newMastery,
    nextDue: addDays(today, days),
    lastSeen: new Date().toISOString(),
    correctCount: (old.correctCount || 0) + (gotItRight ? 1 : 0),
    wrongCount: (old.wrongCount || 0) + (gotItRight ? 0 : 1),
  };
};

// Build today's plan: which new cards to introduce, which to review, which practicals.
export const buildDailyPlan = (today, studyState) => {
  const allQuestions = interviewPrepData.flatMap(w => w.questions);
  const idIndex = {};
  allQuestions.forEach((q, i) => {
    idIndex[q.id] = i;
  });

  const reviewIds = allQuestions
    .map(q => q.id)
    .filter(id => {
      const s = studyState[id];
      return s && s.nextDue && s.nextDue <= today;
    })
    .sort((a, b) => studyState[a].nextDue.localeCompare(studyState[b].nextDue))
    .slice(0, MAX_REVIEW_CARDS);

  if (isWeekend(today)) {
    return { isWeekend: true, newIds: [], reviewIds, practicalIds: [] };
  }

  const unseenIds = allQuestions.map(q => q.id).filter(id => !studyState[id]);
  unseenIds.sort((a, b) => {
    const ta = tiers[a] || 99;
    const tb = tiers[b] || 99;
    if (ta !== tb) {
      return ta - tb;
    }
    return idIndex[a] - idIndex[b];
  });
  const newIds = unseenIds.slice(0, NEW_CARDS_PER_DAY);

  const practicalIds = newIds.filter(id => practical[id]);

  return { isWeekend: false, newIds, reviewIds, practicalIds };
};

// Streak: consecutive weekdays where the user did at least one card.
// Today is allowed to be pending without breaking the streak.
// Weekends never count toward and never break the streak.
export const computeStreak = (today, dayLog) => {
  const [yT, mT, dT] = today.split('-').map(Number);
  const cursor = new Date(yT, mT - 1, dT);
  let streak = 0;

  // If today is a weekend, jump back to most recent Friday
  while (cursor.getDay() === 0 || cursor.getDay() === 6) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let isFirst = true;
  for (let i = 0; i < 200; i++) {
    const k = dateKey(cursor);
    const log = dayLog[k];
    const did = !!(log && (log.answered > 0 || (log.practicalsDone || []).length > 0));
    if (did) {
      streak++;
    } else if (!isFirst) {
      break; // earlier missed weekday breaks streak
    }
    isFirst = false;
    // step back one weekday
    do {
      cursor.setDate(cursor.getDate() - 1);
    } while (cursor.getDay() === 0 || cursor.getDay() === 6);
  }

  return streak;
};

// Mon..Sun grid for the current week
export const buildWeekGrid = (today, dayLog) => {
  const [yT, mT, dT] = today.split('-').map(Number);
  const todayDate = new Date(yT, mT - 1, dT);
  const dow = todayDate.getDay() || 7; // Mon=1..Sun=7
  const monday = new Date(todayDate);
  monday.setDate(todayDate.getDate() - (dow - 1));

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const k = dateKey(d);
    const log = dayLog[k];
    return {
      date: k,
      label,
      isWeekend: i >= 5,
      isToday: k === today,
      isFuture: k > today,
      done: !!(log && (log.answered > 0 || (log.practicalsDone || []).length > 0)),
    };
  });
};

export const logDayActivity = (dayLog, today, kind, payload) => {
  const cur = dayLog[today] || {
    newCards: [],
    reviewed: [],
    practicalsDone: [],
    answered: 0,
  };
  const updated = { ...cur };
  if (kind === 'card-new') {
    updated.newCards = Array.from(new Set([...(cur.newCards || []), payload]));
    updated.answered = (updated.answered || 0) + 1;
  } else if (kind === 'card-review') {
    updated.reviewed = Array.from(new Set([...(cur.reviewed || []), payload]));
    updated.answered = (updated.answered || 0) + 1;
  } else if (kind === 'practical') {
    updated.practicalsDone = Array.from(new Set([...(cur.practicalsDone || []), payload]));
  }
  return { ...dayLog, [today]: updated };
};

// Aggregate stats for the dashboard
export const masteryHistogram = studyState => {
  const buckets = [0, 0, 0, 0, 0, 0, 0]; // index 0 = unseen, 1..5 = mastery 1..5
  const allQuestions = interviewPrepData.flatMap(w => w.questions);
  allQuestions.forEach(q => {
    const s = studyState[q.id];
    buckets[s ? s.mastery : 0] += 1;
  });
  return buckets;
};
