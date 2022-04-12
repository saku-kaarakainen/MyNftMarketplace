# MyNftMarketplace
Me trying to make my own nft market place

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

 ## Deploy to run the deploy script:
>npx hardhat run contracts/scripts/deploy.js --network localhost 
>npx hardhat run contracts/scripts/deploy.js --network ropsten 

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

- to log inside the contract
># first, import console.log
>import "hardhat/console.sol";

## then, log things you wanted 
>>https://remix-ide.readthedocs.io/en/latest/%5C/hardhat_console.html
>function myContractFunction() {
>  console.log("Hello, world!");
>}


## MetaMask configurations
-Add new network
>Network Name: Hardhat Node
>RPC URL: http://127.0.0.1:8545
>Chain ID: 31337

-Import account
Use the private key of account #0




## Deploying
## Ropsten
npx hardhat run src/backend/scripts/deploy.js --network ropsten 
NFT contract address 0x145b9a4146f75ab5C2f76F4B038469786F7629f3
Marketplace contract address 0x9AcFaD8f813f3b103D679522C7Fd05ab2D0f1B31

### NOTES 
For gith