import { useApolloClient, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useAuth } from './AuthProvider';

const SIGN_IN_MUTATION = gql`
  mutation SignInMutation($email: String!, $password: String!) {
    signInUser(email: $email, password: $password) {
      token
      userId
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation RegisterMutation(
    $name: String!
    $email: String!
    $password: String!
  ) {
    registerUser(name: $name, email: $email, password: $password) {
      token
      userId
    }
  }
`;

const AuthForm = ({ authFormPurpose, setAuthFormPurpose }) => {
  const { signIn } = useAuth();
  const [signInMutation] = useMutation(SIGN_IN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const client = useApolloClient();

  const handleSignIn = async (event) => {
    event.preventDefault();
    const { email, password } = event.target.elements;

    try {
      await client.resetStore();
      const { data } = await signInMutation({
        variables: {
          email: email.value,
          password: password.value,
        },
      });
      if (data?.signInUser) {
        const { userId, token } = data.signInUser;
        signIn(userId, token);
      }
      setAuthFormPurpose(undefined);
    } catch (error) {
      console.error('Something went wrong during sign in:', error);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const { name, email, password } = event.target.elements;

    try {
      await client.resetStore();
      const { data } = await registerMutation({
        variables: {
          name: name.value,
          email: email.value,
          password: password.value,
        },
      });
      if (data?.registerUser) {
        const { userId, token } = data.registerUser;
        signIn(userId, token);
      }
      setAuthFormPurpose(undefined);
    } catch (error) {
      console.error('Something went wrong during registration:', error);
    }
  };

  let handleSubmit;
  if (authFormPurpose === 'signIn') handleSubmit = handleSignIn;
  if (authFormPurpose === 'register') handleSubmit = handleRegister;

  return (
    <div
      className="absolute w-full h-full flex flex-col justify-center items-center z-10"
      style={{
        backgroundColor: 'rgba(255,255,255,.95)',
      }}
    >
      <div className="bg-gray-100 w-96 py-8 shadow-lg rounded-lg px-10">
        <form onSubmit={handleSubmit}>

          {authFormPurpose === 'register' &&
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-5 text-gray-700"
            >
              Name
              <div className="mt-1 rounded-md shadow-sm">
                <input
                  id="name"
                  type="name"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
              </div>
            </label>
          </div>}

          <div className="mt-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-5 text-gray-700"
            >
              Email address
              <div className="mt-1 rounded-md shadow-sm">
                <input
                  id="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
              </div>
            </label>
          </div>

          <div className="mt-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-5 text-gray-700"
            >
              Password
              <div className="mt-1 rounded-md shadow-sm">
                <input
                  id="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
              </div>
            </label>
          </div>

          <div className="mt-10">
            <span className="block w-full rounded-md shadow-sm">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
              >
                {authFormPurpose === 'signIn' && 'Sign In'}
                {authFormPurpose === 'register' && 'Register'}
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
