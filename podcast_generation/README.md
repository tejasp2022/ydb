# Podcast Generation API

A serverless API for podcast generation that connects to Supabase for data persistence and can be deployed on Vercel.

## Setup Instructions

### Prerequisites

- Supabase account and project
- Vercel account
- Node.js and npm/yarn for frontend development
- Python 3.9+ for local development

### Environment Setup

1. Copy the `.env.local` file and fill in your Supabase credentials:

```
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_KEY=[YOUR-SUPABASE-API-KEY]
SUPABASE_POSTGRES_URL=postgresql://postgres:[PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

3. Initialize the database:

```bash
python init_db.py
```

### Local Development

To run the API locally:

```bash
uvicorn main:app --reload
```

### Troubleshooting Database Connection Issues

If you encounter database connection errors (like DNS resolution issues), you can:

1. Verify your Supabase credentials in the `.env.local` file
2. Ensure the hostname in your database URL is correct
3. Check your network/VPN settings that might block the connection
4. Try using the local SQLite option for development (see below)

#### Using SQLite for Development

If you're having issues connecting to Supabase, you can use a local SQLite database for development:

1. Set `USE_LOCAL_DB=true` in your `.env.local` file
2. Run the API as usual - it will automatically create and use a local SQLite database file

Note: The SQLite option is only for development convenience and will not have all the features of Supabase.

### Vercel Deployment

1. Push your code to a GitHub repository.

2. Connect the repository to Vercel.

3. Set environment variables in Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_POSTGRES_URL`

4. Deploy your project.

## API Endpoints

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:user_id` - Get a specific user
- `POST /api/users` - Create a new user

### Interests

- `GET /api/interests` - Get all interests
- `GET /api/users/:user_id/interests` - Get a user's interests
- `POST /api/interests` - Create a new interest
- `POST /api/users/:user_id/interests` - Add an interest to a user

### Podcasts

- `GET /api/podcasts` - Get all podcasts
- `GET /api/podcasts/:podcast_id` - Get a specific podcast
- `GET /api/users/:user_id/podcasts` - Get a user's podcasts
- `POST /api/podcasts` - Create a new podcast
- `POST /api/users/:user_id/podcasts` - Create a podcast for a user

### System

- `GET /health` - Health check endpoint that returns the system status

## Connecting from Next.js

To connect to this API from your Next.js app, you can use fetch or a library like axios:

```javascript
// Example: Get a user's podcasts
const getUserPodcasts = async (userId) => {
  const response = await fetch(`/api/users/${userId}/podcasts`);
  const data = await response.json();
  return data;
};

// Example: Add an interest to a user
const addInterestToUser = async (userId, description) => {
  const response = await fetch(`/api/users/${userId}/interests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ description }),
  });
  const data = await response.json();
  return data;
};
```

## Database Schema

The project uses the following database schema:

- **Users**: Store user information with Google SSO integration
- **Interests**: Topics users are interested in
- **UserInterests**: Many-to-many relationship between users and interests
- **Research**: Research data for generating podcast content
- **Scripts**: Generated scripts for podcasts
- **Podcasts**: Final podcast with audio URLs

## Tech Stack

- **Backend**: Python with FastAPI for the main application, Vercel serverless functions for deployment
- **Database**: PostgreSQL on Supabase (with SQLite fallback for local development)
- **ORM**: SQLAlchemy for database operations
- **Deployment**: Vercel 