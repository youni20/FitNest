const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function initializeDatabase() {
  try {
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('Database schema created successfully');

    // Insert sample data
    const sampleData = [
      {
        title: 'Morning Energy Boost',
        description: 'Start your day with this energizing 15-minute routine that combines cardio and strength training to wake up your body and mind.',
        difficulty: 'Beginner',
        duration: '15 min',
        category: 'Full Body',
        exercises: [
          { name: 'Jumping Jacks', duration: '30 seconds', rest: '10 seconds' },
          { name: 'Push-ups', duration: '30 seconds', rest: '15 seconds' },
          { name: 'Mountain Climbers', duration: '30 seconds', rest: '10 seconds' },
          { name: 'Squats', duration: '30 seconds', rest: '15 seconds' },
          { name: 'Plank', duration: '30 seconds', rest: '10 seconds' },
        ],
        tags: ['Morning', 'Energy', 'Quick']
      },
      {
        title: 'Full Body Strength',
        description: 'A comprehensive strength training routine targeting all major muscle groups. Perfect for building muscle and improving overall fitness.',
        difficulty: 'Intermediate',
        duration: '45 min',
        category: 'Strength',
        exercises: [
          { name: 'Deadlifts', duration: '45 seconds', rest: '30 seconds' },
          { name: 'Bench Press', duration: '45 seconds', rest: '30 seconds' },
          { name: 'Squats', duration: '45 seconds', rest: '30 seconds' },
          { name: 'Pull-ups', duration: '45 seconds', rest: '30 seconds' },
          { name: 'Overhead Press', duration: '45 seconds', rest: '30 seconds' },
        ],
        tags: ['Strength', 'Muscle', 'Full Body']
      },
      {
        title: 'HIIT Cardio Blast',
        description: 'High-intensity interval training routine to burn calories and improve cardiovascular fitness. Get ready to sweat!',
        difficulty: 'Advanced',
        duration: '30 min',
        category: 'Cardio',
        exercises: [
          { name: 'Burpees', duration: '40 seconds', rest: '20 seconds' },
          { name: 'High Knees', duration: '40 seconds', rest: '20 seconds' },
          { name: 'Jump Rope', duration: '40 seconds', rest: '20 seconds' },
          { name: 'Mountain Climbers', duration: '40 seconds', rest: '20 seconds' },
          { name: 'Jump Squats', duration: '40 seconds', rest: '20 seconds' },
        ],
        tags: ['Cardio', 'HIIT', 'Fat Burn']
      }
    ];

    // Insert sample routines
    for (const routine of sampleData) {
      // Insert routine
      const routineResult = await pool.query(
        `INSERT INTO routines (
          title, description, difficulty, duration, category, user_id
        ) VALUES ($1, $2, $3, $4, $5, 1) RETURNING id`,
        [routine.title, routine.description, routine.difficulty, routine.duration, routine.category]
      );

      const routineId = routineResult.rows[0].id;

      // Insert exercises
      for (let i = 0; i < routine.exercises.length; i++) {
        const exercise = routine.exercises[i];
        await pool.query(
          `INSERT INTO exercises (
            routine_id, name, duration, rest, position
          ) VALUES ($1, $2, $3, $4, $5)`,
          [routineId, exercise.name, exercise.duration, exercise.rest, i]
        );
      }

      // Insert tags
      for (const tagName of routine.tags) {
        // Insert tag if it doesn't exist
        await pool.query(
          'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
          [tagName]
        );

        // Get tag ID
        const tagResult = await pool.query(
          'SELECT id FROM tags WHERE name = $1',
          [tagName]
        );

        // Create routine-tag relationship
        await pool.query(
          'INSERT INTO routine_tags (routine_id, tag_id) VALUES ($1, $2)',
          [routineId, tagResult.rows[0].id]
        );
      }
    }

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the initialization
initializeDatabase().catch(console.error); 