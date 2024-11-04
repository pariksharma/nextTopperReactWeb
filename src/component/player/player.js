import React, { useEffect, useRef, useState } from "react";
import { MdOutlineChevronLeft } from "react-icons/md";
import { useRouter } from "next/router";
import dynamic from 'next/dynamic';
import 'shaka-player/dist/controls.css';

const VideoJsPlayer = ({ source, dType, poster, keySystem, NonDRMVideourl, videoMetaData, title, start_date, video_type }) => {
  // console.log("NonDRMVideourl", NonDRMVideourl)
  // console.log("start_date", start_date)
  // console.log("video_type", video_type)
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSkipIcon, setShowSkipIcon] = useState(false);
  const [showSkipIconBack, setshowSkipIconBack] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [iconType, setIconType] = useState('play'); // 'play' or 'pause'
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [showIntro, setshowIntro] = useState(false);
  const [showSkipRecap, setshowSkipRecap] = useState(false);
  const [cursorStyle, setCursorStyle] = useState('');
  const [Live, setLive] = useState(false);
  const currentTimeRef = useRef(currentTime); // Ref to keep track of currentTime

  const router = useRouter()

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    currentTimeRef.current = currentTime; // Update the ref with the latest currentTime
  }, [currentTime]);

  useEffect(() => {
    const videoElement = videoRef.current;

    // Retrieve and apply the stored mute state from localStorage when the video player loads
    const storedMuteState = localStorage.getItem('isMuted');
    if (storedMuteState !== null) {
      videoElement.muted = storedMuteState === 'true';
    }

    // Save the mute state to localStorage whenever the user mutes/unmutes the video
    const handleVolumeChange = () => {
      const isMuted = videoElement.muted;
      localStorage.setItem('isMuted', isMuted ? 'true' : 'false');
    };

    if (videoElement) {
      videoElement.addEventListener("volumechange", handleVolumeChange);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("volumechange", handleVolumeChange);
      }
    };
  }, []);




  useEffect(() => {
    const updateCursorStyle = () => {
      const controlsContainer = document.querySelector('.shaka-controls-container');
      if (controlsContainer) {
        const isShown = controlsContainer.getAttribute('shown') === 'true';
        if (isShown) {
          setCursorStyle('auto');
        } else {
          setCursorStyle('none');
        }
      }
    };
    updateCursorStyle();
    const observer = new MutationObserver(updateCursorStyle);
    const targetNode = document.querySelector('.shaka-controls-container');
    if (targetNode) {
      observer.observe(targetNode, { attributes: true, attributeFilter: ['shown'] });
    }
    return () => {
      if (targetNode) {
        observer.disconnect();
      }
    };
  }, [videoRef.current]);

  const handleSkipEnd = () => {
    const video = videoRef.current;
    video.currentTime = videoMetaData?.skip_end;
    setshowIntro(false);
  };

  const handleSkipRecapEnd = () => {
    const video = videoRef.current;
    video.currentTime = videoMetaData?.recap_end;
    setshowSkipRecap(false);
  }

  useEffect(() => {
    const shaka = require('shaka-player/dist/shaka-player.ui.js');
    const handleLoaded = () => {
      setLoading(false);
      setIsPlaying(!videoRef.current?.paused);
      setDuration(videoRef.current?.duration);
    };

    const handleError = (event) => {
    };

    const initPlayer = async () => {
      const videoElement = videoRef.current;
      const videoContainer = containerRef.current;
      const player = new shaka.Player(videoElement);
      playerRef.current = player;
      const ui = new shaka.ui.Overlay(player, videoContainer, videoElement);
      const controls = ui.getControls();
      const container = controls.getServerSideAdContainer();
      const netEngine = player.getNetworkingEngine();
      const adManager = player.getAdManager();
      adManager.initMediaTailor(container, netEngine, videoElement);
      setPlayer(player);
      const config = {
        'enableTooltips': true,
        'overflowMenuButtons': ['quality', 'caption', 'language'],
        // 'controlPanelElements': ['backward', 'play_pause', 'forward', 'spacer', 'mute', 'overflow_menu', 'fullscreen']
      }
      ui.configure(config);
      videoRef.current.addEventListener("loadeddata", handleLoaded);
      videoRef.current.addEventListener("error", handleError);
      videoRef.current.addEventListener("play", () => {
        setIsPlaying(true);
        setIconType('pause');
        setShowIcon(true);
        setTimeout(() => setShowIcon(false), 1000); // Show icon for 1 second
      });
      videoRef.current.addEventListener("pause", () => {
        setIsPlaying(false);
        setIconType('play');
        setShowIcon(true);
        setTimeout(() => setShowIcon(false), 1000); // Show icon for 1 second
      });
      videoRef.current.addEventListener("timeupdate", () => setCurrentTime(videoRef.current?.currentTime));
      videoRef.current.addEventListener("click", togglePlayPause); // Play/Pause on video click
      // Configure DRM
      if (dType === 1 || dType === 3) {
        player.configure({
          drm: {
            servers: {
              [keySystem]: `https://license.videocrypt.com/validateLicense?pallyconCustomdataV2=${source?.token}`,
            },
          },
        });
        player.getNetworkingEngine().registerRequestFilter((type, request) => {
          request.headers["pallycon-customdata-v2"] = source?.token;
        });
      }
      try {
        if (NonDRMVideourl) {
          player.getNetworkingEngine().registerRequestFilter((type, request) => {
            if (type === shaka.net.NetworkingEngine.RequestType.MANIFEST ||
              type === shaka.net.NetworkingEngine.RequestType.SEGMENT) {
              request.method = 'GET';
            }
          });
          // await player.load("https://livesim.dashif.org/livesim/chunkdur_1/ato_7/testpic4_8s/Manifest.mpd");
          if (start_date) {
            player.load(`${source?.file_url}?start=${start_date}`).then(function () {
              if (player.isLive()) {
                setLive(false)
              }
              else {
                var seekBar = controls.getControlsContainer().querySelector('.shaka-seek-bar-container');
                var seekBar2 = controls.getControlsContainer().querySelector('.shaka-current-time');
                if (seekBar) {
                  // seekBar.remove();
                  seekBar2.remove();
                }
                setLive(true)
              }
            }).catch((err) => {
            })
          } else {
            player.load(NonDRMVideourl).then(function () {
              if (player.isLive()) {
                setLive(false)
              }
              else {
                var seekBar = controls.getControlsContainer().querySelector('.shaka-seek-bar-container');
                var seekBar2 = controls.getControlsContainer().querySelector('.shaka-current-time');
                if (seekBar) {
                  // seekBar.remove();
                  seekBar2.remove();
                }
                setLive(true)
              }
            }).catch((err) => {
            })
          }

          // player.load(`${source?.file_url}?start=${start_date}`).then(function() {
          // }).catch((err)=>{
          // })

        } else {
          if (start_date) {
            const mediaTailorUrl = `${source?.file_url}?start=${start_date}`;
            // const mediaTailorUrl = source?.file_url;
            await player.load(mediaTailorUrl).then(() => {
              if (player.isLive()) {
                setLive(false)
              }
              else {
                var seekBar = controls.getControlsContainer().querySelector('.shaka-seek-bar-container');
                var seekBar2 = controls.getControlsContainer().querySelector('.shaka-current-time');
                if (seekBar) {
                  // seekBar.remove();
                  seekBar2.remove();
                }
                setLive(true)
              }
            }).catch((error) => {
              console.log('Error Loading video', error)
            });
            videoRef.current.play();

          } else {
            const mediaTailorUrl = source?.file_url;
            await player.load(mediaTailorUrl).then(() => {
              if (player.isLive()) {
                setLive(false)
              }
              else {
                var seekBar = controls.getControlsContainer().querySelector('.shaka-seek-bar-container');
                var seekBar2 = controls.getControlsContainer().querySelector('.shaka-current-time');
                if (seekBar) {
                  // seekBar.remove();
                  seekBar2.remove();
                }
                setLive(true)
              }
            }).catch((error) => {
              console.log('Error Loading video', error)
            });
            videoRef.current.play();
          }
          // const mediaTailorUrl = source?.file_url;
          // const mediaTailorUrl = url;

        }
      } catch (error) {
      }

    };
    if (video_type == 8) {
      const updateCurrentTimeButtonText = () => {
        const currentTimeButton = document.querySelector('.shaka-current-time');
        if (currentTimeButton) {
          // Check if the button's current text is "Live"
          if (currentTimeButton.textContent !== 'Live') {
            currentTimeButton.textContent = 'Go Live';
            currentTimeButton.setAttribute('aria-label', 'Go Live'); // Update aria-label for accessibility
          }
        }
      };
      updateCurrentTimeButtonText();
      const observer = new MutationObserver(() => {
        const currentTimeButton = document.querySelector('.shaka-current-time');
        if (currentTimeButton && currentTimeButton.textContent !== 'Live') {
          updateCurrentTimeButtonText();
        }
      });
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    initPlayer();
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowRight') {
        if (Live) {
          skipForward();
        }
      } else if (event.key === 'ArrowLeft') {
        if (Live) {
          skipBackward();
        }
      } else if (event.key === ' ') { // Space key for play/pause
        event.preventDefault(); // Prevent scrolling the page
        togglePlayPause();
      } else if (event.key === 'ArrowUp') { // Increase volume
        setVolume(prevVolume => {
          const newVolume = Math.min(prevVolume + 0.1, 1);
          videoRef.current.volume = newVolume;
          return newVolume;
        });
      } else if (event.key === 'ArrowDown') { // Decrease volume
        setVolume(prevVolume => {
          const newVolume = Math.max(prevVolume - 0.1, 0);
          videoRef.current.volume = newVolume;
          return newVolume;
        });
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("loadeddata", handleLoaded);
        videoRef.current.removeEventListener("error", handleError);
        videoRef.current.removeEventListener("click", togglePlayPause); // Clean up event listener
      }
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [dType, keySystem, source?.token, source?.file_url]);

  const skipForward = () => {
    videoRef.current.currentTime += 10;
    setShowSkipIcon(true);
    setTimeout(() => setShowSkipIcon(false), 1000);
  };

  const skipBackward = () => {
    videoRef.current.currentTime -= 10;
    setshowSkipIconBack(true);
    setTimeout(() => setshowSkipIconBack(false), 1000);
  };

  const togglePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  return (
    <div ref={containerRef} id="videoContainer">
      <div className="__player__">
        <div className="container-fluid player_top_back_">
          <div className="row m-0">
            <div className="col-lg-11 mx-auto">
              <div className="helpHead d-flex align-items-center audio-player__top" style={{ cursor: 'pointer', zIndex: "9999" }}>
                <MdOutlineChevronLeft onClick={() => router.back()} />
                <h3 className="text-white ms-4 w-100 mb-0"> {title}</h3>
              </div>
            </div>
          </div>
        </div>
        <div ref={containerRef} className="video_bg_color">
          <video
            ref={videoRef}
            autoPlay
            muted
            controls
            poster={poster}
            style={{ width: "100%" }}
          />
        </div>
        {/* {!Live &&
          <div className="time_video-custome">
            <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
          </div>
        } */}
        {showSkipIcon && (
          <div className="skip-icon __skip_icon____">
            <p>▶▶▶</p>
            <p>10 Seconds</p>
          </div>
        )}
        {showSkipIconBack && (
          <div className="skip-icon __skip_icon_back____">
            <p>◀◀◀</p>
            <p>10 Seconds</p>
          </div>
        )}
        {showIcon && (
          <div className={`icon-overlay ${iconType === 'play' ? 'play-icon' : 'pause-icon'} show`}>
            <img src={`/assets/images/${iconType}.svg`} alt={iconType} />
          </div>
        )}
        <div className="skip_intro_main_wrap">
          {showIntro && <button type="button" className="skip_intro_main" onClick={handleSkipEnd}>Skip Intro</button>}
          {showSkipRecap && <button type="button" className="skip_intro_main" onClick={handleSkipRecapEnd}>
            Skip Recap</button>}
        </div>
        {cursorStyle == "auto" &&
          <>
            {/* {Live ?  <span className="liveIndicator">Live</span> : ""} */}
            <div className="_controls_video_">
              {Live &&
                <div className={`time_video-custome`}>
                  <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
                </div>
              }
              <div className="__video-deu__">
              </div>

              <div className="__video_icon___">
                <div className="video_icon_left shaka-tooltips-on">
                  {!isAdPlaying && Live &&
                    <div onClick={skipBackward} className="__video_icon__common__ shaka-tooltip" aria-label="Rewind 10 seconds"><img src="/assets/images/skip_02.svg" alt="Rewind 10 seconds" /></div>
                  }
                  <div onClick={togglePlayPause}
                    className={`${isAdPlaying ? "__ads__" : "__adds__"} __play_pause__ shaka-tooltips-on`}>
                    {isPlaying ? (
                      <span className="shaka-tooltip" aria-label="Pause">
                        <img src="/assets/images/pause.svg" />
                      </span>
                    ) : (
                      <span className="shaka-tooltip" aria-label="Play">
                        <img src="/assets/images/play.svg" />
                      </span>
                    )}
                  </div>
                  {!isAdPlaying && Live &&
                    <div onClick={skipForward} className="__video_icon__common__ shaka-tooltip" aria-label="Forward 10 seconds"><img src="/assets/images/skip_01.svg" alt="Forward 10 seconds" /></div>}
                </div>
              </div>
            </div>
          </>
        }

      </div>
    </div>
  );
};

export default VideoJsPlayer;
