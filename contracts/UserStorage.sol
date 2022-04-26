// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract UserStorage {

    struct User {
        address userAddress;
        string name;
        uint256 nrOfDAOs;
        // add an array of "structs" DAOs later
    }

    // an array of users
    User[] users;

    event NewUser(address indexed userAddress, string userName);

    // mapping that users' wallets and their names
    // not going to use it for now, but may need it in the future
    mapping(address => string) public allUsers;

    constructor() {
        // console.log("The smart contract launched successfully");
    }

    function addUser(string memory _userName) public {
        users.push(User(msg.sender, _userName, 0));

        // console.log("Added a new user to the array");

        emit NewUser(msg.sender, _userName);
    }

    function getAllUsers() public view returns(User[] memory) {
        // console.log("Returned all the existing users;");
        return users;
    }

}
