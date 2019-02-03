'use strict'

/**
 * @fileoverview Discourage having expect in setup and teardown functions
 */

const TSLint = require('tslint');
const ts = require('typescript');
const buildName = require('../helpers/buildName');

const DEFAULT_BLACKLIST = /^expect(Async)?$/;
const SETUP_PATTERN = /^(before|after)(All|Each)?$/;

const trimSemicolon = function trimSemicolon(expressionText) {
  const lastToken = expressionText.slice(-1);

  return lastToken === ';' ? expressionText.slice(0, -1) : expressionText;
};

const walk = function walk(ctx) {
  const { options, sourceFile } = ctx;
  const blacklist = options.length ? options : DEFAULT_BLACKLIST;
  let setupFunctionName;

  const checkSetupNode = function checkSetupNode(node) {
    const [ callback ] = node.arguments;

    if (callback && callback.body) {
      const { statements } = callback.body;
      const { length } = statements;
      let i = 0;
      let childNode;
      let functionName;
      let hasFailure;

      while (i < length) {
        childNode = statements[i];

        if (ts.isReturnStatement(childNode)) {
          childNode = childNode.expression;
        }

        if (Array.isArray(blacklist)) { // passed in via rule options
          functionName = trimSemicolon(childNode.getText());
          hasFailure = blacklist.indexOf(functionName) > -1;
        } else {
          functionName = childNode.getFirstToken().getText();
          hasFailure = blacklist.test(functionName);
          functionName = hasFailure ? `${functionName}()` : functionName;
        }

        if (hasFailure) {
          return ctx.addFailureAtNode(childNode, Rule.formatFailureMessage(functionName, setupFunctionName));
        }

        i += 1;
      }
    }

    setupFunctionName = null;
  };

  const checkNode = function checkNode(node) {
    if (ts.isCallExpression(node)) {
      const name = node.expression.getText();

      if (SETUP_PATTERN.test(name)) {
        setupFunctionName = name;
        return checkSetupNode(node);
      }
    }

    return ts.forEachChild(node, checkNode);
  };

  return ts.forEachChild(sourceFile, checkNode);
};

class Rule extends TSLint.Rules.AbstractRule {
  apply(sourceFile) {
    const options = this.getOptions();

    return this.applyWithFunction(sourceFile, walk, options.ruleArguments);
  }
}

Rule.formatFailureMessage = function formatFailureMessage(functionName, setupFunctionName) {
  return `Unexpected "${functionName}" call in "${setupFunctionName}()."`;
};

exports.Rule = Rule;
