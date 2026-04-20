"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  LocalAudioTrack,
  LocalVideoTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
} from "twilio-video";
import { connect, createLocalVideoTrack } from "twilio-video";

interface UseVideoRoomProps {
  token: string;
  roomName: string;
}

export function useVideoRoom({ token, roomName }: UseVideoRoomProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [localTrack, setLocalTrack] = useState<LocalVideoTrack | null>(null);
  const [remoteParticipant, setRemoteParticipant] = useState<RemoteParticipant | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null);
  const localTrackRef = useRef<LocalVideoTrack | null>(null);

  const attachRemoteTrack = useCallback((track: RemoteTrack) => {
    if (track.kind !== "video" || !remoteVideoRef.current) return;
    remoteVideoRef.current.innerHTML = "";
    const element = track.attach();
    element.style.width = "100%";
    element.style.height = "100%";
    element.style.objectFit = "cover";
    remoteVideoRef.current.appendChild(element);
  }, []);

  const handleParticipant = useCallback(
    (participant: RemoteParticipant) => {
      setRemoteParticipant(participant);

      participant.tracks.forEach((publication: RemoteTrackPublication) => {
        if (publication.isSubscribed && publication.track) {
          attachRemoteTrack(publication.track);
        }
      });

      participant.on("trackSubscribed", attachRemoteTrack);
      participant.on("trackUnsubscribed", (track: RemoteTrack) => {
        if (track.kind === "video") {
          track.detach().forEach((el) => el.remove());
        }
      });
    },
    [attachRemoteTrack]
  );

  const connectToRoom = useCallback(async () => {
    if (!token || !roomName) return;
    if (roomRef.current) return;
    try {
      const videoTrack = await createLocalVideoTrack({
        width: 1280,
        height: 720,
        frameRate: 24,
      });

      setLocalTrack(videoTrack);
      localTrackRef.current = videoTrack;

      if (localVideoRef.current) {
        const element = videoTrack.attach();
        element.style.width = "100%";
        element.style.height = "100%";
        element.style.objectFit = "cover";
        localVideoRef.current.innerHTML = "";
        localVideoRef.current.appendChild(element);
      }

      const connectedRoom = await connect(token, {
        name: roomName,
        tracks: [videoTrack],
        audio: true,
        dominantSpeaker: true,
      });

      setRoom(connectedRoom);
      roomRef.current = connectedRoom;
      setIsConnected(true);

      connectedRoom.participants.forEach(handleParticipant);
      connectedRoom.on("participantConnected", handleParticipant);
      connectedRoom.on("participantDisconnected", () => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.innerHTML = "";
        }
        setRemoteParticipant(null);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect to room";
      setError(message);
    }
  }, [handleParticipant, roomName, token]);

  const toggleCamera = useCallback(() => {
    if (!localTrack) return;
    if (isCameraOn) {
      localTrack.disable();
    } else {
      localTrack.enable();
    }
    setIsCameraOn((prev) => !prev);
  }, [isCameraOn, localTrack]);

  const toggleMic = useCallback(() => {
    if (!room) return;
    room.localParticipant.audioTracks.forEach((publication) => {
      const audioTrack = publication.track as LocalAudioTrack | null;
      if (!audioTrack) return;
      if (isMicOn) {
        audioTrack.disable();
      } else {
        audioTrack.enable();
      }
    });
    setIsMicOn((prev) => !prev);
  }, [isMicOn, room]);

  const disconnect = useCallback(() => {
    roomRef.current?.disconnect();
    localTrackRef.current?.stop();
    roomRef.current = null;
    localTrackRef.current = null;
    setRoom(null);
    setLocalTrack(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    void connectToRoom();
    return () => {
      roomRef.current?.disconnect();
      localTrackRef.current?.stop();
      roomRef.current = null;
      localTrackRef.current = null;
    };
  }, [connectToRoom]);

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
