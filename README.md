# Full-Stack Apollo GraphQL Authentication with Next.js

This is an example of a full-stack Next.js GraphQL application and constists of
the following components:

- Apollo GraphQL Server
- Apollo GraphQL Client
- A connection to a MongoDB database storing user accounts
- React front-end

More information can be found in [this blog post](https://siim.me/jwt-refresh-token-next-apollo)
that I wrote on the topic.

To get up and running, simply run ```yarn``` or ```npm install``` to install the
all dependencies.

Create a **.env** file and define the following environment variables:

```text
BASE_URL=http://localhost:3000
JWT_EXPIRY=300
JWT_SECRET=SuperSecretKeyForSigningTokens
MIN_PASSWORD_LENGTH=10
MONGO_URI=<Connection string for MongoDB>
REFRESH_TOKEN_EXPIRY=604800
```

Finally, run:

- ```yarn dev``` or ```npm run dev``` to run a development server.
- ```yarn build && yarn start``` or ```npm run buid && npm run start``` to serve
a production build.
