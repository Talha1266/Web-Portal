const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Find the start of the responsiveness block
const marker = '/* RESPONSIVENESS FIXES (Appended by Patch)  */';
const index = css.indexOf(marker);

if (index !== -1) {
    // Keep everything up to the marker
    let newCss = css.substring(0, index - 50); // back up a bit to remove the === header too
    
    // Append the final clean layout utilities
    newCss += `\n/* ========================================= */
/* RESPONSIVENESS FIXES */
/* ========================================= */

.main-content {
  min-width: 0 !important;
}

.glass-card {
  max-width: 100% !important;
}

.table-wrapper {
  max-width: 100%;
}

/* Prevent ALL tables from squeezing text on mobile */
.table-wrapper table, 
table {
  min-width: max-content !important;
}
`;
    fs.writeFileSync('src/index.css', newCss);
    console.log("Successfully cleaned up all orphaned mobile CSS blocks.");
} else {
    console.log("Marker not found!");
}
