export enum DuplicationProcessWay {
  dupDefault = 0,
  dupSkip,
  dupOverwrite,
  dupAppend,
}

export interface IMimeType {
  source: string;
  charset?: string;
  compressible?: boolean;
  extensions: string[]|string;
}

interface IMimeTypes {
  [type: string]: IMimeType;
}

type FilterFunctionType = (type: string, mime: IMimeType) => number;

export default class MimeTypes {
  dupDefault: 0;
  dupSkip: 1;
  dupOverwrite: 2;
  dupAppend: 3;

  /**
   * A map of types by extension.
   */
  types: {[extension: string]: string};
  /**
   * the default duplication process way
   */
  dup: DuplicationProcessWay;
  /**
   * A map of extensions by content-type.
   */
  readonly extensions: {[mimetype: string]: string};
  [mimetype: string]: string|number|object|IMimeType;


  constructor (db: IMimeTypes, duplicationProcessWay: DuplicationProcessWay);
  /**
   * Get the default charset for a MIME type.
   * @param type a MIME type
   */
  charset(type: string): string|boolean;
  /**
   * Create a full Content-Type header given a MIME type or extension.
   * @param str a MIME type or extension
   */
  contentType(str: string): boolean|string;
  /**
   * Get the default extension for a MIME type.
   * @param type a MIME type
   */
  extension(type: string): boolean|string;
  /**
   * Lookup the MIME types for a file path/extension.
   * @param aPath a file path/extension.
   */
  lookup(aPath: string): undefined|string|string[];
  /**
   * Return all MIME types which matching a pattern
   *    [spec](http://tools.ietf.org/html/rfc2616#section-14.1)
   * @param pattern the mime type pattern, For example "video/*", "audio/*", ..
   */
  glob(pattern: string): string[];
  /**
   * Whether the mime type is exist.
   * @param type the mime type
   */
  exist(type: string): boolean;
  /**
   * Add a custom mime/extension mapping
   * @param type mime type
   * @param mime mime object
   *  * "source": "iana",
   *  * "charset": "UTF-8",
   *  * "compressible": true,
   *  * "extensions": ["js"]
   * @param dup optional duplication process way, defaults to the this.dup.
   * @returns the added extensions
   */
  define(type: string, mime: IMimeType, dup?: DuplicationProcessWay): string[];
  /**
   * load mime-types from db.
   * @param mimes the mimes to add
   * @param duplicationProcessWay optional duplication process way, defaults to the this.dup.
   * @returns the count of added items.
   */
  load(mimes: IMimeTypes, duplicationProcessWay?: DuplicationProcessWay): number;
  /**
   * remove the specified mime-type.
   * @param type the mime type.
   * @returns return true if removed successful.
   */
  delete(type: string): boolean;
  /**
   * clear the mime-types.
   * @param filter optional glob or function to remove items. defaults to clear all.
   * @returns the removed items count.
   */
  clear(filter?: string|FilterFunctionType): number;
}

