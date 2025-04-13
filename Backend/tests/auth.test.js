const request = require('supertest');
const { app } = require('../server');
const User = require('../models/user');
const mongoose = require('mongoose');

describe('Authentication Endpoints', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
        // Create a test user
        testUser = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'testpassword123'
        });
        await testUser.save();
    });

    test('User Registration', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'New User',
                email: 'newuser@example.com',
                password: 'newpassword123'
            });
        
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('token');
    });

    test('User Login', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'testpassword123'
            });
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token');
        authToken = response.body.token;
    });

    test('Protected Route Access', async () => {
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'testpassword123'
            });

        const response = await request(app)
            .get('/api/protected')
            .set('Authorization', `Bearer ${loginResponse.body.token}`);
        
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('Invalid Login Attempt', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpassword'
            });
        
        expect(response.statusCode).toBe(401);
    });
}); 