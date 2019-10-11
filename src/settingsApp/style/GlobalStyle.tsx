import { css, Global } from '@emotion/core';
import React from 'react';
import normalize from './normalize';
// import scrollBar from './scrollBar';
import { fontPrimary, colorSecondary } from './theme';
import { fillContainer } from './modifiers';
import { rgba } from '@lucasols/utils';
import scrollBar from 'settingsApp/style/scrollBar';

const reset = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html {
    font-family: ${fontPrimary};
    color: #fff;
  }

  a {
    color: inherit;
    text-decoration: inherit;
    cursor: pointer;

    &:visited {
      color: inherit;
    }
  }

  button {
    background: transparent;
    border: 0;
    outline: none;
    cursor: pointer;
  }
`;

const GlobalStyle = () => <Global styles={[normalize, reset, scrollBar]} />;

export default GlobalStyle;
