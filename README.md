# AlgoRush — Personal DSA Challenge Arena

> **Learn the pattern. Beat the clock.**

**AlgoRush** is a responsive, local-first web application designed for mastering Data Structures and Algorithms under realistic timed conditions. After learning a DSA topic in Java (or any programming language), log your studied topics and problems, spin an interactive roulette wheel to pick a random challenge, set a countdown limit, and conquer the problem before time expires.

---

## ⚡ Key Highlights

- 🎯 **Interactive Spin Wheel**: Decelerates smoothly with realistic physics and stops accurately on a genuinely random eligible problem.
- ⏱️ **Timestamp-Accurate Countdown Timer**: Uses `Date.now()` timestamp differentials rather than naive interval ticks. Remains 100% accurate through background tab switching and survives browser page reloads.
- 💾 **Zero-Backend Local-First Persistence**: All topics, problem banks, challenge logs, and preferences persist in `localStorage`. Includes schema versioning, corrupt-data recovery, JSON backup export, and JSON import.
- 📊 **Real Dashboard Analytics**: Tracks consecutive daily solving streaks, 7-day consistency breakdowns, and difficulty mastery percentages computed directly from your challenge history.
- 🎨 **Futuristic Developer UI**: Crafted with a dark cybernetic aesthetic (`#0B1020`, `#151C30`, `#1D2740`, `#8B5CF6`, `#22D3EE`), glowing circular SVG timers, and accessible contrast.
- 🔔 **Zero-Asset Audio Synthesis**: Utilizes the browser's native Web Audio API for timer expiration beeps and victory chimes without external audio file dependencies.

---

## 🛠️ Technology Stack

- **React 19** with **Vite 8**
- **Tailwind CSS 3.4** for responsive cyber-dark styling
- **Lucide React** for modern developer iconography
- **Canvas Confetti** for challenge celebration
- **Vitest** with `@testing-library/react` and `jsdom` for unit and logic testing
- **Browser localStorage** with schema migration

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js (v18 or higher recommended; developed and tested on Node v24)
- npm

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd AlgoRush
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run Test Suite
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```
Generates optimized static assets in the `dist/` directory ready for any static web host.

---

## 🧩 Architectural Design

The application follows a clean modular component architecture separating data persistence, selection algorithms, timer math, and presentation:

```
src/
├── components/
│   ├── common/
│   │   ├── ConfirmDialog.jsx      # Reusable confirmation dialog for destructive actions
│   │   ├── DifficultyBadge.jsx    # Easy (green), Medium (amber), Hard (rose)
│   │   ├── Modal.jsx              # Accessible modal wrapper with Escape key listener
│   │   └── Toast.jsx              # Floating auto-dismiss notification toast
│   ├── dashboard/
│   │   ├── ChallengeControls.jsx  # Solved, Failed, Skip, Abandon, & Solve Link
│   │   ├── ChallengeResultModal.jsx# Time analysis, debrief notes, revision flag & confetti
│   │   ├── ChallengeTimer.jsx     # SVG circular progress ring, preset & custom durations
│   │   ├── Dashboard.jsx          # Primary 2-column arena view
│   │   ├── SelectedProblemCard.jsx# Problem metadata, tags, notes preview & links
│   │   ├── SpinWheel.jsx          # SVG wheel with calculated rotation alignment
│   │   ├── TopicModal.jsx         # Add/edit topic with learning status
│   │   └── TopicSelector.jsx      # Topic chips with problem counters & multi-select
│   ├── history/
│   │   └── ChallengeHistory.jsx   # Filterable chronological log of all attempts
│   ├── layout/
│   │   ├── AppLayout.jsx          # Shell with header, toast container & footer
│   │   └── Header.jsx             # Brand logo, streak counter, total solved & navigation
│   ├── problems/
│   │   ├── ProblemFormModal.jsx   # Add/edit problem with multi-add flow & validation
│   │   └── ProblemLibrary.jsx     # Search, multi-topic filter, revision filter & card grid
│   ├── settings/
│   │   └── SettingsModal.jsx      # Audio preview, default duration, export/import & reset
│   └── stats/
│       └── StatisticsView.jsx     # Metric cards, 7-day consistency chart & difficulty progress
├── context/
│   ├── AppContext.js              # React Context declaration & re-exports
│   ├── AppProvider.jsx            # State manager syncing localStorage & CRUD helpers
│   ├── index.js                   # Unified context export
│   └── useApp.js                  # Custom consumer hook
├── data/
│   ├── initialProblems.json       # Seed problem bank with real LeetCode links
│   └── initialTopics.json         # Seed DSA topics with pattern notes & learning status
├── hooks/
│   └── useChallengeTimer.js       # Timestamp-accurate countdown hook with tab visibility sync
├── test/
│   ├── selection.test.js          # Tests for filtering, session avoidance & wheel angles
│   ├── setup.js                   # Vitest setup
│   ├── statistics.test.js         # Tests for daily streak, weekly graph & stats
│   ├── storage.test.js            # Tests for schema validation, import & migration
│   └── timer.test.js              # Tests for elapsed time math, pause/resume & expiration
└── utils/
    ├── audio.js                   # Web Audio API synthesizers for alert and success tones
    ├── selection.js               # Random problem selection & wheel geometry math
    ├── statistics.js              # Dynamic streak calculation & date normalization
    └── storage.js                 # Schema versioning, corruption fallback & JSON import/export
```

---

## 🔄 Challenge Workflow

1. **Open the Arena**: The dashboard presents your learned DSA topics on the left and the problem card & timer on the right.
2. **Filter Topics & Difficulty**: Check off the topics you want to practice and choose an optional difficulty filter (`All`, `Easy`, `Medium`, `Hard`).
3. **Spin the Wheel**: Click **SPIN**. The wheel rotates and decelerates smoothly, stopping directly on an eligible candidate. Problems already solved during your current session are avoided when alternatives exist.
4. **Choose Duration**: Select presets (**15m**, **30m**, **45m**, **60m**) or enter a custom duration in minutes.
5. **Start Countdown**: Hit **Start Challenge**. Open the problem on LeetCode or solve it in your Java IDE.
6. **Active Alerts**: Visual state changes at **5 minutes** (warning glow) and **1 minute** (critical warning pulse). If time expires, a dual-tone alert chime sounds.
7. **Record Result**: Choose **Mark Solved**, **Mark Failed**, or **Skip**.
8. **Debrief**: In the result modal, review your time performance, jot down edge-case notes, toggle the spaced repetition revision flag, and click **Save & Spin Another**.

---

## 💾 Storage & Data Persistence

- **Key**: `algorush_state_v1` in `window.localStorage`.
- **First Launch**: Automatically seeds with 12 core DSA topics and 23 canonical problems (Two Sum, 3Sum, Binary Search, Longest Substring, etc.). Once initialized, seed data never overrides user edits.
- **Timer Persistence**: Active and paused timers are recorded with timestamps (`sessionStartTime`, `accumulatedElapsed`, `allocatedSeconds`). Refreshing the browser or switching tabs restores the exact remaining time without drift.
- **Data Export & Import**: Export full backups as formatted JSON files (`algorush-backup-YYYY-MM-DD.json`). The importer strictly validates schema versions, array structures, and required fields before writing.
- **Factory Reset**: Wipes local storage and restores the clean seed dataset after an explicit confirmation dialog.

---

## 🧪 Testing

AlgoRush includes unit tests for the core business logic:
- `selection.test.js`: Disjunctive topic matching, difficulty and text search filters, session-solved candidate avoidance, and wheel angular alignment.
- `statistics.test.js`: Consecutive-day streak calculation, gap tolerance for yesterday's streak, 7-day weekly activity grouping, and completion rates.
- `storage.test.js`: JSON schema validator, malformed payload rejections, and state migration.
- `timer.test.js`: Timestamp calculation accuracy, non-negative bounds clamping, and expiration state transitions.

Run the test suite anytime:
```bash
npm test
```

---

## 📄 License

MIT. Built for personal Data Structures and Algorithms mastery.
