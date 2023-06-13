'use strict';
const { Model } = require('sequelize');
const { countryNames, getStatesByCountryName, getCitiesByCountryStateNames } = require("../../utils/address-validation");


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
      Spot.hasMany(models.Booking, {
        foreignKey: "spotId",
        onDelete: "cascade"
      });
      Spot.hasMany(models.Review, {
        foreignKey: "spotId",
        onDelete: "cascade"
      });
      Spot.hasMany(models.SpotImage, {
        foreignKey: "spotId",
        onDelete: "cascade"
      });
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
        validCity(value) {
          if (!getCitiesByCountryStateNames(this.country, this.state).find(city => city === value)) {
            throw new Error("City is invalid");
          }
        }
      }
    },
    state: {
      type: DataTypes.STRING(70),
      allowNull: false,
      validate: {
        len: [2, 70],
        validState(value) {
          if (!getStatesByCountryName(this.country).find(state => state === value)) {
            throw new Error("State is invalid");
          }
        }
      }
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [4, 50],
        isIn: {
          args: [countryNames],
          msg: "Country is invalid"
        }
      }
    },
    lat: {
      type: DataTypes.DECIMAL(9, 7),
      allowNull: false,
      validate: {
        isNumeric: true,
        max: 90,
        min: -90,
        len: [9, 10]
      }
    },
    lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      validate: {
        isNumeric: false,
        max: 180,
        min: -180,
        len: [9, 11]
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
      validate: {
        isUrl: true
      }
    }
  }, {
    sequelize,
    modelName: 'Spot'
  });
  return Spot;
};
