const fs = require('fs');

// Fix splash screen in index.html
let html = fs.readFileSync('public/index.html', 'utf8');
html = html.replace(
  /\.splash-logo \{[^}]+\}/,
  '.splash-logo { height: 180px; width: auto; max-width: 320px; margin-bottom: 20px; animation: splashFade 1.5s ease-in-out; }'
);
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Splash logo fixed');

// Fix header logo in App.js
let app = fs.readFileSync('src/App.js', 'utf8');

// Fix header - bigger logo no filter
app = app.replace(
  /<img src="\/logo\.png" alt="TemboSwift" style=\{\{ height: \d+, width: \d+, objectFit: "contain" \}\}/,
  '<img src="/logo.png" alt="TemboSwift" style={{ height: 52, width: "auto", maxWidth: 160, objectFit: "contain" }}'
);

// Fix loading screen logo - bigger no filter
app = app.replace(
  /<img src="\/logo\.png" alt="TemboSwift" style=\{\{ height: \d+, width: "auto", filter: "brightness\(0\) invert\(1\)", marginBottom: \d+ \}\}/,
  '<img src="/logo.png" alt="TemboSwift" style={{ height: 160, width: "auto", maxWidth: 280, marginBottom: 20 }}'
);

// Fix auth screen logo - bigger no filter
app = app.replace(
  /<img src="\/logo\.png" alt="TemboSwift" style=\{\{ height: \d+, width: "auto", margin: "0 auto \d+px", display: "block", filter: "brightness\(0\) invert\(1\)", objectFit: "contain" \}\}/,
  '<img src="/logo.png" alt="TemboSwift" style={{ height: 140, width: "auto", maxWidth: 260, margin: "0 auto 16px", display: "block", objectFit: "contain" }}'
);

fs.writeFileSync('src/App.js', app, 'utf8');
console.log('App logos fixed');
console.log('Done!');
