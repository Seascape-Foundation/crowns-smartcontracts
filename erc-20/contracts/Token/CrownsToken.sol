// contracts/Crowns.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.6.7;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/GSN/Context.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/utils/Address.sol";

contract Crowns is Context, IERC20, Ownable {
    using SafeMath for uint256;
    using Address for address;

    struct Account {
        uint256 balance;
        uint256 lastDividends;
    }

    mapping (address => Account) private _accounts;

    mapping (address => mapping (address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;
    uint8 private _decimals;

    uint256 private constant _decimalFactor = 10 ** 18;
    uint256 private constant _million = 1000000;

    constructor (address newOwner) public {
        _name = "Crowns";
        _symbol = "CWS";
        _decimals = 18;

        // Grant the minter role to a specified account
        address inGameAirdropper = 0xFa4D7D1AC9b7a7454D09B8eAdc35aA70599329EA;
        address rechargeDexManager = 0x53bd91aEF5e84A61F9B87781A024ee648733f973;
        address teamManager = 0xB5de2b5186E1Edc947B73019F3102EF53c2Ac691;

        address investManager = 0x1D3Db9BCA5aa2CE931cE13B7B51f8E14F5895368;
        address communityManager = 0x0811e2DFb6482507461ca2Ab583844313f2549B5;
//        address newOwner = 0x084b488B3cC68E9aECaCE8ABbe91E72D2Ff57C9B;

        uint256 inGameAirdrop = 3 * _million * _decimalFactor;
        uint256 rechargeDex = inGameAirdrop; // same as to use in game, airdrops: 3 million tokens
        uint256 teamAllocation = 1 * _million * _decimalFactor;
        uint256 investment = teamAllocation;    // same as team allocation: 1 million tokens
        uint256 communityBounty = 750000 * _decimalFactor;  // 750,000 tokens
        uint256 inGameReserve = 1250000 * _decimalFactor; // reserve for the next 5 years.

        _mint(inGameAirdropper, inGameAirdrop);
        _mint(rechargeDexManager, rechargeDex);
        _mint(teamManager, teamAllocation);
        _mint(investManager, investment);
        _mint(communityManager, communityBounty);
        _mint(newOwner, inGameReserve);

        transferOwnership(newOwner);
    }

    // Dividends from recharged Tokens
    uint256 public unClaimedDividends = 0;
    uint256 public unConfirmedDividends = 0;
    uint256 public totalDividends = 0;

    function dividendsOwing (address account) public view returns(uint256) {
      uint256 newDividends = totalDividends.sub(_accounts[account].lastDividends);
      uint256 proportion = _accounts[account].balance.mul(newDividends);

      // dividends owing proportional to current balance of the account.
      // The dividend is not a part of total supply, since was moved out of balances
      uint256 supply = _totalSupply.sub(newDividends);
      uint256 dividends = proportion.mul(_decimalFactor).div(supply).div(_decimalFactor);

      return dividends;
    }

    modifier updateAccount(address account) {
      uint256 owing = dividendsOwing(account);
      if(owing > 0) {
        _accounts[account].balance = _accounts[account].balance.add(owing);
        _accounts[account].lastDividends = totalDividends;
        unClaimedDividends = unClaimedDividends.sub(owing);
        emit Transfer(
            address(0),
            account,
            owing
        );
      } else {
          _accounts[account].lastDividends = totalDividends;
      }
      _;
    }

    function explicityUpdate(address account) public onlyOwner() {
        uint256 owing = dividendsOwing(account);
          if(owing > 0) {
            _accounts[account].balance = _accounts[account].balance.add(owing);
            _accounts[account].lastDividends = totalDividends;
            unClaimedDividends = unClaimedDividends.sub(owing);
          } else {
              _accounts[account].lastDividends = totalDividends;
          }
    }

        /**
     * @dev Returns the name of the token.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5,05` (`505 / 10 ** 2`).
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view returns (uint8) {
        return _decimals;
    }


    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return getBalance(account);
    }

    /**
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
        return true;
    }
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
        return true;
    }

    function getLastDividends(address addr) public view returns (uint256) {
        return _accounts[addr].lastDividends;
    }

    function getBalance(address addr) private view returns (uint256) {
        uint256 balance = _accounts[addr].balance;
    	if (balance == 0) {
    		return 0;
    	}
    	uint256 owing = dividendsOwing(addr);
    	return balance.add(owing);
    }

    function _transfer(address sender, address recipient, uint256 amount) internal updateAccount(sender) updateAccount(recipient) virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "Can not send 0 token");
        require(getBalance(sender) >= amount, "ERC20: Not enough token to send");

        _beforeTokenTransfer(sender, recipient, amount);

        _accounts[sender].balance =  _accounts[sender].balance.sub(amount);
        _accounts[recipient].balance = _accounts[recipient].balance.add(amount);

        emit Transfer(sender, recipient, amount);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements
     *
     * - `to` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply = _totalSupply.add(amount);
        _accounts[account].balance = _accounts[account].balance.add(amount);
        emit Transfer(address(0), account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 amount) internal updateAccount(account) virtual {
        require(account != address(0), "ERC20: burn from the zero address");
        require(getBalance(account) >= amount, "ERC20: Not enough token to burn");

        _beforeTokenTransfer(account, address(0), amount);

        _accounts[account].balance = _accounts[account].balance.sub(amount);

        unConfirmedDividends = unConfirmedDividends.add(amount);

        emit Transfer(account, address(0), amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual { }

    function spend(uint256 amount) public {
        require(getBalance(msg.sender) >= amount, "Crowns: Not enough balance");

        _burn(msg.sender, amount);
    }

    event DividendDropped(
        uint256 unclaimedDividends,
        uint256 totalDividends
    );

    /**
     * Warning, no validation!
     * dropDividend changes balance of all token owners.
     * @param  {[type]} amount [description]
     * @return {[type]}        [description]
     */
    function dropDividend() public onlyOwner() returns (bool) {
    	totalDividends = totalDividends.add(unConfirmedDividends);
    	unClaimedDividends = unClaimedDividends.add(unConfirmedDividends);
    	unConfirmedDividends = 0;

        emit DividendDropped(
            unClaimedDividends,
            totalDividends
        );
        return true;
    }
}
