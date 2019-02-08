'use strict'

/**
 * @fileoverview Enforce that a suites's callback does not contain any arguments
 */

const TSLint = require('tslint');
const ts = require('typescript');

const SUITE_PATTERN = /^(f|d|x)?describe$/;

const hasNonThisParams = params => (
  params.length &&
  (params.length === 1 && params[0].name.text !== 'this') ||
  (params.length > 1 && params[0].name.text === 'this')
);

const isCallback = callback => (
  callback &&
  (ts.isFunctionExpression(callback) || ts.isArrowFunction(callback))
);

const walk = function walk(ctx) {
  const checkNode = function checkNode(node) {
    if (
      ts.isCallExpression(node) &&
      SUITE_PATTERN.test(node.expression.text)
    ) {
      const callback = node.arguments && node.arguments[1];

      if (isCallback(callback) && hasNonThisParams(callback.parameters)) {
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

Rule.FAILURE_STRING = "Unexpected argument in suite's callback.";

exports.Rule = Rule;
