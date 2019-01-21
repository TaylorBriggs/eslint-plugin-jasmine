'use strict'

/**
 * @fileoverview Enforce to make at least one expectation in an it block
 * @author Remco Haszing
 */

const TSLint = require('tslint');
const ts = require('typescript');
const buildName = require('../helpers/buildName');
const isCallExpression = require('../helpers/isCallExpression');

const DEFAULT_ALLOWED = ['expect()', 'expectAsync()'];

const walk = function walk(ctx) {
  const { options } = ctx;
  const allowed = options.length ? options : DEFAULT_ALLOWED;
  const unchecked = [];
  const checkNode = function checkNode(node) {
    if (isCallExpression(node)) {
      if (node.expression.text === 'it' && node.arguments.length > 1) {
        unchecked.push(node);
      }

      if (allowed.indexOf(buildName(node)) > -1) {
        let { parent } = node;
        let index;

        while (parent) {
          index = unchecked.indexOf(parent);

          if (index > -1) {
            unchecked.splice(index, 1);
            break;
          }

          parent = parent.parent;
        }

        return;
      }

      return ts.forEachChild(node, checkNode);
    }

    return ts.forEachChild(node, checkNode);
  };

  ts.forEachChild(ctx.sourceFile, checkNode);

  return unchecked.map(node => ctx.addFailureAtNode(node, Rule.FAILURE_STRING));
};

class Rule extends TSLint.Rules.AbstractRule {
  apply(sourceFile) {
    const options = this.getOptions();

    return this.applyWithFunction(sourceFile, walk, options.ruleArguments);
  }
}

Rule.FAILURE_STRING = 'Test has no expectations.';

exports.Rule = Rule;
