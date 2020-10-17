module.exports = {
  // default applies to all environments
  default: {
    // order of connections the dapp should connect to
    dappConnection: [
      "$WEB3",  // uses pre existing web3 object if available (e.g in Mist)
      "ws://localhost:8546",
      "http://localhost:8545"
    ],

    // Automatically call `ethereum.enable` if true.
    // If false, the following code must run before sending any transaction: `await EmbarkJS.enableEthereum();`
    // Default value is true.
    // dappAutoEnable: true,

    gas: "auto",

    // Strategy for the deployment of the contracts:
    // - implicit will try to deploy all the contracts located inside the contracts directory
    //            or the directory configured for the location of the contracts. This is default one
    //            when not specified
    // - explicit will only attempt to deploy the contracts that are explicitly specified inside the
    //            contracts section.
    // strategy: 'implicit',

    // minimalContractSize, when set to true, tells Embark to generate contract files without the heavy bytecodes
    // Using filteredFields lets you customize which field you want to filter out of the contract file (requires minimalContractSize: true)
    // minimalContractSize: false,
    // filteredFields: [],

    deploy: {
      // SimpleStorage: {
      //   fromIndex: 0,
      //   args: [100]
      // }
    }
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run`
  development: {
    dappConnection: [
      "ws://localhost:8546",
      "http://localhost:8545",
      "$WEB3"  // uses pre existing web3 object if available (e.g in Mist)
    ],
    deploy: {
        CrownsToken: {
            from: process.env.ADDRESS_1,
            args: [ ],
            gas: '3000000',
            gasPrice: '20 gwei',
            address: process.env.CROWNS  // previously deployed token's address
	},
	VestingContract: {
	    from: process.env.ADDRESS_1,
	    args: [process.env.CROWNS, process.env.ADDRESS_1],
	    gas: '3000000',
	    gasPrice: '20 gwei',
	    address: process.env.VESTING
	}
    }
  },

  // merges with the settings in default
  // used with "embark run privatenet"
  privatenet: {},

  // merges with the settings in default
  // used with "embark run testnet"
  testnet: {},

  // merges with the settings in default
  // used with "embark run livenet"
  livenet: {},

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  // custom_name: {}
  rinkeby: {
    strategy: 'explicit',
      deploy: {
        Crowns: {
         from: "0xCfdCCCD4c70EF6Cc4bfa704CD4d9b5311619361a",
         args: [ ],
         gas: '3000000',
         gasPrice: '20 gwei',
         // address: '0xbb60fd245e2821bc7a5c6eec4ef77a9a6bedfe53'  // previously deployed token's address
        }
    }
  }
};
