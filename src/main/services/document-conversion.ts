import ExcelJS from 'exceljs';
import { AlignmentType, Document, HeadingLevel, ImageRun, PageBreak, Packer, Paragraph, TextRun } from 'docx';
import pptxgen from 'pptxgenjs';

import { DocumentFileInput } from '../../shared/validation';

function getLines(content: string) {
  return content.replace(/\r\n/g, '\n').split('\n');
}

function getPages(content: string) {
  return content.split('\f');
}

export async function createDocumentFile(input: DocumentFileInput): Promise<Buffer> {
  if (input.format === 'TXT') {
    return Buffer.from(`${input.title}\n\n${input.content}`, 'utf8');
  }

  if (input.format === 'DOCX') {
    const children: Paragraph[] = [];
    const pageImages = input.pageImages ?? [];
    if (pageImages.length === 0) {
      children.push(new Paragraph({ text: input.title, heading: HeadingLevel.TITLE }));
    }
    pageImages.forEach((image, imageIndex) => {
      const imageData = Buffer.from(image.data.slice('data:image/jpeg;base64,'.length), 'base64');
      const scale = Math.min(746 / image.width, 1074 / image.height);
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({
          type: 'jpg',
          data: imageData,
          transformation: {
            width: Math.round(image.width * scale),
            height: Math.round(image.height * scale),
          },
          altText: { title: `Página original ${imageIndex + 1}`, description: 'Imagen fiel de la página del PDF original' },
        })],
      }));
      children.push(new Paragraph({ children: [new PageBreak()] }));
    });
    if (pageImages.length > 0) {
      children.push(new Paragraph({ text: input.title, heading: HeadingLevel.TITLE }));
      children.push(new Paragraph({ text: 'Texto editable (OCR)', heading: HeadingLevel.HEADING_1 }));
    }
    getPages(input.content).forEach((page, pageIndex) => {
      if (pageIndex > 0) children.push(new Paragraph({ children: [new PageBreak()] }));
      children.push(...getLines(page).map((line) => new Paragraph({ children: [new TextRun(line)] })));
    });
    const document = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 360, right: 360, bottom: 360, left: 360 },
          },
        },
        children,
      }],
    });
    return Packer.toBuffer(document);
  }

  if (input.format === 'XLSX') {
    const workbook = new ExcelJS.Workbook();
    const pageImages = input.pageImages ?? [];
    getPages(input.content).forEach((page, pageIndex) => {
      const sheet = workbook.addWorksheet(`Página ${pageIndex + 1}`);
      sheet.columns = [
        { header: 'Texto editable', key: 'text', width: 80 },
        { header: '', key: 'separator', width: 3 },
        { header: 'Página original', key: 'original', width: 24 },
      ];
      sheet.addRow({ text: input.title });
      for (const line of getLines(page)) sheet.addRow({ text: line });
      const image = pageImages[pageIndex];
      if (image) {
        const imageId = workbook.addImage({
          base64: image.data.slice('data:image/jpeg;base64,'.length),
          extension: 'jpeg',
        });
        const scale = Math.min(520 / image.width, 700 / image.height);
        sheet.addImage(imageId, {
          tl: { col: 2, row: 1 },
          ext: { width: Math.round(image.width * scale), height: Math.round(image.height * scale) },
        });
      }
    });
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  const presentation = new pptxgen();
  presentation.layout = 'LAYOUT_WIDE';
  const pageImages = input.pageImages ?? [];
  getPages(input.content).forEach((page, index) => {
    const image = pageImages[index];
    if (image) {
      const originalSlide = presentation.addSlide();
      originalSlide.addText(`Página original ${index + 1}`, {
        x: 0.6,
        y: 0.35,
        w: 12.1,
        h: 0.45,
        fontFace: 'Aptos Display',
        fontSize: 18,
        color: '132238',
      });
      const scale = Math.min(12.1 / image.width, 5.9 / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      originalSlide.addImage({
        data: image.data,
        x: (13.333 - width) / 2,
        y: 1.05 + (5.9 - height) / 2,
        w: width,
        h: height,
      });
    }

    const slide = presentation.addSlide();
    slide.addText(index === 0 ? input.title : `${input.title} (${index + 1})`, {
      x: 0.6,
      y: 0.45,
      w: 12.1,
      h: 0.6,
      fontFace: 'Aptos Display',
      fontSize: 24,
      bold: true,
      color: '132238',
      breakLine: false,
    });
    slide.addText(page, {
      x: 0.7,
      y: 1.3,
      w: 11.9,
      h: 5.7,
      fontFace: 'Aptos',
      fontSize: 15,
      color: '26384D',
      breakLine: false,
      valign: 'top',
      fit: 'shrink',
      margin: 0.1,
    });
  });

  return Buffer.from(await presentation.write({ outputType: 'nodebuffer' }) as Buffer);
}
