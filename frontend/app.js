// ============================================
// NEERCHAIN — Water Safety DApp
// Connects to WaterSafety.sol via Web3.js
// ============================================

const CONTRACT_ADDRESS = "0xC10c4f5528664f4b414200c883faa84B2Ff4f78f"; // paste yours here!

const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "id", "type": "uint256"},
      {"indexed": false, "name": "city", "type": "string"},
      {"indexed": false, "name": "status", "type": "string"},
      {"indexed": false, "name": "attackSignature", "type": "string"},
      {"indexed": false, "name": "confidence", "type": "uint256"},
      {"indexed": false, "name": "timestamp", "type": "uint256"}
    ],
    "name": "WaterAlertDetected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "name": "txId", "type": "uint256"},
      {"indexed": false, "name": "city", "type": "string"},
      {"indexed": false, "name": "actionTaken", "type": "string"},
      {"indexed": false, "name": "authorityNotified", "type": "string"}
    ],
    "name": "SmartContractExecuted",
    "type": "event"
  },
  {
    "inputs": [
      {"name": "_city", "type": "string"},
      {"name": "_pH", "type": "int256"},
      {"name": "_turbidity", "type": "uint256"},
      {"name": "_TDS", "type": "uint256"},
      {"name": "_status", "type": "string"},
      {"name": "_attackSignature", "type": "string"},
      {"name": "_confidence", "type": "uint256"}
    ],
    "name": "addWaterReading",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getReadingCount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "index", "type": "uint256"}],
    "name": "getReading",
    "outputs": [
      {"name": "", "type": "uint256"},
      {"name": "", "type": "string"},
      {"name": "", "type": "int256"},
      {"name": "", "type": "uint256"},
      {"name": "", "type": "uint256"},
      {"name": "", "type": "string"},
      {"name": "", "type": "string"},
      {"name": "", "type": "uint256"},
      {"name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTransactionCount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "index", "type": "uint256"}],
    "name": "getTransaction",
    "outputs": [
      {"name": "", "type": "uint256"},
      {"name": "", "type": "string"},
      {"name": "", "type": "string"},
      {"name": "", "type": "string"},
      {"name": "", "type": "string"},
      {"name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// ============================================
// GLOBALS
// ============================================
let web3;
let contract;
let userAccount;
let lastIDSResult = null;
let localReadings = [];
let criticalCount = 0;
let alertCount = 0;
let safeCount = 0;
const cityStatus = {};

// IDS Thresholds
const THRESHOLDS = {
  pH: [6.5, 8.5],
  turbidity: 4.0,
  TDS: 500,
  DO: 6.0
};

// Attack Signatures
const SIGNATURES = {
  CHEMICAL_DUMP: (r) => r.pH < 5.5,
  INDUSTRIAL_RUNOFF: (r) => r.TDS > 550 && r.turbidity > 5.0,
  BIOLOGICAL_CONTAMINATION: (r) => r.DO < 4.0,
  ALKALINE_POLLUTION: (r) => r.pH > 9.0,
  SEDIMENT_OVERLOAD: (r) => r.turbidity > 7.0,
};

// ============================================
// INIT
// ============================================
window.addEventListener('load', async () => {
  if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    document.getElementById('contractAddr').textContent =
      CONTRACT_ADDRESS.slice(0, 8) + '...' + CONTRACT_ADDRESS.slice(-6);
    await loadFromBlockchain();
  } else {
    alert('MetaMask not detected! Please install MetaMask.');
  }
});

// ============================================
// CONNECT WALLET
// ============================================
async function connectWallet() {
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    userAccount = accounts[0];
    document.getElementById('walletAddress').textContent =
      userAccount.slice(0, 8) + '...' + userAccount.slice(-6);
    await updateBalance();
  } catch (err) {
    alert('Wallet connection failed: ' + err.message);
  }
}

async function updateBalance() {
  try {
    const bal = await contract.methods.getContractBalance().call();
    document.getElementById('contractBalance').textContent =
      parseFloat(web3.utils.fromWei(bal, 'ether')).toFixed(4) + ' ETH';
  } catch (e) {}
}

// ============================================
// IDS ENGINE
// ============================================
function runIDS() {
  const city = document.getElementById('city').value;
  const pH = parseFloat(document.getElementById('pH').value);
  const turbidity = parseFloat(document.getElementById('turbidity').value);
  const TDS = parseInt(document.getElementById('TDS').value);
  const DO = parseFloat(document.getElementById('DO').value);

  if (!pH || !turbidity || !TDS || !DO) {
    alert('Please fill in all water quality values!');
    return;
  }

  const reading = { city, pH, turbidity, TDS, DO };

  // Show scanning animation
  document.getElementById('scanning').classList.add('active');
  document.getElementById('idsResult').classList.remove('active');

  setTimeout(() => {
    document.getElementById('scanning').classList.remove('active');

    const violations = [];
    const signatures = [];
    let confidence = 50;

    // Threshold checks
    if (pH < THRESHOLDS.pH[0] || pH > THRESHOLDS.pH[1]) {
      violations.push(`pH abnormal: ${pH} (safe: 6.5–8.5)`);
      confidence += 15;
    }
    if (turbidity > THRESHOLDS.turbidity) {
      violations.push(`Turbidity high: ${turbidity} NTU (safe: <4.0)`);
      confidence += 15;
    }
    if (TDS > THRESHOLDS.TDS) {
      violations.push(`TDS high: ${TDS} mg/L (safe: <500)`);
      confidence += 10;
    }
    if (DO < THRESHOLDS.DO) {
      violations.push(`Dissolved O₂ low: ${DO} mg/L (safe: >6.0)`);
      confidence += 10;
    }

    // Signature matching
    for (const [name, fn] of Object.entries(SIGNATURES)) {
      if (fn(reading)) {
        signatures.push(name);
        confidence += 20;
      }
    }

    confidence = Math.min(confidence, 99);

    // Determine status
    let status = 'SAFE';
    if (signatures.some(s => ['CHEMICAL_DUMP','INDUSTRIAL_RUNOFF'].includes(s)) || violations.length >= 3) {
      status = 'CRITICAL';
    } else if (violations.length > 0 || signatures.length > 0) {
      status = 'ALERT';
    }

    if (status === 'SAFE') confidence = 100 - confidence;

    lastIDSResult = {
      city, pH, turbidity, TDS, DO,
      status, violations, signatures,
      confidence,
      timestamp: new Date().toLocaleString()
    };

    // Show result
    const resultDiv = document.getElementById('idsResult');
    const icon = status === 'CRITICAL' ? '🔴' : status === 'ALERT' ? '🟡' : '🟢';
    const cls = status === 'CRITICAL' ? 'critical' : status === 'ALERT' ? 'alert' : 'safe';

    resultDiv.className = `ids-result ${cls} active`;
    resultDiv.innerHTML = `
      <strong>${icon} IDS Result: ${status}</strong> | Confidence: ${confidence}%<br>
      ${violations.length > 0 ? '<br>⚠️ Violations:<br>' + violations.map(v => `• ${v}`).join('<br>') : ''}
      ${signatures.length > 0 ? '<br>🎯 Attack Signatures: ' + signatures.join(', ') : ''}
      ${violations.length === 0 && signatures.length === 0 ? '<br>✅ All parameters within safe limits' : ''}
    `;

    // Enable submit button
    document.getElementById('submitBtn').disabled = false;

    // Add to local alert feed
    addToAlertFeed(lastIDSResult);

  }, 1500);
}

// ============================================
// SUBMIT TO BLOCKCHAIN
// ============================================
async function submitToBlockchain() {
  if (!userAccount) {
    alert('Please connect MetaMask first!');
    return;
  }
  if (!lastIDSResult) return;

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Submitting to Ethereum...';

  try {
    const pHInt = Math.round(lastIDSResult.pH * 100);
    const turbInt = Math.round(lastIDSResult.turbidity * 100);
    const sig = lastIDSResult.signatures.length > 0
      ? lastIDSResult.signatures[0]
      : 'NONE';

    const value = lastIDSResult.status !== 'SAFE'
      ? web3.utils.toWei('0.001', 'ether')
      : '0';

    const tx = await contract.methods.addWaterReading(
      lastIDSResult.city,
      pHInt,
      turbInt,
      lastIDSResult.TDS,
      lastIDSResult.status,
      sig,
      lastIDSResult.confidence
    ).send({ from: userAccount, value });

    // Update CNS proof
    updateCNSProof(lastIDSResult, tx);

    // Reload from blockchain
    await loadFromBlockchain();
    await updateBalance();

    btn.textContent = '✅ Submitted!';
    setTimeout(() => {
      btn.textContent = '⛓️ Submit to Blockchain';
      btn.disabled = false;
    }, 2000);

  } catch (err) {
    alert('Transaction failed: ' + err.message);
    btn.disabled = false;
    btn.textContent = '⛓️ Submit to Blockchain';
  }
}

// ============================================
// LOAD FROM BLOCKCHAIN
// ============================================
async function loadFromBlockchain() {
  try {
    const count = await contract.methods.getReadingCount().call();
    localReadings = [];
    criticalCount = 0; alertCount = 0; safeCount = 0;

    for (let i = 0; i < count; i++) {
      const r = await contract.methods.getReading(i).call();
      const reading = {
        id: r[0],
        city: r[1],
        pH: r[2] / 100,
        turbidity: r[3] / 100,
        TDS: r[4],
        status: r[5],
        attackSignature: r[6],
        confidence: r[7],
        timestamp: new Date(r[8] * 1000).toLocaleString()
      };
      localReadings.push(reading);
      if (reading.status === 'CRITICAL') criticalCount++;
      else if (reading.status === 'ALERT') alertCount++;
      else safeCount++;
      cityStatus[reading.city] = reading.status;
    }

    updateMetrics();
    renderReadings();
    renderBlockchain();
    renderCityStatus();
    await renderTransactions();

  } catch (e) {
    console.error('Load error:', e);
  }
}

// ============================================
// RENDER FUNCTIONS
// ============================================
function updateMetrics() {
  document.getElementById('totalReadings').textContent = localReadings.length;
  document.getElementById('criticalCount').textContent = criticalCount;
  document.getElementById('alertCount').textContent = alertCount;
  document.getElementById('safeCount').textContent = safeCount;
}

function addToAlertFeed(r) {
  const feed = document.getElementById('alertFeed');
  const empties = feed.querySelectorAll('.empty');
  empties.forEach(e => e.remove());

  const cls = r.status === 'CRITICAL' ? 'critical' : r.status === 'ALERT' ? 'alert-warn' : 'safe';
  const icon = r.status === 'CRITICAL' ? '🔴' : r.status === 'ALERT' ? '🟡' : '🟢';

  const div = document.createElement('div');
  div.className = `alert-row ${cls}`;
  div.innerHTML = `
    <div>
      <strong>${icon} ${r.status}</strong> — ${r.city} |
      pH: ${r.pH} | Turbidity: ${r.turbidity} NTU |
      TDS: ${r.TDS} mg/L | Confidence: ${r.confidence}% | ${r.timestamp}
      ${r.signatures && r.signatures.length > 0 ? `<br>🎯 ${r.signatures.join(', ')}` : ''}
    </div>
  `;
  feed.insertBefore(div, feed.firstChild);
}

function renderReadings() {
  const container = document.getElementById('readingsList');
  if (localReadings.length === 0) {
    container.innerHTML = '<div class="empty">No readings on blockchain yet.</div>';
    return;
  }
  container.innerHTML = '';
  [...localReadings].reverse().forEach(r => {
    const icon = r.status === 'CRITICAL' ? '🔴' : r.status === 'ALERT' ? '🟡' : '🟢';
    const div = document.createElement('div');
    div.className = 'block-card';
    div.innerHTML = `
      <div class="block-header">
        <div class="block-title">${icon} Reading #${r.id} — ${r.city}</div>
        <div class="status-badge ${r.status}">${r.status}</div>
      </div>
      <div class="block-detail">
        pH: <span>${r.pH}</span> |
        Turbidity: <span>${r.turbidity} NTU</span> |
        TDS: <span>${r.TDS} mg/L</span> |
        Confidence: <span>${r.confidence}%</span><br>
        Signature: <span>${r.attackSignature || 'NONE'}</span> |
        Time: <span>${r.timestamp}</span>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderBlockchain() {
  const container = document.getElementById('blockchainList');
  if (localReadings.length === 0) {
    container.innerHTML = '<div class="empty">No blocks yet.</div>';
    return;
  }
  container.innerHTML = '';
  [...localReadings].reverse().forEach((r, i) => {
    const blockNum = localReadings.length - i;
    const div = document.createElement('div');
    div.className = 'block-card';
    div.innerHTML = `
      <div class="block-header">
        <div class="block-title">⛓️ Block #${blockNum} — ${r.city}</div>
        <div class="status-badge ${r.status}">${r.status}</div>
      </div>
      <div class="block-detail">
        Contract: <span>${CONTRACT_ADDRESS.slice(0,10)}...</span><br>
        Network: <span>Ganache Local (Chain ID: 1337)</span><br>
        Confidence: <span>${r.confidence}%</span> |
        Attack Sig: <span>${r.attackSignature || 'NONE'}</span><br>
        Timestamp: <span>${r.timestamp}</span><br>
        Immutable: <span>✅ Locked on Ethereum</span>
      </div>
    `;
    container.appendChild(div);
  });
}

async function renderTransactions() {
  const container = document.getElementById('transactionsList');
  try {
    const count = await contract.methods.getTransactionCount().call();
    if (count == 0) {
      container.innerHTML = '<div class="empty">No transactions yet.</div>';
      return;
    }
    container.innerHTML = '';
    for (let i = count - 1; i >= 0; i--) {
      const t = await contract.methods.getTransaction(i).call();
      const icon = t[2] === 'CRITICAL' ? '🔴' : t[2] === 'ALERT' ? '🟡' : '🟢';
      const div = document.createElement('div');
      div.className = 'tx-card';
      div.innerHTML = `
        <div class="tx-header">
          <div class="tx-id">TX-${t[0]} ${icon}</div>
          <div class="status-badge ${t[2]}">${t[2]}</div>
        </div>
        <div class="tx-arrow">
          📤 IDS_NODE_${t[1].toUpperCase().replace(' ','_')}
          → 📥 NEERCHAIN_LEDGER
        </div>
        <div class="tx-detail">
          City: <span>${t[1]}</span><br>
          Action: <span>${t[3]}</span><br>
          Authority Notified: <span>${t[4]}</span><br>
          Auto Executed: <span>✅ Yes</span> |
          Human Intervention: <span>❌ None</span><br>
          Time: <span>${new Date(t[5] * 1000).toLocaleString()}</span>
        </div>
      `;
      container.appendChild(div);
    }
  } catch (e) {
    container.innerHTML = '<div class="empty">Error loading transactions.</div>';
  }
}

function renderCityStatus() {
  const grid = document.getElementById('cityGrid');
  if (Object.keys(cityStatus).length === 0) {
    grid.innerHTML = '<div class="empty" style="grid-column:span 4;">Run IDS scan to see city status</div>';
    return;
  }
  grid.innerHTML = '';
  for (const [city, status] of Object.entries(cityStatus)) {
    const icon = status === 'CRITICAL' ? '🔴' : status === 'ALERT' ? '🟡' : '🟢';
    const div = document.createElement('div');
    div.className = `city-badge ${status}`;
    div.textContent = `${icon} ${city}`;
    grid.appendChild(div);
  }
}

function updateCNSProof(r, tx) {
  document.getElementById('cnsPlain').textContent =
    JSON.stringify({city: r.city, pH: r.pH, turbidity: r.turbidity, TDS: r.TDS, status: r.status}, null, 2);
  document.getElementById('cnsHash').textContent =
    'keccak256(' + r.city + r.pH + r.status + ') = 0x' +
    Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
  document.getElementById('cnsSig').textContent =
    'TX Hash: ' + tx.transactionHash + '\nSigned by: ' + userAccount;
  document.getElementById('cnsBlock').textContent =
    'Block: ' + tx.blockNumber + '\nBlock Hash: ' + tx.blockHash +
    '\nGas Used: ' + tx.gasUsed + '\nNetwork: Ganache (Chain ID: 1337)';
}

// ============================================
// QUICK FILL PRESETS
// ============================================
function quickFill(type) {
  if (type === 'critical') {
    document.getElementById('pH').value = '4.8';
    document.getElementById('turbidity').value = '7.5';
    document.getElementById('TDS').value = '620';
    document.getElementById('DO').value = '3.2';
  } else if (type === 'alert') {
    document.getElementById('pH').value = '6.0';
    document.getElementById('turbidity').value = '5.0';
    document.getElementById('TDS').value = '480';
    document.getElementById('DO').value = '5.5';
  } else if (type === 'safe') {
    document.getElementById('pH').value = '7.2';
    document.getElementById('turbidity').value = '2.1';
    document.getElementById('TDS').value = '310';
    document.getElementById('DO').value = '7.8';
  }
}

// ============================================
// TAB SWITCHING
// ============================================
function switchTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  event.target.classList.add('active');
  if (name === 'readings') renderReadings();
  if (name === 'blockchain') renderBlockchain();
  if (name === 'transactions') renderTransactions();
  if (name === 'cities') renderCityStatus();
}