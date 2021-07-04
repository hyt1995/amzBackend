const mongoose = require("mongoose");

// module.exports = ()=>{
    //     const connect = ()=>{
        //         if(process.env.NODE_ENV !== "production"){
            //             mongoose.set("debug", true)
            //         }
            //         mongoose.connect("mongodb://localhost:27017/amzBack",{
//             dbName: "amzBack",
//         },(error)=>{
//             if(error){
    //                 console.log("몽고디비 연결 에러",error)
//             }else {
    //                 console.log("몽고디비 연결 성공 ");
//             }
//         })
//     }

    // mongoose.connection.on("error", (error)=>{
    //         console.error("몽고디비 연결 에러 ", error);
    //     })
    
    
    //     mongoose.connection.on("disconnected", (error)=>{
    //             console.error("몽고디비 연결이 끊어졌습니다 연결재시도 붕탁");
    //             connect();
    //         })
        
    //         require("./brand");
    //     }
        
        module.exports = ()=>{
            
            const connect = () =>{
                if(process.env.NODE_ENV !== "production"){
                    mongoose.set("debug", true)
                }
                mongoose.connect(
                    "mongodb://localhost:27017/amzDB",
                    // mongodb://이름:비밀번호@localhost:27017/admin
                    {
                        // dbName: "amzDB",
                        useNewUrlParser:true,
                    },(error) => {
                        if (error) {
                            console.log("mongoDB connection Error!", error);
                        } else {
                            console.log("mongodb connection success!");
                }
            }
            );
        }
        
        
        connect()
        
        
        
        const db = mongoose.connection;
        
        const openhan=()=>{
            console.log("connected success!!");
        };
        
        const closehan=(error)=>{
            console.log(`Error!!${error}`);
        };
        
        db.once("open",openhan)
        db.on("error", closehan)
        
        require("./brand");
        require("./pdTamplate");
        require("./revenueCalculator");
        require("./bestSellerRank")
    }








    // mongoose.Promise = global.Promise; // mongodb4 버전부터 써줘야 에러가 안남
    // mongoose.connect("mongodb://localhost:27017/amzSellDB",{
    //     useNewUrlParser:true,
    //     useUnifiedTopology:true,
    // })
    // const db = mongoose.connection;
    // db.on("error",console.error(console, "connection error:"));
    // db.once("open", function(){
    //     console.log("open")
    // });