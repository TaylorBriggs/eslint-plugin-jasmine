'use strict';

/**
 * @fileoverview Enforce spies to be declared in before/after/it blocks
 */

const TSLint = require('tslint');
const ts = require('typescript');
const findParentFromNode = require('../helpers/findParentFromNode');

const WHITELIST = /^(((before|after)(All|Each)?)|((f|i|x)?it))$/;

const hasWhitelistedParent = function hasWhitelistedParent(node) {
  const whitelistedParent = findParentFromNode(node, parent => (
    ts.isCallExpression(parent) &&
    WHITELIST.test(parent.expression.text)
  ));

  return !!whitelistedParent;
}

const isSpy = node => (
  node.expression.text === 'spyOn' ||
  (
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.expression.text === 'jasmine' &&
    (
      node.expression.name.text === 'createSpy' ||
      node.expression.name.text === 'createSpyObj'
    )
  )
);

const walk = function walk(ctx) {
  const checkNode = function checkNode(node) {
    if (
      ts.isCallExpression(node) &&
      isSpy(node) &&
      !hasWhitelistedParent(node)
    ) {
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

Rule.FAILURE_STRING = 'Spy declared outside of before/after/it block.';

exports.Rule = Rule;
