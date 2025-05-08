const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
      if (this.userId && this.eventId) {
      }
    }
  }
});

User.hasMany(Participant, {
  foreignKey: 'userId',
  as: 'participations'
});

Participant.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Event.hasMany(Participant, {
  foreignKey: 'eventId',
  as: 'participants'
});

Participant.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event'
});

module.exports = Participant;