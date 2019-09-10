import React, { useState, useEffect, useRef } from 'react';

export default function ShareableHtmlLink({ html }) {
  if (html === null) {
    return null;
  }
  const dataUrl = toDataURL(html);
  return <ShareableLink key={dataUrl} url={dataUrl} />
}

function ShareableLink({ url }) {
  const textInput = useRef(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    textInput.current.focus();
  }, []);

  const copyToClipboard = () => {
    textInput.current.select();
    document.execCommand("copy");
    setCopied(true);
  }
  const copyButtonText = copied ? 'Copied!' : 'Copy to Clipboard';
  return (
    <>
      <div>Generated Link:</div>
      <input value={url} ref={textInput} readOnly /> <button onClick={copyToClipboard}>{copyButtonText}</button>
    </>);
}

function toDataURL(html) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}