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
        review: 'We had a really nice experience at the Dome, the view is incredible and the hosts were also very nice ( they served us with eggs and cheese for breakfast). I might recommend to come in the summertime because at night it can be really chilly ( the chimney is small so the fire can last for about 2-3 hours during the night). Other than that, it was perfect!',
        stars: 5
      },
      {
        userId: 3,
        spotId: 1,
        review: 'An expensive stay for a couple but as three friends it was reasonable. This place is peaceful, beautiful, big enough for a family, south facing and the hot tub was a delight. Bright, spacious and has everything you could possibly need for a perfect stay. Surroundings are wonderful. Not far from some beautiful areas for walking and bathing etc. Would definitely recommend or stay again.',
        stars: 5
      },
      {
        userId: 2,
        spotId: 2,
        review: 'This place is overpriced and noisy. Will never come back again',
        stars: 1
      },
      {
        userId: 1,
        spotId: 1,
        review: "Ok let me start with positive, host was charming and friendly. Unfortunately beside the host nothing was good, room was a complete dump, ceiling was so low couldn't even stand there, it was a 90 years old property, which was not maintained, or remodelled, there were holes in the walls all over the room, that's a perfect place for spider and scorpions to hide.",
        stars: 2
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
