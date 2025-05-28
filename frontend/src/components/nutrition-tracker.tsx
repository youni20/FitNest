"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Trash2, Apple, Target, TrendingUp } from "lucide-react"
import { useAuth } from "./auth-context"

interface FoodItem {
  id: number
  name: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  fiber_per_100g: number
}

interface NutritionEntry {
  id: number
  food_name: string
  quantity_grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  logged_at: string
}

interface DailyNutrition {
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  total_fiber: number
  entries: NutritionEntry[]
}

const commonFoods: FoodItem[] = [
  {
    id: 1,
    name: "Chicken Breast",
    calories_per_100g: 165,
    protein_per_100g: 31,
    carbs_per_100g: 0,
    fat_per_100g: 3.6,
    fiber_per_100g: 0,
  },
  {
    id: 2,
    name: "Brown Rice",
    calories_per_100g: 111,
    protein_per_100g: 2.6,
    carbs_per_100g: 23,
    fat_per_100g: 0.9,
    fiber_per_100g: 1.8,
  },
  {
    id: 3,
    name: "Broccoli",
    calories_per_100g: 34,
    protein_per_100g: 2.8,
    carbs_per_100g: 7,
    fat_per_100g: 0.4,
    fiber_per_100g: 2.6,
  },
  {
    id: 4,
    name: "Banana",
    calories_per_100g: 89,
    protein_per_100g: 1.1,
    carbs_per_100g: 23,
    fat_per_100g: 0.3,
    fiber_per_100g: 2.6,
  },
  {
    id: 5,
    name: "Salmon",
    calories_per_100g: 208,
    protein_per_100g: 25,
    carbs_per_100g: 0,
    fat_per_100g: 12,
    fiber_per_100g: 0,
  },
  {
    id: 6,
    name: "Oats",
    calories_per_100g: 389,
    protein_per_100g: 17,
    carbs_per_100g: 66,
    fat_per_100g: 7,
    fiber_per_100g: 11,
  },
  {
    id: 7,
    name: "Greek Yogurt",
    calories_per_100g: 59,
    protein_per_100g: 10,
    carbs_per_100g: 3.6,
    fat_per_100g: 0.4,
    fiber_per_100g: 0,
  },
  {
    id: 8,
    name: "Almonds",
    calories_per_100g: 579,
    protein_per_100g: 21,
    carbs_per_100g: 22,
    fat_per_100g: 50,
    fiber_per_100g: 12,
  },
]

export default function NutritionTracker() {
  const { user } = useAuth()
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState("")
  const [showAddFood, setShowAddFood] = useState(false)

  useEffect(() => {
    fetchDailyNutrition()
  }, [])

  const fetchDailyNutrition = async () => {
    try {
      const token = localStorage.getItem("token")
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch(`http://localhost:3001/api/nutrition/daily?date=${today}`, {
        headers: { "x-auth-token": token || "" },
      })
      const data = await response.json()
      setDailyNutrition(data)
    } catch (error) {
      console.error("Error fetching nutrition data:", error)
    } finally {
      setLoading(false)
    }
  }

  const addFoodEntry = async () => {
    if (!selectedFood || !quantity) return

    try {
      const token = localStorage.getItem("token")
      const quantityNum = Number.parseFloat(quantity)

      const nutritionData = {
        food_name: selectedFood.name,
        quantity_grams: quantityNum,
        calories: Math.round((selectedFood.calories_per_100g * quantityNum) / 100),
        protein: Math.round(((selectedFood.protein_per_100g * quantityNum) / 100) * 10) / 10,
        carbs: Math.round(((selectedFood.carbs_per_100g * quantityNum) / 100) * 10) / 10,
        fat: Math.round(((selectedFood.fat_per_100g * quantityNum) / 100) * 10) / 10,
        fiber: Math.round(((selectedFood.fiber_per_100g * quantityNum) / 100) * 10) / 10,
      }

      const response = await fetch("http://localhost:3001/api/nutrition/entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
        body: JSON.stringify(nutritionData),
      })

      if (response.ok) {
        setSelectedFood(null)
        setQuantity("")
        setShowAddFood(false)
        fetchDailyNutrition()
      }
    } catch (error) {
      console.error("Error adding food entry:", error)
    }
  }

  const deleteEntry = async (entryId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/nutrition/entry/${entryId}`, {
        method: "DELETE",
        headers: { "x-auth-token": token || "" },
      })

      if (response.ok) {
        fetchDailyNutrition()
      }
    } catch (error) {
      console.error("Error deleting entry:", error)
    }
  }

  const filteredFoods = commonFoods.filter((food) => food.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getCalorieGoal = () => {
    // Basic calorie goal calculation - can be made more sophisticated
    return 2000 // Default goal
  }

  const getProteinGoal = () => {
    return 150 // Default protein goal in grams
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Apple className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
          <p className="text-lg text-gray-500 dark:text-gray-400">Loading nutrition data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nutrition Tracker</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your daily nutrition and macros</p>
        </div>
        <button
          onClick={() => setShowAddFood(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Food
        </button>
      </div>

      {/* Daily Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Calories</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {dailyNutrition?.total_calories || 0}
              </p>
              <p className="text-xs text-gray-500">/ {getCalorieGoal()} goal</p>
            </div>
            <Apple className="w-8 h-8 text-orange-500" />
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(((dailyNutrition?.total_calories || 0) / getCalorieGoal()) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Protein</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {dailyNutrition?.total_protein || 0}g
              </p>
              <p className="text-xs text-gray-500">/ {getProteinGoal()}g goal</p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(((dailyNutrition?.total_protein || 0) / getProteinGoal()) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Carbs</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {dailyNutrition?.total_carbs || 0}g
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fat</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {dailyNutrition?.total_fat || 0}g
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">F</span>
            </div>
          </div>
        </div>
      </div>

      {/* Food Entries */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Food Log</h2>
        </div>

        {!dailyNutrition?.entries || dailyNutrition.entries.length === 0 ? (
          <div className="p-6 text-center">
            <Apple className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400">No food logged today</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Start tracking your nutrition by adding foods!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {dailyNutrition.entries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{entry.food_name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{entry.quantity_grams}g</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 mt-1">
                      <span>{entry.calories} cal</span>
                      <span>{entry.protein}g protein</span>
                      <span>{entry.carbs}g carbs</span>
                      <span>{entry.fat}g fat</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(entry.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Food Modal */}
      {showAddFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Food</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search foods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Food List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedFood?.id === food.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{food.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {food.calories_per_100g} cal per 100g
                    </div>
                  </button>
                ))}
              </div>

              {/* Quantity Input */}
              {selectedFood && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity (grams)
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity in grams"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {quantity && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>Nutrition for {quantity}g:</p>
                      <p>
                        Calories: {Math.round((selectedFood.calories_per_100g * Number.parseFloat(quantity)) / 100)}
                      </p>
                      <p>
                        Protein:{" "}
                        {Math.round(((selectedFood.protein_per_100g * Number.parseFloat(quantity)) / 100) * 10) / 10}g
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowAddFood(false)
                  setSelectedFood(null)
                  setQuantity("")
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addFoodEntry}
                disabled={!selectedFood || !quantity}
                className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Food
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
