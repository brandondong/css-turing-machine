import React from 'react';
import TuringMachineForm from './TuringMachineForm.js';

const GITHUB_LINK = 'https://github.com/brandondong/css-turing-machine';

function App() {
  return (
    <>
      <header>
        <h1>Turing Machine implemented in CSS</h1>
        <aside>CSS, supplied with stationary mouse clicks and ignoring finite memory limitations, is <a href="https://en.wikipedia.org/wiki/Turing_completeness" target="_blank" rel="noopener noreferrer">Turing complete.</a></aside>
      </header>
      <h2>Instructions:</h2>
      <ol>
        <li>Fill out the Turing machine <a href="https://en.wikipedia.org/wiki/Turing_machine#Formal_definition" target="_blank" rel="noopener noreferrer">state table</a> below.</li>
        <li>Click the <em>Compile</em> button.</li>
        <li>Navigate to the generated link.</li>
      </ol>
      <TuringMachineForm />
      <hr></hr>
      Check out the <a href={GITHUB_LINK} target="_blank" rel="noopener noreferrer">source code on GitHub</a>.
    </>
  );
}

export default App;
