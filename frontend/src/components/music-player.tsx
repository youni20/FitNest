/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Shuffle,
  Repeat,
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  file: string;
  genre: string;
}

// You should place your MP3 files in the public/music/ directory
// For example: public/music/workout-beats.mp3, public/music/chill-vibes.mp3, etc.
const tracks: Track[] = [
  {
    id: "1",
    title: "Energetic Workout",
    artist: "Fitness Beats",
    file: "/music/energetic-workout.mp3",
    genre: "Electronic",
  },
  {
    id: "2",
    title: "Pump It Up",
    artist: "Gym Motivation",
    file: "/music/pump-it-up.mp3",
    genre: "Hip Hop",
  },
  {
    id: "3",
    title: "Cardio Rush",
    artist: "Beat Masters",
    file: "/music/cardio-rush.mp3",
    genre: "Electronic",
  },
  {
    id: "4",
    title: "Strength Training",
    artist: "Power Music",
    file: "/music/strength-training.mp3",
    genre: "Rock",
  },
  {
    id: "5",
    title: "Cool Down Vibes",
    artist: "Relaxation Zone",
    file: "/music/cool-down-vibes.mp3",
    genre: "Ambient",
  },
  {
    id: "6",
    title: "HIIT Intensity",
    artist: "High Energy",
    file: "/music/hiit-intensity.mp3",
    genre: "Electronic",
  },
  {
    id: "7",
    title: "Yoga Flow",
    artist: "Peaceful Sounds",
    file: "/music/yoga-flow.mp3",
    genre: "Ambient",
  },
  {
    id: "8",
    title: "Running Rhythm",
    artist: "Endurance Beats",
    file: "/music/running-rhythm.mp3",
    genre: "Pop",
  },
];

const genres = ["All", "Electronic", "Hip Hop", "Rock", "Ambient", "Pop"];

export default function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [, setTrackDurations] = useState<{
    [key: string]: number;
  }>({});

  const audioRef = useRef<HTMLAudioElement>(null);

  const filteredTracks =
    selectedGenre === "All"
      ? tracks
      : tracks.filter((track) => track.genre === selectedGenre);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      const newDuration = audio.duration || 0;
      setDuration(newDuration);
      // Store duration for the current track
      if (currentTrack && newDuration > 0) {
        setTrackDurations((prev) => ({
          ...prev,
          [currentTrack.id]: newDuration,
        }));
      }
    };
    const handleLoadStart = () => {
      setCurrentTime(0);
      setDuration(0);
    };
    const handleCanPlay = () => {
      const newDuration = audio.duration || 0;
      setDuration(newDuration);
      // Store duration for the current track
      if (currentTrack && newDuration > 0) {
        setTrackDurations((prev) => ({
          ...prev,
          [currentTrack.id]: newDuration,
        }));
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play().then(() => setIsPlaying(true));
      } else {
        handleNext();
      }
    };
    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [isRepeating, currentTrack]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const handleLoadAndPlay = async () => {
      try {
        audio.src = currentTrack.file;
        audio.load();

        if (isPlaying) {
          await audio.play();
        }
      } catch (error) {
        console.error("Error loading/playing track:", error);
        setIsPlaying(false);
      }
    };

    handleLoadAndPlay();
  }, [currentTrack]);

  const handlePlay = async (track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        }
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (!currentTrack) return;

    const currentIndex = filteredTracks.findIndex(
      (track) => track.id === currentTrack.id
    );
    let nextIndex;

    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * filteredTracks.length);
    } else {
      nextIndex = (currentIndex + 1) % filteredTracks.length;
    }

    const nextTrack = filteredTracks[nextIndex];
    setCurrentTrack(nextTrack);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (!currentTrack) return;

    const currentIndex = filteredTracks.findIndex(
      (track) => track.id === currentTrack.id
    );
    const prevIndex =
      currentIndex === 0 ? filteredTracks.length - 1 : currentIndex - 1;
    const prevTrack = filteredTracks[prevIndex];

    setCurrentTrack(prevTrack);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio && duration > 0) {
      const newTime = (Number.parseFloat(e.target.value) / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    setIsMuted(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Workout Music
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Energize your workouts with our curated music collection
        </p>
      </div>

      {/* Audio Element - Always present, hidden */}
      <audio ref={audioRef} preload="metadata" style={{ display: "none" }} />

      {/* Current Track Player */}
      {currentTrack && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentTrack.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {currentTrack.artist}
              </p>
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                {currentTrack.genre}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              value={duration > 0 ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsShuffled(!isShuffled)}
                className={`p-2 rounded-lg transition-colors ${
                  isShuffled
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={handlePrevious}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={() => currentTrack && handlePlay(currentTrack)}
                className="p-3 bg-blue-600 dark:bg-blue-500 text-white rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsRepeating(!isRepeating)}
                className={`p-2 rounded-lg transition-colors ${
                  isRepeating
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Repeat className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={handleVolumeChange}
                className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>
      )}

      {/* Genre Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedGenre === genre
                  ? "bg-blue-600 dark:bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Track List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Playlist
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                currentTrack?.id === track.id
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : ""
              }`}
              onClick={() => handlePlay(track)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {track.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {track.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    {track.genre}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No Results */}
      {filteredTracks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No tracks found in this genre</p>
            <p className="text-sm">Try selecting a different genre</p>
          </div>
        </div>
      )}
    </div>
  );
}
