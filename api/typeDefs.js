import { gql } from 'apollo-server-micro';

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    passwordHash: String!
  }

  type AuthPayload {
    token: String!
    userId: ID!
  }

  type Mutation {
    registerUser(name: String!, email: String!, password: String!): AuthPayload!
    signInUser(email: String!, password: String!): AuthPayload!
    refreshUserToken(userId: ID!): AuthPayload!
    signOutUser(userId: ID!): Boolean!
  }

  type Query {
    showPrivateStuff: String!
  }
`;

export default typeDefs;
