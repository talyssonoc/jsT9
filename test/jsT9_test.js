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

var t9 = new jsT9(lorem);

 describe('jsT9 module', function(){
  it('Predict "L"', function() {
    expect(t9.predict('L')).to.eql(['Lorem']);
  });

  it('Predict "ad"', function() {
    expect(t9.predict('ad')).to.eql(['ad', 'adipisicing']);
  });

  it('Predict "l"', function() {
    expect(t9.predict('l')).to.eql(['labore', 'laboris', 'laborum']);
  });

  it('Add new world and find it', function() {
    t9.addWord('testing jsT9');
    expect(t9.predict('testing')).to.eql(['testing jsT9']);
  });

  it('Should get an empty array if no matches are found', function() {
    expect(t9.predict('Yep, it is not there')).to.eql([]);
  });
});
