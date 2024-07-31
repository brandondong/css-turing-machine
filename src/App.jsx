import './App.css';
import AppLayout from './AppLayout.jsx';
import TuringMachineForm from './TuringMachineForm.jsx';
import { GITHUB_LINK } from './contants.js';

function App() {
  return (
    <AppLayout
      main={
        <>
          <h2>Instructions:</h2>
          <ol className="instructions">
            <li>Customize the Turing machine <a href="https://en.wikipedia.org/wiki/Turing_machine#Formal_definition" target="_blank" rel="noopener noreferrer">state table</a> below.</li>
            <li>Click the <em>Compile</em> button and navigate to the generated link.</li>
          </ol>
          <TuringMachineForm />
        </>
      }
      footer={<>Check out the <a href={GITHUB_LINK} target="_blank" rel="noopener noreferrer">source code on GitHub</a>.</>}
    />
  );
}

export default App;
