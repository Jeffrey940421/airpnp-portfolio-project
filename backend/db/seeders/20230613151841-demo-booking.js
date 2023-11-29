'use strict';

const { query } = require("express");
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
        startDate: "2023-12-10",
        endDate: "2023-12-11"
      },
      {
        spotId: 3,
        userId: 3,
        startDate: "2023-12-15",
        endDate: "2023-12-17"
      },
      {
        spotId: 3,
        userId: 1,
        startDate: "2023-12-17",
        endDate: "2023-12-20"
      },
      {
        spotId: 1,
        userId: 1,
        startDate: "2023-12-20",
        endDate: "2023-12-30"
      }
    ], {validate: true});

    options.tableName = 'Bookings';
    await queryInterface.bulkInsert(options, [
      {
        spotId: 3,
        userId: 1,
        startDate: "2023-10-01",
        endDate: "2023-10-30"
      },
      {
        spotId: 2,
        userId: 1,
        startDate: "2023-10-01",
        endDate: "2023-10-10"
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const {Op} = require("sequelize");
    await queryInterface.bulkDelete(options, {
      [Op.or]: [
        {spotId: 2, userId: 2, startDate: "2023-12-10", endDate: "2023-12-11"},
        {spotId: 3, userId: 3, startDate: "2023-12-15", endDate: "2023-12-17"},
        {spotId: 3, userId: 1, startDate: "2023-12-17", endDate: "2023-12-20"},
        {spotId: 1, userId: 1, startDate: "2023-12-20", endDate: "2023-12-30"},
        {spotId: 3, userId: 1, startDate: "2023-10-01", endDate: "2023-10-30"},
        {spotId: 2, userId: 1, startDate: "2023-10-01", endDate: "2023-10-10"}
      ]
    }, {});
  }
};
