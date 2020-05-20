import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const PRIVATE_QUERY = gql`
  query PrivateQuery {
    showPrivateStuff
  }
`;

const PrivateComponent = () => {
  const { data, loading, error } = useQuery(PRIVATE_QUERY);
  if (error) console.error(error);
  return (
    <div className="flex flex-col justify-center items-center">
      <p className="text-4xl text-red-700">
        {loading ? 'Loading...' : data?.showPrivateStuff}
        {error && 'Something went wrong 😕'}
      </p>
    </div>
  );
};

export default PrivateComponent;
