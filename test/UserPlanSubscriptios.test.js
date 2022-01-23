const { expect } = require("chai"); 
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
    let USERID_HASH = 12345;
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
            await subscriptionContract.connect({from: SERVICE_OWNER});
            await subscriptionContract.connect({from: USER});
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
            await expectRevert.unspecified(subscriptionContract.subscribe(planId, USERID_HASH, {from: USER_NOTPRESENT}), "User not present");
            await expectRevert.unspecified(subscriptionContract.subscribe(PLAN_ID_NOTPRESENT, USERID_HASH, {from: USER}), "Plan not present");
            await expectRevert.unspecified(subscriptionContract.subscribe(planId, USERID_HASH, {from: SERVICE_OWNER}), "Owner not allowed to subscribe");
        //     await expectRevert.unspecified(subscriptionContract.subscribe(planId, USERID_HASH, {from: USER}), "User balance not enough");
        //     await subscriptionContract.deposit({from:USER, value:10})
        //     return subscriptionContract.subscribe(planId, USERID_HASH, {from: USER});
        // }).then(function(subsciptionReciept) {
        //     reciept = subsciptionReciept;
        //     expect(planCode).to.equal(PLAN_CODE);
        //     return planReciept.logs[0].args.billingFrequency;
        // }).then(function(billingFrequency) {
        //     expect(billingFrequency.toNumber()).to.equal(BILLING_FREQ);
        //     return planReciept.logs[0].args.costPerBilling;
        // }).then(function(costPerBilling) {
        //     expect(costPerBilling.toNumber()).to.equal(COST_PER_BILLING);
        });
    });


});