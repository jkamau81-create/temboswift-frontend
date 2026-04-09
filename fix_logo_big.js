const fs = require('fs');
let app = fs.readFileSync('src/App.js', 'utf8');

// Auth screen logo - 200px, no filter
app = app.replace(
  'style={{ height: 140, width: "auto", maxWidth: 260, margin: "0 auto 16px", display: "block", objectFit: "contain" }}',
  'style={{ height: 200, width: "auto", maxWidth: 300, margin: "0 auto 16px", display: "block", objectFit: "contain" }}'
);

// Loading screen logo - 160px, no filter
app = app.replace(
  'style={{ height: 100, width: "auto", filter: "brightness(0) invert(1)", marginBottom: 20, objectFit: "contain" }}',
  'style={{ height: 160, width: "auto", maxWidth: 280, marginBottom: 20, objectFit: "contain" }}'
);

// Header logo - 56px, no filter
app = app.replace(
  'style={{ height: 52, width: "auto", maxWidth: 160, objectFit: "contain" }}',
  'style={{ height: 56, width: "auto", maxWidth: 180, objectFit: "contain" }}'
);

fs.writeFileSync('src/App.js', app, 'utf8');

// Splash screen - 200px
let html = fs.readFileSync('public/index.html', 'utf8');
html = html.replace(
  /height: \d+px; width: auto; max-width: \d+px;/,
  'height: 200px; width: auto; max-width: 320px;'
);
fs.writeFileSync('public/index.html', html, 'utf8');

console.log('Done - logos doubled, white/yellow colors preserved');
