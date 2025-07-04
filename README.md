# The Atelier Project

A luxury, mystical perfume experience where users solve a riddle to enter, then take a psychological quiz to be matched with a unique fragrance.

## Getting Started

### 1. Frontend (Static HTML)
- Open `index.html` in your browser to view the Riddle Gate landing page.
- The page will attempt to POST to `/api/riddle` for riddle validation.

### 2. Backend (Node.js/Express)

#### Setup
1. Navigate to the `server` directory:
   ```sh
   cd server
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the backend server:
   ```sh
   npm run dev
   # or
   npm start
   ```
   The server will run on port 3001 by default.

#### Riddle Validation Endpoint
- **POST** `/api/riddle`
- Body: `{ "answer": "your answer here" }`
- Returns 200 if correct ("echo"), 403 if incorrect.

### 3. Development Notes
- The frontend expects the backend to be available at the same origin or proxied.
- For local development, you may need to use a tool like [live-server](https://www.npmjs.com/package/live-server) or set up a proxy.
- Future steps: Add quiz flow, AI integration, and fragrance matching.

---

**Built with love for magical, luxury experiences.** 