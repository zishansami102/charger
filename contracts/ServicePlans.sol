// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.4;

import "./UserServices.sol";

/**
 * @title ServicePlans
 * @dev Extension of UserSmartAccount contract for users with Services
 */
contract ServicePlans is UserServices {

    enum BillingType {MINUTELY, HOURLY, DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY}

    struct Plan {
        uint256 planId;
        uint256 serviceId;
        string planCode;
        BillingType billingFrequency;
        uint256 costPerBilling;
        bool isPresent;
    }

    event PlanCreated(uint256 planId, uint256 serviceId, string planCode, BillingType billingFrequency, uint256 costPerBilling);

    mapping (uint256 => Plan) plans;
    mapping (uint256 => uint256[]) serviceToPlans;

    modifier planIsPresent(uint256 _planId) {
        require(plans[_planId].isPresent, "Plan not present");
        _;
    }

    /**
    * @dev create plan for the service
    * @param _serviceId id of the service
    * @param _billingFrequency billing frequency type
    * @param _planCode unique identifier for the plan
    * @param _costPerBilling cost per billing cycle
    */
    function createPlan(uint256 _serviceId, string memory _planCode, BillingType _billingFrequency, uint256 _costPerBilling) external serviceIsPresent(_serviceId) isOwnerOfService(_serviceId) {
        uint256 _planId = uint256(keccak256(abi.encodePacked(_serviceId, _billingFrequency, _costPerBilling)));
        require(!plans[_planId].isPresent, "Plan is already present");

        plans[_planId] = Plan(_planId, _serviceId, _planCode, _billingFrequency, _costPerBilling, true);
        serviceToPlans[_serviceId].push(_planId);
        emit PlanCreated(_planId, _serviceId, _planCode, _billingFrequency, _costPerBilling);
    }

    struct PlanDetailsStruct {
        uint256 planId;
        string planCode;
        string serviceCode;
        BillingType billingFrequency;
        uint256 costPerBilling;
    }

    /**
    * @dev fetch all the plans of the service
    * @param _serviceId id of the service
    * @return list of all plans created under given service
    */
    function getPlans(uint256 _serviceId) public view serviceIsPresent(_serviceId) isOwnerOfService(_serviceId) returns(PlanDetailsStruct[] memory) {
        uint256 numPlans = serviceToPlans[_serviceId].length;
        PlanDetailsStruct[] memory _servicePlans = new PlanDetailsStruct[](numPlans);
        for (uint256 i = 0; i < numPlans; i++) {
            Plan storage _plan = plans[serviceToPlans[_serviceId][i]];
            _servicePlans[i] = PlanDetailsStruct(
                _plan.planId,
                _plan.planCode,
                services[_plan.serviceId].serviceCode,
                _plan.billingFrequency,
                _plan.costPerBilling
            );
        }
        return _servicePlans;
    }
}