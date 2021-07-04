const Brand = require("../schemas/brand")
const bcrypt = require("bcrypt");
const validator = require("validator");



module.exports = {
    hello() {
        return {
            text: "여기서는 텍스트 반환",
            views: "여기는 경관을 반환"
        };
    },

    createBrand : async function (args, req){
        console.log("+++++++++++++++",args)
        // const email = args.userInput.email;

        // const errors = []; validator에서 에러를 만들면 여기에 저장을 한다.

        // if(!validator.isEmail(userInput.email)){
        //     errors.push({message : "E-Mail is invalid. "})
        // } 이메일이 형식에 맞는지 검사하는 코드

        // if(validator.isEmpty(userInput.password) || validator.isLenth(userInput.password, {min : 5})){
        //     errors.push({message : "Password too short!"})
        // }  비밀번호 길이가 짧으면 에러 메세지를 배열에 저장

        // if(errors.length > 0) {
        //     const eroor = new Error("invalid input.");
        //     throw error;
        // }  에러 배열에 에러가 들어있으면 에러를 반환한다.

        // const exitBrand = await Brand.findOne({
        //     PDName: args.userInput.PDname
        // })
        // if(exitBrand){
        //     console.log("가져온 값 확인" ,exitBrand)
        //     const error = new Error("이미 존재하는 브랜드 상품입니다.");
        //     throw error;
        // }

        // // const hashexdPw = await bcrypt.hash(userInput.password,12); 비밀번호를 만드는 곳
        // const mkBrand = new Brand({
        //     PDName:args.userInput.PDname,
        //     patentWhether:args.userInput.patentWhether,
        //     categoryName:args.userInput.categoryName,
        //     etc:args.userInput.etc,
        //     searchFor: args.userInput.searchFor,
        // anync await 를 쓰면 자동으로 반환이 된다.

        // return Brand.findOne().then().catch(error){
        //     console.error(error);
        // }  graphql 은 해결후 넘어갈때 까지 기다리지 않는다
        // anync await 를 쓰면 자동으로 반환이 된다.
    },
    login : async function ({email, password}){
        const brand = await Brand.findOne({PDname:PDname});
        if(!brand){
            const error = new Error("새로운 에러입니다.");
            error.code = 401
            throw error;
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual){
            const error = new  Error("비밀번호 오류");
            error.code = 401;
            throw error;
        }
    }
}




