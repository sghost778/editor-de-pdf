export function shouldRunOcr(enabled, fileName) {
    if (!enabled)
        return false;
    return /scan|ocr|image|document/i.test(fileName);
}
