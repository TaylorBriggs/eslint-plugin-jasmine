'use strict'

/**
 * @fileoverview Disallow the use of focused tests
 */

const TSLint = require('tslint');
const prohibit = require('../helpers/prohibit');

const PROHIBITED = ['ddescribe', 'iit', 'fdescribe', 'fit'];

class Rule extends TSLint.Rules.AbstractRule {
  apply(sourceFile) {
    return this.applyWithFunction(sourceFile, prohibit(PROHIBITED));
  }
}

exports.Rule = Rule;
