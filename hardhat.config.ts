/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import { HardhatUserConfig, HardhatNetworkUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import "hardhat-etherscan-abi";
import "@nomiclabs/hardhat-solhint";
import "solidity-coverage";
import 'hardhat-deploy';
import 'hardhat-dependency-compiler';

// const accounts = {
//   mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
//   accountsBalance: "990000000000000000000",
// }

let hardhat: HardhatNetworkUserConfig = {
  blockGasLimit: 20000000,
  allowUnlimitedContractSize: true,
  chainId: 1,
}

if (process.env.FORK_MAINNET) {
  console.log("Using mainnet fork")
  hardhat = {
    forking: {
      url: `${process.env.ALCHEMY_URL}`,
    },
    ...hardhat
  }
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.6.12",
    settings: {
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    }
  },

  networks: {
    hardhat,
    mainnet: {
      url: `${process.env.ALCHEMY_URL}`,
      accounts: {
        mnemonic: process.env.HDWALLET_MNEMONIC || ""
      }
    },
    kovan: {
      url: `${process.env.WEB3_INFURA_PROJECT_ID}`,
      accounts: {
        mnemonic: process.env.HDWALLET_MNEMONIC || ""
      }
    },
    rinkeby: {
      url: `${process.env.WEB3_INFURA_PROJECT_ID}`,
      accounts: {
        mnemonic: process.env.HDWALLET_MNEMONIC || ""
      }
    },
    localhost: {
      chainId: 1,
      url: 'http://127.0.0.1:8545',
      allowUnlimitedContractSize: true
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_TOKEN
  },
  mocha: {
    timeout: 60000
  },
  dependencyCompiler: {
    paths: [
      "@pooltogether/pooltogether-contracts/contracts/builders/PoolWithMultipleWinnersBuilder.sol",
      "@pooltogether/pooltogether-contracts/contracts/registry/Registry.sol",
      "@pooltogether/pooltogether-contracts/contracts/prize-pool/compound/CompoundPrizePoolProxyFactory.sol",
      "@pooltogether/pooltogether-contracts/contracts/prize-pool/yield-source/YieldSourcePrizePoolProxyFactory.sol",
      "@pooltogether/pooltogether-contracts/contracts/prize-pool/stake/StakePrizePoolProxyFactory.sol",
      "@pooltogether/pooltogether-contracts/contracts/builders/MultipleWinnersBuilder.sol",
      "@pooltogether/pooltogether-contracts/contracts/prize-strategy/multiple-winners/MultipleWinnersProxyFactory.sol",
      "@pooltogether/pooltogether-contracts/contracts/builders/ControlledTokenBuilder.sol",
      "@pooltogether/pooltogether-contracts/contracts/token/ControlledTokenProxyFactory.sol",
      "@pooltogether/pooltogether-contracts/contracts/token/TicketProxyFactory.sol",
    ]
  },

  namedAccounts: {
    deployer: {
      default: 0
    },
    sushiBar: {
      "localhost": "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272",
      "mainnet": "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272",
      "kovan": "0xe665b9c01ac0fc4191c6193531e54d095eefa8ac",
      "rinkeby": "0x1be211D8DA40BC0ae8719c6663307Bfc987b1d6c",
    },
    sushiToken: {
      "localhost": "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
      "mainnet": "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
      "kovan": "0xc2a7e01df02f429fdc45e655bba5f158406455a6",
      "rinkeby": "0x0769fd68dFb93167989C6f7254cd0D766Fb2841F",
    }
  },
};

export default config;
