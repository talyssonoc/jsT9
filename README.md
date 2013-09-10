jsT9
====

A text-prediction JavaScript tool developed using trie

Usage
=====

Create an instance of T9 passing an array of strings with the terms that will be added to the tree. 

And, if needed, a second argument with custom settings (look in the next section).

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