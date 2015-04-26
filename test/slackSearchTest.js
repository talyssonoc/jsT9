/*
 * jst9
 * https://github.com/talyssonoc/jst9
 *
 * Copyright (c) 2013 Talysson
 * Licensed under the MIT license.
 */

'use strict';

var chai = require('chai');
var expect = chai.expect;

var jsT9 = require('../dist/jst9');

var lorem = require('./fixtures/lorem_tree');

var tree = new jsT9(lorem);

 describe('Slack search tests', function(){
  it('Predict "L"', function() {
    expect(tree.predict('L')).to.eql(['Lorem']);
  });

  it('Predict "Lx" and find matches for "L"', function() {
    expect(tree.predict('Lx')).to.eql(['Lorem']);
  });

  it('Predict "ad"', function() {
    expect(tree.predict('ad')).to.eql(['ad', 'adipisicing']);
  });

  it('Predict "l"', function() {
    expect(tree.predict('l')).to.eql(['labore', 'laboris', 'laborum']);
  });

  it('Add new world and find it', function() {
    tree.addWord('testing jsT9');
    expect(tree.predict('testing')).to.eql(['testing jsT9']);
  });

  it('Should get an empty array if no matches are found', function() {
    expect(tree.predict('Yep, it is not there')).to.eql([]);
  });
});
