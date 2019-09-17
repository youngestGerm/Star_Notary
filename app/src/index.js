import Web3 from "web3";
// This will allow us to obtain the solidity functions by accessing the build from StarNotary
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

// Notes 

const App = {
  // Web3 helps us interact with local or remote ethereum node 
  web3: null,
  // App.account = metamask account address
  account: null,
  // Is a web3 contract object which allows us to interact with the contract on the blockchain 
  meta: null,

  start: async function() {
    
    /** These are equivalent:
     * const web3 = this.web3;
     * const {web3} = this;
     */

    const web3 = this.web3;
    
    try {
      // get contract instance
      // network id : 5777, search in migrations or the starnotary file to find available network ids.
      const networkId = await web3.eth.net.getId();
      // gets the network from built JSON file of the contract. This is undefined
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      // creates the interface using the abi from the contract's JSON and address
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );
      
      // get accounts, only one if using metamask.
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },
  // remember document is under the window object (for browsers)
  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },
  // @params Make sure that before you execute this that the App.account in console on chrome matches the one on Metamask that you are currently on.
  createStar: async function() {
    // Equivalent to: const createstar = this.meta.methods.createStar
    // Note that meta.methods is a web3.eth.Contract object, instantiated above

    const { createStar } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    
    console.log(name, id, "line 38")
    
    await createStar(name, id).send({from: this.account});
    // await createStar("Aaron", 1, {from: user1})
    App.setStatus("New Star Owner is " + this.account + ".");
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function (){
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const id = document.getElementById("lookid").value;

    const starOwner = await lookUptokenIdToStarInfo(id).call();
    console.log("starOwner", starOwner);
    App.setStatus("Star Owner is " + starOwner + ".");

  }

};

// window is an object representing a open window in a browser. All major browsers support it.
// Examples: window.alert(), window.console.log(), ... 
window.App = App;

// This is where the application starts when npm run dev is executed in terminal
window.addEventListener("load", async function() {
  /** 
   * These would print log or warnings in the console when the webpage is loaded.
   *  console.log("Event load has been triggered.")
   *  console.warn("warning test")
  */

  // This if statement is only true if window.ethereum is not undefined.
  if (window.ethereum) {
    // use MetaMask's provider, and set the web3 constant here.
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }

  App.start();
});

