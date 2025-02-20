// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentContract {
    struct Payment {
        address payer;
        uint256 amount;
        string service;
        string certificateIPFSHash;
        uint256 timestamp;
    }
    
    mapping(address => Payment[]) public userPayments;
    mapping(string => uint256) public serviceFees;
    address public owner;
    
    event PaymentMade(
        address indexed payer,
        string service,
        uint256 amount,
        string certificateIPFSHash,
        uint256 timestamp
    );
    
    constructor() {
        owner = msg.sender;
        // Set initial service fees (0.001 ETH)
        serviceFees["electricity"] = 0.001 ether;
        serviceFees["water"] = 0.001 ether;
        serviceFees["gas"] = 0.001 ether;
        serviceFees["internet"] = 0.001 ether;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function makePayment(string memory service, string memory certificateIPFSHash) public payable {
        require(serviceFees[service] > 0, "Invalid service");
        require(msg.value == serviceFees[service], "Incorrect payment amount");
        
        Payment memory newPayment = Payment({
            payer: msg.sender,
            amount: msg.value,
            service: service,
            certificateIPFSHash: certificateIPFSHash,
            timestamp: block.timestamp
        });
        
        userPayments[msg.sender].push(newPayment);
        
        emit PaymentMade(
            msg.sender,
            service,
            msg.value,
            certificateIPFSHash,
            block.timestamp
        );
    }
    
    function getUserPayments() public view returns (Payment[] memory) {
        return userPayments[msg.sender];
    }
    
    function getServiceFee(string memory service) public view returns (uint256) {
        return serviceFees[service];
    }
    
    function updateServiceFee(string memory service, uint256 newFee) public onlyOwner {
        serviceFees[service] = newFee;
    }
    
    function withdrawFunds() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
} 