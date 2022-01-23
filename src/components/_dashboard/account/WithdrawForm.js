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
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Stack,
  Typography
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/minus-square-outline';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import UserPlanSubscriptions from '../../../contracts/UserPlanSubscriptions.json';

export default function MaxWidthDialog() {
  const { active, library } = useWeb3React();
  const [open, setOpen] = React.useState(false);
  const [selectedToken, setToken] = React.useState('ETH');
  const [amountToWithdraw, setAmountToWithdraw] = React.useState('');
  const [processingMsg, setProcessingMsg] = React.useState('');
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

  const handleAmountToWithdrawChange = (event) => {
    setAmountToWithdraw(event.target.value);
  };

  const withdrawBalance = async (event) => {
    setIsSubmitting(true);
    const contract = new ethers.Contract(
      UserPlanSubscriptions.networks[process.env.REACT_APP_NETWORK_ID].address,
      UserPlanSubscriptions.abi,
      library.getSigner()
    );
    const amount = ethers.utils.parseEther(amountToWithdraw);
    console.log(amount);
    try {
      setProcessingMsg('Transaction requested.');
      const transaction = await contract.withdraw(amount);
      const receipt = await transaction.wait();
      console.log(receipt);
      setProcessingMsg('Transaction submitted.');
    } catch (err) {
      console.log(err);
      if (err.code === 4001) {
        setProcessingMsg('Transaction rejected by the user.');
      } else if (err.code === -32603) {
        setProcessingMsg('Requested amount less than the balance.');
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
        Withdraw
      </Button>
      <Dialog fullWidth="true" maxWidth="xs" open={open} onClose={handleClose}>
        <DialogTitle>Withdraw balance</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter the amount you want to withdraw and submit.</DialogContentText>
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
                <InputLabel htmlFor="max-width">Token</InputLabel>
                <Select
                  autoFocus
                  value={selectedToken}
                  label="tokenSymbol"
                  inputProps={{
                    name: 'max-width',
                    id: 'max-width'
                  }}
                  onChange={handleTokenChange}
                >
                  <MenuItem value="ETH">ETH</MenuItem>
                  <MenuItem value="USDT">USDT</MenuItem>
                  <MenuItem value="DAI">DAI</MenuItem>
                </Select>
                <TextField
                  id="amount"
                  label="Amount"
                  type="number"
                  variant="outlined"
                  placeholder="0.0"
                  value={amountToWithdraw}
                  onChange={handleAmountToWithdrawChange}
                />
                <LoadingButton
                  size="large"
                  variant="contained"
                  onClick={withdrawBalance}
                  // loading={isSubmitting}
                >
                  Withdraw
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
