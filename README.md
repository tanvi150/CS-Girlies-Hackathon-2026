# 🍪 Luckily — Your Pocket Fortune Cookie

**Luckily** is an AI-powered digital fortune cookie designed to turn everyday thoughts, worries, and moods into small moments of encouragement.

Instead of giving you a random fortune, Luckily lets you share what's on your mind. AI understands your mood and generates a personalized fortune and a small actionable challenge — giving you something positive to take away from the moment.

## 💡 The Idea

Sometimes you don't need a big solution. You just need a little encouragement.

Luckily brings the experience of opening a real fortune cookie into a digital, interactive experience. You type how you're feeling, crack open the cookie, and receive a fortune created specifically for you.

> **A small moment of positivity can change your day.**

## ✨ Features

* **Share your mood** — Tell Luckily what's on your mind.
* **AI-powered fortunes** — Receive a personalized fortune based on your mood.
* **Interactive 3D cookie** — Crack open the cookie to reveal your fortune.
* **Lucky challenges** — Get a small, actionable challenge with your fortune.
* **Fortune Jar** — Save fortunes you want to remember.
* **Favorites** — Keep track of your favorite fortunes.
* **Daily Fortune** — Get a new fortune to start your day.
* **Share** — Share your fortune with others.
* **Responsive design** — Works across desktop and mobile devices.

## 🤖 How AI Is Used

Luckily uses the **OpenRouter API** to generate personalized fortunes.

When you describe how you're feeling, the application uses AI to:

1. Understand the mood behind your message.
2. Identify a relevant category, such as career, relationships, or personal growth.
3. Generate a unique and meaningful fortune.
4. Create a small, practical challenge related to the fortune.

### ⏳ Fortune Loading Time

Because each fortune is generated using an external AI API, **fortune generation may take a few minutes**.

Please be patient while your fortune is being generated. **Do not refresh the page or submit the request multiple times**, as this may interrupt the process or create duplicate requests.

Once the AI finishes generating your fortune, the cookie will reveal your personalized message and lucky challenge.

## 🎮 The Experience

The core experience is designed to feel like opening a real fortune cookie:

**Share your mood → Crack the cookie → Discover your fortune → Take your lucky challenge**

The interactive cookie animation, particles, dark theme, and gold accents are designed to make the experience feel playful while keeping the focus on the message.

## 🛠️ Built With

* **Node.js + Express** — Backend
* **EJS** — Server-side rendered UI
* **Vanilla JavaScript + CSS** — Frontend interactions and animations
* **SQLite** — Database
* **OpenRouter API** — AI fortune generation
* **CSS 3D Transforms + SVG** — Cookie animations and visuals

## 🚀 Run Locally

### Requirements

* Node.js 14+
* npm
* OpenRouter API key

### Installation

```bash
git clone <your-repo-url>
cd fortune-cookie
npm install
```

Create a `.env` file:

```env
OPENROUTER_API_KEY=your_api_key_here
```

Initialize the database:

```bash
npm run build-db
```

Start the application:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

## 📁 Project Structure

```text
fortune-cookie/
├── index.js
├── package.json
├── db_schema.sql
├── routes/
│   ├── fortune.js
│   └── history.js
├── utils/
│   └── openrouter.js
├── views/
│   ├── index.ejs
│   ├── fortune.ejs
│   ├── history.ejs
│   └── partials/
└── public/
    ├── style.css
    └── main.js
```

## 🏆 Happiness Hackathon

Luckily was created for the **Happiness Hackathon** with one simple idea:

> **Technology doesn't always have to solve a huge problem. Sometimes it can simply make someone feel a little better.** 🍪✨

## Our Devpost

Check out our project on Devpost:

Made with ❤️, by Team JAT
