const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// 1. Completely remove the Mobile Table Fit Fixes block using regex
// This regex matches from the exact comment to the closing brace of the media query
css = css.replace(/\/\* ========================================= \*\/\r?\n\/\* MOBILE TABLE FIT FIXES \(Appended by Patch\)\*\/\r?\n\/\* ========================================= \*\/\r?\n@media \(max-width: 768px\) \{[\s\S]*?\}\r?\n/g, '');

// 2. Add the anti-squeeze rule at the end if it doesn't already exist
if (!css.includes("min-width: max-content !important;")) {
    css += `\n/* Prevent ALL tables from squeezing text on mobile */
.table-wrapper table, 
table {
  min-width: max-content !important;
}\n`;
}

fs.writeFileSync('src/index.css', css);
console.log("Successfully cleaned index.css and applied anti-squeezing fix.");
