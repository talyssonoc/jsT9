jsT9
====

A text-prediction JavaScript tool developed using PATRICIA tree.

Used by [jsAutoSuggest](https://github.com/talyssonoc/jsAutoSuggest "jsAutoSuggest")

Usage
======

You can use jsT9 normally, using a script tag:

    <script src="commonregex.js"></script>

Or importing it with RequireJS, putting `t9.js` file inside your RequireJS base directory using like this:

    requirejs(['t9'], function(jsT9) {
        //Use jsT9 normally here
    }


To create a new jsT9 instance, you show use the constructor like this:

    var tree = new jsT9(words[, settings]);

Where:

* `words` can be:
  * An array of words, or
  * A string with the path of a JSON file with a field called 'words', with an array of words (see the words.json example file). Not supported in Node.js enviroment.
* `settings` (optional) is a custom settings object (look the next section).

Custom settings
===============

* `sort`: A sort(A, B) function that receives two strings as parameters and returns:  
  * -1 if A < B  
  * 1 if A > B  
  * 0 if A == B
* `maxAmount`: Default max amount of predictions to be returned.

API
===

* `predict(word)`: Return the predictions to the given word.
* `addWord(word)`: Add an new word to the tree.
