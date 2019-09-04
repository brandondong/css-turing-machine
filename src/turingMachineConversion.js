export default function toHTML(config, numTapeCells) {
  const numHeadPositionDigits = logTwoCeil(numTapeCells);
  const numStateDigits = logTwoCeil(config.length);
  const sb = [];
  sb.push('<html>\n<head>\n<style>\n');
  // Just page formatting, unrelated to the main logic.
  sb.push('body{overflow:auto;white-space:nowrap;}\n');
  // Hide the start checkbox once checked.
  sb.push('#s:checked,#s:checked+*{display:none;}\n');
  sb.push('</style>\n</head>\n<body>\n');
  sb.push('<h2>Instructions:</h2>\n');
  sb.push('<ol>\n');
  sb.push('<li>Set the desired initial tape input. The head position and current state are already initialized to the leftmost position and 0 respectively.</li>\n');
  sb.push('<li>Select the <em>Start</em> checkbox when ready.</li>\n');
  sb.push('</ol>\n');
  for (let i = 0; i < 2; i++) {
    addCheckboxes(sb, 'Tape', `t${i}`, numTapeCells);
    addCheckboxes(sb, 'Head position', `hp${i}`, numHeadPositionDigits);
    addCheckboxes(sb, 'Current state', `cs${i}`, numStateDigits);
  }
  sb.push('<hr>\n');
  sb.push('<input id="s" type="checkbox"><label for="s"> Start</label>\n');
  sb.push('</body>\n</html>');
  return sb.join('');
}

function addCheckboxes(sb, label, id, n) {
  if (n === 0) {
    sb.push(`<p id=${id}></p>\n`);
    return;
  }
  sb.push(`<p id=${id}>${label}:</p>\n`);
  for (let i = 0; i < n; i++) {
    sb.push('<input type="checkbox">');
  }
  sb.push('\n');
}

function logTwoCeil(n) {
  return Math.ceil(Math.log2(n));
}