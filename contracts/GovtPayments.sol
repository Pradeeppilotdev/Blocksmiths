// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GovtPayments {
    mapping(address => mapping(string => bool)) public payments;
    mapping(string => uint256) public serviceFees;
    address public owner;
    
    event PaymentMade(address indexed payer, string serviceType, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    function setServiceFee(string memory serviceType, uint256 fee) public onlyOwner {
        serviceFees[serviceType] = fee;
    }
    
    function makePayment(string memory serviceType) public payable {
        require(serviceFees[serviceType] > 0, "Service not found");
        require(msg.value == serviceFees[serviceType], "Incorrect payment amount");
        
        payments[msg.sender][serviceType] = true;
        emit PaymentMade(msg.sender, serviceType, msg.value);
    }
} 