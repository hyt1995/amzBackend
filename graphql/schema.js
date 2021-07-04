const { buildSchema } = require("graphql");


module.exports = buildSchema(`

    type TestData {
        text: String!
        views : Int!
    }

    type RootQuery {
        hello:TestData!
    }


    type searchPD {
    name: String
    searchAmount:Int
    }


    type Brand {
    _id: ID!
    PDName:String!
    patentWhether:Boolean!
    categoryName:String!
    etc:String!
    searchFor: [searchPD]
    }

    input RPBrand {
        PDName:String!
        patentWhether:Boolean
        categoryName:String
        etc:String
    }

    type RootMutation {
    createBrand  (userInput : RPBrand ) : Boolean
    }

    type AuthData {
        token : String!
        userId : String!
    }

    type brandLogin {
        login(email: String!, password : String!) :  AuthData
    }
    

    schema {
        query: RootQuery
        mutation : RootMutation
    }
`);


// mutation : RootMutation


// type Post {
//     _id : ID!
//     titile: String!
//     content : String!
//     imageUrl: String!
//     creator : Brand!
//     createdAt: String!
//     updatedAt : String!
// }

// type UserInputData {
//     brandName: String!
//     brandEmail : String!
//     amzSellerRanking: Int!
// }

// type RootMutation {
//     createUser : (userInput : UserInputData ) : Brand!
// }








































// mutation : RootMutation









