// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

// TODO: Remove this, when you don't need this anymore
import "hardhat/console.sol";

contract Marketplace is ReentrancyGuard {
  // State variables
  address payable public immutable feeAccount;  // The account that receives the fees
  uint public immutable feePercent; // The fee percentage on sales
  uint public itemCount;

  struct Item{
    uint itemId;
    IERC721 nft; // https://docs.openzeppelin.com/contracts/2.x/api/token/erc721#ERC721
    uint tokenId;
    uint price;
    address payable seller;
    bool sold;
  }

  event Offered (
    uint itemId,
    address indexed nft,
    uint tokenId,
    uint price,
    address indexed seller
  );

  event Bought(
    uint itemId,
    address indexed nft,
    uint tokenId,
    uint price,
    address indexed seller,
    address indexed buyer
  );

  // itemId -> Item
  mapping(uint => Item) public items;

  constructor(uint _feePercentage) {
    feeAccount = payable(msg.sender); // sender casted as payable
    feePercent = _feePercentage;
  }

  // nonReentrant: Makes it secure: https://docs.openzeppelin.com/contracts/2.x/api/utils
  // >Prevents a contract from calling itself, directly or indirectly. Calling a nonReentrant function from another nonReentrant function is not supported. 
  // >It is possible to prevent this from happening by making the nonReentrant function external, and make it call a private function that does the actual work.
  function makeItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant {
    require(_price > 0, 'Price must be greater than zero');
    
    itemCount++;

    // transfer NFT
    _nft.transferFrom(msg.sender, address(this), _tokenId);

    // Add new item to items mapping
    items[itemCount] = Item (
      itemCount, 
      _nft, 
      _tokenId, 
      _price,
      payable(msg.sender), // Seller
      false
    );

    // emit Offeret event
    emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
  }

  function purchaseItem(uint _itemId) external payable nonReentrant {
    uint _totalPrice = getTotalPrice(_itemId);
    Item storage item = items[_itemId]; // storage keyword because it's directly from storage and won't create a memory copy of the item.
    require(_itemId > 0 && _itemId <= itemCount, "The item doesn't exist");
    require(msg.value >= _totalPrice, "Not enought ether to conver item price and market fee");
    require(!item.sold, "item already sold!");
    // pay seller and feeAccount
    item.seller.transfer(item.price);
    feeAccount.transfer(_totalPrice - item.price);

    // update item to sold
    item.sold = true;

    // transfer NFT to buyer
    item.nft.transferFrom(address(this), msg.sender, item.tokenId);

    // Emit Bought event
    emit Bought(_itemId, address(item.nft), item.tokenId, item.price, item.seller, msg.sender);
  }

  function getTotalPrice(uint _itemId) view public returns(uint) {
    return (items[_itemId].price*(100 + feePercent)/100);
  }
}