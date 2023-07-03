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
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/39900857/1.webp",
        preview: true
      },
      {
        spotId: 1,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/39900857/2.webp",
        preview: false
      },
      {
        spotId: 1,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/39900857/3.webp",
        preview: false
      },
      {
        spotId: 1,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/39900857/4.webp",
        preview: false
      },
      {
        spotId: 1,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/39900857/5.webp",
        preview: false
      },
      {
        spotId: 2,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/744054599434860690/1.webp",
        preview: true
      },
      {
        spotId: 2,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/744054599434860690/2.webp",
        preview: false
      },
      {
        spotId: 2,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/744054599434860690/3.webp",
        preview: false
      },
      {
        spotId: 2,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/744054599434860690/4.webp",
        preview: false
      },
      {
        spotId: 2,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/744054599434860690/5.webp",
        preview: false
      },
      {
        spotId: 3,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/46665306/1.webp",
        preview: true
      },
      {
        spotId: 3,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/46665306/2.webp",
        preview: false
      },
      {
        spotId: 3,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/46665306/3.webp",
        preview: false
      },
      {
        spotId: 3,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/46665306/4.webp",
        preview: false
      },
      {
        spotId: 3,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/46665306/5.webp",
        preview: false
      },
      {
        spotId: 4,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/795805481554810120/1.webp",
        preview: true
      },
      {
        spotId: 4,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/795805481554810120/2.webp",
        preview: false
      },
      {
        spotId: 4,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/795805481554810120/3.webp",
        preview: false
      },
      {
        spotId: 4,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/795805481554810120/4.webp",
        preview: false
      },
      {
        spotId: 4,
        url: "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/795805481554810120/5.webp",
        preview: false
      }
    ], {validate: true});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const {Op} = require("sequelize");
    await queryInterface.bulkDelete(options, {
      url: {[Op.in]: ["https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/39900857/1.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/39900857/2.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/39900857/3.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/39900857/4.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/39900857/5.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/744054599434860690/1.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/744054599434860690/2.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/744054599434860690/3.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/744054599434860690/4.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/744054599434860690/5.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/46665306/1.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/46665306/2.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/46665306/3.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/46665306/4.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/46665306/5.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/795805481554810120/1.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/795805481554810120/2.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/795805481554810120/3.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/795805481554810120/4.webp", "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/airpnp/spot-images/795805481554810120/5.webp"]}
    }, {});
  }
};
