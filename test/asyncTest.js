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

var server = require('./fixtures/server');

var openServer = function openServer(cb) {
  server.listen(1337, cb);
};

var path = 'http://localhost:1337/';

describe('Async tests loading JSON data from server', function() {
  it('Predict "L"', function(done) {

    openServer(function() {
      var tree = new jsT9(path);

      tree.ready(function() {
        expect(tree.predict('L')).to.eql(['Lorem']);
        server.close(done);
      });
    });

  });

  it('Predict "ad"', function(done) {
    openServer(function() {
      var tree = new jsT9(path);

      tree.ready(function() {
        expect(tree.predict('ad')).to.eql(['ad', 'adipisicing']);
        server.close(done);
      });
    });
  });

  it('Predict "l"', function(done) {
    openServer(function() {
      var tree = new jsT9(path);

      tree.ready(function() {
        expect(tree.predict('l')).to.eql(['labore', 'laboris', 'laborum']);
        server.close(done);
      });
    });
  });

  it('Add new world and find it', function(done) {
    openServer(function() {
      var tree = new jsT9(path);

      tree.ready(function() {
        tree.addWord('testing jsT9');
        expect(tree.predict('testing')).to.eql(['testing jsT9']);
        server.close(done);
      });
    });
  });

  it('Should get an empty array if no matches are found', function(done) {
    openServer(function() {
      var tree = new jsT9(path);

      tree.ready(function() {
        expect(tree.predict('Yep, it is not there')).to.eql([]);
        server.close(done);
      });
    });
  });
});
