import { useState } from 'react';
import './TuringMachineForm.css';
import TuringMachineStateTable from './TuringMachineStateTable.jsx'
import ShareableLink from './ShareableLink.jsx';
import toHTML from './CompiledMachinePageBody.jsx';

const DEFAULT_STATE_0 = { name: 'A', 0: { write: '1', move: 'L', next: 'HALT' }, 1: { write: '0', move: 'R', next: 'A' } };
const DEFAULT_ADD = { 0: { write: '1', move: 'L', next: 'HALT' }, 1: { write: '0', move: 'R', next: 'HALT' } };

export default function TuringMachineForm() {
  const [numTapeCells, setNumTapeCells] = useState("15");
  const [config, setConfig] = useState([DEFAULT_STATE_0]);
  const [generatedDataUrl, setGeneratedDataUrl] = useState(null);

  function addNewState() {
    const configCopy = [...config];
    const nextState = { ...DEFAULT_ADD };
    nextState.name = nextName(config[config.length - 1].name);
    configCopy.push(nextState);
    updateConfig(configCopy);
  }

  function updateConfig(config) {
    setConfig(config);
    setGeneratedDataUrl(null);
  }

  function updateNumTapeCells(value) {
    setNumTapeCells(value);
    setGeneratedDataUrl(null);
  }

  function compileConfig() {
    const parsedNumTapeCells = parseInputNum(numTapeCells);
    const generatedHtml = toHTML(config, parsedNumTapeCells);
    setNumTapeCells(parsedNumTapeCells.toString());
    setGeneratedDataUrl(toDataURL(generatedHtml));
  }

  return (
    <>
      <TuringMachineStateTable config={config} setConfig={updateConfig} />
      <div className="addButton">
        <button onClick={addNewState}>Add State</button>
      </div>
      <label className="tape-cell-label">Number of tape cells: <input className="tape-cell-input"
        type="number"
        name="quantity"
        min="1"
        value={numTapeCells}
        onChange={e => updateNumTapeCells(e.target.value)} />
      </label>
      <div><button onClick={compileConfig}>Compile</button></div>
      {generatedDataUrl && <div className="top-spacing"><ShareableLink url={generatedDataUrl} /></div>}
    </>
  );
}

function toDataURL(html) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function parseInputNum(value) {
  const result = parseInt(value);
  if (isNaN(result) || result < 1) {
    return 1;
  }
  return result;
}

function nextName(name) {
  for (let letter = name.length - 1; letter >= 0; letter--) {
    const c = name.charCodeAt(letter);
    const next = String.fromCharCode(c + 1);
    if (next <= 'Z') {
      return name.substring(0, letter) + next + 'A'.repeat(name.length - 1 - letter);
    }
  }
  return 'A'.repeat(name.length + 1);
}