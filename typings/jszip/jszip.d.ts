// Type definitions for JSZip
// Project: http://stuk.github.com/jszip/
// Definitions by: mzeiher <https://github.com/mzeiher>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

interface onUpdateMeta {
    currentFile: string;
    percent: number;
}

interface JSZip {
    files: { [name: string]: JSZipObject };
    /**
     * Get a file from the archive
     *
     * @param Path relative path to file
     * @return File matching path, null if no file found
     */
    file(path: string): JSZipObject;

    /**
     * Get files matching a RegExp from archive
     *
     * @param path RegExp to match
     * @return Return all matching files or an empty array
     */
    file(path: RegExp): JSZipObject[];

    /**
     * Add a file to the archive
     *
     * @param path Relative path to file
     * @param content Content of the file
     * @param options Optional information about the file
     * @return JSZip object
     */
    file(path: string, data: string|ArrayBuffer|Uint8Array|Blob|Promise<any>, options?: JSZipFileOptions): JSZip;

    /**
     * Return an new JSZip instance with the given folder as root
     *
     * @param name Name of the folder
     * @return New JSZip object with the given folder as root or null
     */
    folder(name: string): JSZip;

    /**
     * Returns new JSZip instances with the matching folders as root
     *
     * @param name RegExp to match
     * @return New array of JSZipFile objects which match the RegExp
     */
    folder(name: RegExp): JSZipObject[];

    /**
     * Call a callback function for each entry at this folder level.
     * @param callback the callback to use.
     */

    forEach(callback: (relativePath: string, file: JSZipObject) => void): void;

    /**
     * Get all files wchich match the given filter function
     *
     * @param predicate Filter function
     * @return Array of matched elements
     */
    filter(predicate: (relativePath: string, file: JSZipObject) => boolean): JSZipObject[];

    /**
     * Removes the file or folder from the archive
     *
     * @param path Relative path of file or folder
     * @return Returns the JSZip instance
     */
    remove(path: string): JSZip;

    /**
     * Generates a new archive
     *
     * @param options Optional options for the generator
     * @param onUpdate An optional function called on each internal update with the metadata.
     * @return A Promise of the serialized archive
     */
    generateAsync(options: JSZipGeneratorOptions, onUpdate?: (meta: onUpdateMeta)=>void): Promise<any>;

    /**
     * Generates the complete zip file as a nodejs stream.
     * @param options Optional options for the generator.
     * @param onUpdate An optional function called on each internal update with the metadata.
     * @return A nodejs Streams3 object.
     */

    generateNodeStream(options: JSZipGeneratorOptions, onUpdate?: (meta: onUpdateMeta) => void): any;

    /**
     * Generates the complete zip file as a nodejs stream.
     * @param options Optional options for the generator.
     * @param onUpdate An optional function called on each internal update with the metadata.
     * @return A StreamHelper
     */

    generateInternalStream(options: JSZipGeneratorOptions): StreamHelper;

    /**
     * Read an existing zip and merge the data in the current JSZip object at the current folder level.
     * @param data The zip file content.
     * @param options Load options
     * @return A Promise with the updated zip object.
     */

    loadAsync(data: string | Uint8Array | ArrayBuffer | Blob | Promise<string | Uint8Array | ArrayBuffer | Blob>, options?: JSZipLoadOptions): Promise<JSZip>;
}

interface StreamHelper {
    on(event: string, callback: Function): StreamHelper;
    resume(): StreamHelper;
    pause(): StreamHelper;
    accumulate(updateCallback: (meta: onUpdateMeta)=>void): Promise<string|Uint8Array|Blob|ArrayBuffer>;
}

interface JSZipObject {
    name: string;
    dir: boolean;
    date: Date;
    comment: string;
    unixPermissions: number;
    dosPermissions: number;
    options: JSZipObjectOptions;

    async(type: string, onUpdate?: (meta: onUpdateMeta)=>void): Promise<string|Uint8Array|ArrayBuffer>;
    internalStream(type: string, onUpdate?: (meta: onUpdateMeta) => void): StreamHelper;
}

interface JSZipFileOptions {
    base64?: boolean;
    binary?: boolean;
    date?: Date;
    compression?: string;
    comment?: string;
    optimizedBinaryString?: boolean;
    createFolders?: boolean;
    unixPermissions?: number|string;
    dosPermissions?: number;
    dir?: boolean;
}

interface JSZipObjectOptions {
    /** deprecated */
    base64: boolean;
    /** deprecated */
    binary: boolean;
    /** deprecated */
    dir: boolean;
    /** deprecated */
    date: Date;
    compression: string;
}

interface JSZipGeneratorOptions {
    /** DEFLATE or STORE */
    compression?: string;
    compressionOptions?: any;
    /** base64 (default), string, uint8array, blob */
    type?: string;
    comment?: string;
    mimeType?: string;
    platform?: string;
    encodeFileName?: Function;
    streamFiles?: boolean;
}

interface JSZipLoadOptions {
    base64?: boolean;
    checkCRC32?: boolean;
    optimizedBinaryString?: boolean;
    createFolders?: boolean;
    decodeFileName?: Function;
}

interface JSZipSupport {
    arraybuffer: boolean;
    uint8array: boolean;
    blob: boolean;
    nodebuffer: boolean;
}

interface DEFLATE {
    /** pako.deflateRaw, level:0-9 */
    compress(input: string, compressionOptions: {level:number}): Uint8Array;
    compress(input: number[], compressionOptions: {level:number}): Uint8Array;
    compress(input: Uint8Array, compressionOptions: {level:number}): Uint8Array;

    /** pako.inflateRaw */
    uncompress(input: string): Uint8Array;
    uncompress(input: number[]): Uint8Array;
    uncompress(input: Uint8Array): Uint8Array;
}

declare var JSZip: {
    /**
     * Create JSZip instance
     */
    (): JSZip;

    /**
     * Create JSZip instance
     */
    new (): JSZip;

    prototype: JSZip;
    support: JSZipSupport;
    compressions: {
      DEFLATE: DEFLATE;
    }
}

declare module "jszip" {
    export = JSZip;
}
