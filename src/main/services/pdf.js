export function buildOutputPath(filePath, format, fileName) {
    const name = fileName ?? filePath.split(/\\|\//).pop() ?? 'converted-document';
    const baseName = name.replace(/\.[^/.]+$/, '');
    return `C:\\Users\\CampoM1\\Documents\\Converted\\${baseName}.${format.toLowerCase()}`;
}
