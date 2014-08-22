(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory());
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory();
    } else {
        // Browser globals
        root.jsT9 = factory();
    }
}(this, function () {

    /**
     * @constructor
     */
    var jsT9 = function jsT9(_wordList, _config) {
        'use strict';

        var wordList;

        this.config = {
            sort: function(wordA, wordB) {
                if (wordA.length < wordB.length)
                    return -1;
                if (wordA.length > wordB.length)
                    return 1;
                if (wordA <= wordB)
                    return -1;
                else
                    return 1;
            },
            maxAmount: Infinity,
            caseSentitive: true,
            dataSource: ''
        };

        // Extends the config options
        (function(destination, source) {
            for (var property in source) {
                destination[property] = source[property];
            }
            return destination;
        })(this.config, _config);


        //The root of the tree
        this.root = {
            branches: []
        };

        if (Array.isArray(_wordList)) {
            wordList = _wordList;
        } else if ((typeof _wordList) === 'string') {
            wordList = this._fetchWordList(_wordList);
        } else {
            throw (typeof _wordList) + ' variable is not supported as data source';
        }

        var word;

        // For each word in the list
        for (var _word_ in wordList) {

            word = wordList[_word_]; //Get the current word to be added to the three

            this.addWord(word);
        }

        return this;
    };

    jsT9.prototype = {
        /**
         * Predict the words, given the initial word
         * @param  {String} word The initial word
         * @return {Array}      The array of Strings with the predicted words
         */
        predict: function predict(word, amount) {

            if (typeof word === 'undefined') {
                return [];
            }

            var currentBranch = this.root,
                finishedWord = false,
                baseWord = '';

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

            if (currentBranch.$ === true)
                var currentWord = baseWord;

            var predictedList = this._exploreBranch(baseWord, currentBranch);

            if (currentWord)
                predictedList.push(currentWord);

            predictedList.sort(this.config.sort);

            //If passes the amount as parameter, uses it
            //Otherwise, uses the custom maxAmount.
            if (typeof amount !== 'undefined') {
                return predictedList.slice(0, amount);
            } else {
                return predictedList.slice(0, this.config.maxAmount);
            }


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

            while (!stopSearchOnCurrentBranch) {
                var wordContainsThePrefix = false;
                var isCase3 = false;


                //Looks for how branch it should follow
                for (var b in branch.branches) {
                    //Case 1:
                    if (branch.branches[b].prefix === word) {
                        branch.branches[b].$ = true;
                        return;
                    }

                    //Case 2:
                    //Cuts the word and goes to the next branch
                    if (word.indexOf(branch.branches[b].prefix) === 0) {
                        wordContainsThePrefix = true;
                        word = word.substring(branch.branches[b].prefix.length);
                        branch = branch.branches[b];
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
                            var newNode = {
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
                    var newNode = {
                        prefix: word,
                        branches: [],
                        $: true
                    };

                    branch.branches.push(newNode);
                    stopSearchOnCurrentBranch = true;
                }
            }
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
         * Fetches the word list from an address
         * @param  {String} path Path of a JSON file with an array called 'words' with the word list
         * @return {Array}      Word list extracted from the given path
         */
        _fetchWordList: function _fetchWordList(path) {
            var words = [];

            //If it is in Node.js neviroment
            if (typeof module !== 'undefined' && module.exports) {
                throw 'File path not supported in Node.js enviroment';
            }
            //If it's on the browser
            else {
                var httpRequest;
                try {
                    // Firefox, Chrome, Opera, Safari
                    httpRequest = new XMLHttpRequest();
                } catch (e) {
                    // Internet Explorer
                    try {
                        httpRequest = new ActiveXObject('Msxml2.XMLHTTP');
                    } catch (e) {
                        try {
                            httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
                        } catch (e) {
                            // The browser doesn't support AJAX
                            return [];
                        }
                    }
                }

                httpRequest.onreadystatechange = function() {
                    if (httpRequest.readyState === 4) {

                        var jsonData = JSON.parse(httpRequest.responseText);

                        if (Array.isArray(jsonData.words)) {
                            words = jsonData.words;
                        } else {
                            return [];
                        }

                    }
                }

                //Makes an sync Ajax call
                httpRequest.open('GET', path, false);
                httpRequest.send();
            }

            return words;
        }
    };

    return jsT9;

}));
