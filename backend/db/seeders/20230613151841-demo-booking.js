'use strict';

const { Booking } = require("../models");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Booking.bulkCreate([
      {
        spotId: 2,
        userId: 2,
        startDate: "2023-07-11",
        endDate: "2023-08-11"
      },
      {
        spotId: 3,
        userId: 3,
        startDate: "2023-09-15",
        endDate: "2023-10-17"
      },
      {
        spotId: 3,
        userId: 1,
        startDate: "2023-08-17",
        endDate: "2023-08-20"
      },
      {
        spotId: 1,
        userId: 1,
        startDate: "2023-09-20",
        endDate: "2023-09-30"
      }
    ], {validate: true});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const {Op} = require("sequelize");
    await queryInterface.bulkDelete(options, {
      [Op.or]: [
        {spotId: 2, userId: 2, startDate: "2023-07-11 00:00:00.000 +00:00", endDate: "2023-08-11 00:00:00.000 +00:00"},
        {spotId: 3, userId: 3, startDate: "2023-09-15 00:00:00.000 +00:00", endDate: "2023-10-17 00:00:00.000 +00:00"},
        {spotId: 3, userId: 1, startDate: "2023-08-17 00:00:00.000 +00:00", endDate: "2023-08-20 00:00:00.000 +00:00"},
        {spotId: 1, userId: 1, startDate: "2023-09-20 00:00:00.000 +00:00", endDate: "2023-09-30 00:00:00.000 +00:00"}
      ]
    }, {});
  }
};
