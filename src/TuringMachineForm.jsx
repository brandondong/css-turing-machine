import { useState } from 'react';
import './TuringMachineForm.css';
import TuringMachineStateTable, { DEFAULT_CONFIG } from './TuringMachineStateTable.jsx'
import ShareableLink from './ShareableLink.jsx';
import toHTML from './CompiledMachinePageBody.jsx';

const MIN_TAPE_CELLS = 1;

export default function TuringMachineForm() {
  const [numTapeCells, setNumTapeCells] = useState("15");
  const [statesConfig, setStatesConfig] = useState(DEFAULT_CONFIG);
  const [generatedDataUrl, setGeneratedDataUrl] = useState(null);

  function updateStatesConfig(statesConfig) {
    setStatesConfig(statesConfig);
    setGeneratedDataUrl(null);
  }

  function updateNumTapeCells(value) {
    setNumTapeCells(value);
    setGeneratedDataUrl(null);
  }

  function compileMachine() {
    const parsedNumTapeCells = parseInputNum(numTapeCells);
    const generatedHtml = toHTML(statesConfig, parsedNumTapeCells);
    setNumTapeCells(parsedNumTapeCells.toString());
    setGeneratedDataUrl(toDataURL(generatedHtml));
  }

  return (
    <>
      <h2>Instructions:</h2>
      <ol className="instructions">
        <li>Customize the Turing machine <a href="https://en.wikipedia.org/wiki/Turing_machine#Formal_definition" target="_blank" rel="noopener noreferrer">state table</a> below.</li>
        <li>Click the <em>Compile</em> button and navigate to the generated link.</li>
      </ol>
      <TuringMachineStateTable config={statesConfig} setConfig={updateStatesConfig} />
      <div className="top-spacing">
        <label className="tape-cell-label">Number of tape cells: <input className="tape-cell-input"
          type="number"
          name="quantity"
          min={MIN_TAPE_CELLS}
          value={numTapeCells}
          onChange={e => updateNumTapeCells(e.target.value)} />
        </label>
      </div>
      <div><button onClick={compileMachine}>Compile</button></div>
      {generatedDataUrl && <div className="top-spacing"><ShareableLink url={generatedDataUrl} /></div>}
    </>
  );
}

function toDataURL(html) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function parseInputNum(value) {
  const result = parseInt(value);
  // Guard against the user managing to input something invalid like NaN/-1.
  return result >= MIN_TAPE_CELLS ? result : MIN_TAPE_CELLS;
}
