const { expect } = require("chai"); 
const {
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
  } = require('@openzeppelin/test-helpers');

var ServicePlans = artifacts.require("./UserPlanSubscriptions.sol");

contract('ServicePlans', function(accounts) {
    let planContract;
    let SERVICE_CODE = "SERVICE 101";
    let SERVICE_OWNER = accounts[0];
    let NOT_OWNER = accounts[1];
    let PLAN_CODE = "PLAN-A";
    let BILLING_FREQ = 0;
    let COST_PER_BILLING = 5;
    
    it('createPlan: creates the plan for the service if the service exists', function() {
        let serviceId;
        let planReciept;
        return ServicePlans.new().then(async function(instance) {
            planContract = instance;
            await expectRevert.unspecified(planContract.createPlan(123, PLAN_CODE, BILLING_FREQ, COST_PER_BILLING, {from: SERVICE_OWNER}), "User not present");
            await planContract.connect({from: SERVICE_OWNER});
            await expectRevert.unspecified(planContract.createPlan(123, PLAN_CODE, BILLING_FREQ, COST_PER_BILLING, {from: SERVICE_OWNER}), "Service not present");
            return planContract.createService(SERVICE_CODE, {from: SERVICE_OWNER});
        }).then(async function(service_reciept) {
            await expectEvent(service_reciept, 'ServiceCreated');
            return service_reciept.logs[0].args.serviceId;
        }).then(async function(serviceIdCreated) {
            serviceId = serviceIdCreated;
            await expectRevert.unspecified(planContract.createPlan(serviceId, PLAN_CODE, BILLING_FREQ, COST_PER_BILLING, {from: NOT_OWNER}), "User not the owner of the requested service");
            return planContract.createPlan(serviceId, PLAN_CODE, BILLING_FREQ, COST_PER_BILLING, {from: SERVICE_OWNER});
        }).then(async function(plan_reciept) {
            planReciept = plan_reciept;
            await expectEvent(planReciept, 'PlanCreated');
            return planReciept.logs[0].args.serviceId;
        }).then(function(serviceIdCreated) {
            expect(serviceIdCreated.toString()).to.equal(serviceId.toString());
            return planReciept.logs[0].args.planCode;
        }).then(function(planCode) {
            expect(planCode).to.equal(PLAN_CODE);
            return planReciept.logs[0].args.billingFrequency;
        }).then(function(billingFrequency) {
            expect(billingFrequency.toNumber()).to.equal(BILLING_FREQ);
            return planReciept.logs[0].args.costPerBilling;
        }).then(function(costPerBilling) {
            expect(costPerBilling.toNumber()).to.equal(COST_PER_BILLING);
        });
    });

    it('getPlans: fetch all the plans created under given service', function() {
        let plans;
        let serviceId;
        return ServicePlans.new().then(async function(instance) {
            planContract = instance;
            await planContract.connect({from: SERVICE_OWNER});
            return planContract.createService(SERVICE_CODE, {from: SERVICE_OWNER});
        }).then(async function(service_reciept) {
            await expectEvent(service_reciept, 'ServiceCreated');
            return service_reciept.logs[0].args.serviceId;
        }).then(async function(serviceId_created) {
            serviceId = serviceId_created;
            return planContract.getPlans(serviceId, {from: SERVICE_OWNER});
        }).then(async function(plans_created) {
            plans = plans_created;
            expect(plans_created.length).to.equal(0);
            await planContract.createPlan(serviceId, PLAN_CODE, BILLING_FREQ, COST_PER_BILLING, {from: SERVICE_OWNER});
            return planContract.getPlans(serviceId,{from: SERVICE_OWNER});
        }).then(function(plans_created) {
            plans = plans_created;
            return plans[0].planCode;
        }).then(function(planCode) {
            expect(planCode).to.equal(PLAN_CODE);
            return plans[0].serviceCode;
        }).then(function(serviceCode) {
            expect(serviceCode).to.equal(SERVICE_CODE);
            return plans[0].billingFrequency;
        }).then(function(billingFrequency) {
            expect(billingFrequency).to.equal(BILLING_FREQ.toString());
            return plans[0].costPerBilling;
        }).then(function(costPerBilling) {
            expect(costPerBilling).to.equal(COST_PER_BILLING.toString());
        });
    });
});