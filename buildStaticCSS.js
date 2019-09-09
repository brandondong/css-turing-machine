const fs = require('fs');
const uglifycss = require('uglifycss');

const uglified = uglifycss.processFiles(
  ['src/index.css', 'src/TuringMachineStateTable.css', 'src/conversion.css']
);

const js = `export default '${uglified}';`

fs.writeFileSync('src/conversionStaticCSS.js', js);