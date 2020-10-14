import React, { useRef } from 'react';
import styled from 'styled-components';
import './App.css';
import { ControlBar } from './components/ControlBar';
import { Layout } from './components/Layout';
import { Video } from './components/Video';
import useWebRTC from './hooks/useWebRTC';
import { StyledVideoContainer } from './components/Video/Video';

const StyledBodyApp = styled.div``

function App() {
  const video1Ref = useRef<any>(null)
  const video2Ref = useRef<any>(null)
  const { onCreateRoom, onJoinRoom, onOpenMedia, context, status, onHangUp } = useWebRTC([video1Ref, video2Ref])
  
  return (
    <Layout>
      <StyledBodyApp>
        <StyledVideoContainer>
          <Video elmRef={video1Ref} isLocal/>
          <Video elmRef={video2Ref} yourFriendJoined={context.yourFriendJoined}/>
        </StyledVideoContainer>
      </StyledBodyApp>

      <ControlBar
        context={context}
        onOpenVideo={onOpenMedia}
        status={status}
        createRoom={onCreateRoom}
        onJoinRoom={onJoinRoom}
        onHangup={onHangUp}
      />
    </Layout>
  );
}

export default App;
