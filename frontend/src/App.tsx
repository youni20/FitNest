"use client";

import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/auth-context";
import { ThemeProvider, useTheme } from "./components/theme-context";
import LoginForm from "./components/login-form";
import Dashboard from "./components/dashboard";
import MotivationalQuote from "./components/MotivationalQuote";
import ExerciseLibrary from "./components/exercise-library";
import {
  Moon,
  Sun,
  Bookmark,
  Settings,
  Flame,
  FileText,
  Apple,
  Users,
  Dumbbell,
  Globe,
  LayoutDashboard,
  Music,
  LogOut,
} from "lucide-react";
import CommunityRoutines from "./components/community-routines";
import MusicPlayer from "./components/music-player";
import SavedRoutines from "./components/saved-routines";
import SettingsPage from "./components/settings-page";
import ScrollStickman from "./components/scroll-stickman";
import CalorieTracker from "./components/calorie-tracker";
import ProgressReports from "./components/progress-reports";
import NutritionTracker from "./components/nutrition-tracker";
import SocialHub from "./components/social-hub";
import AIChatBot from "./components/ai-chatbot"
import { useState } from "react"

export default function FitNestApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showAIChat, setShowAIChat] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header - Fixed width issues */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                FitNest
              </h1>
            </div>

            {/* Navigation - Made responsive */}
            <nav className="mx-6 hidden lg:flex items-center space-x-4 xl:space-x-6">
              <button
                onClick={() => navigate("/")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === "/"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 inline mr-1" />
                Dashboard
              </button>
              <button
                onClick={() => navigate("/exercises")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === "/exercises"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Dumbbell className="w-4 h-4 inline mr-1" />
                Exercises
              </button>
              <button
                onClick={() => navigate("/routines")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === "/routines"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Globe className="w-4 h-4 inline mr-1" />
                Community
              </button>
              <button
                onClick={() => navigate("/saved-routines")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === "/saved-routines"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Bookmark className="w-4 h-4 inline mr-1" />
                Saved
              </button>
              <button
                onClick={() => navigate("/nutrition")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === "/nutrition"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Apple className="w-4 h-4 inline mr-1" />
                Nutrition
              </button>
              <button
                onClick={() => navigate("/social")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === "/social"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Social
              </button>
              <button
                onClick={() => navigate("/calories")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === "/calories"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Flame className="w-4 h-4 inline mr-1" />
                Calories
              </button>
              <button
                onClick={() => navigate("/reports")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === "/reports"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Reports
              </button>
              <button
                onClick={() => navigate("/music")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === "/music"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Music className="w-4 h-4 inline mr-1" />
                Music
              </button>
            </nav>

            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Settings Icon */}
              <button
                onClick={() => navigate("/settings")}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Account Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-300">
                Welcome, {user.name}
              </span>
              <button
                onClick={logout}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                <LogOut className="w-4 h-4 inline mr-1" />
                Logout
              </button>
            </div>
          </div>
          {/* Motivational quote */}
          <div className="mt-4">
            <MotivationalQuote />
          </div>
        </div>
      </header>

      {/* Main Content - Fixed width */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/routines" element={<CommunityRoutines />} />
          <Route path="/saved-routines" element={<SavedRoutines />} />
          <Route path="/nutrition" element={<NutritionTracker />} />
          <Route path="/social" element={<SocialHub />} />
          <Route path="/music" element={<MusicPlayer />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/calories" element={<CalorieTracker />} />
          <Route path="/reports" element={<ProgressReports />} />
        </Routes>
      </main>
      <ScrollStickman />

     <button
  onClick={() => setShowAIChat(prev => !prev)}
  className="fixed bottom-4 left-4 z-50 w-14 h-14 flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-full shadow-lg transition text-xl"
  aria-label="Toggle AI Chat"
>
  🤖
</button>

      {showAIChat && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
          <AIChatBot isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
        </div>
      )}
    </div>
  );
}
