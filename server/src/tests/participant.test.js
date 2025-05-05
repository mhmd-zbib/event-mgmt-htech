const request = require('supertest');
const app = require('../app');
const { generateToken } = require('../utils/jwt');
const User = require('../models/user.model');
const Event = require('../models/event.model');
const Participant = require('../models/participant.model');
const { sequelize } = require('../config/database');

describe('Participant Controller', () => {
  let adminToken, userToken, testEvent, testUser, testAdmin;

  beforeAll(async () => {
    // Clear database tables
    await sequelize.sync({ force: true });

    // Create test admin
    testAdmin = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    // Create test user
    testUser = await User.create({
      email: 'user@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    });

    // Create test event
    testEvent = await Event.create({
      title: 'Test Event',
      description: 'Test Description',
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      endDate: new Date(Date.now() + 172800000), // Day after tomorrow
      createdBy: testAdmin.id
    });

    // Register user for the event
    await Participant.create({
      userId: testUser.id,
      eventId: testEvent.id,
      status: 'registered'
    });

    // Generate tokens
    adminToken = generateToken(testAdmin);
    userToken = generateToken(testUser);
  });

  describe('DELETE /events/:eventId/participants/:userId', () => {
    it('should allow admin to remove a participant', async () => {
      const response = await request(app)
        .delete(`/api/events/${testEvent.id}/participants/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Participant removed successfully');
      
      // Verify participant was removed
      const participant = await Participant.findOne({
        where: {
          userId: testUser.id,
          eventId: testEvent.id
        }
      });
      
      expect(participant).toBeNull();
    });

    it('should not allow regular users to remove participants', async () => {
      // First, recreate the participant record
      await Participant.create({
        userId: testUser.id,
        eventId: testEvent.id,
        status: 'registered'
      });

      const response = await request(app)
        .delete(`/api/events/${testEvent.id}/participants/${testUser.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 if participant not found', async () => {
      const response = await request(app)
        .delete(`/api/events/${testEvent.id}/participants/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
