'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const { SpotImage } = require("../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await SpotImage.bulkCreate([
      {
        spotId: 1,
        url: "https://www.airpnp.com/spotimage1.jpg",
        preview: true
      },
      {
        spotId: 1,
        url: "https://www.airpnp.com/spotimage4.jpg",
        preview: false
      },
      {
        spotId: 1,
        url: "https://www.airpnp.com/spotimage5.jpg",
        preview: false
      },
      {
        spotId: 2,
        url: "https://www.airpnp.com/spotimage2.jpg",
        preview: false
      },
      {
        spotId: 2,
        url: "https://www.airpnp.com/spotimage6.jpg",
        preview: true
      },
      {
        spotId: 2,
        url: "https://www.airpnp.com/spotimage7.jpg",
        preview: false
      },
      {
        spotId: 3,
        url: "https://www.airpnp.com/spotimage3.jpg",
        preview: true
      },
      {
        spotId: 3,
        url: "https://www.airpnp.com/spotimage8.jpg",
        preview: false
      },
      {
        spotId: 3,
        url: "https://www.airpnp.com/spotimage9.jpg",
        preview: false
      },
    ], {validate: true});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const {Op} = require("sequelize");
    await queryInterface.bulkDelete(options, {
      url: {[Op.in]: ["https://www.airpnp.com/spotimage1.jpg", "https://www.airpnp.com/spotimage2.jpg", "https://www.airpnp.com/spotimage3.jpg", "https://www.airpnp.com/spotimage4.jpg", "https://www.airpnp.com/spotimage5.jpg", "https://www.airpnp.com/spotimage6.jpg", "https://www.airpnp.com/spotimage7.jpg", "https://www.airpnp.com/spotimage8.jpg", "https://www.airpnp.com/spotimage9.jpg"]}
    }, {});
  }
};
