import { useCallback, useState } from "react";
import firebaseApp from "../utils/firebaseConfig";
import firebase from "firebase";

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

async function openUserMedia(videoRefs: any) {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  videoRefs[0].current.srcObject = localStream;

  const remoteStream = new MediaStream();
  videoRefs[1].current.srcObject = remoteStream;

  return {
    localStream,
    remoteStream,
  };
}

async function createRoom(context: any, roomName: any, onRemoteTrack?: any) {
  let roomId: string;
  let peerConnection: any;

  const { remoteStream, localStream } = context;

  const db = firebase.firestore();
  const roomRef = db.collection("rooms").doc(roomName);

  console.log("Create PeerConnection with configuration: ", configuration);
  peerConnection = new RTCPeerConnection(configuration);

  registerPeerConnectionListeners(peerConnection);

  localStream.getTracks().forEach((track: any) => {
    peerConnection.addTrack(track, localStream);
  });

  // Code for collecting ICE candidates below
  const callerCandidatesCollection = roomRef.collection("callerCandidates");

  peerConnection.addEventListener("icecandidate", (event: any) => {
    if (!event.candidate) {
      console.log("Got final candidate!");
      return;
    }
    console.log("Got candidate: ", event.candidate);
    callerCandidatesCollection.add(event.candidate.toJSON());
  });
  // Code for collecting ICE candidates above

  // Code for creating a room below
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log("Created offer:", offer);

  const roomWithOffer = {
    offer: {
      type: offer.type,
      sdp: offer.sdp,
    },
  };
  await roomRef.set(roomWithOffer);
  roomId = roomRef.id;
  console.log(`New room created with SDP offer. Room ID: ${roomId}`);
  console.log(`Current room is ${roomId} - You are the caller!`);
  // Code for creating a room above

  peerConnection.addEventListener("track", (event: any) => {
    console.log("Got remote track:", event.streams[0]);
    event.streams[0].getTracks().forEach((track: any) => {
      console.log("Add a track to the remoteStream:", track);
      if(onRemoteTrack) {
        onRemoteTrack()
      }
      remoteStream.addTrack(track);
    });
  });

  // Listening for remote session description below
  roomRef.onSnapshot(async (snapshot) => {
    const data = snapshot.data();
    if (!peerConnection.currentRemoteDescription && data && data.answer) {
      console.log("Got remote description: ", data.answer);
      const rtcSessionDescription = new RTCSessionDescription(data.answer);
      await peerConnection.setRemoteDescription(rtcSessionDescription);
    }
  });
  // Listening for remote session description above

  // Listen for remote ICE candidates below
  roomRef.collection("calleeCandidates").onSnapshot((snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        let data = change.doc.data();
        console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
        await peerConnection.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });

  return {
    createdRoomId: roomId,
    peerConnection,
  };
}

async function joinRoomById(context: any, roomId: string) {
  const { localStream, remoteStream } = context;
  let peerConnection: any;

  const db = firebaseApp.firestore();
  const roomRef = db.collection("rooms").doc(`${roomId}`);
  const roomSnapshot: any = await roomRef.get();
  console.log("Got room:", roomSnapshot.exists);

  if (roomSnapshot && roomSnapshot.exists) {
    console.log("Create PeerConnection with configuration: ", configuration);
    peerConnection = new RTCPeerConnection(configuration);

    registerPeerConnectionListeners(peerConnection);
    console.log(localStream, "localStream");
    localStream.getTracks().forEach((track: any) => {
      peerConnection.addTrack(track, localStream);
    });

    // Code for collecting ICE candidates below
    const calleeCandidatesCollection = roomRef.collection("calleeCandidates");
    peerConnection.addEventListener("icecandidate", (event: any) => {
      if (!event.candidate) {
        console.log("Got final candidate!");
        return;
      }
      console.log("Got candidate: ", event.candidate);
      calleeCandidatesCollection.add(event.candidate.toJSON());
    });
    // Code for collecting ICE candidates above

    peerConnection.addEventListener("track", (event: any) => {
      console.log("Got remote track:", event.streams[0]);
      event.streams[0].getTracks().forEach((track: any) => {
        console.log("Add a track to the remoteStream:", track);
        remoteStream.addTrack(track);
      });
    });

    // Code for creating SDP answer below
    const offer = roomSnapshot.data().offer;
    console.log("Got offer:", offer);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    console.log("Created answer:", answer);
    await peerConnection.setLocalDescription(answer);

    const roomWithAnswer = {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    };
    await roomRef.update(roomWithAnswer);
    // Code for creating SDP answer above

    // Listening for remote ICE candidates below
    roomRef.collection("callerCandidates").onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    // Listening for remote ICE candidates above
  }

  return {
    peerConnection,
    roomId,
  };
}

function registerPeerConnectionListeners(peerConnection: any) {
  peerConnection.addEventListener("icegatheringstatechange", () => {
    console.log(
      `ICE gathering state changed: ${peerConnection.iceGatheringState}`
    );
  });

  peerConnection.addEventListener("connectionstatechange", () => {
    console.log(`Connection state change: ${peerConnection.connectionState}`);
  });

  peerConnection.addEventListener("signalingstatechange", () => {
    console.log(`Signaling state change: ${peerConnection.signalingState}`);
  });

  peerConnection.addEventListener("iceconnectionstatechange ", () => {
    console.log(
      `ICE connection state change: ${peerConnection.iceConnectionState}`
    );
  });
}

async function hangUp(context: any) {
  console.log("context", context)
  const { videoRefs, remoteStream, peerConnection, roomId } = context;
  const tracks = videoRefs[0].current.srcObject.getTracks();
  tracks.forEach((track: any) => {
    track.stop();
  });

  if (remoteStream) {
    remoteStream.getTracks().forEach((track: any) => track.stop());
  }

  if (peerConnection) {
    peerConnection.close();
  }

  videoRefs[0].current.srcObject = null;
  videoRefs[1].current.srcObject = null;

  console.log(roomId, "roomIdroomId")

  // Delete room on hangup
  if (roomId) {
    const db = firebaseApp.firestore();
    const roomRef = db.collection("rooms").doc(roomId);
    const calleeCandidates = await roomRef.collection("calleeCandidates").get();
    calleeCandidates.forEach(async (candidate) => {
      await candidate.ref.delete();
    });
    const callerCandidates = await roomRef.collection("callerCandidates").get();
    callerCandidates.forEach(async (candidate) => {
      await candidate.ref.delete();
    });
    await roomRef.delete();
  }

  document.location.reload(true);
}

export default function useWebRTC(videoRefs: any) {
  const [ context, setContext ] = useState<any>({});

  const [status, setStatus] = useState({
    canOpenCamera: true,
    canJoinRoom: false,
    canCreateRoom: false,
    canHangup: false,
  });

  console.log(context, "context")

  const onOpenMedia = useCallback(async () => {
    const result = await openUserMedia(videoRefs);
    setStatus({
      ...status,
      canOpenCamera: false,
      canJoinRoom: true,
      canCreateRoom: true,
      canHangup: false,
    });

    console.log("result", result)

    setContext({ ...context, ...result });
  }, [setContext, context, videoRefs, status]);

  const onCreateRoom = useCallback(async (roomName) => {
    setStatus({
      ...status,
      canOpenCamera: false,
      canJoinRoom: false,
      canCreateRoom: false,
      canHangup: true,
    });

    const result = await createRoom(context, roomName, () => {
      setContext({ ...context, yourFriendJoined: true })
    });
    setContext({ ...context, ...result });
    // Listen for remote ICE candidates above
  }, [status, setContext, context]);

  const onJoinRoom = useCallback(async (roomId: string) => {
    setStatus({
      ...status,
      canOpenCamera: false,
      canJoinRoom: false,
      canCreateRoom: false,
      canHangup: true,
    });

    const result = await joinRoomById(context, roomId);
    setContext({ ...context, ...result });
  }, [status, context]);

  const onHangUp = useCallback(async () => {
    setStatus({
      ...status,
      canOpenCamera: true,
      canJoinRoom: true,
      canCreateRoom: true,
      canHangup: false,
    });
    await hangUp(context)
  }, [status, context]);

  return {
    onOpenMedia,
    status,
    onCreateRoom,
    onJoinRoom,
    joinRoomById,
    onHangUp,
    context
  };
}
