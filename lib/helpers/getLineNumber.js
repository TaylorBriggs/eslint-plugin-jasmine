/**
 * Gets line number from a node's position
 * @param {number} position Start or end of a node
 * @param {SourceFile} sourceFile Source file
 * @returns {number} Line number of the position
 */
module.exports = function getLineNumber(position, sourceFile) {
  const { line } = sourceFile.getLineAndCharacterOfPosition(position);

  return line;
};
