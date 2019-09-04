import React from 'react';
import './TuringMachineStateTable.css';

export default function TuringMachineStateTable({ config, setConfig }) {
  return (
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
  );
}

function renderStateInfo(config, tapeSymbol, setConfig) {
  return config.map((_, idx) => (
    <React.Fragment key={idx}>
      <td>
        <StateTableSelect config={config} idx={idx} tapeSymbol={tapeSymbol} prop="write" setConfig={setConfig}>
          <option value={0}>0</option>
          <option value={1}>1</option>
        </StateTableSelect>
      </td>
      <td>
        <StateTableSelect config={config} idx={idx} tapeSymbol={tapeSymbol} prop="move" setConfig={setConfig}>
          <option value={'L'}>L</option>
          <option value={'R'}>R</option>
        </StateTableSelect>
      </td>
      <td>
        <StateTableSelect config={config} idx={idx} tapeSymbol={tapeSymbol} prop="next" setConfig={setConfig} boldReadOnly>
          {config.map((_, idx) => <option key={idx} value={idx}>{idx}</option>)}
          <option value={'HALT'}>HALT</option>
        </StateTableSelect>
      </td>
    </React.Fragment>
  ));
}

function StateTableSelect({ config, idx, tapeSymbol, prop, setConfig, boldReadOnly, children }) {
  const value = config[idx][tapeSymbol][prop];
  if (!setConfig) {
    if (boldReadOnly) {
      return <b>{value}</b>;
    }
    return value;
  }
  return <select value={value} onChange={e => updateConfig(e, config, idx, tapeSymbol, prop, setConfig)}>
    {children}
  </select>;
}

function updateConfig(e, config, idx, tapeSymbol, prop, setConfig) {
  const value = e.target.value;
  const copyConfigs = [...config];
  const copyConfig = { ...copyConfigs[idx] };
  const copySubConfig = { ...copyConfig[tapeSymbol] };
  copySubConfig[prop] = value;
  copyConfig[tapeSymbol] = copySubConfig;
  copyConfigs[idx] = copyConfig;
  setConfig(copyConfigs);
}