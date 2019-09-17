# Udacity Star Notary Project

## Run Project

1. We will first build and create our test blockchain (backend). In terminal: 
``` 
    a. cd <root project folder> // Change directory to project folder on terminal
    b. truffle compile 
    c. truffle migrate // truffle migrate --reset if necessary
    d. truffle develop // or launch ganache, infura, etc.
```
2. We will next establish the front end. Open up another terminal window, separate from the first one. In terminal in the project root folder:
```
    a. cd app
    b. npm run dev 
```
3. We will next create a star using the front end webpage. To access the information that the star contains, open the HTML link that the command above produced, and input data. Note that Metamask address is the same as the HTML App.address.

## Running Tests
```
    a. cd <root project folder> // Change directory to project folder on terminal
    b. truffle compile 
    c. truffle migrate // truffle migrate --reset if necessary
    d. truffle develop
    e. test // this is code executed in the develop console
```

## Potential Errors in Chrome Console 

> MetaMask - RPC Error: Internal JSON-RPC error. {code: -32603, message: "Internal JSON-RPC error.", data: {…}, stack: "Error: JsonRpcEngine - response has no error or...

Check Metamask first. If it cannot connect to network http://127.0.0.1:9545/ it is because truffle develop was not set up. Go back to the initial steps.

> MetaMask - RPC Error: Internal JSON-RPC error. {code: -32603, message: "Internal JSON-RPC error.", stack: "Error: WalletMiddleware - Invalid "from" address.↵…. The error originated also in metamask with the following message: 

Make sure that the address that is being used on Metamask matches the one that the App.account has which is executable in the console on chrome.

## Background Information
    Versions: openzeppelin-solidity@2.1.2 truffle@5.0.21
    Token Name: 'Aaron's Tokens' Token Symbol: 'ANT'
    Token Address: '0x6686B305385ADba14e74692D426010ae339A9c4c'
    
**Note that this is the second project that was accomplished in the Udacity Blockchain nanodegree program.**
