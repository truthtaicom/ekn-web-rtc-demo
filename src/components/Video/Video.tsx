import React from 'react';
import styled from 'styled-components';

export const StyledVideoContainer = styled.div<any>`
  position: relative;
  background-image: url('/FE-team.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  width: 100%;
  height: 100%;

  @media (max-width: 575.98px) {
    display: grid;
    height: 100vh;
    width: 100vw;

    video {
      &:first-child {
        grid-row: 2;
      }
    }
  }
`

const StyledVideo = styled.video<any>`
  display: block;
  position: relative;
  right: 0;
  top: 0;
  position: absolute;
  height: 100vh;
  width: 100vw;
  
  ${({ yourFriendJoined }) => yourFriendJoined && 'background: black;'}


  ${
    ({ isLocal }) => isLocal && `
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: #2f2f2f;
    border: 1px solid red;
    z-index: 99999;
    `
  }

  @media (max-width: 575.98px) {
    position: relative;
    height: 100%;
    width: 100%;
    background: #2f2f2f;
  }
`

function Video({ muted = true, elmRef, isLocal = false, yourFriendJoined = false }: any) {
  return (
    <StyledVideo width="100%" autoPlay playsInline muted={muted} ref={elmRef} isLocal={isLocal} yourFriendJoined={yourFriendJoined} />
  )
}

export default Video