'use strict';
const { Model } = require('sequelize');
const { countryNames, getCountryCodeByName, getStatesByCountryName, getStateCodeByNames, getCitiesByCountryStateNames } = require("../../utils/address-validation");


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
        onDelete: "cascade",
        as: "Owner"
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
        len: {
          args: [1, 255],
          msg: "Please provide an address with at least 1 character and no more than 255 characters"
        }
      }
    },
    city: {
      type: DataTypes.STRING(70),
      allowNull: false,
      validate: {
        len: {
          args: [1, 70],
          msg: "Please provide a city with at least 1 character and no more than 70 characters"
        },
        validCity(value) {
          if (!getCountryCodeByName(this.country)) {
            throw new Error("Cannot validate city with invalid country");
          }
          if (!getStateCodeByNames(this.country, this.state)) {
            throw new Error("Cannot validate city with invalid state");
          }
          if (!getCitiesByCountryStateNames(this.country, this.state).find(city => city === value)) {
            throw new Error("Please provide a valid city");
          }
        }
      }
    },
    state: {
      type: DataTypes.STRING(70),
      allowNull: false,
      validate: {
        len: {
          args: [2, 70],
          msg: "Please provide a state with at least 2 characters and no more than 70 characters"
        },
        validState(value) {
          if (!getCountryCodeByName(this.country)) {
            throw new Error("Cannot validate state with invalid country");
          }
          if (!getStatesByCountryName(this.country).find(state => state === value)) {
            throw new Error("Please provide a valid state");
          }
        }
      }
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [4, 50],
          msg: "Please provide a state with at least 4 characters and no more than 50 characters"
        },
        isIn: {
          args: [countryNames],
          msg: "Please provide a valid country"
        }
      }
    },
    lat: {
      type: DataTypes.DECIMAL(9, 7),
      allowNull: false,
      validate: {
        isNumber(value) {
          if (value !== +value) {
            throw new Error("Latitude must be a number")
          }
        },
        max: {
          args: 90,
          msg: "Please provide a latitude no greater than 90"
        },
        min: {
          args: -90,
          msg: "Please provide a latitude no less than -90"
        },
        checkPrecision(value) {
          if (+value.toFixed(7) !== value) {
            throw new Error("Please provide a latitude expressed to 7 decimal places")
          }
        }
      }
    },
    lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      validate: {
        isNumber(value) {
          if (value !== +value) {
            throw new Error("Longitude must be a number")
          }
        },
        max: {
          args: 180,
          msg: "Please provide a longitude no greater than 180"
        },
        min: {
          args: -180,
          msg: "Please provide a longitude no less than -180"
        },
        checkPrecision(value) {
          if (+value.toFixed(7) !== value) {
            throw new Error("Please provide a latitude expressed to 7 decimal places")
          }
        }
      }
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [1, 50],
          msg: "Please provide a name with at least 1 characters and no more than 50 characters"
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      isNumber(value) {
        if (value !== +value) {
          throw new Error("Price must be a number")
        }
      },
      min: {
        args: 0,
        msg: "Please provide a price no less than 0"
      },
      checkPrecision(value) {
        if (+value.toFixed(2) !== value) {
          throw new Error("Please provide a price expressed to 2 decimal places")
        }
      }
    },
  }, {
    sequelize,
    modelName: 'Spot'
  });
  return Spot;
};
