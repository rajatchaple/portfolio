import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Layout } from '@components';
import LearnEmbedded from '@components/sections/learn-embedded';

const StyledMainContainer = styled.main`
  counter-reset: section;
`;

const LearnEmbeddedPage = ({ location }) => (
  <Layout location={location}>
    <StyledMainContainer className="fillHeight">
      <LearnEmbedded />
    </StyledMainContainer>
  </Layout>
);

LearnEmbeddedPage.propTypes = {
  location: PropTypes.object.isRequired,
};

export default LearnEmbeddedPage;
