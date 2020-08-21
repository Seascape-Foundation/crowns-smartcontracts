pragma solidity 0.6.7;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/token/ERC20/SafeERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/math/SafeMath.sol";

contract VestingContract is Ownable {
    using SafeMath for uint256;

    struct Grant {
        bool locked;
        uint256 amount;
        uint256 releaseTime;
    }
    
    using SafeERC20 for IERC20;

    // ERC20 basic token contract being held
    IERC20 private _token;

    mapping (address => Grant) public _grant;
    
    uint256 public balance = 0;
    uint256 private constant _decimalFactor = 10 ** 18;

    constructor (IERC20 token, address newOwner) public {
        _token = token;
        
        transferOwnership(newOwner);
    }
    
    function currentTime() public view returns (uint256) {
        return block.timestamp;
    }
    
    function lock(address beneficiary, uint256 amount, uint256 releaseTime) public onlyOwner() {
        require(releaseTime > block.timestamp, "TokenTimelock: release time is before current time");
        require(_grant[beneficiary].locked == false, "Has locked grant");
        require(amount > 0, "TokenTimelock: can't lock 0 token");
        
        Grant memory grant = Grant(true, amount, releaseTime);
        _grant[beneficiary] = grant;
        
        balance = balance.add(amount);
    }

    /**
     * @return the token being held.
     */
    function token() public view returns (IERC20) {
        return _token;
    }

    /**
     * @return the time when the tokens are released.
     */
    function releaseTime(address beneficiary) public view returns (uint256) {
        return _grant[beneficiary].releaseTime;
    }
    
    /**
     * @return the time when the tokens are released.
     */
    function granted(address beneficiary) public view returns (bool) {
        return _grant[beneficiary].locked;
    }
    
    /**
     * @return the time when the tokens are released.
     */
    function lockedAmount(address beneficiary) public view returns (uint256) {
        uint256 amount = _grant[beneficiary].amount;
        if (amount == 0) {
            return 0;
        }

        // Balance with dividends
        // this.balance address should not be greater than totalBalance.
        uint256 totalBalance = _token.balanceOf(address(this));
        if (balance == totalBalance) {
            return amount;
        }

        // Vesting Contract has one locked address. This means all tokens are going straight to him
        if (amount == balance) {
            return totalBalance;            
        }
        
        // Amount of Grant Tokens in a percents
        uint256 grantPercents = amount.mul(_decimalFactor).div(balance);
        
        uint256 dividends = totalBalance.mul(grantPercents).div(_decimalFactor);
        
        return dividends;
    }

    /**
     * @notice Transfers tokens held by timelock to beneficiary.
     */
    function release(address account) public virtual {
        // solhint-disable-next-line not-rely-on-time
        require(_grant[account].locked == true, "TokenTimelock: no locked tokens, ask grantor to get some tokens");
        require(_grant[account].releaseTime <= block.timestamp, "TokenTimelock: current time is before release time");

        uint256 amount = _token.balanceOf(address(this));
        uint256 lockAmount = lockedAmount(account);  // locked amount with dividends
        require(amount >= lockAmount, "TokenTimelock: no tokens to release");

        _token.safeTransfer(account, lockAmount);
    
        balance = balance.sub(_grant[account].amount);
        _grant[account].locked = false;
        _grant[account].amount = 0;
        _grant[account].releaseTime = 0;
    }
}