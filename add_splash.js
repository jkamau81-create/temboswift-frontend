const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');

const splashHTML = `
  <div id="splash">
    <div class="splash-content">
      <img src="%PUBLIC_URL%/logo.png" alt="TemboSwift Logo" class="splash-logo" />
      <p class="splash-tagline">Fast &bull; Secure &bull; Reliable</p>
      <div class="splash-loader"></div>
    </div>
  </div>
  <style>
    #splash {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: linear-gradient(135deg, #0f5c3b, #0a3d2a);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      transition: opacity 0.5s ease;
    }
    .splash-content { text-align: center; color: white; }
    .splash-logo {
      width: 140px;
      margin-bottom: 20px;
      animation: splashFadeIn 1.5s ease-in-out;
    }
    .splash-tagline { font-size: 14px; opacity: 0.8; margin-bottom: 20px; font-family: sans-serif; }
    .splash-loader {
      width: 30px; height: 30px;
      border: 3px solid rgba(255,255,255,0.2);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: splashSpin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes splashSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes splashFadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  </style>
  <script>
    window.addEventListener("load", () => {
      setTimeout(() => {
        const splash = document.getElementById("splash");
        splash.style.opacity = "0";
        setTimeout(() => { splash.style.display = "none"; }, 500);
      }, 1500);
    });
  </script>`;

c = c.replace('<div id="root"></div>', '<div id="root"></div>' + splashHTML);
fs.writeFileSync('public/index.html', c, 'utf8');
console.log('Done');
