/**
 * `archiver-zip-encrypted` non pubblica i propri tipi. Non serve
 * descriverlo nel dettaglio: lo usiamo solo come "format module" da
 * passare ad `archiver.registerFormat`, che lo tratta come un costruttore
 * opaco.
 */
declare module "archiver-zip-encrypted" {
  const format: new (...args: never[]) => unknown;
  export default format;
}
