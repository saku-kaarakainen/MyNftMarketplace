# MyNftMarketplace
Me trying to make my own nft market place


# How did I do this?
I followed pretty much the tutorials of Dapp University.

## Dependencies
- Node.js (v16.14.2)
- (npm)
- MetaMask browser extension
- dapp university's [starter kit 2](https://github.com/dappuniversity/starter_kit_2)
- NPM packagets
  - react-router-dom@6
  - hardhat@2.8.4
  - react-router-dom@6
  - ipfs-http-client@56.0.1
  - @openzeppelin/contracts@4.5.0
  - chai@latest 

# Notes to myself
- to run nodes to connect
>npx hardhat node 

 - to run the deploy script:
 >npx hardhat run src/backend/scripts/deploy.js --network localhost

 - get the deployed contract
>npx hardhat console --network localhost
>const contractAddressNFT = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
>const contractAddressMarketplace = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
>const nftContract = await ethers.getContractAt("NFT", contractAddressNFT);
>const contractMarketplace = await ethers.getContractAt("Marketplace", contractAddressMarketplace);
># Now you can investigate your contract, for example with the following scripts
>const tokenCount = await nftContract.tokenCount() 
>const name = await nftContract.name()
>const symbol = await nftContract.symbol() 
>const feePercent = await contractMarketplace.feePercent();
>const feeAccount = await contractMarketplace.feeAccount();

## Tests
- to run the tests
>npx hardhat test
>1h08m08s