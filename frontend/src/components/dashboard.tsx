"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import { Activity, Flame, Calendar, Target, TrendingUp } from "lucide-react"
import RoutineBuilder from "./routine-builder"

interface WorkoutStats {
  total_workouts: number
  total_minutes: number
  total_calories: number
  avg_duration: number
}

interface RecentWorkout {
  id: number
  routine_title: string
  category: string
  duration_minutes: number
  calories_burned: number
  completed_at: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [weeklyStats, setWeeklyStats] = useState<WorkoutStats | null>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [showRoutineBuilder, setShowRoutineBuilder] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch weekly stats
      const statsResponse = await fetch("http://localhost:3001/api/routines/stats/user?period=week", {
        headers: { "x-auth-token": token || "" },
      })
      const statsData = await statsResponse.json()
      setWeeklyStats(statsData)

      // Fetch recent workouts
      const workoutsResponse = await fetch("http://localhost:3001/api/users/workout-history?period=week", {
        headers: { "x-auth-token": token || "" },
      })
      const workoutsData = await workoutsResponse.json()
      setRecentWorkouts(workoutsData.slice(0, 5)) // Get last 5 workouts
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.name}! Here's your fitness overview.</p>
      </div>

      {/* Welcome Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">🎉 Welcome to FitNest!</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You're all set up and ready to start your fitness journey. Let's build some healthy habits together!
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Your Profile</h4>
            <div className="text-sm text-blue-800 dark:text-blue-100 space-y-1">
              <p>
                <strong>Fitness Level:</strong> {user?.level || "Not set"}
              </p>
              {user?.fitnessGoals && user.fitnessGoals.length > 0 && (
                <p>
                  <strong>Goals:</strong> {user.fitnessGoals.join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Workouts This Week</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? "..." : weeklyStats?.total_workouts || 0}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Calories Burned</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {loading ? "..." : weeklyStats?.total_calories || 0}
              </p>
            </div>
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Minutes</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? "..." : weeklyStats?.total_minutes || 0}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Duration</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {loading ? "..." : weeklyStats?.avg_duration ? Math.round(weeklyStats.avg_duration) + "m" : "0m"}
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Recent Activity
        </h3>

        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">Loading recent activity...</p>
          </div>
        ) : recentWorkouts.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400">No recent workouts</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Complete a workout routine to see your activity here!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{workout.routine_title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {workout.category} • {workout.duration_minutes} minutes
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    {workout.calories_burned} calories
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(workout.completed_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Routine Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Your Own Routine</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Build a custom workout routine from our exercise library. You can keep it private or share it with the
          community.
        </p>
        <button
          onClick={() => setShowRoutineBuilder(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-medium"
        >
          Start Creating Routine
        </button>
      </div>

      {/* Routine Builder Modal */}
      {showRoutineBuilder && (
        <RoutineBuilder isOpen={showRoutineBuilder} onClose={() => setShowRoutineBuilder(false)} />
      )}
    </div>
  )
}
