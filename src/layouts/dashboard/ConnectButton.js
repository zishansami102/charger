import * as React from 'react';
import { Button, Typography } from '@mui/material';
import { formatEther } from '@ethersproject/units';
import useSWR from 'swr';
import { useWeb3React } from '@web3-react/core';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/flash-outline';
import { ethers } from 'ethers';

import AccountPopover from './AccountPopover';
import AccountDataLoad from '../../components/_dashboard/account/AccountDataLoad';
import { injected } from '../../components/authentication/connector';
import { fetcher } from '../../components/wallet/fetcher';

export default function MaxWidthDialog() {
  const { active, account, library, activate, deactivate } = useWeb3React();
  const [connectWalletText, setConnectWalletText] = React.useState('Connect Wallet');

  const connect = async () => {
    if (!active) {
      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      // Prompt user for account connections
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      console.log('Account:', await signer.getAddress());
      activate(injected);
    } else {
      deactivate();
    }
  };

  const { data: balance, mutate } = useSWR(['getBalance', account, 'latest'], {
    fetcher: fetcher(library)
  });

  React.useEffect(() => {
    console.log(`listening for blocks...`);
    console.log(library);
    if (library) {
      library.on('block', () => {
        console.log('update balance...');
        mutate(undefined, true);
      });
      return () => {
        library.removeAllListeners('block');
      };
    }
  }, []);

  return (
    <>
      {active ? (
        <>
          <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
            {account.slice(0, 5)}...{account.slice(-4, account.length)}
          </Typography>
          <AccountPopover
            address={account}
            balance={balance ? parseFloat(formatEther(balance)).toPrecision(4) : 'error'}
            disconnect={connect}
          />

          <AccountDataLoad />
          <useServiceData />
          <usePlanData />
        </>
      ) : (
        <Button variant="contained" onClick={connect} startIcon={<Icon icon={plusFill} />}>
          {connectWalletText}
        </Button>
      )}
    </>
  );
}
