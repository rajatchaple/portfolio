// Firebase Realtime Database sync via REST API
// No SDK needed — just fetch() calls
//
// SETUP: Replace FIREBASE_DB_URL with your Firebase Realtime Database URL
// 1. Go to https://console.firebase.google.com → Create project
// 2. Build → Realtime Database → Create Database → Start in test mode
// 3. Copy the URL (e.g. https://your-project-default-rtdb.firebaseio.com)
// 4. Paste it below

const FIREBASE_DB_URL = 'https://audio-firmware-prep-default-rtdb.firebaseio.com';

const PIN_STORAGE_KEY = 'interview-prep-pin';

// Simple hash to avoid storing PIN as plaintext path
// Not crypto-grade — just makes the DB path non-obvious
const hashPin = pin => {
  let hash = 0;
  const str = `prep-${pin}-salt`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `user_${Math.abs(hash).toString(36)}`;
};

export const getSavedPin = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(PIN_STORAGE_KEY);
};

export const savePin = pin => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(PIN_STORAGE_KEY, pin);
};

export const clearPin = () => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(PIN_STORAGE_KEY);
};

// `bundle` is the full progress object (answers + studyState + dayLog +
// codingDone + ...). `answers` is kept as a top-level field so older
// answers-only records stay readable/writable (backward compatible).
export const pushToCloud = async (pin, bundle) => {
  const userPath = hashPin(pin);
  const url = `${FIREBASE_DB_URL}/answers/${userPath}.json`;

  const payload = {
    ...bundle,
    lastUpdated: new Date().toISOString(),
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Cloud save failed: ${res.status}`);
  }

  return true;
};

export const pullFromCloud = async pin => {
  const userPath = hashPin(pin);
  const url = `${FIREBASE_DB_URL}/answers/${userPath}.json`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Cloud fetch failed: ${res.status}`);
  }

  const data = await res.json();

  if (!data || typeof data !== 'object') {
    return null; // No data yet for this PIN
  }

  // Return the whole stored bundle (lastUpdated included). Older records
  // only have { answers, lastUpdated }; missing keys are handled by the
  // caller's merge (treated as empty).
  return data;
};
