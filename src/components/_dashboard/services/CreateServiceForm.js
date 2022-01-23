import * as React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  TextField,
  Stack,
  Typography
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import UserPlanSubscriptions from '../../../contracts/UserPlanSubscriptions.json';

export default function MaxWidthDialog() {
  const { active, library } = useWeb3React();
  const [open, setOpen] = React.useState(false);
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState('xs');
  const [selectedToken, setToken] = React.useState('ETH');
  const [processingMsg, setProcessingMsg] = React.useState('');
  const [serviceCode, setServiceCode] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setProcessingMsg('');
  };

  const handleTokenChange = (event) => {
    setToken(event.target.value);
  };

  const handleServiceCodeChange = (event) => {
    setServiceCode(event.target.value);
  };

  const createNewService = async (event) => {
    setIsSubmitting(true);
    setProcessingMsg('Transaction requested.');
    const contract = new ethers.Contract(
      UserPlanSubscriptions.networks[process.env.REACT_APP_NETWORK_ID].address,
      UserPlanSubscriptions.abi,
      library.getSigner()
    );
    // const amount = ethers.utils.parseEther(serviceCode);
    try {
      const transaction = await contract.createService(serviceCode);
      const receipt = await transaction.wait();
      console.log(receipt);
      setProcessingMsg('Transaction submitted.');
    } catch (err) {
      console.log(err);
      if (err.code === 4001) {
        setProcessingMsg('Transaction rejected by the user.');
      } else if (err.code === -32603) {
        setProcessingMsg('Service name already exist, try different name.');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleClickOpen}
        startIcon={<Icon icon={plusFill} />}
        disabled={!active}
      >
        New Service
      </Button>
      <Dialog fullWidth={fullWidth} maxWidth={maxWidth} open={open} onClose={handleClose}>
        <DialogTitle>New Service</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter a unique service name for your new service.</DialogContentText>
          <Box
            noValidate
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'fit-content'
            }}
          >
            <FormControl sx={{ mt: 2, minWidth: 120 }}>
              <Stack spacing={3}>
                <TextField
                  id="serviceCode"
                  label="Service Name"
                  type="text"
                  variant="outlined"
                  placeholder="eg. Netflix"
                  value={serviceCode}
                  onChange={handleServiceCodeChange}
                />
                <LoadingButton
                  size="large"
                  variant="contained"
                  onClick={createNewService}
                  loading={isSubmitting}
                >
                  Create
                </LoadingButton>
                <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mt: 3 }}>
                  {processingMsg}
                </Typography>
              </Stack>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
