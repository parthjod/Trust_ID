// contracts/src/SecurityUtils.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library SecurityUtils {
    uint256 public constant MAX_UINT256 = type(uint256).max;
    uint256 public constant TIMELOCK_DELAY = 24 hours;
    
    error ZeroAddress();
    error InvalidSignature();
    error TimelockNotExpired();
    
    modifier onlyEOA() {
        require(msg.sender == tx.origin, "Only EOA");
        _;
    }
    
    modifier timelockCheck(uint256 timestamp) {
        if (block.timestamp < timestamp + TIMELOCK_DELAY) {
            revert TimelockNotExpired();
        }
        _;
    }
    
    function verifySignature(
        bytes32 hash,
        bytes calldata signature,
        address expectedSigner
    ) internal pure {
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );
        
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        address signer = ecrecover(ethSignedHash, v, r, s);
        
        if (signer == address(0) || signer != expectedSigner) {
            revert InvalidSignature();
        }
    }
    
    function splitSignature(bytes calldata sig)
        internal pure
        returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := calldataload(sig.offset)
            s := calldataload(add(sig.offset, 32))
            v := byte(0, calldataload(add(sig.offset, 64)))
        }
    }
    
    function secureUpdate(
        mapping(bytes32 => bool) storage used,
        bytes32 key
    ) internal {
        require(!used[key], "Key already used");
        used[key] = true;
    }
}