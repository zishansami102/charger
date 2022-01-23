var Charger = artifacts.require("./UserPlanSubscriptions.sol");

module.exports = function(deployer) {
	deployer.deploy(Charger);
};