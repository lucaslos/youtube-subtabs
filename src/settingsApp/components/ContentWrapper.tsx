import styled from '@emotion/styled';
import { centerContentCollum } from 'settingsApp/style/modifiers';

export const ContentWrapper = styled.div`
  width: calc(100% - 16px * 2);
  max-width: 400px;
  z-index: 0;

  ${centerContentCollum};
`;
