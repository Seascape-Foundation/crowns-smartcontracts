// contracts/Crowns.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.6.7;

//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/GSN/Context.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/utils/Address.sol";

contract Crowns is Context, IERC20 {
    using SafeMath for uint256;
    using Address for address;
    
    struct Account {
        uint256 balance;
        uint256 lastDividendPoints;
    }
    
    mapping (address => Account) private _accounts;

    mapping (address => uint256) public _balances;

    mapping (address => mapping (address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;
    uint8 private _decimals;
    
    uint256 private constant _decimalFactor = 10 ** 18;
    uint256 private constant _million = 1000000;
    uint256 private constant _ten_million = 10000000;

    //address private inGameReserveHolder = 0x29E6b77b9D78e31E6290bfd15b51Ff5218A73216;  // account 4
    address private inGameReserveHolder = 0xbc44e04eE26953A1eb20221904ac61151a651cD6;

	// Used drop fragments
	mapping (address => uint256) public lockedDrops;

	// burndropping
	uint256 public totalSpent = 0;
	uint256 public spent = 0;

    // Dividends from recharged Tokens
    uint256 totalDividendPoints = 0;
    uint256 unclaimedDividends = 0;
    uint256 additionalDividendPoints = 0;

    constructor () public {
        _name = "Crowns";
        _symbol = "CWS";
        _decimals = 18;
    
        // Grant the minter role to a specified account
        //address inGameAirdropper = 0x5C6107cb3c3662DB1F9336757f89B42a557BF24C; // account 1
        address inGameAirdropper = 0x43a0E1B83d02558b0EeeB200fC526dD9F526E14f;
        //address rechargeDexManager = 0xA0ed84227937041510cd07beA8169e28875E73E7; // account 3
        address rechargeDexManager = 0x36920415d5838D8D91383bF543BE23fbA331DDb2;
        //address teamManager = 0xa947129517fCDCC27ccE958138020591211ADe09; // account 5
        address teamManager = 0x276955F653f254265175e8aFbB3dbc1BBC604A5e;
        address investManager = 0x92BeB133C6D967bd77eb321979d350dB4cDF2b87; // account 6
        address communityManager = 0x4C4e3cbFd926C028beBFBE38780BD65854023319; // account 7
        
        uint256 inGameAirdrop = 3 * _million * _decimalFactor;
        uint256 rechargeDex = inGameAirdrop;
        uint256 teamAllocation = 1 * _million * _decimalFactor;
        uint256 investment = teamAllocation;
        uint256 communityBounty = 750000 * _decimalFactor;
        uint256 inGameReserve = 1250000 * _decimalFactor;
        
        _mint(inGameAirdropper, inGameAirdrop);
        _mint(rechargeDexManager, rechargeDex);
        _mint(teamManager, teamAllocation);
        _mint(investManager, investment);
        _mint(communityManager, communityBounty);
        _mint(inGameReserveHolder, inGameReserve);
        
        // TODO: add a minimal fee to transfer and airdrop
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

    /**
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20};
     *
     * Requirements:
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     * - the caller must have allowance for ``sender``'s tokens of at least
     * `amount`.
     */
    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
        return true;
    }

    function getBalance(address addr) private view returns (uint256) {
        uint256 balance = _balances[addr];
    	if (balance == 0) {
    		return 0;
    	}
    	uint256 drop = calculateDropFragment(totalSpent, balance);
    	balance = balance.add(drop);
    	return balance;
    }

    /**
     * @dev Moves tokens `amount` from `sender` to `recipient`.
     *
     * This is internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `sender` cannot be the zero address.
     * - `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     */
    event printInt(uint256 value1);

    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "Can not send 0 token");
        require(getBalance(sender) >= amount, "ERC20: Not enough token to send");

        _beforeTokenTransfer(sender, recipient, amount);

        uint256 totalBalance = getBalance(sender);
        emit printInt(amount);
        emit printInt(totalBalance);

        uint256 multipliedTotalBalance = totalBalance.mul(_ten_million);
        uint256 multipliedAmount = amount.mul(_ten_million);

        // Amount is sum of actual balance and money that player had received from rebalancing.
	    // In a transfer, the value of rebalaning should be changed. As it affects balance of all token holders.
	    // Therefore we have to get balance without number of rebalancing. We use a ratio for that:
	    uint256 denominator = multipliedTotalBalance.div(_balances[sender]);
        emit printInt(denominator);
        uint256 actualAmount = multipliedAmount.div(denominator);
        emit printInt(actualAmount);

        _balances[sender] =  _balances[sender].sub(actualAmount);
        emit printInt(_balances[recipient]);
        _balances[recipient] = _balances[recipient].add(actualAmount);
        emit printInt(_balances[recipient]);
        
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
        _balances[account] = _balances[account].add(amount);
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
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");
        require(getBalance(account) >= amount, "ERC20: Not enough token to burn");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 balance = getBalance(account);

        // Amount is sum of actual balance and money that player had received from rebalancing.
    	// In a transfer, the value of rebalaning should be changed. As it affects balance of all token holders.
    	// Therefore we have to get balance without number of rebalancing. We use a ratio for that:
    	uint256 denominator = balance.div(_balances[account]);
    	uint256 actualAmount = amount.div(denominator);

        _balances[account] = _balances[account].sub(actualAmount);

        reserve(amount);
        
        emit Transfer(account, address(0), amount);
    }
    
    
    function spend(uint256 amount) public {
        require(getBalance(msg.sender) >= amount, "Not enough balance");
        //require(inGameReserveHolder == msg.sender, "Only reserve holder can burn tokens");
        
        _burn(msg.sender, amount);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner`s tokens.
     *
     * This is internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Sets {decimals} to a value other than the default one of 18.
     *
     * WARNING: This function should only be called from the constructor. Most
     * applications that interact with token contracts will not expect
     * {decimals} to ever change, and may work incorrectly if it does.
     */
    function _setupDecimals(uint8 decimals_) internal {
        _decimals = decimals_;
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * will be to transferred to `to`.
     * - when `from` is zero, `amount` tokens will be minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual { }
    
        /**
     * Warning, no validation! 
     * Assume that address has a record.
     * @param  {[type]} address [description]
     * @return {[type]}         [description]
     */
    function calculateDropFragment(uint256 spendings, uint256 balance) public view returns (uint256) {
	    if (spendings == 0 || balance == 0) {
	        return 0;
	    }
	    uint256 supply = _totalSupply.sub(spendings);
	    
	    uint256 balanceMultiplied = balance.mul(_ten_million);
	    
	    uint256 multipliedBalanceProportion = balanceMultiplied.div(supply);
	    
	    uint256 fragmentMultiplied = spendings.mul(multipliedBalanceProportion);
	    uint256 fragment = fragmentMultiplied.div(_ten_million);
	    
	    return fragment;
    }

    /**
     * Warning, no validation!
     * Burndropping changes balance of all token owners.
     * @param  {[type]} amount [description]
     * @return {[type]}        [description]
     */
    function reserve(uint256 amount) internal returns (bool) {
    	spent = spent.add(amount);
    	
    	return false;
    }


    /**
     * Warning, no validation!
     * Burndropping changes balance of all token owners.
     * @param  {[type]} amount [description]
     * @return {[type]}        [description]
     */
    function burndrop() public returns (bool) {
        require(inGameReserveHolder == msg.sender, "Only reserve holder can redistribute tokens");

    	// Make it in it's own function
    	// Cut from drop fragments
    	totalSpent = totalSpent + spent;
    	spent = 0;
    	
    	// Emit burndrop
    }
}