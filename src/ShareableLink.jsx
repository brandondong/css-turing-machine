import { useState } from 'react';

const hasClipboardAPI = navigator?.clipboard?.writeText;

export default function ShareableLink({ url }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
      .then(() => setCopied(true))
      .catch(e => console.error(e.message));
  }
  const copyButtonText = copied ? 'Copied!' : 'Copy to Clipboard';
  return (
    <>
      <div>Generated Link:</div>
      <input value={url} readOnly autoFocus /> {hasClipboardAPI && <button onClick={copyToClipboard}>{copyButtonText}</button>}
    </>);
}
