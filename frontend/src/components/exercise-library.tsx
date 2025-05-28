"use client";

import { useState } from "react";
import {
  Play,
  Users,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  category: string;
  musclesWorked: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  steps: string[];
  tips: string[];
  videoId?: string; // YouTube video ID
}

const exercises: Exercise[] = [
  {
    id: "1",
    name: "Push-ups",
    category: "Bodyweight",
    musclesWorked: ["Chest", "Shoulders", "Triceps", "Core"],
    difficulty: "Beginner",
    duration: "30 seconds",
    steps: [
      "Start in a plank position with hands slightly wider than shoulders",
      "Lower your body until chest nearly touches the floor",
      "Push back up to starting position",
      "Keep your body in a straight line throughout",
    ],
    tips: [
      "Keep your core engaged throughout the movement",
      "Don't let your hips sag or pike up",
      "Modify by doing knee push-ups if needed",
    ],
    videoId: "IODxDxX7oi4",
  },
  {
    id: "2",
    name: "Dumbbell Bicep Curls",
    category: "Dumbbell",
    musclesWorked: ["Biceps", "Forearms"],
    difficulty: "Beginner",
    duration: "45 seconds",
    steps: [
      "Stand with feet hip-width apart, holding dumbbells at your sides",
      "Keep elbows close to your torso",
      "Curl weights up by contracting biceps",
      "Slowly lower back to starting position",
    ],
    tips: [
      "Don't swing the weights - use controlled movements",
      "Keep your wrists straight",
      "Focus on the squeeze at the top of the movement",
    ],
    videoId: "ykJmrZ5v0Oo",
  },
  {
    id: "3",
    name: "Resistance Band Rows",
    category: "Resistance Band",
    musclesWorked: ["Back", "Rear Delts", "Biceps"],
    difficulty: "Intermediate",
    duration: "60 seconds",
    steps: [
      "Anchor band at chest height",
      "Hold handles with arms extended forward",
      "Pull handles back, squeezing shoulder blades together",
      "Slowly return to starting position",
    ],
    tips: [
      "Keep your chest up and shoulders back",
      "Focus on pulling with your back muscles, not just arms",
      "Control the return movement",
    ],
    videoId: "GYHbu2LRqD0",
  },
  {
    id: "4",
    name: "Squats",
    category: "Bodyweight",
    musclesWorked: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
    difficulty: "Beginner",
    duration: "45 seconds",
    steps: [
      "Stand with feet shoulder-width apart",
      "Lower your body as if sitting back into a chair",
      "Keep your chest up and knees behind toes",
      "Push through heels to return to standing",
    ],
    tips: [
      "Keep your weight in your heels",
      "Don't let knees cave inward",
      "Go as low as comfortable while maintaining form",
    ],
    videoId: "YaXPRqUwItQ",
  },
  {
    id: "5",
    name: "Dumbbell Shoulder Press",
    category: "Dumbbell",
    musclesWorked: ["Shoulders", "Triceps", "Upper Chest"],
    difficulty: "Intermediate",
    duration: "50 seconds",
    steps: [
      "Stand or sit with dumbbells at shoulder height",
      "Press weights straight up overhead",
      "Lower back to shoulder height with control",
      "Keep core engaged throughout",
    ],
    tips: [
      "Don't arch your back excessively",
      "Press in a straight line, not forward",
      "Start with lighter weights to master form",
    ],
    videoId: "qEwKCR5JCog",
  },
  {
    id: "6",
    name: "Resistance Band Chest Press",
    category: "Resistance Band",
    musclesWorked: ["Chest", "Shoulders", "Triceps"],
    difficulty: "Beginner",
    duration: "40 seconds",
    steps: [
      "Anchor band behind you at chest height",
      "Hold handles with arms bent at 90 degrees",
      "Press forward until arms are extended",
      "Slowly return to starting position",
    ],
    tips: [
      "Keep your core stable",
      "Don't let the band snap back",
      "Maintain tension throughout the movement",
    ],
    videoId: "CeurOnzlGoQ",
  },
  {
    id: "7",
    name: "Burpees",
    category: "Bodyweight",
    musclesWorked: ["Full Body", "Cardio", "Core"],
    difficulty: "Advanced",
    duration: "30 seconds",
    steps: [
      "Start standing, then squat down and place hands on floor",
      "Jump feet back into plank position",
      "Perform a push-up (optional)",
      "Jump feet back to squat position",
      "Explode up with arms overhead",
    ],
    tips: [
      "Land softly on your feet",
      "Keep core tight throughout",
      "Modify by stepping instead of jumping",
    ],
    videoId: "TU8QYVW0gDU",
  },
  {
    id: "8",
    name: "Deadlifts",
    category: "Dumbbell",
    musclesWorked: ["Hamstrings", "Glutes", "Lower Back", "Core"],
    difficulty: "Intermediate",
    duration: "60 seconds",
    steps: [
      "Stand with feet hip-width apart, holding dumbbells",
      "Hinge at hips, pushing them back",
      "Lower weights while keeping back straight",
      "Drive through heels to return to standing",
    ],
    tips: [
      "Keep the weights close to your body",
      "Don't round your back",
      "Focus on hip hinge movement",
    ],
    videoId: "r4MzxtBKyNE",
  },
  {
    id: "9",
    name: "Mountain Climbers",
    category: "Bodyweight",
    musclesWorked: ["Core", "Shoulders", "Cardio"],
    difficulty: "Intermediate",
    duration: "30 seconds",
    steps: [
      "Start in plank position",
      "Bring right knee toward chest",
      "Quickly switch legs, bringing left knee to chest",
      "Continue alternating at a fast pace",
    ],
    tips: [
      "Keep hips level",
      "Maintain plank position",
      "Land softly on balls of feet",
    ],
    videoId: "nmwgirgXLYM",
  },
  {
    id: "10",
    name: "Plank",
    category: "Bodyweight",
    musclesWorked: ["Core", "Shoulders", "Back"],
    difficulty: "Beginner",
    duration: "30-60 seconds",
    steps: [
      "Start in push-up position",
      "Lower to forearms, keeping body straight",
      "Hold position, engaging core",
      "Breathe normally throughout",
    ],
    tips: [
      "Don't let hips sag or pike up",
      "Keep head in neutral position",
      "Start with shorter holds and build up",
    ],
    videoId: "pSHjTRCQxIw",
  },
  {
    id: "11",
    name: "Lunges",
    category: "Bodyweight",
    musclesWorked: ["Quadriceps", "Glutes", "Hamstrings", "Calves"],
    difficulty: "Beginner",
    duration: "45 seconds",
    steps: [
      "Step forward with one leg",
      "Lower hips until both knees are at 90 degrees",
      "Keep front knee over ankle",
      "Push back to starting position",
    ],
    tips: [
      "Keep torso upright",
      "Don't let front knee go past toes",
      "Alternate legs or do all reps on one side",
    ],
    videoId: "QOVaHwm-Q6U",
  },
  {
    id: "12",
    name: "Kettlebell Swings",
    category: "Kettlebell",
    musclesWorked: ["Glutes", "Hamstrings", "Core", "Shoulders"],
    difficulty: "Intermediate",
    duration: "45 seconds",
    steps: [
      "Stand with feet wider than shoulders, holding kettlebell",
      "Hinge at hips, swinging kettlebell between legs",
      "Drive hips forward explosively",
      "Let kettlebell swing to chest height",
    ],
    tips: [
      "Power comes from hips, not arms",
      "Keep core engaged",
      "Don't squat - focus on hip hinge",
    ],
    videoId: "YSxHifyI6s8",
  },
  {
    id: "13",
    name: "Pull-ups",
    category: "Bodyweight",
    musclesWorked: ["Back", "Biceps", "Shoulders"],
    difficulty: "Advanced",
    duration: "30 seconds",
    steps: [
      "Hang from pull-up bar with overhand grip",
      "Pull body up until chin clears bar",
      "Lower with control to full arm extension",
      "Repeat for desired reps",
    ],
    tips: [
      "Engage core throughout movement",
      "Use full range of motion",
      "Use assistance bands if needed",
    ],
    videoId: "eGo4IYlbE5g",
  },
  {
    id: "14",
    name: "Dips",
    category: "Bodyweight",
    musclesWorked: ["Triceps", "Chest", "Shoulders"],
    difficulty: "Intermediate",
    duration: "30 seconds",
    steps: [
      "Position hands on parallel bars or chair edges",
      "Lower body by bending elbows",
      "Descend until shoulders are below elbows",
      "Push back up to starting position",
    ],
    tips: [
      "Keep elbows close to body",
      "Don't go too low if you feel shoulder strain",
      "Lean slightly forward for chest emphasis",
    ],
    videoId: "2z8JmcrW-As",
  },
  {
    id: "15",
    name: "Russian Twists",
    category: "Bodyweight",
    musclesWorked: ["Core", "Obliques"],
    difficulty: "Beginner",
    duration: "45 seconds",
    steps: [
      "Sit with knees bent, feet slightly off ground",
      "Lean back to create V-shape with torso and thighs",
      "Rotate torso left and right",
      "Keep core engaged throughout",
    ],
    tips: [
      "Keep chest up and shoulders back",
      "Move with control, not momentum",
      "Add weight for increased difficulty",
    ],
    videoId: "wkD8rjkodUI",
  },
  {
    id: "16",
    name: "Box Jumps",
    category: "Plyometric",
    musclesWorked: ["Quadriceps", "Glutes", "Calves", "Core"],
    difficulty: "Intermediate",
    duration: "30 seconds",
    steps: [
      "Stand in front of a sturdy box or platform",
      "Bend knees and swing arms back",
      "Jump explosively onto the box",
      "Land softly with knees bent",
      "Step down carefully",
    ],
    tips: [
      "Start with a lower box height",
      "Focus on landing softly",
      "Step down rather than jumping down",
    ],
    videoId: "hxldG9FX4j4",
  },
  {
    id: "17",
    name: "Battle Ropes",
    category: "Cardio Equipment",
    musclesWorked: ["Arms", "Shoulders", "Core", "Cardio"],
    difficulty: "Advanced",
    duration: "30 seconds",
    steps: [
      "Hold rope ends with both hands",
      "Stand with feet shoulder-width apart",
      "Create waves by moving arms up and down",
      "Maintain steady rhythm",
    ],
    tips: [
      "Keep core engaged",
      "Use whole body, not just arms",
      "Vary wave patterns for different challenges",
    ],
    videoId: "zw0OMi00X5g",
  },
  {
    id: "18",
    name: "Turkish Get-ups",
    category: "Kettlebell",
    musclesWorked: ["Full Body", "Core", "Stability"],
    difficulty: "Advanced",
    duration: "60 seconds",
    steps: [
      "Lie on back holding kettlebell overhead",
      "Roll to side and come to kneeling position",
      "Stand up while keeping weight overhead",
      "Reverse the movement to return to lying",
    ],
    tips: [
      "Start with light weight or no weight",
      "Move slowly and with control",
      "Keep eyes on the weight throughout",
    ],
    videoId: "0bWRPC49-KI",
  },
  {
    id: "19",
    name: "Bear Crawl",
    category: "Bodyweight",
    musclesWorked: ["Full Body", "Core", "Shoulders"],
    difficulty: "Intermediate",
    duration: "30 seconds",
    steps: [
      "Start on hands and knees",
      "Lift knees slightly off ground",
      "Crawl forward moving opposite hand and foot",
      "Keep hips low and core engaged",
    ],
    tips: [
      "Keep knees close to ground",
      "Move slowly and controlled",
      "Keep core tight throughout",
    ],
    videoId: "Ee1BQNI6zN4",
  },
  {
    id: "20",
    name: "Wall Sit",
    category: "Bodyweight",
    musclesWorked: ["Quadriceps", "Glutes", "Core"],
    difficulty: "Beginner",
    duration: "30-60 seconds",
    steps: [
      "Stand with back against wall",
      "Slide down until thighs are parallel to floor",
      "Keep knees at 90 degrees",
      "Hold position",
    ],
    tips: [
      "Keep back flat against wall",
      "Don't let knees go past toes",
      "Breathe normally during hold",
    ],
    videoId: "y-wV4Venusw",
  },
];

const categories = [
  "All",
  "Bodyweight",
  "Dumbbell",
  "Resistance Band",
  "Kettlebell",
  "Plyometric",
  "Cardio Equipment",
];

export default function ExerciseLibrary() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const filteredExercises =
    selectedCategory === "All"
      ? exercises
      : exercises.filter((exercise) => exercise.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "Intermediate":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "Advanced":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const toggleExercise = (exerciseId: string) => {
    setExpandedExercise(expandedExercise === exerciseId ? null : exerciseId);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Exercise Library
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover exercises with detailed instructions, tips, and video
          demonstrations
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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

      {/* Exercise Grid */}
      <div className="grid gap-6">
        {filteredExercises.map((exercise) => {
          const isExpanded = expandedExercise === exercise.id;

          return (
            <div
              key={exercise.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              {/* Exercise Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => toggleExercise(exercise.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {exercise.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                          exercise.difficulty
                        )}`}
                      >
                        {exercise.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{exercise.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{exercise.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{exercise.musclesWorked.join(", ")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <div className="p-6 grid md:grid-cols-2 gap-6">
                    {/* Left Column - Instructions */}
                    <div className="space-y-6">
                      {/* Steps */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          How to Perform
                        </h4>
                        <ol className="space-y-2">
                          {exercise.steps.map((step, index) => (
                            <li key={index} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {step}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Tips */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Pro Tips
                        </h4>
                        <ul className="space-y-2">
                          {exercise.tips.map((tip, index) => (
                            <li key={index} className="flex gap-3">
                              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {tip}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right Column - Video */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Video Demonstration
                      </h4>
                      {exercise.videoId ? (
                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${exercise.videoId}`}
                            title={`${exercise.name} demonstration`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          ></iframe>
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <div className="text-center text-gray-500 dark:text-gray-400">
                            <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Video coming soon</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No exercises found in this category</p>
            <p className="text-sm">Try selecting a different category</p>
          </div>
        </div>
      )}
    </div>
  );
}
