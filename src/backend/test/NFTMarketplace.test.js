const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
  // Get contract factories
  let deployer, addr1, addr2, nft, marketplace
  let feePercent = 1 
  let URI = "https://uriOfMyNft";

  // the video uses "async function() { }", but it agains the lint rules:
  // https://github.com/jest-community/eslint-plugin-jest/blob/v25.7.0/docs/rules/valid-describe-callback.md
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
      expect(await nft.name()).to.equal("My NFT") // TODO: fix lint error (i guess just ignore it in lint configs)
      expect(await nft.symbol()).to.equal("MYNFT")
    })

    it("Should track feeAccount and feePercent of the marketplace", async function() {
      expect(await marketplace.feeAccount()).to.equal(deployer.address);
      expect(await marketplace.feePercent()).to.equal(feePercent);
    })
  })

  describe("Minting NFTs", function () {
    it("Should track each minted NFT", async () => {
        // addr1 mints an NFT
        await nft.connect(addr1).mint(URI)
        expect(await nft.tokenCount()).to.equal(1)
        expect(await nft.balanceOf(addr1.address)).to.equal(1)
        expect(await nft.tokenURI(1)).to.equal(URI);

        // addr2 mints an NFT
        await nft.connect(addr2).mint(URI)
        expect(await nft.tokenCount()).to.equal(2)
        expect(await nft.balanceOf(addr1.address)).to.equal(1)
        expect(await nft.tokenURI(2)).to.equal(URI);
    });
  })

  describe("Making marketplace items", () => {
    beforeEach(async () => {
      // addr1 mints an NFT
      await nft.connect(addr1).mint(URI)

      // addr1 approves marketplace to spend NFT
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
    })

    it("Should track newly created item, transfer NFT from seller to marketplace and emit Offerent event", async() => {
      // addr1 offers their NFT at a prrice of 1 ether
      await expect(marketplace.connect(addr1).makeItem(nft.address, 1, toWei(1)))
        .to.emit(marketplace, "Offered")
        .withArgs(1, nft.address, 1, toWei(1), addr1.address)
    })
  })
})