import { useState, useRef, useEffect } from "react";
import { trackList } from "../data/tracks";

function useMusicPlayer() {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [totalDuration, setTotalDuration] = useState("0:00");
  const [seekValue, setSeekValue] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);
  const [isAlbumOverflowing, setIsAlbumOverflowing] = useState(false);

  const audioRef = useRef(null);
  const seekSliderRef = useRef(null);
  const trackTitleRef = useRef(null);
  const trackAlbumRef = useRef(null);

  const currentTrack = trackList[trackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.3;
    }
  }, []);

  useEffect(() => {
    const checkOverflow = () => {
      if (trackTitleRef.current) {
        const isTitleOverflow =
          trackTitleRef.current.scrollWidth > trackTitleRef.current.clientWidth;
        setIsTitleOverflowing(isTitleOverflow);
      }
      if (trackAlbumRef.current) {
        const isAlbumOverflow =
          trackAlbumRef.current.scrollWidth > trackAlbumRef.current.clientWidth;
        setIsAlbumOverflowing(isAlbumOverflow);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [trackIndex]);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateSeek = () => {
      if (!isNaN(audio.duration)) {
        const seekPosition = (audio.currentTime / audio.duration) * 100;
        const progressPercent = seekPosition;

        setSeekValue(seekPosition);
        setProgress(progressPercent);
        setCurrentTime(formatTime(audio.currentTime));
        setTotalDuration(formatTime(audio.duration));
      }
    };

    const interval = setInterval(updateSeek, 1000);
    return () => clearInterval(interval);
  }, [trackIndex, isPlaying]);

  const nextTrack = () => {
    const newIndex = trackIndex < trackList.length - 1 ? trackIndex + 1 : 0;
    setTrackIndex(newIndex);
    setIsPlaying(true);

    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleNextTrack = () => {
      const newIndex = trackIndex < trackList.length - 1 ? trackIndex + 1 : 0;
      setTrackIndex(newIndex);
      setIsPlaying(true);

      setTimeout(() => {
        audioRef.current?.play();
      }, 100);
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [trackIndex]);

  const playPauseTrack = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const prevTrack = () => {
    const newIndex = trackIndex > 0 ? trackIndex - 1 : trackList.length - 1;
    setTrackIndex(newIndex);
    setIsPlaying(true);

    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  };

  const seekTo = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const value = e.target.value;
    const seekPosition = audio.duration * (value / 100);

    audio.currentTime = seekPosition;
    setSeekValue(value);
    setProgress(value);
  };

  return {
    currentTrack,
    isPlaying,
    isTitleOverflowing,
    isAlbumOverflowing,
    trackTitleRef,
    trackAlbumRef,
    currentTime,
    totalDuration,
    seekValue,
    progress,
    seekSliderRef,
    audioRef,
    playPauseTrack,
    prevTrack,
    nextTrack,
    seekTo,
  };
}

export default useMusicPlayer;
