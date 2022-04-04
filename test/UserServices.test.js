const { expect } = require("chai"); 
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
  } = require('@openzeppelin/test-helpers');

var UserServices = artifacts.require("./UserPlanSubscriptions.sol");

contract('UserServices', function(accounts) {
    
    let SERVICE_CODE = "SERVICE 101";
    let SERVICE_OWNER = accounts[0];
    let serviceContract;
    it('createService: creates the service with input parameters if service code is not already present', function() {
        return UserServices.new().then(async function(instance) {
            serviceContract = instance;
            return serviceContract.createService(SERVICE_CODE, {from: SERVICE_OWNER});
        }).then(async function(reciept) {
            await expectEvent(reciept, 'ServiceCreated', {1:SERVICE_OWNER, 2:SERVICE_CODE});
            await expectRevert.unspecified(serviceContract.createService(SERVICE_CODE, {from: SERVICE_OWNER}), "Service code is already present");
        });
    });

    it('getAllOwnedServices: fetch all the services owned by the user', function() {
        let services;
        return UserServices.new().then(async function(instance) {
            serviceContract = instance;
            return serviceContract.getAllOwnedServices({from: SERVICE_OWNER});
        }).then(function(services) {
            return services.length;
        }).then(async function(length) {
            expect(length).to.equal(0);
            await serviceContract.createService(SERVICE_CODE, {from: SERVICE_OWNER});
            return serviceContract.getAllOwnedServices({from: SERVICE_OWNER});
        }).then(function(service_list) {
            services = service_list;
            return services.length;
        }).then(function(length) {
            expect(length).to.equal(1);
            return services[0].owner;
        }).then(function(owner) {
            expect(owner).to.equal(SERVICE_OWNER);
            return services[0].serviceCode;
        }).then(function(serviceCode) {
            expect(serviceCode).to.equal(SERVICE_CODE);
        });
    });
});