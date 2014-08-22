/*
 * jst9
 * https://github.com/talyssonoc/jst9
 *
 * Copyright (c) 2013 Talysson
 * Licensed under the MIT license.
 */

'use strict';

var chai = require('chai');
chai.expect();
chai.should();
var expect = chai.expect;

var jsT9 = require('../lib/jst9.js');
var t9 = new jsT9([
    "Lorem",
    "ipsum",
    "dolor",
    "sit",
    "amet,",
    "consectetur",
    "adipisicing",
    "elit,",
    "sed",
    "do",
    "eiusmod",
    "tempor",
    "incididunt",
    "ut",
    "labore",
    "et",
    "dolore",
    "magna",
    "aliqua.",
    "Ut",
    "enim",
    "ad",
    "minim",
    "veniam,",
    "quis",
    "nostrud",
    "exercitation",
    "ullamco",
    "laboris",
    "nisi",
    "ut",
    "aliquip",
    "ex",
    "ea",
    "commodo",
    "consequat.",
    "Duis",
    "aute",
    "irure",
    "dolor",
    "in",
    "reprehenderit",
    "in",
    "voluptate",
    "velit",
    "esse",
    "cillum",
    "dolore",
    "eu",
    "fugiat",
    "nulla",
    "pariatur.",
    "Excepteur",
    "sint",
    "occaecat",
    "cupidatat",
    "non",
    "proident,",
    "sunt",
    "in",
    "culpa",
    "qui",
    "officia",
    "deserunt",
    "mollit",
    "anim",
    "id",
    "est",
    "laborum"
  ]);

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
