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
        isNumeric: {
          args: true,
          msg: "Latitude must be a number"
        },
        max: {
          args: 90,
          msg: "Please provide a latitude no greater than 90"
        },
        min: {
          args: -90,
          msg: "Please provide a latitude no less than -90"
        },
        len: {
          args: [9, 10],
          msg: "Please provide a latitude with a scale of 7"
        }
      }
    },
    lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      validate: {
        isNumeric: {
          args: false,
          msg: "Longitude must be a number"
        },
        max: {
          args: 180,
          msg: "Please provide a longitude no greater than 180"
        },
        min: {
          args: -180,
          msg: "Please provide a longitude no less than -180"
        },
        len: {
          args: [9, 11],
          msg: "Please provide a longitude with a scale of 7"
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
      type: DataTypes.INTEGER,
      allowNull: false
    },
    previewImage: {
      type: DataTypes.STRING,
      validate: {
        isUrl: {
          args: true,
          msg: "Please provide a valid image URL"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Spot'
  });
  return Spot;
};
