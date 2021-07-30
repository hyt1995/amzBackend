// const passport = require("passport");
const local = require("./localStrategy");
const Company = require("../schemas/company");

module.exports =(passport)=>{

    // 밑에 세개는 로그인 사용자 세션에 저장을 위해 했지만 소용이 없다.
    // passport.use(Company.createStrategy());
    // passport.serializeUser(Company.serializeUser());
    // passport.deserializeUser(Company.deserializeUser());
    // 로그인시에만 실행
    //serializeUser는 사용자 정보 객체를 세션에 아이디로 저장하고
    // 세션에 저장하는 부분
    passport.serializeUser((user,done)=>{
        console.log("여기서 아이디를 판별  serializeUser",user)
        done(null, user.companyName);
    });


    // 매로그인마다 실행
    // 세션에 저장한 아이디를 통해 사용자 정보 객체를 불러온다.
    // 세션에서 불러오는 부분
    passport.deserializeUser(async (id,done)=>{

        try{
            console.log("deserializeUser",id);

            Company.findOne({
                companyName:companyName,
            })
            .then(user => {
                console.log("****************************",user)
                done(null, user)
            }) // 받아온 정보를 세션에 저장
            .catch(err=> done(err));


        } catch(err){
            console.log("deserializeUser error",err)
        }
    });


    local(passport);

//     app.use(passport.initialize());
// app.use(passport.session());
}