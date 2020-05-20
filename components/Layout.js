import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { useState } from 'react';
import AuthForm from './AuthForm';
import { useAuth } from './AuthProvider';

const SIGN_OUT_MUTATION = gql`
  mutation SignOutMutation($userId: ID!) {
    signOutUser(userId: $userId)
  }
`;

const Layout = ({ children, title }) => {
  const { authState, signOut } = useAuth();

  const [authFormPurpose, setAuthFormPurpose] = useState();

  const [signOutMutation] = useMutation(SIGN_OUT_MUTATION);

  const handleSignOut = async () => {
    await signOutMutation({
      variables: {
        userId: authState.userId,
      },
    });
    signOut();
  };

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      {authFormPurpose && (
        <AuthForm
          authFormPurpose={authFormPurpose}
          setAuthFormPurpose={setAuthFormPurpose}
        />
      )}
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <div className="text-lg font-semibold">My App</div>
                </div>
              </div>
              <div className="flex">
                <button
                  type="button"
                  onClick={
                    authState.userId
                      ? handleSignOut
                      : () => setAuthFormPurpose('signIn')
                  }
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3" />
                  {authState.userId ? 'Sign Out' : 'Sign In'}
                </button>
                {!authState.userId &&
                <button
                  type="button"
                  onClick={() => setAuthFormPurpose('register')}
                  className="ml-4 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-gray-600 hover:bg-gray-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3" />
                  Register
                </button>}
              </div>
            </div>
          </div>
        </nav>
        <div className="py-10">
          <main>
            <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 my-36">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.element,
  title: PropTypes.string,
};

export default Layout;
