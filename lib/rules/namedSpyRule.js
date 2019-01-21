'use strict'

/**
 * @fileoverview Enforce to make at least one expectation in an it block
 * @author Remco Haszing
 */

const TSLint = require('tslint');
const ts = require('typescript');
const isCallExpression = require('../helpers/isCallExpression');
const isPropertyAccessExpression = require('../helpers/isPropertyAccessExpression');
const findIdentifier = require('../helpers/findIdentifier');

const walk = function walk(ctx) {
  const checkNode = (node) => {
    if (
      isPropertyAccessExpression(node) &&
      node.name.text === 'createSpy' &&
      node.expression.text === 'jasmine'
    ) {
      // parent is the CallExpression
      const { parent } = node;

      if (
        parent.arguments.length !== 1 ||
        parent.arguments[0].kind !== ts.SyntaxKind.StringLiteral
      ) {
        return ctx.addFailureAtNode(node, Rule.UNNAMED_SPY);
      }

      // identifier should be found on the parent of the CallExpression
      const identifier = findIdentifier(parent);

      if (identifier && parent.arguments[0].text !== identifier) {
        return ctx.addFailureAtNode(node, Rule.WRONG_NAME);
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

Rule.UNNAMED_SPY = 'Unnamed spy.';
Rule.WRONG_NAME = 'Variable should be named after the spy name.';

exports.Rule = Rule;
