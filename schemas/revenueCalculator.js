const mongoose = require("mongoose");

const {Schema} = mongoose;
const {Types: ObjectId} = Schema;
 const rvCalculatorSchema = new Schema({ // 기본적으로 _id를 붙여준다.
    brandRelateId:{
        type:ObjectId,
        ref:"Brand"
    },
     price: {
         type:Number
     }, //판매가
     priductionDelivery: {
         type:Number,
     }, // 생산 배송비용
     amzFees: {
         type:Number
     }, // 아마존 수수료
     unitPrice: {
         type:Number
     }, // 제품 단가
     deliveryPrice: {
         type:Number
     }, // 배송비
     orderFees: {
        type:Number
     }, // 주문처리 수수료
     saleFees: {
         type:Number
     }, // 주문처리 수수료
     productionFeesCost: {
         type:Number
     }, // 상품 판매 수수료 비용
     unitAmzIncome: {
         type:Number
     }, // 개당 아마존 소득
     unitProfit: {
         type:Number
     }, //개당 이익
     marginRate: {
         type:Number
     }, // 마진율
     createdAt: {
         type:Date,
         default: Date.now
     }
 });

 module.exports = mongoose.model("RvCalculator", rvCalculatorSchema);

 //type : 자료형
 // required :  필수여부
 // unique : 고유여부
 // default : "기본값"
 // type : ObjectId => 다른 테이블 아이디