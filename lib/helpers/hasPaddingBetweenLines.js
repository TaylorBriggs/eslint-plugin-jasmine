const getLineNumber = require('./getLineNumber');

/**
 * @param {Node} first First node
 * @param {Node} second Second node
 * @param {SourceFile} sourceFile Source file
 * @returns {boolean} True if there is more than one line between the end of the first node and the start of the second node
 */
module.exports = function hasPaddingBetweenLines(first, second, sourceFile) {
  const firstEndLine = getLineNumber(first.getEnd(), sourceFile);
  const secondStartLine = getLineNumber(second.getStart(sourceFile), sourceFile);

  return secondStartLine - firstEndLine > 1;
};
