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
import plusFill from '@iconify/icons-eva/plus-square-outline';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import UserPlanSubscriptions from '../../../contracts/UserPlanSubscriptions.json';

export default function MaxWidthDialog() {
  const { active, library } = useWeb3React();
  const [open, setOpen] = React.useState(false);
  const [selectedToken, setToken] = React.useState('ETH');
  const [processingMsg, setProcessingMsg] = React.useState('');
  const [amountToDeposit, setAmountToDeposit] = React.useState('');
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

  const handleAmountToDepositChange = (event) => {
    setAmountToDeposit(event.target.value);
  };

  const depositBalance = async () => {
    setIsSubmitting(true);
    const contract = new ethers.Contract(
      UserPlanSubscriptions.networks[process.env.REACT_APP_NETWORK_ID].address,
      UserPlanSubscriptions.abi,
      library.getSigner()
    );
    const amount = ethers.utils.parseEther(amountToDeposit);
    console.log(amount);
    try {
      setProcessingMsg('Transaction requested.');
      const transaction = await contract.deposit({ value: amount });
      const receipt = await transaction.wait();
      console.log(receipt);
      setProcessingMsg('Transaction submitted.');
    } catch (err) {
      console.log(err);
      if (err.code === 4001) {
        setProcessingMsg('Transaction rejected by the user.');
      } else if (err.code === -32603) {
        setProcessingMsg('Enter amount greater than zero.');
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
        Deposit
      </Button>
      <Dialog fullWidth="true" maxWidth="xs" open={open} onClose={handleClose}>
        <DialogTitle>Deposit into wallet</DialogTitle>
        <DialogContent>
          <DialogContentText>Select token and enter the amount and submit.</DialogContentText>
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
                  value={amountToDeposit}
                  onChange={handleAmountToDepositChange}
                />
                <LoadingButton
                  size="large"
                  variant="contained"
                  onClick={depositBalance}
                  loading={isSubmitting}
                >
                  Deposit
                </LoadingButton>
                <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mt: 3 }}>
                  {processingMsg}
                </Typography>
                {/* <DialogContentText></DialogContentText> */}
              </Stack>
            </FormControl>
            {/* <FormControlLabel
              sx={{ mt: 1 }}
              control={<Switch checked={fullWidth} onChange={handleFullWidthChange} />}
              label="Full width"
            /> */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
