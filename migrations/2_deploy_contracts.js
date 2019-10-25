const Infraction = artifacts.require("Infraction");

module.exports = function(deployer) {
  deployer.deploy(Infraction);
};
