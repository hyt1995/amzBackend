const mongoose = require("mongoose");

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

 module.exports = mongoose.model("Company", companySchema);

 //type : 자료형
 // required :  필수여부
 // unique : 고유여부
 // default : "기본값"
 // type : ObjectId => 다른 테이블 아이디