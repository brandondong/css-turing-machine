import React from 'react';
import TuringMachineStateTable from './TuringMachineStateTable.js';
import { GITHUB_LINK } from './contants.js';

/* Only used for ReactDOMServer.renderToStaticMarkup. */
export default function CompiledMachinePageBody({ config, numTapeCells }) {
  return <>
    <p>This page implements the below Turing machine without executing any Javascript or making any network requests. <a href={`${GITHUB_LINK}/blob/master/README.md`} target="_blank" rel="noopener noreferrer">How does it work?</a></p>
    <div id="machine">
      <StateInputs config={config} numTapeCells={numTapeCells} />
      <LogicLabels config={config} numTapeCells={numTapeCells} />
      <InputUI numTapeCells={numTapeCells} />
    </div>
    <hr />
    <h3>Reference:</h3>
    <TuringMachineStateTable config={config} />
  </>;
}

function StateInputs({ config, numTapeCells }) {
  const inputs = [];
  let counter = 0;
  for (let i = 0; i < 2; i++) {
    for (let state = 0; state < config.length + 1; state++) {
      inputs.push(<input type="radio" defaultChecked={state === 0} name={`s${i}`} id={`s${i}_${state}`} key={counter++} />);
    }
    for (let pos = 0; pos < numTapeCells; pos++) {
      inputs.push(<input type="radio" defaultChecked={pos === 0} name={`h${i}`} id={`h${i}_${pos}`} key={counter++} />);
    }
    for (let idx = 0; idx < numTapeCells; idx++) {
      inputs.push(<input type="checkbox" id={`t${i}_${idx}`} key={counter++} />);
    }
  }
  return <>
    <input type="checkbox" id="s" />
    <input type="checkbox" id="f" />
    {inputs}
  </>;
}

function LogicLabels({ config, numTapeCells }) {
  const labels = [];
  let counter = 0;
  for (let i = 0; i < 2; i++) {
    for (let state = 0; state < config.length + 1; state++) {
      labels.push(<label htmlFor={`s${i}_${state}`} id={`ls${i}_${state}`} className="l" key={counter++} ></label>);
    }
    for (let pos = 0; pos < numTapeCells; pos++) {
      labels.push(<label htmlFor={`h${i}_${pos}`} className="l" key={counter++} ></label>);
    }
    for (let idx = 0; idx < numTapeCells; idx++) {
      labels.push(<label htmlFor={`t${i}_${idx}`} className="l" key={counter++} ></label>);
    }
  }
  return <>
    <label htmlFor="f" className="l toggle"></label>
    {labels}
    <label htmlFor="s" className="l start"></label>
  </>;
}


function InputUI({ numTapeCells }) {
  const elements = [];
  let counter = 0;
  for (let n = 0; n < 2; n++) {
    elements.push(<p className={`o${n}`} key={counter++} >State: <span id={`s${n}`}></span></p>);
    for (let i = 0; i < numTapeCells; i++) {
      elements.push(<span className={`t t${n} o${n}`} key={counter++} ></span>);
    }
    if (n === 0) {
      for (let i = 0; i < numTapeCells; i++) {
        elements.push(<label htmlFor={`t0_${i}`} className={`t t${n} o${n}`} key={counter++} ></label>);
      }
    }
    elements.push(<br key={counter++} />);
    if (n === 0) {
      elements.push(<label htmlFor="t0_0" className="h" key={counter++} ></label>);
    }
    for (let i = 0; i < numTapeCells; i++) {
      elements.push(<span className={`h h${n} o${n}`} key={counter++} ></span>);
    }
  }
  return <>
    {elements}
    <span className="instruction">Set the initial tape input by clicking on the squares above.</span>
  </>;
}