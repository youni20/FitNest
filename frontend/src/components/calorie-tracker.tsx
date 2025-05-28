"use client"

import { useState, useEffect } from "react"
import { Flame, Calendar, Target, Activity } from "lucide-react"
import { useAuth } from "./auth-context"

interface WorkoutStats {
  total_workouts: number
  total_minutes: number
  total_calories: number
  avg_duration: number
}

interface WorkoutSession {
  id: number
  routine_title: string
  category: string
  difficulty: string
  duration_minutes: number
  calories_burned: number
  completed_at: string
  workout_date: string
}

export default function CalorieTracker() {
  const { user } = useAuth()
  const [weeklyStats, setWeeklyStats] = useState<WorkoutStats | null>(null)
  const [monthlyStats, setMonthlyStats] = useState<WorkoutStats | null>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("week")

  useEffect(() => {
    fetchStats()
    fetchWorkoutHistory()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch weekly stats
      const weeklyResponse = await fetch("http://localhost:3001/api/routines/stats/user?period=week", {
        headers: { "x-auth-token": token || "" },
      })
      const weeklyData = await weeklyResponse.json()
      setWeeklyStats(weeklyData)

      // Fetch monthly stats
      const monthlyResponse = await fetch("http://localhost:3001/api/routines/stats/user?period=month", {
        headers: { "x-auth-token": token || "" },
      })
      const monthlyData = await monthlyResponse.json()
      setMonthlyStats(monthlyData)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchWorkoutHistory = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/users/workout-history?period=week", {
        headers: { "x-auth-token": token || "" },
      })
      const data = await response.json()
      setRecentWorkouts(data)
    } catch (error) {
      console.error("Error fetching workout history:", error)
    } finally {
      setLoading(false)
    }
  }

  const currentStats = selectedPeriod === "week" ? weeklyStats : monthlyStats
  const periodLabel = selectedPeriod === "week" ? "This Week" : "This Month"

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Loading your fitness data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Calorie Tracker</h1>
        <p className="text-gray-600 dark:text-gray-300">Track your workout progress and calories burned</p>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod("week")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === "week"
                ? "bg-blue-600 dark:bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setSelectedPeriod("month")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === "month"
                ? "bg-blue-600 dark:bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Calories Burned</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {currentStats?.total_calories || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{periodLabel}</p>
            </div>
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Workouts</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentStats?.total_workouts || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{periodLabel}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Minutes</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currentStats?.total_minutes || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{periodLabel}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Duration</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {currentStats?.avg_duration ? Math.round(currentStats.avg_duration) : 0}m
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{periodLabel}</p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Workouts</h2>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="p-6 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400">No workouts completed yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Complete a workout routine to start tracking your progress!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentWorkouts.map((workout) => (
              <div key={workout.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{workout.routine_title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                        {workout.category}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                        {workout.difficulty}
                      </span>
                      <span>{workout.duration_minutes} minutes</span>
                      <span className="text-orange-600 dark:text-orange-400 font-medium">
                        {workout.calories_burned} calories
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(workout.completed_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(workout.completed_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calorie Calculation Info */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">How are calories calculated?</h3>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Calories are estimated based on your profile information (weight, age, gender) and workout intensity. For more
          accurate tracking, make sure to update your profile in Settings with your current weight and other details.
        </p>
      </div>
    </div>
  )
}
