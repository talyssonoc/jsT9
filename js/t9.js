var T9 = function(_wordList, _config) {
	var _ = this;

	var wordList = _wordList;

	var config = {
		sort : function(wordA, wordB) {
			if(wordA.length <= wordB.length)
				return -1;
			if(wordA.length > wordB.length)
				return 1;
			if(wordA <= wordB)
				return -1;
			else
				return 1;
		},
		maxAmount : -1
	};

	// Extends the config options
	(function(destination, source) {
		for (var property in source) {
			destination[property] = source[property];
		}
		return destination;
	})(config, _config);

	
	//The root of the tree
	var root = {
		$ : false,
		branches : []
	};

	/**
	 * Predict the words, given the initial word
	 * @param  {String} word The initial word
	 * @return {Array}      The array of Strings with the predicted words
	 */
	this.predict = function(word, amount) {
		var auxBranch = root;

		//Goes through the tree until it finds the branch from
		//where it will begin to predict
		for(var _ch_ in word) {
			var ch = word[_ch_]; //Get the current character from the word

			//If the leaf branch with the current character exists, goes to the next branch
			if(typeof auxBranch.branches[ch] !== 'undefined') {
				auxBranch = auxBranch.branches[ch];
			}
			else {
				// console.log('No matches');
				return [];
			}
		}

		var predictedList = _exploreBranch(word, auxBranch);

		predictedList.sort(config.sort);

		//If passes the amount as parameter, uses it
		//Otherwise, check if the user changed the default
		//max amount. If so, it uses the custom maxAmount,
		//otherwise return all the results
		if(typeof amount !== 'undefined') {
			return predictedList.slice(0, amount);
		}
		else {
			if(config.maxAmount > -1)
				return predictedList.slice(0, config.maxAmount);
			else
				return predictedList;
		}
			

	};

	/**
	 * Goes trough the branch looking for the words that contain the word passed as parameter
	 * @param  {String} baseWord The base word of the current branch
	 * @param  {Object} branch   The current branch
	 * @return {Array}          List of predicted words
	 */
	var _exploreBranch = function(baseWord, branch) {
		var predictedList = [];

		var keys = Object.keys(branch.branches); //Get the branch names that forks from the branch
		for(var _ch_ in keys) { //For each branch forking from the branch
			var ch = keys[_ch_]; //Get the leading character of the current branch
			
			if(branch.branches[ch].$ === true) { //If the current leaf ends a word, puts the word on the list
				predictedList.push(baseWord + ch);
			}

			//Recursively calls the function, passing the forking branches as parameter
			var predictedWords = _exploreBranch(baseWord + ch, branch.branches[ch]);

			predictedList =  predictedList.concat(predictedWords);

		}
		return predictedList;
	};

	/**
	 * Add a new word to the tree
	 * @param {String} word Word to be added to the tree
	 */
	this.addWord = function(word) {
		var auxBranch = root;

		//For each character of the current word
		for(var _ch_ in word) {
			var ch = word[_ch_]; //Get the current character of the word

			//If the branch doesn't have the word yet
			if(typeof auxBranch.branches[ch] === 'undefined') {
				auxBranch.branches[ch] = { //Adds a new leaf to the tree
					$ : false,
					branches : []
				};
			}
			auxBranch = auxBranch.branches[ch];
		}

		auxBranch.$ = true;
	};

	/**
	 *	Starts the trie tree with the list of words
	 * 
	 * @constructor
	 */
	var _init = function() {
		// For each word in the list
		for(var _word_ in wordList) {

			var word = wordList[_word_]; //Get the current word to be added to the three

			_.addWord(word);
		}

	};

	//Calls the constructor
	_init();

	return this;
};