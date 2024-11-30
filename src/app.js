const express = require('express');
const i18next = require('i18next');
const i18nextHttpMiddleware = require('i18next-http-middleware');
const i18nextFSBackend = require('i18next-fs-backend');
const dotenv = require('dotenv');
const userRoutes = require('./routes/users');
const fileRoutes = require('./routes/files');

dotenv.config();

// Initialize i18next with backend and language detection
i18next
  .use(i18nextFSBackend) // Using filesystem backend for loading translations
  .use(i18nextHttpMiddleware.LanguageDetector) // Using middleware for language detection
  .init({
    backend: { loadPath: './src/locales/{{lng}}/translation.json' }, // Path to language files
    fallbackLng: 'en', // Default language if no match is found
    preload: ['en', 'es'], // Preload languages to avoid delay
    supportedLngs: ['en', 'es'], // Languages allowed in the app
    detection: {
      order: ['querystring', 'cookie', 'header'], // Language detection order
      caches: ['cookie'], // Caching for languages in cookies
    },
  });

const app = express();

// Use i18next middleware to handle language detection
app.use(i18nextHttpMiddleware.handle(i18next));

// JSON body parsing middleware
app.use(express.json());

// Routes for users and files
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));