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
		maxAmount : Infinity,
		caseSentitive : true
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
		branches : {}
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
				return [];
			}
		}

		var predictedList = _exploreBranch(word, auxBranch);

		predictedList.sort(config.sort);

		//If passes the amount as parameter, uses it
		//Otherwise, uses the custom maxAmount.
		if(typeof amount !== 'undefined') {
			return predictedList.slice(0, amount);
		}
		else {
			return predictedList.slice(0, config.maxAmount);
		}


	};

	/**
	 * Executes a BFS looking for the words that contain the word passed as parameter
	 * @param  {String} baseWord The base to look for
	 * @param  {Object} branch   The begining branch
	 * @return {Array}          List of predicted words
	 */
	 var _exploreBranch = function(baseWord, branch) {
	 	var predictedList = [],
	 	stack = [],
	 	keys,
	 	node =  {ch : '', word: baseWord, branch : branch};

 		stack.push(node);

 		while(stack.length != 0) {
 			node = stack.shift();

			//If the current leaf ends a word, puts the word on the list
			if(node.branch.$) {
				predictedList.push(node.word + node.ch);
			}

			//Get the branch names that forks from the branch
			keys = Object.keys(node.branch.branches);

			if(keys.length > 0) {

				//Tests if the search can be stopped
				if(predictedList.length < config.maxAmount/* && keys.length > 0*/) {

					//Create a string object, so it will be the same reference in every children
					var currentWord = new String(node.word + node.ch);

					//Order the key array, so in the next iteration,
					//if the maxAmount get reached, the search stops before
					//the other branches be searched
					keys.sort();

					for(var _ch_ in keys) {
						var ch = keys[_ch_];

						var newNode = {
							ch : ch,
							word : currentWord,
							branch : node.branch.branches[ch]
						};

						stack.push(newNode)
					}

				}
				else {
					return predictedList;
				}
			}
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
					branches : {}
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