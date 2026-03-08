# 🗺️ Problem Map: Civic-Tech Ecosystem

**Empowering Citizens to Build Better Cities.**

Problem Map is a modern, high-performance civic-tech platform designed to bridge the gap between citizens and city infrastructure improvements. Leveraging real-time data and geospatial visualization, it allows community members to report, verify, and track the resolution of local issues.

---

## 🚀 Key Features

### 📡 Real-Time Geospatial Explorer
- **Interactive Map**: Visualize city-wide issues with dynamic markers powered by Supabase Realtime.
- **Live Filtering**: Sort reports by category (Potholes, Lighting, Waste, etc.) or resolution status.
- **Address Intelligence**: Precise location detection and address mapping.

### 📝 Advanced Reporting Engine
- **Multi-Step Flow**: Intuitive report submission process with severity assessment.
- **Evidence Management**: Direct image uploads to Supabase Storage with automatic previews.
- **Verification Workflow**: A community-driven system where citizens can "Confirm" reports to prioritize action.

### 🏆 Gamified Civic Impact
- **Impact Profiles**: Personalized dashboards showing individual contribution history and badges.
- **Hall of Impact**: A live leaderboard recognizing the most active civic champions.
- **Reputation System**: Earn points for reporting, verifying, and getting issues resolved.

### 💬 Community Engagement
- **Discussion Hubs**: Real-time comment threads on every reported issue.
- **Activity Feed**: A "Community Pulse" showing live updates and recently resolved "Civic Wins."

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/) (Auth, Database, Storage, Realtime)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js 18+ 
- A Supabase Project

### 2. Installation
```bash
# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Schema
Ensure your Supabase project has the following tables:
- `profiles`: User information and reputation points.
- `problems`: Infrastructure report details.
- `verifications`: Community confirmation logs.
- `comments`: Discussion records.
- `notifications`: System/Update alerts.

### 5. Run Locally
```bash
npm run dev
```

---

## 📂 Project Structure

- `/app`: Next.js App Router pages (Dashboard, Auth, Reporting, Leaderboard).
- `/components`: Modular UI components (Landing, Dashboard, UI Primitives).
- `/lib`: Supabase client and utility functions.
- `/styles`: Global CSS with custom Tailwind v4 theme variables.
- `/types`: TypeScript definitions for the database schema.

---

## 🤝 Contributing
Contributions are welcome! If you have ideas for new features or UI enhancements, feel free to open a PR.

## 📄 License
This project is licensed under the MIT License.
