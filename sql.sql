
INSERT INTO map (id, latitude, longitude, address, road_address, createdAt, updatedAt)
VALUES
(1, 37.5665, 126.9780, '서울특별시 중구 세종대로 110', '서울특별시 중구 세종대로 110', NOW(), NOW()),
(2, 37.541, 127.058, '서울특별시 강남구 테헤란로 152', '서울특별시 강남구 테헤란로 152', NOW(), NOW()),
(3, 37.484, 126.896, '서울특별시 구로구 구로동 97', '서울특별시 구로구 구로동 97', NOW(), NOW()),
(4, 37.503, 127.024, '서울특별시 서초구 서초대로 77길 55', '서울특별시 서초구 서초대로 77길 55', NOW(), NOW()),
(5, 37.394, 127.110, '경기도 성남시 분당구 정자동 178-1', '경기도 성남시 분당구 정자동 178-1', NOW(), NOW());


INSERT INTO user (email, snsId, provider, password, user_nm, nickname, profile_img, createdAt, updatedAt)
VALUES
('test1@example.com', 'kakao_123456', 'kakao', NULL, '김철수', 'chulsoo123', 'https://example.com/profile1.jpg', NOW(), NOW()),
('test2@example.com', 'google_789012', 'google', NULL, '이영희', 'younghee89', 'https://example.com/profile2.jpg', NOW(), NOW()),
('localuser@example.com', NULL, 'local', 'hashedpassword123', '박민수', 'minsu99', 'https://example.com/profile3.jpg', NOW(), NOW()),
('test4@example.com', 'kakao_654321', 'kakao', NULL, '정희진', 'heejin99', 'https://example.com/profile4.jpg', NOW(), NOW()),
('test5@example.com', 'google_321789', 'google', NULL, '최영수', 'youngsoo77', 'https://example.com/profile5.jpg', NOW(), NOW());



INSERT INTO category (id, category, createdAt, updatedAt) VALUES
(1, '의류/미용', NOW(), NOW()),
(2, '생활/주방', NOW(), NOW()),
(3, '디지털', NOW(), NOW()),
(4, '도서', NOW(), NOW()),
(5, '취미', NOW(), NOW()),
(6, '식품', NOW(), NOW()),
(7, '삽니다', NOW(), NOW()),
(8, '나눔', NOW(), NOW());


INSERT INTO Region (province, district, createdAt, updatedAt) VALUES
('서울', '강남구', NOW(), NOW()),
('서울', '강동구', NOW(), NOW()),
('서울', '강북구', NOW(), NOW()),
('서울', '강서구', NOW(), NOW()),
('서울', '관악구', NOW(), NOW()),
('서울', '광진구', NOW(), NOW()),
('서울', '구로구', NOW(), NOW()),
('서울', '금천구', NOW(), NOW()),
('서울', '노원구', NOW(), NOW()),
('서울', '도봉구', NOW(), NOW()),
('서울', '동대문구', NOW(), NOW()),
('서울', '동작구', NOW(), NOW()),
('서울', '마포구', NOW(), NOW()),
('서울', '서대문구', NOW(), NOW()),
('서울', '서초구', NOW(), NOW()),
('서울', '성동구', NOW(), NOW()),
('서울', '성북구', NOW(), NOW()),
('서울', '송파구', NOW(), NOW()),
('서울', '양천구', NOW(), NOW()),
('서울', '영등포구', NOW(), NOW()),
('서울', '용산구', NOW(), NOW()),
('서울', '은평구', NOW(), NOW()),
('서울', '종로구', NOW(), NOW()),
('서울', '중구', NOW(), NOW()),
('서울', '중랑구', NOW(), NOW());


INSERT INTO item (
  user_id, 
  category_id, 
  region_id, 
  map_id, 
  title, 
  price, 
  detail, 
  item_status, 
  createdAt, 
  updatedAt
)
VALUES
  (1, 1, 1, 1, '새상품 아이템', 10000, '미개봉 새상품입니다.', '새상품', NOW(), NOW()),
  (2, 2, 1, 2, '최상급 아이템', 20000, '사용감 거의 없는 최상급 상품.', '최상', NOW(), NOW()),
  (3, 1, 2, 3, '상급 아이템', 15000, '사용감은 조금 있으나 상태 양호.', '상', NOW(), NOW()),
  (4, 3, 2, 4, '중고 아이템', 5000, '사용감이 꽤 있는 중고 상품.', '중', NOW(), NOW()),
  (5, 5, 1, 5, '하급 아이템', 1000, '기스 많음, 저렴하게 팝니다.', '하', NOW(), NOW());


INSERT INTO Transaction (item_id, seller_id, buyer_id, createdAt, updatedAt)
VALUES 
    (1, 1, 2, NOW(), NOW()),  -- 거래 완료 (buyer_id 존재)
    (2, 3, NULL, NOW(), NOW()),  -- 거래 가능 (buyer_id 없음)
    (3, 4, 5, NOW(), NOW()),  -- 거래 완료 (buyer_id 존재)
    (4, 5, NULL, NOW(), NOW()),  -- 거래 가능 (buyer_id 없음)
    (5, 1, 3, NOW(), NOW());


CREATE DATABASE dongnezip
    DEFAULT CHARACTER SET ="utf8mb4" COLLATE utf8mb4_unicode_ci;