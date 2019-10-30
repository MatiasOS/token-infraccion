const Infraction = artifacts.require('./Infraction.sol');

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Infraction', accounts => {
  let ix;

  before(async () => {
    ix = await Infraction.deployed();
  })
  describe('Deployment', async () => {
    it('Deploys successfully', async () => {
      const address = ix.address;
      assert.notEqual(address, '');
      assert.notEqual(address, 0x0);
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    })
    it('Has a name', async () => {
      const name = await ix.name();
      assert.equal(name, 'Infraction');
    })
    it('Has a symbol', async () => {
      const symbol = await ix.symbol();
      assert.equal(symbol, 'IX');
    })
  })
})