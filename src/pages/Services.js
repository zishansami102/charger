import { filter } from 'lodash';
import { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { formatEther } from '@ethersproject/units';
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
import CreateServiceForm from '../components/_dashboard/services/CreateServiceForm';
import CollectByService from '../components/_dashboard/services/CollectByService';
import useServiceData from '../components/_dashboard/services/ServicesDataLoad';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'serviceCode', label: 'Service Name', alignRight: false },
  { id: 'numActivePlans', label: 'Active Plans', alignRight: false },
  { id: 'numActiveSubs', label: 'Active Subscribers', alignRight: false },
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

export default function User() {
  const SERVICELIST = [];
  const { active, account, library } = useWeb3React();
  const { ownedServices, updateOwnedServices } = useServiceData();

  if (active && ownedServices) {
    console.log(ownedServices);
    for (let i = 0; i < ownedServices.length; ) {
      const service = ownedServices[i];
      const serviceDict = {
        serviceId: service.serviceId,
        name: service.serviceCode,
        numActivePlans: service.numActivePlans.toString(),
        serviceCollectable: ethers.utils.formatEther(service.serviceCollectable),
        numActiveSubs: service.numActiveSubs.toString()
      };
      SERVICELIST.push(serviceDict);
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
      const newSelecteds = SERVICELIST.map((n) => n.serviceId);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - SERVICELIST.length) : 0;

  const filteredUsers = applySortFilter(SERVICELIST, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  const searchPlaceholder = 'Search services';
  console.log(filteredUsers);
  return (
    <Page title="Service Dashboard | Services">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Your Services
          </Typography>
          <Box>
            <Grid container spacing={3} justify="space-between">
              <Grid item>
                <CreateServiceForm />
              </Grid>
              <Grid item>
                <CollectByService selectedServices={selected} />
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
                  rowCount={SERVICELIST.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                {active ? (
                  <TableBody>
                    {filteredUsers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => {
                        const {
                          serviceId,
                          name,
                          numActiveSubs,
                          numActivePlans,
                          serviceCollectable
                        } = row;
                        const isItemSelected = selected.indexOf(serviceId) !== -1;

                        return (
                          <TableRow
                            hover
                            key={serviceId}
                            tabIndex={-1}
                            role="checkbox"
                            selected={isItemSelected}
                            aria-checked={isItemSelected}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isItemSelected}
                                onChange={(event) => handleClick(event, serviceId)}
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
                            <TableCell align="left">{numActivePlans}</TableCell>
                            <TableCell align="left">{numActiveSubs}</TableCell>
                            <TableCell align="left">
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar
                                  alt="ETH"
                                  src={tokenImages('eth')}
                                  sx={{ width: 20, height: 20 }}
                                />
                                <Typography variant="subtitle2" noWrap>
                                  {serviceCollectable}
                                </Typography>
                              </Stack>
                            </TableCell>
                            {/* <TableCell align="left">
                              <Label
                                variant="ghost"
                                color={(status === 'banned' && 'error') || 'success'}
                              >
                                {sentenceCase(status)}
                              </Label>
                            </TableCell> */}

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
                ) : (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
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
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
                {active && isUserNotFound && filterName === '' && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <EmptyTable
                          emptyHeader="No Service Found"
                          emptyMessage="You have not created any service, create a new service to start the process!"
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
            count={SERVICELIST.length}
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
