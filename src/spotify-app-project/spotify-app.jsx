


import axios from "axios";
import { useEffect, useRef, useState } from "react";
import ColorThief from "colorthief"; // Import color-thief library
import "./spotify.css";
import Logo from "../assets/Logo.png";

const SpotifyApp = () => {
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null); // State for selected song
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const audioRef = useRef(null); // Reference to the audio element
  const [progress, setProgress] = useState(0); // State for the progress of the seek bar
  const [isPlaying, setIsPlaying] = useState(false); // State to track if the audio is playing
  const [activeTab, setActiveTab] = useState("For You"); // State to manage active tab
  const [backgroundGradient, setBackgroundGradient] = useState(""); // State to manage background gradient
  const [durations, setDurations] = useState({}); // State to store durations

  useEffect(() => {
    fetchingData();
    // Load selected song from local storage on mount
    const savedSong = JSON.parse(localStorage.getItem("selectedSong"));
    if (savedSong) {
      setSelectedSong(savedSong);
      changeBackgroundGradient(savedSong.cover); // Set background gradient based on saved song
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      // Update progress state while the song is playing
      audioRef.current.addEventListener("timeupdate", () => {
        const currentProgress =
          (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(currentProgress);
      });

      // Play the selected song automatically and set playing state to true
      if (selectedSong) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [selectedSong]);

  const fetchingData = async () => {
    try {
      const response = await axios.get("https://cms.samespace.com/items/songs");

      if (response.status === 200) {
        setMusic(response.data.data);
        console.log(response);

        // Calculate durations for each song
        calculateDurations(response.data.data);
      } else {
        setError(`Error: ${response.status}`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false); // Ensure loading state is turned off
    }
  };

  const calculateDurations = (songs) => {
    songs.forEach((song) => {
      const audio = new Audio(song.url);
      audio.addEventListener("loadedmetadata", () => {
        setDurations((prevDurations) => ({
          ...prevDurations,
          [song.id]: formatDuration(audio.duration),
        }));
      });
    });
  };

  const formatDuration = (durationInSeconds) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const selectSong = (songData) => {
    setSelectedSong(songData); // Set the selected song data
    localStorage.setItem("selectedSong", JSON.stringify(songData)); // Save to local storage
    setIsPlaying(false); // Reset playing state
    changeBackgroundGradient(songData.cover); // Change background gradient
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleSeek = (event) => {
    // Seek to the chosen time in the audio
    if (audioRef.current) {
      const seekTime = (event.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const playPrevious = () => {
    const currentIndex = music.findIndex((song) => song.id === selectedSong.id);
    if (currentIndex > 0) {
      selectSong(music[currentIndex - 1]);
    }
  };

  const playNext = () => {
    const currentIndex = music.findIndex((song) => song.id === selectedSong.id);
    if (currentIndex < music.length - 1) {
      selectSong(music[currentIndex + 1]);
    }
  };

  const filteredMusic = music.filter(
    (eachdata) =>
      eachdata.artist.toLowerCase().includes(searchQuery) ||
      eachdata.name.toLowerCase().includes(searchQuery)
  );

  // Function to handle tab change
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // Function to change background gradient based on cover image
  const changeBackgroundGradient = (cover) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Handle cross-origin issues
    img.src = `https://cms.samespace.com/assets/${cover}`;
    img.onload = () => {
      const colorThief = new ColorThief();
      const dominantColor = colorThief.getColor(img); // Extract dominant color
      setBackgroundGradient(
        `linear-gradient(90deg, rgba(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]}, 80.9) 50%, rgba(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]}, 0.2) 250%)`
      );
    };
  };

  return (
    <>
      <div className="background" style={{ background: backgroundGradient }}>
      <div>
              <img
                src={Logo}
                width={100}
                height={100}
                className="spotify-logo"
              />
            </div>
        <div className="two-text">
          {/* Tab Controls */}
          <span
            className={activeTab === "For You" ? "active-tab" : ""}
            onClick={() => handleTabChange("For You")}
            
          >
            For You
          </span>
          <span
            className={`top-tracks ${
              activeTab === "Top Tracks" ? "active-tab" : ""
            }`}
            onClick={() => handleTabChange("Top Tracks")}
          >
            Top Tracks
          </span>
        </div>

        {/* Conditional Rendering Based on Active Tab */}
        {activeTab === "For You" ? (
          <>
           
            <div className="search-container">
              <input
                type="search"
                id="gsearch"
                name="gsearch"
                placeholder="search Song,Artist"
                className="search-input"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <i className="fas fa-search"></i>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}

            {filteredMusic.map((eachdata) => (
              <div key={eachdata.id} className="top">
                <div
                  className="parent-container"
                  onClick={() => selectSong(eachdata)}
                >
                  <div>
                    <img
                      src={`https://cms.samespace.com/assets/${eachdata.cover}`}
                      alt={eachdata.name}
                    />
                  </div>
                  <div  className="artist-name-container">
                    <p className="artist">{eachdata.artist}</p>
                    <p className="name">{eachdata.name}</p>
                  </div>

                  {/* Song Duration Display */}
                  <div className="song-duration">
                    {durations[eachdata.id] || "Loading..."} {/* Display duration */}
                  </div>

                </div>
              </div>
            ))}
          </>
        ) : (
          // Empty view for "Top Tracks" tab
          <p>No content available for "Top Tracks" tab.</p>
        )}
      </div>

      {activeTab === "For You" && (
        <div className="container2">
          {selectedSong ? (
            <>
              <p className="artist">{selectedSong.artist}</p>
              <p className="name">{selectedSong.name}</p>
              <img
                src={`https://cms.samespace.com/assets/${selectedSong.cover}`}
                alt={selectedSong.name}
                className="selected-image"
              />

              {/* Seek bar */}
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="seek-bar"
              />

              {/* Audio Player Controls */}
              <div className="player-controls">
                <button className="ellipsis">
                  <i className="fas fa-ellipsis-h"></i> {/* Three Dots Icon */}
                </button>
                <button onClick={playPrevious} className="previous">
                  <i className="fas fa-backward"></i> {/* Previous Icon */}
                </button>
                <button onClick={togglePlayPause} className="play-pause">
                  <i
                    className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`}
                  ></i>{" "}
                  {/* Play/Pause Icon */}
                </button>
                <button onClick={playNext} className="next">
                  <i className="fas fa-forward"></i> {/* Next Icon */}
                </button>
                <button className="volume" onClick={togglePlayPause}>
                  <i className="fas fa-volume-up"></i> {/* Volume Icon */}
                </button>
              </div>

              <audio
                ref={audioRef}
                src={selectedSong.url}
                autoPlay
                controls={false}
              ></audio>
            </>
          ) : (
            <p>Select a song to see details here</p>
          )}
        </div>
      )}
    </>
  );
};

export default SpotifyApp;
