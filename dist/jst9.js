(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['axios'], function(axios) {
    	return (root.jsT9 = factory(axios));
    });
  } else if (typeof exports === 'object') {
    module.exports = factory(require('axios'));
  } else {
    root.jsT9 = factory(root.axios);
  }
}(this, function(axios) {
'use strict';
/**
 * @constructor
 */
var jsT9 = function jsT9(_wordList, _config) {
  'use strict';

  this.config = {
    sort: function sort(wordA, wordB) {
      if (wordA.length < wordB.length) {
        return -1;
      }
      if (wordA.length > wordB.length) {
        return 1;
      }
      if (wordA <= wordB) {
        return -1;
      }
      else {
        return 1;
      }
    },
    maxAmount: Infinity,
    caseSentitive: true,
    slackSearch: true
  };

  // Extends the config options
  (function extend(destination, source) {
    for (var property in source) {
      destination[property] = source[property];
    }
    return destination;
  })(this.config, _config);

  //The root of the tree
  this.root = {
    branches: []
  };

  this._onReadyCallbacks = [];

  this._getWordList(_wordList, function fillTree(wordList) {

    // For each word in the list
    for (var word in wordList) {
      this.addWord(wordList[word]);
    }

    this._isReady = true;

    setTimeout(function() {
      for(var fn in this._onReadyCallbacks) {
        this._onReadyCallbacks[fn].call(null);
      }
    }.bind(this), 0);

  }.bind(this));
};

jsT9.prototype = {
  constructor: jsT9,

  /**
   * Add a listener for when the tree is ready
   * @param  {Function} fn Callback function
   */
  ready: function ready(fn) {
    if(this._isReady) {
      return fn.call(null);
    }

    return this._onReadyCallbacks.push(fn);
  },

  /**
   * Predict the words, given the initial word
   * @param  {String} word The initial word
   * @return {Array}      The array of Strings with the predicted words
   */
  predict: function predict(word, amount) {

    if (!word) {
      return [];
    }

    amount = amount || this.config.maxAmount;

    var currentWord = false;

    var initialBranchResult = this._findInitialBranch(word);

    if(!initialBranchResult) {
      return [];
    }

    if (initialBranchResult.currentBranch.$ === true) {
      currentWord = initialBranchResult.baseWord;
    }

    var predictedList = this._exploreBranch(initialBranchResult.baseWord, initialBranchResult.currentBranch);

    if (currentWord) {
      predictedList.push(currentWord);
    }

    predictedList.sort(this.config.sort);

    return predictedList.slice(0, amount);
  },

  _findInitialBranch: function _findInitialBranch(word) {
    var currentBranch = this.root;

    if(this.config.slackSearch) {
      return this._slackSearch(word, currentBranch);
    }

    return this._normalSearch(word, currentBranch);
  },

  _normalSearch: function _normalSearch(word, currentBranch) {
    var baseWord = '';
    var branchPrefix;
    var branch;
    var found;

    while(word.length) {
      found = false;
      for(branch in currentBranch.branches) {
        branchPrefix = currentBranch.branches[branch].prefix;

        if(word.length < branchPrefix.length) {

          if(branchPrefix.indexOf(word) === 0) {
            baseWord += branchPrefix;

            return {
              currentBranch: currentBranch.branches[branch],
              baseWord: baseWord
            };
          }
        }
        else {

          if(word.indexOf(branchPrefix) === 0) {
            baseWord += branchPrefix;

            word = word.substring(branchPrefix.length);
            currentBranch = currentBranch.branches[branch];
            found = true;
            break;
          }
        }
      }

      if(!found) {
        return false;
      }
    }

    return {
      currentBranch: currentBranch,
      baseWord: baseWord
    };

  },

  _slackSearch: function _slackSearch(word, currentBranch) {
    var baseWord = '';
    var subString;
    var branch;
    var found;
    var i;

    while (word.length) {
      found = false;
      for (i = 0; i < word.length && !found; i++) {
        subString = word.substring(0, word.length - i);

        for (branch in currentBranch.branches) {
          if (currentBranch.branches[branch].prefix.indexOf(subString) === 0) {
            baseWord += currentBranch.branches[branch].prefix;

            if (currentBranch.branches[branch].prefix === subString) {
              word = word.substring(word.length - i);
            }
            //In cases where it begins with the substring, but doesn't end with it
            //so it should just start the search from there
            else {
              word = '';
            }

            currentBranch = currentBranch.branches[branch];
            found = true;
            break;
          }
        }
      }

      if (!found) {
        return false;
      }
    }

    return {
      currentBranch: currentBranch,
      baseWord: baseWord
    };
  },

  /**
   * Add a new word to the tree
   * @param {String} word Word to be added to the tree
   */
  addWord: function addWord(word) {

    var branch = this.root;
    var stopSearchOnCurrentBranch = false;
    var newNode;

    while (!stopSearchOnCurrentBranch) {
      var wordContainsThePrefix = false;
      var isCase3 = false;
      var case2Result;

      //Looks for how branch it should follow
      for (var b in branch.branches) {

        //Case 1: current node prefix == `word`
        if(this._tryCase1(branch, word, b)) {
          return;
        }

        //Case 2: `word` begins with current node prefix to add
        //Cuts the word and goes to the next branch
        case2Result = this._tryCase2(branch, word, b);
        if(case2Result) {
          word = case2Result.word;
          branch = case2Result.branch;
          wordContainsThePrefix = true;
          break;
        }

        //Case 3: current node prefix begins with part of or whole `word`
        if(this._tryCase3(branch, word, b)) {
          isCase3 = stopSearchOnCurrentBranch = wordContainsThePrefix = true;
          break;
        }
      }

      //Case 4: current node prefix doesn't have intersection with `word`
      if(this._tryCase4(branch, word, wordContainsThePrefix)) {
        stopSearchOnCurrentBranch = true;
      }
    }
  },

  _tryCase1: function _tryCase1(branch, word, b) {
    if (branch.branches[b].prefix === word) {
      branch.branches[b].$ = true;
      return true;
    }

    return false;
  },

  _tryCase2: function _tryCase2(branch, word, b) {
    if (word.indexOf(branch.branches[b].prefix) === 0) {
      word = word.substring(branch.branches[b].prefix.length);
      branch = branch.branches[b];

      return {
        branch: branch,
        word: word
      };
    }

    return false;
  },

  _tryCase3: function _tryCase3(branch, word, b) {
    var newNode;

    for (var i = 0; i <= word.length - 1; i++) {
      //Cuts the word starting from the end,
      //so it "merges" words that just begin equal between them
      var cutWord = word.substring(0, word.length - i);

      var restPrefix = word.substring(word.length - i);

      if (branch.branches[b].prefix.indexOf(cutWord) === 0) {
        //The new node where the word is cut
        newNode = {
          prefix: cutWord,
          branches: [],
          $: (restPrefix.length === 0)
        };

        //The node that inherits the data from the old node
        //that was cut
        var inheritedNode = {
          prefix: branch.branches[b].prefix.substring(cutWord.length),
          branches: branch.branches[b].branches,
          $: branch.branches[b].$
        };

        branch.branches[b] = newNode;
        branch.branches[b].branches.push(inheritedNode);

        //If the prefixes only begin equal, creates the new node
        //with the rest of the prefix
        if (restPrefix.length > 0) {
          var restNode = {
            prefix: restPrefix,
            branches: [],
            $: true
          };

          branch.branches[b].branches.push(restNode);
        }

        return true;
      }
    }
  },

  _tryCase4: function _tryCase4(branch, word, wordContainsThePrefix) {
    var newNode;

    if (!wordContainsThePrefix) {
      newNode = {
        prefix: word,
        branches: [],
        $: true
      };

      branch.branches.push(newNode);
      return true;
    }

    return false;
  },

  /**
   * Looks for the words that contain the word passed as parameter
   * @param  {String} baseWord The base to look for
   * @param  {Object} currentBranch   The begining branch
   * @return {Array}          List of predicted words
   */
  _exploreBranch: function _exploreBranch(baseWord, currentBranch) {
    var predictedList = [];

    for (var b in currentBranch.branches) { //For each branch forking from the branch
      var prefix = currentBranch.branches[b].prefix; //Get the leading character of the current branch

      if (currentBranch.branches[b].$ === true) { //If the current leaf ends a word, puts the word on the list
        predictedList.push(baseWord + prefix);
      }

      //Recursively calls the function, passing the forking branches as parameter
      var predictedWords = this._exploreBranch(baseWord + prefix, currentBranch.branches[b]);

      predictedList = predictedList.concat(predictedWords);

    }
    return predictedList;
  },

  /**
   * Returns the word list base on config
   * @param  {Array|String}
   * @param  {Function}
   * @return {Array}
   */
  _getWordList: function _getWordList(_wordList, callback) {
    if(Array.isArray(_wordList)) {

      callback(_wordList);

    } else if ((typeof _wordList) === 'string') {

      this._fetchWordList(_wordList, callback);

    } else {

      console.error((typeof _wordList) + ' variable is not supported as data source');
      callback([]);

    }
  },

  /**
   * Fetches the word list from an address
   * @param  {String} path Path of a JSON file with an array called 'words' with the word list
   * @return {Array}      Word list extracted from the given path
   */
  _fetchWordList: function _fetchWordList(path, callback) {
    var words = [];

    axios.get(path)
    .then(function(response) {

      var jsonData = response.data;

      if(response.responseType === 'text') {
        jsonData = JSON.parse(jsonData);
      }

      if(Array.isArray(jsonData.words)) {
        words = jsonData.words;
      }

      callback(words);
    }.bind(this))
    .catch(function(error) {
      callback(words);
    }.bind(this));
  }
};

return jsT9;
}));
