import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Layout } from '@components';
import interviewPrepData from '../data/interviewPrepData';
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

const StyledToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 50px;
  border-bottom: 1px solid rgba(35, 53, 84, 0.5);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    padding: 10px 12px;
    gap: 8px;
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
    padding: 6px 10px;
    font-size: 11px;
  }
`;

const StyledStatsBar = styled.div`
  display: flex;
  gap: 20px;
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--slate);

  span.count {
    color: var(--green);
    font-weight: 600;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    justify-content: space-between;
    font-size: 11px;
    gap: 12px;
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

const StyledMobileToggle = styled.button`
  display: none;
  width: 100%;
  padding: 12px 16px;
  background: rgba(35, 53, 84, 0.3);
  border: none;
  border-bottom: 1px solid rgba(35, 53, 84, 0.5);
  color: var(--green);
  font-family: var(--font-mono);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  position: sticky;
  top: 0;
  z-index: 2;

  @media (max-width: 768px) {
    display: block;
  }
`;

const StyledWeekGroup = styled.div`
  border-bottom: 1px solid rgba(35, 53, 84, 0.3);

  @media (max-width: 768px) {
    &:first-of-type {
      margin-top: 0;
    }
  }
`;

const StyledWeekHeader = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: transparent;
  border: none;
  color: var(--lightest-slate);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  text-align: left;
  letter-spacing: 0.2px;

  &:hover {
    background: rgba(35, 53, 84, 0.3);
  }

  .phase {
    font-size: 12px;
    color: var(--dark-slate);
    font-weight: 400;
    display: block;
    margin-top: 4px;
    letter-spacing: 0;
  }

  .arrow {
    color: var(--green);
    font-size: 12px;
    transition: transform 0.2s ease;
    transform: ${props => (props.$expanded ? 'rotate(90deg)' : 'rotate(0)')};
    flex-shrink: 0;
    margin-left: 10px;
  }
`;

const StyledQuestionList = styled.div`
  display: ${props => (props.$expanded ? 'block' : 'none')};
`;

const StyledQuestionItem = styled.button`
  width: 100%;
  display: block;
  padding: 12px 20px 12px 28px;
  background: ${props => (props.$active ? 'rgba(214, 5, 69, 0.08)' : 'transparent')};
  border: none;
  border-left: 2px solid ${props => (props.$active ? 'var(--green)' : 'transparent')};
  color: ${props => (props.$active ? 'var(--lightest-slate)' : 'var(--light-slate)')};
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
  transition: var(--transition);
  text-align: left;

  &:hover {
    background: rgba(35, 53, 84, 0.2);
    color: var(--lightest-slate);
  }

  .day-label {
    font-family: var(--font-sans);
    font-size: 12px;
    font-weight: 500;
    color: var(--green);
    margin-right: 8px;
  }

  .status-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    margin-right: 8px;
    flex-shrink: 0;
    background: ${props => {
    if (props.$status === 'answered') {
      return '#4ade80';
    }
    if (props.$status === 'partial') {
      return '#facc15';
    }
    return 'var(--dark-slate)';
  }};
  }

  .q-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
    if (match.index > last) {parts.push(text.slice(last, match.index));}
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={k++}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<code key={k++}>{token.slice(1, -1)}</code>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) {parts.push(text.slice(last));}
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

const StyledReviewBtn = styled.button`
  background: ${props => (props.$active ? 'rgba(250, 204, 21, 0.15)' : 'transparent')};
  border: 1px solid ${props => (props.$active ? '#facc15' : 'var(--lightest-navy)')};
  border-radius: var(--border-radius);
  color: ${props => (props.$active ? '#facc15' : 'var(--slate)')};
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 7px 14px;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;

  &:hover {
    color: #facc15;
    border-color: #facc15;
  }

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 11px;
  }
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
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [currentDraft, setCurrentDraft] = useState('');
  const [showReference, setShowReference] = useState(false);
  const [showReading, setShowReading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [leftCollapsed, setLeftCollapsed] = useState(true);

  // Confidence & review state
  const [confidence, setConfidence] = useState({});
  const [lastReviewed, setLastReviewed] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

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
    setExpandedWeeks({ 1: true });

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
  }, [activeQ, currentDraft, answers, cloudPush]);

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

  const toggleWeek = week => {
    setExpandedWeeks(prev => ({ ...prev, [week]: !prev[week] }));
  };

  const getQuestionStatus = id => {
    const text = answers[id];
    if (!text) {
      return 'empty';
    }
    return text.length > 80 ? 'answered' : 'partial';
  };

  // Stats
  const allQuestions = interviewPrepData.flatMap(w => w.questions);
  const totalQ = allQuestions.length;
  const answeredQ = allQuestions.filter(q => answers[q.id] && answers[q.id].length > 80).length;

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

  // Filtered data (review mode shows only stale/low-confidence questions)
  const baseData = reviewMode
    ? interviewPrepData
      .map(week => ({
        ...week,
        questions: week.questions.filter(
          q => isStale(q.id) || !confidence[q.id] || confidence[q.id] <= 1,
        ),
      }))
      .filter(week => week.questions.length > 0)
    : interviewPrepData;

  const filteredData = searchTerm
    ? baseData
      .map(week => ({
        ...week,
        questions: week.questions.filter(
          q =>
            q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
              q.topic.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      }))
      .filter(week => week.questions.length > 0)
    : baseData;

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

        <StyledHeader>
          <h1>Cortex M4F</h1>
          <p>
            Apple Firmware — 60 Q&amp;As across 12 weeks &middot; Write answers from memory for
            retention
          </p>
        </StyledHeader>

        <StyledToolbar>
          <StyledSearchInput
            placeholder="Search questions or topics..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <StyledToolbarButton onClick={handleExport}>Export</StyledToolbarButton>
          <StyledToolbarButton onClick={() => fileInputRef.current?.click()}>
            Import
          </StyledToolbarButton>
          <HiddenInput ref={fileInputRef} type="file" accept=".json" onChange={handleImport} />

          {/* Cloud sync controls */}
          {pin ? (
            <>
              <StyledToolbarButton onClick={handleManualSync}>Sync Now</StyledToolbarButton>
              <StyledToolbarButton onClick={handleDisconnect}>Disconnect</StyledToolbarButton>
              <StyledSyncStatus $status={syncStatus}>
                <span className="sync-dot" />
                {syncStatus === 'syncing' && 'Syncing...'}
                {syncStatus === 'synced' && 'Synced'}
                {syncStatus === 'error' && 'Sync failed'}
                {syncStatus === 'idle' &&
                  (lastSynced
                    ? `Last: ${new Date(lastSynced).toLocaleTimeString()}`
                    : 'Cloud connected')}
              </StyledSyncStatus>
            </>
          ) : (
            <StyledToolbarButton onClick={() => setShowPinModal(true)}>
              ☁ Connect Cloud
            </StyledToolbarButton>
          )}

          <StyledToolbarButton
            onClick={() => {
              setTimerVisible(v => !v);
              if (!timerVisible) {
                setTimerSeconds(300);
                setTimerRunning(false);
              }
            }}>
            ⏱ Timer
          </StyledToolbarButton>
          <StyledReviewBtn $active={reviewMode} onClick={() => setReviewMode(r => !r)}>
            {reviewMode ? '✕ Exit Review' : `🔄 Review${staleCount > 0 ? ` (${staleCount})` : ''}`}
          </StyledReviewBtn>

          <StyledStatsBar>
            <div>
              Answered:{' '}
              <span className="count">
                {answeredQ}/{totalQ}
              </span>
            </div>
            <div>
              Progress:{' '}
              <span className="count">
                {totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0}%
              </span>
            </div>
            {staleCount > 0 && (
              <div>
                Stale:{' '}
                <span className="count" style={{ color: '#facc15' }}>
                  {staleCount}
                </span>
              </div>
            )}
          </StyledStatsBar>
        </StyledToolbar>

        <StyledPanels>
          <StyledLeftPanel $collapsed={leftCollapsed}>
            <StyledMobileToggle onClick={() => setLeftCollapsed(!leftCollapsed)}>
              {leftCollapsed ? '▸ Show Questions' : '▾ Hide Questions'}
            </StyledMobileToggle>
            {filteredData.map(week => (
              <StyledWeekGroup key={week.week}>
                <StyledWeekHeader
                  $expanded={expandedWeeks[week.week]}
                  onClick={() => toggleWeek(week.week)}>
                  <div>
                    Week {week.week}: {week.title}
                    <span className="phase">{week.phase}</span>
                  </div>
                  <span className="arrow">▸</span>
                </StyledWeekHeader>
                <StyledQuestionList $expanded={expandedWeeks[week.week]}>
                  {week.questions.map(q => (
                    <StyledQuestionItem
                      key={q.id}
                      $active={activeQ === q.id}
                      $status={getQuestionStatus(q.id)}
                      onClick={() => handleSelectQuestion(q)}>
                      <span className="status-dot" />
                      {confidence[q.id] && (
                        <span style={{ fontSize: 9, marginRight: 3 }}>
                          {confidence[q.id] === 3 ? '💪' : confidence[q.id] === 2 ? '😐' : '😟'}
                        </span>
                      )}
                      {isStale(q.id) && <StyledStaleBadge>⟳</StyledStaleBadge>}
                      <span className="day-label">{q.day}</span>
                      <span className="q-text">{q.question}</span>
                    </StyledQuestionItem>
                  ))}
                </StyledQuestionList>
              </StyledWeekGroup>
            ))}
          </StyledLeftPanel>

          <StyledRightPanel>
            {!activeQuestion ? (
              <StyledEmptyState>
                <div className="icon">📝</div>
                <div>Select a question from the left panel</div>
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  Try to answer from memory before revealing the reference
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
                        style={{ color: '#f87171', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        Time&apos;s up!
                      </span>
                    )}
                  </StyledTimerDisplay>
                )}
                <div className="topic-label">
                  Week {interviewPrepData.find(w => w.questions.some(q => q.id === activeQ))?.week}{' '}
                  · {activeQuestion.day} — {activeQuestion.topic}
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
                                marginBottom: i < activeQuestion.readingNotes.length - 1 ? 28 : 0,
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
      </StyledContainer>
    </Layout>
  );
};

InterviewPrepPage.propTypes = {
  location: PropTypes.object,
};

export default InterviewPrepPage;
