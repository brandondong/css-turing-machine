import React from 'react';
import ReactDOMServer from 'react-dom/server';
import TuringMachineStateTable from './TuringMachineStateTable.js';

export default function toHTML(config, numTapeCells) {
  // Refer to the project's README for a detailed description of how this is supposed to work.
  const numHeadPositionDigits = logTwoCeil(numTapeCells);
  const numStateDigits = logTwoCeil(config.length);

  const sb = [];
  sb.push('<html>\n<head>\n<style>\n');
  addPageStyling(sb);
  sb.push('</style>\n<title>CSS Turing Machine</title>\n</head>\n<body>\n');
  addTuringMachineForm(sb, config);
  addInstructions(sb);
  sb.push('<hr>\n');
  for (let i = 0; i < 2; i++) {
    addCheckboxRow(sb, 'Tape', `t${i}`, numTapeCells);
    addCheckboxRow(sb, 'Head position', `hp${i}`, numHeadPositionDigits);
    addCheckboxRow(sb, 'Current state', `cs${i}`, numStateDigits);
  }
  sb.push('<hr>\n');
  // Start button.
  sb.push('</body>\n</html>');
  return sb.join('');
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
  sb.push('<li>Press the <em>Start</em> button when ready.</li>\n');
  sb.push('<li>Press the <em>Execute Step</em> button repeatedly to forward the program\'s execution. When the area is highlighted in green, an iteration of the Turing machine has finished. When the area is highlighted in red, the program has halted.</li>\n');
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

label {
  color: white;
  background-color: rgb(66, 139, 202);
  font-family: "Courier New";
  font-size: 45px;
  padding: 5px 17px;
  margin: 0px 1px;
}

label::before {
  content: "0";
}

input:checked + label::before {
  content: "1";
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

function logTwoCeil(n) {
  return Math.ceil(Math.log2(n));
}