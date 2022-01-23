import * as React from 'react';
// material
import { Box } from '@mui/system';
import { Card, CardHeader, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import UserPlanSubscriptions from '../../../contracts/UserPlanSubscriptions.json';
import { injected } from '../../authentication/connector';

// ----------------------------------------------------------------------

export default function AppCurrentVisits({ planId, planTitle, price, frequency, features, email }) {
  const { active, library, activate, deactivate } = useWeb3React();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [processingMsg, setProcessingMsg] = React.useState('');

  const connect = () => {
    if (!active) {
      activate(injected);
    } else {
      deactivate();
    }
  };

  function timeout(delay) {
    return new Promise((res) => setTimeout(res, delay));
  }

  const subscribe = async (event) => {
    if (active) {
      setIsSubmitting(true);
      setProcessingMsg('Transaction submitting! ');
      const contract = new ethers.Contract(
        UserPlanSubscriptions.networks[process.env.REACT_APP_NETWORK_ID].address,
        UserPlanSubscriptions.abi,
        library.getSigner()
      );
      const planIdBig = ethers.BigNumber.from(planId);
      const transaction = await contract.subscribe(planIdBig, event.target.value);
      console.log(transaction);
      setProcessingMsg('Transaction submitted! ');
      setIsSubmitting(false);
    } else {
      connect();
    }
  };

  return (
    <Card>
      <CardHeader title={planTitle} />
      <Typography variant="h3" gutterBottom>
        {price}
      </Typography>
      <Typography variant="string" gutterBottom paragraph>
        {frequency}
      </Typography>
      <Typography variant="string" gutterBottom paragraph>
        <Typography style={{ fontWeight: 600 }} variant="inline">
          {features[0]}
        </Typography>
        Storage
      </Typography>
      <Typography variant="string" gutterBottom paragraph>
        <Typography style={{ fontWeight: 600 }} variant="inline">
          {features[1]}
        </Typography>
        Live Apps
      </Typography>
      <Typography variant="string" gutterBottom paragraph>
        {features[2]}
      </Typography>
      <Box>
        <LoadingButton
          size="large"
          variant="contained"
          onClick={subscribe}
          loading={isSubmitting}
          color="info"
          value={email}
        >
          Subscribe
        </LoadingButton>
        <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mt: 3 }}>
          {processingMsg}
        </Typography>
      </Box>
    </Card>
  );
}
