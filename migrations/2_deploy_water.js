const WaterSafety = artifacts.require("WaterSafety");

module.exports = function (deployer) {
  deployer.deploy(WaterSafety);
};