const Infraction = artifacts.require('./Infraction.sol');

require('chai')
  .use(require('chai-as-promised'))
  .should();


/**
 * This constants are defined inside the smart contract as "enum InfractionStatus {...}"
 * This MUST be a copy, in same oreder, of InfractionStatus.
 */
const 
  PENDIENTE = 0,
  APROBADA = 1,
  ABONADA = 2,
  RECLAMADA = 3,
  RECHAZADA = 4,
  PENDIENTE_SEGUNDA_REVISION = 5,
  RECHAZADA_DEFINITIVO = 6;

contract('Infraction', accounts => {
  const _carId = 'abc123';
  const _proofUrl = 'https://someUrl.com/picture';
  const _proofDate = 1570665397057;
  const _gpsCoordsLat = -37349752;
  const _gpsCoordsLon = -59128150;
  let ix;
  let tokenId;
  let infraction;


  describe('State machine', async () => {
    describe('Happy approved path', async () => {
      before(async () => {
        ix = await Infraction.deployed();
        const proofDate = _proofDate;
        const result = await ix.mint(_carId, _proofUrl, proofDate, _gpsCoordsLat, _gpsCoordsLon);
        tokenId = result.logs[0].args.tokenId;
        infraction = await ix.getInfractionByTokenId(tokenId);
      })
      it('New infraction should be in state `PENDIENTE`', async () => {
        assert.equal(infraction.status, PENDIENTE);
      })

      it('An infraction in state `PENDIENTE` can be approved', async () => {
        infraction = await ix.getInfractionByTokenId(tokenId);
        assert.equal(infraction.status, PENDIENTE);
        await ix.setInfractionApproved(infraction.index);
        infraction = await ix.getInfractionByTokenId(tokenId);
        assert.equal(infraction.status, APROBADA);
      })

      it('An infraction in state `APROBADA` can be payed', async () => {
        infraction = await ix.getInfractionByTokenId(tokenId);
        assert.equal(infraction.status, APROBADA);
        await ix.setInfractionPayed(infraction.index);
        infraction = await ix.getInfractionByTokenId(tokenId);
        assert.equal(infraction.status, ABONADA);
      })

      it('An infraction in state `ABONADA` can be claimed', async () => {
        infraction = await ix.getInfractionByTokenId(tokenId);
        assert.equal(infraction.status, ABONADA);
        await ix.setInfractionClaimed(infraction.index);
        infraction = await ix.getInfractionByTokenId(tokenId);
        assert.equal(infraction.status, RECLAMADA);
      })
    })
    describe('Happy rejected path', async () => {
      before(async () => {
        const proofDate = _proofDate + 1;
        ix = await Infraction.deployed();
        const result = await ix.mint(_carId, _proofUrl, proofDate, _gpsCoordsLat, _gpsCoordsLon);
        tokenId = result.logs[0].args.tokenId;
        infraction = await ix.getInfractionByTokenId(tokenId);
      })
   
      it('Infraction should be in state `PENDIENTE`', async () => {
        assert.equal(infraction.status, PENDIENTE);
      })

      it('An infraction in state `PENDIENTE` can be rejected', async () => {
        infraction = await ix.getInfractionByTokenId(tokenId);
        assert.equal(infraction.status, PENDIENTE);
        await ix.setInfractionRejected(infraction.index);
        infraction = await ix.getInfractionByTokenId(tokenId);
        assert.equal(infraction.status, RECHAZADA);
      })

      it('An infraction in state `REJECTED` can be set for second revision', async () => {
        infraction = await ix.getInfractionByTokenId(tokenId);
        assert.equal(infraction.status, RECHAZADA);
        await ix.setInfractionSecondPending(infraction.index);
        infraction = await ix.getInfractionByTokenId(tokenId);
        assert.equal(infraction.status, PENDIENTE_SEGUNDA_REVISION);
      })

      it('An infraction in state `PENDIENTE_SEGUNDA_REVISION` can be finally rejected', async () => {
        infraction = await ix.getInfractionByTokenId(tokenId);
        assert.equal(infraction.status, PENDIENTE_SEGUNDA_REVISION);
        await ix.setInfractionTotallyRejected(infraction.index);
        infraction = await ix.getInfractionByTokenId(tokenId);
        assert.equal(infraction.status, RECHAZADA_DEFINITIVO);
      })
    })
  })
 
})
