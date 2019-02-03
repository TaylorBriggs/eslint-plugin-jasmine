'use strict';

/**
 * @fileoverview Disallow promises without done.fail
 */

const TSLint = require('tslint');
const ts = require('typescript');

const TEST_PATTERN = /^(f|x|i)?it$/;

const hasIdentifier = (node, property) => (
  node.expression &&
  ts.isPropertyAccessExpression(node.expression) &&
  ts.isIdentifier(node.expression.name) &&
  node.expression.name.getText() === property
);

const hasDoneFail = (reject, asyncParam) => (
  reject &&
  ts.isPropertyAccessExpression(reject) &&
  ts.isIdentifier(reject.expression) &&
  reject.expression.getText() === asyncParam &&
  ts.isIdentifier(reject.name) &&
  reject.name.getText() === 'fail'
);

const hasDoneFailArgument = (node, asyncParam) => {
  const [ resolve, reject ] = node.arguments;

  return hasDoneFail(resolve, asyncParam) || hasDoneFail(reject, asyncParam)
};

const findDoneParam = params => params.filter(param => param.name.getText() !== 'this')[0];

const getFixer = (node) => {
  const lastToken = node.getLastToken();
  const suffix = '.catch(done.fail)';
  let replacementText;

  if (lastToken.kind === ts.SyntaxKind.SemicolonToken) {
    replacementText = `${node.getText().slice(0, -1)}${suffix};`;
  } else {
    replacementText = `${node.getText()}${suffix}`;
  }

  return new TSLint.Replacement(
    node.getStart(),
    node.getWidth(),
    replacementText
  );
};

const walk = function walk(ctx) {
  const checkStatement = function checkStatement(statement, doneParam) {
    const hasFailure = statement.getChildren().some(child => (
      hasIdentifier(child, 'then') &&
      !hasIdentifier(child.parent, 'then') &&
      !hasDoneFailArgument(child, doneParam) &&
      !hasIdentifier(child.parent, 'catch')
    ));

    if (hasFailure) {
      const fix = getFixer(statement);

      return ctx.addFailureAtNode(statement, Rule.FAILURE_STRING, fix);
    }

    return true;
  };

  const checkCallback = function checkCallback(callback) {
    const doneParam = findDoneParam(callback.parameters);

    if (!doneParam) return;

    const doneParamName = doneParam.name.getText();
    const { statements } = callback.body;
    const { length } = statements;
    let i = length - 1;

    while (i > -1) {
      if (!checkStatement(statements[i], doneParamName)) {
        return;
      }

      i -= 1;
    }
  };

  const checkNode = function checkNode(node) {
    if (ts.isCallExpression(node) && TEST_PATTERN.test(node.expression.getText())) {
      const callback = node.arguments[1];

      if (callback && callback.parameters.length) {
        return checkCallback(callback);
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

Rule.FAILURE_STRING = 'An "it" that uses an async method should handle failure (use "done.fail").';

exports.Rule = Rule;
