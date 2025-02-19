const express = require("express");
const router = express.Router();
const controller = require("../controller/Cchat");
const upload = require("../config/s3");

router.get("/", controller.chat);
router.post("/image", upload.single("image"), controller.image);
router.post("/room/:roomId/read", controller.messageAsRead);

module.exports = router;
