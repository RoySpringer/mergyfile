interface PDFFile {
  name: string;
  path: string;
  pages: string;
}

interface ICPMergeMessage {
  status: 'success' | 'canceled' | 'failed';
  message: string;
}

export { PDFFile, ICPMergeMessage };
