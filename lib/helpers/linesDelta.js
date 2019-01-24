const getLineNumber = require('./getLineNumber');

/**
 * Gets the delta between the starting positions of two nodes
 * @param {Node} node1 Starting node
 * @param {Node} node2 Ending node
 * @param {SourceFile} sourceFile Source file
 * @returns {number} Positive integer indicating number of lines between nodes
 */
module.exports = function linesDelta(node1, node2, sourceFile) {
  const firstLine = getLineNumber(node1.getStart(sourceFile), sourceFile);
  const secondLine = getLineNumber(node2.getStart(sourceFile), sourceFile);

  return Math.abs(firstLine - secondLine);
};
