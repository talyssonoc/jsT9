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
    dataSource: ''
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

  this._getWordList(_wordList, function fillTree(wordList) {
    var word;

    // For each word in the list
    for (var _word_ in wordList) {

      word = wordList[_word_]; //Get the current word to be added to the three

      this.addWord(word);
    }
  }.bind(this));
};

jsT9.prototype = {
  constructor: jsT9,

  /**
   * Predict the words, given the initial word
   * @param  {String} word The initial word
   * @return {Array}      The array of Strings with the predicted words
   */
  predict: function predict(word, amount) {

    if (typeof word === 'undefined') {
      return [];
    }

    amount = amount || this.config.maxAmount;

    var currentBranch = this.root;
    var finishedWord = false;
    var baseWord = '';

    //Goes through the tree until it finds the branch from
    //where it will begin to predict

    while (!finishedWord) {
      var found = false;
      for (var i = 0; i < word.length && !found; i++) {
        var subString = word.substring(0, word.length - i);

        for (var branch in currentBranch.branches) {
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
        // console.log('No matches');
        return [];
      }

      if (word.length === 0) {
        finishedWord = true;
      }
    }

    var currentWord;

    if (currentBranch.$ === true) {
      currentWord = baseWord;
    }

    var predictedList = this._exploreBranch(baseWord, currentBranch);

    if (currentWord) {
      predictedList.push(currentWord);
    }

    predictedList.sort(this.config.sort);

    return predictedList.slice(0, amount);
  },

  /**
   * Add a new word to the tree
   * @param {String} word Word to be added to the tree
   */
  addWord: function addWord(word) {

    //Cases:
    //  1: current node prefix == word to add
    //
    //  2: word begins with current node prefix to add
    //
    //  3: current node prefix begins with part of or whole word to add
    //
    //  4: current node prefix intersection with word == empty

    var branch = this.root;
    var stopSearchOnCurrentBranch = false;
    var newNode;

    while (!stopSearchOnCurrentBranch) {
      var wordContainsThePrefix = false;
      var case2Result = false;
      var isCase3 = false;

      //Looks for how branch it should follow
      for (var b in branch.branches) {

        //Case 1: current node prefix == word to add
        if(this.tryCase1(branch, word, b)) {
          return;
        }

        //Case 2: word begins with current node prefix to add
        //Cuts the word and goes to the next branch
        case2Result = this.tryCase2(branch, word, b);
        if(case2Result) {
          word = case2Result.word;
          branch = case2Result.branch;
          wordContainsThePrefix = true;
          break;
        }

        //Case 3
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

            stopSearchOnCurrentBranch = wordContainsThePrefix = true;
            isCase3 = true;
            break;
          }
        }

        if (isCase3) {
          break;
        }
      }

      //Case 4:
      if (!wordContainsThePrefix) {
        newNode = {
          prefix: word,
          branches: [],
          $: true
        };

        branch.branches.push(newNode);
        stopSearchOnCurrentBranch = true;
      }
    }
  },

  tryCase1: function tryCase1(branch, word, b) {
    if (branch.branches[b].prefix === word) {
      branch.branches[b].$ = true;
      return true;
    }

    return false;
  },

  tryCase2: function tryCase2(branch, word, b) {
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

      if (Array.isArray(jsonData.words)) {
        words = jsonData.words;
      }

      callback(words);

    })
    .catch(function(error) {

      console.error(error);
      callback(words);

    });
  }
};
