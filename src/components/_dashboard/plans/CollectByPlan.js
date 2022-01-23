import * as React from 'react';
import { Button } from '@mui/material';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/arrow-downward-fill';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import UserPlanSubscriptions from '../../../contracts/UserPlanSubscriptions.json';

export default function MaxWidthDialog({ selectedPlans }) {
  const { active, library } = useWeb3React();
  const [processingMsg, setProcessingMsg] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const collectByPlans = async (event) => {
    setIsSubmitting(true);
    setProcessingMsg('Transaction submitting! '.concat(event.target.value));
    for (let i = 0; i < selectedPlans.length; ) {
      const planId = selectedPlans[i];
      const contract = new ethers.Contract(
        UserPlanSubscriptions.networks[process.env.REACT_APP_NETWORK_ID].address,
        UserPlanSubscriptions.abi,
        library.getSigner()
      );
      // const amount = ethers.utils.parseEther(serviceCode);
      const transaction = contract.collectDueFromAllSubscriptionsOfPlan(planId);
      console.log(transaction);
      i += 1;
    }
    setProcessingMsg('Transaction submitted! '.concat(event.target.value));
    setIsSubmitting(false);
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={collectByPlans}
        startIcon={<Icon icon={plusFill} />}
        disabled={!active}
      >
        Collect Due
        {selectedPlans.length > 0 ? ' (' : ''}
        {selectedPlans.length > 0 ? selectedPlans.length : ''}
        {selectedPlans.length > 0 ? ')' : ''}
      </Button>
    </>
  );
}
