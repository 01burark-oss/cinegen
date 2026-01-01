<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1sISwQf_i1q-s0jhjwpa_mKB-4mZb0QBL

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory and add your API keys:
   ```bash
   # Copy the example file
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and add your API keys:
   ```
   VITE_API_KEY=your_gemini_api_key_here
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```
   
   - Get your Gemini API key from: https://makersuite.google.com/app/apikey
   - Get your TMDB API key from: https://www.themoviedb.org/settings/api

3. Run the app:
   ```bash
   npm run dev
   ```
