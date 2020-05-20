import { ApolloServer } from 'apollo-server-micro';
import httpHeadersPlugin from 'apollo-server-plugin-http-headers';
import jwt from 'jsonwebtoken';
import resolvers from '../../api/resolvers';
import typeDefs from '../../api/typeDefs';
import connectDb from '../../lib/mongoose';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [httpHeadersPlugin],
  context: async ({ req }) => {
    // Header is in form 'Bearer <token>', grabbing the part after ' '
    const token = req.headers.authorization?.split(' ')[1] || undefined;

    // Initialise as empty arrays - resolvers will add items if required
    const setCookies = [];
    const setHeaders = [];

    try {
      const { user } = jwt.verify(token, process.env.JWT_SECRET);
      return { req, setCookies, setHeaders, user };
    } catch (error) {
      return { setCookies, setHeaders, req };
    }
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = apolloServer.createHandler({ path: '/api/graphql' });

export default connectDb(handler);
