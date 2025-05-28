"use client"

import { useState } from "react"
import { X, Plus, Clock, Target, Trash2, Save } from "lucide-react"
import { useAuth } from "./auth-context"

interface Exercise {
  id: string
  name: string
  category: string
  musclesWorked: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  duration: string
}

interface RoutineExercise {
  exercise: Exercise
  duration: string
  rest: string
  order: number
}

interface RoutineBuilderProps {
  isOpen: boolean
  onClose: () => void
}

const exercises: Exercise[] = [
  {
    id: "1",
    name: "Push-ups",
    category: "Bodyweight",
    musclesWorked: ["Chest", "Shoulders", "Triceps", "Core"],
    difficulty: "Beginner",
    duration: "30 seconds",
  },
  {
    id: "2",
    name: "Dumbbell Bicep Curls",
    category: "Dumbbell",
    musclesWorked: ["Biceps", "Forearms"],
    difficulty: "Beginner",
    duration: "45 seconds",
  },
  {
    id: "3",
    name: "Resistance Band Rows",
    category: "Resistance Band",
    musclesWorked: ["Back", "Rear Delts", "Biceps"],
    difficulty: "Intermediate",
    duration: "60 seconds",
  },
  {
    id: "4",
    name: "Squats",
    category: "Bodyweight",
    musclesWorked: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
    difficulty: "Beginner",
    duration: "45 seconds",
  },
  {
    id: "5",
    name: "Dumbbell Shoulder Press",
    category: "Dumbbell",
    musclesWorked: ["Shoulders", "Triceps", "Upper Chest"],
    difficulty: "Intermediate",
    duration: "50 seconds",
  },
  {
    id: "6",
    name: "Resistance Band Chest Press",
    category: "Resistance Band",
    musclesWorked: ["Chest", "Shoulders", "Triceps"],
    difficulty: "Beginner",
    duration: "40 seconds",
  },
  {
    id: "7",
    name: "Burpees",
    category: "Bodyweight",
    musclesWorked: ["Full Body", "Cardio", "Core"],
    difficulty: "Advanced",
    duration: "30 seconds",
  },
  {
    id: "8",
    name: "Deadlifts",
    category: "Dumbbell",
    musclesWorked: ["Hamstrings", "Glutes", "Lower Back", "Core"],
    difficulty: "Intermediate",
    duration: "60 seconds",
  },
  {
    id: "9",
    name: "Mountain Climbers",
    category: "Bodyweight",
    musclesWorked: ["Core", "Shoulders", "Cardio"],
    difficulty: "Intermediate",
    duration: "30 seconds",
  },
  {
    id: "10",
    name: "Plank",
    category: "Bodyweight",
    musclesWorked: ["Core", "Shoulders", "Back"],
    difficulty: "Beginner",
    duration: "30-60 seconds",
  },
  {
    id: "11",
    name: "Lunges",
    category: "Bodyweight",
    musclesWorked: ["Quadriceps", "Glutes", "Hamstrings", "Calves"],
    difficulty: "Beginner",
    duration: "45 seconds",
  },
  {
    id: "12",
    name: "Kettlebell Swings",
    category: "Kettlebell",
    musclesWorked: ["Glutes", "Hamstrings", "Core", "Shoulders"],
    difficulty: "Intermediate",
    duration: "45 seconds",
  },
  {
    id: "13",
    name: "Pull-ups",
    category: "Bodyweight",
    musclesWorked: ["Back", "Biceps", "Shoulders"],
    difficulty: "Advanced",
    duration: "30 seconds",
  },
  {
    id: "14",
    name: "Dips",
    category: "Bodyweight",
    musclesWorked: ["Triceps", "Chest", "Shoulders"],
    difficulty: "Intermediate",
    duration: "30 seconds",
  },
  {
    id: "15",
    name: "Russian Twists",
    category: "Bodyweight",
    musclesWorked: ["Core", "Obliques"],
    difficulty: "Beginner",
    duration: "45 seconds",
  },
  {
    id: "16",
    name: "Box Jumps",
    category: "Plyometric",
    musclesWorked: ["Quadriceps", "Glutes", "Calves", "Core"],
    difficulty: "Intermediate",
    duration: "30 seconds",
  },
  {
    id: "17",
    name: "Battle Ropes",
    category: "Cardio Equipment",
    musclesWorked: ["Arms", "Shoulders", "Core", "Cardio"],
    difficulty: "Advanced",
    duration: "30 seconds",
  },
  {
    id: "18",
    name: "Turkish Get-ups",
    category: "Kettlebell",
    musclesWorked: ["Full Body", "Core", "Stability"],
    difficulty: "Advanced",
    duration: "60 seconds",
  },
  {
    id: "19",
    name: "Bear Crawl",
    category: "Bodyweight",
    musclesWorked: ["Full Body", "Core", "Shoulders"],
    difficulty: "Intermediate",
    duration: "30 seconds",
  },
  {
    id: "20",
    name: "Wall Sit",
    category: "Bodyweight",
    musclesWorked: ["Quadriceps", "Glutes", "Core"],
    difficulty: "Beginner",
    duration: "30-60 seconds",
  },
]

const categories = ["All", "Bodyweight", "Dumbbell", "Resistance Band", "Kettlebell", "Plyometric", "Cardio Equipment"]
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"]

export default function RoutineBuilder({ isOpen, onClose }: RoutineBuilderProps) {
  const { user } = useAuth()
  const [routineTitle, setRoutineTitle] = useState("")
  const [routineDescription, setRoutineDescription] = useState("")
  const [routineCategory, setRoutineCategory] = useState("Full Body")
  const [routineDifficulty, setRoutineDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner")
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [saving, setSaving] = useState(false)

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || exercise.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "All" || exercise.difficulty === selectedDifficulty
    const notAlreadySelected = !selectedExercises.some((re) => re.exercise.id === exercise.id)

    return matchesSearch && matchesCategory && matchesDifficulty && notAlreadySelected
  })

  const addExercise = (exercise: Exercise) => {
    const newRoutineExercise: RoutineExercise = {
      exercise,
      duration: exercise.duration,
      rest: "30 seconds",
      order: selectedExercises.length,
    }
    setSelectedExercises([...selectedExercises, newRoutineExercise])
  }

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.filter((re) => re.exercise.id !== exerciseId).map((re, index) => ({ ...re, order: index })),
    )
  }

  const updateExercise = (exerciseId: string, field: "duration" | "rest", value: string) => {
    setSelectedExercises((prev) => prev.map((re) => (re.exercise.id === exerciseId ? { ...re, [field]: value } : re)))
  }

  const moveExercise = (exerciseId: string, direction: "up" | "down") => {
    const currentIndex = selectedExercises.findIndex((re) => re.exercise.id === exerciseId)
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === selectedExercises.length - 1)
    ) {
      return
    }

    const newExercises = [...selectedExercises]
    const temp = newExercises[currentIndex]
    newExercises[currentIndex] = newExercises[targetIndex]
    newExercises[targetIndex] = temp

    // Update order numbers
    newExercises.forEach((re, index) => {
      re.order = index
    })

    setSelectedExercises(newExercises)
  }

  const calculateTotalDuration = () => {
    const totalSeconds = selectedExercises.reduce((total, re) => {
      const exerciseDuration = parseDuration(re.duration)
      const restDuration = parseDuration(re.rest)
      return total + exerciseDuration + restDuration
    }, 0)

    return Math.ceil(totalSeconds / 60)
  }

  const parseDuration = (duration: string): number => {
    if (duration.includes("seconds")) {
      return Number.parseInt(duration.match(/\d+/)?.[0] || "0")
    } else if (duration.includes("minutes")) {
      return Number.parseInt(duration.match(/\d+/)?.[0] || "0") * 60
    }
    return 30
  }

  const saveRoutine = async () => {
    if (!routineTitle.trim() || selectedExercises.length === 0) {
      alert("Please add a title and at least one exercise")
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const routineData = {
        title: routineTitle.trim(),
        description: routineDescription.trim(),
        category: routineCategory,
        difficulty: routineDifficulty,
        duration: `${calculateTotalDuration()} minutes`,
        exercises: selectedExercises.map((re) => ({
          name: re.exercise.name,
          duration: re.duration,
          rest: re.rest,
          exercise_order: re.order,
        })),
      }

      const response = await fetch("http://localhost:3001/api/routines/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
        body: JSON.stringify(routineData),
      })

      if (response.ok) {
        alert("Routine created successfully!")
        // Reset form
        setRoutineTitle("")
        setRoutineDescription("")
        setSelectedExercises([])
        onClose()
      } else {
        throw new Error("Failed to save routine")
      }
    } catch (error) {
      console.error("Error saving routine:", error)
      alert("Failed to save routine. Please try again.")
    } finally {
      setSaving(false)
    }
  }

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Routine</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 grid lg:grid-cols-2 gap-8">
          {/* Left Column - Routine Details & Selected Exercises */}
          <div className="space-y-6">
            {/* Routine Details */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Routine Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Routine Title *
                  </label>
                  <input
                    type="text"
                    value={routineTitle}
                    onChange={(e) => setRoutineTitle(e.target.value)}
                    placeholder="Enter routine name..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={routineDescription}
                    onChange={(e) => setRoutineDescription(e.target.value)}
                    placeholder="Describe your routine..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select
                      value={routineCategory}
                      onChange={(e) => setRoutineCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Full Body">Full Body</option>
                      <option value="Cardio">Cardio</option>
                      <option value="Strength">Strength</option>
                      <option value="Upper Body">Upper Body</option>
                      <option value="Lower Body">Lower Body</option>
                      <option value="Core">Core</option>
                      <option value="Flexibility">Flexibility</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={routineDifficulty}
                      onChange={(e) => setRoutineDifficulty(e.target.value as "Beginner" | "Intermediate" | "Advanced")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total Duration: {calculateTotalDuration()} minutes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedExercises.length} exercises
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Exercises */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Selected Exercises ({selectedExercises.length})
              </h3>

              {selectedExercises.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No exercises selected yet</p>
                  <p className="text-sm">Add exercises from the library on the right</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedExercises.map((routineExercise, index) => (
                    <div
                      key={routineExercise.exercise.id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {routineExercise.exercise.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {routineExercise.exercise.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveExercise(routineExercise.exercise.id, "up")}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveExercise(routineExercise.exercise.id, "down")}
                            disabled={index === selectedExercises.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeExercise(routineExercise.exercise.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={routineExercise.duration}
                            onChange={(e) => updateExercise(routineExercise.exercise.id, "duration", e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Rest
                          </label>
                          <input
                            type="text"
                            value={routineExercise.rest}
                            onChange={(e) => updateExercise(routineExercise.exercise.id, "rest", e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Exercise Library */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Exercise Library</h3>

              {/* Search and Filters */}
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exercise List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{exercise.name}</h4>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(exercise.difficulty)}`}
                          >
                            {exercise.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {exercise.category} • {exercise.duration}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {exercise.musclesWorked.join(", ")}
                        </p>
                      </div>
                      <button
                        onClick={() => addExercise(exercise)}
                        className="ml-3 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredExercises.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No exercises found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedExercises.length} exercises • {calculateTotalDuration()} minutes
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveRoutine}
                disabled={saving || !routineTitle.trim() || selectedExercises.length === 0}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Create Routine"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
