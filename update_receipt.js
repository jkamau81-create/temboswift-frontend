const fs = require('fs');
let c = fs.readFileSync('src/SendMoney.js', 'utf8');
const [lastTransfer, setLastTransfer] = require !== undefined ? [null, () => {}] : [null, () => {}];

// Replace the simple success screen with Receipt component
const oldSuccess = c.indexOf('if (success) return (');
const endSuccess = c.indexOf('return (', oldSuccess + 10);

if (oldSuccess !== -1) {
  let braces = 0, i = oldSuccess, started = false;
  while (i < c.length) {
    if (c[i] === '(') { braces++; started = true; }
    if (c[i] === ')') braces--;
    if (started && braces === 0) { i++; break; }
    i++;
  }
  // Skip semicolon and whitespace
  while (i < c.length && (c[i] === ';' || c[i] === '\n' || c[i] === '\r')) i++;
  
  const newSuccess = `if (success) return (
    <Receipt
      transfer={lastTransfer}
      onClose={() => { setSuccess(false); setPage && setPage("dashboard"); }}
      onSendAnother={() => { setSuccess(false); setStep(1); setPhoneLocal(""); setMpesaName(null); setSelectedRecipient(null); }}
    />
  );`;
  
  c = c.substring(0, oldSuccess) + newSuccess + '\n\n  ' + c.substring(i);
  console.log('Replaced success screen with Receipt');
} else {
  console.log('Success screen not found');
}

// Add lastTransfer state
c = c.replace(
  'const [loading, setLoading] = useState(false);',
  'const [loading, setLoading] = useState(false);\n  const [lastTransfer, setLastTransfer] = useState(null);'
);

// Update send function to capture transfer
c = c.replace(
  'await req("/transfers", { method: "POST", body: JSON.stringify({ recipient_id: recipientId, amount_usd: parseFloat(usd) }) });\n      setSuccess(true);',
  `const txResult = await req("/transfers", { method: "POST", body: JSON.stringify({ recipient_id: recipientId, amount_usd: parseFloat(usd) }) });
      setLastTransfer({ ...txResult, amount_usd: usd, amount_kes: quote?.amount_kes, exchange_rate: quote?.client_rate, recipient_name: mpesaName?.name || selectedRecipient?.full_name, recipient_phone: fullPhone });
      setSuccess(true);`
);

fs.writeFileSync('src/SendMoney.js', c, 'utf8');
console.log('Done');
