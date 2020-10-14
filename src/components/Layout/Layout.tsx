import React from 'react';
import styled from 'styled-components';

const StyledLayoutContainer = styled.div`
  justify-content: center;
  display: grid;
  grid-template-rows: 1fr auto;
  grid-template-columns: 1fr;
  height: 100vh;
`

function Layout({ children }: any) {
  return (
  <StyledLayoutContainer>{children}</StyledLayoutContainer>
  )
}

export default Layout;