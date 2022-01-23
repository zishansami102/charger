import * as React from 'react';
import { filter } from 'lodash';
import { useState } from 'react';
// material
import {
  Grid,
  Box,
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
import useSWR from 'swr';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { formatEther } from '@ethersproject/units';
// utils
import { tokenImages } from '../utils/loadImage';
// components
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../components/_dashboard/user';
import DepositForm from '../components/_dashboard/account/DepositForm';
import WithdrawForm from '../components/_dashboard/account/WithdrawForm';
import { fetcher } from '../components/wallet/fetcher';
import UserPlanSubscriptions from '../contracts/UserPlanSubscriptions.json';

const TABLE_HEAD = [
  { id: 'token_name', label: 'Token Name', alignRight: false },
  { id: 'symbol', label: 'Symbol', alignRight: false },
  { id: 'account_balance', label: 'Balance', alignRight: false },
  { id: 'due_balance', label: 'Due Amount', alignRight: false },
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

export default function User() {
  const { active, account, library } = useWeb3React();
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

  const USERLIST = [
    {
      id: 'eth',
      avatarUrl: tokenImages('eth'),
      tokenName: 'Ethereum',
      tokenSymbol: 'ETH',
      tokenDue: ethDue ? formatEther(ethDue) : '--',
      tokenBalance: currentEthBalance ? formatEther(currentEthBalance) : '--'
    },
    {
      id: 'usdt',
      avatarUrl: tokenImages('usdt'),
      tokenName: 'Tether USD',
      tokenSymbol: 'USDT',
      tokenDue: ethDue ? parseFloat(formatEther(0)).toPrecision(2) : '--',
      tokenBalance: currentEthBalance ? parseFloat(formatEther(0)).toPrecision(2) : '--'
    },
    {
      id: 'dai',
      avatarUrl: tokenImages('dai'),
      tokenName: 'Dai',
      tokenSymbol: 'DAI',
      tokenDue: ethDue ? parseFloat(formatEther(0)).toPrecision(2) : '--',
      tokenBalance: currentEthBalance ? parseFloat(formatEther(0)).toPrecision(2) : '--'
    }
  ];

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('tokenBalance');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.tokenName);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  const searchPlaceholder = 'Search token';

  return (
    <Page title="User Dashboard | Wallet">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Wallet Details
          </Typography>
          <Box>
            <Grid container spacing={3} justify="space-between">
              <Grid item>
                <DepositForm />
              </Grid>
              <Grid item>
                <WithdrawForm />
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
                  rowCount={USERLIST.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const { id, avatarUrl, tokenName, tokenSymbol, tokenDue, tokenBalance } = row;
                      const isItemSelected = selected.indexOf(tokenName) !== -1;

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
                              onChange={(event) => handleClick(event, tokenName)}
                            />
                          </TableCell>
                          <TableCell component="th" scope="row" padding="none">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                alt={tokenSymbol}
                                src={avatarUrl}
                                sx={{ width: 30, height: 30 }}
                              />
                              <Typography variant="subtitle2" noWrap>
                                {tokenName}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">{tokenSymbol}</TableCell>
                          <TableCell align="left">{tokenBalance}</TableCell>
                          <TableCell align="left">{tokenDue}</TableCell>
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
                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
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
