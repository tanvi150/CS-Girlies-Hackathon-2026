const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const openrouter = require('../utils/openrouter');

const db = new sqlite3.Database('./database.db');

// Helper to get or create user
function getOrCreateUser(sessionToken, callback) {
  db.get(
    'SELECT user_id FROM users WHERE session_token = ?',
    [sessionToken],
    (err, user) => {
      if (err) return callback(err);
      if (user) return callback(null, user.user_id);

      db.run(
        'INSERT INTO users (session_token) VALUES (?)',
        [sessionToken],
        function (err) {
          if (err) return callback(err);
          callback(null, this.lastID);
        }
      );
    }
  );
}

// Helper to detect mood and category from text
function detectMoodAndCategory(text) {
  const moodKeywords = {
    'Uplifting': [
      'hopeful', 'optimistic', 'positive', 'excited', 'happy',
      'joyful', 'bright', 'grateful', 'thankful', 'blessed',
      'content', 'cheerful', 'delighted', 'thrilled', 'enthusiastic',
      'motivated', 'inspired', 'encouraged', 'relieved', 'proud',
      'good', 'great', 'amazing', 'wonderful', 'looking forward',
      'excited for', 'feeling good'
    ],

    'Playful': [
      'playful', 'fun', 'silly', 'cheerful', 'lighthearted',
      'amused', 'goofy', 'funny', 'humorous', 'laughing',
      'laugh', 'joking', 'joke', 'mischievous', 'bouncy',
      'quirky', 'excited', 'entertained', 'giddy', 'whimsical'
    ],

    'Reflective': [
      'contemplative', 'thoughtful', 'reflective', 'pensive',
      'deep', 'quiet', 'introspective', 'thinking', 'thinking about',
      'wondering', 'curious', 'nostalgic', 'remembering',
      'reminiscing', 'uncertain', 'unsure', 'confused',
      'questioning', 'processing', 'pondering', 'self-aware'
    ],

    'Bold': [
      'bold', 'confident', 'determined', 'ambitious', 'driven',
      'fearless', 'strong', 'brave', 'courageous', 'motivated',
      'focused', 'ready', 'powerful', 'capable', 'competitive',
      'decisive', 'assertive', 'adventurous', 'daring',
      'unstoppable', 'fired up', 'ready to', 'going for it'
    ],

    'Calm': [
      'calm', 'peaceful', 'relaxed', 'serene', 'tranquil',
      'grounded', 'centered', 'at ease', 'chill', 'content',
      'comfortable', 'settled', 'still', 'rested', 'restful',
      'unbothered', 'peace', 'relaxed', 'taking it easy'
    ],

    'Anxious': [
      'anxious', 'anxiety', 'nervous', 'worried', 'worry',
      'stressed', 'stress', 'overthinking', 'overthink',
      'panicked', 'panic', 'afraid', 'scared', 'fearful',
      'uneasy', 'restless', 'tense', 'overwhelmed',
      'apprehensive', 'insecure', 'dread', 'dreading',
      'freaking out', 'under pressure'
    ],

    'Sad': [
      'sad', 'unhappy', 'down', 'upset', 'hurt', 'heartbroken',
      'lonely', 'alone', 'disappointed', 'devastated',
      'miserable', 'crying', 'tears', 'depressed', 'grieving',
      'loss', 'miss', 'missing', 'hopeless', 'low',
      'not okay', 'not okay today', 'feeling down'
    ]
  };

  const categoryKeywords = {
    'Career': [
      'career', 'work', 'job', 'business', 'professional',
      'interview', 'promotion', 'boss', 'salary', 'project',
      'hackathon', 'presentation', 'presenting', 'pitch',
      'startup', 'internship', 'intern', 'colleague', 'coworker',
      'office', 'workplace', 'meeting', 'deadline', 'client',
      'customer', 'manager', 'team', 'resume', 'cv',
      'application', 'hiring', 'employee', 'employment',
      'freelance', 'entrepreneur', 'competition', 'judges',
      'demo', 'coding', 'code', 'developer', 'career goals'
    ],

    'Relationships': [
      'relationship', 'love', 'partner', 'dating', 'date',
      'marriage', 'married', 'boyfriend', 'girlfriend',
      'friend', 'friends', 'family', 'parent', 'parents',
      'mother', 'mom', 'father', 'dad', 'sibling', 'brother',
      'sister', 'connection', 'heart', 'romance', 'romantic',
      'crush', 'breakup', 'ex', 'friendship', 'best friend',
      'roommate', 'husband', 'wife', 'children', 'child',
      'trust', 'communication', 'argument', 'conflict',
      'apology', 'forgive', 'forgiveness'
    ],

    'Wellbeing': [
      'wellness', 'health', 'healthy', 'mind', 'body',
      'mental', 'mental health', 'peace', 'balance', 'calm',
      'stress', 'stressed', 'anxiety', 'anxious', 'worry',
      'worried', 'overthinking', 'sleep', 'tired', 'exhausted',
      'rest', 'relax', 'relaxing', 'self-care', 'self care',
      'exercise', 'workout', 'fitness', 'food', 'eating',
      'burnout', 'overwhelmed', 'breathing', 'meditation',
      'mindfulness', 'therapy', 'wellbeing', 'well-being',
      'energy', 'routine'
    ],

    'Wisdom': [
      'growth', 'develop', 'development', 'improve', 'improvement',
      'learn', 'learning', 'study', 'studying', 'school',
      'college', 'university', 'class', 'lesson', 'exam',
      'exams', 'test', 'testing', 'quiz', 'assignment',
      'homework', 'grade', 'grades', 'results', 'education',
      'knowledge', 'wisdom', 'skill', 'skills', 'practice',
      'practice', 'mistake', 'failure', 'lesson learned',
      'experience', 'evolve', 'evolving', 'change', 'changing',
      'better', 'progress', 'goal', 'goals', 'habit', 'habits',
      'future', 'decision', 'decisions', 'challenge'
    ],

    'Wealth': [
      'wealth', 'money', 'finance', 'financial', 'saving',
      'savings', 'investment', 'invest', 'investing',
      'budget', 'budgeting', 'salary', 'income', 'expenses',
      'spending', 'debt', 'loan', 'bank', 'banking',
      'business', 'profit', 'loss', 'rich', 'afford',
      'affording', 'price', 'cost', 'rent', 'mortgage',
      'financial goals', 'money goals', 'abundance', 'prosperity'
    ],

    'Humor': [
      'funny', 'humor', 'humour', 'laugh', 'laughing',
      'joke', 'jokes', 'comedy', 'silly', 'playful',
      'goofy', 'meme', 'memes', 'entertainment', 'fun',
      'lighthearted', 'ridiculous', 'hilarious', 'amusing',
      'amused', 'sarcastic', 'sarcasm', 'prank', 'pranking'
    ]
  };

  const lowerText = text.toLowerCase();

  // Detect mood
  let detectedMood = 'Uplifting';

  const moodPriority = [
    'Anxious',
    'Sad',
    'Bold',
    'Reflective',
    'Calm',
    'Playful',
    'Uplifting'
  ];

  for (const mood of moodPriority) {
    const keywords = moodKeywords[mood];

    if (keywords.some(word => lowerText.includes(word))) {
      detectedMood = mood;
      break;
    }
  }

  // Detect category by number of keyword matches
  let detectedCategory = 'General';
  let highestCategoryScore = 0;

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const score = keywords.filter(word => lowerText.includes(word)).length;

    if (score > highestCategoryScore) {
      highestCategoryScore = score;
      detectedCategory = category;
    }
  }

  return {
    mood: detectedMood,
    category: detectedCategory
  };
}

async function generateFortuneAndChallengeAI(userMessage, mood, category) {
  const prompt = `
You are creating a fortune-cookie experience that should feel personal, memorable, and a little unexpected.

User's message:
"${userMessage}"

The user's primary mood is:
${mood}

The user's primary category is:
${category}

The fortune and challenge MUST feel relevant to this category while still responding naturally to the user's exact message.

Generate:
1. One short fortune.
2. One tiny practical challenge.

Fortune rules:
- Exactly one sentence.
- 8 to 20 words.
- Make it specific to the user's situation.
- Use concrete details from the user's message when appropriate.
- Sound natural, witty, warm, or pleasantly surprising.
- Make it feel like someone genuinely understood what the user said.
- Be hopeful without being overly motivational.
- Avoid generic motivational phrases and clichés.
- Avoid phrases like "you will shine", "believe in yourself", "great things are coming", "your journey", or "everything happens for a reason".
- Do not give advice or instructions.
- Do not mention "fortune cookie".
- Do not use quotation marks.

Challenge rules:
- Exactly ONE challenge.
- Directly related to the user's situation.
- Be specific rather than generic.
- Encouraging and practical.
- Possible to complete today.
- Takes 5 to 15 minutes.
- Make it something the person can actually do, not just think about.
- Do not be cheesy or overly motivational.
- Do not repeat the fortune.
- Do not use quotation marks.

Category guidance:
- Career: work, projects, interviews, presentations, professional goals, colleagues, opportunities.
- Relationships: friends, family, dating, love, communication, connection.
- Wellbeing: stress, rest, emotions, routines, self-care, mental balance.
- Wisdom: exams, learning, mistakes, growth, decisions, personal development.
- Wealth: money, saving, spending, income, financial goals.
- Humor: funny situations, jokes, silliness, playful moments.
- General: respond naturally without forcing a theme.

Return ONLY valid JSON in exactly this format:
{
  "fortune": "fortune text",
  "challenge": "challenge text"
}
`;

  const response = await openrouter.chat.completions.create({
    model: 'openai/gpt-oss-20b:free',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.8
  });

  const choice = response?.choices?.[0];

  if (!choice) {
    console.error('OpenRouter returned no choices:', response);
    throw new Error('OpenRouter returned no choices');
  }

  const content = choice.message?.content?.trim();

  if (!content) {
    console.error('OpenRouter returned empty content:', choice);
    throw new Error('OpenRouter returned empty content');
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse AI JSON:', content);
    throw new Error('AI returned invalid JSON');
  }
}

router.get('/', (req, res) => {
  let sessionToken = req.cookies?.session_token;
  if (!sessionToken) {
    sessionToken = crypto.randomBytes(32).toString('hex');
    res.cookie('session_token', sessionToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true
    });
  }

  res.render('index', {
    title: 'Fortune Cookie',
    error: null
  });
});

router.post('/api/fortune', async (req, res) => {
  const { mood } = req.body;

  if (!mood) {
    return res.status(400).json({ error: 'Please share how you are feeling' });
  }

  let sessionToken = req.cookies?.session_token;
  if (!sessionToken) {
    sessionToken = crypto.randomBytes(32).toString('hex');
    res.cookie('session_token', sessionToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true
    });
  }

  try {
    getOrCreateUser(sessionToken, async (err, userId) => {
      if (err) {
        console.error('User error:', err);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      // Detect mood and category with hardcoded keywords
      let detected = detectMoodAndCategory(mood);

      // Try to find a matching cookie
      db.get(
        `SELECT c.*, cat.category_name, m.mood_name 
         FROM cookies c
         JOIN categories cat ON c.category_id = cat.category_id
         JOIN moods m ON c.mood_id = m.mood_id
         WHERE (cat.category_name = ? OR ? = 'General')
         AND m.mood_name = ?
         AND c.is_active = 1
         ORDER BY RANDOM() LIMIT 1`,
        [detected.category, detected.category, detected.mood],
        (err, cookie) => {
          if (err || !cookie) {
            // Fallback: get any random cookie
            db.get(
              `SELECT c.*, cat.category_name, m.mood_name 
               FROM cookies c
               JOIN categories cat ON c.category_id = cat.category_id
               JOIN moods m ON c.mood_id = m.mood_id
               WHERE c.is_active = 1
               ORDER BY RANDOM() LIMIT 1`,
              (err2, fallbackCookie) => {
                if (err2 || !fallbackCookie) {
                  return res.status(500).json({ error: 'No cookies available' });
                }
                return sendFortuneResponse(fallbackCookie, userId, mood, detected, res);
              }
            );
            return;
          }
          sendFortuneResponse(cookie, userId, mood, detected, res);
        }
      );
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate fortune' });
  }
});

async function sendFortuneResponse(cookie, userId, userMessage, detected, res) {
  const luckyNumber = Math.floor(
    Math.random() * (cookie.max_lucky_number - cookie.min_lucky_number + 1)
  ) + cookie.min_lucky_number;

  let fortune;
  let challenge;

  try {
    const aiResult = await generateFortuneAndChallengeAI(
      userMessage,
      detected.mood,
      detected.category
    );

    fortune = aiResult.fortune;
    challenge = aiResult.challenge;

  } catch (error) {
    console.error('AI generation failed:', error.message);

    fortune = cookie.cookie_message;
    challenge = cookie.challenge_text;
  }

  db.run(
    `INSERT INTO cookie_openings (cookie_id, user_id, real_lucky_number) 
     VALUES (?, ?, ?)`,
    [cookie.cookie_id, userId, luckyNumber],
    function (err) {
      if (err) console.error('Failed to record opening:', err);
    }
  );

  res.json({
    fortune: fortune,
    luckyNumber: luckyNumber,
    challenge: challenge,
    mood: detected.mood,
    category: detected.category,
    cookieMood: cookie.mood_name,
    cookieId: cookie.cookie_id,
    timestamp: new Date().toISOString(),
    id: Date.now()
  });
}

module.exports = router;