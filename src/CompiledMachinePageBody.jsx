import ReactDOMServer from 'react-dom/server';
import AppLayout from './AppLayout.jsx';
import TuringMachineStateTable from './TuringMachineStateTable.jsx';
import { GITHUB_LINK } from './contants.js';
import { select, id, checked, unchecked, attr, attrContains } from './selector.js';
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

const BUFFER_PREFIX0 = 'a';
const BUFFER_PREFIX1 = 'b';
const STATE_PREFIX = 's';
const HEAD_POS_PREFIX = 'h';
const TAPE_VALUE_PREFIX = 't';
const BUFFER_SWITCH_ID = 'd';
const STARTED_ID = 'g';

function CompiledTuringMachine({ config, numTapeCells }) {
  // TURING MACHINE FORMAT:
  // "Started" radio input
  // "Buffer 0 is destination" checkbox input
  // State radio inputs (interleaved between buffers)
  // Switch buffer label
  // TAPE CELLS
  // State labels (interleaved between buffers)
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

  const elems = [];
  let counter = 0;

  elems.push(<input id={STARTED_ID} type="radio" key={counter++} />);
  elems.push(<input id={BUFFER_SWITCH_ID} type="checkbox" key={counter++} />);

  const numStates = config.length + 1; // User configuration does not include halting state.
  // State radio inputs:
  for (let stateIdx = 0; stateIdx < numStates; stateIdx++) {
    for (let buffer = 0; buffer < 2; buffer++) {
      const inputId = getInputId(buffer, STATE_PREFIX, stateIdx);
      const inputGroup = getInputGroup(buffer, STATE_PREFIX);
      // Initialize with the Turing machine in the first state.
      elems.push(<input id={inputId} type="radio" name={inputGroup} defaultChecked={stateIdx === 0} key={counter++} />);
    }
  }

  elems.push(<label htmlFor={BUFFER_SWITCH_ID} key={counter++} />);

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
        elems.push(<input id={tapeHeadInputId} type="radio" name={tapeHeadInputGroup} defaultChecked={tapeCellIdx === halfwayVisibleTape} key={counter++} />);
      } else {
        // Maintain the relative positioning of elements for the last tape head label.
        elems.push(<i key={counter++} />);
      }
    }
    // Tape cell value inputs:
    for (let buffer = 0; buffer < 2; buffer++) {
      if (!isDummyIdx) {
        const tapeValInputId = getInputId(buffer, TAPE_VALUE_PREFIX, tapeCellIdx);
        elems.push(<input id={tapeValInputId} type="checkbox" key={counter++} />);
      } else {
        // Maintain the relative positioning of elements for the last tape head label.
        elems.push(<i key={counter++} />);
      }
    }
    // Tape head labels:
    for (let buffer = 0; buffer < 2; buffer++) {
      // Tape head labels are offset by 1, the first label is just a dummy element.
      if (tapeCellIdx > 0) {
        const forTapeHeadInputId = getInputId(buffer, HEAD_POS_PREFIX, tapeCellIdx - 1);
        elems.push(<label htmlFor={forTapeHeadInputId} key={counter++} />);
      } else {
        elems.push(<i key={counter++} />);
      }
    }
    if (!isDummyIdx) {
      // Tape cell value labels:
      for (let buffer = 0; buffer < 2; buffer++) {
        const forTapeValInputId = getInputId(buffer, TAPE_VALUE_PREFIX, tapeCellIdx);
        elems.push(<label htmlFor={forTapeValInputId} key={counter++} />);
      }
      // Tape cell value display:
      for (let buffer = 0; buffer < 2; buffer++) {
        elems.push(<p key={counter++} />);
      }
    }
  }

  // State labels:
  for (let stateIdx = 0; stateIdx < numStates; stateIdx++) {
    for (let buffer = 0; buffer < 2; buffer++) {
      const forInputId = getInputId(buffer, STATE_PREFIX, stateIdx);
      elems.push(<label htmlFor={forInputId} key={counter++} />)
    }
  }

  elems.push(<label htmlFor={STARTED_ID} key={counter++} />)

  return <div className="machine">
    <div className="scroll-x">
      <div className="machine-grid">
        {elems}
      </div>
    </div>
  </div>;
}

function getInputId(buffer, prefix, idx) {
  return `${getInputGroup(buffer, prefix)}${idx}`;
}

function getInputGroup(buffer, prefix) {
  return `${getBufferPrefix(buffer)}${prefix}`;
}

function getBufferPrefix(buffer) {
  return buffer === 0 ? BUFFER_PREFIX0 : BUFFER_PREFIX1;
}

export default function toHTML(config, numTapeCells) {
  return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8"/>\n<style>\n' +
    getCompiledMachinePageStyles(config) +
    '\n</style>\n<title>CSS Turing Machine</title>\n</head>\n<body>\n' +
    getCompiledMachinePageBody(config, numTapeCells) +
    '\n</body>\n</html>';
}

function getCompiledMachinePageBody(config, numTapeCells) {
  return ReactDOMServer.renderToStaticMarkup(<CompiledMachinePageBody config={config} numTapeCells={numTapeCells} />);
}

function getCompiledMachinePageStyles(config) {
  const staticStyles = indexCSS +
    appLayoutCSS +
    turingMachineStateTableCSS +
    compiledMachinePageBodyCSS // CSS file uses the longer, more descriptive names before getting substituted here.
      .replaceAll('STARTED_ID', STARTED_ID)
      .replaceAll('TAPE_VALUE_PREFIX', TAPE_VALUE_PREFIX)
      .replaceAll('BUFFER_PREFIX0', BUFFER_PREFIX0)
      .replaceAll('BUFFER_PREFIX1', BUFFER_PREFIX1)
      .replaceAll('HEAD_POS_PREFIX', HEAD_POS_PREFIX)
      .replaceAll('BUFFER_SWITCH_ID', BUFFER_SWITCH_ID);

  // Refer to the project's README for a detailed description of how this is supposed to work.
  const dynStyles = [];
  addBufferSwitchLabelStyling(dynStyles, config);
  addStateDisplayStyling(dynStyles, config);
  addStateLabelStyling(dynStyles, config);
  addTapeCellValueLabelStyling(dynStyles, config);
  addHeadPositionLabelStyling(dynStyles, config);

  return staticStyles + '\n' + dynStyles.join('\n');
}

function addBufferSwitchLabelStyling(sb, config) {
  // Show the buffer switch label if we're not in the halting state.
  const haltingState = config.length;
  const b0HaltingStateInputId = getInputId(0, STATE_PREFIX, haltingState);

  const showBufferSwitchLabel = select(id(b0HaltingStateInputId).unchecked(), '+', unchecked(), '~', attr('for', BUFFER_SWITCH_ID))
    .displayBlock();
  sb.push(showBufferSwitchLabel);
}

function addStateDisplayStyling(sb, config) {
  const stateNames = getOrderedStateNames(config);
  stateNames.forEach((stateName, idx) => {
    const b0StateInputId = getInputId(0, STATE_PREFIX, idx);
    const b1StateInputId = getInputId(1, STATE_PREFIX, idx);

    const displayStateNameTop = select(id(b0StateInputId).checked(), '~', 'p', '+', 'i::after')
      .content(stateName);
    const displayStateNameBottom = select(id(STARTED_ID).checked(), '~', id(b1StateInputId).checked(), '~', 'p', '+', 'i', '+', 'i::after')
      .content(stateName);

    sb.push(displayStateNameTop);
    sb.push(displayStateNameBottom);
  });
}

function addStateLabelStyling(sb, config) {
  const stateNames = getOrderedStateNames(config);
  for (let source = 0; source < 2; source++) {
    const dest = 1 - source;
    const matchesSourceSelector = source === 0 ? id(BUFFER_SWITCH_ID).unchecked() : id(BUFFER_SWITCH_ID).checked();

    // Outer loop represents the destination state for which we are computing the visibility of its label.
    stateNames.forEach((stateName, idx) => {
      const destStateInputId = getInputId(dest, STATE_PREFIX, idx);
      const destStateLabelSelector = attr('for', destStateInputId);
      const destStateUncheckedSelector = id(destStateInputId).unchecked();

      const currentHeadSelector = attrContains('id', getInputGroup(source, HEAD_POS_PREFIX)).checked();

      // Inner loop represents each possible value of the current state.
      // No rules necessary for case that current state is halting state (cannot transition to any other state).
      config.forEach((currentState, currentStateIdx) => {
        const currentStateInputId = getInputId(source, STATE_PREFIX, currentStateIdx);
        const currentStateCheckedSelector = id(currentStateInputId).checked();
        // currentStateCheckedSelector/destStateUncheckedSelector need to be ordered when creating the selector based on DOM layout.
        const [first, second] = [currentStateIdx, source] < [idx, dest] ?
          [currentStateCheckedSelector, destStateUncheckedSelector] :
          [destStateUncheckedSelector, currentStateCheckedSelector];
        // TODO: if next === stateName regardless of the input value, then we can optimize this to one shorter selector.

        if (currentState[1].next === stateName) {
          const displayNextStateFor1 = select(matchesSourceSelector, '~', first, '~', second, '~', currentHeadSelector, '+', '*', '+', checked(), '~', destStateLabelSelector)
            .displayBlock();
          sb.push(displayNextStateFor1);
        }

        if (currentState[0].next === stateName) {
          const displayNextStateFor0 = select(matchesSourceSelector, '~', first, '~', second, '~', currentHeadSelector, '+', '*', '+', unchecked(), '~', destStateLabelSelector)
            .displayBlock();
          sb.push(displayNextStateFor0);
        }
      });
    });
  }
}

function addTapeCellValueLabelStyling(sb, config) {
  // Rules for non-head tape cell source/destination mismatch:
  const displayMismatchUnchecked = select(id(BUFFER_SWITCH_ID).unchecked(), '~',
    unchecked(), '+', '*', '+', checked(), '+', unchecked(), '+', '*', '+', '*', '+', '*', '+', attrContains('for', getInputGroup(1, TAPE_VALUE_PREFIX)))
    .displayBlock();
  const displayMismatchChecked = select(id(BUFFER_SWITCH_ID).unchecked(), '~',
    unchecked(), '+', '*', '+', unchecked(), '+', checked(), '+', '*', '+', '*', '+', '*', '+', attrContains('for', getInputGroup(1, TAPE_VALUE_PREFIX)))
    .displayBlock();
  sb.push(displayMismatchUnchecked);
  sb.push(displayMismatchChecked);
  // And reverse direction:
  const displayMismatchUncheckedReverse = select(id(BUFFER_SWITCH_ID).checked(), '~',
    unchecked(), '+', unchecked(), '+', checked(), '+', '*', '+', '*', '+', attrContains('for', getInputGroup(0, TAPE_VALUE_PREFIX)))
    .displayBlock();
  const displayMismatchCheckedReverse = select(id(BUFFER_SWITCH_ID).checked(), '~',
    unchecked(), '+', checked(), '+', unchecked(), '+', '*', '+', '*', '+', attrContains('for', getInputGroup(0, TAPE_VALUE_PREFIX)))
    .displayBlock();
  sb.push(displayMismatchUncheckedReverse);
  sb.push(displayMismatchCheckedReverse);

  // Rules for head tape cell where destination has mismatch with write instruction:
  config.forEach((state, stateIdx) => {
    const writeIf1 = state[1].write;
    const writeIf0 = state[0].write;
    const writeIf1DestMismatch = writeIf1 === '0' ? checked() : unchecked();
    const writeIf0DestMismatch = writeIf0 === '0' ? checked() : unchecked();

    const displayWriteIf1Mismatch = select(id(BUFFER_SWITCH_ID).unchecked(), '~', id(getInputId(0, STATE_PREFIX, stateIdx)).checked(), '~',
      checked(), '+', '*', '+', checked(), '+', writeIf1DestMismatch, '+', '*', '+', '*', '+', '*', '+', attrContains('for', getInputGroup(1, TAPE_VALUE_PREFIX)))
      .displayBlock();
    const displayWriteIf0Mismatch = select(id(BUFFER_SWITCH_ID).unchecked(), '~', id(getInputId(0, STATE_PREFIX, stateIdx)).checked(), '~',
      checked(), '+', '*', '+', unchecked(), '+', writeIf0DestMismatch, '+', '*', '+', '*', '+', '*', '+', attrContains('for', getInputGroup(1, TAPE_VALUE_PREFIX)))
      .displayBlock();
    sb.push(displayWriteIf1Mismatch);
    sb.push(displayWriteIf0Mismatch);
    // Reverse direction:
    const displayWriteIf1MismatchReverse = select(id(BUFFER_SWITCH_ID).checked(), '~', id(getInputId(1, STATE_PREFIX, stateIdx)).checked(), '~',
      checked(), '+', writeIf1DestMismatch, '+', checked(), '+', '*', '+', '*', '+', attrContains('for', getInputGroup(0, TAPE_VALUE_PREFIX)))
      .displayBlock();
    const displayWriteIf0MismatchReverse = select(id(BUFFER_SWITCH_ID).checked(), '~', id(getInputId(1, STATE_PREFIX, stateIdx)).checked(), '~',
      checked(), '+', writeIf0DestMismatch, '+', unchecked(), '+', '*', '+', '*', '+', attrContains('for', getInputGroup(0, TAPE_VALUE_PREFIX)))
      .displayBlock();
    sb.push(displayWriteIf1MismatchReverse);
    sb.push(displayWriteIf0MismatchReverse);
  });
}

function addHeadPositionLabelStyling(sb, config) {
  // Rules for head position where destination has mismatch with move instruction:
  config.forEach((state, stateIdx) => {
    const moveLeftIf1 = state[1].move === 'L';
    const moveLeftIf0 = state[0].move === 'L';
    // TODO: if moveLeftIf1 === moveLeftIf0, then we can optimize this to one shorter selector.

    if (moveLeftIf1) {
      // Concrete example: current head is at tape cell 0, moving to 1, destination head label is in tape cell 2 group.
      const displayMoveIf1Mismatch = select(id(BUFFER_SWITCH_ID).unchecked(), '~', id(getInputId(0, STATE_PREFIX, stateIdx)).checked(), '~',
        checked(), '+', '*', '+', checked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
        unchecked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
        attrContains('for', getInputGroup(1, HEAD_POS_PREFIX)))
        .displayBlock();
      sb.push(displayMoveIf1Mismatch);
    } else {
      // Concrete example: current head is at tape cell 1, moving to 0, destination head label is in tape cell 1 group.
      const displayMoveIf1Mismatch = select(id(BUFFER_SWITCH_ID).unchecked(), '~', id(getInputId(0, STATE_PREFIX, stateIdx)).checked(), '~',
        unchecked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
        checked(), '+', '*', '+', checked(), '+', '*', '+', '*', '+', attrContains('for', getInputGroup(1, HEAD_POS_PREFIX)))
        .displayBlock();
      sb.push(displayMoveIf1Mismatch);
    }
    if (moveLeftIf0) {
      const displayMoveIf0Mismatch = select(id(BUFFER_SWITCH_ID).unchecked(), '~', id(getInputId(0, STATE_PREFIX, stateIdx)).checked(), '~',
        checked(), '+', '*', '+', unchecked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
        unchecked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
        attrContains('for', getInputGroup(1, HEAD_POS_PREFIX)))
        .displayBlock();
      sb.push(displayMoveIf0Mismatch);
    } else {
      const displayMoveIf0Mismatch = select(id(BUFFER_SWITCH_ID).unchecked(), '~', id(getInputId(0, STATE_PREFIX, stateIdx)).checked(), '~',
        unchecked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
        checked(), '+', '*', '+', unchecked(), '+', '*', '+', '*', '+', attrContains('for', getInputGroup(1, HEAD_POS_PREFIX)))
        .displayBlock();
      sb.push(displayMoveIf0Mismatch);
    }

    // Reverse direction:
    if (moveLeftIf1) {
      const displayMoveIf1Mismatch = select(id(BUFFER_SWITCH_ID).checked(), '~', id(getInputId(1, STATE_PREFIX, stateIdx)).checked(), '~',
        checked(), '+', '*', '+', checked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
        unchecked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
        attrContains('for', getInputGroup(0, HEAD_POS_PREFIX)))
        .displayBlock();
      sb.push(displayMoveIf1Mismatch);
    } else {
      const displayMoveIf1Mismatch = select(id(BUFFER_SWITCH_ID).checked(), '~', id(getInputId(1, STATE_PREFIX, stateIdx)).checked(), '~',
        unchecked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
        checked(), '+', '*', '+', checked(), '+', attrContains('for', getInputGroup(0, HEAD_POS_PREFIX)))
        .displayBlock();
      sb.push(displayMoveIf1Mismatch);
    }
    if (moveLeftIf0) {
      const displayMoveIf0Mismatch = select(id(BUFFER_SWITCH_ID).checked(), '~', id(getInputId(1, STATE_PREFIX, stateIdx)).checked(), '~',
        checked(), '+', '*', '+', unchecked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
        unchecked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
        attrContains('for', getInputGroup(0, HEAD_POS_PREFIX)))
        .displayBlock();
      sb.push(displayMoveIf0Mismatch);
    } else {
      const displayMoveIf0Mismatch = select(id(BUFFER_SWITCH_ID).checked(), '~', id(getInputId(1, STATE_PREFIX, stateIdx)).checked(), '~',
        unchecked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
        checked(), '+', '*', '+', unchecked(), '+', attrContains('for', getInputGroup(0, HEAD_POS_PREFIX)))
        .displayBlock();
      sb.push(displayMoveIf0Mismatch);
    }
  });
}

function getOrderedStateNames(config) {
  const stateNames = config.map(s => s.name);
  stateNames.push('HALT');
  return stateNames;
}