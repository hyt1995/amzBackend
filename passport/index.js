const passport = require("passport");
const localStrategy = require("./localStrategy");
const {Company} = require("../schemas/company");

module.exports =()=>{
    passport.serializeUser((user,done)=>{
        console.log("여기서 아이디를 판별",user)
        done(null, user);
    });

    passport.deserializeUser((id,done)=>{
        console.log("여기서 아이디를 판별",id)
        Company.findOne({
            where: {CompanyName:id.companyName}
        })
        .then(user => done(null, user))
        .catch(err=> done(err));
    });


    localStrategy();
}