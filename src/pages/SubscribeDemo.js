// material
import { styled } from '@mui/material/styles';
import { Card, Stack, Link, Container, Typography, Box, Grid, Paper } from '@mui/material';
// components
import Page from '../components/Page';

import PlanPricing from '../components/_dashboard/subscriptions/PlanPricing';
// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2)
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0)
}));

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary
}));

// ----------------------------------------------------------------------

export default function Login() {
  return (
    <Page title="Subscribe to plans">
      <Container maxWidth="xl">
        <Box sx={{ margin: '0px', textAlign: 'center' }}>
          <Box sx={{ margin: '75px', textAlign: 'center' }}>
            <Typography sx={{ margin: '0px' }} variant="h4">
              Select a plan and click Subscribe
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={1.5} />
            <Grid item xs={12} sm={6} md={3}>
              <PlanPricing
                planId="0x90322650adfef612d59d8eb0b7c09fd1bf50892d8ef221fad2922fb8a41b7b7f"
                planTitle="Basic"
                price="0.003 ETH"
                frequency="Per Month"
                features={['16GB ', '3 ', 'No Support']}
                email="dbtsAF23htn345bx"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <PlanPricing
                planId="0x9851a40e476af9368153e20c5e2954d28b06f7138ce4d25f3500db8d56b80502"
                planTitle="Standard"
                price="0.01 ETH"
                frequency="Per Month"
                features={['64GB ', '12 ', 'Email Support']}
                email="xcWzsc23ER4cdDcc"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <PlanPricing
                planId="0xfa74a6145a0b8a4ea3c4187a9399d5e1ffa54ba4952db36134c1c32f90705197"
                planTitle="Premium"
                price="0.1 ETH"
                frequency="Per Month"
                features={['300GB ', 'Unlimited ', 'Live Email Support']}
                email="cAhbA34kj2kjbAkj"
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Page>
  );
}
