const express = require('express');
const jwt = require('jsonwebtoken');
const Brand = require('../schemas/brand');
const Company = require('../schemas/company');

const { verifyToken, isLoggedIn } = require('./middlewares');

const router = express.Router();

// router.post("/token", async (req,res)=>{ // 토큰 발급 요청이 오면
//     const { clientSecret } = req.body;
//     console.log("345698765", clientSecret)
//     try{
//         const result = await Company.findOne({
//             companyName:clientSecret
//         }).exec();
//         if(!result){
//             return res.status(401).json({
//                 code : 401,
//                 message : "등록되지 않은 회사입니다. 회사부터 등록해주세요"
//             })
//         }else{
//             console.log("등록이 되어 있는 회사면 보내줄 토큰 확인 정보",result)
//         const token = await jwt.sign({
//             name:result.companyName
//         }, process.env.JWT_SECRET,{
//             expiresIn: '1h',
//             issuer:"brand"
//         })
//         return res.json({
//             code:200,
//             message:' 토큰 발급 완료',
//             data:token
//         })
//         }
//     } catch(err){ //응답을 json으로 통일하기 위해
//         console.log(err);
//         return res.status(500).json({
//             code: 500,
//             message: "서버에러"
//         })
//     }
// })

router.post('/tokenIssued', isLoggedIn, async (req, res) => {
	try {
		const token = await jwt.sign(
			{
				name: req.app.get('userSession').companyName,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: '1h',
				issuer: 'brand',
			}
		);

		req.session.jwt = await token;

		return res.status(200).json({
			code: 200,
			message: '토큰 발급 완료',
			data: token,
			result: true,
		});
	} catch (err) {
		console.log('토큰 발급 에러', err);
		return res.status(500).json({
			code: 500,
			message: '서버에러',
		});
	}
});

router.get('/test', verifyToken, (req, res) => {
	// verifyToken 에서 req.decoded에 저장을 해준다.
	return res.status(200).json(req.decoded);
});

router.get('/getTokenName', (req, res) => {
	console.log('토큰 확인을 위한 req222222222222222222222222222222', req);
	res.status(200).json({
		code: 200,
		result: '토큰 확인',
	});
});

module.exports = router;
