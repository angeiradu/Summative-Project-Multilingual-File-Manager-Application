Multi-User File Manager Application

Project Description

The Multi-User File Manager Application is designed to simulate a real-world collaborative project workspace, enabling multiple users to securely manage files and directories. The application prioritizes functionality, security, and user experience, with multilingual support and optional advanced features.

Features

Core Features:

1. User Management:

    * Secure user registration and login.
    * Password hashing using bcrypt for enhanced security.

2. File Management:

    * CRUD operations: Create, Read, Update, and Delete files within designated directories.
    * Organized directory structure for individual and collaborative usage.

3. Multilingual Support (i18n):

    * User-selectable languages for the interface.
    * Implemented using i18next or similar i18n libraries.

4. Queuing System:
 
    * Asynchronous task handling using Redis.
    * Optional: Include file upload progress tracking.

5. Unit Testing:

    * Comprehensive unit tests for:
        - User authentication
        - File management
        - Queuing system
    * Testing framework: Jest

Optional Features:

* File Versioning:
    - Maintain historical changes and allow rollbacks to previous file versions.

* Search Functionality:
    - Enable users to search files and directories by name or metadata.

Technical Considerations

    Database:
        - MySQL for storing user data, file metadata, and directory structures.

    Queuing System:
        - Use Redis with a suitable library (e.g., Bull, Kue) to manage background tasks.

    Backend Framework:
        - Express.js to structure the Node.js application.

    Authentication:
        - Password hashing using bcrypt.
        - Optional: Leverage Passport.js for streamlined authentication flows.

    Internationalization:
        - Implement using libraries such as i18next for a seamless multilingual experience.

    Testing Framework:
        - Write unit tests using Jest to ensure reliability and robustness.

Setup Instructions

Clone the Repository:

git clone <repository-url>
cd <repository-directory>

Install Dependencies:

npm install

Setup Environment Variables:

Create a .env file with the following:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=file_manager
REDIS_HOST=127.0.0.1
REDIS_PORT=6379


Start the Application:

npm start

Run Tests:

npm test
