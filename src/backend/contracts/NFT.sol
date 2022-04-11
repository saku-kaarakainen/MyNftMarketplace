// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract NFT is ERC721URIStorage {
  // state variables, costs gas to set these
  uint public tokenCount;

  // // https://docs.openzeppelin.com/contracts/2.x/api/token/erc721#ERC721
  constructor() ERC721('My NFT', 'MYNFT') {

  }

  // memory keyword - with strings you need to specify the memory location of the argument
  // So in this case it's in memory
  function mint(string memory _tokenURI) external returns (uint) {
    tokenCount++;

    _safeMint(msg.sender, tokenCount);
    _setTokenURI(tokenCount, _tokenURI);
    return (tokenCount);
  }
}