'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users"
        },
        onDelete: "cascade"
      },
      spotId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Spots"
        },
        onDelete: "cascade"
      },
      review: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      stars: {
        type: Sequelize.INTEGER(1),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_STAMP")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_STAMP")
      }
    }, options);
    options.tableName = "Reviews"
    await queryInterface.addIndex(options, {
      fields: ["userId", "spotId"],
      unique: true,
      name: "idx_reviews_userId_spotId"
    })
  },
  async down(queryInterface, Sequelize) {
    options.tableName = "Reviews"
    await queryInterface.dropTable(options);
    await queryInterface.removeIndex(options, "idx_reviews_userId_spotId");
  }
};
