# 🌊 NeerChain — Water Safety DApp

A Blockchain-based Intrusion Detection System for Drinking Water Safety built using Ethereum, Solidity, Web3.js, MetaMask, and Truffle. This decentralized application (DApp) automatically detects water contamination using IDS, locks tamper-proof evidence on the Ethereum blockchain, and auto-executes a smart contract — with zero human intervention.

## 🚀 Project Overview

Traditional water safety monitoring systems rely on centralized databases that can be modified or tampered with. NeerChain stores every water quality alert directly on the Ethereum blockchain, making the evidence:

* ✅ Secure & Tamper-proof
* ✅ Immutable & Permanent
* ✅ Transparent & Publicly Verifiable
* ✅ Decentralized & Court-Admissible

Users can:

* Sign up and login with role-based access (Admin / Viewer)
* Connect their MetaMask wallet
* Run IDS analysis on water quality parameters
* Detect 6 attack signatures — CHEMICAL_DUMP, INDUSTRIAL_RUNOFF, BIOLOGICAL_CONTAMINATION, ALKALINE_POLLUTION, SEDIMENT_OVERLOAD, REPEATED_VIOLATION
* Submit water alerts to blockchain (costs 0.001 ETH per alert)
* View all readings, transactions, and CNS encryption proof
* Track city-wise water safety status in real time

## 🛠️ Technologies Used

* **Solidity** — Smart contract development (WaterSafety.sol)
* **Truffle** — Ethereum development framework
* **Ganache** — Local blockchain for testing
* **Web3.js** — Blockchain interaction
* **MetaMask** — Wallet integration
* **HTML, CSS, JavaScript** — Frontend
* **Python** — Blockchain block creation + Merkle Tree demo
* **IDS Engine** — 6 attack signature detection with confidence scoring

## 📂 Project Structure
```
NeerChain-Dapp/
├── contracts/
│   ├── Migrations.sol
│   └── WaterSafety.sol
├── migrations/
│   ├── 1_initial_migration.js
│   └── 2_deploy_water.js
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── merkle_tree.html
├── build/
│   └── contracts/
├── blockchain_blocks.py
├── test/
└── truffle-config.js
```

## ⚙️ Installation & Setup

**1️⃣ Clone the Repository**
```bash
git clone https://github.com/m21ahima/NeerChainDapp.git
cd NeerChainDapp
```

**2️⃣ Install Truffle**
```bash
npm install -g truffle
```

**3️⃣ Start Ganache**

Open Ganache and create a new workspace called `NeerChain`. Add `truffle-config.js` to the workspace. Ensure it runs on:
```
HTTP://127.0.0.1:7545
```

**4️⃣ Deploy Smart Contract**
```bash
truffle migrate --reset
```

Copy the contract address from terminal output and paste it in `frontend/app.js`:
```javascript
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
```

Also paste it in `frontend/merkle_tree.html`:
```javascript
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
```

**5️⃣ Connect MetaMask**

* Add Ganache network manually:
  * Network Name: `Ganache`
  * RPC URL: `http://127.0.0.1:7545`
  * Chain ID: `1337`
  * Currency: `ETH`
* Import a Ganache account using its private key (click 🔑 icon in Ganache)

**6️⃣ Run the Application**

Right click `frontend/index.html` → Open with Live Server

Make sure MetaMask is connected to Localhost 7545

**7️⃣ Run Python Blockchain Demo (optional)**
```bash
pip install web3
python blockchain_blocks.py
```

## 🔐 How It Works

1. User signs up and logs in with role (Admin/Viewer)
2. Admin enters water quality parameters — pH, Turbidity, TDS, Dissolved O₂
3. IDS engine analyzes parameters against WHO standards
4. IDS detects attack signatures and calculates confidence score (0–99%)
5. Frontend sends transaction using Web3.js with 0.001 ETH fee
6. Smart contract (WaterSafety.sol) auto-executes — determines action, penalty, and authority notified
7. Evidence permanently stored on Ethereum blockchain via Ganache
8. All transactions viewable in Transactions tab with FROM → TO details
9. CNS Proof tab shows Keccak256 hash, TX signature, and immutable block details

## 🎯 IDS Attack Signatures

| Signature | Condition | Severity |
|---|---|---|
| CHEMICAL_DUMP | pH < 5.5 | CRITICAL |
| INDUSTRIAL_RUNOFF | TDS > 550 AND Turbidity > 5.0 | CRITICAL |
| BIOLOGICAL_CONTAMINATION | Dissolved O₂ < 4.0 | ALERT |
| ALKALINE_POLLUTION | pH > 9.0 | ALERT |
| SEDIMENT_OVERLOAD | Turbidity > 7.0 | ALERT |
| REPEATED_VIOLATION | Same city fails 3+ times | CRITICAL |

## 📊 Smart Contract — Auto Execution

When IDS detects a violation, `WaterSafety.sol` automatically:

| Status | Action Taken | Authority Notified |
|---|---|---|
| CRITICAL | WATER_SUPPLY_FLAGGED + AUTHORITY_ALERT + EVIDENCE_LOCKED | CPCB + District_Collector + State_Pollution_Board |
| ALERT | WARNING_ISSUED + MONITORING_INCREASED | Municipal_Water_Authority |
| SAFE | READING_LOGGED + CHAIN_UPDATED | NONE |

## 🌿 Merkle Tree

Open `frontend/merkle_tree.html` with Live Server after submitting readings to visualize the Merkle Tree built from your blockchain transactions.

## 📸 Screenshots

> Add screenshots of your DApp here after running it!

## 🌍 Future Enhancements

* Live IoT sensor integration for real-time water data
* Migration to Ethereum Sepolia Testnet for public deployment
* SMS/Email alerts to authorities on CRITICAL detection
* React.js frontend with real-time charts
* IPFS integration for storing sensor evidence
* Mobile app for citizen water quality reporting
* Integration with India's CPCB and state pollution boards

## 📜 License

This project is licensed under the MIT License.

## 👩‍💻 Authors

* Mahima (323103210040) — DApp Development, IDS Engine, Smart Contract
* Teammate 2 — Python Blockchain + Merkle Tree
* Teammate 3 — Testing & Documentation

## 🏫 Institution

**Gayatri Vidya Parishad College of Engineering for Women**
Department of Computer Science and Engineering
Under the guidance of **Dr. P. Muralidhara Rao**
Academic Year 2025–2026
