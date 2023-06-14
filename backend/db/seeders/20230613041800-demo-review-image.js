'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const { ReviewImage } = require("../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await ReviewImage.bulkCreate([
      {
        reviewId: 1,
        url: "https://www.airpnp.com/reviewimage1.jpg"
      },
      {
        reviewId: 2,
        url: "https://www.airpnp.com/reviewimage2.jpg"
      },
      {
        reviewId: 3,
        url: "https://www.airpnp.com/reviewimage3.jpg"
      }
    ], {validate: true});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    const {Op} = require("sequelize");
    await queryInterface.bulkDelete(options, {
      url: {[Op.in]: ["https://www.airpnp.com/reviewimage1.jpg", "https://www.airpnp.com/reviewimage2.jpg", "https://www.airpnp.com/reviewimage3.jpg"]}
    }, {});
  }
};
