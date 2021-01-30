# What is *Crowns*?
Seascape Network is an incentivized ecosystem consisting of gamers, developers, and influencers. By gamifying the process of onboarding new users into the DeFi ecosystem from start to finish and removing complex barriers, the Seascape Network allows users to seamlessly enter the world of blockchain games and decentralized finance. 

* For Seascape Network's other smartcontract visit [`seascape-smartcontracts`](https://github.com/blocklords/seascape-smartcontracts)
* See the [lightpaper](http://oss.seascape.network/Seascape_lightpaper.pdf).

Crowns are the official token of the Seascape Network. As such, they are designed to reward all key stakeholders within the network.


Deployed contracts on Mainnet:
- [`0xac0104cca91d167873b8601d2e71eb3d4d8c33e0`](https://etherscan.io/token/0xac0104cca91d167873b8601d2e71eb3d4d8c33e0) &ndash; Crowns (CWS) token.

Deployed contracts on Rinkeby:
- [`0x230191380F0129e70F8D8B6585c7608656131CD0`](https://rinkeby.etherscan.io/token/0x230191380F0129e70F8D8B6585c7608656131CD0) &ndash; Crowns (CWS) token.

*Crowns (CWS)* could be obtained through purchase on
- [UniSwap](https://uniswap.org), 
- and other exchanges 

or, can be earned within the Blocklords game.

# Crowns (CWS) features

Crowns (CWS) is an erc-20 token on Ethereum. It's primarely used to purchase within Blocklords. The **unique feature** of ***Crowns*** is that, every recharge within the game is spread accross all token holders as dividends. We call it **rebase**.

### Tokenomi
Crown has a fixed supply. Total of 10,000,000 CWS.
* 5,000,000 CWS or 50% is going to game incentives
* 1,000,000 CWS or 10% is going to community
* 1,000,000 CWS or 10% is going to investors
* 1,000,000 CWS or 10% is going to team
* 5,000 CWS or 5% is going to exchanges
* 1,500,000 CWS or 15% is going to reserve locke up for 5 years.

# Vesting Contract
Is a simple contract used to lock Crowns for a certain period of time. It's based on OpenZeppelin's TimeLock token.
**Deprecated**

---

# Technical part
## Online usage
To play with contracts online, you can directly import the gist code on Remix, an online editor.
[Crowns on Remix!](https://remix.ethereum.org/#version=soljson-v0.6.7+commit.b8d736ae.js&optimize=false&gist=4f896fa3b55d8dcedb64ef67dc1349b5)

### Rinkeby testnet addresses:
*ERC-20 Crowns* - `0xe157A3036d1c5C0EC3fAFF3c3AbcFf1300191047`, owned by `0x084b488B3cC68E9aECaCE8ABbe91E72D2Ff57C9B`

*Vesting Contract* - `0xE6111b1fC47B41F9EF613700Bd2B506526fb67a5`, owned by `0x02832a2ca659E429b0abA8dDC5f202B73AD901BA`

### Abi files:
Abi files generated by Remix are available at [blocklords/crowns/abi/](https://github.com/blocklords/crowns/tree/master/abi) folder.
It may be used to use to interact with blockchain by 3rd party online tools.

## Offline usage:
This project is built by *Embark.js* framework. Clone this git onto your machine. Please refer to [Embark page](https://github.com/embarklabs/embark) for instructions.
Once you've installed Embark, type on command:
```sh
embark run rinkeby
```

## Contribution, Suggestion

Want to contribute? Pull a request, or open an issue.
