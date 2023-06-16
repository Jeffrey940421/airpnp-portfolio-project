'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Booking.belongsTo(models.Spot, {
        foreignKey: "spotId",
        onDelete: "cascade"
      });
      Booking.belongsTo(models.User, {
        foreignKey: "userId",
        onDelete: "cascade"
      });
    }
  }
  Booking.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          arg: true,
          msg: "Start date must be a date"
        },
        isAfterToday(value) {
          if (new Date(value).getTime() < new Date().setHours(-7, 0, 0, 0)) {
            throw new Error("Start date must be after today's date")
          }
        }
      }
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          arg: true,
          msg: "End date must be a date"
        },
        isAfterStart(value) {
          if (new Date(value).getTime() <= new Date(this.startDate).getTime()) {
            throw new Error("End Date must be after start date")
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};
