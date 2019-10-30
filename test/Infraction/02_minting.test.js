const Infraction = artifacts.require('./Infraction.sol');

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Infraction', accounts => {
  let ix;

  before(async () => {
    ix = await Infraction.deployed();
  })

  describe('Minting', async () => {
    it('Creates a new infraction', async () => {
      const result = await ix.mint(
        'abc123',
        'https://someUrl.com/picture.jpg',
        1570665397058,
        -37349752,
        -59128150
      );
      const totalSupply = await ix.totalSupply();
      assert.equal(totalSupply, 1);
      const event = result.logs[0].args;
      assert.equal(event.from, '0x0000000000000000000000000000000000000000');
      assert.equal(event.to, accounts[0]);
    })
  })
})