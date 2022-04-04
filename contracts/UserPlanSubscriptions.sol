// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.4;
import './ServicePlans.sol';

/**
 * @title UserPlanSubscriptions
 * @dev Extension of User side contract for users with subscription built over UserServices
 */
contract UserPlanSubscriptions is ServicePlans {
  struct Subscription {
    uint256 subscriptionId;
    uint256 planId;
    string userIdHash;
    address userAddress;
    uint256 lastSettledTime;
    uint256 overdue;
    bool isActive;
    bool isPresent;
  }

  struct UserSubsDetails {
    uint256 subscriptionId;
    string serviceCode;
    string planCode;
    BillingType billingFrequency;
    uint256 costPerBilling;
    string userIdHash;
    uint256 amountDue;
    bool isActive;
  }

  struct ServiceDetails {
    uint256 serviceId;
    string serviceCode;
    uint256 numActivePlans;
    uint256 numActiveSubs;
    uint256 serviceCollectable;
  }

  struct PlanDetails {
    uint256 planId;
    string planCode;
    string serviceCode;
    BillingType billingFrequency;
    uint256 costPerBilling;
    uint256 numActiveSubs;
    uint256 planCollectable;
  }

  event SubscriptionCreated (
    uint256 subscriptionId,
    uint256 planId,
    string userIdHash,
    address userAddress,
    uint256 lastSettledTime,
    uint256 overdue,
    bool isActive
  );

  event Unsubscribed (
    uint256 subscriptionId,
    uint256 planId,
    uint256 overdue,
    bool isActive
  );

  mapping(uint256 => Subscription) subscriptions;
  mapping(uint256 => uint256[]) planToSubscriptions;
  mapping(address => uint256[]) userToSubscriptions;

  modifier subscriptionIsPresent(uint256 _subscriptionId) {
    require(subscriptions[_subscriptionId].isPresent);
    _;
  }

  modifier subscriptionIsActive(uint256 _subscriptionId) {
    require(subscriptions[_subscriptionId].isPresent && subscriptions[_subscriptionId].isActive);
    _;
  }

  modifier isSubscribedTo(uint256 _subscriptionId) {
    require(subscriptions[_subscriptionId].userAddress == msg.sender);
    _;
  }

  modifier isOwnerOfSubscription(uint256 _subscriptionId) {
    require(services[plans[subscriptions[_subscriptionId].planId].serviceId].owner == msg.sender);
    _;
  }

  modifier isSubscribedToOrOwner(uint256 _subscriptionId) {
    require(
      subscriptions[_subscriptionId].userAddress == msg.sender ||
        services[plans[subscriptions[_subscriptionId].planId].serviceId].owner == msg.sender
    );
    _;
  }

  function _calculateSubscriptionDue(uint256 _subscriptionId)
    internal
    view
    subscriptionIsPresent(_subscriptionId)
    isSubscribedToOrOwner(_subscriptionId)
    returns (uint256 _subscriptionDue)
  {
    Subscription storage _sub = subscriptions[_subscriptionId];
    if (_sub.isActive) {
      BillingType _billType = plans[_sub.planId].billingFrequency;
      uint256 _costPerBill = plans[_sub.planId].costPerBilling;
      uint256 _billedTime = (block.timestamp - _sub.lastSettledTime);
      if (_billType == BillingType.MINUTELY) {
        _billedTime = _billedTime / 60;
      } else if (_billType == BillingType.HOURLY) {
        _billedTime = _billedTime / (60 * 60);
      } else if (_billType == BillingType.DAILY) {
        _billedTime = _billedTime / (60 * 60 * 24);
      } else if (_billType == BillingType.WEEKLY) {
        _billedTime = _billedTime / (60 * 60 * 24 * 7);
      } else if (_billType == BillingType.MONTHLY) {
        _billedTime = _billedTime / (60 * 60 * 24 * 30);
      } else if (_billType == BillingType.QUARTERLY) {
        _billedTime = _billedTime / (60 * 60 * 24 * 30 * 3);
      } else if (_billType == BillingType.YEARLY) {
        _billedTime = _billedTime / (60 * 60 * 24 * 365);
      }
      _subscriptionDue = _billedTime * _costPerBill;
    }
    _subscriptionDue += subscriptions[_subscriptionId].overdue;
  }

  function _settleSubs(uint256 _subsId)
    internal
    subscriptionIsPresent(_subsId)
    isSubscribedToOrOwner(_subsId)
  {
    uint256 _amountDue = _calculateSubscriptionDue(_subsId);
    address subscriber = subscriptions[_subsId].userAddress;

    uint256 _amountToSettle;
    if (_amountDue < users[subscriber].lastRecordedBalance) {
      _amountToSettle = _amountDue;
    } else {
      _amountToSettle = users[subscriber].lastRecordedBalance;
    }

    users[subscriber].lastRecordedBalance -= _amountToSettle;
    users[_getServiceOwnerOfSubscription(_subsId)].lastRecordedBalance += _amountToSettle;
    subscriptions[_subsId].lastSettledTime = block.timestamp;
    subscriptions[_subsId].overdue = _amountDue - _amountToSettle;
  }

  /**
   * @dev create subscription for the user for the selected plan and
   * allow service to collect payment based on selected plan
   * @param _planId id of the plan to subscribe
   * @param _userIdHash hash of the user identifier
   */
  function subscribe(uint256 _planId, string memory _userIdHash) external planIsPresent(_planId) {
    require(
      services[plans[_planId].serviceId].owner != msg.sender,
      'Owner not allowed to subscribe'
    );
    for (uint256 i = 0; i < userToSubscriptions[msg.sender].length; i++) {
      require(plans[subscriptions[userToSubscriptions[msg.sender][i]].planId].serviceId != plans[_planId].serviceId, "User already subscribed to the service");
    }
    uint256 _subscriptionId = uint256(
      keccak256(abi.encodePacked(_planId, _userIdHash, msg.sender))
    );
    // require(!subscriptions[_subscriptionId].isActive, 'User already subscribed to the plan');

    if (subscriptions[_subscriptionId].isPresent) {
      _settleSubs(_subscriptionId);
      require(
        subscriptions[_subscriptionId].overdue == 0,
        'User balance insufficient to settle overdue'
      );
      subscriptions[_subscriptionId].isActive = true;
    } else {
      subscriptions[_subscriptionId] = Subscription(
        _subscriptionId,
        _planId,
        _userIdHash,
        msg.sender,
        block.timestamp,
        0,
        true,
        true
      );
      emit SubscriptionCreated(
        _subscriptionId,
        _planId,
        _userIdHash,
        msg.sender,
        block.timestamp,
        0,
        true
      );
    }
    planToSubscriptions[_planId].push(_subscriptionId);
    userToSubscriptions[msg.sender].push(_subscriptionId);
  }

  function unsubscribe(uint256 _subscriptionId)
    public
    subscriptionIsPresent(_subscriptionId)
    subscriptionIsActive(_subscriptionId)
    isSubscribedToOrOwner(_subscriptionId)
  {
    _settleSubs(_subscriptionId);
    // require()
    subscriptions[_subscriptionId].isActive = false;

    uint256[] storage _planSubs = planToSubscriptions[subscriptions[_subscriptionId].planId];
    for (uint256 i = 0; i < _planSubs.length; i++) {
      if (_planSubs[i] == _subscriptionId) {
        _planSubs[i] = _planSubs[_planSubs.length - 1];
        _planSubs.pop();
      }
    }

    uint256[] storage _userSubs = userToSubscriptions[subscriptions[_subscriptionId].userAddress];
    for (uint256 i = 0; i < _userSubs.length; i++) {
      if (_userSubs[i] == _subscriptionId) {
        _userSubs[i] = _userSubs[_userSubs.length - 1];
        _userSubs.pop();
      }
    }
    emit Unsubscribed(_subscriptionId, subscriptions[_subscriptionId].planId, subscriptions[_subscriptionId].overdue, subscriptions[_subscriptionId].isActive);
  }

  function _getServiceOwnerOfSubscription(uint256 _subscriptionId)
    private
    view
    subscriptionIsPresent(_subscriptionId)
    returns (address _owner)
  {
    _owner = services[plans[subscriptions[_subscriptionId].planId].serviceId].owner;
  }

  function totalCollectableAmountFromPlan(uint256 _planId)
    public
    view
    planIsPresent(_planId)
    returns (uint256 _collectableFromPlan)
  {
    uint256[] storage _planSubs = planToSubscriptions[_planId];
    for (uint256 k = 0; k < _planSubs.length; k++) {
      _collectableFromPlan += _calculateSubscriptionDue(_planSubs[k]);
    }
  }

  function totalCollectableAmountFromService(uint256 _serviceId)
    public
    view
    serviceIsPresent(_serviceId)
    isOwnerOfService(_serviceId)
    returns (uint256 _collectableFromService)
  {
    uint256[] storage _servicePlans = serviceToPlans[_serviceId];
    for (uint256 j = 0; j < _servicePlans.length; j++) {
      _collectableFromService += totalCollectableAmountFromPlan(_servicePlans[j]);
    }
  }

  function totalCollectableAmountFromAllServices()
    public
    view
    returns (uint256 _totalCollectableAmount)
  {
    uint256[] storage _userServices = ownerToServices[msg.sender];
    for (uint256 i = 0; i < _userServices.length; i++) {
      _totalCollectableAmount += totalCollectableAmountFromService(_userServices[i]);
    }
  }

  function collectDueFromAllSubscriptionsOfPlan(uint256 _planId) public planIsPresent(_planId) {
    uint256[] storage _planSubs = planToSubscriptions[_planId];
    for (uint256 k = 0; k < _planSubs.length; k++) {
      _settleSubs(_planSubs[k]);
    }
  }

  function collectDueFromAllPlansOfService(uint256 _serviceId)
    public
    serviceIsPresent(_serviceId)
    isOwnerOfService(_serviceId)
  {
    uint256[] storage _servicePlans = serviceToPlans[_serviceId];
    for (uint256 j = 0; j < _servicePlans.length; j++) {
      collectDueFromAllSubscriptionsOfPlan(_servicePlans[j]);
    }
  }

  function collectDueFromAllOwnedServices() public {
    uint256[] storage _userServices = ownerToServices[msg.sender];
    for (uint256 i = 0; i < _userServices.length; i++) {
      collectDueFromAllPlansOfService(_userServices[i]);
    }
  }

  function inactivateAllOverdueSubscriptionsOfPlan(uint256 _planId) public planIsPresent(_planId) {
    uint256[] storage _planSubs = planToSubscriptions[_planId];
    for (uint256 k = 0; k < _planSubs.length; k++) {
      if (
        subscriptions[_planSubs[k]].overdue >
        users[subscriptions[_planSubs[k]].userAddress].lastRecordedBalance
      ) {
        unsubscribe(_planSubs[k]);
      }
    }
  }

  function inactivateAllOverdueSubscriptionsOfService(uint256 _serviceId)
    public
    serviceIsPresent(_serviceId)
    isOwnerOfService(_serviceId)
  {
    uint256[] storage _servicePlans = serviceToPlans[_serviceId];
    for (uint256 j = 0; j < _servicePlans.length; j++) {
      inactivateAllOverdueSubscriptionsOfPlan(_servicePlans[j]);
    }
  }

  function inactivateAllOverdueSubscriptions() external {
    uint256[] storage _userServices = ownerToServices[msg.sender];
    for (uint256 i = 0; i < _userServices.length; i++) {
      inactivateAllOverdueSubscriptionsOfService(_userServices[i]);
    }
  }

  /**
   * @dev fetch all subscriptions of the user
   */
  function getSubsByUser() external view returns (UserSubsDetails[] memory) {
    uint256 numSubs = userToSubscriptions[msg.sender].length;
    UserSubsDetails[] memory _userSubs = new UserSubsDetails[](numSubs);

    for (uint256 i = 0; i < numSubs; i++) {
      Subscription storage _sub = subscriptions[userToSubscriptions[msg.sender][i]];
      _userSubs[i] = UserSubsDetails(
        _sub.subscriptionId,
        services[plans[_sub.planId].serviceId].serviceCode,
        plans[_sub.planId].planCode,
        plans[_sub.planId].billingFrequency,
        plans[_sub.planId].costPerBilling,
        _sub.userIdHash,
        _calculateSubscriptionDue(userToSubscriptions[msg.sender][i]),
        _sub.isActive
      );
    }
    return _userSubs;
  }

  function totalAmountDueToAllSubs() external view returns (uint256 _totalDue) {
    uint256 _numSubs = userToSubscriptions[msg.sender].length;
    for (uint256 i = 0; i < _numSubs; i++) {
      _totalDue += _calculateSubscriptionDue(userToSubscriptions[msg.sender][i]);
    }
  }

  /**
   * @dev fetch all the services owned by the user
   * @return _ownedServicesDetails list of all services owned by the user
   */
  function getAllOwnedServicesDetails() external view returns (ServiceDetails[] memory) {
    uint256 numServices = ownerToServices[msg.sender].length;
    ServiceDetails[] memory _ownedServicesDetails = new ServiceDetails[](numServices);
    for (uint256 i = 0; i < numServices; i++) {
      uint256 ithServiceId = ownerToServices[msg.sender][i];
      uint256 activeSubsCount = 0;
      for (uint256 j = 0; j < serviceToPlans[ithServiceId].length; j++) {
        activeSubsCount += planToSubscriptions[serviceToPlans[ithServiceId][j]].length;
      }
      _ownedServicesDetails[i] = ServiceDetails(
        ithServiceId,
        services[ithServiceId].serviceCode,
        serviceToPlans[ithServiceId].length,
        activeSubsCount,
        totalCollectableAmountFromService(ithServiceId)
      );
    }
    return _ownedServicesDetails;
  }

  function getAllPlans() external view returns(PlanDetails[] memory) {
    uint256 numServices = ownerToServices[msg.sender].length;
    uint256 totalNumPlans = 0;
    for (uint256 i = 0; i < numServices; i++) {
        totalNumPlans += serviceToPlans[ownerToServices[msg.sender][i]].length;
    }
    PlanDetails[] memory _plans = new PlanDetails[](totalNumPlans);
    uint256 k = 0;
    for (uint256 i = 0; i < numServices; i++) {
      uint256 numPlans = serviceToPlans[ownerToServices[msg.sender][i]].length;
      for (uint256 j = 0; j < numPlans; j++) {
        Plan storage _plan = plans[serviceToPlans[ownerToServices[msg.sender][i]][j]];
        _plans[k++] = PlanDetails(
          _plan.planId,
          _plan.planCode,
          services[_plan.serviceId].serviceCode,
          _plan.billingFrequency,
          _plan.costPerBilling,
          planToSubscriptions[_plan.planId].length,
          totalCollectableAmountFromPlan(_plan.planId)
        );
      } 
    }
    return _plans;
  }
}
