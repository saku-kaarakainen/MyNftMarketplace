const chai = require('chai');
const { expect } = require('chai');
const chaiAlmost = require('chai-almost');
const { ethers } = require("hardhat");
chai.use(chaiAlmost());

const toWei = (num) => ethers.utils.parseEther(num.toString()) // 1 ether == 10**18 wei
const fromWei = (num) => ethers.utils.formatEther(num)

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

        // Owner of NFT should now be the marketplace
        expect(await nft.ownerOf(1)).to.equal(marketplace.address);

        // Item count should be 1
        expect(await marketplace.itemCount()).to.equal(1)

        // Get item from items mapping, then check fields to ensure they are correct
        const item = await marketplace.items(1)

        expect(item.itemId.toNumber()).to.equal(1)
        expect(item.nft).to.equal(nft.address)
        expect(item.tokenId.toNumber()).to.equal(1)
        expect(item.price.toBigInt()).to.equal(toWei(1)) // wei value is too big for int
        // TODO: seller equals msg.sender
        expect(item.sold).to.equal(false)
    })

    it("Should fail if price is set to zero", async () => {
      await expect(marketplace.connect(addr1).makeItem(nft.address, 1, 0))
        .to.be.revertedWith("Price must be greater than zero")      
    })
  })

  describe("Purchasing market items", () => {
    let price = 2
    let totalPriceInWei
    beforeEach(async () => {
      // addr1 mints an nft
      await nft.connect(addr1).mint(URI)

      // addr1 approves marketplace to spend nft
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true)

      // addr1 make their nft a marketplace item.
      await marketplace.connect(addr1).makeItem(nft.address, 1, toWei(2))
    })

    it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async () => {
      const sellerInitialEthBal = await addr1.getBalance()
      const feeAccountInitialEthBal = await deployer.getBalance();

      // fetch items total price (market fees + item price)
      totalPriceInWei = await marketplace.getTotalPrice(1);

      // addr 2 purchases the item.
      await expect(marketplace.connect(addr2).purchaseItem(1, { value: totalPriceInWei }))
        .to.emit(marketplace, "Bought")
        .withArgs(1, nft.address, 1, toWei(price), addr1.address, addr2.address)

      const sellerFinalEthBal = await addr1.getBalance()
      const feeAccountFinalEthBal = await deployer.getBalance()

      // Seller should receive payment for the price of the NFT sold.
      expect(+fromWei(sellerFinalEthBal)).to.equal(+price + +fromWei(sellerInitialEthBal))

      // Calculate fee
      const fee = (feePercent / 100) * price
      
      // feeAcount should receive fee
      // In my taste cases the values are:
      // +fromWei(feeAccountFinalEthBal)            9999.989633656725
      // +fee + +fromWei(feeAccountInitialEthBal)   9999.989633656727
      // With other programming langues, i would care about this, but now I just assume this to be javascript rounding error
      // and that's why I'm using almost 
      expect(+fromWei(feeAccountFinalEthBal)).to.almost.equal(+fee + +fromWei(feeAccountInitialEthBal))

      // The buyer should now own the NFT
      expect(await nft.ownerOf(1)).to.equal(addr2.address);

      // Item should be marked as sold
      expect((await marketplace.items(1)).sold).to.equal(true);
    })

    it("Should fail for invalid item ids, sold items and when not enought ether is paid", async ()=> {
      // test1 1: fails for invalid item ids
      await expect(marketplace.connect(addr2).purchaseItem(2, { value: totalPriceInWei }))
        .to.be.revertedWith("The item doesn't exist")

      // test1 2: the same test with different parameter
      await expect(marketplace.connect(addr2).purchaseItem(0, { value: totalPriceInWei }))
        .to.be.revertedWith("The item doesn't exist")

      // test2: Fails when not enough ether is paid with the transaction.
      await expect(marketplace.connect(addr2).purchaseItem(1, { value: toWei(price) }))
        .to.be.revertedWith("Not enought ether to conver item price and market fee")
    
      // test3: Deployer tried purchasing item 1 after it's been sold
      await marketplace.connect(addr2).purchaseItem(1, { value: totalPriceInWei })
      await expect(marketplace.connect(deployer).purchaseItem(1, { value: totalPriceInWei }))
        .to.be.revertedWith("item already sold");
    })
  })
})