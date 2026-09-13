/** Extract readable document text locally; binary files never reach the API. */
import { MAX_DOCUMENT_CHARACTERS, MAX_FILE_BYTES } from '../../domain/types';

/** Accept only bounded UTF-8 text or text-based PDFs and report actionable errors. */
export async function readDocumentFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) throw new Error('Choose a file smaller than 2 MB.');
  const extension = file.name.split('.').pop()?.toLowerCase();
  let text: string;
  if (extension === 'pdf') {
    const { extractPdfText } = await import('./pdf-reader');
    text = await extractPdfText(await file.arrayBuffer());
  } else if (extension === 'txt' || extension === 'md') {
    text = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
    if (text.includes('\0')) throw new Error('This file does not contain readable text.');
  } else {
    throw new Error('Choose a text-based PDF, .txt, or .md file.');
  }
  if (text.trim().length < 80)
    throw new Error(
      'At least 80 characters of readable text are needed. Scanned PDFs need OCR before uploading.',
    );
  if (text.length > MAX_DOCUMENT_CHARACTERS)
    throw new Error('This document exceeds 40,000 characters. Add a shorter section instead.');
  return text.trim();
}
