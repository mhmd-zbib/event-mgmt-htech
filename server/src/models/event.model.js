const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  participantsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  timestamps: true,
  validate: {
    startBeforeEnd() {
      if (this.startDate >= this.endDate) {
        throw new Error('Start date must be before end date');
      }
    }
  }
});

module.exports = Event;

const User = require('./user.model');
const Category = require('./category.model');

Event.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

User.hasMany(Event, {
  foreignKey: 'createdBy',
  as: 'createdEvents'
});

// Add category relationship
Event.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

Category.hasMany(Event, {
  foreignKey: 'categoryId',
  as: 'events'
});