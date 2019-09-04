import React, { useState } from 'react';
import './TuringMachineForm.css';
import ShareableHtmlLink from './ShareableHtmlLink.js';
import toHTML from './turingMachineConversion.js';

const DEFAULT_STATE_0 = { 0: { write: '1', move: 'L', next: 'HALT' }, 1: { write: '0', move: 'L', next: '0' } };

export default function TuringMachineForm() {
  const [numTapeCells, setNumTapeCells] = useState("8");
  const [config, setConfig] = useState([DEFAULT_STATE_0]);
  const [generatedHTML, setGeneratedHTML] = useState(null);

  const parsedNumTapeCells = parseInputNum(numTapeCells);
  return (
    <>
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
                {renderStateInfo(config, 0, setConfig)}
              </tr>
              <tr>
                <td>1</td>
                {renderStateInfo(config, 1, setConfig)}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="addButton">
          <button onClick={() => addStateToConfig(config, setConfig)}>Add State</button>
        </div>
        Number of tape cells: <input className="tape-cell-input" type="number" name="quantity" min="1" value={numTapeCells} onChange={e => setNumTapeCells(e.target.value)} />
        <div className="bottom-spacing">
          <button onClick={() => setGeneratedHTML(toHTML(config, parsedNumTapeCells))}>Compile</button>
        </div>
      </div>
      <ShareableHtmlLink html={generatedHTML} />
    </>
  );
}

function parseInputNum(value) {
  const result = parseInt(value);
  if (isNaN(result) || result < 1) {
    return 1;
  }
  return result;
}

function renderStateInfo(config, tapeSymbol, setConfig) {
  return config.map((c, idx) => (
    <React.Fragment key={idx}>
      <td>
        <select value={c[tapeSymbol].write} onChange={e => updateConfig(e, config, c, idx, tapeSymbol, 'write', setConfig)}>
          <option value={0}>0</option>
          <option value={1}>1</option>
        </select>
      </td>
      <td>
        <select value={c[tapeSymbol].move} onChange={e => updateConfig(e, config, c, idx, tapeSymbol, 'move', setConfig)}>
          <option value={'L'}>L</option>
          <option value={'R'}>R</option>
        </select>
      </td>
      <td>
        <select value={c[tapeSymbol].next} onChange={e => updateConfig(e, config, c, idx, tapeSymbol, 'next', setConfig)}>
          {config.map((_, idx) => <option key={idx} value={idx}>{idx}</option>)}
          <option value={'HALT'}>HALT</option>
        </select>
      </td>
    </React.Fragment>
  ));
}

function addStateToConfig(config, setConfig) {
  const configCopy = [...config];
  configCopy.push(DEFAULT_STATE_0);
  setConfig(configCopy);
}

function updateConfig(e, config, c, idx, tapeSymbol, prop, setConfig) {
  const value = e.target.value;
  const copyConfigs = [...config];
  const copyConfig = { ...c };
  const copySubConfig = { ...c[tapeSymbol] };
  copySubConfig[prop] = value;
  copyConfig[tapeSymbol] = copySubConfig;
  copyConfigs[idx] = copyConfig;
  setConfig(copyConfigs);
}