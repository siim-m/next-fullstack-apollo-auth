import { useAuth } from '../components/AuthProvider';
import Layout from '../components/Layout';
import PrivateComponent from '../components/PrivateComponent';
import PublicComponent from '../components/PublicComponent';
import withApollo from '../lib/apollo';

const Home = () => {
  const { authState } = useAuth();

  return (
    <Layout title="Home">
      {authState.userId ? <PrivateComponent /> : <PublicComponent />}
    </Layout>
  );
};
export default withApollo(Home);
