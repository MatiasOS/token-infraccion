const Infraction = artifacts.require('./Infraction.sol');

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Infraction', accounts => {
  let ix;
  const _carId = 'abc123';
  const _proofUrl = 'https://someUrl.com/picture';
  const _proofDate = 1570665397057;
  const _gpsCoordsLat = -37349752;
  const _gpsCoordsLon = -59128150;

  before(async () => {
    ix = await Infraction.deployed();
    for (let c = 0; c<3; c++) {
      await ix.mint(_carId, _proofUrl + c, _proofDate + c, _gpsCoordsLat + c, _gpsCoordsLon + c);
    }
  })

  describe('Data access', async () => {
    it('List all infraction by car identifiers', async () => {
      const totalInfractions = await ix.getTotalInfractionsByCarId(_carId);
      assert.equal(totalInfractions.toNumber(), 3);
      const infractionsIndex = await ix.getInfractionsIndexByCarId(_carId);
      let i = 0;
      for await (index of infractionsIndex) {
        const {
          proofUrl, proofDate, status, gpsCoordsLat, gpsCoordsLon
        } = await ix.getInfractionByIndex(index);
        assert.equal(status.toNumber(), 0);
        assert.equal(proofDate, _proofDate + i);
        assert.equal(proofUrl, _proofUrl + i);
        assert.equal(gpsCoordsLat, _gpsCoordsLat + i);
        assert.equal(gpsCoordsLon, _gpsCoordsLon + i);
        i++;
      }
    })

    it('Access infraction by index', async () => {
      const infraction = await ix.getInfractionByIndex(0);
      assert.equal(infraction.status.toNumber(), 0);
      assert.equal(infraction.proofDate, _proofDate); 
      assert.equal(infraction.proofUrl, `${_proofUrl}0`); // confused? Check ln:18
      assert.equal(infraction.gpsCoordsLat, _gpsCoordsLat);
      assert.equal(infraction.gpsCoordsLon, _gpsCoordsLon);       
  })
    it('Access infraction by hash', async () => {
      let infraction = await ix.getInfractionByIndex(0);
      assert.equal(infraction.status.toNumber(), 0);
      assert.equal(infraction.proofDate, _proofDate); 
      assert.equal(infraction.proofUrl, `${_proofUrl}0`); // confused? Check ln:18
      assert.equal(infraction.gpsCoordsLat, _gpsCoordsLat);
      assert.equal(infraction.gpsCoordsLon, _gpsCoordsLon);
      const tokenId = infraction.tokenId;
      infraction = await ix.getInfractionByTokenId(tokenId);
      assert.equal(infraction.status.toNumber(), 0);
      assert.equal(infraction.proofDate, _proofDate); 
      assert.equal(infraction.proofUrl, `${_proofUrl}0`); // confused? Check ln:18
      assert.equal(infraction.gpsCoordsLat, _gpsCoordsLat);
      assert.equal(infraction.gpsCoordsLon, _gpsCoordsLon);
      
  })
  })
})
