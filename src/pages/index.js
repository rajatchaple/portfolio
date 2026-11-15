import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Layout, Intro, About, Experience, Work, Contact } from '@components';

// A single calm reading column to the right of the glass sidebar
const StyledMainContainer = styled.main`
  &&.fillHeight {
    max-width: 1040px;
    min-height: 100vh;
    margin: 0 auto;
    padding: 0 clamp(20px, 5vw, 64px) 40px;

    @media (max-width: 1080px) {
      padding-top: var(--nav-height);
    }
  }

  && > section {
    max-width: none;
    margin: 0 0 clamp(72px, 10vw, 110px);
    padding: 0;
  }
`;

const IndexPage = ({ location }) => (
  <Layout location={location}>
    <StyledMainContainer className="fillHeight">
      <Intro />
      <About />
      <Experience />
      <Work />
      <Contact />
    </StyledMainContainer>
  </Layout>
);

IndexPage.propTypes = {
  location: PropTypes.object.isRequired,
};

export default IndexPage;
