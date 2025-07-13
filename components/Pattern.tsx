'use client'

import React from 'react';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  .container {
    background-color: transparent;
    background-image: radial-gradient(#bdbdbd 1px, #f8fafc 1px);
    background-size: 30px 30px;
    width: 100vw;
    height: 100vh;
    opacity: 0.18;
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }
`;

const Pattern = () => {
  return (
    <StyledWrapper>
      <div className="container" />
    </StyledWrapper>
  );
}

export default Pattern; 