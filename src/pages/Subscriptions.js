import * as React from 'react';
import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import plusFill from '@iconify/icons-eva/trash-2-outline';
import { Link as RouterLink } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { formatEther } from '@ethersproject/units';
// material
import {
  Box,
  Card,
  Table,
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination
} from '@mui/material';
import { tokenImages } from '../utils/loadImage';
// components
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import EmptyTable from '../components/EmptyTable';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../components/_dashboard/user';
import useSubsData from '../components/_dashboard/subscriptions/SubsDataLoad';
import UserPlanSubscriptions from '../contracts/UserPlanSubscriptions.json';
//
// import USERLIST from '../_mocks_/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'serviceCode', label: 'Service Name', alignRight: false },
  { id: 'planCode', label: 'Plan', alignRight: false },
  { id: 'eligibleUserId', label: 'Subscribed User', alignRight: false },
  { id: 'billingType', label: 'Billing Type', alignRight: false },
  { id: 'costPerBilling', label: 'Cost Per Billing', alignRight: false },
  { id: 'amountDue', label: 'Amount Due', alignRight: false },
  { id: 'action', label: 'Actions', alignRight: false },
  { id: '' }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

function getBillingType(index) {
  const billingType = ['MINUTELY', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];
  return billingType[index];
}

export default function User() {
  const USERLIST = [];
  const { active, account, library } = useWeb3React();
  const { subsList, updatePlanList } = useSubsData();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [processingMsg, setProcessingMsg] = React.useState('');

  if (active && subsList) {
    console.log(subsList);
    for (let i = 0; i < subsList.length; ) {
      const subs = subsList[i];
      const subsDict = {
        id: subs.subscriptionId,
        serviceName: subs.serviceCode,
        planName: subs.planCode,
        billingFrequency: getBillingType(subs.billingFrequency),
        costPerBilling: ethers.utils.formatEther(subs.costPerBilling),
        userHash: subs.userIdHash.toString(),
        amountDue: ethers.utils.formatEther(subs.amountDue)
      };
      USERLIST.push(subsDict);
      i += 1;
    }
  }

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('amountDue');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.serviceName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const unsubscribe = async (event) => {
    setIsSubmitting(true);
    setProcessingMsg('Transaction submitting! ');
    const contract = new ethers.Contract(
      UserPlanSubscriptions.networks[process.env.REACT_APP_NETWORK_ID].address,
      UserPlanSubscriptions.abi,
      library.getSigner()
    );
    const subscriptionId = event.target.value;
    const transaction = await contract.unsubscribe(subscriptionId);
    console.log(transaction);
    setProcessingMsg('Transaction submitted! ');
    setIsSubmitting(false);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);
  // const filteredUsers = USERLIST;
  const isUserNotFound = filteredUsers.length === 0;

  const searchPlaceholder = 'Search subscription';
  console.log(filteredUsers);
  return (
    <Page title="User Dashboard | Subscriptions">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Your Subscriptions
          </Typography>
          <Box>
            {/* <Grid container spacing={3} justify="space-between">
              <Grid item>
                <CreatePlanForm />
              </Grid>
              <Grid item>
                <CollectByPlan />
              </Grid>
            </Grid> */}
          </Box>
        </Stack>

        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            placeholder={searchPlaceholder}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={USERLIST.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const {
                        id,
                        serviceName,
                        userHash,
                        costPerBilling,
                        planName,
                        billingFrequency,
                        amountDue
                      } = row;
                      const isItemSelected = selected.indexOf(serviceName) !== -1;
                      console.log('Hey I am able to reach here');
                      return (
                        <TableRow
                          hover
                          key={id}
                          tabIndex={-1}
                          role="checkbox"
                          selected={isItemSelected}
                          aria-checked={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={(event) => handleClick(event, serviceName)}
                            />
                          </TableCell>
                          <TableCell align="left">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              {/* <Avatar alt={name} src={avatarUrl} /> */}
                              <Typography variant="subtitle2" noWrap>
                                {serviceName}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">{planName}</TableCell>
                          <TableCell align="left">{userHash}</TableCell>
                          <TableCell align="left">{billingFrequency}</TableCell>
                          <TableCell align="left">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                alt="ETH"
                                src={tokenImages('eth')}
                                sx={{ width: 20, height: 20 }}
                              />
                              <Typography variant="subtitle2" noWrap>
                                {costPerBilling}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                alt="ETH"
                                src={tokenImages('eth')}
                                sx={{ width: 20, height: 20 }}
                              />
                              <Typography variant="subtitle2" noWrap>
                                {amountDue}
                              </Typography>
                            </Stack>
                          </TableCell>
                          {/* <TableCell align="left">{amountDue}</TableCell> */}
                          <TableCell aligh="right">
                            <Button
                              variant="contained"
                              value={id}
                              onClick={unsubscribe}
                              startIcon={<Icon icon={plusFill} />}
                            >
                              Unsubscribe
                            </Button>
                          </TableCell>
                          <TableCell align="right">
                            <UserMoreMenu />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {!active && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={8} sx={{ py: 3 }}>
                        <EmptyTable
                          emptyHeader="Wallet not connected"
                          emptyMessage="Please connect your wallet!"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
                {active && isUserNotFound && filterName !== '' && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={8} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
                {active && isUserNotFound && filterName === '' && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={8} sx={{ py: 3 }}>
                        <EmptyTable
                          emptyHeader="No subscription found"
                          emptyMessage="You have not subscribed to any service yet!"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={USERLIST.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}
