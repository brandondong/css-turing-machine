import React from 'react';
import ReactDOMServer from 'react-dom/server';
import CompiledMachinePageBody from './CompiledMachinePageBody.js';
import StaticCSS from './conversionStaticCSS.js';

export default function toHTML(config, numTapeCells) {
  // Refer to the project's README for a detailed description of how this is supposed to work.
  const sb = [];
  sb.push('<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8"/>\n<style>\n');
  addPageStyling(sb);
  addMachineDisplayStyling(sb, config, numTapeCells);
  addStateLabelStyling(sb, config, numTapeCells);
  sb.push('</style>\n<title>CSS Turing Machine</title>\n</head>\n<body>\n');
  addCompiledMachinePageBody(sb, config, numTapeCells);
  sb.push('</body>\n</html>');
  return sb.join('');
}

function addStateLabelStyling(sb, config, numTapeCells) {
  for (let i = 0; i < config.length; i++) {
    const state = config[i];
    for (let read = 0; read < 2; read++) {
      const next = parseInt(state[read].next);
      const nextNum = isNaN(next) ? config.length : next;
      sb.push(`#s:checked~#f:not(:checked)~#s0_${i}:checked~[name=h0]:checked`);
      sb.push('+*'.repeat(numTapeCells - 1));
      if (read === 0) {
        sb.push('+*:not(:checked)');
      } else {
        sb.push('+*:checked');
      }
      sb.push(`~#s1_${nextNum}:not(:checked)~#ls1_${nextNum}{display:inline;}\n`);
    }
  }
}

function addMachineDisplayStyling(sb, config, numTapeCells) {
  const haltingState = config.length;
  sb.push(`#s:checked~#s0_${haltingState}:not(:checked)~#s1_${haltingState}:not(:checked)~label.toggle{display:inline;}\n`);

  addStateDisplayStyling(sb, config);

  addRuleOffsetAfterChecked(sb, 7 * numTapeCells + 3 * config.length + 5, 'span.t0::before{content:"1";}');
  addRuleOffsetAfterChecked(sb, 8 * numTapeCells + 3 * config.length + 5, 'label.t0::before{content:"1";}');
  addRuleOffsetAfterChecked(sb, 10 * numTapeCells + 3 * config.length + 7, 'span.h0{visibility:visible;}');

  addRuleOffsetAfterChecked(sb, 8 * numTapeCells + 2 * config.length + 7, 'span.t1::before{content:"1";}');
  addRuleOffsetAfterChecked(sb, 10 * numTapeCells + 2 * config.length + 8, 'span.h1{visibility:visible;}');
}

function addStateDisplayStyling(sb, config) {
  for (let n = 0; n < 2; n++) {
    for (let i = 0; i < config.length; i++) {
      sb.push(`#s${n}_${i}:checked~*>#s${n}::before{content:"${i}";}\n`);
    }
    sb.push(`#s${n}_${config.length}:checked~*>#s${n}::before{content:"HALT";}\n`);
  }
}

function addRuleOffsetAfterChecked(sb, offset, rule) {
  sb.push('*:checked+');
  for (let i = 0; i < offset; i++) {
    sb.push('*+');
  }
  sb.push(rule);
  sb.push('\n');
}

function addCompiledMachinePageBody(sb, config, numTapeCells) {
  const form = ReactDOMServer.renderToStaticMarkup(<CompiledMachinePageBody config={config} numTapeCells={numTapeCells} />);
  sb.push(form);
  sb.push('\n');
}

function addPageStyling(sb) {
  sb.push(StaticCSS);
  sb.push('\n');
}