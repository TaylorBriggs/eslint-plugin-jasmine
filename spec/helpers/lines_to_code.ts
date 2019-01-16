/*
 * Generate readble code lines block
 * // description
 * lines[0]
 * lines[1]
 * ...
 * lines[n]
 */
export function linesToCode (lines: string[], description: string?): string {
  return (description ? '// ' + description : '') + '\n' + lines.join('\n')
}
