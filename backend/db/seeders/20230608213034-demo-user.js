'use strict';

const bcrypt = require("bcryptjs");
const { User } = require("../models");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        firstName: "Loui",
        lastName: "Salazar",
        email: 'loui.salazar@user.io',
        username: 'loui798',
        hashedPassword: bcrypt.hashSync('password1')
      },
      {
        firstName: "Yousuf",
        lastName: "Wells",
        email: 'yousuf.wells@user.io',
        username: 'yousuf876',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        firstName: "Catrin",
        lastName: "Wallace",
        email: 'catrin.wallace@user.io',
        username: 'catrin092',
        hashedPassword: bcrypt.hashSync('password3')
      }
    ], {validate: true});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    const {Op} = require("sequelize");
    await queryInterface.bulkDelete(options, {
      username: {[Op.in]: ['loui798', 'yousuf876', 'catrin092']}
    }, {});
  }
};
