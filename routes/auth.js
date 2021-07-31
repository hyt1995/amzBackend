const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const bcrypt = require('bcrypt');
const Company = require('../schemas/company');
const passport = require('passport');

// 토큰 연결 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const router = express.Router();

// 회사 이름으로 회원가입하기
router.post('/signUp', isNotLoggedIn, async (req, res, next) => {
	const { companyName, password, ceoName } = await req.body;

	const hash = await bcrypt.hash(password, 12);
	const signCompany = await new Company({
		companyName: companyName,
		password: hash,
		ceoName: ceoName,
	});
	await signCompany
		.save()
		.then(result => {
			console.log(result);
			res.status(200).json({
				result: true,
			});
		})
		.catch(err => {
			console.log(err);
			res.status(200).json({
				result: false,
			});
		});
});

// 로그인 하는 곳
router.post('/login', isNotLoggedIn, (req, res, next) => {
	passport.authenticate('local', (authError, user, info) => {
		if (authError) {
			return next(authError);
		}
		if (!user) {
			res.status(200).send('loginError');
			return ' ';
		}

		return req.login(user, loginError => {
			if (loginError) {
				return next(loginError);
			}
			return req.session.save(function () {
				console.log('세션 저장이 완료되었습니다.', req);
				req.session.user = user;
				req.app.set('loginSessionId', req.sessionID);
				req.app.set('userSession', user);
				res.status(200).json({
					return: true,
				});
			});
		});
	})(req, res, next);
});

// 로그아웃
router.get('/logout', isLoggedIn, (req, res) => {
	req.app.set('userSession', '');
	req.logout();
	req.session.destroy();
	res.redirect('/login');
});

module.exports = router;
