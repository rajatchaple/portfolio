// Spaced-repetition + daily-mission engine.
// Mastery 0..5 drives review intervals (SM-2 simplified). Weekends are free
// buffer days — no new cards introduced, streak doesn't break.

import interviewPrepData from './interviewPrepData';
import { practical } from './interviewPrepTiers';

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

// Default study start date:
//   weekday → today (just start)
//   weekend → upcoming Monday (treat the weekend as buffer pre-start)
export const computeDefaultStart = today => {
  const [y, m, d] = today.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = dt.getDay(); // 0=Sun..6=Sat
  if (dow >= 1 && dow <= 5) {
    return today;
  }
  const daysUntilMon = dow === 0 ? 1 : 2;
  dt.setDate(dt.getDate() + daysUntilMon);
  return dateKey(dt);
};

// Earliest activity in dayLog, or null
export const earliestActivityDate = dayLog => {
  const days = Object.keys(dayLog).filter(k => {
    const log = dayLog[k];
    return log && (log.answered > 0 || (log.practicalsDone || []).length > 0);
  });
  if (days.length === 0) {
    return null;
  }
  return days.sort()[0];
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
//   options.forceNew: include new cards even on weekend / pre-start (user override)
//   options.startDate: if set and today < startDate, return empty plan unless forceNew
// Sequential: new cards always come from source order (w1d1, w1d2, ... w12d5).
// Tier is a label, not a sort key — that way you can't accidentally skip topics.
export const buildDailyPlan = (today, studyState, options = {}) => {
  const { startDate, forceNew } = options;
  const isPreStart = startDate && today < startDate;
  if (isPreStart && !forceNew) {
    return {
      isWeekend: isWeekend(today),
      isPreStart: true,
      newIds: [],
      reviewIds: [],
      practicalIds: [],
    };
  }
  const allQuestions = interviewPrepData.flatMap(w => w.questions);
  const idIndex = {};
  allQuestions.forEach((q, i) => {
    idIndex[q.id] = i;
  });

  // Reviews due — same logic, no day-of-week dependency
  const reviewIds = allQuestions
    .map(q => q.id)
    .filter(id => {
      const s = studyState[id];
      return s && s.nextDue && s.nextDue <= today;
    })
    .sort((a, b) => studyState[a].nextDue.localeCompare(studyState[b].nextDue))
    .slice(0, MAX_REVIEW_CARDS);

  const hasNeverStudied = Object.keys(studyState).length === 0;
  const allowNew = !isWeekend(today) || hasNeverStudied || forceNew;

  if (!allowNew) {
    return { isWeekend: true, newIds: [], reviewIds, practicalIds: [] };
  }

  // Strict source order: w1d1 -> w1d2 -> ... -> w12d5
  const unseenIds = allQuestions
    .map(q => q.id)
    .filter(id => !studyState[id])
    .sort((a, b) => idIndex[a] - idIndex[b]);

  const newIds = unseenIds.slice(0, NEW_CARDS_PER_DAY);
  const practicalIds = newIds.filter(id => practical[id]);

  return {
    isWeekend: isWeekend(today),
    newIds,
    reviewIds,
    practicalIds,
  };
};

// Backlog — total review count due (uncapped) so the dashboard can warn
export const reviewBacklog = (today, studyState) => {
  const allQuestions = interviewPrepData.flatMap(w => w.questions);
  return allQuestions
    .map(q => q.id)
    .filter(id => {
      const s = studyState[id];
      return s && s.nextDue && s.nextDue <= today;
    }).length;
};

// Did Sat or Sun in the same calendar week as `cursor` have any activity?
// Weekend activity excuses missed weekdays in that week.
const sameWeekWeekendActive = (cursor, dayLog) => {
  const dow = cursor.getDay() || 7; // Mon=1..Sun=7
  const monday = new Date(cursor);
  monday.setDate(cursor.getDate() - (dow - 1));
  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const satLog = dayLog[dateKey(saturday)];
  const sunLog = dayLog[dateKey(sunday)];
  const dayActive = log => !!(log && (log.answered > 0 || (log.practicalsDone || []).length > 0));
  return dayActive(satLog) || dayActive(sunLog);
};

// Streak: consecutive weekdays where the user did at least one card.
// Today is allowed pending without breaking the streak.
// Weekends never count toward the streak directly, but weekend activity
// "absorbs" up to one missed weekday in the same calendar week.
// If startDate is provided, the walk stops there — pre-start days don't count as missed.
export const computeStreak = (today, dayLog, startDate = null) => {
  const [yT, mT, dT] = today.split('-').map(Number);
  const cursor = new Date(yT, mT - 1, dT);
  let streak = 0;

  // If today is a weekend, jump back to most recent Friday
  while (cursor.getDay() === 0 || cursor.getDay() === 6) {
    cursor.setDate(cursor.getDate() - 1);
  }

  // Track which weeks have already "spent" their weekend grace
  const usedGrace = new Set();
  let isFirst = true;

  for (let i = 0; i < 200; i++) {
    const k = dateKey(cursor);
    if (startDate && k < startDate) {
      break; // pre-start: don't count earlier days as missed
    }
    const log = dayLog[k];
    const did = !!(log && (log.answered > 0 || (log.practicalsDone || []).length > 0));

    if (did) {
      streak++;
    } else if (isFirst) {
      // today (or most recent weekday) pending — that's fine
    } else {
      // Missed weekday — try to forgive it via same-week weekend activity
      const weekKey = `${dateKey(cursor).slice(0, 7)}-w${Math.ceil(cursor.getDate() / 7)}`;
      if (!usedGrace.has(weekKey) && sameWeekWeekendActive(cursor, dayLog)) {
        usedGrace.add(weekKey);
        streak++;
      } else {
        break;
      }
    }
    isFirst = false;
    do {
      cursor.setDate(cursor.getDate() - 1);
    } while (cursor.getDay() === 0 || cursor.getDay() === 6);
  }

  return streak;
};

// Mon..Sun grid for the current week
export const buildWeekGrid = (today, dayLog, startDate = null) => {
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
      isPreStart: !!(startDate && k < startDate),
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
