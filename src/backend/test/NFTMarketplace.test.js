const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", async function () {
  // Get contract factories
  let deployer, addr1, addr2, nft, marketplace
  let feePercent = 1 

  beforeEach(async function () {
    const nftFactory = await ethers.getContractFactory("NFT");
    const marketplaceFactory = await ethers.getContractFactory("Marketplace");
    
    // Get signers
    [deployer, addr1, addr2] = await ethers.getSigners()

    // Deploy contracts
    nft = await nftFactory.deploy();
    marketplace = await marketplaceFactory.deploy(feePercent); // We deploy withm marketplace with 1% fees
  });

  describe("Deployment", function() {
    it("Should track name and symbol of the NFT collection", async function() {
      expect( await nft.name()).to.equal("My NFT")
      expect( await nft.symbol()).to.equal("MYNFT")
    })
  })
})