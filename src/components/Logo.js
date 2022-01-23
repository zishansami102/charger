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
      src="/static/user_icon.png"
      sx={{ margin: '25px', width: 150, height: 32, ...sx }}
    />
  );
}
