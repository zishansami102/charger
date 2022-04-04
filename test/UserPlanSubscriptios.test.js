const { expect, assert } = require("chai"); 
const {
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
  } = require('@openzeppelin/test-helpers');

var UserPlanSubscriptions = artifacts.require("./UserPlanSubscriptions.sol");

contract('UserPlanSubscriptions', function(accounts) {
    let subscriptionContract;
    let SERVICE_CODE = "SERVICE 101";
    let SERVICE_OWNER = accounts[0];
    let USER = accounts[1];
    let USERID_HASH = "abc@gmail.com";
    let USER_NOTPRESENT = accounts[2];
    let PLAN_ID_NOTPRESENT = 123;
    let PLAN_CODE = "PLAN-A";
    let BILLING_FREQ = 0;
    let COST_PER_BILLING = 5;
    
    it('subscribe: create subscription for the user for the selected plan', function() {
        let serviceId;
        let planId;
        let reciept;
        return UserPlanSubscriptions.new().then(async function(instance) {
            subscriptionContract = instance;
            return subscriptionContract.createService(SERVICE_CODE, {from: SERVICE_OWNER});
        }).then(async function(service_reciept) {
            await expectEvent(service_reciept, 'ServiceCreated');
            return service_reciept.logs[0].args.serviceId;
        }).then(function(serviceIdCreated) {
            serviceId = serviceIdCreated;
            return subscriptionContract.createPlan(serviceId, PLAN_CODE, BILLING_FREQ, COST_PER_BILLING, {from: SERVICE_OWNER});
        }).then(async function(plan_reciept) {
            planReciept = plan_reciept;
            await expectEvent(planReciept, 'PlanCreated');
            return planReciept.logs[0].args.planId;
        }).then(async function(planIdCreated) {
            planId = planIdCreated;
            await expectRevert.unspecified(subscriptionContract.subscribe(PLAN_ID_NOTPRESENT, USERID_HASH, {from: USER}), "Plan not present");
            await expectRevert.unspecified(subscriptionContract.subscribe(planId, USERID_HASH, {from: SERVICE_OWNER}), "Owner not allowed to subscribe");
            return subscriptionContract.subscribe(planId, USERID_HASH, {from: USER});
        }).then(function(subsciptionReciept) {
            reciept = subsciptionReciept;
            return reciept.logs[0].args.userIdHash;
        }).then(function(userIdHash) {
            expect(userIdHash).to.equal(USERID_HASH);
        });
    });

    it('unsubscribe: unsubscribe the given subscription', function() {
        let serviceId;
        let planId;
        let reciept;
        return UserPlanSubscriptions.new().then(async function(instance) {
            subscriptionContract = instance;
            return subscriptionContract.createService(SERVICE_CODE, {from: SERVICE_OWNER});
        }).then(async function(service_reciept) {
            await expectEvent(service_reciept, 'ServiceCreated');
            return service_reciept.logs[0].args.serviceId;
        }).then(function(serviceIdCreated) {
            serviceId = serviceIdCreated;
            return subscriptionContract.createPlan(serviceId, PLAN_CODE, BILLING_FREQ, COST_PER_BILLING, {from: SERVICE_OWNER});
        }).then(async function(plan_reciept) {
            planReciept = plan_reciept;
            await expectEvent(planReciept, 'PlanCreated');
            return planReciept.logs[0].args.planId;
        }).then(async function(planIdCreated) {
            planId = planIdCreated;
            return subscriptionContract.subscribe(planId, USERID_HASH, {from: USER});
        }).then(function(subsReciept) {
            return subsReciept.logs[0].args.subscriptionId;
        }).then(function(subsIdCreated) {
            subsId=subsIdCreated;
            return subscriptionContract.unsubscribe(subsId, {from: USER});
        }).then(function(unsubsReciept) {
            return unsubsReciept.logs[0].args.subscriptionId;
        }).then(function(unsubsId) {
            expect(unsubsId).to.be.bignumber.equal(subsId);
        });
    });


});