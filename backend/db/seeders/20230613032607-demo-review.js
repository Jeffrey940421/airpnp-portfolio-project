'use strict';
const { Review } = require("../models");
const spot = require("../models/spot");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        userId: 3,
        spotId: 3,
        review: 'people who look after are good and Responsive.. Whayu came quick to help .. place is surrounded by green field.. Only go there if u dont mind living with bugs and Lizards and frogs… ants and other bugs always present.',
        stars: 2
      },
      {
        userId: 3,
        spotId: 1,
        review: 'This was such a wonderful space for a best friend weekend. We were looking for a place to relax and recharge, and that is exactly what we got. Beautiful cabin feel, with an outstanding view for coffee in the morning, and drinks while the sun sets. Very close to town, but far enough a way to feel tucked away in our own little bubble. We will be back!',
        stars: 5
      },
      {
        userId: 2,
        spotId: 2,
        review: 'War alle sehr schön, noch schöner wäre es wenn die anderen Gäste auch die Türklinke benutzten und nicht einfach ihre Zimmertür zuknallen. Bei mehreren Bewohnern eines Zimmers, die zur Küche gehen etc. ist das nervig und vielleicht kann man die Gäste ausdrücklich darum bitten?',
        stars: 3
      },
      {
        userId: 1,
        spotId: 1,
        review: "We loved this cottage in the forest! It was a quiet and peaceful getaway–a wonderful location amidst the trees. The decorations around the place were so special! It was exactly what we imagined. Definitely felt right at home. My family enjoyed our stay, and wished we stayed a little longer. Our host was amazing–super responsive and welcoming.",
        stars: 4
      },
      {
        userId: 2,
        spotId: 4,
        review: 'Excelente lugar para compartir en pareja. Su entorno rodeado de naturales lo hace tranquilo y ameno. Total privacidad que es lo importante. Muy amable las personas que atienden.',
        stars: 5
      }
    ], {validate: true});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    const {Op} = require("sequelize");
    await queryInterface.bulkDelete(options, {
      [Op.or]: [
        {userId: 3, spotId: 3},
        {userId: 3, spotId: 1},
        {userId: 2, spotId: 2},
        {userId: 1, spotId: 1}
      ]
    }, {});
  }
};
