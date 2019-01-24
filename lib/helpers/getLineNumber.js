module.exports = function getLineNumber(node, sourceFile) {
  const position = node.getStart(sourceFile);
  const { line } = sourceFile.getLineAndCharacterOfPosition(position);

  return line;
};
