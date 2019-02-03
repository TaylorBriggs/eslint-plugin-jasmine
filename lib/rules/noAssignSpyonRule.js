'use strict'

/**
 * @fileoverview Disallow the assignment of a spyOn call result.
 */

const TSLint = require('tslint');
const ts = require('typescript');
const findAssignmentExpression = require('../helpers/findAssignmentExpression');

const walk = function walk(ctx) {
  const checkNode = function checkNode(node) {
    if (ts.isCallExpression(node) && node.expression.getText() === 'spyOn') {
      if (findAssignmentExpression(node)) {
        return ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
      }
    }

    return ts.forEachChild(node, checkNode);
  };

  return ts.forEachChild(ctx.sourceFile, checkNode);
};

class Rule extends TSLint.Rules.AbstractRule {
  apply(sourceFile) {
    return this.applyWithFunction(sourceFile, walk);
  }
}

Rule.FAILURE_STRING = 'The result of spyOn() should not be assigned.';

exports.Rule = Rule;
