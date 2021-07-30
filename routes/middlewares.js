const jwt = require('jsonwebtoken');

exports.isLoggedIn = (req, res, next) => {
	if (req.app.get('userSession')) {
		next();
	} else {
		res.status(403).send('로그인 필요');
	}
};

exports.isNotLoggedIn = (req, res, next) => {
	// if (!req.isAuthenticated()) {
	if (!req.app.get('userSession')) {
		next();
	} else {
		res.redirect('/');
	}
};

// 토큰 검증을 위한
exports.verifyToken = (req, res, next) => {
	try {
		// req.headers.authorization에 넣어서 서버로 보내준다 그걸 받아서 검증
		req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
		console.log('검증 확인을 위한', req.headers.authorization, req.decoded);
		return next();
	} catch (err) {
		if (err) {
			if (err.name === 'TokenExpiredError') {
				return res.status(419).json({
					code: 419,
					message: '토큰이 완료되었습니다.',
				});
			}
			return res.status(419).json({
				code: 419,
				message: '유효하지 않은 토큰입니다.',
			});
		}
	}
};

// !!!!!!!!!!!! 그냥 getTokenResult주소를 실시간 경매에서 보내면 끝나는 거였음
// 현재는 마지막 로그인으로 req.app.get('userSession')에 마지막으로 저장된 정보를
// 불러오는데 req.sessionId를 교쳐서 보내면 해결이 되지 않을까 생각한다.

// 로그인시 토큰을 몽고서버에서 만들고
// 실시간 경매에서는 브랜드 이름을 토큰으로 받아서 써야 하는데
//  JWT_SECRET를 옥션서버에서 가지고 있다가 실시간 경매 주소로 들어가면
// 토큰으로 받아서 그대로 이름을 사용
// getTokenResult에서 토큰을 발급 받을 이유 없고 그냥 test로 JWT_SECRET함께
// 보내서 브랜드 이름만 받아오면 된다.(우)
