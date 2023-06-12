'use strict';
const { Model } = require('sequelize');
const { countryNames, getStatesByCountryName, getCitiesByCountryStateNames } = require("../../utils/address-validation");
// const { SpotImage } = require("../models");

module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Spot.belongsTo(models.User, {
        foreignKey: "ownerId",
        onDelete: "cascade"
      });
      // Spot.hasMany(models.Booking, {
      //   foreignKey: "spotId",
      //   onDelete: "cascade"
      // });
      // Spot.hasMany(models.Review, {
      //   foreignKey: "spotId",
      //   onDelete: "cascade"
      // });
      // Spot.hasMany(models.SpotImage, {
      //   foreignKey: "spotId",
      //   onDelete: "cascade"
      // });
    }
  }
  Spot.init({
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 256]
      }
    },
    city: {
      type: DataTypes.STRING(70),
      allowNull: false,
      validate: {
        len: [1, 70],
        isIn: [getCitiesByCountryStateNames(this.country, this.state)]
      }
    },
    state: {
      type: DataTypes.STRING(70),
      allowNull: false,
      validate: {
        len: [2, 70],
        isIn: [getStatesByCountryName(this.country)]
      }
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [4, 50],
        isIn: [countryNames]
      }
    },
    lat: {
      type: DataTypes.DECIMAL(9, 7),
      allowNull: false,
      validate: {
        isNumeric: true,
        max: 90,
        min: -90,
        len: [8, 9]
      }
    },
    lng: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        isNumeric: false,
        max: 180,
        min: -180,
        len: [8, 10]
      }
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    previewImage: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
        imageAvailability(value) {
          if (!SpotImage.findOne({
            where: {
              spotId: value
            }
          })) {
            throw new Error("Preview image is not available");
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};
