"use client"

import { useState, useEffect } from "react"
import { Download, TrendingUp, FileText, Loader } from "lucide-react"
import { useAuth } from "./auth-context"

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

interface ReportData {
  period: string
  totalWorkouts: number
  totalCalories: number
  totalMinutes: number
  avgDuration: number
  workoutsByCategory: { [key: string]: number }
  workoutsByDifficulty: { [key: string]: number }
  dailyCalories: { [key: string]: number }
  workouts: WorkoutSession[]
}

export default function ProgressReports() {
  const { user } = useAuth()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("week")

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      // Fetch workout history
      const response = await fetch(`http://localhost:3001/api/users/workout-history?period=${selectedPeriod}`, {
        headers: { "x-auth-token": token || "" },
      })
      const workouts = await response.json()

      // Process data for report
      const totalWorkouts = workouts.length
      const totalCalories = workouts.reduce((sum: number, w: WorkoutSession) => sum + w.calories_burned, 0)
      const totalMinutes = workouts.reduce((sum: number, w: WorkoutSession) => sum + w.duration_minutes, 0)
      const avgDuration = totalWorkouts > 0 ? totalMinutes / totalWorkouts : 0

      // Group by category
      const workoutsByCategory = workouts.reduce((acc: { [key: string]: number }, workout: WorkoutSession) => {
        acc[workout.category] = (acc[workout.category] || 0) + 1
        return acc
      }, {})

      // Group by difficulty
      const workoutsByDifficulty = workouts.reduce((acc: { [key: string]: number }, workout: WorkoutSession) => {
        acc[workout.difficulty] = (acc[workout.difficulty] || 0) + 1
        return acc
      }, {})

      // Daily calories
      const dailyCalories = workouts.reduce((acc: { [key: string]: number }, workout: WorkoutSession) => {
        const date = workout.workout_date
        acc[date] = (acc[date] || 0) + workout.calories_burned
        return acc
      }, {})

      setReportData({
        period: selectedPeriod,
        totalWorkouts,
        totalCalories,
        totalMinutes,
        avgDuration,
        workoutsByCategory,
        workoutsByDifficulty,
        dailyCalories,
        workouts,
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async () => {
    if (!reportData) return

    setGenerating(true)
    try {
      // Create PDF content
      const pdfContent = generatePDFContent(reportData)

      // Create and download PDF
      const blob = new Blob([pdfContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `fitnest-report-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setGenerating(false)
    }
  }

  const generatePDFContent = (data: ReportData): string => {
    const periodLabel = data.period === "week" ? "Weekly" : "Monthly"
    const dateRange = data.period === "week" ? "Last 7 Days" : "Last 30 Days"

    return `
<!DOCTYPE html>
<html>
<head>
    <title>FitNest ${periodLabel} Progress Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; }
        .logo { color: #3B82F6; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; text-align: center; }
        .stat-value { font-size: 32px; font-weight: bold; color: #3B82F6; }
        .stat-label { color: #6B7280; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1F2937; }
        .workout-item { border-bottom: 1px solid #F3F4F6; padding: 15px 0; }
        .workout-title { font-weight: bold; margin-bottom: 5px; }
        .workout-details { color: #6B7280; font-size: 14px; }
        .chart-placeholder { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; text-align: center; color: #6B7280; }
        .footer { margin-top: 40px; text-align: center; color: #6B7280; font-size: 12px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🏋️ FitNest</div>
        <h1>${periodLabel} Progress Report</h1>
        <p>Report Period: ${dateRange} | Generated: ${new Date().toLocaleDateString()}</p>
        <p>User: ${user?.name || "Fitness Enthusiast"}</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">${data.totalWorkouts}</div>
            <div class="stat-label">Total Workouts</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${data.totalCalories}</div>
            <div class="stat-label">Calories Burned</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${data.totalMinutes}</div>
            <div class="stat-label">Total Minutes</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${Math.round(data.avgDuration)}</div>
            <div class="stat-label">Avg Duration (min)</div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Workout Breakdown by Category</h2>
        <div class="chart-placeholder">
            ${Object.entries(data.workoutsByCategory)
              .map(([category, count]) => `<p><strong>${category}:</strong> ${count} workouts</p>`)
              .join("")}
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Workout Breakdown by Difficulty</h2>
        <div class="chart-placeholder">
            ${Object.entries(data.workoutsByDifficulty)
              .map(([difficulty, count]) => `<p><strong>${difficulty}:</strong> ${count} workouts</p>`)
              .join("")}
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Recent Workouts</h2>
        ${data.workouts
          .slice(0, 10)
          .map(
            (workout) => `
            <div class="workout-item">
                <div class="workout-title">${workout.routine_title}</div>
                <div class="workout-details">
                    ${workout.category} • ${workout.difficulty} • ${workout.duration_minutes} min • ${workout.calories_burned} cal
                    <br>Completed: ${new Date(workout.completed_at).toLocaleDateString()}
                </div>
            </div>
        `,
          )
          .join("")}
    </div>

    <div class="section">
        <h2 class="section-title">Key Insights</h2>
        <ul>
            <li>Most popular workout category: ${Object.entries(data.workoutsByCategory).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}</li>
            <li>Average workout duration: ${Math.round(data.avgDuration)} minutes</li>
            <li>Total calories burned: ${data.totalCalories} calories</li>
            <li>Workout frequency: ${(data.totalWorkouts / (data.period === "week" ? 7 : 30)).toFixed(1)} workouts per day</li>
        </ul>
    </div>

    <div class="footer">
        <p>Generated by FitNest - Your Personal Fitness Companion</p>
        <p>Keep up the great work! 💪</p>
    </div>
</body>
</html>
    `
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Loading report data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Progress Reports</h1>
        <p className="text-gray-600 dark:text-gray-300">Generate detailed reports of your fitness progress</p>
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
            Weekly Report
          </button>
          <button
            onClick={() => setSelectedPeriod("month")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === "month"
                ? "bg-blue-600 dark:bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Monthly Report
          </button>
        </div>
      </div>

      {reportData && (
        <>
          {/* Report Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedPeriod === "week" ? "Weekly" : "Monthly"} Report Preview
                </h2>
                <button
                  onClick={generatePDF}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {generating ? "Generating..." : "Download Report"}
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{reportData.totalWorkouts}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Workouts</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {reportData.totalCalories}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Calories Burned</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{reportData.totalMinutes}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Minutes</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(reportData.avgDuration)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Duration (min)</div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Workouts by Category</h3>
                <div className="space-y-2">
                  {Object.entries(reportData.workoutsByCategory).map(([category, count]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-gray-900 dark:text-white">{category}</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{count} workouts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Workouts by Difficulty</h3>
                <div className="space-y-2">
                  {Object.entries(reportData.workoutsByDifficulty).map(([difficulty, count]) => (
                    <div
                      key={difficulty}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-gray-900 dark:text-white">{difficulty}</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{count} workouts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Workouts */}
              {reportData.workouts.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Recent Workouts</h3>
                  <div className="space-y-3">
                    {reportData.workouts.slice(0, 5).map((workout) => (
                      <div key={workout.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{workout.routine_title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {workout.category} • {workout.difficulty} • {workout.duration_minutes} min
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-orange-600 dark:text-orange-400">
                              {workout.calories_burned} cal
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(workout.completed_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">📊 About Your Reports</h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Your progress reports include workout statistics, calorie tracking, and performance insights. Reports are
              generated as downloadable HTML files that you can save, print, or share with your trainer.
            </p>
          </div>
        </>
      )}

      {(!reportData || reportData.totalWorkouts === 0) && !loading && (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No workout data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Complete some workouts to generate your progress report!
          </p>
        </div>
      )}
    </div>
  )
}
