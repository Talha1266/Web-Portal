const fs = require('fs');
let cssContent = fs.readFileSync('src/index.css', 'utf8');

const cssRule = `\n
/* Prevent ALL tables from squeezing text on mobile */
.table-wrapper table, 
table {
  min-width: max-content !important;
}
`;

fs.writeFileSync('src/index.css', cssContent + cssRule);
console.log("Successfully appended anti-squeezing CSS");
