'use strict';

const { Spot } = require("../models");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Spot.bulkCreate([
      {
        ownerId: 2,
        address: "5240 S Tuscony St",
        city: "Derby",
        state: "Kansas",
        country: "United States",
        lat: 37.5987288,
        lng: -97.254128,
        name: "Newly Built w/ Secret Master Suite",
        description: "Brand new finishing and a curated collection of vintage and high end furnishings create a modern and relaxing retreat inside. The house features top of the line Grohe shower systems, luxurious Bidet toilet seat, and color-changing LED ceiling lights. Unique and conversation provoking books and games. Inside, you will find a hidden bookshelf door leading to the Master suite.",
        price: 200
      },
      {
        ownerId: 1,
        address: "Eje Central Lázaro Cárdenas 422",
        city: "Benito Juarez",
        state: "Ciudad de México",
        country: "Mexico",
        lat: 19.3686310,
        lng: -99.1503544,
        name: "Acogedor departamento en buena zona de Iztapalapa",
        description: "Departamento de dos habitaciones, muy luminoso  en zona de Iztapalapa aledaña a Coyoacán.",
        price: 50,
      },
      {
        ownerId: 2,
        address: "Strada Alexandru Ioan Cuza 69B",
        city: "Vişeu De Sus",
        state: "Maramureș County",
        country: "Romania",
        lat: 47.7190062,
        lng: 24.4506043,
        name: "Valea Vinului Dome - a glamping experience",
        description: "Valea Vinului Dome is a geodesic dome located in an idyllic setting with a superb view of the Wine Valley and Rodnei Mountains. It's a dream place, perfect for relaxing and recharging batteries.",
        price: 70
      }
    ], {validate: true});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const {Op} = require("sequelize");
    await queryInterface.bulkDelete(options, {
      address: {[Op.in]: ["5240 S Tuscony S", "Eje Central Lázaro Cárdenas 422", "Strada Alexandru Ioan Cuza 69B"]}
    }, {});
  }
};
