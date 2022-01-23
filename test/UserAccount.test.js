const { expect } = require("chai"); 
const {
    BN,           // Big Number support
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
  } = require('@openzeppelin/test-helpers');

var UserAccount = artifacts.require("./UserPlanSubscriptions.sol");

contract('UserAccount', function(accounts) {
    let USER1_ADDRESS = accounts[0];
    let USER2_ADDRESS = accounts[1];
    let userContract;
    it('constructor: initializes the contract with the correct states variables', function() {
        return UserAccount.new().then(function(instance) {
            userContract = instance;
            return userContract.address;
        }).then(function(address) {
            expect(address).to.not.equal(0x0);
            expect(address).to.not.equal(null);
            expect(address).to.not.equal(undefined);
            expect(address).to.not.equal('');
        });
    });

    // it('connect: creates user account when user not active', async function() {
    //     return UserAccount.new().then(function(instance) {
    //         userContract = instance;
    //         return userContract.connect({from: USER1_ADDRESS});
    //     }).then(async function(reciept) {
    //         await expectEvent(reciept, 'UserCreated', {owner:USER1_ADDRESS, balance:(new BN(0)), isActive:true});
    //     });
    // });

    it('deposit, getCurrentBalance: deposit successful when user avaliable and value sent is positive', function() {
        return UserAccount.new().then(function(instance) {
            return userContract.getCurrentBalance({from:USER1_ADDRESS});
        }).then(async function(balance) {
            expect(balance.toNumber()).to.equal(0);
            await expectRevert.unspecified(userContract.deposit({from: USER1_ADDRESS, value:0}), "Deposit amount should be greater than zero");
            return userContract.deposit({from: USER1_ADDRESS, value:10});
        }).then(function(reciept) {
            return userContract.getCurrentBalance({from:USER1_ADDRESS});
        }).then(function(balance) {
            expect(balance.toNumber()).to.equal(10);
        });
    });
});