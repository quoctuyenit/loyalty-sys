# Asset Manager

A full-stack asset management application built with React, Vite, Tailwind CSS, Express, and Drizzle ORM.

## Prerequisites

Before starting, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) 
- A PostgreSQL database instance (local or hosted, e.g., Neon, Supabase, RDS)

## Environment Configuration

1. Clone or download the repository to your local machine.
2. In the root directory, you will find a `.env.example` file. 
3. Create a copy of `.env.example` and name it `.env`:
   ```sh
   cp .env.example .env
   ```
4. Open the newly created `.env` file and configure your environment variables:
   - `DATABASE_URL`: The connection string for your PostgreSQL database.
     - Example: `postgres://user:password@localhost:5432/dbname`
   - `ADMIN_SECRET_KEY`: A secret string used for administrative operations or signing tokens. Choose a secure, random string.
   - `REDEEM_COST`: The cost of redeeming points. Default is 100.

## Installation

Install the project dependencies using npm:

```sh
npm install
```

## Database Setup

Once your `DATABASE_URL` is configured in the `.env` file, you need to push the database schema to your PostgreSQL database. 

Run the following command to execute Drizzle schema migrations:

```sh
npm run db:push
```
*Note: Make sure your PostgreSQL instance is running before executing this step.*

## Running the Application

### Development Mode

To start both the backend server and the frontend React application in development mode with hot-reloading:

```sh
npm run dev
```

The application will typically be available at `http://localhost:5000` (or another port depending on your server configuration).

### Production Build & Deployment

To build the application for production, run:

```sh
npm run build
```
This command builds both the frontend assets (using Vite) and the backend code.

#### Starting the Production Server

After a successful build, you can start the production server with:

```sh
npm run start
```
The server will now serve the compiled frontend static files alongside the API endpoints.

## Project Structure

- `/client` - React frontend code (Vite, Tailwind, Radix UI components).
- `/server` - Express backend server and API endpoints.
- `/shared` - Shared TypeScript types, schemas, and utilities used by both frontend and backend.
- `drizzle.config.ts` - Configuration for Drizzle ORM.
- `vite.config.ts` - Configuration for the Vite bundler.

## Scripts Overview

- `npm run dev`: Starts the application in development mode.
- `npm run build`: Compiles the application for production.
- `npm run start`: Starts the production server (requires `npm run build` to be run first).
- `npm run check`: Runs TypeScript type checking.
- `npm run db:push`: Pushes schema changes to the PostgreSQL database.
