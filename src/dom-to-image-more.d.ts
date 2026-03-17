declare module 'dom-to-image-more' {
  interface Options {
    bgcolor?: string;
    width?: number;
    height?: number;
    style?: Partial<CSSStyleDeclaration>;
    filter?: (node: Node) => boolean;
    quality?: number;
    cacheBust?: boolean;
  }

  function toBlob(node: HTMLElement, options?: Options): Promise<Blob>;
  function toPng(node: HTMLElement, options?: Options): Promise<string>;
  function toJpeg(node: HTMLElement, options?: Options): Promise<string>;
  function toSvg(node: HTMLElement, options?: Options): Promise<string>;
  function toPixelData(node: HTMLElement, options?: Options): Promise<Uint8ClampedArray>;

  const domToImage: {
    toBlob: typeof toBlob;
    toPng: typeof toPng;
    toJpeg: typeof toJpeg;
    toSvg: typeof toSvg;
    toPixelData: typeof toPixelData;
  };

  export default domToImage;
}
