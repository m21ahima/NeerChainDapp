// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WaterSafety {

    address public owner;
    uint public constant ALERT_FEE = 0.001 ether;

    struct WaterReading {
        uint id;
        string city;
        int256 pH;
        uint256 turbidity;
        uint256 TDS;
        string status;
        string attackSignature;
        uint256 confidence;
        uint256 timestamp;
        address reportedBy;
    }

    struct Transaction {
        uint txId;
        string city;
        string status;
        string actionTaken;
        string authorityNotified;
        uint256 timestamp;
    }

    WaterReading[] public readings;
    Transaction[] public transactions;
    uint public readingCount = 0;
    uint public txCounter = 1000;

    event WaterAlertDetected(
        uint indexed id,
        string city,
        string status,
        string attackSignature,
        uint256 confidence,
        uint256 timestamp
    );

    event SmartContractExecuted(
        uint txId,
        string city,
        string actionTaken,
        string authorityNotified
    );

    constructor() {
        owner = msg.sender;
    }

    function addWaterReading(
        string memory _city,
        int256 _pH,
        uint256 _turbidity,
        uint256 _TDS,
        string memory _status,
        string memory _attackSignature,
        uint256 _confidence
    ) public payable {
        if (keccak256(bytes(_status)) != keccak256(bytes("SAFE"))) {
            require(msg.value >= ALERT_FEE, "Alert fee: 0.001 ETH required");
        }

        readingCount++;
        readings.push(WaterReading({
            id: readingCount,
            city: _city,
            pH: _pH,
            turbidity: _turbidity,
            TDS: _TDS,
            status: _status,
            attackSignature: _attackSignature,
            confidence: _confidence,
            timestamp: block.timestamp,
            reportedBy: msg.sender
        }));

        txCounter++;
        string memory action = _determineAction(_status);
        string memory authority = _notifyAuthority(_status);

        transactions.push(Transaction({
            txId: txCounter,
            city: _city,
            status: _status,
            actionTaken: action,
            authorityNotified: authority,
            timestamp: block.timestamp
        }));

        emit WaterAlertDetected(
            readingCount, _city, _status,
            _attackSignature, _confidence, block.timestamp
        );

        emit SmartContractExecuted(
            txCounter, _city, action, authority
        );
    }

    function _determineAction(string memory status)
        internal pure returns (string memory) {
        if (keccak256(bytes(status)) == keccak256(bytes("CRITICAL")))
            return "WATER_SUPPLY_FLAGGED + AUTHORITY_ALERT + EVIDENCE_LOCKED";
        if (keccak256(bytes(status)) == keccak256(bytes("ALERT")))
            return "WARNING_ISSUED + MONITORING_INCREASED";
        return "READING_LOGGED + CHAIN_UPDATED";
    }

    function _notifyAuthority(string memory status)
        internal pure returns (string memory) {
        if (keccak256(bytes(status)) == keccak256(bytes("CRITICAL")))
            return "CPCB + District_Collector + State_Pollution_Board";
        if (keccak256(bytes(status)) == keccak256(bytes("ALERT")))
            return "Municipal_Water_Authority";
        return "NONE";
    }

    function getReadingCount() public view returns (uint) {
        return readingCount;
    }

    function getReading(uint index) public view returns (
        uint, string memory, int256, uint256,
        uint256, string memory, string memory, uint256, uint256
    ) {
        WaterReading memory r = readings[index];
        return (r.id, r.city, r.pH, r.turbidity,
                r.TDS, r.status, r.attackSignature,
                r.confidence, r.timestamp);
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    function getTransaction(uint index) public view returns (
        uint, string memory, string memory,
        string memory, string memory, uint256
    ) {
        Transaction memory t = transactions[index];
        return (t.txId, t.city, t.status,
                t.actionTaken, t.authorityNotified, t.timestamp);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner");
        payable(owner).transfer(address(this).balance);
    }
}