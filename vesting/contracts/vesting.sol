pragma solidity 0.6.7;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/token/ERC20/SafeERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/access/Ownable.sol";

contract VestingContract is Ownable {
    struct Grant {
        bool locked;
        uint256 amount;
        uint256 releaseTime;
    }
    
    using SafeERC20 for IERC20;

    // ERC20 basic token contract being held
    IERC20 private _token;

    mapping (address => Grant) public _grant;

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
        
        Grant memory grant = Grant(true, amount, releaseTime);
        _grant[beneficiary] = grant;
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
        return _grant[beneficiary].amount;
    }

    /**
     * @notice Transfers tokens held by timelock to beneficiary.
     */
    function release(address account) public virtual {
        // solhint-disable-next-line not-rely-on-time
        require(_grant[account].locked == true, "TokenTimelock: no locked tokens, ask grantor to get some tokens");
        require(_grant[account].releaseTime <= block.timestamp, "TokenTimelock: current time is before release time");

        uint256 amount = _token.balanceOf(address(this));
        require(amount >= _grant[account].amount, "TokenTimelock: no tokens to release");

        _token.safeTransfer(account, amount);
    
        _grant[account].locked = false;
        _grant[account].amount = 0;
        _grant[account].releaseTime = 0;
    }
}