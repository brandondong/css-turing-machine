import React from 'react';
import ReactDOMServer from 'react-dom/server';
import TuringMachineStateTable from './TuringMachineStateTable.js';

export default function toHTML(config, numTapeCells) {
  // Refer to the project's README for a detailed description of how this is supposed to work.
  const numHeadPositionDigits = logTwoCeil(numTapeCells);
  const numStateDigits = logTwoCeil(config.length + 1);

  const sb = [];
  sb.push('<html>\n<head>\n<style>\n');
  addPageStyling(sb);
  addCurrentStateRules(sb, numStateDigits, config);
  sb.push('</style>\n<title>CSS Turing Machine</title>\n</head>\n<body>\n');
  addTuringMachineForm(sb, config);
  addInstructions(sb);
  sb.push('<hr>\n');
  for (let i = 0; i < 2; i++) {
    addCheckboxRow(sb, 'Tape', `t${i}`, numTapeCells);
    addCheckboxRow(sb, 'Head position', `hp${i}`, numHeadPositionDigits);
    addCheckboxRow(sb, 'Current state', `cs${i}`, numStateDigits);
  }
  sb.push('<div id="logic">\n');
  for (let i = 0; i < 2; i++) {
    addLogicLabels(sb, `t${i}`, numTapeCells);
    addLogicLabels(sb, `hp${i}`, numHeadPositionDigits);
    addLogicLabels(sb, `cs${i}`, numStateDigits);
  }
  sb.push('</div>\n');
  sb.push('</body>\n</html>');
  return sb.join('');
}

function addCurrentStateRules(sb, numStateDigits, config) {
  for (let i = 0; i < numStateDigits; i++) {
    for (let stateNum = 0; stateNum < config.length; stateNum++) {
      for (let tapeSymbol = 0; tapeSymbol < 2; tapeSymbol++) {
        addCurrentStateRule(sb, numStateDigits, config, i, stateNum, tapeSymbol);
      }
    }
  }
}

function addCurrentStateRule(sb, numStateDigits, config, bit, stateNum, tapeSymbol) {
  const value = config[stateNum][tapeSymbol].next;
  const num = value === 'HALT' ? config.length : parseInt(value);
  const bitSet = isBitSet(num, numStateDigits - 1 - bit);
  if (bitSet) {

  } else {

  }
}

function isBitSet(n, pos) {
  const mask = 1 << pos;
  return (n & mask) !== 0;
}

function addTuringMachineForm(sb, config) {
  const form = ReactDOMServer.renderToStaticMarkup(<TuringMachineStateTable config={config} />);
  sb.push('<h2>Turing Machine:</h2>\n');
  sb.push(form);
  sb.push('\n');
  sb.push('<p>This page implements the above Turing machine without executing any Javascript or making any network requests!</p>\n');
}

function addInstructions(sb) {
  sb.push('<h2>Instructions:</h2>\n');
  sb.push('<ol>\n');
  sb.push('<li>Select the desired initial tape input. The head position and current state are already initialized to the leftmost position and 0 respectively.</li>\n');
  sb.push('<li>When ready, press the <em>Execute Step</em> button repeatedly to forward the program\'s execution. When the button is highlighted in green, an iteration of the Turing machine (write to tape, move tape, transition state) has finished. When the button is gone, the program has halted.</li>\n');
  sb.push('</ol>\n');
}

// From index.css.
const BODY_STYLING = `body {
  margin: 40px auto;
  max-width: 1000px;
  line-height: 1.6;
  font-size: 18px;
  color: #444;
  padding: 0 10px;
}

h1, h2, h3 {
  line-height: 1.2;
}`;

// From TuringMachineStateTable.css.
const STATE_TABLE_CSS = `.table-overflow {
  overflow-x: auto;
}

.statetable {
  border: 1px solid #a2a9b1;
  border-collapse: collapse;
  text-align: center;
  background-color: #f8f9fa;
  font-family: sans-serif;
  font-size: 14px;
  color: #222;
  line-height: 1.6;
}

.statetable > tbody > tr > th, .statetable > tbody > tr > td {
  border: 1px solid #a2a9b1;
  padding: 0.2em 0.4em;
}

.statetable > tbody > tr > th {
  background-color: #eaecf0;
}

.instruction-labels {
  font-size: 9pt;
}`;

const CHECKBOX_LABEL_STYLING = `input {
  display: none;
}

input + label {
  color: white;
  background-color: rgb(66, 139, 202);
  font-family: "Courier New";
  font-size: 45px;
  padding: 5px 17px;
  margin: 0px 1px;
}

input:not(:checked) + label::before {
  content: "0";
}

input:checked + label::before {
  content: "1";
}

#logic {
  position: relative;
}

#logic > label {
  display: none;
  position: absolute;
  right: 0px;
  margin-bottom: 50px;
  font-size: 20px;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
  line-height: 1.5;
  color: white;
  background-color: #343a40;
  padding: 8px 16px;
  border: 1px solid #343a40;
  border-radius: .3rem;
  cursor: pointer;
}

#logic > label:hover {
  background-color: #23272b;
  border-color: #1d2124;
}

#logic > label::before {
  content: "Execute Step";
}`;

function addPageStyling(sb) {
  sb.push(BODY_STYLING);
  sb.push('\n\n');
  sb.push(STATE_TABLE_CSS);
  sb.push('\n\n');
  sb.push(CHECKBOX_LABEL_STYLING);
  sb.push('\n');
}

function addCheckboxRow(sb, label, id, n) {
  if (n === 0) {
    sb.push(`<h3 id="${id}"></h3>\n`);
    return;
  }
  sb.push(`<h3 id="${id}">${label}:</h3>\n`);
  for (let i = 0; i < n; i++) {
    const checkboxId = `${id}${i}`;
    sb.push(`<input id="${checkboxId}" type="checkbox">`);
    sb.push(`<label for="${checkboxId}"></label>`);
  }
  sb.push('\n');
}

function addLogicLabels(sb, id, n) {
  if (n === 0) {
    return;
  }
  for (let i = 0; i < n; i++) {
    const checkboxId = `${id}${i}`;
    sb.push(`<label for="${checkboxId}"></label>`);
  }
  sb.push('\n');
}

function logTwoCeil(n) {
  return Math.ceil(Math.log2(n));
}