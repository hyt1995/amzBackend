const mongoose = require("mongoose");
// 이것도 로그인 사용자 저장을 위해
const passportLocalMongoose = require('passport-local-mongoose');

const {Schema} = mongoose;
const {Types: ObjectId} = Schema;
 const companySchema = new Schema({ // 기본적으로 _id를 붙여준다.
     companyName: {
         type:String,
         required: true
     },
     password:{
         type:String,
         required: true
     },
     ceoName:{
         type:String,
         required: true
     },
     createdAt: {
         type:Date,
         default: Date.now
     }
 });

 // 로그인 사용자 세션에 저장을 위해 했지만 저장이 안된다.
 companySchema.plugin(passportLocalMongoose, {usernameField: 'companyName'});

 module.exports = mongoose.model("Company", companySchema);

 //type : 자료형
 // required :  필수여부
 // unique : 고유여부
 // default : "기본값"
 // type : ObjectId => 다른 테이블 아이디