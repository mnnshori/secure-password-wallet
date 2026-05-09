# Secure Password Wallet - Implementation Plan

This document outlines the architecture, database schema, and implementation strategy for the Secure Password Wallet assignment.

## User Review Required

> [!IMPORTANT]
> Please review the chosen tech stack, microservices communication approach, and the proposed Database Schema. Let me know if you approve this plan or if you'd like to make adjustments (e.g., switching to PostgreSQL instead of MongoDB, or changing the extra feature from "Password Strength Checker" to "Secure Sharing").

## Open Questions

- **Database Choice:** I proposed MongoDB (NoSQL) for ease of development with Node.js. Are you comfortable with this, or do you have a strict requirement for a relational database like PostgreSQL?
- **Extra Feature:** I have planned for a "Password Strength Checker" as it integrates seamlessly into the "Add/Edit Credential" workflow. Would you prefer this, or would you rather build "Secure Sharing" (which involves sharing a link/secret with another user)?

## Architecture Overview

We will build the application using a Microservices Architecture. 

- **Frontend:** React (built with Vite) using Vanilla CSS for a premium, dynamic UI (dark mode, glassmorphism).
- **Backend Services (Node.js & Express):**
  - **Auth Service:** Handles user registration, login, and JWT generation.
  - **Vault Service:** Handles CRUD operations for the user's password vault. It will encrypt/decrypt passwords before/after database storage using AES-256-GCM.
  - **API Gateway (Optional/Simple Proxy):** A simple Node.js proxy to route requests from the frontend to the correct microservice, avoiding CORS complexities and keeping the API URL uniform.
- **Database:** MongoDB. For true microservices, we logically separate the collections (or use separate databases).
  - `auth_db`: Stores user credentials.
  - `vault_db`: Stores encrypted password entries.

## Database Schema (MongoDB / Mongoose)

### 1. Auth Service Database (`users` collection)

```javascript
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, // Hashed with bcrypt
  createdAt: { type: Date, default: Date.now }
});
```

### 2. Vault Service Database (`credentials` collection)

```javascript
const CredentialSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to User
  title: { type: String, required: true }, // e.g., "Google", "Facebook"
  url: { type: String }, // Optional, e.g., "https://google.com"
  username: { type: String, required: true }, // Username for the stored credential
  encryptedPassword: { type: String, required: true }, // Encrypted with AES-256-GCM
  iv: { type: String, required: true }, // Initialization Vector for encryption
  authTag: { type: String, required: true }, // Authentication tag for GCM
  strengthScore: { type: Number, min: 0, max: 4 }, // 0 (weak) to 4 (strong)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

> [!NOTE]
> The `encryptedPassword` will never be stored in plain text. The Vault Service will use a strong server-side secret key to encrypt it via Node's built-in `crypto` module before saving to MongoDB.

## Proposed Changes

### Frontend Component
- Initialize React app (`create-vite-app`).
- Implement Context API for global authentication state.
- Create UI Components: `Login`, `Register`, `Dashboard`, `VaultList`, `VaultItem`, `AddEditModal`.
- Integrate a beautiful UI using Vanilla CSS with CSS variables, hover micro-animations, and a dark, premium aesthetic.

### Auth Service Component
- Setup Express app on port `3001`.
- `POST /register`: Hash password, save user, return JWT.
- `POST /login`: Verify password, return JWT.
- Middleware to verify JWT for internal communication (if needed).

### Vault Service Component
- Setup Express app on port `3002`.
- Middleware to authenticate requests (validate JWT from headers).
- `GET /credentials`: Fetch user's credentials (decrypt passwords before sending).
- `POST /credentials`: Add new credential (encrypt password before saving), calculate strength score.
- `PUT /credentials/:id`: Update credential.
- `DELETE /credentials/:id`: Delete credential.

## Verification Plan

### Automated/API Testing
- Test Auth Service endpoints (`/register`, `/login`) using curl/HTTP client to ensure JWT is generated correctly.
- Test Vault Service endpoints by passing the JWT in the `Authorization` header and verifying that passwords are appropriately encrypted in the DB, but returned decrypted in the API response.

### Manual Verification
- Start all three components (Frontend, Auth Service, Vault Service).
- Register a new user and log in.
- Add a new credential. The UI should instantly display the password strength.
- Verify the newly added credential appears in the Dashboard.
- Edit and delete the credential to test the complete CRUD lifecycle.
- Verify the responsive UI looks premium and functions correctly.
