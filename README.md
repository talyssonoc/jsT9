# jsT9

[![Build Status](https://travis-ci.org/talyssonoc/jsT9.svg?branch=master)](https://travis-ci.org/talyssonoc/jsT9) [![Code Climate](https://codeclimate.com/github/talyssonoc/jsT9/badges/gpa.svg)](https://codeclimate.com/github/talyssonoc/jsT9)

## Installation

With npm

```
  $ npm install jst9 --save
```

With Bower

```
  $ bower install jst9 --save
```

Or copy some of the files inside `dist` folder.
On browsers, it exports the `jsT9` global.

## Usage

To create a new jsT9 instance, you show use the constructor like this:

```
  var tree = new jsT9(words[, settings]);
```

Where:

- `words` can be:
  - An array of words, or
  - A string with the path of a JSON file with a field called 'words' containing the array of words (see the words.json example file).
- `settings` (optional)
  - `sort`: A `sort(A, B)` function that returns:  
    - -1 if `A < B`
    - 1 if `A > B`
    - 0 if `A == B`
  - `maxAmount`: Default max amount of predictions to be returned.

## API

- `predict(word)`: Return the predictions to the given word.
- `addWord(word)`: Add an new word to the tree.
