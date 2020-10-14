import React from "react";
import { Button } from "antd";
import styled from "styled-components";
import {
  LogoutOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import Search from "antd/lib/input/Search";

const StyledControlBar = styled.div`
  display: grid;
  /* grid-template-columns: repeat(2,1fr); */
  grid-gap: 1rem;
  padding: 2rem;
  z-index: 99999;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 80vw;

  @media (max-width: 575.98px) {
    position: absolute;
    width: 100%;
    bottom: 0;
    padding: 10px;
    max-width: 100%;
  }
`;

const StyledWaitForJoining = styled.div`
  padding: 1rem;
  background: #ffffff66;
  border-radius: 1rem;

  @media (max-width: 575.98px) {
    top: 5rem;
    position: absolute;
    width: 100%;
    border-radius: 0;

    h1,
    h3 {
      color: white;
    }
  }
`;

const StyledJoinAndCreateRoom = styled.div`
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: 1fr 1fr;
  max-width: 50vw;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 575.98px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    max-width: 80vw;
  }
`;

const StyledCanHangUp = styled.div`
  display: grid;
  grid-template-columns: 10rem 1fr;
  grid-gap: 1rem;
`

function ControlBar({
  onOpenVideo,
  status,
  createRoom,
  joinRoom,
  onJoinRoom,
  onHangup,
  context,
}: any) {
  return (
    <StyledControlBar>
      {status.canCreateRoom && status.canJoinRoom && (
        <StyledJoinAndCreateRoom>
          <Search
            placeholder="Room ID"
            enterButton="Create"
            size="large"
            onSearch={createRoom}
            width="10rem"
          />

          <Search
            placeholder="Room ID"
            enterButton="Join"
            size="large"
            onSearch={onJoinRoom}
            width="10rem"
          />
        </StyledJoinAndCreateRoom>
      )}

      {status.canHangup &&
        <StyledCanHangUp>
        <Button
          onClick={onHangup}
          size="large"
          disabled={!status.canHangup}
          icon={<LogoutOutlined />}
          danger
          type="primary"
        >
          Leave
        </Button>
        {context.createdRoomId && !context.yourFriendJoined && (
          <StyledWaitForJoining>
            <h1>
              Your room ID is <strong>{context.createdRoomId}</strong>. <br />{" "}
              Waiting for below someone 👇 to join your room 🤪 ...
            </h1>
          </StyledWaitForJoining>
        )}
        </StyledCanHangUp>
      }

      

      {status.canOpenCamera && (
        <Button
          onClick={onOpenVideo}
          disabled={!status.canOpenCamera}
          size="large"
          icon={<VideoCameraOutlined />}
          type="primary"
        >
          Open camera & microphone
        </Button>
      )}
    </StyledControlBar>
  );
}

export default ControlBar;
