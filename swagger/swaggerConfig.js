const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

// Swagger 문서 파일 로드
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));

// Swagger 설정 함수
const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  console.log("Swagger UI: http://localhost:8080/api-docs");
};

module.exports = setupSwagger;
