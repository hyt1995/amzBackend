// const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const Company  = require("../schemas/company");

module.exports = (passport) => {
    passport.use(new LocalStrategy({
      usernameField: 'userId', // req.body.companyName을 갖다쓴것
      passwordField: 'password',
      session:true //세션에 저장 여부
    }, async (userId, password, done) => {
      try {
        const exUser = await Company.findOne({ companyName:userId }).exec();
        if (exUser) {
          const result = await bcrypt.compare(password, exUser.password); //비밀번호를 비교해준다. 여기서도 불러와서 하네 나랑 똑같게
          // 회원가입에서 비밀번호를 bcrypt로 전환해서 저장을 했다. 여기서 그걸 다시 변환해서 비교를 한다.
          if (result) {
            // if(password === exUser.password){
            done(null, exUser);
          } else {
            done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
          }
        } else {
          done(null, false, { message: '가입되지 않은 회원입니다.' });
        }
      } catch (error) {
        console.error(error);
        done(error);
      }
    }));
  };