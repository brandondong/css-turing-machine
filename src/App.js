import React from 'react';
import StateTable from './StateTable.js';

function App() {
  return (
    <>
      <header>
        <h1>Turing Machine implemented in CSS</h1>
        <aside>CSS, supplied with random mouse clicks and ignoring finite memory limitations, is <a href="https://en.wikipedia.org/wiki/Turing_completeness" target="_blank" rel="noopener noreferrer">Turing complete.</a></aside>
      </header>
      <h2>Instructions:</h2>
      <ol>
        <li>Fill out the Turing machine <a href="https://en.wikipedia.org/wiki/Turing_machine#Formal_definition" target="_blank" rel="noopener noreferrer">state table</a> below.</li>
        <li>Click the <em>Generate</em> button.</li>
      </ol>
      <StateTable />
      <hr></hr>
      <a href="https://github.com/brandondong/turing-machine-css" target="_blank" rel="noopener noreferrer">Source code</a>
    </>
  );
}

export default App;
