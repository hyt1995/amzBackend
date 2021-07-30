const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const webSocket = require('./socket');
const multer = require('multer');
const axios = require('axios');
const schedule = require('node-schedule');
const mailer = require('nodemailer');
const bcrypt = require('bcrypt');
const passport = require('passport');
const passportConfig = require('./passport');

const { isLoggedIn, isNotLoggedIn } = require('./routes/middlewares');

// graphql 연결을 위한
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const connect = require('./schemas');
const Brand = require('./schemas/brand');
const rvCalculator = require('./schemas/revenueCalculator');
const Pdtemplate = require('./schemas/pdTamplate');
const BestSellerRank = require('./schemas/bestSellerRank');
const Company = require('./schemas/company');
// 토큰 발급을 위한
const tokenIssuedRouter = require('./routes/tokenIssued');
// 아마존 리스트 작성을 위한
const amzRouter = require('./routes/amz');
// 로그인 로그아웃을 위한
const loginRouter = require('./routes/auth');

require('dotenv').config();

const app = express();

connect();

// 세션부분을 변수로 뺀다. 그래야 socket.IO에서 사용이 가능하다.
const sessionMiddleware = session({
	resave: false, // 세션을 항상 저장할지 여부를 정하는 값
	saveUninitialized: true, // 세션을저장할때 초기화 여부
	secret: process.env.COOKIE_SECRET, // 세션을 암호화 해줌
	cookie: {
		httpOnly: true,
		secure: false,
		maxAge: 3.6e6 * 24,
	},
});

// 아마존 셀러 정보를 가져오기 위한 변수
const params = {
	api_key: process.env.AMZ_SELLER_API_KEY,
	type: 'bestsellers',
	amazon_domain: 'amazon.com',
	category_id: 'bestsellers_appliances',
};

// 이미지 저장 시 저장 될 위치를 정하는 곳
const uploadImg = multer({
	storage: multer.diskStorage({
		destination(req, file, cb) {
			cb(null, 'uploads/'); // 파일이 저장되는 위치
		},
		filename(req, file, cb) {
			const ext = path.extname(file.originalname);
			cb(
				null,
				path.basename(file.originalname, ext) + new Date().valueOf() + ext
			);
		},
	}),
	limit: { fileSize: 10 * 1024 * 1024 },
});

app.set('port', process.env.PORT || 8082);

passportConfig(passport);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // body를 해석해준다.
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use('/', tokenIssuedRouter); // 토큰 발급을 위한
app.use('/amz', amzRouter); // 아마존 리스트 작성을 위한
app.use('/auth', loginRouter); // 로그인 로그아웃을 위한

// app.post('/room', async (req,res,next)=>{
//     try{ // 방을 생성하고
//         const room = new room({
//             title:req.body.title,
//         })
//         const newRoom = await room.save();
//         const io = req.app.get('io'); // 아까 set으로 저장한 io를 가져오고
//         io.of('/room').emit('newRoom',newRoom) // 새로운 방이 생겼다고 알려주고
//         res.status(200).json({result:true})
//     } catch(error){
//         console.error(error);
//         next(error);
//     }
// })

// //방에 들어가는 것
// app.get('/room/:id', async (req,res,next)=>{
//     try{
//         const room = await Room.findOne({_id:req.params.id});
//         if(!room){ //잘못된 방에 들어갔을 경우
//             return res.redirect('/');
//         }
//         if(room.password && ){}
//     } catch(error){
//         console.error(error);
//         next(error);
//     }
// })

const mailSender = {
	//메일 발송 함수
	sendGmail: function (param) {
		const transporter = mailer.createTransport({
			service: 'gmail',
			prot: 587,
			host: 'smtp.gmail.com',
			secure: false,
			requireTLS: true,
			auth: {
				user: 'hanyt1995@gmail.com',
				pass: process.env.USER_PASSWORD,
			},
		});

		const mailOptions = {
			from: 'hanyt1995@gmail.com', // 보내는 이메일
			to: param.toEmail, //수신할 이메일
			subject: param.subject, //메일 제목
			text: param.text, //메일 제목
		};

		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log('Email sent:  ' + info.response);
			}
		});
	},
};

const emailParam = {
	toEmail: 'hanyt1995@gmail.com',
	subject: '아마존 베스트 셀러 랭킹이 잘 저장이 되었습니다.',
	text: ' ㅈㄱㄴ 들어가서 디비를 확인해주세요',
};

// 아마존 데이터 특정 날짜 최신화를 위한
async function lastestAmzBestSellerRankData() {
	try {
		console.log('lastestAmzBestSellerRankData 함수 실행');
		// 특정 날짜 시간마다 실행시키기
		// await schedule.scheduleJob({hour : 00, minute:16, dayOfWeek: 1}, async function (){

		// 데이터 불러오기
		const getDBBestSellerRank = await BestSellerRank.find().exec();
		// 데이터가 50개일 경우 기존 데이터 삭제
		if (getDBBestSellerRank.length !== 0) {
			const result = await Promise.all(
				getDBBestSellerRank.map(i => {
					BestSellerRank.deleteOne({ sellerRank: i.sellerRank });
				})
			).then(res => console.log('기존 데이터 삭제 완료'));
		} else {
			//데이터가 50개가 안될 경우
			console.log('데이터에 문제가 있습니다. ');
			return '';
		}

		//아마존에서 데이터를 가져오기
		await axios
			.get('https://api.rainforestapi.com/request', { params })
			.then(async response => {
				//데이터를 가져온뒤 저장하기
				const resultSave = await Promise.all(
					response.data.bestsellers.map(async i => {
						const bestSellerRank = await new BestSellerRank({
							asin: i.asin,
							productName: i.title,
							currCategory: i.current_category.name,
							imgUrl: i.image,
							sellerRank: i.rank,
							priceUpper: i.price_upper.value,
							productLink: i.link,
						});
						await bestSellerRank.save();
					})
				);
				if (resultSave) {
					const sendEmailResult = await mailSender.sendGmail(emailParam);
					if (sendEmailResult) {
						console.log('이메일이 보내졌습니다.');
					} else {
						console.log('이메일에 문제가 있어 취소되었습니다.');
					}
				} else {
					console.log('문제가 있어 과정이 완료되지 않았습니다.');
				}
			});
		// });
	} catch (error) {
		console.log('에러가 있습니다.', error);
	}
}
// 아마존 데이터 최신화를 위한 함수를 실행시킨다.
// lastestAmzBestSellerRankData()

//////////////// single, array(여러개  단일 필드),fields(여러개  여러 필드),none(이미지 x)
app.post('/img', uploadImg.single('imgFile'), (req, res) => {
	console.log('내가 받아온 파일 확인', req.file, req.body);
	res.status(200).send('성공적으로 파일이 전송 완료되었습니다.');
});

// app.get('/realTimeAuction', (req, res, next) => {
// 	console.log('다른 서버에 보낼 정보', req.app.get('userSession'));
// 	res.status(200).json({
// 		auction: req.app.get('userSession'),
// 	});
// });

// app.get('/postUserId', (req, res, next) => {
// 	res.status(200).json({
// 		code: 200,
// 		result: req.app.get('userSession'),
// 	});
// });

// app.get('/qqww', (req, res) => {
// 	console.log('1', req.session);
// 	if (!req.session.num) {
// 		console.log('3', req.session);
// 		req.session.num = 1;
// 	} else {
// 		console.log('4', req.session);
// 		req.session.num = req.session.num + 1;
// 	}
// 	console.log('2', req.session, '****', req.sessionStore.sessions); // 세션 아이디를 사용을 하는데 어떻게
// 	res.status(200).json({
// 		code: 200,
// 		result: req.sessionStore.sessions,
// 	});
// });

// 'gF0qvhTGMHBqO6o2svL98JAUSspEj20w'

app.use((err, req, res, next) => {
	// const err = new Error('Not Found');
	err.status = 404;
	// next(err);
	console.log(err);
});

// listen으로 실행되는 서버도 변수에 저장이 가능하다 그서버가 express server 즉 node서버 이다.
const server = app.listen(app.get('port'), () => {
	console.log(`서버가 ${app.get('port')}포트에서 실행중입니다.`);
});
// 이게 socket.js의 server이라는 매개변수로 들어가게 된다.
webSocket(server, app, sessionMiddleware);
