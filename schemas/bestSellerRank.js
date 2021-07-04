const mongoose = require("mongoose");

const {Schema} = mongoose;

 const bestSellerRankSchema = new Schema({ // 기본적으로 _id를 붙여준다.
    asin:{
        type:String,
    },
    productName:{
        type:String,
    },
     currCategory:{ // 제품이름
         type: String, // Number, Boolean
     },
     imgUrl:{ //특허여부
         type:String,
     },
     sellerRank:{ //카테고리 이름
        type:Number,     
    },
    priceLower:{ //이커머스 체크리스트 배열
        type:Number,
    },
    priceUpper:{ //비고
        type:Number,
    },
    productLink:{
        type:String,
    },
     createdAt: {
         type:Date,
         default: Date.now
     }
 });

 const BestSellerRankSchemaModel = mongoose.model("BestSellerRankSchema", bestSellerRankSchema);

 module.exports = BestSellerRankSchemaModel;

 //type : 자료형
 // required :  필수여부
 // unique : 고유여부
 // default : "기본값"
 // type : ObjectId => 다른 테이블 아이디