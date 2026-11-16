export function shouldRunOcr(enabled: boolean, fileName: string) {
  if (!enabled) return false;
  return /scan|ocr|image|document/i.test(fileName);
}
