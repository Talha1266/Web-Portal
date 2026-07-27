const fs = require('fs');

const cssToAppend = `

/* Responsive display utilities */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}
@media (min-width: 769px) {
  .mobile-only {
    display: none !important;
  }
}
`;

fs.appendFileSync('src/index.css', cssToAppend);
console.log("Appended desktop-only and mobile-only classes");
