const express = require("express");
<<<<<<< Updated upstream
const router = express.Router();
const controller = require("../controller/Cchat");
const upload = require("../config/s3");

router.get("/", controller.chat);
router.post("/image", upload.single("image"), controller.image);
router.post("/room/:roomId/read", controller.messageAsRead);
=======
const controller = require("../controller/Cchat");
const router = express.Router();

// get
router.get("/", controller.chat);
>>>>>>> Stashed changes

module.exports = router;
