const util = require('util');

const { ipcRenderer } = require("electron");
const detect = require('detect-file-type');

const detectFromBuffer = util.promisify(detect.fromBuffer);


const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve((reader.result || '').toString());
    reader.onerror = error => reject(error);
  });

/**
 * Represents an imported source image
 */
class SourceImage {
    content?: Buffer
    path?: string
    fileType?: string

    /**
     * For internal use. Please use static methods "from..."" to create an instance
     */
    constructor(content?: Buffer, fileType?: string, path?: string) {
        this.content = content;
        this.path = path;
        this.fileType = fileType;
    }

    async fromOwnPath() {
        this.content = Buffer.from(await ipcRenderer.invoke("loadImageAsBuffer", this.path));
        this.finalizeCreation();
    }

    static async fromBuffer(b: Buffer) {
        const image = new SourceImage(b, "");
        image.finalizeCreation();
        return image;
    }

    static async fromBlob(b: Blob) {
        const content = await b.arrayBuffer();
        const image = new SourceImage(Buffer.from(content), "");
        await image.finalizeCreation();
        return image;
    }

    async finalizeCreation() {
        const fileType = await detectFromBuffer(this.content);
        this.fileType = fileType.mime;
    }

    isPathUrlLike(): boolean {
        return 'string' === typeof (this.path) && !!this.path.length && (-1 < this.path.indexOf('/') || -1 < this.path.indexOf('\\'));
    }

    clearContent() {
        this.content = undefined;
        this.fileType = undefined;
    }

    toDataUrl(): string {
        return `data: ${this.fileType};base64, ${this.content?.toString('base64')}`;
    }
}

export default SourceImage;