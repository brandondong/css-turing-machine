import { useState } from 'react';

export default function ShareableHtmlLink({ html }) {
  if (html === null) {
    return null;
  }
  const dataUrl = toDataURL(html);
  return <ShareableLink url={dataUrl} />
}

const hasClipboardAPI = navigator?.clipboard?.writeText;

function ShareableLink({ url }) {
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

function toDataURL(html) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}