// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.4;

import "./UserAccount.sol";

/**
 * @title UserServices
 * @dev Extension of UserSmartAccount contract for users with Services
 */
contract UserServices is UserAccount {

    struct Service {
        uint256 serviceId;
        address owner;
        string serviceCode;
        bool isPresent;
    }   

    event ServiceCreated(uint256 serviceId, address owner, string serviceCode, bool isPresent);
    
    mapping (uint256 => Service) services;
    mapping (address => uint256[]) ownerToServices;

    /**
    * @dev to allow only owner of the service for certian methods
    * @param _serviceId id of the service
     */
    modifier isOwnerOfService(uint256 _serviceId) {
        require(services[_serviceId].owner == msg.sender, "User not the owner of the requested service");
        _;
    }

    /**
    * @dev to allow only existing services
    * @param _serviceId id of the service
     */
    modifier serviceIsPresent(uint256 _serviceId) {
        require(services[_serviceId].isPresent, "Service not present");
        _;
    }

    /**
    * @dev create service for the user
    * @param _serviceCode unique identifier for the service
     */
    function createService(string memory _serviceCode) external {
        uint256 _serviceId = uint256(keccak256(abi.encodePacked(msg.sender, _serviceCode)));
        require(!services[_serviceId].isPresent, "Service code is already present");

        services[_serviceId] = Service(_serviceId, msg.sender, _serviceCode, true);
        ownerToServices[msg.sender].push(_serviceId);
        emit ServiceCreated(_serviceId, msg.sender, _serviceCode, true);
    }

    /**
    * @dev fetch all the services owned by the user
    * @return _ownedServices list of all services owned by the user
     */
    function getAllOwnedServices() public view returns(Service[] memory) {
        uint256 numServices = ownerToServices[msg.sender].length;
        Service[] memory _ownedServices = new Service[](numServices);
        for (uint256 i = 0; i < numServices; i++) {
            _ownedServices[i] = services[ownerToServices[msg.sender][i]];
        }
        return _ownedServices;
    }
}