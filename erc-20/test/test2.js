const pointMultiplier = 10e18;
let Account = function() {this.balance = 0; this.lastDividends = 0;}

let accounts = {}

accounts['medet'] = new Account()
accounts['dave'] = new Account()
accounts['nicky'] = new Account()

accounts['medet'].balance = 10
accounts['dave'].balance = 30
accounts['nicky'].balance = 50

let calculateSupply = function(accounts) { let sum = 0; for (var name in accounts) {let account = accounts[name]; sum += account.balance;}; return sum; };

if (calculateSupply(accounts) != 90) {
	throw "Invalid supply calculated";
}

let totalDividends = 0;
let totalSupply = calculateSupply(accounts);
let unclaimedDividends = 0;
let dividends = 0;

let disburse = function(amount, from) {
	updateAccount(from);
	accounts[from].balance -= amount;

	unclaimedDividends += amount;
	dividends += amount;
	// dividends += (amount * pointMultiplier) / (totalSupply - amount );

};

let unlockDividends = function() {
	totalDividends += dividends;
};

let owings = function(name) {
	let newDividend = totalDividends - accounts[name].lastDividends;
	return (accounts[name].balance * newDividend) / (totalSupply); //pointMultiplier;
};

let transfer = function(from, to, amount) {
	updateAccount(from);
	updateAccount(to);

	accounts[from].balance -= amount;
	accounts[to].balance += amount;
};

let updateAccount = function(name) {
	let owing = owings(name);
	if (owing > 0) {
		unclaimedDividends -= owing;
		accounts[name].balance += owing;
		accounts[name].lastDividends = totalDividends;
	} else {
		accounts[name].lastDividends = totalDividends;
	}
};

let getBalance = function(name) {
	return accounts[name].balance + owings(name);
};