# UrineCare — Urine Test Strip Reader

UrineCare is a web-based application designed to manage urine test strip readings, patient records, strip inventory, doctor reviews, and activity tracking in one centralized system.

The application demonstrates how a digital point-of-care testing workflow can be organized using the MERN stack. Technicians can record test results, doctors can review reports, and administrators can monitor system activities.

**Note:** UrineCare is an educational demonstration project. It is not a clinically validated diagnostic system, and its sample results must not be used to make medical decisions.

## Features

- **Role-Based Authentication:** Separate access for Admin, Doctor, and Technician users.
- **Patient Management:** Create and maintain patient records.
- **Urine Test Reports:** Record urine reagent strip readings and associate them with patients.
- **Strip Inventory Management:** Track strip batches, expiry dates, and remaining stock.
- **Doctor Review Workflow:** Submit reports for review, approve them, or request revisions.
- **Audit Logs:** Maintain a history of report creation, submissions, approvals, and revision requests.
- **Centralized Database:** Store application data in MongoDB.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| API Communication | REST APIs, Axios |
| Routing | React Router |
| Icons | Lucide React |

## Application Architecture

The application follows a client-server architecture.

1. React provides the user interface.
2. Axios sends HTTP requests to the Express backend.
3. Express routes and controllers process requests and enforce authorization.
4. Mongoose communicates with MongoDB to store and retrieve data.
5. The backend returns responses to the frontend, which updates the interface.

## User Roles

- **Admin:** Accesses administrative features, manages user accounts through the available backend functionality, and views audit logs.
- **Technician:** Manages patient records, records urine test results, and submits reports for review.
- **Doctor:** Reviews submitted reports, approves reports, or requests revisions.

Access to individual operations depends on the permissions implemented in the backend.

## Main Modules

### 1. Patient Management
Stores patient identifiers and demographic details required to associate patients with test reports.

### 2. Urine Test Reports
Records reagent strip readings, including glucose, protein, ketones, blood, bilirubin, leucocytes, urobilinogen, nitrite, pH, and specific gravity.

### 3. Strip Inventory
Maintains batch details, expiry dates, received quantities, and remaining stock. Creating a test report consumes one strip from an eligible batch.

### 4. Doctor Review
Supports the report workflow:

`Draft → Pending Review → Approved`

Alternatively, a doctor can request revisions, after which the technician can update and resubmit the report.

### 5. Audit Logs
Records important report-related actions, associated users, and activity timestamps.

## Project Structure

```text
UrineCare/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   ├── seedDemoUsers.js
│   ├── seedDemoData.js
│   └── server.js
├── .gitignore
└── README.md
```

This is a simplified overview of the project structure.

## Prerequisites

Before running the application, install:

- Node.js and npm
- A MongoDB Atlas account or another compatible MongoDB instance
- Git
- Visual Studio Code or another code editor

## Installation and Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/ImAtharva2045/UrineCare.git
cd UrineCare
```

### Step 2: Install backend dependencies

```bash
cd server
npm install
```

### Step 3: Configure environment variables

Create a file named `.env` inside the `server` directory.

Use the following structure:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_own_long_random_secret
```

Replace the placeholder values with your own MongoDB connection string and a strong, randomly generated JWT secret.

Never upload your actual `.env` file or share your database credentials and JWT secret publicly.

### Step 4: Install frontend dependencies

Open a second terminal at the project root and run:

```bash
cd client
npm install
```

### Step 5: Prepare the demo database

UrineCare includes two scripts for preparing demonstration data.

**A. Create the demo user accounts**

In a terminal, navigate to the `server` directory and run:

```bash
node seedDemoUsers.js
```

This script creates the six configured demo accounts if they do not already exist:

- One Admin
- Two Doctors
- Three Technicians

Existing accounts are skipped rather than overwritten.

**B. Populate the demonstration records**

After the demo accounts have been created, run:

```bash
node seedDemoData.js
```

This script populates the database with fictional demonstration patients, strip batches, urine test reports, and related audit entries.

**Important:** Run these scripts only after checking that your MongoDB connection points to the intended demo database. The demo-data script should be used according to its implementation and is not intended to reset an existing database automatically.

The demo accounts use the credentials configured in `seedDemoUsers.js`. Refer to that script for the demonstration login details. These credentials are for local educational demonstrations only and must not be reused for real accounts.

### Step 6: Start the backend

From the `server` directory, run:

```bash
npm run dev
```

This assumes the backend `package.json` defines a `dev` script. If it does not, use the start command configured in that file.

The backend is configured to use port `5001`.

### Step 7: Start the frontend

In a separate terminal:

```bash
cd client
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

Ensure the backend is running and its CORS configuration allows requests from the frontend origin.

## Running UrineCare on Another Computer

Each person can run UrineCare independently by cloning the repository and configuring their own environment.

1. Clone the GitHub repository.
2. Install the frontend and backend dependencies.
3. Create `server/.env` with their own MongoDB connection string and JWT secret.
4. Run `seedDemoUsers.js` to create the demonstration accounts.
5. Run `seedDemoData.js` to populate the demonstration records.
6. Start the backend and frontend in separate terminals.

Each person's data is stored in the MongoDB database configured in their own environment. Their changes will not appear in another person's database unless both applications connect to the same database.

## API Overview

The backend exposes REST API endpoints under `/api`.

| Endpoint prefix | Purpose |
|---|---|
| `/api/auth` | Authentication |
| `/api/users` | User-related operations |
| `/api/patients` | Patient records |
| `/api/batches` | Strip inventory |
| `/api/tests` | Urine test reports and submission workflow |
| `/api/reviews` | Doctor review actions |
| `/api/audit` | Audit log retrieval |

Protected endpoints require authentication and may enforce role-specific permissions.

## Security Considerations

- Environment files containing credentials must not be committed.
- Passwords are hashed using bcryptjs.
- JWT tokens are used to authenticate requests.
- Role-based middleware restricts access to protected operations.
- Demo credentials are intended only for educational use.

## Limitations

- The application is an educational prototype, not a validated medical device.
- Test readings are entered manually; automated image-based strip interpretation is not implemented.
- The application does not establish a medical diagnosis or replace professional clinical assessment.
- Production deployment would require additional security, privacy, testing, and clinical validation.

## Future Enhancements

- Automated test strip image interpretation after appropriate validation.
- Improved report export and printing.
- Additional analytics and inventory alerts.
- Comprehensive automated testing and production deployment.

## Author

Developed as an academic software project demonstrating full-stack web development, database integration, authentication, role-based access control, and workflow management.
