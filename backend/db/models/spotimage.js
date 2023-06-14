'use strict';
const { Model } = require('sequelize');
const { Sequelize } = require('.');
module.exports = (sequelize, DataTypes) => {
  class SpotImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SpotImage.belongsTo(models.Spot, {
        foreignKey: "spotId",
        onDelete: "cascade"
      })
    }
  }
  SpotImage.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isUrl: {
          args: true,
          msg: "Please provide a valid image URL"
        }
      }
    },
    preview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'SpotImage',
    // hooks: {
    //   beforeBulkCreate: async (spotImages) => {
    //     const spots = new Set([]);
    //     for (let spotImage of spotImages) {
    //       if (spotImage.dataValues.preview) {
    //         if (!spots.has(spotImage.dataValues.spotId)) {
    //           spots.add(spotImage.dataValues.spotId);
    //         } else {
    //           throw new Error("Please set only one image as preview for each spot")
    //         }
    //       }
    //     }
    //   }
    // }
  });
  return SpotImage;
};
