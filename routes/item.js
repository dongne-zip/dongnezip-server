const express = require("express");
const controller = require("../controller/Citem");
const router = express.Router();
const authenticateToken = require("../middlewares/jwtAuth");
const upload = require("../config/s3");

console.log(controller);
/** 전체 상품 조회 */
// GET /api-server/item/item
router.get("/item", controller.getAllItems);

/** 상품 검색 */
// GET /api-server/item/search?keyword=검색어
router.get("/search", controller.searchItems);

/** 상품 상세 조회 */
// GET /api-server/item/:itemId
router.get("/:itemId", controller.getItemDetail);

/** 판매 글 등록 */
// POST /api-server/item/addItem
router.post("/addItem", upload.array("imageUrls", 5), controller.createItem);

/** 판매 글 삭제 */
// DELETE /api-server/item/:itemId
router.delete("/:itemId", controller.deleteItem);

// /** 판매 글 수정 */
// // POST /api-server/item/editItem
// router.post("/editItem", authenticateToken, controller.updateItem);

// /** 판매 글 삭제 */
// // DELETE /api-server/item/deleteItem
// router.delete("/deleteItem", authenticateToken, controller.deleteItem);

/** 상품 찜하기 */
// POST /api-server/item/favorites
router.post("/favorites", controller.addToFavorites);

/** 상품 찜 취소 */
// DELETE /api-server/item/favorites/:itemId
router.delete("/favorites/:itemId", controller.removeFromFavorites);

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

/** 상품 이미지 업로드 (여러 개 가능) */
// POST /api-server/item/upload
// router.post("/upload", upload.array("images", 5), controller.uploadImages);

module.exports = router;
