'use strict'

/**
 * @fileoverview Disallow the use of disabled tests
 */

const TSLint = require('tslint');
const ts = require('typescript');

const DESCRIBE_PATTERN = /^xdescribe/;
const IT_PATTERN = /^xit/;

const walk = function walk(ctx) {
  const checkNode = function checkNode(node) {
    if (ts.isCallExpression(node)) {
      const text = node.getText();

      if (DESCRIBE_PATTERN.test(text)) {
        return ctx.addFailureAtNode(node, Rule.DISABLED_DESCRIBE);
      }

      if (IT_PATTERN.test(text)) {
        return ctx.addFailureAtNode(node, Rule.DISABLED_IT);
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

Rule.DISABLED_DESCRIBE = 'Unexpected xdescribe.';
Rule.DISABLED_IT = 'Unexpected xit.';

exports.Rule = Rule;
