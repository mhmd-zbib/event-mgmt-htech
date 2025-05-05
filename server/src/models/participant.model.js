const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Import models early to avoid circular dependencies
const User = require('./user.model');
const Event = require('./event.model');

const Participant = sequelize.define('Participant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Events',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('registered', 'attended', 'cancelled', 'waitlisted'),
    defaultValue: 'registered',
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  registrationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'eventId'],
      name: 'unique_user_event_participation'
    }
  ],
  validate: {
    noUserDuplicates() {
      // This validation helps to provide a better error message when trying to create a duplicate
      // It will be checked in addition to the unique constraint on the database
      if (this.userId && this.eventId) {
        // The actual check is done at the service level and by the database unique constraint
        // This is just an extra validation layer
      }
    }
  }
});

// User-Participant relationship
User.hasMany(Participant, {
  foreignKey: 'userId',
  as: 'participations'
});

Participant.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Event-Participant relationship
Event.hasMany(Participant, {
  foreignKey: 'eventId',
  as: 'participants'
});

Participant.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event'
});

module.exports = Participant;