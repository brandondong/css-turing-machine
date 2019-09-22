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
  addToggleLabelStyling(sb, config);
  addStateLabelStyling(sb, config, numTapeCells);
  addTapeCellStyling(sb, config, numTapeCells);
  addHeadPosStyling(sb, config, numTapeCells);
  sb.push('</style>\n<title>CSS Turing Machine</title>\n</head>\n<body>\n');
  addCompiledMachinePageBody(sb, config, numTapeCells);
  sb.push('</body>\n</html>');
  return sb.join('');
}

function addHeadPosStyling(sb, config, numTapeCells) {
  if (numTapeCells === 1) {
    return;
  }
  for (let i = 0; i < config.length; i++) {
    const state = config[i];
    for (let read = 0; read < 2; read++) {
      const dir = state[read].move;
      sb.push(`#s:checked~#f:not(:checked)~#s0_${i}:checked~`);
      if (dir === 'L') {
        sb.push('[name=h0]:checked+[name=h0]');
        sb.push('+*'.repeat(numTapeCells - 2));
      } else {
        sb.push('[name=h0]+[name=h0]:checked');
        sb.push('+*'.repeat(numTapeCells - 1));
      }
      if (read === 0) {
        sb.push('+:not(:checked)');
      } else {
        sb.push('+:checked');
      }
      if (dir === 'L') {
        sb.push('+*'.repeat(numTapeCells));
      } else {
        sb.push('+*'.repeat(numTapeCells - 2));
      }
      sb.push('+:not(:checked)');
      sb.push('+*'.repeat(4 * numTapeCells + 2 * config.length + 3));
      sb.push('{display:inline;}\n');
    }
  }
  for (let i = 0; i < config.length; i++) {
    const state = config[i];
    for (let read = 0; read < 2; read++) {
      const dir = state[read].move;
      sb.push(`#f:checked~#s0_${i}:checked~:not(:checked)`);
      if (dir === 'L') {
        sb.push('+*'.repeat(2 * numTapeCells - 2));
        sb.push('+[name=h1]:checked+[name=h1]');
        sb.push('+*'.repeat(numTapeCells - 2));
      } else {
        sb.push('+*'.repeat(2 * numTapeCells));
        sb.push('+[name=h1]+[name=h1]:checked');
        sb.push('+*'.repeat(numTapeCells - 1));
      }
      if (read === 0) {
        sb.push('+:not(:checked)');
      } else {
        sb.push('+:checked');
      }
      if (dir === 'L') {
        sb.push('+*'.repeat(numTapeCells + config.length + 3));
      } else {
        sb.push('+*'.repeat(numTapeCells + config.length + 1));
      }
      sb.push('{display:inline;}\n');
    }
  }
}

function addTapeCellStyling(sb, config, numTapeCells) {
  for (let i = 0; i < 2; i++) {
    sb.push('#s:checked~#f:not(:checked)~[name=h0]:not(:checked)');
    sb.push('+*'.repeat(numTapeCells - 1));
    if (i === 0) {
      sb.push('+:checked');
    } else {
      sb.push('+:not(:checked)');
    }
    sb.push('+*'.repeat(2 * numTapeCells - 1));
    if (i === 0) {
      sb.push('+:not(:checked)');
    } else {
      sb.push('+:checked');
    }
    sb.push('+*'.repeat(4 * numTapeCells + 2 * config.length + 3));
    sb.push('{display:inline;}\n');
  }
  for (let i = 0; i < 2; i++) {
    sb.push('#f:checked~');
    if (i === 0) {
      sb.push(':not(:checked)');
    } else {
      sb.push(':checked');
    }
    sb.push('+*'.repeat(numTapeCells - 1));
    sb.push('+[name=h1]:not(:checked)');
    sb.push('+*'.repeat(numTapeCells - 1));
    if (i === 0) {
      sb.push('+:checked');
    } else {
      sb.push('+:not(:checked)');
    }
    sb.push('+*'.repeat(2 * numTapeCells + config.length + 2));
    sb.push('{display:inline;}\n');
  }
  for (let i = 0; i < config.length; i++) {
    const state = config[i];
    for (let read = 0; read < 2; read++) {
      const write = state[read].write;
      sb.push(`#s:checked~#f:not(:checked)~#s0_${i}:checked~[name=h0]:checked`);
      sb.push('+*'.repeat(numTapeCells - 1));
      if (read === 0) {
        sb.push('+:not(:checked)');
      } else {
        sb.push('+:checked');
      }
      sb.push('+*'.repeat(2 * numTapeCells - 1));
      if (write === '0') {
        sb.push('+:checked');
      } else {
        sb.push('+:not(:checked)');
      }
      sb.push('+*'.repeat(4 * numTapeCells + 2 * config.length + 3));
      sb.push('{display:inline;}\n');
    }
  }
  for (let i = 0; i < config.length; i++) {
    const state = config[i];
    for (let read = 0; read < 2; read++) {
      const write = state[read].write;
      sb.push(`#f:checked~#s1_${i}:checked~`);
      if (write === '0') {
        sb.push(':checked');
      } else {
        sb.push(':not(:checked)');
      }
      sb.push('+*'.repeat(numTapeCells - 1));
      sb.push('+[name=h1]:checked');
      sb.push('+*'.repeat(numTapeCells - 1));
      if (read === 0) {
        sb.push('+:not(:checked)');
      } else {
        sb.push('+:checked');
      }
      sb.push('+*'.repeat(2 * numTapeCells + config.length + 2));
      sb.push('{display:inline;}\n');
    }
  }
}

function addStateLabelStyling(sb, config, numTapeCells) {
  for (let n = 0; n < 2; n++) {
    const inverseN = 1 - n;
    for (let i = 0; i < config.length; i++) {
      const state = config[i];
      for (let read = 0; read < 2; read++) {
        const nextNum = getNextState(state, read, config);
        if (n === 0) {
          sb.push(`#s:checked~#f:not(:checked)~#s0_${i}:checked~#s1_${nextNum}:not(:checked)`);
        } else {
          sb.push(`#f:checked~#s0_${nextNum}:not(:checked)~#s1_${i}:checked`);
        }
        sb.push(`~[name=h${n}]:checked`);
        sb.push('+*'.repeat(numTapeCells - 1));
        if (read === 0) {
          sb.push('+:not(:checked)');
        } else {
          sb.push('+:checked');
        }
        sb.push(`~[for=s${inverseN}_${nextNum}]{display:inline;}\n`);
      }
    }
  }
}

function addToggleLabelStyling(sb, config) {
  const haltingState = config.length;
  sb.push(`#s:checked~#s0_${haltingState}:not(:checked)~#s1_${haltingState}:not(:checked)~[for=f]{display:inline;}\n`);
}

function getNextState(state, read, config) {
  const next = state[read].next;
  const index = config.findIndex(s => s.name === next);
  return index === -1 ? config.length : index;
}

function addMachineDisplayStyling(sb, config, numTapeCells) {
  addStateDisplayStyling(sb, config);
  addInputUIStyling(sb, config, numTapeCells);
  addShowCurrentInputsStyling(sb, config, numTapeCells);
  addOpacitySectionStyling(sb, config, numTapeCells);
  addLogicLabelLookStyling(sb, config, numTapeCells);
}

function addShowCurrentInputsStyling(sb, config, numTapeCells) {
  const halfway = Math.ceil(numTapeCells / 2) - 1;
  sb.push(`#s:not(:checked)~[for=t0_${halfway}]{visibility:visible;}\n`);

  addRuleOffsetAfterChecked(sb, 7 * numTapeCells + 2 * config.length + 4, '::before{content:"1";}', '[id^=t0_]');
  addRuleOffsetAfterChecked(sb, 9 * numTapeCells + 2 * config.length + 5, '*{visibility:visible;}', '[name=h0]');

  addRuleOffsetAfterChecked(sb, 7 * numTapeCells + 2 * config.length + 6, '::before{content:"1";}', '[id^=t1_]');
  addRuleOffsetAfterChecked(sb, 9 * numTapeCells + 2 * config.length + 7, '*{visibility:visible;}', '[name=h1]');
}

function addInputUIStyling(sb, config, numTapeCells) {
  const t0Start = getNumInputsAndLogicLabels(config, numTapeCells) + 2;
  const t0End = t0Start - 1 + numTapeCells;
  const t1Start = t0End + 3 + numTapeCells;
  const t1End = t1Start - 1 + numTapeCells;

  const h0Start = t0End + 2;
  const h0End = h0Start - 1 + numTapeCells;
  const h1Start = t1End + 2;
  const h1End = h1Start - 1 + numTapeCells;

  sb.push(`:nth-child(n+${t0Start}):nth-child(-n+${t0End})::before,:nth-child(n+${t1Start}):nth-child(-n+${t1End})::before{content:"0";}\n`);
  sb.push(`:nth-child(n+${t0Start}):nth-child(-n+${t0End}),:nth-child(n+${t1Start}):nth-child(-n+${t1End}){color:white;background-color:rgb(66, 139, 202);font-family:"Courier New";font-size:28px;padding:5px 12px;margin:0px 1px;}\n`);

  sb.push(`:nth-child(n+${h0Start}):nth-child(-n+${h0End})::before,:nth-child(n+${h1Start}):nth-child(-n+${h1End})::before{content:"▲";}\n`);
  sb.push(`:nth-child(n+${h0Start}):nth-child(-n+${h0End}),:nth-child(n+${h1Start}):nth-child(-n+${h1End}){position:relative;top:-18px;visibility:hidden;font-family:"Courier New";font-size:28px;margin:0px 13px;}\n`);

  sb.push(`#s:checked~:nth-child(n+${t0Start}):nth-child(-n+${h0End}){pointer-events:none;}\n`);
}

function addOpacitySectionStyling(sb, config, numTapeCells) {
  const s0Start = getNumInputsAndLogicLabels(config, numTapeCells) + 1;
  const s0End = s0Start + 2 * numTapeCells + 1;
  sb.push(`#s:checked~#f:not(:checked)~:nth-child(n+${s0Start}):nth-child(-n+${s0End}){opacity:0.5;}\n`);
  const s1Start = s0End + 1;
  const s1End = s1Start + 2 * numTapeCells + 1;
  sb.push(`#f:checked~:nth-child(n+${s1Start}):nth-child(-n+${s1End}){opacity:0.5;}\n`);
  sb.push(`#s:not(:checked)~:nth-child(n+${s1Start}):nth-child(-n+${s1End}){display:none;}\n`);
}

function addLogicLabelLookStyling(sb, config, numTapeCells) {
  const num = getNumInputsAndLogicLabels(config, numTapeCells);
  sb.push(`label:nth-child(-n+${num - 1})::before{content:"Execute Step";}\n`);
  sb.push(`label:nth-child(-n+${num}):hover{background-color:#218838;border-color:#1e7e34;}\n`);
  sb.push(`label:nth-child(-n+${num}){display:none;position:absolute;left:0px;top:330px;font-size:16px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";line-height:1.5;color:white;background-color:#28a745;padding:6px 12px;border:1px solid #28a745;border-radius:.25rem;}\n`);
}

function getNumInputsAndLogicLabels(config, numTapeCells) {
  return 2 * (2 + 2 * (config.length + 1) + 4 * numTapeCells);
}

function addStateDisplayStyling(sb, config) {
  for (let n = 0; n < 2; n++) {
    for (let i = 0; i <= config.length; i++) {
      let name;
      if (i === config.length) {
        name = 'HALT';
      } else {
        name = config[i].name;
      }
      const pId = n === 0 ? '[for=s]+p' : 'p~p';
      sb.push(`#s${n}_${i}:checked~${pId}::after{content:"${name}";}\n`);
    }
  }
}

function addRuleOffsetAfterChecked(sb, offset, rule, prefix) {
  sb.push(prefix);
  sb.push(':checked+');
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