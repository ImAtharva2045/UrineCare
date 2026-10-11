# UrineCare — Urine Test Strip Reader

UrineCare is a web-based application designed to manage urine test strip readings, patient records, strip inventory, and doctor reviews in one centralized system.

The application demonstrates how a digital point-of-care testing workflow can be organized using the MERN stack. It allows technicians to record test results, doctors to review reports, and administrators to manage system activities.

**Note:** UrineCare is an educational demonstration project. It is not a clinically validated diagnostic system, and its sample results must not be used to make medical decisions.

## Features

- **Role-Based Authentication:** Separate access for Admin, Doctor, and Technician users.
- **Patient Management:** Create and maintain patient records.
- **Urine Test Reports:** Record urine reagent strip readings and associate them with patients.
- **Strip Inventory Management:** Track strip batches, expiry dates, and remaining stock.
- **Doctor Review Workflow:** Submit reports for review, approve them, or request revisions.
- **Audit Logs:** Maintain a history of report creation, submissions, approvals, and revision requests.
- **Centralized Database:** Store application records in MongoDB.

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

1. The React frontend provides the user interface.
2. Axios sends HTTP requests to the Express backend.
3. Express routes and controllers process requests and enforce authorization.
4. Mongoose communicates with MongoDB to store and retrieve data.
5. The backend returns responses to the frontend, which updates the interface.

## User Roles

- **Admin:** Access administrative features, manage user accounts, and view audit logs.
- **Technician:** Manage patient records, record urine test results, and submit reports for review.
- **Doctor:** Review submitted reports, approve reports, or request revisions.

Access to individual operations depends on the role-based permissions implemented in the backend.

## Main Modules

### 1. Patient Management
Stores patient identifiers and demographic details required to associate patients with test reports.

### 2. Urine Test Reports
Records reagent strip readings, including glucose, protein, ketones, blood, bilirubin, leucocytes, urobilinogen, nitrite, pH, and specific gravity.

### 3. Strip Inventory
Maintains batch details, expiry dates, received quantities, and remaining stock. Creating a test report consumes one strip from an eligible batch.

### 4. Doctor Review
Supports the report workflow: Draft → Pending Review → Approved or Revision Requested. Reports requiring changes can be revised and resubmitted.

### 5. Audit Logs
Records important report-related actions, the associated user, and the time of the activity.

## Project Structure

The project is organized into separate frontend and backend applications.

```text
urinecare/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── api.js
│   │   └── App.jsx
│   └── package.json
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   ├── seedDemoData.js
│   └── package.json
└── README.md
```

*Note: This is a high-level structure. Additional files may exist in the actual project.*

## Prerequisites

- Node.js and npm
- A MongoDB Atlas database or another compatible MongoDB instance
- A code editor such as Visual Studio Code

## Installation and Setup

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd urinecare
```

Replace the placeholder with your actual repository URL.

### 2. Install backend dependencies

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_private_jwt_secret
```

Replace the placeholder values with your own credentials. Never commit `.env` or expose database passwords, JWT secrets, or real patient information.

### 3. Start the backend

From the `server` directory, run:

```bash
npm run dev
```

If your `package.json` does not define a `dev` script, use the start command configured in that file.

### 4. Install frontend dependencies

Open a second terminal:

```bash
cd urinecare/client
npm install
```

### 5. Start the frontend

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Ensure that the backend is running on port `5001` and that its CORS configuration permits requests from the frontend origin.

## API Overview

The backend exposes REST API endpoints under `/api`.

| Endpoint prefix | Purpose |
|---|---|
| `/api/auth` | Authentication |
| `/api/users` | User management |
| `/api/patients` | Patient records |
| `/api/batches` | Strip inventory |
| `/api/tests` | Urine test reports and submission workflow |
| `/api/reviews` | Doctor review actions |
| `/api/audit` | Audit log retrieval |

Protected endpoints require authentication and may enforce role-specific permissions.

## Demo Data

The project includes a seed script for generating fictional demonstration patients, strip batches, test reports, and related audit entries.

Run it only when you understand its database effects and have verified the target database. Demo records are fictional and are not real clinical records.

## Limitations

- The application is an educational prototype, not a validated medical device.
- Test readings are entered and reviewed through the application; automated image-based strip interpretation is not implemented.
- The application does not establish a medical diagnosis or replace professional clinical assessment.
- Production deployment would require additional security, privacy, testing, and clinical validation.

## Future Enhancements

- Automated test strip image interpretation after appropriate validation.
- Improved report export and printing.
- Additional analytics and inventory alerts.
- Comprehensive automated testing and production deployment.

## Author

Developed as an academic software project demonstrating full-stack web development, database integration, authentication, role-based access control, and workflow management.
