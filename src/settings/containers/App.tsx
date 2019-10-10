import styled from '@emotion/styled';
import React, { useEffect } from 'react';
import { fillContainer, centerContent } from 'src/react/style/modifiers';
import { colorBg, fontPrimary } from 'src/react/style/theme';
import Home from 'containers/Home';
import EditTab from 'containers/EditTab';
import { ContentWrapper } from 'components/ContentWrapper';
import DeleteTabModal from 'containers/DeleteTabModal';
import EditFilter from 'containers/EditFilter';
import DeleteFilterModal from 'containers/DeleteFilterModal';

const AppContainer = styled.div`
  ${fillContainer};
  ${centerContent};
  align-items: flex-start;

  background: ${colorBg};
  overflow: hidden;
`;

const App = () => {
  useEffect(() => {
    // fetchCities();
  }, []);

  return (
    <AppContainer>
      <Home />
      <EditTab />
      <EditFilter />
      <DeleteTabModal />
      <DeleteFilterModal />
    </AppContainer>
  );
};

export default App;
