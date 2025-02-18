const express = require("express");
const router = express.Router();
const controller = require("../controller/Cchat");

router.get("/", controller.chat);

module.exports = router;
