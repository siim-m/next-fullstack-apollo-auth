import { ApolloProvider } from '@apollo/react-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { createHttpLink } from 'apollo-link-http';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import fetch from 'isomorphic-unfetch';
import jwt from 'jsonwebtoken';
import { useAuth } from '../components/AuthProvider';

const initApolloClient = (initialState = {}, token, userId, setAuthToken) => {
  const cache = new InMemoryCache().restore(initialState);
  
  const httpLink = createHttpLink({
    uri: `${process.env.BASE_URL}/api/graphql`,
    fetch,
    credentials: 'include',
  });

  const authLink = setContext((_, { headers }) =>
    // return the headers to the context so httpLink can read them
    ({
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
        userid: userId,
      },
    })
  );

  const refreshLink = new TokenRefreshLink({
    accessTokenField: 'newToken',
    // No need to refresh if token exists and is still valid
    isTokenValidOrUndefined: () => {
      // No need to refresh if we don't have a userId
      if (!userId) {
        return true;
      }
      // No need to refresh if token exists and is valid
      if (token && jwt.decode(token)?.exp * 1000 > Date.now()) {
        return true;
      }
    },
    fetchAccessToken: async () => {
      if (!userId) {
        // no need to refresh if userId is not defined
        return null;
      }
      // Use fetch to access the refreshUserToken mutation
      const response = await fetch(`${process.env.BASE_URL}/api/graphql`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          query: `mutation {
                    refreshUserToken(userId: "${userId}") {
                      userId
                      token
                    }
                  }`,
        }),
      });
      return response.json();
    },
    handleFetch: (newToken) => {
      // save new authentication token to state
      setAuthToken(newToken);
    },
    handleResponse: (operation, accessTokenField) => (response) => {
      if (!response) return { newToken: null };
      return { newToken: response.data?.refreshUserToken?.token };
    },
    handleError: (error) => {
      console.error('Cannot refresh access token:', error);
    },
  });

  const client = new ApolloClient({
    ssrMode: false,
    link: authLink.concat(refreshLink).concat(httpLink),
    cache,
  });
  return client;
};

const withApollo = (PageComponent) => {
  const WithApollo = ({ apolloClient, apolloState, ...pageProps }) => {
    const { authState, setAuthToken } = useAuth();

    const client =
      apolloClient ||
      initApolloClient(
        apolloState,
        authState.token,
        authState.userId,
        setAuthToken
      );

    return (
      <ApolloProvider client={client}>
        <PageComponent {...pageProps} />
      </ApolloProvider>
    );
  };

  return WithApollo;
};

export default withApollo;
