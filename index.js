const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const cors = require("cors");
const webSocket = require("./socket");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const schedule = require("node-schedule");
const mailer = require("nodemailer")


// graphql 연결을 위한
const {graphqlHTTP} = require("express-graphql")
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers")


const connect = require("./schemas");
const Brand = require("./schemas/brand")
const rvCalculator = require("./schemas/revenueCalculator");
const Pdtemplate = require("./schemas/pdTamplate");
const BestSellerRank = require("./schemas/bestSellerRank");

require("dotenv").config();


const app = express();

connect();


// 세션부분을 변수로 뺀다. 그래야 socket.IO에서 사용이 가능하다.
const sessionMiddleware = session({
    resave:false,
    saveUninitialized:false,
    secret: process.env.COOKIE_SECRET,
    cookie : {
        httpOnly:true,
        secure:false,
    }
})

// 아마존 셀러 정보를 가져오기 위한 변수
const params = {
    api_key: process.env.AMZ_SELLER_API_KEY,
    type: "bestsellers",
    amazon_domain: "amazon.com",
    category_id: "bestsellers_appliances"
  }



const uploadImg = multer({
    storage: multer.diskStorage({
        destination(req,file,cb){
            cb(null, "uploads/"); // 파일이 저장되는 위치
        },
        filename(req,file,cb){
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext)
        }
    }),
    limit:{fileSize: 10*1024 * 1024},
});



app.set("port", process.env.PORT || 8082);

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({extended:false})); // body를 해석해준다.
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware)
app.use(cors());
// app.use((req,res,next)=>{
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//         "Access-Control-Allow-Methods",
//         "OPTIONS, GET, POST, PUT, PATCH, DELETE"
//     );
//     res.setHeader("Access-Control-Allow-headers", "Content-Type, Authorization");
//     if(req.method === "OPTIONS"){
//         return res.sendStatus(200)
//     }
//     next();
// })

// grpahql 을 쓰기 위한 express 연결
app.use("/graphql",graphqlHTTP({
    schema: graphqlSchema,
    rootValue:graphqlResolver,
    graphiql:true,
    // formatError(err){
    //     if(!err.originalError){
    //         return err;
    //     }
    // } 패스트 캠퍼스 섹션 28 425 강의 2분30초 다시 볼것
}));


// 아마존 수익 계산기
app.post("/amz/amzProfit",async (req,res,next)=>{

    const {sellPrice,pdDeliver,amzFeed,amzPdPrice,delivery,orderFees,sellFees,PdsellFees,partAmzEarnings,profit} = req.body;

    //생산 배송비용 = 제품단가 + 배송비
    // 아마존 수수료 = 주문처리 수수료 + 상품 판매 수수료
    // 상품 판매 수수료 = 판매가*(판매수수료 비율 / 100)
    // 개당 아마존 소득 = 판매가 -아마존 수수료
    // 개당 이익 = 판매가-생산 배송비용 - 아마존 수수료
    // 마진율 = 개당 이익/판매가

    console.log("여기서 확인",{
        price:Number(sellPrice), // 판매가 rrr
        priductionDelivery:Number(amzPdPrice) + Number(delivery), // 생산 배송비용
        amzFees:Number(orderFees) + Number(PdsellFees), //  아마존 수수료
        unitPrice:Number(amzPdPrice), // 제품 단가 rrr
        deliveryPrice:Number(delivery), // 배송비  rrr
        orderFees:Number(orderFees), // 주문처리 수수료   rrr
        saleFees:Number(sellFees), // 판매 수수료 비율   rrr
        productionFeesCost:Number(sellPrice)*(Number(sellFees) / 100), // 상품 판매 수수료 비용
        unitAmzIncome:Number(sellPrice) - (Number(orderFees) + Number(PdsellFees)), // 개당 아마존 소득
        unitProfit:Number(sellPrice) - (Number(sellPrice) + Number(delivery)) -(Number(orderFees) + Number(PdsellFees)),  // 개당 이익
        marginRate:(Number(sellPrice) - (Number(sellPrice) + Number(delivery)) -(Number(orderFees) + Number(PdsellFees)))/Number(sellPrice)
    })
    res.status(200).json({
                    marginRate:33
                })

    // const rvCal = await new rvCalculator({
    //     price:Number(sellPrice), // 판매가 rrr
    //     priductionDelivery:Number(sellPrice) + Number(delivery), // 생산 배송비용
    //     amzFees:Number(orderFees) + Number(PdsellFees), //  아마존 수수료
    //     unitPrice:Number(amzPdPrice), // 제품 단가 rrr
    //     deliveryPrice:Number(delivery), // 배송비  rrr
    //     orderFees:Number(orderFees), // 주문처리 수수료   rrr
    //     saleFees:Number(sellFees), // 판매 수수료 비율   rrr
    //     productionFeesCost:Number(sellPrice)*(Number(sellFees) / 100), // 상품 판매 수수료 비용
    //     unitAmzIncome:Number(sellPrice) - (Number(orderFees) + Number(PdsellFees)), // 개당 아마존 소득
    //     unitProfit:Number(sellPrice) - (Number(sellPrice) + Number(delivery)) -(Number(orderFees) + Number(PdsellFees))  // 개당 이익
    // })

    // await rvCal.save()
    // .then((result)=>{
    //     if(result){
    //         res.status(200).json({
    //             marginRate:33
    //         })
    //     } 
    //     res.status(404).send("다시 한번 보내주세요")
    // })
    // .catch(error=>console.log("수익 계산기 저장 에러입니다."))

})

// 아마존 수익 계산기
app.post("/amz/amzPdTemplage",async (req,res,next)=>{

    console.log(req.body);
    
    const {
        pdName,
        pdUrl,
        pdPrice,
        pdDesignation,
        bsrRanking,
        sizeGrade,
        kewordAmount,
        } = req.body;

        const brandsId = await Brand.findOne({
            PDName:pdName
        }).exec();


    const pdtemplate = await new Pdtemplate({
        brandNameId:brandsId._id,
        representativeURL:pdUrl,
        currPrice:Number(pdPrice),
        normalDesignation:pdDesignation,
        BSRPd:bsrRanking,
        searchForAmount:kewordAmount,
        PDSizeRate:sizeGrade
    })

    await pdtemplate.save()
    .then(result=>{
        if(result){
            res.status(200).json({
                            value:true
                        })
        }else{
            res.status(404).json({
                value:false
            })
        }
    })
    .catch(err=>console.log("제품 템플릿 저장 에러",err));

})


// 아마존 브랜드 입력
app.post("/amz/brandList",async (req,res,next)=>{
    console.log(req.body);
    const {
        pdName,
        patent,
        category,
        ecumus,
        etc,
        presentPDURL,
        searchNameArray
    } = req.body;

    const brand = await new Brand({
        PDName:pdName,
        patentWhether:patent,
        categoryName:category,
        ecumusChenckList:ecumus,
        etc:etc,
    })

    await brand.save()
    .then(async (result)=>{
        // console.log("일단 아이디를 위한 결과",result)
        const pdTemplate = await new Pdtemplate({
            brandNameId:result._id,
            searchForAmount:searchNameArray,
            representativeURL:presentPDURL,
        })
        await pdTemplate.save()
        .then(async (pdResult)=>{
            if(pdResult){
                // res.status(200).json({
                //                 value:true
                //             })
                console.log("여기까지 왔다는 건가?")
                const sendResult = await Brand.find();
                await req.app.get('io').of('/brandTable').emit("tableData",sendResult)
            }else{
                res.status(404).json({
                    value:false
                })
            }
        })
        .catch(err=>console.log("에러 확인",err))
        
    })
    .catch(err=>console.log("제품 템플릿 저장 에러",err));
})


app.get("/amz/main", async (req,res,next)=>{
    const brandMain = await Brand.find().exec();
    console.log("내가 찾은 값들", brandMain)
    res.status(200).json(brandMain)

})



// 사용자 한명 한명 한테 개의인 색을 지정해준다.
// app.use((req,res,next)=>{
//     if(!req.session.color){
//         const colorHash = new ColorHash();
//         req.session.color = colorHash.hex(req.sessionID);
//     }
//     next();
// })




// app.get("/room",(req,res)=>{
//     res.status(200).json({
//         result : true,
//     })
// })

// app.post("/room", async (req,res,next)=>{
//     try{ // 방을 생성하고
//         const room = new room({
//             title:req.body.title,
//         })
//         const newRoom = await room.save();
//         const io = req.app.get('io'); // 아까 set으로 저장한 io를 가져오고
//         io.of('/room').emit("newRoom",newRoom) // 새로운 방이 생겼다고 알려주고
//         res.status(200).json({result:true})
//     } catch(error){
//         console.error(error);
//         next(error);
//     }
// })

// //방에 들어가는 것
// app.get('/room/:id', async (req,res,next)=>{
//     try{
//         const room = await Room.findOne({_id:req.params.id});
//         if(!room){ //잘못된 방에 들어갔을 경우
//             return res.redirect("/");
//         } 
//         if(room.password && ){}
//     } catch(error){
//         console.error(error);
//         next(error);
//     }
// })


app.get("/sss",(req,res)=>{


    // const params = {
    //     api_key: 
    //     type: "product",
    //     amazon_domain: "amazon.com",
    //     asin: "B073JYC4XM"
    //   }
    
    
    //   axios.get('https://api.rainforestapi.com/request', { params })
    //   .then(response => {
    
    //     // print the JSON response from Rainforest API
    //     // console.log(JSON.stringify(response.data, 0, 2));
    //     res.status(200).json(response.data,0,2)
    
    //   }).catch(error => {
    //     // catch and print the error
    //     console.log(error);
    //   })




    const params = {
        api_key: process.env.AMZ_SELLER_API_KEY,
        type: "bestsellers",
        amazon_domain: "amazon.com",
        category_id: "bestsellers_appliances"
      }
      
      // make the http GET request to Rainforest API
      axios.get('https://api.rainforestapi.com/request', { params })
        .then(async (response) => {
      
          // print the JSON response from Rainforest API
        //   console.log(JSON.stringify(response.data, 0, 2));
        //   res.status(200).json(response.data.bestsellers, 0, 2)

        const resultSave = await Promise.all(
            response.data.bestsellers.map(async (i)=>{
                const bestSellerRank =  await new BestSellerRank({
                    asin:i.asin,
                    productName:i.title,
                    currCategory:i.current_category.name,
                    imgUrl:i.image,
                    sellerRank:i.rank,
                    priceLower:i.price_lower.value,
                    priceUpper:i.price_upper.value,
                    productLink:i.link,
                })
                await bestSellerRank.save()
            })
        );

        if(resultSave){
            console.log("저장이 됐나?", resultSave)
            res.status(200).send("저장 완료");
        }else{
            console.log("저장이 됐나?", resultSave)
            res.status(200).send("저장 실패");
        }

        // await response.data.bestsellers.map((i)=>{
        //     const bestSellerRank =  await new BestSellerRank({
        //         asin:i.asin,
        //         productName:i.title,
        //         currCategory:i.current_category.name,
        //         imgUrl:i.image,
        //         sellerRank:i.rank,
        //         priceLower:i.price_lower.value,
        //         priceUpper:i.price_upper.value,
        //         productLink:i.link,
        //     })
        //     await brand.save()
        // })
      
        }).catch(error => {
          // catch and print the error
          console.log(error);
        })
})


const mailSender = {
    //메일 발송 함수
    sendGmail: function(param){
        const transporter = mailer.createTransport({
            service: "gmail",
            prot: 587,
            host: "smtp.gmail.com" ,
            secure: false,
            requireTLS: true,
            auth: {
                user: "hanyt1995@gmail.com",
                pass: process.env.USER_PASSWORD
            }
        });

        const mailOptions = {
            from: "hanyt1995@gmail.com", // 보내는 이메일
            to : param.toEmail, //수신할 이메일
            subject: param.subject, //메일 제목
            text: param.text, //메일 제목
         };

         transporter.sendMail(mailOptions, function(error, info){
             if(error){
                 console.log(error);
             } else {
                 console.log("Email sent:  " + info.response);
             }
         });
    }
};

const emailParam = {
    toEmail: "hanyt1995@gmail.com",
    subject: "메일 테스트를 위한 임시 메일 입니다.",
    text: "여기서 gmail로 메일을 보내는데 내용이 제대로 잘가는지 궁급하다."
}

app.get("/bestSellerRanking", async (req,res)=>{
    const resultBestSeller =  await BestSellerRank.find().sort({sellerRank:1}).exec();
    if(resultBestSeller){
        return res.status(200).json(resultBestSeller)
    }else{
        return res.status(200).send("보내기가 실패했습니다.")
    }
})


// 아마존 데이터 최신화를 위한
async function lastestAmzBestSellerRankData () {
    try{
        console.log("lastestAmzBestSellerRankData 함수 실행")
        // 특정 날짜 시간마다 실행시키기
        schedule.scheduleJob({hour : 00, minute:16, dayOfWeek: 1}, async function (){

        // 데이터 불러오기
        const getDBBestSellerRank = await BestSellerRank.find().exec();
        // 데이터가 50개일 경우 기존 데이터 삭제
        if(getDBBestSellerRank.length === 50){
            const result = await Promise.all(
                getDBBestSellerRank.map(i=>{
                    BestSellerRank.deleteOne({sellerRank:i.sellerRank})
                })
            ).then(res=>console.log("기존 데이터 삭제 완료"))
        }else{ //데이터가 50개가 안될 경우
            console.log("데이터에 문제가 있습니다. ");
            return '';
        }

        //아마존에서 데이터를 가져오기
        await axios.get('https://api.rainforestapi.com/request', { params })
        .then( async (response)=> { //데이터를 가져온뒤 저장하기
            const resultSave = await Promise.all(
                response.data.bestsellers.map(async (i)=>{
                    const bestSellerRank =  await new BestSellerRank({
                        asin:i.asin,
                        productName:i.title,
                        currCategory:i.current_category.name,
                        imgUrl:i.image,
                        sellerRank:i.rank,
                        priceLower:i.price_lower.value,
                        priceUpper:i.price_upper.value,
                        productLink:i.link,
                    })
                    await bestSellerRank.save();
                })
            );
            if(resultSave){
                const sendEmailResult = await mailSender.sendGmail(emailParam)
                if(sendEmailResult){
                    console.log("이메일이 보내졌습니다.");
                }else{
                    console.log("이메일에 문제가 있어 취소되었습니다.")
                }
            }else{
                console.log("문제가 있어 과정이 완료되지 않았습니다.");
            }
        });
    });
        
    } catch(error){
        console.log("에러가 있습니다.")
    }
}

// 아마존 데이터 최신화를 위한 함수를 실행시킨다.
lastestAmzBestSellerRankData()



////////////////////////////////////////        사진
//////////////// single, array(여러개  단일 필드),fields(여러개  여러 필드),none(이미지 x)

app.post('/img',uploadImg.single("imgFile"),(req,res)=>{
    console.log("내가 받아온 파일 확인",req.file,req.body)
    res.status(200).send("성공적으로 파일이 전송 완료되었습니다.")
})


// listen으로 실행되는 서버도 변수에 저장이 가능하다 그서버가 express server 즉 node서버 이다.
const server = app.listen(app.get("port"),()=>{
    console.log(`서버가 ${app.get("port")}포트에서 실행중입니다.`)
});
// 이게 socket.js의 server이라는 매개변수로 들어가게 된다.
webSocket(server, app, sessionMiddleware);