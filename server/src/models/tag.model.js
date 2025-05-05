const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name']
    }
  ]
});

module.exports = Tag;

// Import models to establish relationships
const User = require('./user.model');

// Tag-User relationship (creator)
User.hasMany(Tag, {
  foreignKey: 'createdBy',
  as: 'createdTags'
});

Tag.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});