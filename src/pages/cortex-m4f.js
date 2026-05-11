import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Layout } from '@components';
import interviewPrepData from '../data/interviewPrepData';
import { tiers, tierMeta, practical } from '../data/interviewPrepTiers';
import { mcq } from '../data/interviewPrepFlashcards';
import { codingProblems } from '../data/interviewPrepCoding';
import {
  dateKey,
  advance,
  buildDailyPlan,
  computeStreak,
  buildWeekGrid,
  logDayActivity,
  masteryHistogram,
  reviewBacklog,
  isWeekend as isWeekendDay,
  computeDefaultStart,
  earliestActivityDate,
} from '../data/interviewPrepStudy';
import { getSavedPin, savePin, clearPin, pushToCloud, pullFromCloud } from '@utils/firebase';

// localStorage helpers
const STORAGE_KEY = 'interview-prep-answers';

const loadAnswers = () => {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveAnswers = answers => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
};

// Additional storage keys
const CONFIDENCE_KEY = 'interview-prep-confidence';
const REVIEWED_KEY = 'interview-prep-last-reviewed';
const SKETCH_KEY = 'interview-prep-sketches';
const PRACTICAL_KEY = 'interview-prep-practical-done';
const FLASHCARD_KEY = 'interview-prep-flashcard-stats';
const STUDY_STATE_KEY = 'interview-prep-study-state';
const DAY_LOG_KEY = 'interview-prep-day-log';
const STUDY_START_KEY = 'interview-prep-study-start';
const CODING_DONE_KEY = 'interview-prep-coding-done';

const loadFromStorage = key => {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveToStorage = (key, data) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    /* ignore storage errors */
  }
};

// --- Styled Components ---

const StyledContainer = styled.div`
  min-height: 100vh;
  padding-top: var(--nav-height);
  margin: 0 80px;

  @media (max-width: 768px) {
    margin: 0;
  }
`;

const StyledHeader = styled.div`
  padding: 30px 50px 20px;
  border-bottom: 1px solid var(--lightest-navy);

  @media (max-width: 768px) {
    padding: 16px 16px 12px;
  }

  h1 {
    color: var(--lightest-slate);
    font-size: clamp(24px, 5vw, 42px);
    margin: 0 0 6px;
  }

  p {
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    margin: 0;

    @media (max-width: 768px) {
      font-size: 11px;
    }
  }
`;

const StyledSearchInput = styled.input`
  background: rgba(35, 53, 84, 0.4);
  border: 1px solid var(--lightest-navy);
  border-radius: var(--border-radius);
  color: var(--lightest-slate);
  font-family: var(--font-mono);
  font-size: 13px;
  padding: 8px 12px;
  width: 240px;
  outline: none;
  transition: var(--transition);

  &:focus {
    border-color: var(--green);
  }

  &::placeholder {
    color: var(--dark-slate);
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 16px;
    order: -1;
  }
`;

const StyledToolbarButton = styled.button`
  background: transparent;
  border: 1px solid var(--lightest-navy);
  border-radius: var(--border-radius);
  color: var(--slate);
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 7px 14px;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;

  &:hover {
    color: var(--green);
    border-color: var(--green);
  }

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 12px;
    min-height: 40px;
  }
`;

// Hide power-user controls (Export/Import/Cloud) on mobile — desktop-only flows
const StyledDesktopOnly = styled.span`
  display: contents;

  @media (max-width: 768px) {
    display: none;
  }
`;

const StyledPanels = styled.div`
  display: grid;
  grid-template-columns: 360px 1fr;
  height: calc(100vh - var(--nav-height) - 130px);

  @media (max-width: 1080px) {
    grid-template-columns: 300px 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const StyledLeftPanel = styled.div`
  border-right: 1px solid var(--lightest-navy);
  overflow-y: auto;
  padding: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.18);
    }
  }

  @media (max-width: 768px) {
    position: relative;
    max-height: ${props => (props.$collapsed ? '48px' : '60vh')};
    border-right: none;
    border-bottom: 1px solid var(--lightest-navy);
    transition: max-height 0.3s ease;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: auto;
    scrollbar-color: var(--slate) rgba(35, 53, 84, 0.3);

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: rgba(35, 53, 84, 0.3);
    }
    &::-webkit-scrollbar-thumb {
      background: var(--slate);
      border-radius: 3px;
    }
  }
`;

const StyledRightPanel = styled.div`
  overflow-y: auto;
  padding: 30px 40px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.18);
    }
  }

  @media (max-width: 768px) {
    padding: 16px 16px;
  }
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60%;
  color: var(--dark-slate);
  font-family: var(--font-mono);
  font-size: 14px;
  text-align: center;

  .icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.3;
  }
`;

const StyledQuestionDetail = styled.div`
  .topic-label {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--green);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .question-text {
    color: var(--lightest-slate);
    font-size: clamp(18px, 3vw, 24px);
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 24px;
  }
`;

const StyledReadingSection = styled.div`
  margin-bottom: 28px;

  h3 {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--slate);
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 6px;
    color: var(--light-slate);
    font-size: 14px;
    line-height: 1.5;

    &:before {
      content: '▹';
      position: absolute;
      left: 0;
      color: var(--green);
    }
  }
`;

const StyledReferenceToggle = styled.div`
  margin-bottom: 28px;

  button {
    background: transparent;
    border: 1px dashed var(--lightest-navy);
    border-radius: var(--border-radius);
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: 12px;
    padding: 8px 16px;
    cursor: pointer;
    transition: var(--transition);

    &:hover {
      border-color: var(--green);
      color: var(--green);
    }
  }

  .ref-answer {
    margin-top: 12px;
    padding: 16px;
    background: rgba(35, 53, 84, 0.2);
    border-left: 3px solid var(--green);
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
    color: var(--light-slate);
    font-size: 14px;
    line-height: 1.7;
  }
`;

const StyledNotesPanel = styled.div`
  font-size: 14px;
  line-height: 1.75;
  color: var(--light-slate);

  h2 {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin: 20px 0 8px;
    border-bottom: 1px solid rgba(100, 255, 218, 0.15);
    padding-bottom: 5px;
    &:first-child {
      margin-top: 0;
    }
  }

  h3 {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--slate);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 16px 0 6px;
  }

  p {
    margin: 0 0 10px;
    color: var(--light-slate);
  }

  strong {
    color: var(--lightest-slate);
    font-weight: 600;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 10px;
  }

  ul li {
    position: relative;
    padding-left: 18px;
    margin-bottom: 5px;
    &:before {
      content: '▹';
      position: absolute;
      left: 0;
      color: var(--green);
      font-size: 12px;
      top: 1px;
    }
  }

  code {
    font-family: var(--font-mono);
    font-size: 12px;
    background: rgba(100, 255, 218, 0.07);
    border: 1px solid rgba(100, 255, 218, 0.15);
    border-radius: 3px;
    padding: 1px 5px;
    color: var(--green);
  }

  pre {
    background: rgba(2, 12, 27, 0.7);
    border: 1px solid var(--lightest-navy);
    border-radius: var(--border-radius);
    padding: 14px 16px;
    margin: 10px 0;
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.6;
    color: var(--lightest-slate);

    code {
      background: none;
      border: none;
      padding: 0;
      color: var(--lightest-slate);
      font-size: 12px;
    }
  }

  .diagram {
    background: rgba(2, 12, 27, 0.7);
    border: 1px solid var(--lightest-navy);
    border-left: 3px solid rgba(100, 255, 218, 0.3);
    border-radius: var(--border-radius);
    padding: 14px 16px;
    margin: 10px 0;
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.6;
    color: var(--lightest-slate);
    white-space: pre;
    overflow-x: auto;
  }

  .note-source {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--slate);
    margin-bottom: 16px;
    padding: 6px 10px;
    background: rgba(35, 53, 84, 0.3);
    border-radius: var(--border-radius);
    display: inline-block;
  }
`;

// Render inline markdown: **bold**, `code`, plain text
const renderInline = text => {
  const parts = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let match;
  let k = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={k++}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<code key={k++}>{token.slice(1, -1)}</code>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
};

// Minimal markdown renderer — supports ##/###, **bold**, `code`, ```blocks```, - lists, blank lines
const MarkdownBlock = ({ content }) => {
  const lines = content.split('\n');
  const elements = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block (``` or diagram block marked with ```diagram)
    if (line.trim().startsWith('```')) {
      const isDiagram = line.trim().startsWith('```diagram');
      const blockLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        blockLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const text = blockLines.join('\n');
      if (isDiagram) {
        elements.push(
          <div key={key++} className="diagram">
            {text}
          </div>,
        );
      } else {
        elements.push(
          <pre key={key++}>
            <code>{text}</code>
          </pre>,
        );
      }
      continue;
    }

    // H2
    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++}>{renderInline(line.slice(3))}</h2>);
      i++;
      continue;
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(<h3 key={key++}>{renderInline(line.slice(4))}</h3>);
      i++;
      continue;
    }

    // Unordered list
    if (line.trim().startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(<li key={items.length}>{renderInline(lines[i].trim().slice(2))}</li>);
        i++;
      }
      elements.push(<ul key={key++}>{items}</ul>);
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].trim().startsWith('- ') &&
      !lines[i].trim().startsWith('```')
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      elements.push(<p key={key++}>{renderInline(paraLines.join(' '))}</p>);
    }
  }

  return <>{elements}</>;
};

MarkdownBlock.propTypes = {
  content: PropTypes.string.isRequired,
};

const StyledAnswerSection = styled.div`
  h3 {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--slate);
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .save-indicator {
    font-size: 11px;
    color: ${props => (props.$saved ? '#4ade80' : 'transparent')};
    transition: color 0.3s ease;
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 250px;
  background: rgba(35, 53, 84, 0.25);
  border: 1px solid var(--lightest-navy);
  border-radius: var(--border-radius);
  color: var(--lightest-slate);
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.7;
  padding: 16px;
  resize: vertical;
  outline: none;
  transition: border 0.2s ease;

  &:focus {
    border-color: var(--green);
  }

  &::placeholder {
    color: var(--dark-slate);
  }

  @media (max-width: 768px) {
    min-height: 180px;
    font-size: 16px;
    padding: 12px;
  }
`;

const StyledAnswerActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const StyledActionButton = styled.button`
  background: ${props => (props.$primary ? 'var(--green)' : 'transparent')};
  color: ${props => (props.$primary ? '#000' : 'var(--slate)')};
  border: 1px solid ${props => (props.$primary ? 'var(--green)' : 'var(--lightest-navy)')};
  border-radius: var(--border-radius);
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 8px 18px;
  cursor: pointer;
  transition: var(--transition);
  font-weight: ${props => (props.$primary ? '600' : '400')};

  &:hover {
    opacity: 0.85;
    ${props =>
    !props.$primary &&
      `
      border-color: var(--green);
      color: var(--green);
    `}
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// Hidden file input for import
const HiddenInput = styled.input`
  display: none;
`;

// --- Cloud Sync Styled Components ---

const StyledSyncStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: ${props => {
    if (props.$status === 'syncing') {
      return '#facc15';
    }
    if (props.$status === 'synced') {
      return '#4ade80';
    }
    if (props.$status === 'error') {
      return '#f87171';
    }
    return 'var(--dark-slate)';
  }};

  .sync-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    ${props =>
    props.$status === 'syncing' &&
      `
      animation: pulse 1s infinite;
    `}
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
`;

const StyledPinOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const StyledPinModal = styled.div`
  background: #0a0a0a;
  border: 1px solid var(--lightest-navy);
  border-radius: 8px;
  padding: 40px;
  max-width: 400px;
  width: 90%;
  text-align: center;

  h2 {
    color: var(--lightest-slate);
    font-size: 22px;
    margin: 0 0 8px;
  }

  .subtitle {
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: 12px;
    margin-bottom: 24px;
    line-height: 1.6;
  }

  .pin-input {
    width: 180px;
    padding: 12px 16px;
    font-size: 24px;
    font-family: var(--font-mono);
    letter-spacing: 8px;
    text-align: center;
    background: rgba(35, 53, 84, 0.3);
    border: 2px solid var(--lightest-navy);
    border-radius: var(--border-radius);
    color: var(--lightest-slate);
    outline: none;

    &:focus {
      border-color: var(--green);
    }
  }

  .pin-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
  }

  .error-msg {
    color: #f87171;
    font-family: var(--font-mono);
    font-size: 12px;
    margin-top: 12px;
  }

  .skip-link {
    display: block;
    margin-top: 16px;
    color: var(--dark-slate);
    font-family: var(--font-mono);
    font-size: 11px;
    cursor: pointer;
    background: none;
    border: none;
    text-decoration: underline;

    &:hover {
      color: var(--slate);
    }
  }
`;

// --- Confidence, Timer & Review Styled Components ---

const StyledConfidenceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;

  .label {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--slate);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-right: 4px;
  }
`;

const StyledConfidenceBtn = styled.button`
  background: ${props => (props.$active ? props.$color : 'transparent')};
  color: ${props => (props.$active ? '#000' : props.$color)};
  border: 1px solid ${props => props.$color};
  border-radius: var(--border-radius);
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 5px 12px;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: ${props => props.$color};
    color: #000;
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
    min-height: 40px;
    flex: 1;
  }
`;

const StyledTimerDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
  background: rgba(35, 53, 84, 0.25);
  border: 1px solid var(--lightest-navy);
  border-radius: var(--border-radius);
  flex-wrap: wrap;

  .time {
    font-family: var(--font-mono);
    font-size: 28px;
    font-weight: 600;
    color: ${props => {
    if (props.$seconds <= 30) {
      return '#f87171';
    }
    if (props.$seconds <= 60) {
      return '#facc15';
    }
    return 'var(--lightest-slate)';
  }};
    min-width: 80px;

    @media (max-width: 768px) {
      font-size: 22px;
    }
  }

  .timer-controls {
    display: flex;
    gap: 6px;
  }

  .timer-btn {
    background: transparent;
    border: 1px solid var(--lightest-navy);
    border-radius: var(--border-radius);
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 4px 10px;
    cursor: pointer;
    transition: var(--transition);

    &:hover {
      border-color: var(--green);
      color: var(--green);
    }
  }
`;

const StyledStaleBadge = styled.span`
  font-size: 9px;
  color: #facc15;
  margin-left: 2px;
  margin-right: 2px;
  opacity: 0.8;
`;

const StyledTierBtn = styled.button`
  background: ${props => (props.$active ? props.$color : 'transparent')};
  color: ${props => (props.$active ? '#000' : props.$color || 'var(--slate)')};
  border: 1px solid ${props => props.$color || 'var(--lightest-navy)'};
  border-radius: var(--border-radius);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: ${props => (props.$active ? 600 : 400)};
  padding: 5px 10px;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;

  &:hover {
    background: ${props => props.$color || 'transparent'};
    color: ${props => (props.$color ? '#000' : 'var(--green)')};
  }

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 13px;
    min-height: 40px;
    min-width: 44px;
  }
`;

const StyledTierBadge = styled.span`
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 600;
  padding: 1px 5px;
  margin-right: 6px;
  border-radius: 3px;
  background: ${props => props.$color};
  color: #000;
  vertical-align: middle;
`;

const StyledTierProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: rgba(35, 53, 84, 0.2);
  border: 1px solid var(--lightest-navy);
  border-radius: var(--border-radius);

  .heading {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--slate);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--light-slate);
  }

  .tier-tag {
    font-weight: 600;
    min-width: 24px;
  }

  .name {
    color: var(--slate);
    flex: 1;
    min-width: 90px;
  }

  .bar {
    flex: 1;
    height: 6px;
    background: rgba(35, 53, 84, 0.5);
    border-radius: 3px;
    overflow: hidden;
    min-width: 80px;
  }

  .fill {
    height: 100%;
    transition: width 0.3s ease;
  }

  .count {
    min-width: 50px;
    text-align: right;
    color: var(--light-slate);
  }
`;

const StyledPracticalSection = styled.div`
  margin: 24px 0;
  padding: 16px 18px;
  background: rgba(100, 255, 218, 0.04);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: var(--border-radius);

  h3 {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 12px;
  }

  ol {
    padding-left: 20px;
    margin: 0 0 12px;
    color: var(--light-slate);
    font-size: 14px;
    line-height: 1.65;
  }

  ol li {
    margin-bottom: 8px;
  }

  ol li.done {
    color: var(--dark-slate);
    text-decoration: line-through;
  }

  .check {
    background: transparent;
    border: 1px solid var(--lightest-navy);
    border-radius: 3px;
    width: 18px;
    height: 18px;
    margin-right: 8px;
    cursor: pointer;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: 11px;
    line-height: 16px;
    padding: 0;
    vertical-align: middle;
    flex-shrink: 0;

    &:hover {
      border-color: var(--green);
    }

    @media (max-width: 768px) {
      width: 28px;
      height: 28px;
      font-size: 14px;
      line-height: 26px;
    }
  }

  ol li {
    @media (max-width: 768px) {
      display: flex;
      align-items: flex-start;
      gap: 4px;
    }
  }

  .drill {
    margin-top: 14px;
    padding: 10px 12px;
    background: rgba(250, 204, 21, 0.07);
    border-left: 3px solid #facc15;
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
    font-size: 13px;
    color: var(--light-slate);
    line-height: 1.6;

    .drill-label {
      font-family: var(--font-mono);
      font-size: 11px;
      color: #facc15;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-right: 6px;
    }
  }
`;

const StyledQuickOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 12, 27, 0.97);
  z-index: 200;
  display: flex;
  flex-direction: column;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const StyledQuickHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--lightest-navy);
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 10px;

  .progress {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--slate);
  }

  .right {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    margin-bottom: 12px;
    padding-bottom: 10px;

    .progress {
      flex: 1 0 100%;
      font-size: 11px;
    }

    .right {
      width: 100%;
      justify-content: space-between;
    }
  }
`;

const StyledQuickCard = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 32px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 16px 4px;
  }

  .topic {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 16px;
  }

  .question {
    color: var(--lightest-slate);
    font-size: clamp(18px, 3vw, 26px);
    font-weight: 600;
    line-height: 1.45;
    margin-bottom: 32px;
  }

  .answer {
    color: var(--light-slate);
    font-size: clamp(15px, 2.2vw, 18px);
    line-height: 1.7;
    padding: 20px 24px;
    background: rgba(35, 53, 84, 0.3);
    border-left: 3px solid var(--green);
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
    text-align: left;
    margin-bottom: 24px;
  }

  .reveal {
    background: var(--green);
    color: #000;
    border: none;
    border-radius: var(--border-radius);
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    padding: 14px 32px;
    cursor: pointer;
    margin-bottom: 24px;

    @media (max-width: 768px) {
      width: 100%;
      padding: 18px 24px;
      font-size: 15px;
      min-height: 52px;
    }
  }

  .rate {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 10px;
    }
  }

  .rate button {
    background: transparent;
    border: 1px solid var(--lightest-navy);
    border-radius: var(--border-radius);
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: 13px;
    padding: 12px 20px;
    cursor: pointer;
    transition: var(--transition);
    min-width: 110px;

    @media (max-width: 768px) {
      width: 100%;
      padding: 16px 20px;
      font-size: 15px;
      min-height: 50px;
    }
  }

  .rate .knew:hover {
    border-color: #4ade80;
    color: #4ade80;
  }

  .rate .didnt:hover {
    border-color: #f87171;
    color: #f87171;
  }

  .explanation {
    margin-top: 16px;
    padding: 14px 18px;
    background: rgba(100, 255, 218, 0.05);
    border-left: 3px solid var(--green);
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
    text-align: left;
    color: var(--light-slate);
    font-size: 14px;
    line-height: 1.6;
  }
`;

const StyledMCQOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
`;

const StyledMCQOption = styled.button`
  background: ${props => {
    if (props.$revealed && props.$isCorrect) {
      return 'rgba(74, 222, 128, 0.15)';
    }
    if (props.$revealed && props.$isSelected && !props.$isCorrect) {
      return 'rgba(248, 113, 113, 0.15)';
    }
    if (props.$isSelected) {
      return 'rgba(100, 255, 218, 0.08)';
    }
    return 'transparent';
  }};
  border: 1px solid
    ${props => {
    if (props.$revealed && props.$isCorrect) {
      return '#4ade80';
    }
    if (props.$revealed && props.$isSelected && !props.$isCorrect) {
      return '#f87171';
    }
    if (props.$isSelected) {
      return 'var(--green)';
    }
    return 'var(--lightest-navy)';
  }};
  border-radius: var(--border-radius);
  color: var(--lightest-slate);
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.5;
  text-align: left;
  padding: 14px 18px;
  cursor: ${props => (props.$revealed ? 'default' : 'pointer')};
  transition: var(--transition);
  width: 100%;

  &:hover {
    ${props =>
    !props.$revealed &&
      `
      border-color: var(--green);
      background: rgba(100, 255, 218, 0.05);
    `}
  }

  .letter {
    display: inline-block;
    width: 22px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--green);
    font-weight: 600;
    margin-right: 8px;
  }
`;

const StyledModeToggle = styled.div`
  display: inline-flex;
  border: 1px solid var(--lightest-navy);
  border-radius: var(--border-radius);
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 11px;

  button {
    background: transparent;
    border: none;
    color: var(--slate);
    padding: 6px 12px;
    cursor: pointer;
    transition: var(--transition);

    &.active {
      background: var(--green);
      color: #000;
      font-weight: 600;
    }

    &:hover:not(.active) {
      color: var(--green);
    }

    @media (max-width: 768px) {
      padding: 10px 18px;
      font-size: 13px;
      min-height: 40px;
    }
  }
`;

const StyledHardwareGuide = styled.div`
  padding: 16px 18px;
  margin-bottom: 20px;
  background: rgba(35, 53, 84, 0.2);
  border: 1px solid var(--lightest-navy);
  border-radius: var(--border-radius);

  > .title {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  > .sub {
    font-size: 12px;
    color: var(--slate);
    margin-bottom: 12px;
  }

  details {
    margin-bottom: 8px;
    border-left: 2px solid rgba(35, 53, 84, 0.6);
    padding-left: 12px;
  }

  details[open] {
    border-left-color: var(--green);
  }

  summary {
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--light-slate);
    padding: 4px 0;

    &:hover {
      color: var(--green);
    }
  }

  details p {
    font-size: 13px;
    color: var(--light-slate);
    line-height: 1.6;
    margin: 6px 0;
  }

  details code {
    font-family: var(--font-mono);
    font-size: 11px;
    background: rgba(100, 255, 218, 0.07);
    padding: 1px 5px;
    border-radius: 3px;
    color: var(--green);
  }
`;

const StyledTabBar = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--navy);
  border-top: 1px solid var(--lightest-navy);
  display: flex;
  z-index: 50;
  padding-bottom: env(safe-area-inset-bottom);

  @media (min-width: 769px) {
    position: sticky;
    top: var(--nav-height);
    bottom: auto;
    border-top: none;
    border-bottom: 1px solid var(--lightest-navy);
    margin: 0 80px;
    padding-bottom: 0;
  }
`;

const StyledTab = styled.button`
  flex: 1;
  background: transparent;
  border: none;
  color: ${props => (props.$active ? 'var(--green)' : 'var(--slate)')};
  font-family: var(--font-mono);
  padding: 10px 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: var(--transition);
  border-top: 2px solid ${props => (props.$active ? 'var(--green)' : 'transparent')};
  min-height: 56px;

  .icon {
    font-size: 22px;
    line-height: 1;
  }

  .lbl {
    font-size: 10px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    font-weight: ${props => (props.$active ? 600 : 400)};
  }

  &:hover {
    color: var(--green);
  }

  @media (min-width: 769px) {
    flex-direction: row;
    gap: 8px;
    border-top: none;
    border-bottom: 2px solid ${props => (props.$active ? 'var(--green)' : 'transparent')};
    padding: 14px 22px;
    min-height: auto;

    .icon {
      font-size: 16px;
    }

    .lbl {
      font-size: 12px;
    }
  }
`;

const StyledTabBody = styled.div`
  padding-bottom: calc(70px + env(safe-area-inset-bottom));

  @media (min-width: 769px) {
    padding-bottom: 24px;
  }
`;

const StyledFilterChips = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 50px;
  overflow-x: auto;
  border-bottom: 1px solid rgba(35, 53, 84, 0.5);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`;

const StyledChip = styled.button`
  background: ${props => (props.$active ? 'var(--green)' : 'transparent')};
  color: ${props => (props.$active ? '#000' : 'var(--slate)')};
  border: 1px solid ${props => (props.$active ? 'var(--green)' : 'var(--lightest-navy)')};
  border-radius: 16px;
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 7px 14px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: var(--transition);
  font-weight: ${props => (props.$active ? 600 : 400)};

  &:hover {
    border-color: var(--green);
    color: ${props => (props.$active ? '#000' : 'var(--green)')};
  }

  @media (max-width: 768px) {
    padding: 9px 16px;
    font-size: 13px;
    min-height: 38px;
  }
`;

const StyledFlatRow = styled.button`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 14px 50px;
  background: ${props => (props.$active ? 'rgba(214, 5, 69, 0.06)' : 'transparent')};
  border: none;
  border-left: 3px solid ${props => (props.$active ? 'var(--green)' : 'transparent')};
  border-bottom: 1px solid rgba(35, 53, 84, 0.4);
  color: var(--lightest-slate);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-sans);
  transition: var(--transition);

  &:hover {
    background: rgba(35, 53, 84, 0.25);
  }

  @media (max-width: 768px) {
    padding: 14px 14px;
  }

  .meta {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--slate);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .qtxt {
    font-size: 14px;
    line-height: 1.45;
    color: var(--lightest-slate);
  }
`;

const StyledPracticeCard = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  margin-bottom: 12px;
  background: rgba(35, 53, 84, 0.25);
  border: 1px solid var(--lightest-navy);
  border-radius: var(--border-radius);
  color: var(--lightest-slate);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: var(--transition);
  min-height: 80px;

  &:hover {
    border-color: var(--green);
    background: rgba(100, 255, 218, 0.05);
  }

  .ic {
    font-size: 32px;
    line-height: 1;
    flex-shrink: 0;
  }

  .body {
    flex: 1;

    .ttl {
      font-family: var(--font-mono);
      font-size: 14px;
      color: var(--green);
      margin-bottom: 4px;
      font-weight: 600;
    }

    .desc {
      font-size: 13px;
      color: var(--slate);
      line-height: 1.5;
    }
  }
`;

const StyledHeatmap = styled.div`
  padding: 16px;
  background: rgba(35, 53, 84, 0.2);
  border: 1px solid var(--lightest-navy);
  border-radius: var(--border-radius);
  margin-bottom: 18px;

  h3 {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 12px;
  }

  .grid {
    display: grid;
    grid-template-columns: 18px repeat(13, 1fr);
    gap: 3px;
    align-items: center;
  }

  .row-lbl {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--slate);
    text-align: right;
    padding-right: 4px;
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 10px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--slate);
    justify-content: flex-end;
  }
`;

const StyledHeatCell = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 2px;
  background: ${props => {
    if (props.$future) {
      return 'transparent';
    }
    if (props.$preStart && !props.$count) {
      return 'rgba(35, 53, 84, 0.2)';
    }
    const c = props.$count || 0;
    if (c === 0) {
      return 'rgba(35, 53, 84, 0.5)';
    }
    if (c === 1) {
      return 'rgba(74, 222, 128, 0.25)';
    }
    if (c === 2) {
      return 'rgba(74, 222, 128, 0.5)';
    }
    if (c <= 4) {
      return 'rgba(74, 222, 128, 0.75)';
    }
    return '#4ade80';
  }};
  border: ${props =>
    props.$today
      ? '1px solid var(--green)'
      : props.$preStart && !props.$count
        ? '1px dashed rgba(35, 53, 84, 0.6)'
        : '1px solid transparent'};
  min-width: 0;
`;

const StyledMobileBackBar = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--navy);
    border-bottom: 1px solid var(--lightest-navy);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  button {
    background: transparent;
    border: 1px solid var(--lightest-navy);
    border-radius: var(--border-radius);
    color: var(--green);
    font-family: var(--font-mono);
    font-size: 12px;
    padding: 8px 14px;
    cursor: pointer;
    min-height: 36px;

    &:hover {
      border-color: var(--green);
    }
  }

  .label {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--slate);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const StyledCodingCard = styled.div`
  padding: 18px 20px;
  margin-bottom: 18px;
  background: rgba(167, 139, 250, 0.05);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: var(--border-radius);

  @media (max-width: 768px) {
    padding: 14px 16px;
  }

  h3 {
    font-family: var(--font-mono);
    font-size: 12px;
    color: #a78bfa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 10px;
  }

  .meta {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--slate);
    margin-bottom: 8px;
  }

  .diff {
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 9px;
    letter-spacing: 0.5px;
  }

  .diff.easy {
    background: rgba(74, 222, 128, 0.15);
    color: #4ade80;
  }
  .diff.medium {
    background: rgba(250, 204, 21, 0.15);
    color: #facc15;
  }
  .diff.hard {
    background: rgba(248, 113, 113, 0.15);
    color: #f87171;
  }

  .title {
    color: var(--lightest-slate);
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 10px;
    line-height: 1.4;
  }

  .problem {
    color: var(--light-slate);
    font-size: 14px;
    line-height: 1.7;
    margin: 0 0 14px;
  }

  .toggle {
    background: transparent;
    border: 1px dashed var(--lightest-navy);
    border-radius: var(--border-radius);
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 6px 12px;
    cursor: pointer;
    margin-right: 6px;
    margin-bottom: 6px;
    transition: var(--transition);
    min-height: 36px;

    &:hover {
      border-color: #a78bfa;
      color: #a78bfa;
    }
  }

  ul.list {
    list-style: none;
    padding: 0;
    margin: 8px 0 14px;

    li {
      position: relative;
      padding-left: 18px;
      margin-bottom: 6px;
      color: var(--light-slate);
      font-size: 13px;
      line-height: 1.6;

      &::before {
        content: '▹';
        position: absolute;
        left: 0;
        color: #a78bfa;
      }
    }
  }

  pre {
    background: rgba(2, 12, 27, 0.7);
    border: 1px solid var(--lightest-navy);
    border-radius: var(--border-radius);
    padding: 12px 14px;
    margin: 8px 0 14px;
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.6;
    color: var(--lightest-slate);
    -webkit-overflow-scrolling: touch;

    @media (max-width: 768px) {
      font-size: 11px;
      padding: 10px 12px;
    }
  }

  .apple-note {
    margin-top: 12px;
    padding: 8px 12px;
    background: rgba(35, 53, 84, 0.3);
    border-left: 3px solid #a78bfa;
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--slate);
    font-style: italic;
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 14px;
    flex-wrap: wrap;
  }

  .done-btn {
    background: #a78bfa;
    color: #000;
    border: none;
    border-radius: var(--border-radius);
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    padding: 10px 18px;
    cursor: pointer;
    min-height: 40px;

    @media (max-width: 768px) {
      width: 100%;
      padding: 14px;
      font-size: 14px;
      min-height: 50px;
    }

    &:hover {
      opacity: 0.85;
    }
  }

  .done-tag {
    color: #4ade80;
    font-family: var(--font-mono);
    font-size: 12px;
    padding: 8px 0;
  }
`;

const StyledTodayCard = styled.div`
  padding: 22px 24px;
  margin-bottom: 18px;
  background: linear-gradient(135deg, rgba(100, 255, 218, 0.08) 0%, rgba(35, 53, 84, 0.4) 100%);
  border: 1px solid rgba(100, 255, 218, 0.25);
  border-radius: var(--border-radius);

  @media (max-width: 768px) {
    padding: 16px;
  }

  > header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 8px;
  }

  h2 {
    margin: 0;
    color: var(--lightest-slate);
    font-size: 20px;
    font-family: var(--font-mono);

    @media (max-width: 768px) {
      font-size: 17px;
    }
  }

  .date {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--slate);
  }

  .week-grid {
    display: flex;
    gap: 6px;
    margin-bottom: 18px;

    @media (max-width: 768px) {
      gap: 4px;
    }
  }

  .day-cell {
    flex: 1;
    text-align: center;
    padding: 8px 4px;
    border-radius: var(--border-radius);
    font-family: var(--font-mono);
    font-size: 11px;
    border: 1px solid var(--lightest-navy);
    color: var(--slate);
    min-width: 0;

    .lbl {
      display: block;
      margin-bottom: 4px;
      letter-spacing: 0.3px;
    }

    .mark {
      display: block;
      font-size: 14px;
      line-height: 1;
    }

    &.done {
      background: rgba(74, 222, 128, 0.15);
      border-color: #4ade80;
      color: #4ade80;
    }

    &.today {
      border-color: var(--green);
      background: rgba(100, 255, 218, 0.1);
      color: var(--green);
      font-weight: 600;
    }

    &.weekend {
      opacity: 0.5;
      border-style: dashed;
    }

    &.future {
      opacity: 0.4;
    }
  }

  .plan-rows {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 18px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  .plan-tile {
    padding: 12px 14px;
    background: rgba(2, 12, 27, 0.5);
    border: 1px solid var(--lightest-navy);
    border-radius: var(--border-radius);
    text-align: center;

    .icon {
      font-size: 18px;
      margin-bottom: 4px;
    }

    .num {
      font-family: var(--font-mono);
      font-size: 22px;
      font-weight: 600;
      color: var(--green);
      line-height: 1;
      margin-bottom: 2px;

      @media (max-width: 768px) {
        font-size: 18px;
      }
    }

    .name {
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--slate);
    }
  }

  .start-btn {
    background: var(--green);
    color: #000;
    border: none;
    border-radius: var(--border-radius);
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 600;
    padding: 14px 28px;
    cursor: pointer;
    width: 100%;
    transition: var(--transition);
    min-height: 50px;

    &:hover {
      opacity: 0.85;
    }

    &:disabled {
      background: var(--lightest-navy);
      color: var(--slate);
      cursor: not-allowed;
    }
  }

  .empty-state {
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: 13px;
    text-align: center;
    padding: 8px 0;
    line-height: 1.6;
  }

  .pct {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--slate);
    margin-top: 8px;
    text-align: center;
  }
`;

const StyledTodayPracticals = styled.div`
  padding: 16px 18px;
  margin-bottom: 18px;
  background: rgba(35, 53, 84, 0.2);
  border: 1px solid var(--lightest-navy);
  border-radius: var(--border-radius);

  h3 {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--green);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 12px;
  }

  .pract-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(35, 53, 84, 0.4);
    font-size: 13px;
    color: var(--light-slate);
    line-height: 1.5;

    &:last-child {
      border-bottom: none;
    }

    &.done {
      opacity: 0.55;
      text-decoration: line-through;
    }
  }

  .pract-check {
    background: transparent;
    border: 1px solid var(--lightest-navy);
    border-radius: 3px;
    width: 22px;
    height: 22px;
    color: var(--green);
    cursor: pointer;
    flex-shrink: 0;
    line-height: 20px;
    padding: 0;
    font-size: 13px;

    @media (max-width: 768px) {
      width: 28px;
      height: 28px;
      line-height: 26px;
    }

    &:hover {
      border-color: var(--green);
    }
  }

  .pract-meta {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--slate);
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-top: 2px;
  }
`;

const StyledMasteryDot = styled.span`
  display: inline-flex;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${props => {
    if (props.$mastery === 0) {
      return 'transparent';
    }
    if (props.$mastery <= 2) {
      return '#f87171';
    }
    if (props.$mastery <= 3) {
      return '#facc15';
    }
    return '#4ade80';
  }};
  border: 1px solid
    ${props => {
    if (props.$mastery === 0) {
      return 'var(--lightest-navy)';
    }
    if (props.$mastery <= 2) {
      return '#f87171';
    }
    if (props.$mastery <= 3) {
      return '#facc15';
    }
    return '#4ade80';
  }};
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 8px;
  font-weight: 700;
  color: #000;
  margin-right: 6px;
  flex-shrink: 0;
  vertical-align: middle;
`;

const StyledSessionPhase = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  color: ${props =>
    props.$phase === 'new'
      ? 'var(--green)'
      : props.$phase === 'review'
        ? '#facc15'
        : 'var(--slate)'};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
`;

const StyledSketchSection = styled.div`
  margin-top: 28px;

  canvas {
    width: 100%;
    height: 300px;
    border: 1px solid var(--lightest-navy);
    border-radius: 0 0 var(--border-radius) var(--border-radius);
    touch-action: none;
    cursor: crosshair;

    @media (max-width: 768px) {
      height: 220px;
    }
  }
`;

const StyledSketchToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(35, 53, 84, 0.3);
  border: 1px solid var(--lightest-navy);
  border-bottom: none;
  border-radius: var(--border-radius) var(--border-radius) 0 0;

  .label {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--slate);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .sketch-actions {
    display: flex;
    gap: 6px;
  }

  button {
    background: transparent;
    border: 1px solid var(--lightest-navy);
    border-radius: var(--border-radius);
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 4px 10px;
    cursor: pointer;
    transition: var(--transition);

    &:hover {
      border-color: var(--green);
      color: var(--green);
    }
  }
`;

// --- SketchPad Component ---

const SketchPad = ({ questionId }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const parent = canvas.parentElement;
    const w = parent.offsetWidth;
    const h = 300;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;

    // Background
    ctx.fillStyle = '#0d1520';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(35, 53, 84, 0.5)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Load saved sketch
    try {
      const sketches = loadFromStorage(SKETCH_KEY);
      if (sketches[questionId]) {
        const img = new Image();
        img.onload = () => {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.drawImage(img, 0, 0);
          ctx.scale(dpr, dpr);
        };
        img.src = sketches[questionId];
      }
    } catch (e) {
      /* ignore */
    }
  }, [questionId]);

  const getPos = useCallback(e => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }, []);

  const startDraw = useCallback(
    e => {
      e.preventDefault();
      const ctx = ctxRef.current;
      if (!ctx) {
        return;
      }
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = '#a8b2d1';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      drawingRef.current = true;
    },
    [getPos],
  );

  const draw = useCallback(
    e => {
      if (!drawingRef.current) {
        return;
      }
      e.preventDefault();
      const ctx = ctxRef.current;
      if (!ctx) {
        return;
      }
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    },
    [getPos],
  );

  const endDraw = useCallback(() => {
    if (!drawingRef.current) {
      return;
    }
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    try {
      const sketches = loadFromStorage(SKETCH_KEY);
      sketches[questionId] = canvas.toDataURL();
      saveToStorage(SKETCH_KEY, sketches);
    } catch (e) {
      /* ignore */
    }
  }, [questionId]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.fillStyle = '#0d1520';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(35, 53, 84, 0.5)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    try {
      const sketches = loadFromStorage(SKETCH_KEY);
      delete sketches[questionId];
      saveToStorage(SKETCH_KEY, sketches);
    } catch (e) {
      /* ignore */
    }
  }, [questionId]);

  return (
    <StyledSketchSection>
      <StyledSketchToolbar>
        <span className="label">Sketchpad — draw diagrams here</span>
        <div className="sketch-actions">
          <button type="button" onClick={clearCanvas}>
            Clear
          </button>
        </div>
      </StyledSketchToolbar>
      <canvas
        ref={canvasRef}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
    </StyledSketchSection>
  );
};

SketchPad.propTypes = {
  questionId: PropTypes.string.isRequired,
};

// --- Main Component ---

const InterviewPrepPage = ({ location }) => {
  const [answers, setAnswers] = useState({});
  const [activeQ, setActiveQ] = useState(null);
  const [currentDraft, setCurrentDraft] = useState('');
  const [showReference, setShowReference] = useState(false);
  const [showReading, setShowReading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Confidence + timer state
  const [confidence, setConfidence] = useState({});
  const [lastReviewed, setLastReviewed] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);

  // Tier filter & practical task tracking
  const [tierFilter, setTierFilter] = useState(null);
  const [practicalDone, setPracticalDone] = useState({});

  // Quick Mode (flashcards / MCQ)
  const [quickMode, setQuickMode] = useState(false);
  const [quickFormat, setQuickFormat] = useState('flip'); // 'flip' | 'mcq' | 'session'
  const [deck, setDeck] = useState([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [mcqSelected, setMcqSelected] = useState(null);
  const [sessionStats, setSessionStats] = useState({ knew: 0, didnt: 0 });
  const [flashcardStats, setFlashcardStats] = useState({});

  // Daily mission (spaced-repetition study state)
  const [studyState, setStudyState] = useState({});
  const [dayLog, setDayLog] = useState({});
  const [today, setToday] = useState(dateKey());
  const [studyStartDate, setStudyStartDate] = useState(null);
  const [codingDone, setCodingDone] = useState({});
  const [codingReveal, setCodingReveal] = useState({}); // { hints: bool, solution: bool, pitfalls: bool }
  const [introSeen, setIntroSeen] = useState({}); // qids that have passed intro this session
  const [weekendOverride, setWeekendOverride] = useState(false); // user opted to study new cards on a weekend

  // Tab navigation
  const [activeTab, setActiveTabState] = useState('today'); // 'today' | 'browse' | 'practice' | 'progress'
  const [browseFilter, setBrowseFilter] = useState('all'); // 'all' | 't1'..'t4' | 'unseen' | 'weak' | 'mastered' | 'stale'

  const setActiveTab = useCallback(t => {
    setActiveTabState(t);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('interview-prep-active-tab', t);
      } catch (e) {
        /* ignore */
      }
    }
  }, []);

  // Cloud sync state
  const [pin, setPin] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | synced | error
  const [lastSynced, setLastSynced] = useState(null);

  // Load answers from localStorage + check for saved PIN on mount
  useEffect(() => {
    const loaded = loadAnswers();
    setAnswers(loaded);
    setConfidence(loadFromStorage(CONFIDENCE_KEY));
    setLastReviewed(loadFromStorage(REVIEWED_KEY));
    setPracticalDone(loadFromStorage(PRACTICAL_KEY));
    setFlashcardStats(loadFromStorage(FLASHCARD_KEY));
    setCodingDone(loadFromStorage(CODING_DONE_KEY));
    const loadedStudy = loadFromStorage(STUDY_STATE_KEY);
    const loadedDayLog = loadFromStorage(DAY_LOG_KEY);
    setStudyState(loadedStudy);
    setDayLog(loadedDayLog);
    const todayStr = dateKey();
    setToday(todayStr);

    // Init studyStartDate: stored value > earliest dayLog activity > computed default
    let startStored = null;
    try {
      startStored = window.localStorage.getItem(STUDY_START_KEY);
    } catch (e) {
      /* ignore */
    }
    let resolvedStart = startStored;
    if (!resolvedStart) {
      resolvedStart = earliestActivityDate(loadedDayLog) || computeDefaultStart(todayStr);
      try {
        window.localStorage.setItem(STUDY_START_KEY, resolvedStart);
      } catch (e) {
        /* ignore */
      }
    }
    setStudyStartDate(resolvedStart);
    if (typeof window !== 'undefined') {
      const t = window.localStorage.getItem('interview-prep-active-tab');
      if (t && ['today', 'browse', 'practice', 'progress'].includes(t)) {
        setActiveTab(t);
      }
    }

    const savedPin = getSavedPin();
    if (savedPin) {
      setPin(savedPin);
      // Auto-pull from cloud on mount
      pullFromCloud(savedPin)
        .then(data => {
          if (data && data.answers) {
            // Merge: cloud wins for keys present in cloud
            const merged = { ...loaded, ...data.answers };
            setAnswers(merged);
            saveAnswers(merged);
            setLastSynced(data.lastUpdated);
            setSyncStatus('synced');
          }
        })
        .catch(() => {
          // Silently fail — offline is fine, local data still works
          setSyncStatus('idle');
        });
    }
  }, []);

  // Cloud push helper
  const cloudPush = useCallback(
    async updatedAnswers => {
      if (!pin) {
        return;
      }
      setSyncStatus('syncing');
      try {
        await pushToCloud(pin, updatedAnswers);
        setSyncStatus('synced');
        setLastSynced(new Date().toISOString());
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    },
    [pin],
  );

  // PIN modal handlers
  const handlePinSubmit = useCallback(async () => {
    const trimmed = pinInput.trim();
    if (trimmed.length < 4 || trimmed.length > 8) {
      setPinError('PIN must be 4–8 digits');
      return;
    }
    if (!/^\d+$/.test(trimmed)) {
      setPinError('PIN must be numbers only');
      return;
    }
    setPinError('');
    savePin(trimmed);
    setPin(trimmed);

    // Try pulling existing data for this PIN
    setSyncStatus('syncing');
    try {
      const data = await pullFromCloud(trimmed);
      if (data && data.answers) {
        const currentAnswers = loadAnswers();
        const merged = { ...currentAnswers, ...data.answers };
        setAnswers(merged);
        saveAnswers(merged);
        setLastSynced(data.lastUpdated);
      } else {
        // First time with this PIN — push current local data up
        const currentAnswers = loadAnswers();
        if (Object.keys(currentAnswers).length > 0) {
          await pushToCloud(trimmed, currentAnswers);
        }
      }
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
    setShowPinModal(false);
    setPinInput('');
  }, [pinInput]);

  const handleDisconnect = useCallback(() => {
    clearPin();
    setPin(null);
    setSyncStatus('idle');
    setLastSynced(null);
  }, []);

  const handleManualSync = useCallback(async () => {
    if (!pin) {
      return;
    }
    setSyncStatus('syncing');
    try {
      // Pull first, merge, then push
      const data = await pullFromCloud(pin);
      let merged = { ...answers };
      if (data && data.answers) {
        merged = { ...data.answers, ...answers }; // local wins on conflict
      }
      await pushToCloud(pin, merged);
      setAnswers(merged);
      saveAnswers(merged);
      setSyncStatus('synced');
      setLastSynced(new Date().toISOString());
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }, [pin, answers]);

  // Find the active question object
  const activeQuestion = activeQ
    ? interviewPrepData.flatMap(w => w.questions).find(q => q.id === activeQ)
    : null;

  const handleSelectQuestion = useCallback(q => {
    setActiveQ(q.id);
    setShowReference(false);
    setShowReading(false);
    setSaved(false);
    // Load existing answer or empty
    setCurrentDraft(() => {
      const loaded = loadAnswers();
      return loaded[q.id] || '';
    });
    // Track review timestamp
    setLastReviewed(prev => {
      const updated = { ...prev, [q.id]: new Date().toISOString() };
      saveToStorage(REVIEWED_KEY, updated);
      return updated;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!activeQ) {
      return;
    }
    const trimmed = currentDraft.trim();
    const updated = { ...answers };
    if (trimmed) {
      updated[activeQ] = trimmed;
    } else {
      delete updated[activeQ];
    }
    setAnswers(updated);
    saveAnswers(updated);
    cloudPush(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Saving a written answer also counts as study activity for the day
    setDayLog(prev => {
      const next = logDayActivity(prev, today, 'card-review', activeQ);
      saveToStorage(DAY_LOG_KEY, next);
      return next;
    });
  }, [activeQ, currentDraft, answers, cloudPush, today]);

  const handleDelete = useCallback(() => {
    if (!activeQ) {
      return;
    }
    const updated = { ...answers };
    delete updated[activeQ];
    setAnswers(updated);
    saveAnswers(updated);
    cloudPush(updated);
    setCurrentDraft('');
  }, [activeQ, answers, cloudPush]);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(answers, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-prep-answers-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [answers]);

  const handleImport = useCallback(
    e => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const imported = JSON.parse(evt.target.result);
          if (typeof imported === 'object' && imported !== null) {
            const merged = { ...answers, ...imported };
            setAnswers(merged);
            saveAnswers(merged);
          }
        } catch {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [answers],
  );

  // Stats
  const allQuestions = interviewPrepData.flatMap(w => w.questions);

  // Stale detection: answered > 3 days ago without review
  const isStale = qid => {
    if (!answers[qid] || answers[qid].length <= 80) {
      return false;
    }
    const reviewed = lastReviewed[qid];
    if (!reviewed) {
      return true;
    }
    return (Date.now() - new Date(reviewed).getTime()) / 86400000 > 3;
  };
  const staleCount = allQuestions.filter(q => isStale(q.id)).length;

  // Per-tier progress: # answered ≥ 80 chars / # in tier
  const tierProgress = [1, 2, 3, 4].map(t => {
    const inTier = allQuestions.filter(q => tiers[q.id] === t);
    const done = inTier.filter(q => answers[q.id] && answers[q.id].length > 80).length;
    return { tier: t, total: inTier.length, done };
  });

  const togglePractical = (qid, idx) => {
    setPracticalDone(prev => {
      const key = `${qid}:${idx}`;
      const updated = { ...prev, [key]: !prev[key] };
      saveToStorage(PRACTICAL_KEY, updated);
      return updated;
    });
  };

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  // Confidence handler
  const handleConfidence = useCallback((qid, level) => {
    setConfidence(prev => {
      const updated = { ...prev, [qid]: level };
      saveToStorage(CONFIDENCE_KEY, updated);
      return updated;
    });
  }, []);

  // Daily plan + streak (memoized via deps)
  const plan = buildDailyPlan(today, studyState, {
    forceNew: weekendOverride,
    startDate: studyStartDate,
  });
  const streakDays = computeStreak(today, dayLog, studyStartDate);
  const weekGrid = buildWeekGrid(today, dayLog, studyStartDate);
  const histogram = masteryHistogram(studyState);
  const totalBacklog = reviewBacklog(today, studyState);
  const isWeekendToday = isWeekendDay(today);
  const hasNeverStudied = Object.keys(studyState).length === 0;
  const isPreStart = !!(studyStartDate && today < studyStartDate);

  const handleStartNow = useCallback(() => {
    setStudyStartDate(today);
    try {
      window.localStorage.setItem(STUDY_START_KEY, today);
    } catch (e) {
      /* ignore */
    }
  }, [today]);

  const handleSetStartDate = useCallback(date => {
    setStudyStartDate(date);
    try {
      window.localStorage.setItem(STUDY_START_KEY, date);
    } catch (e) {
      /* ignore */
    }
  }, []);

  // Browse-tab flat list with chip filter + search
  const browseList = (() => {
    let list = interviewPrepData.flatMap(w =>
      w.questions.map(q => ({ ...q, _week: w.week, _weekTitle: w.title })),
    );
    if (browseFilter !== 'all') {
      if (browseFilter === 'unseen') {
        list = list.filter(q => !studyState[q.id]);
      } else if (browseFilter === 'weak') {
        list = list.filter(q => {
          const s = studyState[q.id];
          return s && s.mastery > 0 && s.mastery <= 2;
        });
      } else if (browseFilter === 'mastered') {
        list = list.filter(q => studyState[q.id]?.mastery >= 4);
      } else if (browseFilter === 'stale') {
        list = list.filter(q => isStale(q.id));
      } else if (browseFilter.startsWith('t')) {
        const tn = parseInt(browseFilter.slice(1), 10);
        list = list.filter(q => tiers[q.id] === tn);
      }
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(
        q => q.question.toLowerCase().includes(s) || q.topic.toLowerCase().includes(s),
      );
    }
    return list;
  })();

  // Heatmap: last 13 weeks of activity, 7 rows (Mon..Sun) × 13 cols
  const heatmapCols = (() => {
    const weeks = 13;
    const [yT, mT, dT] = today.split('-').map(Number);
    const todayDate = new Date(yT, mT - 1, dT);
    const dow = todayDate.getDay() || 7;
    // The Sunday at end of current week
    const thisSun = new Date(todayDate);
    thisSun.setDate(todayDate.getDate() + (7 - dow));
    // Monday at start of (weeks-1) ago
    const startMon = new Date(thisSun);
    startMon.setDate(thisSun.getDate() - weeks * 7 + 1);

    const cols = [];
    for (let w = 0; w < weeks; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startMon);
        date.setDate(startMon.getDate() + w * 7 + d);
        const k = dateKey(date);
        const log = dayLog[k];
        const count = log ? (log.answered || 0) + ((log.practicalsDone || []).length || 0) : 0;
        col.push({ date: k, count, future: k > today, today: k === today });
      }
      cols.push(col);
    }
    return cols;
  })();

  // Start a daily session: deck = new cards then review cards
  const startDailySession = useCallback(() => {
    const newQs = plan.newIds
      .map(id => interviewPrepData.flatMap(w => w.questions).find(q => q.id === id))
      .filter(Boolean);
    const reviewQs = plan.reviewIds
      .map(id => interviewPrepData.flatMap(w => w.questions).find(q => q.id === id))
      .filter(Boolean);
    const sessionDeck = [
      ...newQs.map(q => ({ ...q, _kind: 'new' })),
      ...reviewQs.map(q => ({ ...q, _kind: 'review' })),
    ];
    if (sessionDeck.length === 0) {
      return;
    }
    setDeck(sessionDeck);
    setQuickFormat('session');
    setCardIdx(0);
    setCardFlipped(false);
    setMcqSelected(null);
    setIntroSeen({});
    setSessionStats({ knew: 0, didnt: 0 });
    setQuickMode(true);
  }, [plan]);

  // Rate a card during a daily session: update studyState + dayLog
  const rateSessionCard = useCallback(
    gotItRight => {
      const card = deck[cardIdx];
      if (!card) {
        return;
      }
      setStudyState(prev => {
        const next = { ...prev, [card.id]: advance(prev[card.id], gotItRight, today) };
        saveToStorage(STUDY_STATE_KEY, next);
        return next;
      });
      const kind = card._kind === 'new' ? 'card-new' : 'card-review';
      setDayLog(prev => {
        const next = logDayActivity(prev, today, kind, card.id);
        saveToStorage(DAY_LOG_KEY, next);
        return next;
      });
      setSessionStats(prev => ({
        knew: prev.knew + (gotItRight ? 1 : 0),
        didnt: prev.didnt + (gotItRight ? 0 : 1),
      }));
      if (cardIdx + 1 < deck.length) {
        setCardIdx(cardIdx + 1);
        setCardFlipped(false);
        setMcqSelected(null);
      } else {
        setCardIdx(deck.length); // sentinel = done
      }
    },
    [deck, cardIdx, today],
  );

  const togglePracticalDaily = useCallback(
    (qid, idx) => {
      const key = `${qid}:${idx}`;
      setPracticalDone(prev => {
        const updated = { ...prev, [key]: !prev[key] };
        saveToStorage(PRACTICAL_KEY, updated);
        return updated;
      });
      // Log practical completion for streak/day tracking
      if (!practicalDone[key]) {
        setDayLog(prev => {
          const next = logDayActivity(prev, today, 'practical', key);
          saveToStorage(DAY_LOG_KEY, next);
          return next;
        });
      }
    },
    [today, practicalDone],
  );

  // Today's coding challenge = the next uncompleted problem in order
  const todaysCoding = codingProblems.find(c => !codingDone[c.id]) || null;
  const codingCompletedCount = Object.keys(codingDone).filter(k => codingDone[k]).length;

  const markCodingDone = useCallback(() => {
    if (!todaysCoding) {
      return;
    }
    setCodingDone(prev => {
      const updated = { ...prev, [todaysCoding.id]: true };
      saveToStorage(CODING_DONE_KEY, updated);
      return updated;
    });
    setDayLog(prev => {
      const next = logDayActivity(prev, today, 'practical', `coding:${todaysCoding.id}`);
      saveToStorage(DAY_LOG_KEY, next);
      return next;
    });
    setCodingReveal({});
  }, [todaysCoding, today]);

  const toggleCodingReveal = useCallback(section => {
    setCodingReveal(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // Quick Mode: build deck from current tier filter (or all if none) and shuffle
  const buildDeck = useCallback(
    format => {
      let pool = interviewPrepData.flatMap(w => w.questions);
      if (tierFilter) {
        pool = pool.filter(q => tiers[q.id] === tierFilter);
      }
      if (format === 'mcq') {
        pool = pool.filter(q => mcq[q.id]);
      }
      // Shuffle
      const shuffled = [...pool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },
    [tierFilter],
  );

  const startQuickMode = useCallback(
    format => {
      const newDeck = buildDeck(format);
      if (newDeck.length === 0) {
        alert(
          format === 'mcq'
            ? 'No MCQs available for this tier filter — try "All" or T1.'
            : 'No questions match the current filter.',
        );
        return;
      }
      setDeck(newDeck);
      setQuickFormat(format);
      setCardIdx(0);
      setCardFlipped(false);
      setMcqSelected(null);
      setSessionStats({ knew: 0, didnt: 0 });
      setQuickMode(true);
    },
    [buildDeck],
  );

  const exitQuickMode = useCallback(() => {
    setQuickMode(false);
    setMcqSelected(null);
    setCardFlipped(false);
  }, []);

  const rateCard = useCallback(
    knew => {
      const card = deck[cardIdx];
      if (!card) {
        return;
      }
      setFlashcardStats(prev => {
        const cur = prev[card.id] || { shown: 0, knew: 0 };
        const updated = {
          ...prev,
          [card.id]: { shown: cur.shown + 1, knew: cur.knew + (knew ? 1 : 0) },
        };
        saveToStorage(FLASHCARD_KEY, updated);
        return updated;
      });
      setSessionStats(prev => ({
        knew: prev.knew + (knew ? 1 : 0),
        didnt: prev.didnt + (knew ? 0 : 1),
      }));
      // Auto-advance
      if (cardIdx + 1 < deck.length) {
        setCardIdx(cardIdx + 1);
        setCardFlipped(false);
        setMcqSelected(null);
      } else {
        setCardIdx(deck.length); // sentinel = session done
      }
    },
    [deck, cardIdx],
  );

  const restartDeck = useCallback(() => {
    const newDeck = buildDeck(quickFormat);
    setDeck(newDeck);
    setCardIdx(0);
    setCardFlipped(false);
    setMcqSelected(null);
    setSessionStats({ knew: 0, didnt: 0 });
  }, [buildDeck, quickFormat]);

  // Wake Lock during Quick Mode — keeps screen on while flipping cards on a phone
  useEffect(() => {
    if (!quickMode || typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return undefined;
    }
    let lock = null;
    let cancelled = false;
    navigator.wakeLock
      .request('screen')
      .then(w => {
        if (cancelled) {
          w.release().catch(() => {});
        } else {
          lock = w;
        }
      })
      .catch(() => {
        /* User denied or unsupported — fall back silently */
      });
    return () => {
      cancelled = true;
      if (lock) {
        lock.release().catch(() => {});
      }
    };
  }, [quickMode]);

  // Timer countdown
  useEffect(() => {
    if (!timerRunning) {
      return;
    }
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = s => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const fileInputRef = useRef(null);

  return (
    <Layout location={location}>
      <StyledContainer>
        {/* PIN Modal */}
        {showPinModal && (
          <StyledPinOverlay onClick={() => setShowPinModal(false)}>
            <StyledPinModal onClick={e => e.stopPropagation()}>
              <h2>Cloud Sync</h2>
              <div className="subtitle">
                Pick a 4–8 digit PIN to sync your answers across devices. Same PIN = same data.
                Remember it!
              </div>
              <input
                className="pin-input"
                type="tel"
                maxLength={8}
                placeholder="••••"
                value={pinInput}
                onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
              />
              {pinError && <div className="error-msg">{pinError}</div>}
              <div className="pin-actions">
                <StyledActionButton $primary onClick={handlePinSubmit}>
                  Connect
                </StyledActionButton>
                <StyledActionButton onClick={() => setShowPinModal(false)}>
                  Cancel
                </StyledActionButton>
              </div>
              <button className="skip-link" onClick={() => setShowPinModal(false)}>
                Skip — use local storage only
              </button>
            </StyledPinModal>
          </StyledPinOverlay>
        )}

        {/* Quick Mode overlay (Session / Flashcards / MCQ) */}
        {quickMode && (
          <StyledQuickOverlay>
            <StyledQuickHeader>
              <div className="progress">
                {cardIdx < deck.length
                  ? `Card ${cardIdx + 1} of ${deck.length}`
                  : `Session done · ${sessionStats.knew} knew · ${sessionStats.didnt} missed`}
                {quickFormat === 'session' && cardIdx < deck.length && (
                  <>
                    {' · '}
                    <span
                      style={{
                        color: deck[cardIdx]?._kind === 'new' ? 'var(--green)' : '#facc15',
                      }}>
                      {deck[cardIdx]?._kind === 'new' ? 'NEW' : 'REVIEW'}
                    </span>
                  </>
                )}
                {quickFormat !== 'session' && tierFilter && ` · ${tierMeta[tierFilter].label}`}
              </div>
              <div className="right">
                {quickFormat !== 'session' && (
                  <>
                    <StyledModeToggle>
                      <button
                        type="button"
                        className={quickFormat === 'flip' ? 'active' : ''}
                        onClick={() => quickFormat !== 'flip' && startQuickMode('flip')}>
                        Flip
                      </button>
                      <button
                        type="button"
                        className={quickFormat === 'mcq' ? 'active' : ''}
                        onClick={() => quickFormat !== 'mcq' && startQuickMode('mcq')}>
                        MCQ
                      </button>
                    </StyledModeToggle>
                    <StyledToolbarButton onClick={restartDeck}>Reshuffle</StyledToolbarButton>
                  </>
                )}
                <StyledToolbarButton onClick={exitQuickMode}>✕ Exit</StyledToolbarButton>
              </div>
            </StyledQuickHeader>

            <StyledQuickCard>
              {cardIdx >= deck.length ? (
                <>
                  <div className="question">
                    {quickFormat === 'session'
                      ? '🎯 Session complete!'
                      : `Done — ${deck.length} cards reviewed`}
                  </div>
                  <div className="answer" style={{ borderLeftColor: '#facc15' }}>
                    Knew: {sessionStats.knew} · Missed: {sessionStats.didnt}
                    {quickFormat === 'session' && sessionStats.didnt > 0 && (
                      <div style={{ marginTop: 8, fontSize: 13 }}>
                        Missed cards return tomorrow at lower mastery — that&apos;s the point.
                      </div>
                    )}
                    {quickFormat === 'session' &&
                      sessionStats.didnt === 0 &&
                      sessionStats.knew > 0 && (
                      <div style={{ marginTop: 8, fontSize: 13 }}>
                          Clean run — those cards moved up the mastery ladder.
                      </div>
                    )}
                    {quickFormat !== 'session' && sessionStats.didnt > 0 && (
                      <div style={{ marginTop: 8, fontSize: 13 }}>
                        Tip: missed cards stay in your stats — review them again later.
                      </div>
                    )}
                  </div>
                  <button
                    className="reveal"
                    type="button"
                    onClick={quickFormat === 'session' ? exitQuickMode : restartDeck}>
                    {quickFormat === 'session' ? 'Back to Today' : 'Restart'}
                  </button>
                </>
              ) : (
                <>
                  <div className="topic">
                    {(() => {
                      const card = deck[cardIdx];
                      const w = interviewPrepData.find(wk =>
                        wk.questions.some(q => q.id === card.id),
                      );
                      return `Week ${w?.week} · ${card.day} — ${card.topic}`;
                    })()}
                  </div>

                  {/* Session mode: intro phase for new cards before testing */}
                  {quickFormat === 'session' &&
                  deck[cardIdx]._kind === 'new' &&
                  !introSeen[deck[cardIdx].id] ? (
                      <>
                        <StyledSessionPhase $phase="new">
                        📚 Learn — first time seeing this
                        </StyledSessionPhase>
                        <div className="question">{deck[cardIdx].question}</div>
                        <div className="answer">{deck[cardIdx].referenceAnswer}</div>
                        {deck[cardIdx].reading && deck[cardIdx].reading.length > 0 && (
                          <div
                            style={{
                              marginBottom: 20,
                              textAlign: 'left',
                              width: '100%',
                              fontSize: 13,
                              color: 'var(--slate)',
                              lineHeight: 1.6,
                            }}>
                            <div
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                marginBottom: 6,
                              }}>
                            Reading material
                            </div>
                            {deck[cardIdx].reading.slice(0, 3).map((r, i) => (
                              <div key={i}>▹ {r}</div>
                            ))}
                          </div>
                        )}
                        <button
                          className="reveal"
                          type="button"
                          onClick={() =>
                            setIntroSeen(prev => ({ ...prev, [deck[cardIdx].id]: true }))
                          }>
                        Got it — test me
                        </button>
                      </>
                    ) : quickFormat === 'mcq' ||
                    (quickFormat === 'session' && mcq[deck[cardIdx].id]) ? (
                        mcq[deck[cardIdx].id] ? (
                          <>
                            {quickFormat === 'session' && (
                              <StyledSessionPhase $phase={deck[cardIdx]._kind}>
                                {deck[cardIdx]._kind === 'new' ? '🧠 Test recall' : '🔁 Spaced review'}
                              </StyledSessionPhase>
                            )}
                            <div className="question">{mcq[deck[cardIdx].id].question}</div>
                            <StyledMCQOptions>
                              {mcq[deck[cardIdx].id].options.map((opt, i) => {
                                const correct = mcq[deck[cardIdx].id].correct;
                                const revealed = mcqSelected !== null;
                                return (
                                  <StyledMCQOption
                                    key={i}
                                    type="button"
                                    $isSelected={mcqSelected === i}
                                    $isCorrect={i === correct}
                                    $revealed={revealed}
                                    onClick={() => mcqSelected === null && setMcqSelected(i)}
                                    disabled={revealed}>
                                    <span className="letter">{String.fromCharCode(65 + i)}.</span>
                                    {opt}
                                  </StyledMCQOption>
                                );
                              })}
                            </StyledMCQOptions>
                            {mcqSelected !== null && (
                              <>
                                <div className="explanation">{mcq[deck[cardIdx].id].explanation}</div>
                                <div className="rate" style={{ marginTop: 20 }}>
                                  <button
                                    type="button"
                                    className="knew"
                                    onClick={() => {
                                      const right = mcqSelected === mcq[deck[cardIdx].id].correct;
                                      if (quickFormat === 'session') {
                                        rateSessionCard(right);
                                      } else {
                                        rateCard(right);
                                      }
                                    }}>
                                    {mcqSelected === mcq[deck[cardIdx].id].correct
                                      ? '✓ Correct — Next'
                                      : '✗ Wrong — Next'}
                                  </button>
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="question">No MCQ for this card.</div>
                            <button
                              className="reveal"
                              type="button"
                              onClick={() => {
                                if (cardIdx + 1 < deck.length) {
                                  setCardIdx(cardIdx + 1);
                                  setCardFlipped(false);
                                  setMcqSelected(null);
                                } else {
                                  setCardIdx(deck.length);
                                }
                              }}>
                          Skip
                            </button>
                          </>
                        )
                      ) : (
                        <>
                          {quickFormat === 'session' && (
                            <StyledSessionPhase $phase={deck[cardIdx]._kind}>
                              {deck[cardIdx]._kind === 'new' ? '🧠 Test recall' : '🔁 Spaced review'}
                            </StyledSessionPhase>
                          )}
                          <div className="question">{deck[cardIdx].question}</div>
                          {!cardFlipped ? (
                            <button
                              className="reveal"
                              type="button"
                              onClick={() => setCardFlipped(true)}>
                          Tap to reveal answer
                            </button>
                          ) : (
                            <>
                              <div className="answer">{deck[cardIdx].referenceAnswer}</div>
                              <div className="rate">
                                <button
                                  type="button"
                                  className="knew"
                                  onClick={() =>
                                    quickFormat === 'session' ? rateSessionCard(true) : rateCard(true)
                                  }>
                              ✓ Knew it
                                </button>
                                <button
                                  type="button"
                                  className="didnt"
                                  onClick={() =>
                                    quickFormat === 'session' ? rateSessionCard(false) : rateCard(false)
                                  }>
                              ✗ Didn&apos;t
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                </>
              )}
            </StyledQuickCard>
          </StyledQuickOverlay>
        )}

        <StyledHeader>
          <h1>Cortex M4F</h1>
          <p>
            Target: AirPods firmware (Apple Watch secondary) · Daily mission · Spaced repetition
          </p>
        </StyledHeader>

        {/* Bottom tab bar (top nav on desktop) */}
        <StyledTabBar>
          <StyledTab
            $active={activeTab === 'today'}
            onClick={() => {
              setActiveQ(null);
              setActiveTab('today');
            }}
            type="button">
            <span className="icon">🏠</span>
            <span className="lbl">Today</span>
          </StyledTab>
          <StyledTab
            $active={activeTab === 'browse'}
            onClick={() => setActiveTab('browse')}
            type="button">
            <span className="icon">📚</span>
            <span className="lbl">Browse</span>
          </StyledTab>
          <StyledTab
            $active={activeTab === 'practice'}
            onClick={() => {
              setActiveQ(null);
              setActiveTab('practice');
            }}
            type="button">
            <span className="icon">🃏</span>
            <span className="lbl">Practice</span>
          </StyledTab>
          <StyledTab
            $active={activeTab === 'progress'}
            onClick={() => {
              setActiveQ(null);
              setActiveTab('progress');
            }}
            type="button">
            <span className="icon">📊</span>
            <span className="lbl">Progress</span>
          </StyledTab>
        </StyledTabBar>

        <StyledTabBody>
          <HiddenInput ref={fileInputRef} type="file" accept=".json" onChange={handleImport} />

          {/* TODAY TAB */}
          {activeTab === 'today' && (
            <div style={{ padding: '24px 50px', maxWidth: 760, margin: '0 auto' }}>
              <StyledTodayCard>
                <header>
                  <h2>Today&apos;s Mission</h2>
                  <span className="date">
                    {new Date(today).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {' · '}🔥 {streakDays}d streak
                  </span>
                </header>

                <div className="week-grid">
                  {weekGrid.map(d => (
                    <div
                      key={d.date}
                      className={[
                        'day-cell',
                        d.done ? 'done' : '',
                        d.isToday ? 'today' : '',
                        d.isWeekend ? 'weekend' : '',
                        d.isFuture ? 'future' : '',
                        d.isPreStart && !d.done ? 'future' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      title={d.isPreStart ? `${d.date} (pre-start)` : d.date}>
                      <span className="lbl">{d.label}</span>
                      <span className="mark">
                        {d.done
                          ? '✓'
                          : d.isPreStart
                            ? '·'
                            : d.isWeekend
                              ? '–'
                              : d.isToday
                                ? '•'
                                : ' '}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="plan-rows">
                  <div className="plan-tile">
                    <div className="icon">📚</div>
                    <div className="num">{plan.newIds.length}</div>
                    <div className="name">New today</div>
                  </div>
                  <div className="plan-tile">
                    <div className="icon">🔁</div>
                    <div className="num">{plan.reviewIds.length}</div>
                    <div className="name">Due review</div>
                  </div>
                  <div className="plan-tile">
                    <div className="icon">🛠</div>
                    <div className="num">{plan.practicalIds.length}</div>
                    <div className="name">Hands-on</div>
                  </div>
                </div>

                {totalBacklog > plan.reviewIds.length && (
                  <div
                    className="empty-state"
                    style={{
                      background: 'rgba(250, 204, 21, 0.1)',
                      border: '1px solid #facc15',
                      borderRadius: 'var(--border-radius)',
                      padding: '10px 14px',
                      marginBottom: 14,
                      color: '#facc15',
                      textAlign: 'left',
                      fontSize: 12,
                    }}>
                    ⚠ {totalBacklog} reviews piled up — capped at {plan.reviewIds.length} per
                    session. Finish today&apos;s session to shrink the backlog.
                  </div>
                )}

                {isPreStart ? (
                  <>
                    <div
                      className="empty-state"
                      style={{
                        background: 'rgba(100, 255, 218, 0.05)',
                        border: '1px solid rgba(100, 255, 218, 0.3)',
                        borderRadius: 'var(--border-radius)',
                        padding: '14px 16px',
                        marginBottom: 14,
                        textAlign: 'left',
                        color: 'var(--light-slate)',
                      }}>
                      📅 Your prep starts{' '}
                      <strong style={{ color: 'var(--green)' }}>
                        {new Date(studyStartDate).toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </strong>
                      .<br />
                      <small>Today is pre-start — no cards are introduced yet.</small>
                    </div>
                    <button type="button" className="start-btn" onClick={handleStartNow}>
                      Start now (don&apos;t wait)
                    </button>
                  </>
                ) : plan.newIds.length + plan.reviewIds.length > 0 ? (
                  <button type="button" className="start-btn" onClick={startDailySession}>
                    Start Session ({plan.newIds.length + plan.reviewIds.length} cards)
                  </button>
                ) : isWeekendToday && !hasNeverStudied ? (
                  <>
                    <div className="empty-state">
                      Weekend — buffer day. Streak doesn&apos;t break on weekends.
                      <br />
                      <small>Studying now will absorb a missed weekday in this same week.</small>
                    </div>
                    <button
                      type="button"
                      className="start-btn"
                      style={{
                        background: 'transparent',
                        color: 'var(--green)',
                        border: '1px solid var(--green)',
                      }}
                      onClick={() => setWeekendOverride(true)}>
                      Study new cards anyway
                    </button>
                  </>
                ) : (
                  <div className="empty-state">
                    🎉 No cards due today. Come back tomorrow, or use the Practice tab.
                  </div>
                )}

                <div className="pct">
                  Mastered: {histogram[5]} · Strong: {histogram[4]} · Solid: {histogram[3]} ·
                  Familiar: {histogram[2]} · Intro: {histogram[1]} · Unseen: {histogram[0]}
                </div>
              </StyledTodayCard>

              {plan.practicalIds.length > 0 && (
                <StyledTodayPracticals>
                  <h3>🛠 Today&apos;s Hands-On Tasks</h3>
                  {plan.practicalIds.map(qid => {
                    const q = interviewPrepData.flatMap(w => w.questions).find(qq => qq.id === qid);
                    const exs = practical[qid]?.exercises || [];
                    return exs.map((ex, i) => {
                      const key = `${qid}:${i}`;
                      const done = practicalDone[key];
                      return (
                        <div key={key} className={`pract-row ${done ? 'done' : ''}`}>
                          <button
                            type="button"
                            className="pract-check"
                            onClick={() => togglePracticalDaily(qid, i)}
                            aria-label={done ? 'Mark incomplete' : 'Mark complete'}>
                            {done ? '✓' : ''}
                          </button>
                          <div>
                            {ex}
                            <div className="pract-meta">
                              {q?.day} · {q?.topic}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })}
                </StyledTodayPracticals>
              )}

              <StyledCodingCard>
                <h3>
                  💻 Today&apos;s Coding Challenge
                  {todaysCoding && (
                    <span style={{ float: 'right', color: 'var(--slate)', fontSize: 10 }}>
                      {codingCompletedCount}/{codingProblems.length} done
                    </span>
                  )}
                </h3>
                {!todaysCoding ? (
                  <div style={{ color: 'var(--slate)', fontSize: 13, padding: '8px 0' }}>
                    🎉 All {codingProblems.length} coding problems complete. Practice tab → revisit
                    any of them for a refresher.
                  </div>
                ) : (
                  <>
                    <div className="meta">
                      <span className={`diff ${todaysCoding.difficulty}`}>
                        {todaysCoding.difficulty}
                      </span>
                      <span>{todaysCoding.topic}</span>
                      <span>
                        · Problem {todaysCoding.day} of {codingProblems.length}
                      </span>
                    </div>
                    <div className="title">{todaysCoding.title}</div>
                    <p className="problem">{todaysCoding.problem}</p>

                    <div>
                      <button
                        type="button"
                        className="toggle"
                        onClick={() => toggleCodingReveal('hints')}>
                        {codingReveal.hints ? '▾' : '▸'} Hints
                      </button>
                      <button
                        type="button"
                        className="toggle"
                        onClick={() => toggleCodingReveal('solution')}>
                        {codingReveal.solution ? '▾' : '▸'} Solution
                      </button>
                      <button
                        type="button"
                        className="toggle"
                        onClick={() => toggleCodingReveal('pitfalls')}>
                        {codingReveal.pitfalls ? '▾' : '▸'} Pitfalls
                      </button>
                    </div>

                    {codingReveal.hints && (
                      <ul className="list">
                        {todaysCoding.hints.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                    {codingReveal.solution && (
                      <pre>
                        <code>{todaysCoding.solution}</code>
                      </pre>
                    )}
                    {codingReveal.pitfalls && (
                      <ul className="list">
                        {todaysCoding.pitfalls.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    )}

                    {todaysCoding.appleNote && (
                      <div className="apple-note">💡 {todaysCoding.appleNote}</div>
                    )}

                    <div className="actions">
                      <button type="button" className="done-btn" onClick={markCodingDone}>
                        ✓ Mark complete & next
                      </button>
                    </div>
                  </>
                )}
              </StyledCodingCard>
            </div>
          )}

          {/* BROWSE TAB */}
          {activeTab === 'browse' && (
            <>
              <StyledFilterChips>
                <StyledSearchInput
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: 200, flexShrink: 0 }}
                />
                {[
                  { k: 'all', l: `All (${browseList.length})` },
                  { k: 't1', l: 'T1' },
                  { k: 't2', l: 'T2' },
                  { k: 't3', l: 'T3' },
                  { k: 't4', l: 'T4' },
                  { k: 'unseen', l: 'Unseen' },
                  { k: 'weak', l: 'Weak' },
                  { k: 'mastered', l: 'Mastered' },
                  { k: 'stale', l: 'Stale' },
                ].map(c => (
                  <StyledChip
                    key={c.k}
                    $active={browseFilter === c.k}
                    onClick={() => setBrowseFilter(c.k)}
                    type="button">
                    {c.l}
                  </StyledChip>
                ))}
              </StyledFilterChips>

              {activeQuestion && (
                <StyledMobileBackBar>
                  <button type="button" onClick={() => setActiveQ(null)}>
                    ← Back
                  </button>
                  <span className="label">{activeQuestion.topic}</span>
                </StyledMobileBackBar>
              )}

              <StyledPanels>
                <StyledLeftPanel
                  $collapsed={false}
                  style={{ display: activeQuestion ? undefined : undefined }}>
                  {browseList.length === 0 ? (
                    <div
                      style={{
                        padding: 30,
                        textAlign: 'center',
                        color: 'var(--slate)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                      }}>
                      No questions match that filter.
                    </div>
                  ) : (
                    browseList.map(q => {
                      const t = tiers[q.id];
                      const m = studyState[q.id]?.mastery || 0;
                      return (
                        <StyledFlatRow
                          key={q.id}
                          $active={activeQ === q.id}
                          onClick={() => handleSelectQuestion(q)}
                          type="button">
                          <StyledMasteryDot $mastery={m} title={`Mastery ${m}/5`}>
                            {m || ''}
                          </StyledMasteryDot>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="meta">
                              <span>
                                W{q._week} · {q.day}
                              </span>
                              {t && (
                                <StyledTierBadge $color={tierMeta[t].color}>
                                  {tierMeta[t].label}
                                </StyledTierBadge>
                              )}
                              {confidence[q.id] && (
                                <span style={{ fontSize: 12 }}>
                                  {confidence[q.id] === 3
                                    ? '💪'
                                    : confidence[q.id] === 2
                                      ? '😐'
                                      : '😟'}
                                </span>
                              )}
                              {isStale(q.id) && <StyledStaleBadge>⟳ stale</StyledStaleBadge>}
                            </div>
                            <div className="qtxt">{q.question}</div>
                          </div>
                        </StyledFlatRow>
                      );
                    })
                  )}
                </StyledLeftPanel>

                <StyledRightPanel>
                  {!activeQuestion ? (
                    <StyledEmptyState>
                      <div className="icon">📝</div>
                      <div>Pick a question from the list</div>
                      <div style={{ marginTop: 8, fontSize: 12 }}>
                        Filter chips at top narrow the deck. Mastery dot = how solid you are.
                      </div>
                    </StyledEmptyState>
                  ) : (
                    <StyledQuestionDetail>
                      {timerVisible && (
                        <StyledTimerDisplay $seconds={timerSeconds}>
                          <span className="time">{formatTimer(timerSeconds)}</span>
                          <div className="timer-controls">
                            <button
                              className="timer-btn"
                              type="button"
                              onClick={() => setTimerRunning(r => !r)}>
                              {timerRunning ? 'Pause' : 'Start'}
                            </button>
                            <button
                              className="timer-btn"
                              type="button"
                              onClick={() => {
                                setTimerRunning(false);
                                setTimerSeconds(300);
                              }}>
                              Reset
                            </button>
                          </div>
                          {timerSeconds === 0 && (
                            <span
                              style={{
                                color: '#f87171',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 12,
                              }}>
                              Time&apos;s up!
                            </span>
                          )}
                        </StyledTimerDisplay>
                      )}
                      <div className="topic-label">
                        Week{' '}
                        {interviewPrepData.find(w => w.questions.some(q => q.id === activeQ))?.week}{' '}
                        · {activeQuestion.day} — {activeQuestion.topic}
                        {tiers[activeQ] && (
                          <StyledTierBadge
                            $color={tierMeta[tiers[activeQ]].color}
                            style={{ marginLeft: 10 }}
                            title={tierMeta[tiers[activeQ]].description}>
                            {tierMeta[tiers[activeQ]].label} · {tierMeta[tiers[activeQ]].name}
                          </StyledTierBadge>
                        )}
                      </div>
                      <div className="question-text">{activeQuestion.question}</div>

                      <StyledReadingSection>
                        <h3>Reading Material</h3>
                        <ul>
                          {activeQuestion.reading.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </StyledReadingSection>

                      {practical[activeQ] && (
                        <StyledPracticalSection>
                          <h3>🛠 Hands-On — do these, don&apos;t just read</h3>
                          <ol>
                            {practical[activeQ].exercises.map((ex, i) => {
                              const done = practicalDone[`${activeQ}:${i}`];
                              return (
                                <li key={i} className={done ? 'done' : ''}>
                                  <button
                                    type="button"
                                    className="check"
                                    onClick={() => togglePractical(activeQ, i)}
                                    aria-label={done ? 'Mark incomplete' : 'Mark complete'}>
                                    {done ? '✓' : ''}
                                  </button>
                                  {ex}
                                </li>
                              );
                            })}
                          </ol>
                          {practical[activeQ].drill && (
                            <div className="drill">
                              <span className="drill-label">Drill:</span>
                              {practical[activeQ].drill}
                            </div>
                          )}
                        </StyledPracticalSection>
                      )}

                      {activeQuestion.readingNotes && activeQuestion.readingNotes.length > 0 && (
                        <StyledReferenceToggle>
                          <button onClick={() => setShowReading(!showReading)}>
                            {showReading ? '▾ Hide Study Notes' : '▸ Show Study Notes'}
                          </button>
                          {showReading && (
                            <div className="ref-answer" style={{ padding: '20px 20px 12px' }}>
                              <StyledNotesPanel>
                                {activeQuestion.readingNotes.map((section, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      marginBottom:
                                        i < activeQuestion.readingNotes.length - 1 ? 28 : 0,
                                    }}>
                                    <div className="note-source">{section.source}</div>
                                    <MarkdownBlock content={section.content} />
                                  </div>
                                ))}
                              </StyledNotesPanel>
                            </div>
                          )}
                        </StyledReferenceToggle>
                      )}

                      <StyledAnswerSection $saved={saved}>
                        <h3>
                          Your Answer
                          <span className="save-indicator">✓ Saved</span>
                        </h3>
                        <StyledTextarea
                          value={currentDraft}
                          onChange={e => setCurrentDraft(e.target.value)}
                          placeholder="Write your answer from memory... try without looking at the reference first. (Ctrl+S to save)"
                        />
                        <StyledAnswerActions>
                          <StyledActionButton $primary onClick={handleSave}>
                            Save Answer
                          </StyledActionButton>
                          <StyledActionButton onClick={handleDelete} disabled={!answers[activeQ]}>
                            Clear
                          </StyledActionButton>
                        </StyledAnswerActions>

                        <StyledConfidenceSection>
                          <span className="label">Confidence:</span>
                          {[
                            { level: 1, label: 'Low', color: '#f87171' },
                            { level: 2, label: 'Medium', color: '#facc15' },
                            { level: 3, label: 'High', color: '#4ade80' },
                          ].map(c => (
                            <StyledConfidenceBtn
                              key={c.level}
                              $active={confidence[activeQ] === c.level}
                              $color={c.color}
                              onClick={() => handleConfidence(activeQ, c.level)}>
                              {c.label}
                            </StyledConfidenceBtn>
                          ))}
                        </StyledConfidenceSection>
                      </StyledAnswerSection>

                      <SketchPad questionId={activeQ} />

                      <StyledReferenceToggle>
                        <button onClick={() => setShowReference(!showReference)}>
                          {showReference ? '▾ Hide Reference Answer' : '▸ Show Reference Answer'}
                        </button>
                        {showReference && (
                          <div className="ref-answer">{activeQuestion.referenceAnswer}</div>
                        )}
                      </StyledReferenceToggle>
                    </StyledQuestionDetail>
                  )}
                </StyledRightPanel>
              </StyledPanels>
            </>
          )}

          {/* PRACTICE TAB */}
          {activeTab === 'practice' && (
            <div style={{ padding: '24px 50px', maxWidth: 760, margin: '0 auto' }}>
              <h2
                style={{
                  color: 'var(--lightest-slate)',
                  fontSize: 18,
                  fontFamily: 'var(--font-mono)',
                  margin: '0 0 8px',
                }}>
                Free Practice
              </h2>
              <p
                style={{
                  color: 'var(--slate)',
                  fontSize: 13,
                  margin: '0 0 20px',
                  lineHeight: 1.6,
                }}>
                Off-schedule study — no mastery tracking, no streak impact. Pick a mode.
              </p>

              <StyledPracticeCard onClick={() => startQuickMode('flip')} type="button">
                <span className="ic">🃏</span>
                <div className="body">
                  <div className="ttl">Flashcards</div>
                  <div className="desc">
                    Tap-to-reveal cards from the deck. Self-rate. Good for commute or low-focus
                    moments.
                  </div>
                </div>
              </StyledPracticeCard>

              <StyledPracticeCard onClick={() => startQuickMode('mcq')} type="button">
                <span className="ic">🎯</span>
                <div className="body">
                  <div className="ttl">Multiple Choice Quiz</div>
                  <div className="desc">
                    21 hand-written MCQs with explanations. Distractors test discrimination, not
                    just recognition.
                  </div>
                </div>
              </StyledPracticeCard>

              <StyledPracticeCard
                onClick={() => {
                  setActiveTab('today');
                }}
                type="button">
                <span className="ic">💻</span>
                <div className="body">
                  <div className="ttl">
                    Coding Challenges ({codingCompletedCount}/{codingProblems.length})
                  </div>
                  <div className="desc">
                    {codingProblems.length} hand-picked embedded-C problems: bit ops, memory, linked
                    lists, drivers, concurrency. One per study day on the Today tab.
                  </div>
                </div>
              </StyledPracticeCard>

              <StyledPracticeCard
                onClick={() => {
                  setBrowseFilter('stale');
                  setActiveTab('browse');
                }}
                type="button">
                <span className="ic">🔄</span>
                <div className="body">
                  <div className="ttl">
                    Review weak / stale{staleCount > 0 ? ` (${staleCount} stale)` : ''}
                  </div>
                  <div className="desc">
                    Jump to Browse with the stale filter applied — what&apos;s gone cold.
                  </div>
                </div>
              </StyledPracticeCard>

              <StyledPracticeCard
                onClick={() => {
                  setTimerVisible(true);
                  setTimerSeconds(300);
                  setActiveTab('browse');
                }}
                type="button">
                <span className="ic">⏱</span>
                <div className="body">
                  <div className="ttl">Timed practice</div>
                  <div className="desc">
                    5-minute countdown for whiteboard rehearsal. Pick a question after enabling.
                  </div>
                </div>
              </StyledPracticeCard>

              <h3
                style={{
                  color: 'var(--slate)',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  margin: '24px 0 10px',
                }}>
                Free-practice tier filter
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <StyledTierBtn
                  $active={tierFilter === null}
                  onClick={() => setTierFilter(null)}
                  type="button">
                  All
                </StyledTierBtn>
                {[1, 2, 3, 4].map(t => (
                  <StyledTierBtn
                    key={t}
                    $active={tierFilter === t}
                    $color={tierMeta[t].color}
                    title={tierMeta[t].description}
                    onClick={() => setTierFilter(tierFilter === t ? null : t)}
                    type="button">
                    {tierMeta[t].label}
                  </StyledTierBtn>
                ))}
              </div>
            </div>
          )}

          {/* PROGRESS TAB */}
          {activeTab === 'progress' && (
            <div style={{ padding: '24px 50px', maxWidth: 760, margin: '0 auto' }}>
              {studyStartDate && (
                <div
                  style={{
                    padding: '12px 14px',
                    marginBottom: 18,
                    background: 'rgba(35, 53, 84, 0.2)',
                    border: '1px solid var(--lightest-navy)',
                    borderRadius: 'var(--border-radius)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    alignItems: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--slate)',
                  }}>
                  <span>📅 Prep start date:</span>
                  <strong style={{ color: 'var(--green)' }}>
                    {new Date(studyStartDate).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </strong>
                  <input
                    type="date"
                    value={studyStartDate}
                    max={today}
                    onChange={e => e.target.value && handleSetStartDate(e.target.value)}
                    style={{
                      background: 'rgba(2, 12, 27, 0.5)',
                      border: '1px solid var(--lightest-navy)',
                      borderRadius: 'var(--border-radius)',
                      color: 'var(--lightest-slate)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      padding: '4px 8px',
                      colorScheme: 'dark',
                    }}
                  />
                </div>
              )}

              <StyledHeatmap>
                <h3>📅 Activity — last 13 weeks</h3>
                <div className="grid">
                  <div />
                  {heatmapCols.map((_, i) => (
                    <div key={`hdr-${i}`} />
                  ))}
                  {[0, 1, 2, 3, 4, 5, 6].map(rowIdx => (
                    <React.Fragment key={`row-${rowIdx}`}>
                      <div className="row-lbl">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][rowIdx]}</div>
                      {heatmapCols.map((col, ci) => {
                        const cell = col[rowIdx];
                        const preStart = !!(studyStartDate && cell.date < studyStartDate);
                        return (
                          <StyledHeatCell
                            key={`cell-${rowIdx}-${ci}`}
                            $count={cell.count}
                            $today={cell.today}
                            $future={cell.future}
                            $preStart={preStart}
                            title={
                              preStart && !cell.count
                                ? `${cell.date}: pre-start`
                                : `${cell.date}: ${cell.count} ${
                                  cell.count === 1 ? 'item' : 'items'
                                }`
                            }
                          />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
                <div className="legend">
                  Less
                  <StyledHeatCell
                    $count={0}
                    style={{ width: 12, height: 12, aspectRatio: 'unset' }}
                  />
                  <StyledHeatCell
                    $count={1}
                    style={{ width: 12, height: 12, aspectRatio: 'unset' }}
                  />
                  <StyledHeatCell
                    $count={2}
                    style={{ width: 12, height: 12, aspectRatio: 'unset' }}
                  />
                  <StyledHeatCell
                    $count={4}
                    style={{ width: 12, height: 12, aspectRatio: 'unset' }}
                  />
                  <StyledHeatCell
                    $count={6}
                    style={{ width: 12, height: 12, aspectRatio: 'unset' }}
                  />
                  More
                </div>
              </StyledHeatmap>

              <StyledTierProgress>
                <div className="heading">Mastery by tier</div>
                {tierProgress.map(tp => {
                  const meta = tierMeta[tp.tier];
                  const pct = tp.total > 0 ? Math.round((tp.done / tp.total) * 100) : 0;
                  return (
                    <div className="row" key={tp.tier}>
                      <span className="tier-tag" style={{ color: meta.color }}>
                        {meta.label}
                      </span>
                      <span className="name">{meta.name}</span>
                      <div className="bar">
                        <div
                          className="fill"
                          style={{ width: `${pct}%`, background: meta.color }}
                        />
                      </div>
                      <span className="count">
                        {tp.done}/{tp.total}
                      </span>
                    </div>
                  );
                })}
              </StyledTierProgress>

              <StyledTierProgress>
                <div className="heading">Mastery breakdown — all 60 cards</div>
                {[
                  { lvl: 5, name: 'Mastered', color: '#4ade80' },
                  { lvl: 4, name: 'Strong', color: '#86efac' },
                  { lvl: 3, name: 'Solid', color: '#facc15' },
                  { lvl: 2, name: 'Familiar', color: '#fb923c' },
                  { lvl: 1, name: 'Intro', color: '#f87171' },
                  { lvl: 0, name: 'Unseen', color: 'var(--slate)' },
                ].map(b => {
                  const total = histogram.reduce((a, n) => a + n, 0);
                  const pct = total > 0 ? Math.round((histogram[b.lvl] / total) * 100) : 0;
                  return (
                    <div className="row" key={b.lvl}>
                      <span className="tier-tag" style={{ color: b.color }}>
                        L{b.lvl}
                      </span>
                      <span className="name">{b.name}</span>
                      <div className="bar">
                        <div className="fill" style={{ width: `${pct}%`, background: b.color }} />
                      </div>
                      <span className="count">
                        {histogram[b.lvl]}/{total}
                      </span>
                    </div>
                  );
                })}
              </StyledTierProgress>

              {(() => {
                const struggledCount = Object.values(flashcardStats).filter(
                  s => s && s.shown >= 2 && s.knew / s.shown < 0.5,
                ).length;
                if (struggledCount === 0) {
                  return null;
                }
                return (
                  <div
                    style={{
                      padding: '12px 16px',
                      marginBottom: 18,
                      background: 'rgba(248, 113, 113, 0.08)',
                      border: '1px solid #f87171',
                      borderRadius: 'var(--border-radius)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: '#f87171',
                    }}>
                    💢 {struggledCount} weak free-practice card
                    {struggledCount === 1 ? '' : 's'} (shown ≥ 2× with &lt; 50% recall). Practice
                    tab → Flashcards.
                  </div>
                );
              })()}

              <StyledHardwareGuide>
                <div className="title">🔧 Hardware setup — what you actually need</div>
                <div className="sub">
                  Most exercises are written portable. Pick the path that matches what you have.
                </div>
                <details>
                  <summary>I have an EFR32 board (Thunderboard, WSTK, BG22-EK4108A)</summary>
                  <p>
                    Every hands-on maps directly. Use Simplicity Studio + Gecko SDK. CMU, LDMA,
                    EM2/EM3, NVM3 — all native. <code>SLSTK3402A</code> ($30) and
                    <code> BG22-EK4108A</code> ($40) are the cheapest with onboard mic + speaker
                    support.
                  </p>
                </details>
                <details>
                  <summary>
                    I have any other Cortex-M (STM32 Nucleo, RPi Pico, ESP32-S3, nRF52)
                  </summary>
                  <p>
                    ~85% of exercises work as-is. Concepts are universal: pipeline, NVIC, MPU,
                    faults, FreeRTOS, DMA, I2S, SPI, I2C. Skip vendor-specific ones (CMU register
                    names, NVM3, EFR32 EM3 details) — read those instead.
                  </p>
                  <p>
                    <strong>Cheapest pick:</strong> STM32F4 Nucleo (~$15) + a $5 SPH0645 I2S mic.
                    Covers M4F + FPU + I2S without changing any concept.
                  </p>
                </details>
                <details>
                  <summary>I have no hardware</summary>
                  <p>
                    <strong>QEMU</strong> handles M3/M4 well: pipeline behavior, MPU, fault
                    injection, FreeRTOS bring-up, linker scripts.{' '}
                    <code>qemu-system-arm -M mps2-an385 </code> is a solid baseline. Renode is
                    better for multi-peripheral sims (UART, I2C, SPI).
                  </p>
                  <p>
                    Many exercises are pen-and-paper anyway: linker LMA/VMA tracing, CFSR decoding,
                    BCLK math, stack-frame sketches. Don&apos;t skip these — they mirror what gets
                    asked on a whiteboard.
                  </p>
                </details>
              </StyledHardwareGuide>

              <StyledDesktopOnly>
                <div
                  style={{
                    marginTop: 18,
                    padding: 16,
                    background: 'rgba(35, 53, 84, 0.2)',
                    border: '1px solid var(--lightest-navy)',
                    borderRadius: 'var(--border-radius)',
                  }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'var(--green)',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      marginBottom: 12,
                    }}>
                    Data &amp; sync
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <StyledToolbarButton onClick={handleExport}>Export JSON</StyledToolbarButton>
                    <StyledToolbarButton onClick={() => fileInputRef.current?.click()}>
                      Import JSON
                    </StyledToolbarButton>
                    {pin ? (
                      <>
                        <StyledToolbarButton onClick={handleManualSync}>
                          Sync Now
                        </StyledToolbarButton>
                        <StyledToolbarButton onClick={handleDisconnect}>
                          Disconnect Cloud
                        </StyledToolbarButton>
                      </>
                    ) : (
                      <StyledToolbarButton onClick={() => setShowPinModal(true)}>
                        ☁ Connect Cloud
                      </StyledToolbarButton>
                    )}
                  </div>
                  {pin && (
                    <StyledSyncStatus $status={syncStatus} style={{ marginTop: 10 }}>
                      <span className="sync-dot" />
                      {syncStatus === 'syncing' && 'Syncing...'}
                      {syncStatus === 'synced' && 'Synced'}
                      {syncStatus === 'error' && 'Sync failed'}
                      {syncStatus === 'idle' &&
                        (lastSynced
                          ? `Last: ${new Date(lastSynced).toLocaleTimeString()}`
                          : 'Cloud connected')}
                    </StyledSyncStatus>
                  )}
                </div>
              </StyledDesktopOnly>
            </div>
          )}
        </StyledTabBody>
      </StyledContainer>
    </Layout>
  );
};

InterviewPrepPage.propTypes = {
  location: PropTypes.object,
};

export default InterviewPrepPage;
