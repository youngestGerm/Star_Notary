const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', "Aaron", owner, tokenId, {from: owner});
    assert.equal(JSON.stringify(await instance.tokenIdToStarInfo.call(tokenId)), '{"0":"Awesome Star!","1":"Aaron","2":"0x87817F0e823eDdcdeCC6751B6c143Fe5e9e8dbF3","name":"Awesome Star!","symbol":"Aaron","addressBelongingTo":"0x87817F0e823eDdcdeCC6751B6c143Fe5e9e8dbF3"}');
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', "Aaron", owner, starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', "Aaron", owner, starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', "Aaron", owner, starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', "Aaron", owner, starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    let starId = 6;
    let user1 = accounts[1];
    let instance = await StarNotary.deployed();
    await instance.createStar('awesome star', "Aaron", owner, starId, {from: user1});
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(JSON.stringify(await instance.tokenIdToStarInfo.call(starId)), '{"0":"awesome star","1":"Aaron","2":"0x87817F0e823eDdcdeCC6751B6c143Fe5e9e8dbF3","name":"awesome star","symbol":"Aaron","addressBelongingTo":"0x87817F0e823eDdcdeCC6751B6c143Fe5e9e8dbF3"}');
    //assert.equal((name, symbol), ("instance","Aaron"));
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    //variables tokenId and starId mean the same thing, values in them may change
    let starId1 = 7;
    let starId2 = 8;
    let user1 = accounts[1];
    let user2 = accounts[2];
    let instance = await StarNotary.deployed();
    await instance.createStar('User1Star', "Aaron", user1, starId1, {from: user1});
    await instance.createStar('User2Star', "Aaron", user2, starId2, {from: user2});
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    let star1 = JSON.stringify(await instance.tokenIdToStarInfo.call(starId1));
    let star2 = JSON.stringify(await instance.tokenIdToStarInfo.call(starId2));
    //console.log(star1, star2)
    await instance.exchangeStars(starId1, starId2, {from: user1});
    // 3. Verify that the owners changed
    let star1AfterExchange = JSON.stringify(await instance.tokenIdToStarInfo.call(starId1));
    let star2AfterExchange = JSON.stringify(await instance.tokenIdToStarInfo.call(starId2));
   // console.log(star1AfterExchange, star2AfterExchange)

    assert.equal((star1AfterExchange, star2AfterExchange), (star2, star1));
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId'
    let starId1 = 10;
    let user1 = accounts[0];
    let user2 = accounts[1];
    let instance = await StarNotary.deployed();
    await instance.createStar('User1Star', "Aaron", user1, starId1, {from: user1});
    // 2. use the transferStar function implemented in the Smart Contract
    let originalStar = await instance.tokenIdToStarInfo.call(starId1);
    console.log(JSON.stringify(originalStar));
    await instance.transferStar(user2, starId1);
    // 3. Verify the star owner changed.
    let transferedStar = JSON.stringify(await instance.tokenIdToStarInfo.call(starId1));
    console.log(JSON.stringify(transferedStar));
    assert.equal(transferedStar, '{"0":"User1Star","1":"Aaron","2":"0x3bA7E36E2c8bE018c46Ab197c0FE2CEDBa3e9866","name":"User1Star","symbol":"Aaron","addressBelongingTo":"0x3bA7E36E2c8bE018c46Ab197c0FE2CEDBa3e9866"}');
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    let starId1 = 11;
    let user1 = accounts[0];
    let instance = await StarNotary.deployed();
    await instance.createStar('User1Star', "Aaron", user1, starId1, {from: user1});
    // 2. Call your method lookUptokenIdToStarInfo
    let name = await instance.lookUptokenIdToStarInfo(starId1);
    // 3. Verify if you Star name is the same
    assert.equal(name, "User1Star")
});