const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');

// Replace KYC section with embedded flow
c = c.replace(
  `        <Btn onClick={async () => {
            try {
              const d = await api.kycStart();
              if (d.url) window.location.href = d.url;
              else if (d.status === 'approved') alert('Your identity is already verified!');
            } catch (e) { alert(e.message); }
          }} full>
            <i className="fas fa-id-card"></i> Start Verification
          </Btn>`,
  `        <KycVerifyButton user={user} />`
);

fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Done');
