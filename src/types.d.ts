declare module '@dotlottie/react-player' {
  import React from 'react';

  export interface DotLottiePlayerProps {
    src: string;
    autoplay?: boolean;
    loop?: boolean;
    style?: React.CSSProperties;
    className?: string;
  }

  export class DotLottiePlayer extends React.Component<DotLottiePlayerProps> {}
}
