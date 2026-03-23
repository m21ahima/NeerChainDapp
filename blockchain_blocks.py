import hashlib
import time
import json

# ============================================
# BLOCK CLASS
# ============================================
class Block:
    def __init__(self, index, data, previous_hash="0"):
        self.index = index
        self.timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        self.data = data
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

    def mine_block(self, difficulty=2):
        target = "0" * difficulty
        print(f"\n⛏️  Mining Block #{self.index}...")
        while not self.hash.startswith(target):
            self.nonce += 1
            self.hash = self.calculate_hash()
        print(f"✅ Block #{self.index} mined! Nonce: {self.nonce}")
        print(f"   Hash: {self.hash}")

    def display(self):
        print(f"\n{'='*60}")
        print(f"  BLOCK #{self.index}")
        print(f"{'='*60}")
        print(f"  Timestamp   : {self.timestamp}")
        print(f"  Data        : {self.data}")
        print(f"  Nonce       : {self.nonce}")
        print(f"  Prev Hash   : {self.previous_hash[:30]}...")
        print(f"  Hash        : {self.hash[:30]}...")
        print(f"{'='*60}")


# ============================================
# BLOCKCHAIN CLASS
# ============================================
class Blockchain:
    def __init__(self):
        self.chain = []
        self.difficulty = 2
        print("🌊 NeerChain — Blockchain Initialized")
        print("Creating Genesis Block...")
        self.create_genesis_block()

    def create_genesis_block(self):
        genesis = Block(0, "Genesis Block — NeerChain Water Safety", "0")
        genesis.mine_block(self.difficulty)
        self.chain.append(genesis)

    def add_block(self, data):
        previous_block = self.chain[-1]
        new_block = Block(
            index=len(self.chain),
            data=data,
            previous_hash=previous_block.hash
        )
        new_block.mine_block(self.difficulty)
        self.chain.append(new_block)
        return new_block

    def is_chain_valid(self):
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            if current.hash != current.calculate_hash():
                print(f"❌ Block #{i} hash is invalid!")
                return False

            if current.previous_hash != previous.hash:
                print(f"❌ Block #{i} previous hash mismatch!")
                return False

        return True

    def display_chain(self):
        print(f"\n{'='*60}")
        print(f"  🔗 NEERCHAIN — FULL BLOCKCHAIN")
        print(f"{'='*60}")
        for block in self.chain:
            block.display()

    def display_summary(self):
        print(f"\n{'='*60}")
        print(f"  📊 BLOCKCHAIN SUMMARY")
        print(f"{'='*60}")
        print(f"  Total Blocks : {len(self.chain)}")
        print(f"  Difficulty   : {self.difficulty}")
        print(f"  Chain Valid  : {'✅ Yes' if self.is_chain_valid() else '❌ No'}")
        print(f"{'='*60}")


# ============================================
# MERKLE TREE
# ============================================
class MerkleTree:
    def __init__(self, transactions):
        self.transactions = transactions
        self.root = self.build_tree(transactions)

    def hash_data(self, data):
        return hashlib.sha256(data.encode()).hexdigest()

    def build_tree(self, transactions):
        if len(transactions) == 0:
            return None

        # Hash all transactions
        nodes = [self.hash_data(tx) for tx in transactions]

        print(f"\n{'='*60}")
        print(f"  🌿 MERKLE TREE — NeerChain")
        print(f"{'='*60}")
        print(f"\n  📋 Leaf Nodes (Transaction Hashes):")
        for i, (tx, node) in enumerate(zip(transactions, nodes)):
            print(f"  TX{i+1}: {tx[:40]}...")
            print(f"       Hash: {node[:30]}...")

        # Build tree level by level
        level = 1
        while len(nodes) > 1:
            if len(nodes) % 2 != 0:
                nodes.append(nodes[-1])  # duplicate last if odd

            new_nodes = []
            print(f"\n  Level {level} nodes:")
            for i in range(0, len(nodes), 2):
                combined = nodes[i] + nodes[i + 1]
                parent = self.hash_data(combined)
                new_nodes.append(parent)
                print(f"  Hash({nodes[i][:15]}... + {nodes[i+1][:15]}...)")
                print(f"  = {parent[:30]}...")
            nodes = new_nodes
            level += 1

        print(f"\n  🌳 MERKLE ROOT:")
        print(f"  {nodes[0]}")
        print(f"{'='*60}")
        return nodes[0]


# ============================================
# MAIN — NeerChain Water Safety Data
# ============================================
if __name__ == "__main__":

    print("\n" + "🌊" * 30)
    print("   NEERCHAIN — BLOCKCHAIN + MERKLE TREE DEMO")
    print("🌊" * 30)

    # Create blockchain
    neerchain = Blockchain()

    # NeerChain water safety transactions
    water_readings = [
        {
            "city": "Vijayawada",
            "pH": 4.8,
            "turbidity": 7.5,
            "TDS": 620,
            "DO": 3.2,
            "status": "CRITICAL",
            "signature": "CHEMICAL_DUMP",
            "confidence": "99%",
            "action": "WATER_SUPPLY_FLAGGED",
            "authority": "CPCB + District_Collector"
        },
        {
            "city": "Guntur",
            "pH": 7.2,
            "turbidity": 2.1,
            "TDS": 310,
            "DO": 7.8,
            "status": "SAFE",
            "signature": "NONE",
            "confidence": "95%",
            "action": "READING_LOGGED",
            "authority": "NONE"
        },
        {
            "city": "Rajahmundry",
            "pH": 5.1,
            "turbidity": 6.8,
            "TDS": 480,
            "DO": 4.5,
            "status": "ALERT",
            "signature": "INDUSTRIAL_RUNOFF",
            "confidence": "87%",
            "action": "WARNING_ISSUED",
            "authority": "Municipal_Water_Authority"
        },
        {
            "city": "Visakhapatnam",
            "pH": 9.2,
            "turbidity": 3.5,
            "TDS": 420,
            "DO": 5.8,
            "status": "ALERT",
            "signature": "ALKALINE_POLLUTION",
            "confidence": "78%",
            "action": "WARNING_ISSUED",
            "authority": "Municipal_Water_Authority"
        }
    ]

    # Add blocks
    print("\n📦 Adding water safety readings to blockchain...")
    for reading in water_readings:
        neerchain.add_block(json.dumps(reading))

    # Display full chain
    neerchain.display_chain()

    # Display summary
    neerchain.display_summary()

    # Build Merkle Tree
    print("\n\n🌿 Building Merkle Tree from transactions...")
    tx_strings = [
        f"TX{i+1}: {r['city']} | {r['status']} | {r['signature']}"
        for i, r in enumerate(water_readings)
    ]
    merkle = MerkleTree(tx_strings)

    print("\n✅ COMPLETE!")
    print(f"   Blockchain blocks: {len(neerchain.chain)}")
    print(f"   Merkle root: {merkle.root[:30]}...")
    print(f"   Chain valid: {neerchain.is_chain_valid()}")