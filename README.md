# Meow Namester

Meow Namester is a web application that helps you pick the perfect cat name through a tournament style voting system. It is built with **React 19** and uses **Supabase** for data storage and authentication.

## Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/meow-namester-react.git
   cd meow-namester-react
   ```
2. Install dependencies

   ```bash
   npm install
   ```
3. Create an `.env` file in the project root with your Supabase credentials:

   ```env
   REACT_APP_SUPABASE_URL=your-supabase-url
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Start the development server

   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`.

## Usage

- Visit the site and log in with a name to save your results.
- Select several cat names to enter into the tournament.
- Vote in the head‑to‑head matchups until a winner emerges.
- View your results and statistics in the profile section.

## Requirements

- Node.js 18 or newer is recommended.
- The following environment variables are required:
  - `REACT_APP_SUPABASE_URL`
  - `REACT_APP_SUPABASE_ANON_KEY`

If additional packages are missing, run `npm install` to ensure all dependencies from `package.json` are installed.
