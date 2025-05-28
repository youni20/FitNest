"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Clock,
  Target,
  TrendingUp,
  Filter,
  BookmarkPlus,
  X,
  Play,
  Star,
  MessageCircle,
  Send,
} from "lucide-react"
import { useAuth } from "./auth-context"

interface Exercise {
  id: number
  name: string
  duration: string
  rest: string
  exercise_order: number
}

interface Comment {
  id: number
  user_name: string
  comment: string
  created_at: string
}

interface Routine {
  id: number
  title: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  category: string
  saves_count: number
  average_rating: string
  rating_count: number
  comment_count: number
  created_at: string
  exercises: Exercise[]
  comments?: Comment[]
  isSaved?: boolean
}

const categories = ["All", "Full Body", "Cardio", "Strength", "Upper Body", "Lower Body", "Core", "Flexibility"]
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"]
const sortOptions = ["Highest Rated", "Most Popular", "Newest", "Shortest", "Longest"]

export default function CommunityRoutines() {
  const { user } = useAuth()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [sortBy, setSortBy] = useState("Highest Rated")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null)
  const [workoutMode, setWorkoutMode] = useState<"idle" | "single" | "full">("idle")
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [newComment, setNewComment] = useState("")
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    fetchRoutines()
  }, [])

  const fetchRoutines = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/routines")
      const data = await response.json()
      setRoutines(data)
    } catch (error) {
      console.error("Error fetching routines:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoutineDetails = async (routineId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/routines/${routineId}`, {
        headers: token ? { "x-auth-token": token } : {},
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching routine details:", error)
      return null
    }
  }

  const submitRating = async (routineId: number, rating: number) => {
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/routines/${routineId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
        body: JSON.stringify({ rating }),
      })

      if (response.ok) {
        setUserRating(rating)
        // Refresh routine details
        if (selectedRoutine && selectedRoutine.id === routineId) {
          const updatedRoutine = await fetchRoutineDetails(routineId)
          if (updatedRoutine) {
            setSelectedRoutine(updatedRoutine)
          }
        }
        fetchRoutines()
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
    }
  }

  const submitComment = async (routineId: number) => {
    if (!user || !newComment.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/routines/${routineId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
        body: JSON.stringify({ comment: newComment.trim() }),
      })

      if (response.ok) {
        const newCommentData = await response.json()
        setNewComment("")

        // Update selected routine with new comment
        if (selectedRoutine && selectedRoutine.id === routineId) {
          setSelectedRoutine((prev) =>
            prev
              ? {
                  ...prev,
                  comments: [newCommentData, ...(prev.comments || [])],
                }
              : null,
          )
        }
        fetchRoutines()
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
    }
  }

  const completeWorkout = async (routineId: number, durationMinutes: number) => {
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/routines/${routineId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
        body: JSON.stringify({
          duration_minutes: durationMinutes,
          notes: `Completed ${selectedRoutine?.title || "workout"}`,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Workout completed! You burned ${result.calories_burned} calories in ${result.duration_minutes} minutes.`)
      }
    } catch (error) {
      console.error("Error logging workout:", error)
    }
  }

  const toggleSave = async (routineId: number) => {
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/routines/${routineId}/save`, {
        method: "POST",
        headers: {
          "x-auth-token": token || "",
        },
      })

      if (response.ok) {
        setRoutines((prev) =>
          prev.map((routine) => (routine.id === routineId ? { ...routine, isSaved: !routine.isSaved } : routine)),
        )

        if (selectedRoutine && selectedRoutine.id === routineId) {
          setSelectedRoutine((prev) => (prev ? { ...prev, isSaved: !prev.isSaved } : null))
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error)
    }
  }

  const filteredRoutines = routines
    .filter((routine) => {
      const matchesSearch =
        routine.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        routine.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "All" || routine.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === "All" || routine.difficulty === selectedDifficulty

      return matchesSearch && matchesCategory && matchesDifficulty
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Highest Rated":
          return Number.parseFloat(b.average_rating) - Number.parseFloat(a.average_rating)
        case "Most Popular":
          return (b.saves_count || 0) - (a.saves_count || 0)
        case "Newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "Shortest":
          return Number.parseInt(a.duration) - Number.parseInt(b.duration)
        case "Longest":
          return Number.parseInt(b.duration) - Number.parseInt(a.duration)
        default:
          return 0
      }
    })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
      case "Intermediate":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
      case "Advanced":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
    }
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            disabled={!interactive}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        ))}
        {!interactive && <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">({rating.toFixed(1)})</span>}
      </div>
    )
  }

  const parseDuration = (duration: string): number => {
    if (duration.includes("seconds")) {
      return Number.parseInt(duration.match(/\d+/)?.[0] || "0")
    } else if (duration.includes("minutes")) {
      return Number.parseInt(duration.match(/\d+/)?.[0] || "0") * 60
    } else if (duration.includes("sets") || duration.includes("reps")) {
      return 45
    }
    return 30
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleViewRoutine = async (routine: Routine) => {
    const detailedRoutine = await fetchRoutineDetails(routine.id)
    if (detailedRoutine) {
      setSelectedRoutine(detailedRoutine)
      setShowComments(false)
      setUserRating(0)
    }
  }

  const startSingleExercise = (exercise: Exercise, index: number) => {
    const duration = parseDuration(exercise.duration)
    setWorkoutMode("single")
    setCurrentExerciseIndex(index)
    setTimeRemaining(duration)
    setTotalTime(duration)
    setIsRunning(true)
    setIsPaused(false)
  }

  const startFullWorkout = () => {
    if (!selectedRoutine) return
    setWorkoutMode("full")
    setCurrentExerciseIndex(0)
    const firstExercise = selectedRoutine.exercises[0]
    const duration = parseDuration(firstExercise.duration)
    setTimeRemaining(duration)
    setTotalTime(duration)
    setIsRunning(true)
    setIsPaused(false)
  }

  const pauseTimer = () => {
    setIsPaused(true)
    setIsRunning(false)
  }

  const resumeTimer = () => {
    setIsPaused(false)
    setIsRunning(true)
  }

  const stopWorkout = () => {
    if (workoutMode === "full" && selectedRoutine) {
      // Calculate total workout time
      const totalDuration = Math.ceil(
        selectedRoutine.exercises.reduce((total, exercise) => {
          return total + parseDuration(exercise.duration)
        }, 0) / 60,
      )
      completeWorkout(selectedRoutine.id, totalDuration)
    }

    setWorkoutMode("idle")
    setIsRunning(false)
    setIsPaused(false)
    setTimeRemaining(0)
    setCurrentExerciseIndex(0)
  }

  const nextExercise = () => {
    if (!selectedRoutine || workoutMode !== "full") return

    const nextIndex = currentExerciseIndex + 1
    if (nextIndex >= selectedRoutine.exercises.length) {
      stopWorkout()
      return
    }

    setCurrentExerciseIndex(nextIndex)
    const nextEx = selectedRoutine.exercises[nextIndex]
    const duration = parseDuration(nextEx.duration)
    setTimeRemaining(duration)
    setTotalTime(duration)
    setIsRunning(true)
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            if (workoutMode === "full") {
              setTimeout(() => {
                nextExercise()
              }, 1000)
            } else {
              setIsRunning(false)
              setWorkoutMode("idle")
            }
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeRemaining, workoutMode, currentExerciseIndex, selectedRoutine])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Loading routines...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community Routines</h1>
        <p className="text-gray-600 dark:text-gray-300">Discover and share fitness routines created by our community</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search routines or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedCategory === category
                        ? "bg-blue-600 dark:bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedDifficulty === difficulty
                        ? "bg-blue-600 dark:bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Routines Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoutines.map((routine) => (
          <div
            key={routine.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{routine.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {routine.category} • {routine.difficulty}
                  </p>
                </div>
                <button
                  onClick={() => toggleSave(routine.id)}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <BookmarkPlus className={`w-5 h-5 ${routine.isSaved ? "text-blue-500 fill-current" : ""}`} />
                </button>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">{routine.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{routine.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(Number.parseFloat(routine.average_rating))}
                  <span>({routine.rating_count})</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{routine.comment_count}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                  {routine.category}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(routine.difficulty)}`}
                >
                  {routine.difficulty}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleViewRoutine(routine)}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
              >
                View Routine
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRoutines.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No routines found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      )}

      {/* Routine Detail Modal */}
      {selectedRoutine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRoutine.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedRoutine.category} • {selectedRoutine.difficulty}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRoutine(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedRoutine.description}</p>

                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{selectedRoutine.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{selectedRoutine.exercises?.length || 0} exercises</span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(selectedRoutine.difficulty)}`}
                  >
                    {selectedRoutine.difficulty}
                  </span>
                </div>

                {/* Rating Section */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Rate this routine</h4>
                    <div className="flex items-center gap-2">
                      {renderStars(Number.parseFloat(selectedRoutine.average_rating))}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({selectedRoutine.rating_count} ratings)
                      </span>
                    </div>
                  </div>
                  {user && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Your rating:</span>
                      {renderStars(userRating, true, (rating) => submitRating(selectedRoutine.id, rating))}
                    </div>
                  )}
                </div>
              </div>

              {/* Exercise List */}
              <div className="space-y-3 mb-6">
                {selectedRoutine.exercises?.map((exercise, index) => {
                  const isCurrentExercise = workoutMode !== "idle" && currentExerciseIndex === index
                  const progress = isCurrentExercise ? ((totalTime - timeRemaining) / totalTime) * 100 : 0

                  return (
                    <div
                      key={exercise.id}
                      className={`bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-all ${
                        isCurrentExercise ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              isCurrentExercise
                                ? "bg-blue-500 text-white"
                                : "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{exercise.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>Duration: {exercise.duration}</span>
                              {exercise.rest !== "0 seconds" && <span>Rest: {exercise.rest}</span>}
                              {isCurrentExercise && (
                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                  {formatTime(timeRemaining)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => startSingleExercise(exercise, index)}
                            disabled={workoutMode === "full"}
                            className="relative p-2 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                          >
                            <Play className="w-5 h-5 relative z-20" />
                          </button>
                          {isCurrentExercise && (
                            <svg
                              className="absolute top-0 left-0 w-9 h-9 -rotate-90 pointer-events-none z-0"
                              viewBox="0 0 36 36"
                              style={{ transform: "translate(-2px, -2px) rotate(-90deg)" }}
                            >
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeOpacity="0.3"
                                className="text-gray-300 dark:text-gray-600"
                              />
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray={`${progress}, 100`}
                                className="text-blue-500"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Workout Controls */}
              {workoutMode !== "idle" && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        {workoutMode === "full" ? "Full Workout Active" : "Exercise Timer"}
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {selectedRoutine.exercises[currentExerciseIndex]?.name} - {formatTime(timeRemaining)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {isRunning ? (
                        <button
                          onClick={pauseTimer}
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
                        >
                          Pause
                        </button>
                      ) : isPaused ? (
                        <button
                          onClick={resumeTimer}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                        >
                          Resume
                        </button>
                      ) : null}
                      <button
                        onClick={stopWorkout}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Stop
                      </button>
                      {workoutMode === "full" && (
                        <button
                          onClick={nextExercise}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Skip
                        </button>
                      )}
                    </div>
                  </div>
                  {workoutMode === "full" && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{
                          width: `${((currentExerciseIndex + (totalTime - timeRemaining) / totalTime) / selectedRoutine.exercises.length) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Comments Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Comments ({selectedRoutine.comments?.length || 0})
                  </h4>
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                  >
                    {showComments ? "Hide" : "Show"} Comments
                  </button>
                </div>

                {showComments && (
                  <div className="space-y-4">
                    {/* Add Comment */}
                    {user && (
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === "Enter" && submitComment(selectedRoutine.id)}
                        />
                        <button
                          onClick={() => submitComment(selectedRoutine.id)}
                          disabled={!newComment.trim()}
                          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedRoutine.comments?.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {comment.user_name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={startFullWorkout}
                  disabled={workoutMode !== "idle"}
                  className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {workoutMode === "full" ? "Workout in Progress..." : "Start Workout"}
                </button>
                <button
                  onClick={() => toggleSave(selectedRoutine.id)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {selectedRoutine.isSaved ? "Unsave Routine" : "Save Routine"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
