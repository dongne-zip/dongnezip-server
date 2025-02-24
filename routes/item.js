const express = require("express");
const controller = require("../controller/Citem");
const router = express.Router();
const authenticateToken = require("../middlewares/jwtAuth");
const upload = require("../config/s3");

console.log(controller);

/** 전체 상품 조회 */
// GET /api-server/item/item
router.get("/item", authenticateToken, controller.getAllItems);

/** 상품 검색 */
// GET /api-server/item/search?keyword=검색어
router.get("/search", authenticateToken, controller.searchItems);

/** 상품 상세 조회 */
// GET /api-server/item/:itemId
router.get("/:itemId", authenticateToken, controller.getItemDetail);

/** 판매 글 수정 */
// PATCH /api-server/item/:itemId
router.patch(
  "/:itemId",
  authenticateToken,
  upload.array("imageUrls", 5),
  controller.updateItem
);

/** 판매 글 삭제 */
// DELETE /api-server/item/:itemId
router.delete("/:itemId", authenticateToken, controller.deleteItem);

/** 판매 글 등록 */
// POST /api-server/item/addItem
router.post(
  "/addItem",
  upload.array("imageUrls", 5),
  authenticateToken,
  controller.createItem
);

/** 상품 찜하기 */
// POST /api-server/item/favorites
router.post("/favorites", authenticateToken, controller.addToFavorites);

/** 상품 찜 취소 */
// DELETE /api-server/item/favorites/:itemId
router.delete(
  "/favorites/:itemId",
  authenticateToken,
  controller.removeFromFavorites
);

/** 상품 거래 완료 */
//POST /api-server/item/:itemId/complete
// router.post(
//   "/:itemId/complete",
//   authenticateToken,
//   controller.completeItemTransaction
// );

// /** 찜한 상품 목록 조회 */
// // GET /api-server/item/favorites
// router.get("/favorites", authenticateToken, controller.getFavoriteItems);

module.exports = router;
