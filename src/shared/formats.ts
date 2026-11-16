export const OUTPUT_FORMATS = ['DOCX', 'XLSX', 'PPTX', 'TXT'] as const;
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

export const formatLabels: Record<OutputFormat, string> = {
  DOCX: 'Word Document',
  XLSX: 'Excel Workbook',
  PPTX: 'PowerPoint Deck',
  TXT: 'Plain Text',
};
