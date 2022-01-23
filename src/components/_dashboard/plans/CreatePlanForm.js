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
import plusFill from '@iconify/icons-eva/file-add-outline';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import UserPlanSubscriptions from '../../../contracts/UserPlanSubscriptions.json';
import useServiceData from '../services/ServicesDataLoad';

export default function MaxWidthDialog() {
  const { active, library } = useWeb3React();
  const [open, setOpen] = React.useState(false);
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState('sm');
  const [selectedService, setSelectedService] = React.useState('');
  const [selectedBillingFrequency, setBillingFrequency] = React.useState('0');
  const [processingMsg, setProcessingMsg] = React.useState('');
  const [planCode, setPlanCode] = React.useState('');
  const [costPerBilling, setCostPerBilling] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { ownedServices, updateOwnedServices } = useServiceData();
  const SERVICE_LIST = [];
  if (active && ownedServices) {
    console.log(ownedServices);
    for (let i = 0; i < ownedServices.length; ) {
      const service = ownedServices[i];
      const serviceDict = {
        serviceId: service.serviceId,
        serviceCode: service.serviceCode
      };
      SERVICE_LIST.push(serviceDict);
      i += 1;
    }
  }

  const handleClickOpen = () => {
    if (active) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setProcessingMsg('');
  };

  const handleServiceChange = (event) => {
    setSelectedService(event.target.value);
    console.log(selectedService);
  };

  const handlePlanCodeChange = (event) => {
    setPlanCode(event.target.value);
  };

  const handleCostPerBillingChange = (event) => {
    setCostPerBilling(event.target.value);
  };

  const handleBillingFrequencyChange = (event) => {
    setBillingFrequency(event.target.value);
  };

  const createNewPlan = async (event) => {
    setIsSubmitting(true);
    const contract = new ethers.Contract(
      UserPlanSubscriptions.networks[process.env.REACT_APP_NETWORK_ID].address,
      UserPlanSubscriptions.abi,
      library.getSigner()
    );
    const costPerBillingInWei = ethers.utils.parseEther(costPerBilling);
    try {
      setProcessingMsg('Transaction requested.');
      const transaction = await contract.createPlan(
        selectedService,
        planCode,
        selectedBillingFrequency,
        costPerBillingInWei
      );
      const receipt = await transaction.wait();
      console.log(receipt);
      setProcessingMsg('Transaction submitted.');
    } catch (err) {
      console.log(err);
      if (err.code === 4001) {
        setProcessingMsg('Transaction rejected by the user.');
      } else if (err.code === -32603) {
        setProcessingMsg('Plan name already exist for this service, try different name.');
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
        New Plan
      </Button>
      <Dialog fullWidth={fullWidth} maxWidth={maxWidth} open={open} onClose={handleClose}>
        <DialogTitle>New Plan</DialogTitle>
        <DialogContent>
          <DialogContentText>Fill the details with a new plan code and submit.</DialogContentText>
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
            <Stack spacing={3} margin="20px">
              {/* <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}> */}
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="demo-simple-select-label" htmlFor="max-width">
                  Service
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  fullWidth
                  autoFocus
                  value={selectedService}
                  label="Service"
                  inputProps={{
                    name: 'max-width',
                    id: 'max-width'
                  }}
                  onChange={handleServiceChange}
                >
                  {SERVICE_LIST.map((row) => {
                    const { serviceId, serviceCode } = row;
                    return <MenuItem value={serviceId}>{serviceCode}</MenuItem>;
                  })}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="demo-simple-select-label2" htmlFor="billngType">
                  Billing Type
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label2"
                  fullWidth
                  autoFocus
                  value={selectedBillingFrequency}
                  label="Billing Type"
                  inputProps={{
                    name: 'billingType',
                    id: 'billingType'
                  }}
                  onChange={handleBillingFrequencyChange}
                >
                  <MenuItem value="0">Minutely</MenuItem>
                  <MenuItem value="1">Hourly</MenuItem>
                  <MenuItem value="2">Daily</MenuItem>
                  <MenuItem value="3">Weekly</MenuItem>
                  <MenuItem value="4">Monthly</MenuItem>
                  <MenuItem value="6">Yearly</MenuItem>
                </Select>
              </FormControl>
              {/* </Stack> */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  id="planCode"
                  label="Plan Name"
                  type="text"
                  variant="outlined"
                  placeholder="eg. Premium"
                  value={planCode}
                  onChange={handlePlanCodeChange}
                />
                <TextField
                  fullWidth
                  id="billingCost"
                  label="Billing Cost"
                  type="number"
                  variant="outlined"
                  placeholder="0.0"
                  value={costPerBilling}
                  onChange={handleCostPerBillingChange}
                />
              </Stack>
              <LoadingButton
                fullWidth
                size="large"
                variant="contained"
                onClick={createNewPlan}
                loading={isSubmitting}
              >
                Create
              </LoadingButton>
              <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mt: 3 }}>
                {processingMsg}
              </Typography>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
