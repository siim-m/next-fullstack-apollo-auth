import PropTypes from 'prop-types';

import '../styles/tailwind.css';
import AuthProvider from '../components/AuthProvider';

const MyApp = ({ Component, pageProps }) => (
  <AuthProvider>
    <Component {...pageProps} />
  </AuthProvider>
);

MyApp.propTypes = {
  Component: PropTypes.func,
  pageProps: PropTypes.object,
};

export default MyApp;
