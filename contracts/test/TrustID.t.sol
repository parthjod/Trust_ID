// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DIDRegistry} from "../src/DIDRegistry.sol";
import {CredentialRegistry} from "../src/CredentialRegistry.sol";
import {ZKVerifier} from "../src/ZKVerifier.sol";

contract DIDRegistryTest is Test {
    DIDRegistry registry;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        registry = new DIDRegistry();
    }

    function test_CreateDid() public {
        vm.prank(alice);
        registry.createDid("did:trustid:alice", keccak256("alicePubKey"));

        DIDRegistry.DidDocument memory doc = registry.getDid(alice);
        assertEq(doc.owner, alice);
        assertTrue(doc.active);
        assertEq(doc.didUri, "did:trustid:alice");
    }

    function test_RevertIfDidAlreadyExists() public {
        vm.startPrank(alice);
        registry.createDid("did:trustid:alice", keccak256("alicePubKey"));
        vm.expectRevert(DIDRegistry.DidAlreadyExists.selector);
        registry.createDid("did:trustid:alice2", keccak256("alicePubKey2"));
        vm.stopPrank();
    }

    function test_RevokeDid() public {
        vm.startPrank(alice);
        registry.createDid("did:trustid:alice", keccak256("alicePubKey"));
        registry.revokeDid();
        vm.stopPrank();

        assertFalse(registry.isActiveDid(alice));
    }
}

contract CredentialRegistryTest is Test {
    DIDRegistry didReg;
    CredentialRegistry credReg;

    address authority = makeAddr("authority");
    address user = makeAddr("user");

    function setUp() public {
        didReg = new DIDRegistry();
        credReg = new CredentialRegistry(address(didReg));

        vm.prank(user);
        didReg.createDid("did:trustid:user", keccak256("userPubKey"));

        credReg.authorizeIssuer(authority);
    }

    function test_IssueCredential() public {
        vm.prank(authority);
        bytes32 credId = credReg.issueCredential(
            user,
            "AgeProof",
            keccak256("ageVCData"),
            0
        );

        (bool valid, CredentialRegistry.Credential memory cred) = credReg.verifyCredential(credId);
        assertTrue(valid);
        assertEq(cred.subject, user);
        assertEq(cred.credentialType, "AgeProof");
    }

    function test_RevokeCredential() public {
        vm.prank(authority);
        bytes32 credId = credReg.issueCredential(
            user, "AgeProof", keccak256("ageVCData"), 0
        );

        vm.prank(authority);
        credReg.revokeCredential(credId);

        (bool valid,) = credReg.verifyCredential(credId);
        assertFalse(valid);
    }

    function test_RevokeCredentialBySubject() public {
        vm.prank(authority);
        bytes32 credId = credReg.issueCredential(
            user, "AgeProof", keccak256("ageVCData"), 0
        );

        vm.prank(user);
        credReg.revokeCredential(credId);

        (bool valid,) = credReg.verifyCredential(credId);
        assertFalse(valid);
    }

    function test_RevertIfUnauthorizedIssuer() public {
        vm.prank(user);
        vm.expectRevert(CredentialRegistry.NotAuthorizedIssuer.selector);
        credReg.issueCredential(user, "AgeProof", keccak256("data"), 0);
    }
}

contract ZKVerifierTest is Test {
    ZKVerifier verifier;
    address prover = makeAddr("prover");

    function setUp() public {
        verifier = new ZKVerifier();
    }

    function test_VerifyAgeProof() public {
        bytes32[] memory inputs = new bytes32[](2);
        inputs[0] = bytes32(uint256(18));
        inputs[1] = keccak256("uniqueNullifier");

        vm.prank(prover);
        bool result = verifier.verifyAgeProof(hex"deadbeef", inputs);
        assertTrue(result);
    }

    function test_RevertOnReplayAttack() public {
        bytes32[] memory inputs = new bytes32[](2);
        inputs[0] = bytes32(uint256(18));
        inputs[1] = keccak256("sameNullifier");

        vm.startPrank(prover);
        verifier.verifyAgeProof(hex"deadbeef", inputs);

        vm.expectRevert("Proof already used (replay)");
        verifier.verifyAgeProof(hex"deadbeef", inputs);
        vm.stopPrank();
    }
}
