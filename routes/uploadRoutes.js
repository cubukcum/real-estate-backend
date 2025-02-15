const express = require("express");
const router = express.Router();
const {
  uploadMiddleware,
  uploadImage,
} = require("../controllers/uploadController");

router.post("/", uploadMiddleware, uploadImage);

module.exports = router;
