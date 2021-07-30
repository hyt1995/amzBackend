시스템 감시 한도 모다를때

1. sudo sysctl fs.inotify.max_user_watches=524288
2. sudo sysctl -p

몽고 디비 시작하기

몽고디비 커뮤니티에서 명령어로 몽고디비 설치
몽고디비 컴파스 설치
몽고디비 시작 : {
시작 : sudo systemctl start mongod,
시작 확인 : sudo systemctl status mongod,
시스템 재부팅 후 실행 : sudo systemctl enable mongod
종료: sudo systemctl stop mongod,
몽고디비 프로세스 다시 시작 : sudo systemctl restart mongod
}sudo systemctl start mongod

npm i mongoose

schema 디렉토리 생성

원하는 컬렉션 이름으로 파일을 만들어준다.

mongoose가 몽고디비의 자유로움을 조금 제한해준다.

mysql 종료시키거나 킬때
https://velog.io/@recordboy/%EB%A6%AC%EB%88%85%EC%8A%A4-MySQL-%EC%8B%9C%EC%9E%91-%EC%A0%95%EC%A7%80-%EC%9E%AC%EC%8B%9C%EC%9E%91-%EC%83%81%ED%83%9C%ED%99%95%EC%9D%B8

몽고디비 연결
mongo admin -u root -p young

mongo // 몽고디비 연결
$ use amzDB // 내 디비 연결
$ db.users.find() // 모든 값 찾기

db.getCollectionNames() // 현재 사용중인 collections 확인ㄴ

graphql 로 서버 만들기
npm i apollo-server
npm i graphql

npm install validator

실시간으로 서버에서 응답만 받고 싶을 경우
처음 한번만 연결을 맺고 그 다음부터 실시간으로 서버와 연결
npm i ws

npm i socket.io

소켓 할때 꼭 알아야할 개념이 네임스페이이다.

color-hash 패키지는 사용자가 익명이니 구분하기가 힘들다 사용자에게 색을 입혀줘서 구분하기 쉽게 해주는 패키지라고 한다.

https://app.rainforestapi.com/playground
youngtak
Hanyoungtak1!

자동 프레티어
https://sunmon.github.io/vscode-eslint-prettier-setting/
