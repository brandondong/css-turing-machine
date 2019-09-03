import React, { useState } from 'react';
import './StateTable.css';
import HTMLTuringMachineViewer from './HTMLTuringMachineViewer.js';
import toHTML from './cssTuringMachine.js';

const DEFAULT_STATE_0 = { 0: { write: 1, move: 'L', next: 'HALT' }, 1: { write: 0, move: 'L', next: 0 } };

export default function StateTable() {
  const [numTapeCells, setNumTapeCells] = useState("8");
  const [config, setConfig] = useState([DEFAULT_STATE_0]);
  const [generatedHTML, setGeneratedHTML] = useState(null);
  return (
    <div className="statetable-form">
      <div className="table-overflow">
        <table className="statetable">
          <tbody>
            <tr>
              <th rowSpan={2}>Tape symbol</th>
              {config.map((_, idx) => <th key={idx} colSpan={3}>{`Current state ${idx}`}</th>)}
            </tr>
            <tr className="instruction-labels">
              {config.map((_, idx) => <React.Fragment key={idx}><td>Write symbol</td><td>Move tape</td><td>Next state</td></React.Fragment>)}
            </tr>
            <tr>
              <td>0</td>
              {renderStateInfo(config, 0)}
            </tr>
            <tr>
              <td>1</td>
              {renderStateInfo(config, 1)}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="addButton">
        <button onClick={() => addStateToConfig(config, setConfig)}>Add State</button>
      </div>
      Number of tape cells: <input className="tape-cell-input" type="number" name="quantity" min="1" value={numTapeCells} onChange={e => setNumTapeCells(e.target.value)} />
      <div className="bottom-spacing">
        <button onClick={() => setGeneratedHTML(toHTML(config))}>Generate</button>
      </div>
      <HTMLTuringMachineViewer html={generatedHTML} />
    </div>
  );
}

function addStateToConfig(config, setConfig) {
  const configCopy = [...config];
  configCopy.push(DEFAULT_STATE_0);
  setConfig(configCopy);
}

function renderStateInfo(config, tapeSymbol) {
  return config.map((c, idx) => (
    <React.Fragment key={idx}>
      <td>
        <select value={c[tapeSymbol].write}>
          <option value={0}>0</option>
          <option value={1}>1</option>
        </select>
      </td>
      <td>
        <select value={c[tapeSymbol].move}>
          <option value={'L'}>L</option>
          <option value={'R'}>R</option>
        </select>
      </td>
      <td>
        <select value={c[tapeSymbol].next}>
          {config.map((_, idx) => <option key={idx} value={idx}>{idx}</option>)}
          <option value={'HALT'}>HALT</option>
        </select>
      </td>
    </React.Fragment>
  ));
}