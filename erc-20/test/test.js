const Crown = function(addresses) {
	this.initialSupply = 0;
	this.balances = {};

	// burndropping
	this.spent = 0;
	this.totalSpent = 0;

	// Total Supply
	this.maxSupply = 10 * 1000000;
};


/**
 * Minting could add a new address.
 * @param  {[type]} address [description]
 * @param  {[type]} amount  [description]
 * @return {[type]}         [description]
 */
Crown.prototype.mint = function(address, amount) {
	if (amount <= 0) {
		throw "Amount to mint must be greater than 0";
	}

	if (this.balances[address] == undefined) {
		this.initBalance(address, amount);
	} else {
		this.addBalance(address, amount);
	}

	this.initialSupply += amount;
};

/**
 * Warning, no validation!
 * Assume that address has no any recorded balance in the contract.
 * @param  {[type]} address [description]
 * @param  {[type]} amount  [description]
 * @return {[type]}         [description]
 */
Crown.prototype.initBalance = function(address, amount) {
	this.balances[address] = amount;
};

/**
 * Warning, no validation!
 * Assume that address has a record.
 * @param  {[type]} address [description]
 * @return {[type]}         [description]
 */
Crown.prototype.getBalance = function(address) {
	let balance = this.balances[address];
	if (!balance) {
		return 0;
	}

	let fragment = this.calculateDropFragment(this.totalSpent, this.balances[address]);
	balance = fragment + this.balances[address];
	return balance;
};

Crown.prototype.calculateTotalSupply = function totalSupply() {
	let sum = 0;
	for (var i in this.balances) {
		sum += this.getBalance(i);
	}

	return sum;
}

Crown.prototype.addBalance = function(address, amount) {
	this.balances[address] += amount;
}

/**
 * Transfer token from one address to another.
 * It could add address, if target is didn't receive token before.
 * If target address is NULL, then it means burning token by a sender.
 *
 * @param  {[type]} from   [description]
 * @param  {[type]} to     [description]
 * @param  {[type]} amount [description]
 * @return {[type]}        [description]
 */
Crown.prototype.transfer = function(from, to, amount) {
	if (amount <= 0) {
		throw "Amount of token to transfer must be greater than 0!";
	}
	if (this.balances[from] == undefined) {
		throw "Not enough balance to send a Token!";
	} else if (this.getBalance(from) < amount) {
		throw "Not enough balance to send a Token!";
	}

	if (this.balances[to] == undefined) {
		this.balances[to] = 0;
	}

	// make sure that player has enough token to transfer
	// How many tokens could be returned for every token
	let balance = this.getBalance(from);

	// Amount is sum of actual balance and money that player had received from rebalancing.
	// In a transfer, the value of rebalaning should be changed. As it affects balance of all token holders.
	// Therefore we have to get balance without number of rebalancing. We use a ratio for that:
	let denominator = balance/this.balances[from];
	let actualAmount = amount/denominator;

	this.balances[from] -= actualAmount;
	this.balances[to] += actualAmount;

	// Emit Transfer
};

/**
 * Burning could decrease addresses amount.
 *
 * It initiates burndrop.
 * @param  {[type]} addr   [description]
 * @param  {[type]} amount [description]
 * @return {[type]}        [description]
 */
Crown.prototype.burn = function(address, amount) {
	if (this.balances[address] == undefined) {
		throw "Not enough balance to burn!";
	}
	if (this.getBalance(address) < amount ) {
		throw "Not enough balance to burn!";
	}
	let balance = this.getBalance(address);

	// Amount is sum of actual balance and money that player had received from rebalancing.
	// In a transfer, the value of rebalaning should be changed. As it affects balance of all token holders.
	// Therefore we have to get balance without number of rebalancing. We use a ratio for that:
	let denominator = balance/this.balances[address];
	let actualAmount = amount/denominator;

	this.spent += amount;

	this.balances[address] = this.balances[address] - actualAmount;

	// Emit burn
};

/**
 * Warning, no validation!
 * Burndropping changes balance of all token owners.
 * @param  {[type]} amount [description]
 * @return {[type]}        [description]
 */
Crown.prototype.reserve = function(amount) {
	this.spent += amount;
};

/**
 * Warning, no validation!
 * Burndropping changes balance of all token owners.
 * @param  {[type]} amount [description]
 * @return {[type]}        [description]
 */
Crown.prototype.burndrop = function() {
	// Make it in it's own function
	// Cut from drop fragments

	this.totalSpent += this.spent;
	this.spent = 0;

	// Emit burndrop
};

Crown.prototype.calculateDropFragment = function(spent, balance) {
	if (!spent || !balance) {
		return 0;
	}

	return spent*(balance/(this.initialSupply-spent));
}

/**
 * Total balance of user.
 * @param  {[type]} addr [description]
 * @return {[type]}      [description]
 */
Crown.prototype.balanceOf = function(addr) {
	if (this.balances[addr] == undefined) {
		return 0;
	}

	return this.getBalance(addr);
};

Crown.prototype.totalSupply = function() {
	return this.initialSupply;
};


let crown = new Crown();
crown.mint('nicky', 25); crown.mint('medet', 25); crown.mint('dave', 25); crown.mint('cat', 25);

if (crown.totalSupply() != 100) {
	throw "Test failed! Total supply is wrong!";
}

if (crown.balanceOf('medet') != 25) {
	throw "Test failed! Medet's balance is not 10!"
}

// crown.transfer('medet', 'nicky', 10);
// if (crown.balanceOf('medet') != 0) {
	// throw "Test failed! Medet's balance after transfer has to be set to 0!";
// }

// crown.transfer('nicky', 'null', 20);
// if (crown.balanceOf('nicky') != 0 || crown.balanceOf('dave') != 50) {
// 	throw "Test faield! Nicky's balance after transfer has to be set to 0, while Dave has to get 10 more tokens in balance!";
// }
