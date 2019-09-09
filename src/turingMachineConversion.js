import React from 'react';
import ReactDOMServer from 'react-dom/server';
import TuringMachineStateTable from './TuringMachineStateTable.js';

export default function toHTML(config, numTapeCells) {
  // Refer to the project's README for a detailed description of how this is supposed to work.
  const sb = [];
  sb.push('<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8"/>\n<style>\n');
  addPageStyling(sb);
  addMachineDisplayStyling(sb, config, numTapeCells);
  sb.push('</style>\n<title>CSS Turing Machine</title>\n</head>\n<body>\n');
  addTuringMachineForm(sb, config);
  addInstructions(sb);
  sb.push('<hr>\n<div id="machine">\n');
  addStateInputs(sb, config, numTapeCells);
  addInputUI(sb, numTapeCells);
  sb.push('</div>\n</body>\n</html>');
  return sb.join('');
}

function addStateInputs(sb, config, numTapeCells) {
  sb.push('<input type="checkbox" id="s"><input type="checkbox" id="f">');
  for (let i = 0; i < 2; i++) {
    for (let state = 0; state < config.length + 1; state++) {
      const checked = state === 0 ? 'checked ' : '';
      sb.push(`<input type="radio" ${checked}name="s${i}" id="s${i}_${state}">`);
    }
    for (let pos = 0; pos < numTapeCells; pos++) {
      const checked = pos === 0 ? 'checked ' : '';
      sb.push(`<input type="radio" ${checked}name="h${i}" id="h${i}_${pos}">`);
    }
    for (let idx = 0; idx < numTapeCells; idx++) {
      sb.push(`<input type="checkbox" id="t${i}_${idx}">`);
    }
  }
  sb.push('\n');
}

function addInputUI(sb, numTapeCells) {
  for (let n = 0; n < 2; n++) {
    sb.push(`<p class="o${n}">State: <span id="s${n}"></span></p>`);
    for (let i = 0; i < numTapeCells; i++) {
      sb.push(`<span class="t t${n} o${n}"></span>`);
    }
    sb.push('<br>\n');
    for (let i = 0; i < numTapeCells; i++) {
      sb.push(`<span class="h h${n} o${n}"></span>`);
    }
    sb.push('\n');
  }
}

function addMachineDisplayStyling(sb, config, numTapeCells) {
  for (let n = 0; n < 2; n++) {
    for (let i = 0; i < config.length; i++) {
      sb.push(`#s${n}_${i}:checked~*>#s${n}::before { content: "${i}"; }\n`);
    }
    sb.push(`#s${n}_${config.length}:checked~*>#s${n}::before { content: "HALT"; }\n`);
  }
  sb.push('*:checked+');
  for (let i = 0; i < 3 * numTapeCells + config.length + 1; i++) {
    sb.push('*+');
  }
  sb.push('span.t0::before { content: "1"; }\n');
  sb.push('*:checked+');
  for (let i = 0; i < 5 * numTapeCells + config.length + 2; i++) {
    sb.push('*+');
  }
  sb.push('span.h0 { visibility: visible; }\n');

  sb.push('*:checked+');
  for (let i = 0; i < 3 * numTapeCells + 2; i++) {
    sb.push('*+');
  }
  sb.push('span.t1::before { content: "1"; }\n');
  sb.push('*:checked+');
  for (let i = 0; i < 5 * numTapeCells + 3; i++) {
    sb.push('*+');
  }
  sb.push('span.h1 { visibility: visible; }\n');
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
  sb.push('<li>Select the desired initial tape input.</li>\n');
  sb.push('<li>When ready, press the <em>Start</em> button.</li>\n');
  sb.push('<li>Press the <em>Execute Step</em> button repeatedly to forward the program\'s execution. When the button is gone, the program has halted.</li>\n');
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

const INPUT_LABEL_STYLING = `input, label {
  display: none;
}

#machine {
  overflow: auto;
  white-space: nowrap;
}

#f:not(:checked) ~ .o0 {
  opacity: 0.5;
}

#f:checked ~ .o1 {
  opacity: 0.5;
}

#s:not(:checked) ~ .o0 {
  opacity: 1;
}

#s:not(:checked) ~ .o1 {
  display: none;
}

span.t {
  color: white;
  background-color: rgb(66, 139, 202);
  font-family: "Courier New";
  font-size: 28px;
  padding: 5px 12px;
  margin: 0px 1px;
}

span.t::before {
  content: "0";
}

span.h {
  position: relative;
  top: -18px;
  visibility: hidden;
  font-family: "Courier New";
  font-size: 28px;
  padding: 5px 12px;
  margin: 0px 1px;
}

span.h::before {
  content: "▲";
}

label {
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

label:hover {
  background-color: #23272b;
  border-color: #1d2124;
}

label::before {
  content: "Execute Step";
}`;

function addPageStyling(sb) {
  sb.push(BODY_STYLING);
  sb.push('\n\n');
  sb.push(STATE_TABLE_CSS);
  sb.push('\n\n');
  sb.push(INPUT_LABEL_STYLING);
  sb.push('\n\n');
}