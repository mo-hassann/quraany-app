"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Pause, Play, Redo, Repeat, Undo, Volume1, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Spinner from "./spinner";

export default function AudioPlayer({ src, onClose }: { onClose: () => void; src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAudioBar, setShowAudioBar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log("states -------------");
  console.log("currentTime", currentTime);
  console.log("duration", duration);
  console.log("isPlaying", isPlaying);
  console.log("volume", volume);
  console.log("isRepeat", isRepeat);
  console.log("isDragging", isDragging);
  console.log("showAudioBar", showAudioBar);
  console.log("******************************");

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && progressBarRef.current && audioRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const moveX = e.clientX - rect.left;

        let newTime = (moveX / rect.width) * duration;

        if (newTime < 0) newTime = 0;
        if (newTime > duration) newTime = duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [duration, isDragging]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleRepeat = () => {
    setIsRepeat((curState) => !curState);
    if (audioRef.current) {
      audioRef.current.loop = !isRepeat;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  useEffect(() => {
    if (audioRef.current) {
      setCurrentTime(0);
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  }, [src]);

  useEffect(() => {
    if (audioRef.current && !isLoading) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isLoading]);

  //   useEffect(() => {
  //     if (currentTime === duration) {
  //       setCurrentTime(0);
  //       setIsPlaying(false);
  //     }
  //   }, [currentTime, duration]);

  return (
    <div className="max-w-screen-lg w-9/12 bg-background shadow-md fixed bottom-2 left-1/2 -translate-x-1/2 py-3.5 px-5 mx-3 rounded-md">
      <Button onClick={onClose} className="absolute top-0.5 right-3 p-0 size-6" size="icon" variant="ghost">
        <X size={16} />
      </Button>

      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} />

      <div className="w-full space-y-2 mt-4">
        <div className="relative w-full h-1.5 bg-muted-foreground/15 rounded-full" ref={progressBarRef} onClick={handleProgressClick}>
          <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
          <div className="absolute top-1/2 -translate-y-1/2 left-[calc(100% - 8px)] size-4 bg-primary rounded-full cursor-pointer" style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }} onMouseDown={handleMouseDown}></div>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground/70">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative">
          <Button onClick={() => setShowAudioBar((curState) => !curState)} className="rounded-full" variant="ghost" size="icon">
            {(volume === 0 && <VolumeX size={16} />) || (volume < 0.6 && <Volume1 size={16} />) || <Volume2 size={16} />}
          </Button>
          {showAudioBar && (
            <div onBlur={() => setShowAudioBar(false)} className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-md bg-background shadow-md p-2 w-80">
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className={"w-full"} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button className="rounded-full" variant="ghost" size="icon">
            <Undo size={18} />
          </Button>
          <Button disabled={isLoading} className={cn("rounded-full size-12", !isPlaying && "bg-primary text-white hover:bg-primary/80 hover:text-white")} variant="ghost" size="icon" onClick={() => setIsPlaying((curState) => !curState)}>
            {isLoading ? <Spinner /> : isPlaying ? <Pause /> : <Play />}
          </Button>
          <Button className="rounded-full" variant="ghost" size="icon">
            <Redo size={18} />
          </Button>
        </div>

        <Button className={cn("rounded-full", isRepeat && "bg-primary text-white hover:bg-primary hover:text-white")} variant="ghost" size="icon" onClick={toggleRepeat}>
          <Repeat size={16} />
        </Button>
      </div>
    </div>
  );
}
