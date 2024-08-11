import { useState } from 'react';
import './TuringMachineForm.css';
import TuringMachineStateTable from './TuringMachineStateTable.jsx'
import toHTML from './CompiledMachinePageBody.jsx';

const DEFAULT_STATES_CONFIG = [{ name: 'A', 0: { write: '1', move: 'L', next: 'HALT' }, 1: { write: '0', move: 'R', next: 'A' } }];
const NONE_PRESET_KEY = 'none';
const BB2_PRESET_KEY = 'bb2';
const BB3_PRESET_KEY = 'bb3';
const BB4_PRESET_KEY = 'bb4';
const BB5_PRESET_KEY = 'bb5';
const COPY_PRESET_KEY = 'copy';
const EVEN_PRESET_KEY = 'even';
const PRESETS = {
  // See page 10 of https://scottaaronson.com/papers/bb.pdf.
  [BB2_PRESET_KEY]: {
    statesConfig: [
      { name: 'A', 0: { write: '1', move: 'R', next: 'B' }, 1: { write: '1', move: 'L', next: 'B' } },
      { name: 'B', 0: { write: '1', move: 'L', next: 'A' }, 1: { write: '1', move: 'L', next: 'HALT' } },
    ],
    minTapeCells: 5,
    infoMessage: '(6 steps on an all-0 initial tape before halting)',
  },
  [BB3_PRESET_KEY]: {
    statesConfig: [
      { name: 'A', 0: { write: '1', move: 'R', next: 'B' }, 1: { write: '1', move: 'L', next: 'HALT' } },
      { name: 'B', 0: { write: '1', move: 'L', next: 'B' }, 1: { write: '0', move: 'R', next: 'C' } },
      { name: 'C', 0: { write: '1', move: 'L', next: 'C' }, 1: { write: '1', move: 'L', next: 'A' } },
    ],
    minTapeCells: 7,
    infoMessage: '(21 steps on an all-0 initial tape before halting)',
  },
  [BB4_PRESET_KEY]: {
    statesConfig: [
      { name: 'A', 0: { write: '1', move: 'R', next: 'B' }, 1: { write: '1', move: 'L', next: 'B' } },
      { name: 'B', 0: { write: '1', move: 'L', next: 'A' }, 1: { write: '0', move: 'L', next: 'C' } },
      { name: 'C', 0: { write: '1', move: 'R', next: 'HALT' }, 1: { write: '1', move: 'L', next: 'D' } },
      { name: 'D', 0: { write: '1', move: 'R', next: 'D' }, 1: { write: '0', move: 'R', next: 'A' } },
    ],
    minTapeCells: 21,
    infoMessage: '(107 steps on an all-0 initial tape before halting)',
  },
  [BB5_PRESET_KEY]: {
    statesConfig: [
      { name: 'A', 0: { write: '1', move: 'R', next: 'B' }, 1: { write: '1', move: 'L', next: 'C' } },
      { name: 'B', 0: { write: '1', move: 'R', next: 'C' }, 1: { write: '1', move: 'R', next: 'B' } },
      { name: 'C', 0: { write: '1', move: 'R', next: 'D' }, 1: { write: '0', move: 'L', next: 'E' } },
      { name: 'D', 0: { write: '1', move: 'L', next: 'A' }, 1: { write: '1', move: 'L', next: 'D' } },
      { name: 'E', 0: { write: '1', move: 'L', next: 'HALT' }, 1: { write: '0', move: 'L', next: 'A' } },
    ],
    infoMessage: '(Requires several thousand tape cells... and a lot of patience — 47,176,870 steps on an all-0 initial tape before halting)',
  },
  [COPY_PRESET_KEY]: {
    statesConfig: [
      { name: 'A', 0: { write: '0', move: 'L', next: 'HALT' }, 1: { write: '0', move: 'R', next: 'B' } },
      { name: 'B', 0: { write: '0', move: 'R', next: 'C' }, 1: { write: '1', move: 'R', next: 'B' } },
      { name: 'C', 0: { write: '1', move: 'L', next: 'D' }, 1: { write: '1', move: 'R', next: 'C' } },
      { name: 'D', 0: { write: '0', move: 'L', next: 'E' }, 1: { write: '1', move: 'L', next: 'D' } },
      { name: 'E', 0: { write: '1', move: 'R', next: 'A' }, 1: { write: '1', move: 'L', next: 'E' } },
    ],
    minTapeCells: 9,
    infoMessage: '(Example: 11 → 11011)',
  },
  [EVEN_PRESET_KEY]: {
    statesConfig: [
      { name: 'A', 0: { write: '1', move: 'L', next: 'HALT' }, 1: { write: '0', move: 'R', next: 'B' } },
      { name: 'B', 0: { write: '0', move: 'L', next: 'HALT' }, 1: { write: '0', move: 'R', next: 'A' } },
    ],
    minTapeCells: 9,
    infoMessage: '(Example: 111 → 0, 1111 → 1)',
  },
};

const MIN_TAPE_CELLS = 1;

export default function TuringMachineForm() {
  const [preset, setPreset] = useState(NONE_PRESET_KEY);
  const [numTapeCells, setNumTapeCells] = useState('15');
  const [statesConfig, setStatesConfig] = useState(DEFAULT_STATES_CONFIG);
  const [generatedUrl, setGeneratedUrl] = useState(null);

  const presetInfoMessage = PRESETS[preset]?.infoMessage;

  function updateStatesConfig(statesConfig) {
    setStatesConfig(statesConfig);
    setPreset(NONE_PRESET_KEY);
    setGeneratedUrl(null);
  }

  function updateNumTapeCells(value) {
    setNumTapeCells(value);
    setGeneratedUrl(null);
  }

  function updatePreset(value) {
    setPreset(value);

    const presetDetails = PRESETS[value];
    setStatesConfig(presetDetails.statesConfig);
    if (presetDetails.minTapeCells > parseInputNum(numTapeCells)) {
      setNumTapeCells(presetDetails.minTapeCells);
    }
    setGeneratedUrl(null);
  }

  function compileMachine() {
    const parsedNumTapeCells = parseInputNum(numTapeCells);
    const generatedHtml = toHTML(statesConfig, parsedNumTapeCells);

    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    setNumTapeCells(parsedNumTapeCells.toString());
    setGeneratedUrl(blobUrl);
  }

  return (
    <>
      <h2>Turing-machine-to-CSS compiler</h2>
      <ol className="instructions">
        <li>Customize the Turing machine <a href="https://en.wikipedia.org/wiki/Turing_machine#Formal_definition" target="_blank" rel="noopener noreferrer">state table</a> below.</li>
        <li>Click the <em>Compile</em> button and navigate to the generated link.</li>
      </ol>
      <div className="preset-label">
        <label className="form-sm-text">Preset: <select
          value={preset}
          onChange={e => updatePreset(e.target.value)}>
          <option value={NONE_PRESET_KEY} disabled>None</option>
          <option value={EVEN_PRESET_KEY}>isEven</option>
          <option value={COPY_PRESET_KEY}>Copy</option>
          <option value={BB2_PRESET_KEY}>BB-2</option>
          <option value={BB3_PRESET_KEY}>BB-3</option>
          <option value={BB4_PRESET_KEY}>BB-4</option>
          <option value={BB5_PRESET_KEY}>BB-5</option>
        </select></label>{presetInfoMessage && <i className="form-sm-text form-faded-text"> {presetInfoMessage}</i>}
      </div>
      <div className="form-border">
        <TuringMachineStateTable config={statesConfig} setConfig={updateStatesConfig} />
        <div className="top-spacing">
          <label className="form-sm-text">Number of tape cells: <input className="tape-cell-input"
            type="number"
            name="quantity"
            min={MIN_TAPE_CELLS}
            value={numTapeCells}
            onChange={e => updateNumTapeCells(e.target.value)} />
          </label>
          <i className="form-sm-text form-faded-text">{` (Doesn't change generated CSS)`}</i>
        </div>
      </div>
      <button className="compile-button" onClick={compileMachine}>Compile</button>
      {generatedUrl && <div className="top-spacing"><a href={generatedUrl} target="_blank" rel="noopener noreferrer">Generated local link</a></div>}
    </>
  );
}

function parseInputNum(value) {
  const result = parseInt(value);
  // Guard against the user managing to input something invalid like NaN/-1.
  return result >= MIN_TAPE_CELLS ? result : MIN_TAPE_CELLS;
}
