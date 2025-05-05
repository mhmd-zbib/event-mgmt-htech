const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EventTag = sequelize.define('EventTag', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Events',
      key: 'id'
    }
  },
  tagId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Tags',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['eventId', 'tagId']
    }
  ]
});

module.exports = EventTag;

// Import models to establish relationships
const Event = require('./event.model');
const Tag = require('./tag.model');

// Event-Tag many-to-many relationship
Event.belongsToMany(Tag, {
  through: EventTag,
  foreignKey: 'eventId',
  otherKey: 'tagId',
  as: 'tags'
});

Tag.belongsToMany(Event, {
  through: EventTag,
  foreignKey: 'tagId',
  otherKey: 'eventId',
  as: 'events'
});