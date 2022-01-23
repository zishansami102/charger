import useSWR from 'swr';
import { useWeb3React } from '@web3-react/core';
// import { ethers } from 'ethers';
import { fetcher } from '../../wallet/fetcher';
import UserPlanSubscriptions from '../../../contracts/UserPlanSubscriptions.json';

export default function AccountDataLoad() {
  const { library } = useWeb3React();
  const { data: currentEthBalance, mutate } = useSWR(
    [UserPlanSubscriptions.networks[process.env.REACT_APP_NETWORK_ID].address, 'getCurrentBalance'],
    {
      fetcher: fetcher(library, UserPlanSubscriptions.abi)
    }
  );
  const { data: ethDue, mutateDueEth } = useSWR(
    [
      UserPlanSubscriptions.networks[process.env.REACT_APP_NETWORK_ID].address,
      'totalAmountDueToAllSubs'
    ],
    {
      fetcher: fetcher(library, UserPlanSubscriptions.abi)
    }
  );
  const { data: ethCollectable, mutateEthCollectable } = useSWR(
    [
      UserPlanSubscriptions.networks[process.env.REACT_APP_NETWORK_ID].address,
      'totalCollectableAmountFromAllServices'
    ],
    {
      fetcher: fetcher(library, UserPlanSubscriptions.abi)
    }
  );
  return '';
}
