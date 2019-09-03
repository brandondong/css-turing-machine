import React, { useState } from 'react';
import './HTMLTuringMachineViewer.css';

const IFRAME_MODE = "0";
const SOURCE_MODE = "1";

export default function HTMLTuringMachineViewer({ html }) {
  const [mode, setMode] = useState(IFRAME_MODE);
  if (html === null) {
    return null;
  }
  let iframeClassName = 'generated';
  if (mode === SOURCE_MODE) {
    iframeClassName += ' displayNone';
  }
  return (
    <>
      Show <label>
        <input type="radio"
          name="group"
          value={IFRAME_MODE}
          checked={mode === IFRAME_MODE}
          onChange={e => setMode(e.target.value)} /> Iframe</label> <label>
        <input type="radio"
          name="group"
          value={SOURCE_MODE}
          checked={mode === SOURCE_MODE}
          onChange={e => setMode(e.target.value)} /> Source</label>
      <iframe className={iframeClassName} src={toDataURL(html)} title="CSS Turing Machine"></iframe>
      {mode === SOURCE_MODE &&
        <div><textarea className="generated" defaultValue={html} rows={20} readOnly /></div>}
    </>);
}

function toDataURL(html) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}