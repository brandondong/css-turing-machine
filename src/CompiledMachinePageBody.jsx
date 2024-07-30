import React from 'react';
import ReactDOMServer from 'react-dom/server';
import AppLayout from './AppLayout.jsx';
import TuringMachineStateTable from './TuringMachineStateTable.jsx';
import { GITHUB_LINK } from './contants.js';
import indexCSS from './index.css?inline';
import appLayoutCSS from './AppLayout.css?inline';
import turingMachineStateTableCSS from './TuringMachineStateTable.css?inline';
import compiledMachinePageBodyCSS from './CompiledMachinePageBody.css?inline';

function CompiledMachinePageBody({ config, numTapeCells }) {
  return <AppLayout
    main={
      <>
        <h3>Reference:</h3>
        <TuringMachineStateTable config={config} />
        <CompiledTuringMachine config={config} numTapeCells={numTapeCells} />
      </>
    }
    footer={<>This page implements the specified Turing machine without executing any Javascript or making any network requests. <a href={`${GITHUB_LINK}/blob/master/README.md#how-does-it-work`} target="_blank" rel="noopener noreferrer">How does it work?</a></>}
  />
}

const BUFFER_SUFFIX = 'b';
const STATE_PREFIX = 's';
const HEAD_POS_PREFIX = 'h';
const TAPE_VALUE_PREFIX = 't';
const BUFFER_SWITCH_ID = 'd';
const STARTED_ID = 'g';

function CompiledTuringMachine({ config, numTapeCells }) {
  // TURING MACHINE FORMAT:
  // "Started" radio input
  // "Buffer 0 is destination" checkbox input
  // Switch buffer label
  // Buffer 0 state radio inputs
  // Buffer 1 state radio inputs
  // TAPE CELLS
  // Buffer 0 state labels
  // Buffer 1 state labels
  // Start label

  // TAPE CELL FORMAT:
  // Buffer 0 tape head X radio input
  // Buffer 1 tape head X radio input
  // Buffer 0 tape cell X checkbox input
  // Buffer 1 tape cell X checkbox input
  // Buffer 0 tape head X-1 label
  // Buffer 1 tape head X-1 label
  // Buffer 0 tape cell X label
  // Buffer 1 tape cell X label
  // Buffer 0 tape cell X value display (cannot make checkboxes visible or else user can toggle them via mouse/keyboard)
  // Buffer 1 tape cell X value display

  const dynElems = [];
  let counter = 0;

  const numStates = config.length + 1; // User configuration does not include halting state.
  // State radio inputs:
  for (let buffer = 0; buffer < 2; buffer++) {
    for (let stateIdx = 0; stateIdx < numStates; stateIdx++) {
      const inputId = getInputId(buffer, STATE_PREFIX, stateIdx);
      const inputGroup = getInputGroup(buffer, STATE_PREFIX);
      // Initialize with the Turing machine in the first state.
      dynElems.push(<input id={inputId} type="radio" name={inputGroup} defaultChecked={stateIdx === 0} key={counter++} />);
    }
  }

  // Tape cells:
  const halfwayVisibleTape = Math.min(Math.ceil(numTapeCells / 2) - 1, 12);
  // There is an extra dummy tape cell to fit the last tape head label.
  for (let tapeCellIdx = 0; tapeCellIdx < numTapeCells + 1; tapeCellIdx++) {
    const isDummyIdx = tapeCellIdx === numTapeCells;
    // Tape head inputs:
    for (let buffer = 0; buffer < 2; buffer++) {
      if (!isDummyIdx) {
        const tapeHeadInputId = getInputId(buffer, HEAD_POS_PREFIX, tapeCellIdx);
        const tapeHeadInputGroup = getInputGroup(buffer, HEAD_POS_PREFIX);
        // Initialize the head position halfway along the visible tape.
        dynElems.push(<input id={tapeHeadInputId} type="radio" name={tapeHeadInputGroup} defaultChecked={tapeCellIdx === halfwayVisibleTape} key={counter++} />);
      } else {
        // Maintain the relative positioning of elements for the last tape head label.
        dynElems.push(<i key={counter++} />);
      }
    }
    // Tape cell value inputs:
    for (let buffer = 0; buffer < 2; buffer++) {
      if (!isDummyIdx) {
        const tapeValInputId = getInputId(buffer, TAPE_VALUE_PREFIX, tapeCellIdx);
        dynElems.push(<input id={tapeValInputId} type="checkbox" key={counter++} />);
      } else {
        // Maintain the relative positioning of elements for the last tape head label.
        dynElems.push(<i key={counter++} />);
      }
    }
    // Tape head labels:
    for (let buffer = 0; buffer < 2; buffer++) {
      // Tape head labels are offset by 1, the first label is just a dummy element.
      if (tapeCellIdx > 0) {
        const forTapeHeadInputId = getInputId(buffer, HEAD_POS_PREFIX, tapeCellIdx - 1);
        dynElems.push(<label htmlFor={forTapeHeadInputId} key={counter++} />);
      } else {
        dynElems.push(<i key={counter++} />);
      }
    }
    if (!isDummyIdx) {
      // Tape cell value labels:
      for (let buffer = 0; buffer < 2; buffer++) {
        const forTapeValInputId = getInputId(buffer, TAPE_VALUE_PREFIX, tapeCellIdx);
        dynElems.push(<label htmlFor={forTapeValInputId} key={counter++} />);
      }
      // Tape cell value display:
      for (let buffer = 0; buffer < 2; buffer++) {
        dynElems.push(<p key={counter++} />);
      }
    }
  }

  // State labels:
  for (let buffer = 0; buffer < 2; buffer++) {
    for (let stateIdx = 0; stateIdx < numStates; stateIdx++) {
      const forInputId = getInputId(buffer, STATE_PREFIX, stateIdx);
      dynElems.push(<label htmlFor={forInputId} key={counter++} />)
    }
  }
  return <div className="machine">
    <div className="scroll-x">
      <div className="machine-grid">
        <input id={STARTED_ID} type="radio" />
        <input id={BUFFER_SWITCH_ID} type="checkbox" />
        <label htmlFor={BUFFER_SWITCH_ID} />
        {dynElems}
        <label htmlFor={STARTED_ID} />
      </div>
    </div>
  </div>;
}

function getInputId(buffer, prefix, idx) {
  return `${buffer}${BUFFER_SUFFIX}${prefix}${idx}`;
}

function getInputGroup(buffer, prefix) {
  return `${buffer}${BUFFER_SUFFIX}${prefix}`;
}

function getCompiledMachinePageBody(config, numTapeCells) {
  return ReactDOMServer.renderToStaticMarkup(<CompiledMachinePageBody config={config} numTapeCells={numTapeCells} />);
}

function getCompiledMachinePageStyles(config) {
  const staticStyles = indexCSS +
    appLayoutCSS +
    turingMachineStateTableCSS +
    compiledMachinePageBodyCSS
      .replaceAll('STARTED_ID', STARTED_ID)
      .replaceAll('TAPE_VALUE_PREFIX', TAPE_VALUE_PREFIX)
      .replaceAll('BUFFER_SUFFIX', BUFFER_SUFFIX);
  return staticStyles;
  // Refer to the project's README for a detailed description of how this is supposed to work.
  // addMachineDisplayStyling(sb, config);
  // addToggleLabelStyling(sb, config);
  // addStateLabelStyling(sb, config);
  // addTapeCellStyling(sb, config);
  // addHeadPosStyling(sb, config);
}

export default function toHTML(config, numTapeCells) {
  return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8"/>\n<style>\n' +
    getCompiledMachinePageStyles(config) +
    '\n</style>\n<title>CSS Turing Machine</title>\n</head>\n<body>\n' +
    getCompiledMachinePageBody(config, numTapeCells) +
    '\n</body>\n</html>';
}