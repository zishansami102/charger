import useSWR from 'swr';
import { useWeb3React } from '@web3-react/core';
import { fetcher } from '../../wallet/fetcher';
import UserPlanSubscriptions from '../../../contracts/UserPlanSubscriptions.json';

const useSubsData = () => {
  const { library } = useWeb3React();
  const { data: subsList, mutate } = useSWR(
    [UserPlanSubscriptions.networks[process.env.REACT_APP_NETWORK_ID].address, 'getSubsByUser'],
    {
      fetcher: fetcher(library, UserPlanSubscriptions.abi)
    }
  );
  console.log(subsList);
  return { subsList, mutate };
};

export default useSubsData;
