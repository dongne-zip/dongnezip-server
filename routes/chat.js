const express = require("express");
const router = express.Router();
const controller = require("../controller/Cchat");

router.get("/", controller.chat);
router.post("/image", upload.single("image"), controller.image);

module.exports = router;
