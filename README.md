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
  - `sort`: A `sort(A, B)` (__Default__: Alphabetical order) function that returns:  
    - -1 if `A < B`
    - 1 if `A > B`
    - 0 if `A == B`
  - `maxAmount`: Default max amount of predictions to be returned (__Default__: `Infinity`).
  - `slackSearch`: Search words using [slack search](#how-slack-search-works) (__Default__: `true`).

## API

- `predict(word)`: Return the predictions to the given word.
- `addWord(word)`: Add an new word to the tree.

## How slack search works

If no complete word in the tree matches the searched word, the slack search will remove the last character of the word, one by one, until it finds a match.

Example:

Given this word list:
  - List
  - Look
  - Loop

If you try predict `Loo`, you'll get `["Look", "Loop"]`.

But if you try predict `Lx`, the algorithm won't find a match, so it will remove the "x" and try to predict `L`, then you'll get `["List", "Look", "Loop"]`.
