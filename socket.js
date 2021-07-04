// const WebSocket = require("ws");


// // index.js에서 변수에 저장한게 넘어온것이다.
// module.exports=(server)=>{
//     const wss = new WebSocket.Server({server});

//     //  ws는 이벤트 기반 그래서 이벤트 명과 콜백으로 구성이 된다.  
//     // connection이라는 기본 이벤트를 가지고 있다.
//     wss.on("connection",(ws,req)=>{
//         const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//         // 프록시  - 클라이언트와 서버에서 cors 때문에 중간에 거치는 서버를 프록시라고 한다.
//         // req.headers['x-forwarded-for'] => 프록시 거치기 전의 아이피
//         // req.connection.remoteAddress => 최종 아이피

//         console.log("클라이언트 접속",ip);
//         ws.on("message",(tmessage)=>{
//             console.log(message);
//         });
//         ws.on("error",(error)=>{
//             console.log(error);
//         })
//         ws.on("close",()=>{
//             console.log("클라이언트 접속 해제",ip)
//             clearInterval(ws.interval); // 종료하면 메세지를 보내는 것도 중단
//         })
//         const interval = setInterval(()=>{
//             if(ws.readyState === ws.OPEN) {
//                 //양반향 연결 수립 - ws.OPEN ,   연결중 - ws.CONNECTING,   끊겼다 - ws.CLOSING 에서 ws.CLOSED로 넘어간다.
//                 ws.send("서버에서 클라이언트로 메세지를 보냅니다..");
//             }t00)
//         ws.interval = interval;
//     })
// };

// // http와 ws는 포트를 자동으로 공유 연결 필요 x
// // 클라이언트 -> http -> 서버
// // 클라이언트 -> ws -> 서버



// =====================여기까지 webSocket 부분===============================================================

const SocketIO = require("socket.io");
const axios = require("axios");

// 중요 !!!!!!!!!!!!!
// 중간에 거치는 프록시 서버가 소켓아이오 기 때문에 여기서 특정한 조건일때
// 여기서 다시 axios.delete("http://localhost:8005/room/${roomId}").then().catch()
// 해서 기존 통합 서버로 요청을 보내줘서 해결하는 형식으로 해야한다.



module.exports = (server,app, sessionMiddleware)=>{
    const io = SocketIO(server,{
        path: "/socket.io",
        cors:{
            origin:"*"
        },
        // transports:["websocket"], // http요청하지 않고 처음부터 websocket사용(지원이 안할 경우 - expoloer)
        // socket.IO는 처음에 http요청으로 웹소켓 사용 가능 여부를 묻는다.
        // 구식 인터넷 브라우저는 소켓을 지원을 안하는 곳이 있다.
    }) ;//웹소켓을 공통으로 쓰기때문에 원리는 비슷하다.

    app.set('io',io) // express 변수 저장 방법
    // 이렇게 저장을해야 후에 라우터에서 req.app.get('io) 처럼 꺼내올 수가 있다.
    // req.app.get('io').of('/room').emit()

    // 네임스페이스 꼭 알아야한다.
    // 네임스페이스로 실시간 데이터가 전달될 주소를 구별이 가능하다.
    

    // const room = io.of("/room");
    // const chat = io.of("/chat");

    // // 서버 index.js에서 변수로 뺀 세션을 인자로 받아와서 사용
    // // 익스프레스 미들웨어를 소켓 io에서 쓰는 방법
    // io.use((socket, next)=>{
    //     sessionMiddleware(socket.request, socket.request.res, next)
    // })
 
    // room.on("connection",(socket)=>{ // 각각의 네임스페이스에 똑같이 이벤트를 달아주면 된다.
    //     console.log("room 네임스페이스 접속");
    //     socket.on("disconnect",()=>{
    //         console.log("room 네임스페이스 접속 해제")
    //     })
    // })

    // chat.on("connection",(socket)=>{
    //     console.log("chat 네임스페이스 접속");
    //     const req = socket.request;   //요청에 대한 정보
    //     const { headers:{ referer } } = req;
    //     const roomId = referer.split("/")[referer.split("/").length -1].replace(/|?.+/,''); // 방제목을 받는 것
    //     socket.join(roomId);
    //     socket.to(roomId).emit("join", {
    //         user:"system",
    //         chat : `${req.session.color}님이 입장하셨습니다.`
    //     });
    //     socket.on("disconnect",()=>{
    //         console.log("chat 네임스페이스 접속 해제");
    //         socket.leave(roomId); //방나가기
    //         const currentRoom = socket.adapter.rooms[roomId]; // 방 아이디 방 정보와 인원이 들어있다. // 이걸로 현재의 방정보를 받아올 수 있다.
    //         const userCount = currentRoom ? currentRoom.length : 0;
    //         if(userCount === 0){ // 현재 방에 남아있는 사람이 아무도 없으면 방을 없애는 요청
    //             axios.delete(`http://localhost:8005/room/${roomId}`)
    //             .then(()=>{
    //                 console.log("방 제거 요청 성공")
    //             })
    //             .catch((error)=>{
    //                 console.error(error);
    //             })
    //         }else { // 방에 한명이라도 남아 있으면 메세지 보내기
    //             socket.to(roomId).emit('exit', {
    //                 user:'system',
    //                 chat: `${req.session.color}님이 퇴장하셨습니다.`
    //             })
    //         }
    //     })
    // })


    // io.on("/") --- 이게 기본값이다. 그래서  " / " 생략
    io.on("connection",(socket)=>{

        const req = socket.request;
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        console.log("새로운 클라이언트 접속",ip, socket.id, req.id); 
        // socket.io는 클라리언트들을 구분해준다 그래서 socket.id이게 있는것
        // 클라이언트들마다 id가다르게 나온다.

        socket.on("disconnect",()=>{
            console.log("클라이언트 접속 해제 disconnect", ip, socket.id);
            clearInterval(socket.interval)
        });
        socket.on("error", (error)=>{
            console.log("소켓 error",error)
        });

        socket.on("reply",(data)=>{
            console.log("소켓 reply",data);
        });

        socket.on("message",(data)=>{
            console.log("소켓 message",data);
        });

        socket.interval = setInterval(()=>{
            console.log("여기는 어쩔때 나오는 것이냐??  setInterval")
            socket.emit("news", "hello Socket.IO"); // 키 값으로 전달을 해준다.
        }, 3000)
        // send 대신에 emit를 쓴다.

    })

    const brandTable= io.of("/brandTable")
    brandTable.on("connection",(socket)=>{

        const req = socket.request;
        const { headers: { referer } } = req;
        console.log("요청 부분 정보",referer);

        console.log("브랜드 테이블 데이터 최신화 시작하겠습니다.");

        socket.on("disconnect",()=>{
            console.log("브랜드 테이블 데이터 최신화를 종료하겠습니다.");
            clearInterval(socket.interval)
        })

        socket.on("reply",(data)=>{
            console.log("브랜드 테이블 reply",data);
        });

        socket.on("message",(data)=>{
            console.log("브랜드 테이블 message",data);
        });


        // socket.join(roomId)  // 방에 접속하는 코드
        // socket.to("방 아이디").emit();
        // socket.leave("방 아이디");


        // socket.interval = setInterval(()=>{
        //     console.log("여기는 어쩔때 나오는 것이냐??  setInterval")
        //     socket.emit("brandTableNews", "hello Socket.IO"); // 키 값으로 전달을 해준다.
        // }, 3000)
    })
}











