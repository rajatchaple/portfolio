import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { Icon } from '@components/icons';

const StyledSection = styled.section`
  max-width: 1000px;
  margin: 0 auto;
  padding: 100px 0;
`;

const StyledTitle = styled.h2`
  font-size: clamp(24px, 5vw, 28px);
  margin-bottom: 50px;
  text-align: center;
`;

const LearnEmbeddedSimple = () => {
  return (
    <StyledSection id="learn">
      <StyledTitle>Learn Embedded Systems</StyledTitle>
      <div>
        <p>This is a minimal working component.</p>
      </div>
    </StyledSection>
  );
};

export default LearnEmbeddedSimple;
