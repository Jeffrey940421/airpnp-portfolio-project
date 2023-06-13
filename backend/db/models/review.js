'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Review.belongsTo(models.User, {
        foreignKey: "userId",
        onDelete: "cascade"
      });
      Review.belongsTo(models.Spot, {
        foreignKey: "spotId",
        onDelete: "cascade"
      });
      Review.hasMany(models.ReviewImage, {
        foreignKey: "reviewId",
        onDelete: "cascade"
      });
    }
  }
  Review.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    stars: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      validate: {
        len: [1, 1],
        isInt: true,
        max: 5,
        min: 1
      }
    },
  }, {
    sequelize,
    modelName: 'Review',
    indexes: [
      {
        fields: ["userId", "spotId"],
        unique: true
      }
    ]
  });
  return Review;
};
