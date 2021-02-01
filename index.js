const express = require("express"); // Express 기본 모듈 불러오기

const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");

const app = express(); // 익스프레스 객체 생성
// 라우터 객체 참조
const routes = require("./routes");

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }));

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json());

// 라우터 객체 등록
app.use(routes);
app.set("port", 4000); //backend port

let cors_origin = [`http://localhost:3000`]; // 로컬개발용 기본 cors origin, front 3000 port
app.use(
  cors({
    origin: cors_origin,
    credentials: true,
  })
);

const server = http.createServer(app);

// Express 서버 시작
server.listen(app.get("port"), () =>
  console.log("서버가 시작되었습니다. 포트 : " + app.get("port"))
);


