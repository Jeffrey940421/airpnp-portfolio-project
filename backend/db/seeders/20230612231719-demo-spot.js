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
        address: "25186 Gail Dr",
        city: "Idyllwild-Pine Cove",
        state: "California",
        country: "United States",
        lat: 33.7566337,
        lng: -116.7334091,
        name: "Idyllwild Cozy Lakeview Lodge",
        description: "Cozy Lakeview Lodge is tucked in the trees and only 5 minutes from town! The space is cozy and private with beautiful views out of every window. Our property is unique as we have easy access parking, and a killer mountain view. You will feel like you’re in a hidden hideaway. The streets are plowed from highway 243 straight to the cabin during the winter. We have 3 parking spots in front of the cabin. Only 1 might be available during peak snow season!",
        price: 211
      },
      {
        ownerId: 1,
        address: "Rua Do Campo De Jogos",
        city: "Vila Nova de Milfontes",
        state: "Beja",
        country: "Portugal",
        lat: 37.7287698,
        lng: -8.7831108,
        name: "Lazy Days | Adults Only by Duna Parque Group",
        description: "Duna Parque Group está situado em Vila Nova de Milfontes, a 650 metros da Praia da Franquia. O alojamento é composto por 6 quartos, todos com casa de banho privativa. Os hóspedes partilharão uma sala de estar com televisão, zona de refeições e alguns utensílios básicos de cozinha. No terraço com vista mar, poderão desfrutar da piscina! Todas as manhãs é servido um pequeno-almoço continental na pastelaria Lazy Days/Lazy Nights localizada no piso térreo do edifício.",
        price: 152,
      },
      {
        ownerId: 2,
        address: "Jl. Sawah Indah, Peliatan",
        city: "Ubud",
        state: "Bali",
        country: "Indonesia",
        lat: -8.5166951,
        lng: 115.2741690,
        name: "Bali Bamboo House | Rescape Ubud - Resound Villa",
        description: "Rescape Ubud is an uniquely designed villa built by bamboo, allowing guests to unwind and escape from all the daily hassle. This stay is perfect for couples, young families, artists, musicians and everyone who loves to fully embrace the nature. The place feels secluded and yet only 5 minutes away by bike from central Ubud!",
        price: 180
      },
      {
        ownerId: 1,
        address: "Rural",
        city: "Villamaría",
        state: "Caldas",
        country: "Colombia",
        lat: 5.0330706,
        lng: -75.5148855,
        name: "Habitación privada/NazcaGlamping",
        description: "Rescape Ubud is an uniquely designed villa built by bamboo, allowing guests to unwind and escape from all the daily hassle. This stay is perfect for couples, young families, artists, musicians and everyone who loves to fully embrace the nature. The place feels secluded and yet only 5 minutes away by bike from central Ubud!",
        price: 107
      }
    ], {validate: true});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const {Op} = require("sequelize");
    await queryInterface.bulkDelete(options, {
      address: {[Op.in]: ["25186 Gail Dr", "Rua Do Campo De Jogos", "Jl. Sawah Indah, Peliatan", "Rural"]}
    }, {});
  }
};
