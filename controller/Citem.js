const axios = require("axios");
const {
  Item,
  Category,
  Map,
  Region,
  ItemImage,
  Sequelize,
  Favorite,
  Transaction,
} = require("../model");
const upload = require("../config/s3");
require("dotenv").config();
const { Op } = require("sequelize");

const KAKAO_API_KEY = process.env.KAKAO_API_KEY; // 카카오 REST API 키 입력

// 카카오맵 API를 이용한 좌표 → 주소 변환 함수
async function getAddressFromCoordinatesKakao(latitude, longitude) {
  try {
    console.log("카카오API", KAKAO_API_KEY);
    const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`;
    const headers = { Authorization: `KakaoAK ${KAKAO_API_KEY}` };

    const response = await axios.get(url, { headers });
    const { documents } = response.data;

    if (!documents || documents.length === 0) {
      return {
        province: null,
        district: null,
        address: null,
        roadAddress: null,
      };
    }

    const addressInfo = documents[0].address;
    const roadAddressInfo = documents[0].road_address || null;

    return {
      province: addressInfo.region_1depth_name, // 시/도
      district: addressInfo.region_2depth_name, // 시/군/구
      address: addressInfo.address_name, // 전체 주소
      roadAddress: roadAddressInfo
        ? roadAddressInfo.address_name
        : "도로명 주소 없음",
    };
  } catch (error) {
    console.error("Kakao Maps API Error:", error);
    return { province: null, district: null, address: null, roadAddress: null };
  }
}

// 판매 글 등록 + 이미지 업로드
// POST /api-server/item/addItem
exports.createItem = async (req, res) => {
  const transaction = await Item.sequelize.transaction(); // 트랜잭션 시작
  try {
    const {
      categoryId,
      title,
      price,
      detail,
      itemStatus,
      latitude,
      longitude,
    } = req.body;
    const userId = 2;

    console.log(
      categoryId,
      title,
      price,
      detail,
      itemStatus,
      latitude,
      longitude
    );

    if (
      !categoryId ||
      !title ||
      !price ||
      !itemStatus ||
      !latitude ||
      !longitude
    ) {
      return res
        .status(400)
        .json({ success: false, message: "필수 정보를 입력하세요." });
    }

    // Kakao Maps API를 이용하여 시/도(province), 시/군/구(district) 가져오기
    const { province, district, address, roadAddress } =
      await getAddressFromCoordinatesKakao(latitude, longitude);

    if (!province || !district) {
      return res
        .status(404)
        .json({ success: false, message: "위치 정보를 가져올 수 없습니다." });
    }

    // `region` 테이블에서 해당 지역 조회하여 `regionId` 찾기
    let regionData = await Region.findOne(
      { where: { province, district } },
      { transaction }
    );

    // 없다면 지역 데이터 추가
    if (!regionData) {
      regionData = await Region.create({ province, district }, { transaction });
    }

    // `map` 테이블에서 위도/경도로 위치 찾기
    let mapData = await Map.findOne(
      { where: { latitude, longitude } },
      { transaction }
    );

    // 없다면 새로운 위치 추가
    if (!mapData) {
      mapData = await Map.create(
        {
          latitude,
          longitude,
          address,
          road_address: roadAddress,
        },
        { transaction }
      );
    }

    // 상품 데이터 저장
    const newItem = await Item.create(
      {
        userId,
        categoryId,
        regionId: regionData.id, // 지역 정보 저장
        mapId: mapData.id, // 위치 정보 저장
        title,
        price,
        status: "거래가능",
        detail,
        itemStatus: itemStatus || "중",
      },
      { transaction }
    );

    // 이미지 업로드 및 저장
    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map((file) => ({
        itemId: newItem.id,
        imageUrl: file.location, // AWS S3 URL
      }));

      await ItemImage.bulkCreate(imageRecords, { transaction });
    }

    // 트랜잭션 커밋 (모든 작업이 성공적으로 완료됨)
    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "상품이 등록되었습니다.",
      data: newItem,
    });
  } catch (error) {
    await transaction.rollback(); // 오류 발생 시 롤백
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "판매 글 등록 실패", error });
  }
};

/** 전체 상품 조회 (카테고리, 지역, 거래 상태 필터링 추가 + 사용자 찜 여부 포함) */
// GET /api-server/item
exports.getAllItems = async (req, res) => {
  try {
    let { categoryId, regionId, status, sortBy } = req.query;
    const userId = 1;
    //const userId = req.user?.id || null; //  현재 로그인한 사용자의 ID

    // 1) 필터 설정
    const filter = {};
    if (categoryId && parseInt(categoryId, 10) > 0) {
      filter.categoryId = parseInt(categoryId, 10);
    }
    if (regionId && parseInt(regionId, 10) > 0) {
      filter.regionId = parseInt(regionId, 10);
    }

    // 2) attributes: 거래 상태 + 인기순 계산 + 찜 여부 추가
    const attributes = [
      "id",
      "userId",
      "title",
      "price",
      "detail",
      "itemStatus",
      [Sequelize.fn("MAX", Sequelize.col("Transactions.buyer_id")), "buyerId"],
      [Sequelize.fn("COUNT", Sequelize.col("Favorites.id")), "favCount"],
      [Sequelize.fn("MIN", Sequelize.col("ItemImages.image_url")), "imageUrl"], // ✅ 대표 이미지 가져오기
    ];

    // 3) group 설정
    const group = ["Item.id", "Region.id", "Category.id"];

    // 4) 거래 상태 필터 (HAVING)
    let havingCondition = {};
    if (status === "available") {
      havingCondition.buyerId = { [Op.eq]: null };
    } else if (status === "completed") {
      havingCondition.buyerId = { [Op.not]: null };
    }

    // 5) 정렬 로직
    let order = [];
    if (sortBy === "popular") {
      order = [[Sequelize.literal("favCount"), "DESC"]];
    } else {
      order = [["createdAt", "DESC"]]; // 기본값 (최신순)
    }

    // 6) findAll 쿼리 실행
    const items = await Item.findAll({
      where: filter,
      attributes,
      include: [
        {
          model: Transaction,
          attributes: [],
          required: false,
        },
        {
          model: Favorite, // ✅ 사용자의 찜 여부 확인
          attributes: ["userId"],
          required: false,
          where: userId ? { userId } : undefined, // 현재 사용자의 찜한 상품만 조회
        },
        {
          model: Region,
          attributes: ["id", "district"],
          required: false,
        },
        {
          model: Category,
          attributes: ["id", "category"],
          required: false,
        },
        {
          model: ItemImage,
          attributes: [],
          required: false,
        },
      ],
      group,
      having:
        Object.keys(havingCondition).length > 0 ? havingCondition : undefined,
      order,
    });

    // 7) 프론트엔드에 전달할 데이터 변환 (찜 여부 추가)
    const responseData = items.map((item) => ({
      ...item.get({ plain: true }), // Sequelize 객체를 JSON으로 변환
      isFavorite: item.Favorites && item.Favorites.length > 0,
    }));

    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

/** 상품 검색 */
// GET /api-server/items?keyword=검색어
exports.searchItems = async (req, res) => {
  try {
    let { keyword } = req.query;

    // 검색어가 없으면 메시지 반환
    if (!keyword) {
      return res
        .status(200)
        .json({ success: true, message: "상품이 없습니다." });
    }

    const items = await Item.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } }, // 제목 검색
          { detail: { [Op.like]: `%${keyword}%` } }, // 상세 설명 검색
        ],
      },
      include: [
        { model: Category, attributes: ["category"] }, // 카테고리 조인
        { model: Region, attributes: ["province", "district"] }, // 지역 조인
        {
          model: ItemImage,
          attributes: ["imageUrl"],
          limit: 1, // 첫 번째 이미지 하나만 가져오기
          order: [["id", "ASC"]], // id 기준 오름차순 정렬
          separate: true, // 별도의 쿼리 실행 (N+1 문제 방지)
          required: false, // 이미지가 없어도 Item이 조회되도록 설정
        },
      ],
      attributes: [
        "id",
        "userId",
        "title",
        "price",
        "status",
        "detail",
        "itemStatus",
      ],
    });

    // 검색 결과가 없을 경우 메시지 반환
    if (items.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "상품이 없습니다." });
    }

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error("Error searching items:", error);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

/** 상품 찜하기 */
// POST /api-server/item/favorites
exports.addToFavorites = async (req, res) => {
  try {
    const { itemId } = req.body; // 요청에서 userId, itemId 받기
    userId = 1; //임시로 저장

    // 필수 값 확인
    if (!userId || !itemId) {
      return res
        .status(400)
        .json({ success: false, message: "유저 ID와 상품 ID가 필요합니다." });
    }

    // 해당 아이템이 존재하는지 확인
    const item = await Item.findByPk(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "존재하지 않는 상품입니다." });
    }

    // 이미 찜한 상품인지 확인
    const existingFavorite = await Favorite.findOne({
      where: { userId, itemId },
    });

    if (existingFavorite) {
      return res
        .status(409)
        .json({ success: false, message: "이미 찜한 상품입니다." });
    }

    // 찜하기 추가
    await Favorite.create({ userId, itemId });

    return res
      .status(201)
      .json({ success: true, message: "상품을 찜했습니다." });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

/** 상품 찜 취소 */
// DELETE /api-server/item/favorites/:itemId
exports.removeFromFavorites = async (req, res) => {
  try {
    console.log("Received DELETE request:", req.params);

    const { itemId } = req.params;
    const userId = 1; // 임시로 저장 (실제 로그인 유저로 변경해야 함)

    // 필수 값 확인
    if (!userId || !itemId) {
      return res
        .status(400)
        .json({ success: false, message: "유저 ID와 상품 ID가 필요합니다." });
    }

    // 찜한 상품 존재 여부 확인
    const favorite = await Favorite.findOne({
      where: { userId, itemId },
    });

    if (!favorite) {
      return res
        .status(404)
        .json({ success: false, message: "찜한 상품이 존재하지 않습니다." });
    }

    // 찜한 상품 삭제
    await Favorite.destroy({ where: { userId, itemId } });

    return res
      .status(200)
      .json({ success: true, message: "찜한 상품이 취소되었습니다." });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};
