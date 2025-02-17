/**
 * Wraps a folder path with double quotes.
 *
 * This function is useful when constructing command-line arguments that require folder paths.
 * It ensures that the folder path is properly formatted for use in shell commands.
 *
 * @param folderPath - The path of the folder to be wrapped.
 * @returns The input folder path wrapped with double quotes.
 *
 * @example
 * ```typescript
 * const folderPath = 'C:\\Users\\nijat\\Documents\\tests folder\\folder';
 * const wrappedFolderPath = wrapFolderWithQuotes(folderPath);
 * console.log(wrappedFolderPath); // Output: "C:\\Users\\nijat\\Documents\\tests folder\\folder"
 * ```
 */
export function wrapFolderWithQuotes(folderPath: string): string {
  return `"${folderPath}"`;
}
