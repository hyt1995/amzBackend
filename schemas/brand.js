const mongoose = require("mongoose");

const {Schema} = mongoose;

 const brandSchema = new Schema({ // 기본적으로 _id를 붙여준다.
     PDName:{ // 제품이름
         type: String, // Number, Boolean
         required: true,
         unique:false,
     },
     patentWhether:{ //특허여부
         type:Boolean,
         requried:true,
         unique:false,
     },
     categoryName:{ //카테고리 이름
        type:String,     
        requried:true,
        unique:false,
    },
    ecumusChenckList:{ //이커머스 체크리스트 배열
        type:[Boolean],
    },
    etc:{ //비고
        type:String,
        requried:false,
        unique:false,
    },
     createdAt: {
         type:Date,
         default: Date.now
     }
 });

 const BrandModel = mongoose.model("Brand", brandSchema);

 module.exports = BrandModel;

 //type : 자료형
 // required :  필수여부
 // unique : 고유여부
 // default : "기본값"
 // type : ObjectId => 다른 테이블 아이디