jsT9
====

A text-prediction JavaScript tool developed using PATRICIA tree

Constructor arguments
=====================

Create a new jsT9(words[, settings]) instance, where:

* `words` is an array of words or a string with the path of a JSON file with a field called 'words' with an array of words (see the words.json file).
* `settings` (optional) is a custom settings object (look the next section).

Custom settings
===============

* `sort`: Sort function that receives two strings A and B as parameters and returns:  
 -1 if A < B  
 1 if A > B  
 0 if A == B
* `maxAmount`: Default max amount of predictions to be returned.

API
===

* `predict(word)`: Return the predictions to the given word.
* `addWord(word)`: Add an new word to the tree.
