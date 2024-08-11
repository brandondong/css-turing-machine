import ReactDOMServer from 'react-dom/server';
import AppLayout from './AppLayout.jsx';
import TuringMachineStateTable from './TuringMachineStateTable.jsx';
import { GITHUB_LINK } from './contants.js';
import { select, id, checked, unchecked, attr, attrContains } from './selector.js';
import indexCSS from './index.css?inline';
import appLayoutCSS from './AppLayout.css?inline';
import turingMachineStateTableCSS from './TuringMachineStateTable.css?inline';
import compiledMachinePageBodyCSS from './CompiledMachinePageBody.css?inline';

// React components in this file are only used through ReactDOMServer.
/* eslint-disable react-refresh/only-export-components */
function CompiledMachinePageBody({ statesConfig, numTapeCells }) {
  return <AppLayout
    main={
      <>
        <h3>Reference:</h3>
        <TuringMachineStateTable config={statesConfig} />
        <CompiledTuringMachine statesConfig={statesConfig} numTapeCells={numTapeCells} />
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

function CompiledTuringMachine({ statesConfig, numTapeCells }) {
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

  const numStates = statesConfig.length + 1; // User configuration does not include halting state.
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
  const halfwayTape = Math.ceil(numTapeCells / 2) - 1;
  // There is an extra dummy tape cell to fit the last tape head label.
  for (let tapeCellIdx = 0; tapeCellIdx < numTapeCells + 1; tapeCellIdx++) {
    const isDummyIdx = tapeCellIdx === numTapeCells;
    // Tape head inputs:
    for (let buffer = 0; buffer < 2; buffer++) {
      if (!isDummyIdx) {
        const tapeHeadInputId = getInputId(buffer, HEAD_POS_PREFIX, tapeCellIdx);
        const tapeHeadInputGroup = getInputGroup(buffer, HEAD_POS_PREFIX);
        // Initialize the head position halfway along the tape.
        elems.push(<input id={tapeHeadInputId} type="radio" name={tapeHeadInputGroup} defaultChecked={tapeCellIdx === halfwayTape} key={counter++} />);
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
      <div className="min-height-grid">
        <div className="machine-grid">
          {elems}
        </div>
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

export default function toHTML(statesConfig, numTapeCells) {
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="UTF-8"/>\n<meta name="viewport" content="width=device-width, initial-scale=1.0"/>\n<title>CSS Turing Machine</title>\n<style>\n' +
    getCompiledMachinePageStyles(statesConfig) +
    '\n</style>\n</head>\n<body>\n' +
    getCompiledMachinePageBody(statesConfig, numTapeCells) +
    '\n</body>\n</html>';
}

function getCompiledMachinePageBody(statesConfig, numTapeCells) {
  return ReactDOMServer.renderToStaticMarkup(<CompiledMachinePageBody statesConfig={statesConfig} numTapeCells={numTapeCells} />);
}

function getCompiledMachinePageStyles(statesConfig) {
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
  addBufferSwitchLabelStyling(dynStyles, statesConfig);
  addStateDisplayStyling(dynStyles, statesConfig);
  addStateLabelStyling(dynStyles, statesConfig);
  addTapeCellValueLabelStyling(dynStyles, statesConfig);
  addHeadPositionLabelStyling(dynStyles, statesConfig);

  return '/* Common CSS: */\n' +
    staticStyles +
    '\n\n/* Generated CSS for the specified state table: */\n' +
    dynStyles.join('\n');
}

function addBufferSwitchLabelStyling(sb, statesConfig) {
  // Show the buffer switch label if we're not in the halting state.
  const haltingState = statesConfig.length;
  const b0HaltingStateInputId = getInputId(0, STATE_PREFIX, haltingState);

  const showBufferSwitchLabel = select(id(b0HaltingStateInputId).unchecked(), '+', unchecked(), '~', attr('for', BUFFER_SWITCH_ID))
    .displayBlock();
  sb.push(showBufferSwitchLabel);
}

function addStateDisplayStyling(sb, statesConfig) {
  const stateNames = getOrderedStateNames(statesConfig);
  stateNames.forEach((stateName, idx) => {
    const stateNameString = `State: ${stateName}`;
    const b0StateInputId = getInputId(0, STATE_PREFIX, idx);
    const b1StateInputId = getInputId(1, STATE_PREFIX, idx);

    const selectStateNameTop = select(id(b0StateInputId).checked(), '~', 'p', '+', 'i::after');
    const selectStateNameBottom = select(id(b1StateInputId).checked(), '~', 'p', '+', 'i', '+', 'i::after');

    sb.push(select(selectStateNameTop, ',', selectStateNameBottom).content(stateNameString));
  });
}

function addStateLabelStyling(sb, statesConfig) {
  const stateNames = getOrderedStateNames(statesConfig);
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
      statesConfig.forEach((currentState, currentStateIdx) => {
        const currentStateInputId = getInputId(source, STATE_PREFIX, currentStateIdx);
        const currentStateCheckedSelector = id(currentStateInputId).checked();
        // currentStateCheckedSelector/destStateUncheckedSelector need to be ordered when creating the selector based on DOM layout.
        const [first, second] = [currentStateIdx, source] < [idx, dest] ?
          [currentStateCheckedSelector, destStateUncheckedSelector] :
          [destStateUncheckedSelector, currentStateCheckedSelector];

        if (currentState[1].next === stateName && currentState[0].next === stateName) {
          // Optimization: if next === stateName regardless of the input value, then we can shorten this to one selector which doesn't check the current head value.
          const displayNextState = select(matchesSourceSelector, '~', first, '~', second, '~', destStateLabelSelector)
            .displayBlock();
          sb.push(displayNextState);
        } else if (currentState[1].next === stateName) {
          const displayNextStateFor1 = select(matchesSourceSelector, '~', first, '~', second, '~', currentHeadSelector, '+', '*', '+', checked(), '~', destStateLabelSelector)
            .displayBlock();
          sb.push(displayNextStateFor1);
        } else if (currentState[0].next === stateName) {
          const displayNextStateFor0 = select(matchesSourceSelector, '~', first, '~', second, '~', currentHeadSelector, '+', '*', '+', unchecked(), '~', destStateLabelSelector)
            .displayBlock();
          sb.push(displayNextStateFor0);
        }
      });
    });
  }
}

function addTapeCellValueLabelStyling(sb, statesConfig) {
  // Rules for non-head tape cell source/destination mismatch:
  for (let source = 0; source < 2; source++) {
    const displayNonHeadWriteIf = (tapeValue, destTapeValue) => {
      if (source === 0) {
        return select(id(BUFFER_SWITCH_ID).unchecked(), '~',
          unchecked(), '+', '*', '+', tapeValue, '+', destTapeValue, '+', '*', '+', '*', '+', '*', '+', attrContains('for', getInputGroup(1, TAPE_VALUE_PREFIX)))
          .displayBlock();
      } else {
        return select(id(BUFFER_SWITCH_ID).checked(), '~',
          unchecked(), '+', destTapeValue, '+', tapeValue, '+', '*', '+', '*', '+', attrContains('for', getInputGroup(0, TAPE_VALUE_PREFIX)))
          .displayBlock();
      }
    };

    sb.push(displayNonHeadWriteIf(checked(), unchecked()));
    sb.push(displayNonHeadWriteIf(unchecked(), checked()));
  }

  // Rules for head tape cell where destination has mismatch with write instruction:
  statesConfig.forEach((state, stateIdx) => {
    const writeIf1 = state[1].write;
    const writeIf0 = state[0].write;
    const writeIf1DestMismatch = writeIf1 === '0' ? checked() : unchecked();
    const writeIf0DestMismatch = writeIf0 === '0' ? checked() : unchecked();

    for (let source = 0; source < 2; source++) {
      const displayHeadWriteIf = (tapeValue, destTapeValue) => {
        if (source === 0) {
          return select(id(BUFFER_SWITCH_ID).unchecked(), '~', id(getInputId(0, STATE_PREFIX, stateIdx)).checked(), '~',
            checked(), '+', '*', '+', tapeValue, '+', destTapeValue, '+', '*', '+', '*', '+', '*', '+', attrContains('for', getInputGroup(1, TAPE_VALUE_PREFIX)))
            .displayBlock();
        } else {
          return select(id(BUFFER_SWITCH_ID).checked(), '~', id(getInputId(1, STATE_PREFIX, stateIdx)).checked(), '~',
            checked(), '+', destTapeValue, '+', tapeValue, '+', '*', '+', '*', '+', attrContains('for', getInputGroup(0, TAPE_VALUE_PREFIX)))
            .displayBlock();
        }
      };

      if (writeIf1 === writeIf0) {
        // Optimization: if writeIf1 === writeIf0, then we can shorten this to one selector that writes to the mismatched destination regardless of input tape value.
        const displayWriteIfMismatch = displayHeadWriteIf('*', writeIf1DestMismatch);
        sb.push(displayWriteIfMismatch);
      } else {
        const displayWriteIf1Mismatch = displayHeadWriteIf(checked(), writeIf1DestMismatch);
        const displayWriteIf0Mismatch = displayHeadWriteIf(unchecked(), writeIf0DestMismatch);
        sb.push(displayWriteIf1Mismatch);
        sb.push(displayWriteIf0Mismatch);
      }
    }
  });
}

function addHeadPositionLabelStyling(sb, statesConfig) {
  // Rules for head position where destination has mismatch with move instruction:
  statesConfig.forEach((state, stateIdx) => {
    const moveRightIf1 = state[1].move === 'R';
    const moveRightIf0 = state[0].move === 'R';

    for (let source = 0; source < 2; source++) {
      const displayMoveRightIf = (tapeValue) => {
        // Concrete example: current head is at tape cell 0, moving to 1, destination head label is in tape cell 2 group.
        // Need to perform a "bounds check" in case destination head label is in tape cell 1 group to make sure we're not peering up into state inputs.
        if (source === 0) {
          return select(id(BUFFER_SWITCH_ID).unchecked(), '~', id(getInputId(0, STATE_PREFIX, stateIdx)).checked(), '~',
            attrContains('id', HEAD_POS_PREFIX).checked(), '+', '*', '+', tapeValue, '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
            unchecked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
            attrContains('for', getInputGroup(1, HEAD_POS_PREFIX)))
            .displayBlock();
        } else {
          return select(id(BUFFER_SWITCH_ID).checked(), '~', id(getInputId(1, STATE_PREFIX, stateIdx)).checked(), '~',
            attrContains('id', HEAD_POS_PREFIX).checked(), '+', '*', '+', tapeValue, '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
            unchecked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
            attrContains('for', getInputGroup(0, HEAD_POS_PREFIX)))
            .displayBlock();
        }
      };
      const displayMoveLeftIf = (tapeValue) => {
        // Concrete example: current head is at tape cell 1, moving to 0, destination head label is in tape cell 1 group.
        // Implicit "bounds check" is performed for last destination head label because dummy elements group cannot have checked head position.
        if (source === 0) {
          return select(id(BUFFER_SWITCH_ID).unchecked(), '~', id(getInputId(0, STATE_PREFIX, stateIdx)).checked(), '~',
            unchecked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
            checked(), '+', '*', '+', tapeValue, '+', '*', '+', '*', '+', attrContains('for', getInputGroup(1, HEAD_POS_PREFIX)))
            .displayBlock();
        } else {
          return select(id(BUFFER_SWITCH_ID).checked(), '~', id(getInputId(1, STATE_PREFIX, stateIdx)).checked(), '~',
            unchecked(), '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+', '*', '+',
            checked(), '+', '*', '+', tapeValue, '+', attrContains('for', getInputGroup(0, HEAD_POS_PREFIX)))
            .displayBlock();
        }
      };

      if (moveRightIf1 === moveRightIf0) {
        // Optimization: if moveRightIf1 === moveRightIf0, then we can shorten this to one selector that moves in the direction regardless of tape value.
        if (moveRightIf1) {
          sb.push(displayMoveRightIf('*'));
        } else {
          sb.push(displayMoveLeftIf('*'));
        }
      } else {
        if (moveRightIf1) {
          sb.push(displayMoveRightIf(checked()));
        } else {
          sb.push(displayMoveLeftIf(checked()));
        }
        if (moveRightIf0) {
          sb.push(displayMoveRightIf(unchecked()));
        } else {
          sb.push(displayMoveLeftIf(unchecked()));
        }
      }
    }
  });
}

function getOrderedStateNames(statesConfig) {
  const stateNames = statesConfig.map(s => s.name);
  stateNames.push('HALT');
  return stateNames;
}