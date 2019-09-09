import React from 'react';

export default function ShareableHtmlLink({ html }) {
  if (html === null) {
    return null;
  }
  const dataUrl = toDataURL(html);
  return <ShareableLink key={dataUrl} url={dataUrl} />
}

class ShareableLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = { copied: false };
    this.textInput = React.createRef();
  }

  copyToClipboard() {
    this.textInput.current.select();
    document.execCommand("copy");
    this.setState({ copied: true });
  }

  render() {
    const copyButtonText = this.state.copied ? 'Copied!' : 'Copy to Clipboard';
    return (
      <>
        <div>Generated Link:</div>
        <input value={this.props.url} ref={this.textInput} readOnly /> <button onClick={() => this.copyToClipboard()}>{copyButtonText}</button>
      </>);
  }
}

function toDataURL(html) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}