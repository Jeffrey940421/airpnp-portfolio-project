const express = require('express');
const { requireAuth, spotImageExist, spotImageAuthorization } = require('../../utils/auth');
const { Spot, Review, ReviewImage, SpotImage, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();
const sequelize = require("sequelize");

const validateSpotImageInfo = [
  check('preview')
    .exists({checkNull: true})
    .custom((value) => {
      if (value === true || value === false) {
        return true;
      }
      return false;
    })
    .withMessage("Preview must be boolean"),
  handleValidationErrors
]


// delete a spot image
router.delete("/:imageId", requireAuth, spotImageExist, spotImageAuthorization, async (req, res, next) => {
  const spotImage = req.spotImage;
  await spotImage.destroy();
  const spotImages = spotImage.Spot.SpotImages
  if (spotImages && spotImage.preview) {
    spotImages[0].preview = true;
    await spotImages[0].save();
  }
  res.json({
    message: "Successfully deleted"
  })
})

// edit a spot image
router.put("/:imageId", requireAuth, spotImageExist, spotImageAuthorization, validateSpotImageInfo, async (req, res, next) => {
  const spotImage = req.spotImage;
  const {preview} = req.body
  let updatedSpotImage = await spotImage.update({preview});
  updatedSpotImage = updatedSpotImage.toJSON();
  delete updatedSpotImage.Spot;
  res.json(updatedSpotImage);
})

module.exports = router;
