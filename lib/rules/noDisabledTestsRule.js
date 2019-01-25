'use strict'

/**
 * @fileoverview Disallow the use of disabled tests
 */

const TSLint = require('tslint');
const prohibit = require('../helpers/prohibit');

const PROHIBITED = ['xdescribe', 'xit'];

class Rule extends TSLint.Rules.AbstractRule {
  apply(sourceFile) {
    return this.applyWithFunction(sourceFile, prohibit(PROHIBITED));
  }
}

exports.Rule = Rule;
