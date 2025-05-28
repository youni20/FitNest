"use client"

import { useState, useEffect } from "react"
import { Clock, Target, BookmarkMinus, Play, X } from "lucide-react"
import { useAuth } from "./auth-context"

interface Exercise {
  id: number
  name: string
  duration: string
  rest: string
  exercise_order: number
}

interface SavedRoutine {
  id: number
  title: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  category: string
  saves_count: number
  created_at: string
  exercises: Exercise[]
}

export default function SavedRoutines() {
  const { user } = useAuth()
  const [savedRoutines, setSavedRoutines] = useState<SavedRoutine[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoutine, setSelectedRoutine] = useState<SavedRoutine | null>(null)
  const [workoutMode, setWorkoutMode] = useState<"idle" | "active">("idle")
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSavedRoutines()
    }
  }, [user])

  const fetchSavedRoutines = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/routines/saved", {
        headers: {
          "x-auth-token": token || "",
        },
      })
      const data = await response.json()
      setSavedRoutines(data)
    } catch (error) {
      console.error("Error fetching saved routines:", error)
    } finally {
      setLoading(false)
    }
  }

  const unsaveRoutine = async (routineId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/routines/${routineId}/save`, {
        method: "POST",
        headers: {
          "x-auth-token": token || "",
        },
      })

      if (response.ok) {
        setSavedRoutines((prev) => prev.filter((routine) => routine.id !== routineId))
        if (selectedRoutine && selectedRoutine.id === routineId) {
          setSelectedRoutine(null)
        }
      }
    } catch (error) {
      console.error("Error unsaving routine:", error)
    }
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

  const startWorkout = () => {
    if (!selectedRoutine || selectedRoutine.exercises.length === 0) return

    setWorkoutMode("active")
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

  const nextExercise = () => {
    if (!selectedRoutine) return

    const nextIndex = currentExerciseIndex + 1
    if (nextIndex >= selectedRoutine.exercises.length) {
      completeWorkout()
      return
    }

    setCurrentExerciseIndex(nextIndex)
    const nextEx = selectedRoutine.exercises[nextIndex]
    const duration = parseDuration(nextEx.duration)
    setTimeRemaining(duration)
    setTotalTime(duration)
    setIsRunning(true)
  }

  const completeWorkout = async () => {
    if (!selectedRoutine) return

    const totalDuration = Math.ceil(
      selectedRoutine.exercises.reduce((total, exercise) => {
        return total + parseDuration(exercise.duration)
      }, 0) / 60,
    )

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/routines/${selectedRoutine.id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
        body: JSON.stringify({
          duration_minutes: totalDuration,
          notes: `Completed ${selectedRoutine.title}`,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Workout completed! You burned ${result.calories_burned} calories in ${result.duration_minutes} minutes.`)
      }
    } catch (error) {
      console.error("Error logging workout:", error)
    }

    setWorkoutMode("idle")
    setIsRunning(false)
    setIsPaused(false)
    setTimeRemaining(0)
    setCurrentExerciseIndex(0)
  }

  const stopWorkout = () => {
    setWorkoutMode("idle")
    setIsRunning(false)
    setIsPaused(false)
    setTimeRemaining(0)
    setCurrentExerciseIndex(0)
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            setTimeout(() => {
              nextExercise()
            }, 1000)
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeRemaining, currentExerciseIndex, selectedRoutine])

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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <p className="text-lg">Loading your saved routines...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Saved Routines</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your collection of saved workout routines ({savedRoutines.length} routines)
        </p>
      </div>

      {savedRoutines.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <BookmarkMinus className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No saved routines yet</p>
            <p className="text-sm">Start exploring community routines and save your favorites!</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedRoutines.map((routine) => (
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
                    onClick={() => unsaveRoutine(routine.id)}
                    className="p-1 text-blue-500 hover:text-red-500 transition-colors"
                    title="Remove from saved"
                  >
                    <BookmarkMinus className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">{routine.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{routine.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{routine.exercises?.length || 0} exercises</span>
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
                  onClick={() => setSelectedRoutine(routine)}
                  className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
                >
                  View Routine
                </button>
              </div>
            </div>
          ))}
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
              </div>

              {/* Workout Controls */}
              {workoutMode === "active" && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Workout Active</h4>
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
                      <button
                        onClick={nextExercise}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${((currentExerciseIndex + (totalTime - timeRemaining) / totalTime) / selectedRoutine.exercises.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Exercise List */}
              <div className="space-y-3 mb-6">
                {selectedRoutine.exercises?.map((exercise, index) => {
                  const isCurrentExercise = workoutMode === "active" && currentExerciseIndex === index

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
                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <Play className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={startWorkout}
                  disabled={workoutMode === "active"}
                  className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {workoutMode === "active" ? "Workout in Progress..." : "Start Workout"}
                </button>
                <button
                  onClick={() => unsaveRoutine(selectedRoutine.id)}
                  className="px-6 py-3 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Remove from Saved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
