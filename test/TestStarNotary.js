const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner; 

contract('StarNotary', async (accs) => {
    accounts = accs;
    owner = accounts[0];
    console.log(accounts)
    
    it('can Create a Star', async() => {
        
        let tokenId = 1;
        let instance = await StarNotary.deployed();
        await instance.createStar('Awesome Star!', tokenId, {from: owner});
        assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!');
    });
    
    it('lets user1 put up their star for sale', async() => {
        let tokenId = 2;
        let instance = await StarNotary.deployed();
        let starPrice = web3.utils.toWei(".01", "ether");
        await instance.createStar('Awesome Star!', tokenId, {from: owner});
        await instance.putStarUpForSale(tokenId, starPrice, {from: owner});
        assert.equal(await instance.starsForSale.call(tokenId), starPrice);
    });
    
    it('lets user1 get the funds after the sale', async() => {
        // If you run this on another network, make sure that you have multiple accounts. You only have one on the rinkeby test network
        
        let user1 = accounts[1];
        let user2 = accounts[2];
        let tokenId = 3;
        let instance = await StarNotary.deployed();
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");
        
        // 1. Create and put star up for sale
        await instance.createStar('Awesome Star!', tokenId, {from: user1});
        await instance.putStarUpForSale(tokenId, starPrice, {from: user1});
        await instance.createStar('4th star', 4, {from: user2});
        // 2. Buy star
        let beforeTransaction = await web3.eth.getBalance(user1);
        await instance.buyStar(tokenId, {from: user2, value: balance});
        let afterTransaction = await web3.eth.getBalance(user1);

        // 3. Test if user has received funds
        let value1 = Number(beforeTransaction) + Number(starPrice);
        let value2 = Number(afterTransaction);
        console.log(value1, value2, "values")
        assert.equal(value1, value2, "Values are not equal");
    });
    
    it('lets user2 buy a star, if it is put up for sale', async() => {
        let user1 = accounts[1], user2 = accounts[2], tokenId = 4, starPrice = web3.utils.toWei(".01", "ether"), balance = web3.utils.toWei(".05", "ether");
        let instance = await StarNotary.deployed();

        // 1. Create and put star up for sale
        await instance.createStar('Awesome Star!', tokenId, {from: user1});
        await instance.putStarUpForSale(tokenId, starPrice, {from: user1});

        // 2. Buy star 
        await instance.buyStar(tokenId, {from: user2, value: balance});
        
        // 3. Test to see if user2 is the new owner of the bought star, instead of user1, who has sold the star.
        let owner = await instance.ownerOf.call(tokenId)
        assert.equal(owner, user2);
    });
    
    it('lets user2 buy a star and decreases its balance in ether', async() => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1], user2 = accounts[2], tokenId = 5, starPrice = web3.utils.toWei(".01", "ether"), balance = web3.utils.toWei(".05", "ether");
        
        // Note that these functions, createStar, putStar, buyStar function are all fromm the contract StarNotary

        // 1. We create the star and add it in the market on our network from user1.
        await instance.createStar('Awesome Star!', tokenId, {from: user1});
        await instance.putStarUpForSale(tokenId, starPrice, {from: user1});
        
        // 2. We create a ficticious buyer named user 2 who attempts to buy the star from user1 on the market using Ethereum. The balance of the transaction before should be .01 ether or more due to the gas price 
        const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
        await instance.buyStar(tokenId, {from: user2, value: balance});
        const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
        
        // 3. We check whether the transaction has deducted the appropriate amount for the balance of user 2 
        let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
        console.log(value, "line 21 value")
        assert.ok(value >= starPrice, "The before and after values do not match");
    });
    
    // Implement Task 2 Add supporting unit tests
    
    it('can add the star name and star symbol properly', async() => {
        let instance = await StarNotary.deployed();
        // 1. create a Star with different tokenId
        let tokenId = 6;
        let user1 = accounts[1];
        await instance.createStar('Awesome Star!', tokenId, {from: user1});
        //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
        assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
        //assert.equal((name, symbol), ("instance","Aaron"));
    });
    
    it('lets 2 users exchange stars', async() => {
        let instance = await StarNotary.deployed();
        // 1. create 2 Stars with different tokenId
        //variables tokenId and starId mean the same thing, values in them may change
        let tokenId1 = 7;
        let tokenId2 = 8;
        let user1 = accounts[1];
        let user2 = accounts[2];
        await instance.createStar('Awesome Star! From User 1', tokenId1, {from: user1});
        await instance.createStar('Awesome Star! From User 2', tokenId2, {from: user2});
        await instance.approve(user2, tokenId1, {from: user1});
        await instance.approve(user1, tokenId2, {from: user2});
        // 2. Call the exchangeStars functions implemented in the Smart Contract
        let star1 = await instance.lookupAddressViaTokenid(tokenId1);
        let star2 = await instance.lookupAddressViaTokenid(tokenId2);
        console.log(star1, star2)
        
        await instance.exchangeStars(tokenId1, tokenId2, {from: user1});
        
        // 3. Verify that the owners changed
        let star1AfterExchange = await instance.lookupAddressViaTokenid(tokenId1);
        let star2AfterExchange = await instance.lookupAddressViaTokenid(tokenId2);
        console.log(star1AfterExchange, star2AfterExchange)
    
        assert.equal((star1AfterExchange, star2AfterExchange), (star2, star1));
    });
    
    it('lets a user transfer a star', async() => {
        let instance = await StarNotary.deployed();
        // 1. create a Star with different tokenId'
        let tokenId = 10;
        let user2 = accounts[1];
        await instance.createStar('Awesome Star!', tokenId, {from: owner});
        // 2. use the transferStar function implemented in the Smart Contract
        let originalStar = await instance.lookupAddressViaTokenid(tokenId);
        //console.log(originalStar)
        await instance.transferStar(user2, tokenId);
        // 3. Verify the star owner changed.
        originalStar = await instance.lookupAddressViaTokenid(tokenId);
        //console.log(originalStar, user2);
        
        assert.equal(originalStar, user2);
    });
    
    it('lookUptokenIdToStarInfo test', async() => {
        let instance = await StarNotary.deployed();
        // 1. create a Star with different tokenId
        let tokenId = 11;
        await instance.createStar('Awesome Star!', tokenId, {from: owner});
        // 2. Call your method lookUptokenIdToStarInfo
        let name = await instance.lookUptokenIdToStarInfo(tokenId);
        // 3. Verify if you Star name is the same
        assert.equal(name, 'Awesome Star!');
    });
});

