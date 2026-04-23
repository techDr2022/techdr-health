"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  selectCameraStreamByPeerID,
  selectIsConnectedToRoom,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectLocalPeer,
  selectPeers,
  useAVToggle,
  useHMSActions,
  useHMSStore,
  useVideo,
} from "@100mslive/react-sdk";
import type { HMSPeer } from "@100mslive/react-sdk";

interface UseVideoRoomProps {
  token: string;
  userName: string;
}

export function useVideoRoom({ token, userName }: UseVideoRoomProps) {
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const isCameraOn = useHMSStore(selectIsLocalVideoEnabled);
  const isMicOn = useHMSStore(selectIsLocalAudioEnabled);
  const [error, setError] = useState<string | null>(null);
  const [didJoin, setDidJoin] = useState(false);
  const { toggleAudio, toggleVideo } = useAVToggle();

  const remoteParticipant = useMemo<HMSPeer | null>(
    () => peers.find((peer) => !peer.isLocal) ?? null,
    [peers]
  );

  const localVideoTrack = useHMSStore(
    selectCameraStreamByPeerID(localPeer?.id)
  );
  const remoteVideoTrack = useHMSStore(
    selectCameraStreamByPeerID(remoteParticipant?.id)
  );
  const { videoRef: localVideoRef } = useVideo({ trackId: localVideoTrack?.id });
  const { videoRef: remoteVideoRef } = useVideo({ trackId: remoteVideoTrack?.id });

  useEffect(() => {
    if (!token || didJoin) return;
    async function joinRoom() {
      try {
        await hmsActions.join({
          userName,
          authToken: token,
          settings: {
            isAudioMuted: false,
            isVideoMuted: false,
          },
        });
        setDidJoin(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to connect to room";
        setError(message);
      }
    }

    void joinRoom();
  }, [didJoin, hmsActions, token, userName]);

  const toggleCamera = useCallback(() => {
    if (toggleVideo) toggleVideo();
  }, [toggleVideo]);
  const toggleMic = useCallback(() => {
    if (toggleAudio) toggleAudio();
  }, [toggleAudio]);

  const disconnect = useCallback(() => {
    void hmsActions.leave();
    setDidJoin(false);
  }, [hmsActions]);

  useEffect(() => {
    return () => {
      void hmsActions.leave();
    };
  }, [hmsActions]);

  return {
    localVideoRef,
    remoteVideoRef,
    remoteParticipant,
    isConnected,
    isCameraOn,
    isMicOn,
    error,
    toggleCamera,
    toggleMic,
    disconnect,
  };
}
