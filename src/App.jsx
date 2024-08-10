import AppLayout from './AppLayout.jsx';
import TuringMachineForm from './TuringMachineForm.jsx';
import { GITHUB_LINK } from './contants.js';

function App() {
  return (
    <AppLayout
      main={<TuringMachineForm />}
      footer={<>Check out the <a href={GITHUB_LINK} target="_blank" rel="noopener noreferrer">source code on GitHub</a>.</>}
    />
  );
}

export default App;
