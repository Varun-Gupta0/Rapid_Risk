# Rapidtest (RakshaAI) - Rapid Risk Assessment System

Rapidtest (branded as RakshaAI in the backend) is a mobile and web-based rapid risk assessment platform designed for healthcare triage. It helps healthcare providers quickly assess patient risks based on vital signs and symptoms, manage patient records, and facilitate referrals.

## 🚀 Key Features

- **Rapid Risk Assessment**: Interactive questionnaire to evaluate patient symptoms (fever, breathing difficulty) and vitals (heart rate, oxygen levels).
- **Intelligent Risk Scoring**: Uses a logistic regression-based model to categorize risk levels.
- **Offline Mode & Sync**: Designed for field use with full offline capabilities and data synchronization when a connection is available.
- **Record Management**: Secure storage and retrieval of patient assessment history.
- **Referral System**: Generates referral slips for patients requiring further medical attention.
- **Voice Integration**: Accessible interface with speech feedback capabilities.

## 🏗️ Architecture

The project is split into a frontend mobile application and a backend REST API.

### 📱 Frontend (`Rapidtest_frontend`)
A **React Native** application powered by **Expo**.

- **Tech Stack**: React Native, Expo, React Navigation, Expo-Speech.
- **Key Screens**:
  - `AssessmentScreen`: The core triage workflow.
  - `RecordsScreen`: History of all assessments.
  - `ResultScreen`: UI for presenting risk levels (Low, Moderate, High) and triage recommendations.
  - `ReferralScreen`: Form for generating patient referrals.
- **Data Sync**: Built-in logic to handle API synchronization for field workers.
- **Risk Calculation**: 
  - Uses a JavaScript-based scoring engine (`utils/riskScorer.js`) that evaluates factors such as age, oxygen levels, breathing difficulty, and chronic conditions.
  - Supports both basic and enhanced risk models, incorporating machine learning probabilities for more accurate triage.
  - Includes `risk_scorer.py`, a Python reference script used for training the logistic regression model parameters.

### 🖥️ Backend (`rapidtest_backend`)
A **Node.js** server built with **Express**.

- **Tech Stack**: Node.js, Express, MongoDB (Mongoose), JWT, Joi validation.
- **Key Modules**:
  - `auth`: Handles user login, registration, and secure JWT-based sessions.
  - `patient`: API for CRUD operations on patient records.
  - `sync`: Specialized endpoints for syncing offline data from the mobile app.

## ⚙️ Development Setup

### Prerequisites
- Node.js (v18+)
- Expo CLI (`npm install -g expo-cli`)
- MongoDB (Running instance)
- Python (Optional, for running the `risk_scorer.py`)

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Rapidtest_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```

### Backend Setup
1. Navigate to the backend source directory:
   ```bash
   cd rapidtest_backend/src
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (create a `.env` based on `.env.example`).
4. Start the server:
   ```bash
   npm run dev
   ```

---
*Disclaimer: This application is for informational purposes only and should not be considered a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns.*
