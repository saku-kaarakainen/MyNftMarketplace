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


# Notes to myself
- to run nodes to connect
>npx hardhat node 

 - to run the deploy script:
 >npx hardhat run src/backend/scripts/deploy.js --network localhost

 - get the deployed contract
>npx hardhat console --network localhost
>const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; # Note this can change, you need to check this from the hardhat node console.
>const contract = await ethers.getContractAt("NFT", contractAddress);
># Now you can investigate your contract, for example with the following scripts
>const tokenCount = await contract.tokenCount() 
>const name = await contract.name()
>const symbol = await contract.symbol() 
