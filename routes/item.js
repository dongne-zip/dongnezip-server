const express = require("express");
const controller = require("../controller/Citem");
const router = express.Router();
const authenticateToken = require("../middlewares/jwtAuth");
const upload = require("../config/s3");

/** 전체 상품 조회 */
// GET /api-server/item
router.get("/item", controller.getAllItems);

// /** 상품 검색 */
// // GET /api-server/item?keyword=검색어
// router.get("/items", authenticateToken, controller.searchItems);

// /** 지역 설정 */
// // POST /api-server/item/pickRegion
// router.post("/pickRegion", authenticateToken, controller.setRegion);

// /** 카테고리 설정 */
// // POST /api-server/item/pickCategory
// router.post("/pickCategory", authenticateToken, controller.setCategory);

/** 판매 글 등록 */
// POST /api-server/item/addItem
router.post("/addItem", upload.array("images", 5), controller.createItem);

// /** 판매 글 수정 */
// // POST /api-server/item/editItem
// router.post("/editItem", authenticateToken, controller.updateItem);

// /** 판매 글 삭제 */
// // DELETE /api-server/item/deleteItem
// router.delete("/deleteItem", authenticateToken, controller.deleteItem);

// /** 거래 희망 장소 저장 */
// // POST /api-server/item/pickRegion
// router.post("/pickRegion", authenticateToken, controller.setRegion);

// /** 상품 찜하기 */
// // POST /api-server/item/save
// router.post("/save", authenticateToken, controller.addToFavorites);

/** 상품 이미지 업로드 (여러 개 가능) */
// POST /api-server/item/upload
// router.post("/upload", upload.array("images", 5), controller.uploadImages);

module.exports = router;
