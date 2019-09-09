import React from 'react';
import './App.css';
import TuringMachineForm from './TuringMachineForm.js';

const GITHUB_LINK = 'https://github.com/brandondong/css-turing-machine';

function App() {
  return (
    <>
      <h2>Instructions:</h2>
      <ol className="instructions">
        <li>Customize the Turing machine <a href="https://en.wikipedia.org/wiki/Turing_machine#Formal_definition" target="_blank" rel="noopener noreferrer">state table</a> below.</li>
        <li>Click the <em>Compile</em> button and navigate to the generated link.</li>
      </ol>
      <TuringMachineForm />
      <div className="footer">
        <hr></hr>
        Check out the <a href={GITHUB_LINK} target="_blank" rel="noopener noreferrer">source code on GitHub</a>.
      </div>
    </>
  );
}

export default App;
