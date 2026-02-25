import { useState, useRef, useEffect } from "react";
import { trackList } from "../data/tracks";
import "../styles/MusicPlayer.css";

function MusicPlayer() {
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
        const isTitleOverflow = trackTitleRef.current.scrollWidth > trackTitleRef.current.clientWidth;
        setIsTitleOverflowing(isTitleOverflow);
      }
      if (trackAlbumRef.current) {
        const isAlbumOverflow = trackAlbumRef.current.scrollWidth > trackAlbumRef.current.clientWidth;
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

  return (
    <div id="musicplayer">
      <div className="track-info">
        <img src={currentTrack.cover} alt="cover" className="track-cover" />
        <div className="track-meta">
          <div className={`track-title ${isTitleOverflowing ? "is-overflowing" : ""}`} ref={trackTitleRef}>{currentTrack.name}</div>
          <div className={`track-album ${isAlbumOverflowing ? "is-overflowing" : ""}`} ref={trackAlbumRef}>
            {currentTrack.artist} • {currentTrack.album}
          </div>
        </div>
      </div>

      <table className="controls">
        <tbody>
          <tr>
            <td>
              <div className="prev-track" onClick={prevTrack}>
                <i className="fas fa-backward">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
                  </svg>
                </i>
              </div>
            </td>
            <td>
              <div className="playpause-track" onClick={playPauseTrack}>
                <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`}>
                  {isPlaying ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      class="size-6"
                    >
                      {" "}
                      <path
                        fill-rule="evenodd"
                        d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      {" "}
                      <path
                        fillRule="evenodd"
                        d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </i>
              </div>
            </td>
            <td>
              <div className="next-track" onClick={nextTrack}>
                <i className="fas fa-forward">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
                  </svg>
                </i>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="seeking">
        <input
          type="range"
          min="0"
          max="100"
          value={seekValue}
          className="seek_slider"
          onChange={seekTo}
          ref={seekSliderRef}
          style={{ "--progress": `${progress}%` }}
        />

        <div className="seeking-time">
          <div className="current-time">{currentTime}</div>
          <div className="total-duration">{totalDuration}</div>
        </div>
      </div>

      <audio ref={audioRef} src={currentTrack.link} />
    </div>
  );
}

export default MusicPlayer;
