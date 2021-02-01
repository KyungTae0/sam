const express = require("express");
const crypto = require("crypto");
const mysql = require("promise-mysql");
const router = express.Router();
const db = require("../config/db");
const { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } = require("constants");
const jwt = require('jsonwebtoken')

const secretObj = require('../config/jwt');

  router.post("/signup", async function (req, res) {
  console.log(req.body);
  //step 1 . front에서 전달받은 변수 담기
  let email = req.body.email;
  let password = req.body.password;
  const checkPassword = req.body.checkPassword;
  try {
    connection = await mysql.createConnection(db);
    connection.query("SET NAMES utf8");
    //step 2 . validation(유효성체크)
    if (!email) {
      message =
        "아이디는 공백일 수 없습니다. 아이디를 다시 확인해주시기 바랍니다.";
      return res.status(200).json({
        success: false,
        message: message,
      });
    }
    if (!password) {
      message =
        "비밀번호는 공백일 수 없습니다. 비밀번호를 다시 확인해주시기 바랍니다.";
      return res.status(200).json({
        success: false,
        message: message,
      });
    }
    if (password != checkPassword) {
      message = "비밀번호가 일치하지 않습니다. 다시 확인하여 주시기 바랍니다.";
      return res.status(200).json({
        success: false,
        message: message,
      });
    }

    // Email 체크 쿼리 전송
    let rows = await connection.query(
      `SELECT * FROM sam WHERE email = '${email}';`
    );
    if (rows.length != 0) {
      return res.status(200).json({success: false,
        message: `이미 등록된 아이디 입니다.`,
      });
    }

    //비밀번호 암호화 시작
    // salt 값은 현재 시간에 랜덤 값을 곱해서 생성된 문자열로 생성했습니다.
    let salt = Math.round(new Date().valueOf() * Math.random()) + "";

    // createHash(algorithm sha512가 더 길지만 안전함)
    // update(평문 비밀번호에 salt를 더한값을 )
    // digest(인코딩 방식)
    let hashPassword = crypto
      .createHash("sha512")
      .update(password + salt)
      .digest("base64");

    await connection.query(
      `INSERT INTO test.sam (wdate, email, password, salt) VALUES (NOW(), '${email}', '${hashPassword}', '${salt}');`
     );

    res.status(200).json({
      success: true,
      message: `"회원가입에 성공하였습니다."`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: true,
      message: `"회원가입에 실패하였습니다."`,
    });
  }
});

router.post("/signin", async function (req, res) {
  console.log("asdf");
  let email = req.body.email;
  let password = req.body.password;

  try{
    connection = await mysql.createConnection(db);
    connection.query("SET NAMES utf8");
    if (!email) {
      message =
        "아이디는 공백일 수 없습니다. 아이디를 다시 확인해주시기 바랍니다.";
      return res.status(200).json({
        success: false,
        message: message,
      });
    }
    if (!password) {
      message =
        "비밀번호는 공백일 수 없습니다. 비밀번호를 다시 확인해주시기 바랍니다.";
      return res.status(200).json({
        success: false,
        message: message,
      });
    }


    let rows = await connection.query(`SELECT * FROM test.sam WHERE email = '${email}';`);

    if(rows.length <= 0){
      return res.json({
        success:false,
        message:"존재하지 않는 ID 입니다. 계정정보를 확인 후 재시도 바랍니다."
      });
    }

    
    let salt = rows[0].salt;
    let hashPassword = crypto
      .createHash("sha512") //sha256 ,512가 있음
      .update(password + salt)  // 암호화할 데이터
      .digest("base64");    // 인코딩방식 ( base64가 비교적 짧아 선호된다고함 )


    // 계정 검사
    rows = await connection.query(
      `select email from test.sam where email = '${email}' and password = '${hashPassword}';`
    );

    if(rows.length <= 0){
      return res.stauts(200).json({
        success: false,
        message: "비밀번호가 일치하지 않습니다."
      });
    };

    // 토큰에 담을 정보
    const payLoad = {
      email: email
    };
    // jwt 를 이용한 토큰생성
    const token = jwt.sign(payLoad, secretObj.secret/*비밀키 모듈?? 임의로 생성하는건가*/ ,{
      expiresIn:'120' // 유효시간
    });

    res.cookie("user",token);
    res.status(200).json({
      success:true,
      message:"로그인성공",
      token:token
    });
  }
  catch(e){
    console.log(e.message);
  }

});

router.post("/auth", async function (req, res) {
  let token = req.cookies;
  console.log(token);
return;
  let decoded = jwt.verify(token, secretObj.secret);
  
  console.log("hello auth");
  return true;
});

module.exports = router;
