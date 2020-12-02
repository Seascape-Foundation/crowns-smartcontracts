pragma solidity 0.6.7;

import "./../../../../openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./../../../../openzeppelin/contracts/access/Ownable.sol";
import "./../../../../openzeppelin/contracts/math/SafeMath.sol";

/// @title Vesting Contract attached to Crowns (CWS) token.
/// @author Medet Ahmetson
/// @notice A simple contract to lock specified amount of Crowns (CWS) for a period of time.
/// @dev Based on https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/token/ERC20/TokenTimelock.sol
contract VestingContract is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct Grant {
        bool locked;
        uint256 amount;
        uint256 releaseTime;
    }

    // ERC20 basic token contract being held
    IERC20 private immutable _token;

    mapping (address => Grant) public _grant;

    event Locked(address indexed beneficiary, uint256 amount, uint256 releaseTime);
    event Released(address indexed beneficiary, uint256 amount);
    
    /**
     * @dev Sets Crowns (CWS) token address to interact with.
     * Changes ownership, so the Contract deployer will not be the owner.
     */
    constructor (IERC20 token, address newOwner) public {
	require(address(token) != address(0), "Vecting: Token address can not be zero");
        _token = token;

        transferOwnership(newOwner);
    }

    /**
     * @notice Lock some tokens for a team member or investor.
     * @dev Locks `amount` of Crowns (CWS) until `releaseTime`, after that tokens can be claimed by by the `beneficiary`.
     * Notice! only owner of the Contract can call this function.
     * Notice! also, contract should have enough token in balance in order to work.
     * @param releaseTime is a Unix timestamp in seconds since 1 Jan. 1970.
     */
    function lock(address beneficiary, uint256 amount, uint256 releaseTime) external onlyOwner() {
        require(releaseTime > block.timestamp, "TokenTimelock: release time is before current time");
        require(_grant[beneficiary].locked == false, "Has locked grant");
        require(amount > 0, "TokenTimelock: can't lock 0 token");

        Grant memory grant = Grant(true, amount, releaseTime);
        _grant[beneficiary] = grant;

	emit Locked(beneficiary, amount, releaseTime);
    }

    /**
     * @return the token being held.
     */
    function token() external view returns (IERC20) {
        return _token;
    }

    /**
     * @return the time when the tokens are released.
     */
    function releaseTime(address beneficiary) external view returns (uint256) {
        return _grant[beneficiary].releaseTime;
    }

    /**
     * @notice Check whether given {beneficiary} was granted by token or not.
     */
    function isLocked(address beneficiary) external view returns (bool) {
        return _grant[beneficiary].locked;
    }

    /**
     * @notice Return locked token amount for the {beneficiary}
     */
    function lockedAmount(address beneficiary) external view returns (uint256) {
        return _grant[beneficiary].amount;
    }

    /**
     * @notice Transfers tokens held by timelock to beneficiary.
     */
    function release(address account) external virtual {
        // solhint-disable-next-line not-rely-on-time
        require(_grant[account].locked, "TokenTimelock: no locked tokens, ask grantor to get some tokens");
        require(_grant[account].releaseTime <= block.timestamp, "TokenTimelock: current time is before release time");

        uint256 lockAmount =  _grant[account].amount;  // locked amount without rebase

        uint256 amount = _token.balanceOf(address(this));
        require(amount >= lockAmount, "TokenTimelock: no tokens to release");

        _token.safeTransfer(account, lockAmount);

        _grant[account].locked = false;
        _grant[account].amount = 0;
        _grant[account].releaseTime = 0;

	emit Released(account, lockAmount);
    }
}
