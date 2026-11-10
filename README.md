# MNC Node.js MVC Authentication Example

A small server-rendered account application built with Express, EJS, Passport Local, and MongoDB. Users can register, sign in, view a protected dashboard, and sign out.

## Features

- MVC-style routes, controllers, model, and EJS views.
- Password hashing with bcryptjs and a 12-character minimum.
- Passport sessions with an HttpOnly, SameSite=Lax cookie.
- Same-origin checks for registration, sign-in, and sign-out requests.
- Normalized email addresses and generic sign-in errors.

## Requirements

- Node.js 20 or later
- MongoDB

## Run locally

    Copy-Item .env.example .env
    npm install
    npm start

Set MONGODB_URI and replace SESSION_SECRET with a randomly generated secret of at least 32 bytes in .env. The app runs at http://localhost:4111 by default. APP_ORIGIN must match the origin used in the browser.

## Configuration

- MONGODB_URI: MongoDB connection URI.
- SESSION_SECRET: private session-signing secret. Never commit .env.
- APP_ORIGIN: exact origin allowed to submit account forms, without a trailing path.
- NODE_ENV: set to production behind HTTPS to enable secure session cookies.
- PORT: optional server port.

The default express-session MemoryStore is intended for local development. Configure a persistent session store before running multiple production instances. Use HTTPS in production and configure the reverse proxy so secure cookies work correctly.

## Routes

- GET /register and POST /register
- GET /login and POST /login
- GET /dashboard (requires sign-in)
- POST /logout (requires sign-in)
- GET /healthz

## Project structure

- src/routes: URL-to-controller wiring
- src/controllers: registration, sign-in, sign-out, and dashboard flows
- src/models: Mongoose user model and password hashing
- src/auth: Passport strategy and access/origin guards
- src/views: EJS pages
