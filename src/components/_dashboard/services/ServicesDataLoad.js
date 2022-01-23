import useSWR from 'swr';
import { useWeb3React } from '@web3-react/core';
import { fetcher } from '../../wallet/fetcher';
import UserPlanSubscriptions from '../../../contracts/UserPlanSubscriptions.json';

const useServiceData = () => {
  const { library } = useWeb3React();
  const { data: ownedServices, mutate } = useSWR(
    [
      UserPlanSubscriptions.networks[process.env.REACT_APP_NETWORK_ID].address,
      'getAllOwnedServicesDetails'
    ],
    {
      fetcher: fetcher(library, UserPlanSubscriptions.abi)
    }
  );
  console.log(ownedServices);
  return { ownedServices, mutate };
};

export default useServiceData;
