import PropTypes from 'prop-types';
// material
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

Logo.propTypes = {
  sx: PropTypes.object
};

export default function Logo({ sx }) {
  return (
    <Box
      component="img"
      src="/static/service_icon.png"
      sx={{ margin: '20px', width: 180, height: 32, ...sx }}
    />
  );
}
