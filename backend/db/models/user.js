'use strict';
const { Model, Validator } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Spot, {
        foreignKey: "ownerId",
        onDelete: "cascade"
      });
      User.hasMany(models.Review, {
        foreignKey: "userId",
        onDelete: "cascade"
      });
      User.hasMany(models.Booking, {
        foreignKey: "userId",
        onDelete: "cascade"
      })
    }
  }
  User.init({
    firstName: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        len: {
          args: [1, 30],
          msg: "Please provide a first name with at least 1 character and no more than 30 characters"
        },
        isAlpha: {
          args: true,
          msg: "First name must be alphabetic"
        },
        isCapitalized(value) {
          if (value[0].toUpperCase() + value.slice(1).toLowerCase() !== value) {
            throw new Error("Please provide a capitalized first name")
          }
        }
      }
    },
    lastName: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        len: {
          args: [1, 30],
          msg: "Please provide a last name with at least 1 character and no more than 30 characters"
        },
        isAlpha: {
          args: true,
          msg: "Last name must be alphabetic"
        },
        isCapitalized(value) {
          if (value[0].toUpperCase() + value.slice(1).toLowerCase() !== value) {
            throw new Error("Please provide a capitalized last name")
          }
        }
      }
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [4, 30],
          msg: "Please provide a username with at least 4 characters and no more than 30 characters"
        },
        isNotEmail(value) {
          if (Validator.isEmail(value)) {
            throw new Error("Username cannot be an email");
          }
        }
      }
    },
    email: {
      type: DataTypes.STRING(256),
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [3, 256],
          msg: "Please provide an email with at least 3 characters and no more than 256 characters"
        },
        isEmail: {
          args: true,
          msg: "Please provide a valid email"
        }
      }
    },
    hashedPassword: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [60, 60]
      }
    },
  }, {
    sequelize,
    modelName: 'User',
    defaultScope: {
      attributes: {
        exclude: ["hashedPassword", "email", "createdAt", "updatedAt"]
      }
    }
  });
  return User;
};
