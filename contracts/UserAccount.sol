// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.4;

/**
 * @title User
 * @dev Smart Account for users and service providers
 */
contract UserAccount {

    // uint256 public userCount;
    
    struct User {
        address owner;
        uint256 lastRecordedBalance;
        // bool isActive;
    }
    
    event BalanceUpdated(address indexed owner, uint balance);
    mapping (address => User) users;
    
    // /**
    //  * @dev Requires user to be present in the user list to be allowed to use the conditioned methods
    //  */
    // modifier isActiveUser() {
    //     require(users[msg.sender].isActive, "User not present");
    //     _;
    // } 

    // /**
    //  * @dev Connect users EOA with the smart account
    //  */
    // function connect() internal {
    //     if (!users[msg.sender].isActive) {
    //         _createUser();
    //     }
    // }

    // /**
    //  * @dev Create user and add it in the user mapping
    //  */
    // function _createUser() private {    
    //     users[msg.sender] = User(msg.sender, 0, true);
    //     userCount++;
    //     emit UserCreated(msg.sender, 0, true);
    // }
    
    /**
     * @dev Deposit ether in user's smart account
     */
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount should be greater than zero");
        users[msg.sender].lastRecordedBalance += msg.value;
        emit BalanceUpdated(msg.sender, users[msg.sender].lastRecordedBalance);
    }

    /**
     * @dev Retrieves the balance of the user
     * @return _balance
     */
    function getCurrentBalance() public view returns(uint256 _balance){
        _balance = users[msg.sender].lastRecordedBalance;
    }

    /**
     * @dev Withdraw ether from user's smart account
     * @param _amount value to withdraw from the user's balance
     */
    function withdraw(uint256 _amount) public {
        require(_amount < getCurrentBalance(), "Insuficient Balance!");
        users[msg.sender].lastRecordedBalance -= _amount;
        payable(msg.sender).transfer(_amount);
        emit BalanceUpdated(msg.sender, users[msg.sender].lastRecordedBalance);
    }
}