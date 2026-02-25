import useMusicPlayer from "../utils/useMusicPlayer";
import "../styles/MusicPlayer.css";

function MusicPlayer() {
  const {
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
    playPauseTrack,
    prevTrack,
    nextTrack,
    seekTo,
    audioRef,
  } = useMusicPlayer();

  return (
    <div id="musicplayer">
      <div className="track-info">
        <img src={currentTrack.cover} alt="cover" className="track-cover" />
        <div className="track-meta">
          <div
            className={`track-title ${
              isTitleOverflowing ? "is-overflowing" : ""
            }`}
            ref={trackTitleRef}
          >
            {currentTrack.name}
          </div>
          <div
            className={`track-album ${
              isAlbumOverflowing ? "is-overflowing" : ""
            }`}
            ref={trackAlbumRef}
          >
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
