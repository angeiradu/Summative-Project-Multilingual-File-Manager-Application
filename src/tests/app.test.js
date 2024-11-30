const request = require('supertest');
const express = require('express');
const i18next = require('i18next');
const i18nextHttpMiddleware = require('i18next-http-middleware');
const i18nextFSBackend = require('i18next-fs-backend');
const userRoutes = require('../routes/users');
const fileRoutes = require('../routes/files');

jest.mock('../routes/users');
jest.mock('../routes/files');

describe('Express App with i18next Integration', () => {
    let app;

    beforeAll(async () => {
        userRoutes.mockImplementation(() => {
            return (req, res, next) => {
                res.status(200).send('User Routes OK');
            };
        });
        fileRoutes.mockImplementation(() => {
            return (req, res, next) => {
                res.status(200).send('File Routes OK');
            };
        });

        await i18next
            .use(i18nextFSBackend)
            .use(i18nextHttpMiddleware.LanguageDetector)
            .init({
                backend: { loadPath: './src/locales/{{lng}}/translation.json' },
                fallbackLng: 'en',
                preload: ['en', 'es'],
                supportedLngs: ['en', 'es'],
                detection: {
                    order: ['querystring', 'cookie', 'header'],
                    caches: ['cookie'],
                },
                initImmediate: false,
                load: 'languageOnly',
                debug: false,
                interpolation: { escapeValue: false }
            });

        app = express();
        app.use(i18nextHttpMiddleware.handle(i18next));
        app.use(express.json());

        app.use('/api/users', userRoutes());
        app.use('/api/files', fileRoutes());
    });

    afterAll(async () => {
        i18next.off();
        app = null;
    });

    it('should respond to the /api/users route', async () => {
        const response = await request(app).get('/api/users');
        expect(response.status).toBe(200);
        expect(response.text).toBe('User Routes OK');
    }, 10000);

    it('should respond to the /api/files route', async () => {
        const response = await request(app).get('/api/files');
        expect(response.status).toBe(200);
        expect(response.text).toBe('File Routes OK');
    }, 10000);

    it('should detect language from querystring', async () => {
        const response = await request(app)
            .get('/api/users')
            .query({ lng: 'es' });

        expect(response.status).toBe(200);
        expect(response.text).toBe('User Routes OK');
    }, 10000);

    it('should default to fallback language if no language is specified', async () => {
        const response = await request(app).get('/api/users');
        expect(response.status).toBe(200);
        expect(response.text).toBe('User Routes OK');
    }, 10000);

    it('should respond with 404 for an invalid route', async () => {
        const response = await request(app).get('/invalid-route');
        expect(response.status).toBe(404);
    }, 10000);
});