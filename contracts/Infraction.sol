pragma solidity 0.5.8;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";

contract Infraction is ERC721Full {

  enum InfractionStatus {
    PENDIENTE,
    APROBADA,
    ABONADA,
    RECLAMADA,
    RECHAZADA,
    PENDIENTE_SEGUNDA_REVISION,
    RECHAZADA_DEFINITIVO
  }
  struct InfractionData {
    string carId;
    string proofUrl;
    uint256 proofDate;
    uint256 tokenId;
    InfractionStatus status;
    int gpsCoordsLat;
    int gpsCoordsLon;
  }

  InfractionData[] infractions;
  mapping(uint256 => uint256) infractionsId;
  mapping(string => uint256[]) infractionsByCarId;


  constructor() ERC721Full("Infraction","IX") public {
  }

  function mint(
    string memory _carId,
    string memory _proofUrl,
    uint256 _proofdate,
    int _gpsCoordsLat,
    int _gpsCoordsLon
    ) public {
    bytes memory encoded = abi.encodePacked(_carId, _proofdate);
    uint256 tokenId = uint256(keccak256(encoded));
    require(infractionsId[tokenId] == 0, 'Infraction Hash exists');
    infractionsId[tokenId] = infractions.length;

    infractions.push(
      InfractionData(
        _carId, _proofUrl, _proofdate, tokenId, InfractionStatus.PENDIENTE, _gpsCoordsLat, _gpsCoordsLon
        )
    );

    uint256[] storage infractionByCarId = infractionsByCarId[_carId]; // storage is a pointer?
    infractionByCarId.push(infractions.length - 1);

    _mint(msg.sender, tokenId);
  }

  function getInfractionsIndexByCarId(string memory _carId) public view returns (uint256[] memory) {
    uint256[] memory infractionsIndex = infractionsByCarId[_carId];
    return (infractionsIndex);
  }

  function getTotalInfractionsByCarId(string memory _carId) public view returns(uint256) {
    uint256 totalInfractions = infractionsByCarId[_carId].length;
    return (totalInfractions);
  }

  function getInfractionByIndex(uint _index) public view
    returns (
      string memory carId,
      string memory proofUrl,
      uint256 proofDate,
      uint256 tokenId,
      InfractionStatus status,
      int gpsCoordsLat,
      int gpsCoordsLon
    ) {
      return (
        infractions[_index].carId,
        infractions[_index].proofUrl,
        infractions[_index].proofDate,
        infractions[_index].tokenId,
        infractions[_index].status,
        infractions[_index].gpsCoordsLat,
        infractions[_index].gpsCoordsLon
      );
  }

    function getInfractionByTokenId(uint _tokenId) public view
    returns (
      uint index,
      string memory carId,
      string memory proofUrl,
      uint256 proofDate,
      uint256 tokenId,
      InfractionStatus status,
      int gpsCoordsLat,
      int gpsCoordsLon
    ) {
      index = infractionsId[_tokenId];
      return (
        index,
        infractions[index].carId,
        infractions[index].proofUrl,
        infractions[index].proofDate,
        infractions[index].tokenId,
        infractions[index].status,
        infractions[index].gpsCoordsLat,
        infractions[index].gpsCoordsLon
      );
  }

  // State machine functions
  function setInfractionApproved(uint256 infractionIndex) public {
    InfractionData storage infraction = infractions[infractionIndex];
    bool isValidStatus = infraction.status == InfractionStatus.PENDIENTE || infraction.status == InfractionStatus.PENDIENTE_SEGUNDA_REVISION;
    require(isValidStatus, 'Invalid infraction status');
    infraction.status = InfractionStatus.APROBADA;
  }

  function setInfractionPayed(uint256 infractionIndex) public {
    InfractionData storage infraction = infractions[infractionIndex];
    bool isValidStatus = infraction.status == InfractionStatus.APROBADA;
    require(isValidStatus, 'Invalid infraction status');
    infraction.status = InfractionStatus.ABONADA;
  }

  function setInfractionClaimed(uint256 infractionIndex) public  {
    InfractionData storage infraction = infractions[infractionIndex];
    bool isValidStatus = infraction.status == InfractionStatus.ABONADA;
    require(isValidStatus, 'Invalid infraction status');
    infraction.status = InfractionStatus.RECLAMADA;
  }


  function setInfractionRejected(uint256 infractionIndex) public {
    InfractionData storage infraction = infractions[infractionIndex];
    bool isValidStatus = infraction.status == InfractionStatus.PENDIENTE;
    require(isValidStatus, 'Invalid infraction status');
    infraction.status = InfractionStatus.RECHAZADA;
  }

    function setInfractionSecondPending(uint256 infractionIndex) public {
    InfractionData storage infraction = infractions[infractionIndex];
    bool isValidStatus = infraction.status == InfractionStatus.RECHAZADA;
    require(isValidStatus, 'Invalid infraction status');
    infraction.status = InfractionStatus.PENDIENTE_SEGUNDA_REVISION;
  }

  function setInfractionTotallyRejected(uint256 infractionIndex) public {
    InfractionData storage infraction = infractions[infractionIndex];
    bool isValidStatus = infraction.status == InfractionStatus.PENDIENTE_SEGUNDA_REVISION || infraction.status == InfractionStatus.APROBADA;
    require(isValidStatus, 'Invalid infraction status');
    infraction.status = InfractionStatus.RECHAZADA_DEFINITIVO;
  }

}
