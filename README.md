Multi-User File Manager Application

Project Description

The Multi-User File Manager Application is designed to simulate a real-world collaborative project workspace, enabling multiple users to securely manage files and directories. The application prioritizes functionality, security, and user experience, with multilingual support and optional advanced features.

Features

Core Features:

1. User Management:

    * Secure user registration and login.
    * Password hashing using bcrypt for enhanced security.
Here are the screenshoot of how User can sign up and sign in into the system:
![sign up](https://github.com/user-attachments/assets/55d3a279-5ef9-45e0-a58c-4257fcd43b4a)

This is for Login 
![IMG-20241201-WA0030](https://github.com/user-attachments/assets/d3f55576-535d-4f80-8ab3-3aae17b79f8f)

2. File Management:

    * CRUD operations: Create, Read, Update, and Delete files within designated directories.
    * Organized directory structure for individual and collaborative usage.
Here are the Screenshoot of CRUD Operations:
* Get all the stored file 
 ![IMG-20241201-WA0028](https://github.com/user-attachments/assets/347e65da-b59a-4a3b-ab68-49c01d5aead9)
*update the stored file by ID:
![IMG-20241201-WA0027](https://github.com/user-attachments/assets/e46be8ae-18e9-4635-82c8-3099a82ab639)

3. Multilingual Support (i18n):

    * User-selectable languages for the interface.
    * Implemented using i18next or similar i18n libraries.

4. Queuing System:
Queuing system:
![IMG-20241201-WA0029](https://github.com/user-attachments/assets/bf0d22fc-83ef-455c-ade6-9d0e115899bf)

 
    * Asynchronous task handling using Redis.
    * Optional: Include file upload progress tracking.

6. Unit Testing:

    * Comprehensive unit tests for:
        - User authentication
        - File management
        - Queuing system
    * Testing framework: Jest
Screen of unit testing:

![IMG-20241201-WA0024](https://github.com/user-attachments/assets/c48f6a13-11d4-435f-a61b-c896c0f17bbb)

Optional Features:

* File Versioning:
    - Maintain historical changes and allow rollbacks to previous file versions.

* Search Functionality:
    - Enable users to search files and directories by name or metadata; here a user can write any letter all the file with that letter will show up.
  Screen of seach functionalities:
![IMG-20241201-WA0026](https://github.com/user-attachments/assets/c51584d4-1304-41e2-8efe-0a704e204c1f)
7.Database 
        We use MySQL for storing user data, file metadata, and directory structures.
      The Signed Users
      ![IMG-20241201-WA0007](https://github.com/user-attachments/assets/35096e40-e249-47f2-a8b5-18a989d3fc3b)
      *stored files:
      
![IMG-20241201-WA0032](https://github.com/user-attachments/assets/7075f1a7-ee11-428a-afe5-a39ca7561ae0)


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

Run Tests

npm test
