const fs = require('fs');
const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0b5e35" />
    <meta name="description" content="TemboSwift - Send money from US to Kenya. Zero fees, best rates, instant M-Pesa delivery." />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo.png" />
    <title>TemboSwift</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'DM Sans', sans-serif; background: #f5f0e8; }
      #splash { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #093d28, #1a7a4a); display: flex; justify-content: center; align-items: center; z-index: 9999; transition: opacity 0.5s ease; }
      .splash-content { text-align: center; color: white; }
      .splash-logo { height: 100px; width: auto; margin-bottom: 20px; animation: splashFade 1.5s ease-in-out; filter: brightness(0) invert(1); }
      .splash-tagline { font-size: 14px; opacity: 0.8; margin-bottom: 20px; font-family: 'DM Sans', sans-serif; }
      .splash-loader { width: 30px; height: 30px; border: 3px solid rgba(255,255,255,0.2); border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes splashFade { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    </style>
  </head>
  <body>
    <div id="splash">
      <div class="splash-content">
        <img src="/logo.png" alt="TemboSwift" class="splash-logo" onerror="this.style.display='none'" />
        <p class="splash-tagline">Fast &bull; Secure &bull; Reliable</p>
        <div class="splash-loader"></div>
      </div>
    </div>
    <div id="root"></div>
    <script>
      window.addEventListener("load", function() {
        setTimeout(function() {
          var splash = document.getElementById("splash");
          if (splash) {
            splash.style.opacity = "0";
            setTimeout(function() { splash.style.display = "none"; }, 500);
          }
        }, 1500);
      });
    </script>
  </body>
</html>`;
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('index.html restored');
