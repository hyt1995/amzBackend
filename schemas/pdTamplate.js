const mongoose = require("mongoose");

const {Schema} = mongoose;
const {Types: ObjectId} = Schema;
 const pdTamplateSchema = new Schema({ // 기본적으로 _id를 붙여준다.
    brandNameId:{
        type:ObjectId,
        ref:"Brand"
    },
     currPrice:{ //현재 기존 상품 판매 가격
         type:Number
     },
     normalDesignation:{ // 제품의 통상적 명칭
         type:String
     },
     BSRPd:{ // BSR 1,2,3 위 제품
         type:Array
     },
     PDSizeRate:{
        type:Boolean,
    },
    representativeURL:{ // 대표 제품 url
        type:String,
    },
    searchForAmount:{ // 검색량
        type:[Object],
    },
     createdAt: {
         type:Date,
         default: Date.now
     }
 });

 module.exports = mongoose.model("PdTamplate", pdTamplateSchema);

 //type : 자료형
 // required :  필수여부
 // unique : 고유여부
 // default : "기본값"
 // type : ObjectId => 다른 테이블 아이디