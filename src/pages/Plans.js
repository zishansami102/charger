import * as React from 'react';
import { filter } from 'lodash';
import { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
// material
import {
  Box,
  Grid,
  Card,
  Table,
  Stack,
  Avatar,
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
import CreatePlanForm from '../components/_dashboard/plans/CreatePlanForm';
import CollectByPlan from '../components/_dashboard/plans/CollectByPlan';
import { fetcher } from '../components/wallet/fetcher';
import usePlanData from '../components/_dashboard/plans/PlanDataLoad';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'planCode', label: 'Plan Name', alignRight: false },
  { id: 'serviceCode', label: 'Service Name', alignRight: false },
  { id: 'billingType', label: 'Billing Type', alignRight: false },
  { id: 'costPerBilling', label: 'Cost Per Billing', alignRight: false },
  { id: 'activeSubs', label: 'Active Subscribers', alignRight: false },
  { id: 'collectableAmount', label: 'Collectable Amount', alignRight: false },
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
  const PLANLIST = [];
  const { active } = useWeb3React();
  const { planList } = usePlanData();
  if (active && planList) {
    console.log(planList);
    for (let i = 0; i < planList.length; ) {
      const plan = planList[i];
      const planDict = {
        id: plan.planId,
        name: plan.planCode,
        serviceName: plan.serviceCode,
        costPerBilling: ethers.utils.formatEther(plan.costPerBilling),
        numActiveSubs: plan.numActiveSubs.toString(),
        billingFrequency: getBillingType(plan.billingFrequency),
        planCollectable: ethers.utils.formatEther(plan.planCollectable)
      };
      PLANLIST.push(planDict);
      i += 1;
    }
  }

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = PLANLIST.map((n) => n.id);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - PLANLIST.length) : 0;

  const filteredUsers = applySortFilter(PLANLIST, getComparator(order, orderBy), filterName);
  // const filteredUsers = PLANLIST;
  const isUserNotFound = filteredUsers.length === 0;

  const searchPlaceholder = 'Search plans';
  console.log(filteredUsers);
  return (
    <Page title="Service Dashboard | Plans">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Billing Plans
          </Typography>
          <Box>
            <Grid container spacing={3} justify="space-between">
              <Grid item>
                <CreatePlanForm />
              </Grid>
              <Grid item>
                <CollectByPlan selectedPlans={selected} />
              </Grid>
            </Grid>
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
                  rowCount={PLANLIST.length}
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
                        name,
                        billingFrequency,
                        numActiveSubs,
                        serviceName,
                        costPerBilling,
                        planCollectable
                      } = row;
                      const isItemSelected = selected.indexOf(id) !== -1;
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
                              onChange={(event) => handleClick(event, id)}
                            />
                          </TableCell>
                          <TableCell align="left">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              {/* <Avatar alt={name} src={avatarUrl} /> */}
                              <Typography variant="subtitle2" noWrap>
                                {name}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">{serviceName}</TableCell>
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
                          <TableCell align="left">{numActiveSubs}</TableCell>
                          <TableCell align="left">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                alt="ETH"
                                src={tokenImages('eth')}
                                sx={{ width: 20, height: 20 }}
                              />
                              <Typography variant="subtitle2" noWrap>
                                {planCollectable}
                              </Typography>
                            </Stack>
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
                          emptyHeader="No Plans Found"
                          emptyMessage="You have not created any plans, create a new plan to start the process!"
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
            count={PLANLIST.length}
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
