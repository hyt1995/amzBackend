eslint, prettier사용으로 최대한 코드 스타일을 맞추려고 했습니다. 


amzBackend서버에서는 mongoDB를 사용하였으며 passport 사용으로 로그인이 가능합니다. 
매주 월요일 00시에 아마존 경매 상품 리스트 데이터를 자동으로 최신화하며 최신화 후 이메일로 최신화를 알려줍니다.
아마존 상품 관련 정보를 입력할 수 있습니다.
상품 관련 정보를 입력 하면 메인 상품 리스트 페이지가 socket.io로 최신화가 됩니다.
