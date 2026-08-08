// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

import {DIDRegistry} from "../src/DIDRegistry.sol";
import {CredentialRegistry} from "../src/CredentialRegistry.sol";
import {ZKVerifier} from "../src/ZKVerifier.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        DIDRegistry didRegistry = new DIDRegistry();
        console.log("DIDRegistry:        ", address(didRegistry));

        CredentialRegistry credRegistry = new CredentialRegistry(address(didRegistry));
        console.log("CredentialRegistry: ", address(credRegistry));

        ZKVerifier zkVerifier = new ZKVerifier();
        console.log("ZKVerifier:         ", address(zkVerifier));

        credRegistry.authorizeIssuer(deployer);
        console.log("Deployer authorized as issuer:", deployer);

        vm.stopBroadcast();

        string memory json = string(abi.encodePacked(
            '{"DIDRegistry":"',     vm.toString(address(didRegistry)),
            '","CredentialRegistry":"', vm.toString(address(credRegistry)),
            '","ZKVerifier":"',     vm.toString(address(zkVerifier)), '"}'
        ));
        vm.writeFile("../frontend/lib/blockchain/addresses.json", json);
        console.log("Contract addresses written to frontend/lib/blockchain/addresses.json");
    }
}
