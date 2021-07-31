const express = require('express');
const { verifyToken, isLoggedIn } = require('./middlewares');
const rvCalculator = require('../schemas/revenueCalculator');
const Brand = require('../schemas/brand');
const Pdtemplate = require('../schemas/pdTamplate');
const BestSellerRank = require('../schemas/bestSellerRank');

const router = express.Router();

// 아마존 수익 계산기
router.post('/amzProfit', isLoggedIn, async (req, res, next) => {
	const {
		sellPrice,
		pdDeliver,
		amzFeed,
		amzPdPrice,
		delivery,
		orderFees,
		sellFees,
		PdsellFees,
		partAmzEarnings,
		profit,
	} = req.body;

	try {
		const sellPricePlusDelivery = (await Number(sellPrice)) + Number(delivery);
		const rvCal = await new rvCalculator({
			price: Number(sellPrice), // 판매가 rrr
			priductionDelivery: sellPricePlusDelivery, // 생산 배송비용
			amzFees: Number(orderFees) + Number(PdsellFees), //  아마존 수수료
			unitPrice: Number(amzPdPrice), // 제품 단가 rrr
			deliveryPrice: Number(delivery), // 배송비  rrr
			orderFees: Number(orderFees), // 주문처리 수수료   rrr
			saleFees: Number(sellFees), // 판매 수수료 비율   rrr
			productionFeesCost: Number(sellPrice) * (Number(sellFees) / 100), // 상품 판매 수수료 비용
			unitAmzIncome:
				Number(sellPrice) - (Number(orderFees) + Number(PdsellFees)), // 개당 아마존 소득
			unitProfit:
				Number(sellPrice) -
				sellPricePlusDelivery -
				(Number(orderFees) + Number(PdsellFees)), // 개당 이익
		});

		const saveResult = await rvCal.save();
		if (saveResult) {
			res.status(200).json({
				code: 200,
				marginRate: 33,
			});
		}
	} catch (err) {
		console.log('수익 계산기 저장 에러입니다.');
		res.status(404).json({
			code: 404,
			result: false,
		});
	}
});

// 아마존 수익 계산기
router.post('/amzPdTemplage', async (req, res, next) => {
	try {
		const {
			pdName,
			pdUrl,
			pdPrice,
			pdDesignation,
			bsrRanking,
			sizeGrade,
			kewordAmount,
		} = req.body;

		const brandsId = await Brand.findOne({
			PDName: pdName,
		}).exec();

		const pdtemplate = await new Pdtemplate({
			brandNameId: brandsId._id,
			representativeURL: pdUrl,
			currPrice: Number(pdPrice),
			normalDesignation: pdDesignation,
			BSRPd: bsrRanking,
			searchForAmount: kewordAmount,
			PDSizeRate: sizeGrade,
		});

		const saveResult = await pdtemplate.save();
		if (saveResult) {
			res.status(200).json({
				value: true,
			});
		}
	} catch (err) {
		console.log('수익 계산기 저장 에러', err);
		res.status(404).json({
			code: 404,
			result: false,
		});
	}
});

// 아마존 브랜드 입력
router.post('/brandList', isLoggedIn, async (req, res, next) => {
	try {
		const {
			pdName,
			patent,
			category,
			ecumus,
			etc,
			presentPDURL,
			searchNameArray,
		} = req.body;

		const brand = await new Brand({
			PDName: pdName,
			patentWhether: patent,
			categoryName: category,
			ecumusChenckList: ecumus,
			etc: etc,
		});

		await brand
			.save()
			.then(async result => {
				const pdTemplate = await new Pdtemplate({
					brandNameId: result._id,
					searchForAmount: searchNameArray,
					representativeURL: presentPDURL,
				});
				await pdTemplate
					.save()
					.then(async pdResult => {
						if (pdResult) {
							const sendResult = await Brand.find();
							await req.app
								.get('io')
								.of('/brandTable')
								.emit('tableData', sendResult);
						} else {
							res.status(404).json({
								code: 404,
								result: false,
							});
						}
					})
					.catch(err => {
						res.status(404).json({
							code: 404,
							result: false,
						});
					});
			})
			.catch(err => console.log('제품 템플릿 저장 에러', err));
	} catch (err) {
		console.log('브랜드 입력 에러');
		res.status(404).json({
			code: 404,
			result: false,
		});
	}
});

router.get('/main', async (req, res, next) => {
	const brandMain = await Brand.find().exec();
	return res.status(200).json(brandMain);
});

// 상품 리스트 가져오는 주소
router.get('/bestSellerRanking', isLoggedIn, async (req, res, next) => {
	try {
		const sessionId = await req.app.get('loginSessionId');
		console.log(
			'여기서 확인 +++++++++++++++++++++++++++',
			'세션만',
			req.sessionStore.sessions,
			'문자로 변환 안한거',
			req.sessionStore.sessions[sessionId],
			'세션 아이디 출력',
			req.sessionID,
			sessionId
		);
		const resultBestSeller = await BestSellerRank.find()
			.sort({ sellerRank: 1 })
			.exec();
		if (resultBestSeller) {
			return res.status(200).json(resultBestSeller);
			// return res.status(200).json(req.sessionStore.sessions[sessionIdString]);
		} else {
			return res.status(200).send('보내기가 실패했습니다.');
		}
	} catch (err) {
		console.log('get 상품 리스트 에러', err);
	}
});

module.exports = router;
