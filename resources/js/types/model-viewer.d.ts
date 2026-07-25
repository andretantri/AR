declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      src?: string;
      alt?: string;
      ar?: boolean | string;
      'ar-modes'?: string;
      'camera-controls'?: boolean | string;
      'auto-rotate'?: boolean | string;
      'shadow-intensity'?: string;
      poster?: string;
      style?: React.CSSProperties;
    }, HTMLElement>;
  }
}
