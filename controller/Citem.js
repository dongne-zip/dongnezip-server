const { Item, Map, Region, Category } = require("../model");
const { getAddressFromCoordinates } = require("../utils/googleMaps");

// 판매 글 등록
// POST /api-server/item/addItem
exports.createItem = async (req, res) => {
  try {
    const {
      category_id,
      title,
      price,
      detail,
      item_status,
      latitude,
      longitude,
    } = req.body;
    const userId = req.user.id;

    if (
      !category_id ||
      !title ||
      !price ||
      !item_status ||
      !latitude ||
      !longitude
    ) {
      return res
        .status(400)
        .json({ success: false, message: "필수 정보를 입력하세요." });
    }

    // Google Maps API를 이용하여 시/도(province), 시/군/구(district) 가져오기
    const { province, district, address, roadAddress } =
      await getAddressFromCoordinates(latitude, longitude);

    if (!province || !district) {
      return res
        .status(404)
        .json({ success: false, message: "위치 정보를 가져올 수 없습니다." });
    }

    // `region` 테이블에서 해당 지역 조회하여 `region_id` 찾기
    let regionData = await Region.findOne({ where: { province, district } });

    // 없다면 지역 데이터 추가
    if (!regionData) {
      regionData = await Region.create({ province, district });
    }

    //  `map` 테이블에서 위도/경도로 위치 찾기
    let mapData = await Map.findOne({ where: { latitude, longitude } });

    // 없다면 새로운 위치 추가
    if (!mapData) {
      mapData = await Map.create({
        latitude,
        longitude,
        address,
        road_address: roadAddress || "도로명 주소 없음",
      });
    }

    // 4️⃣ 상품 데이터 저장
    const newItem = await Item.create({
      user_id: userId,
      category_id,
      region_id: regionData.id, // 지역 정보 저장
      map_id: mapData.id, // 위치 정보 저장
      title,
      price,
      status: "거래가능",
      detail,
      item_status: item_status || "중",
    });
    res.status(201).json({
      success: true,
      message: "상품이 등록되었습니다.",
      data: newItem,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "판매 글 등록 실패", error });
  }
};
