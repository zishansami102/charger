import useSWR from 'swr';
import { useWeb3React } from '@web3-react/core';
// import { ethers } from 'ethers';
import { fetcher } from '../../wallet/fetcher';
import UserPlanSubscriptions from '../../../contracts/UserPlanSubscriptions.json';

const usePlanData = () => {
  const { library } = useWeb3React();
  const { data: planList, mutate } = useSWR(
    [UserPlanSubscriptions.networks[process.env.REACT_APP_NETWORK_ID].address, 'getAllPlans'],
    {
      fetcher: fetcher(library, UserPlanSubscriptions.abi)
    }
  );
  console.log(planList);
  return { planList, mutate };
};

export default usePlanData;
