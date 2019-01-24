'use strict'

/**
  * @fileoverview Enforce new line before expect inside a suite
*/

const TSLint = require('tslint');
const ts = require('typescript');
const getLineNumber = require('../helpers/getLineNumber');
const hasPaddingBetweenLines = require('../helpers/hasPaddingBetweenLines');
const isCallExpression = require('../helpers/isCallExpression');
const linesDelta = require('../helpers/linesDelta');

const parseSiblingStatements = (lineNumber, statements, sourceFile) => {
  let otherLineNumber;

  return statements.reduce((memo, statement) => {
    otherLineNumber = getLineNumber(statement, sourceFile);

    if (otherLineNumber < lineNumber) {
      memo.prevStatement = statement;
    }

    if (otherLineNumber === lineNumber) {
      memo.sameLineStatements.push(statement);

      if (!memo.prevStatement) {
        memo.prevStatement = statement;
      }
    }

    return memo;
  }, { prevStatement: null, sameLineStatements: [] });
};

const getPrevTokensOnLine = (start, statements, sourceFile) =>
  statements.filter(statement => statement.getEnd() <= start)
    .map(statement => statement.getFirstToken(sourceFile).getText());

const walk = function walk(ctx) {
  const { sourceFile } = ctx;
  let itBlock;
  let lastExpectNode;
  let openBracePosition;

  const checkExpect = function checkExpect(node) {
    const { statements } = itBlock;
    const start = node.getStart(sourceFile);
    const lineNumber = getLineNumber(node, sourceFile);
    const { prevStatement, sameLineStatements } = parseSiblingStatements(lineNumber, statements, sourceFile);
    const prevTokensOnLine = getPrevTokensOnLine(start, sameLineStatements, sourceFile);
    const isFirstExpect = !prevTokensOnLine.filter(token => token === 'expect').length;

    if (isFirstExpect && !hasPaddingBetweenLines(node, prevStatement, sourceFile)) {
      return ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
    }
  }

  const checkStatement = function checkStatement(node) {
    if (isCallExpression(node) && node.expression.text === 'expect') {
      if (node.pos === openBracePosition) return;

      if (lastExpectNode && linesDelta(node, lastExpectNode, sourceFile) === 1) {
        lastExpectNode = node;
        return;
      }

      lastExpectNode = node;

      return checkExpect(node);
    }

    return ts.forEachChild(node, checkStatement);
  };

  const checkItBlock = function checkItBlock(node) {
    const callback = node.arguments[1];
    const handleCallback = (fn) => {
      const { body } = fn;
      itBlock = body;
      openBracePosition = body.getFirstToken().end;

      return ts.forEachChild(body, checkStatement);
    };

    if (callback && callback.kind === ts.SyntaxKind.FunctionExpression) {
      return handleCallback(callback);
    } else if (callback) {
      return ts.forEachChild(callback, (child) => {
        if (child.kind === ts.SyntaxKind.FunctionExpression) {
          return handleCallback(child);
        }
      });
    } else {
      itBlock = null;
    }

    if (callback && callback.kind === ts.SyntaxKind.FunctionExpression) {
      const { body } = callback;
      itBlock = body;
      openBracePosition = body.getFirstToken().end;

      return ts.forEachChild(body, checkStatement);
    } else {
      itBlock = null;
    }
  };

  const checkNode = function checkNode(node) {
    if (isCallExpression(node)) {
      if (node.expression.text === 'it') {
        lastExpectNode = null;
        openBracePosition = null;

        return checkItBlock(node);
      }
    }

    return ts.forEachChild(node, checkNode);
  };

  return ts.forEachChild(sourceFile, checkNode);
};

class Rule extends TSLint.Rules.AbstractRule {
  apply(sourceFile) {
    return this.applyWithFunction(sourceFile, walk);
  }
}

Rule.FAILURE_STRING = 'No new line before expect.';

exports.Rule = Rule;
