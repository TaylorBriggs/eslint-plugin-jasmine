'use strict';

/**
 * @fileoverview Prefer toHaveBeenCalledWith insteaf of toHaveBeenCalled
 */

const TSLint = require('tslint');
const ts = require('typescript');

const isNegated = node => (
  ts.isPropertyAccessExpression(node) &&
  ts.isPropertyAccessExpression(node.expression) &&
  node.expression.name.text === 'not'
);

const walk = function walk(ctx) {
  const checkNode = function checkNode(node) {
    if (ts.isIdentifier(node) && node.text === 'toHaveBeenCalled') {
      const { parent } = node;

      if (isNegated(parent)) return;

      return ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
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

Rule.FAILURE_STRING = 'Prefer `toHaveBeenCalledWith.`';

exports.Rule = Rule;
