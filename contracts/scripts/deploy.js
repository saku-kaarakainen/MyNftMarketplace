const { ethers } = require("hardhat");

const _args = parseArguments(process.env.npm_lifecycle_script)
const network = _args[1]

async function main(args) {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contracts here:
  const nftFactory = await ethers.getContractFactory("NFT");
  const nft = await nftFactory.deploy();

  const marketplaceFactory = await ethers.getContractFactory("Marketplace");
  const marketplace = await marketplaceFactory.deploy(1); // We deploy withm marketplace with 1% fees

  console.log("NFT contract address", nft.address);
  console.log("Marketplace contract address", marketplace.address);

  // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
  saveFrontendFiles(nft, "NFT");
  saveFrontendFiles(marketplace, "Marketplace");
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = `${__dirname}/../../src/contractsData/${network}/`;

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main(_args)
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

function parseArguments(source) {
  let args = source
    .split(' ') //into an array
      .map(str => str.replace(/(^"|"$)/g, '')) // remove quotes from beginning and end

  // 0: hardhat
  // 1: run
  // 2: script source
  //, the rest
  args.splice(0, 3)

  return args
}