const axios = require("axios");
const { Item, Map, Region, ItemImage } = require("../model");
const upload = require("../config/s3");
require("dotenv").config();

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
