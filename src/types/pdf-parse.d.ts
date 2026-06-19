declare module "pdf-parse" {
  export class PDFParse {
    constructor(options: { data?: Buffer | Uint8Array; url?: string });
    getText(): Promise<{ text: string }>;
    destroy(): Promise<void>;
  }
}
