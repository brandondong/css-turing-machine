import React from 'react';
import ReactDOMServer from 'react-dom/server';
import TuringMachineStateTable from './TuringMachineStateTable.js';
import StaticCSS from './conversionStaticCSS.js';

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
    if (n === 0) {
      for (let i = 0; i < numTapeCells; i++) {
        sb.push(`<label for="t0_${i}" class="t t${n} o${n}"></label>`);
      }
    }
    sb.push('<br>');
    for (let i = 0; i < numTapeCells; i++) {
      sb.push(`<span class="h h${n} o${n}"></span>`);
    }
    sb.push('\n');
  }
}

function addMachineDisplayStyling(sb, config, numTapeCells) {
  for (let n = 0; n < 2; n++) {
    for (let i = 0; i < config.length; i++) {
      sb.push(`#s${n}_${i}:checked~*>#s${n}::before{content:"${i}";}\n`);
    }
    sb.push(`#s${n}_${config.length}:checked~*>#s${n}::before{content:"HALT";}\n`);
  }

  addRuleOffsetAfterChecked(sb, 3 * numTapeCells + config.length + 1, 'span.t0::before{content:"1";}');
  addRuleOffsetAfterChecked(sb, 4 * numTapeCells + config.length + 1, 'label.t0::before{content:"1";}');
  addRuleOffsetAfterChecked(sb, 6 * numTapeCells + config.length + 2, 'span.h0{visibility:visible;}');

  addRuleOffsetAfterChecked(sb, 4 * numTapeCells + 2, 'span.t1::before{content:"1";}');
  addRuleOffsetAfterChecked(sb, 6 * numTapeCells + 3, 'span.h1{visibility:visible;}');
}

function addRuleOffsetAfterChecked(sb, offset, rule) {
  sb.push('*:checked+');
  for (let i = 0; i < offset; i++) {
    sb.push('*+');
  }
  sb.push(rule);
  sb.push('\n');
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

function addPageStyling(sb) {
  sb.push(StaticCSS);
  sb.push('\n');
}