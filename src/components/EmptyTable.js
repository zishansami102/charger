// material
import { Paper, Typography } from '@mui/material';

// ----------------------------------------------------------------------

// SearchNotFound.propTypes = {
//   searchQuery: PropTypes.string
// };

export default function EmptyTable({ emptyHeader, emptyMessage }) {
  return (
    <Paper>
      <Typography gutterBottom align="center" variant="subtitle1">
        {emptyHeader}
      </Typography>
      <Typography variant="body2" align="center">
        {emptyMessage}
      </Typography>
    </Paper>
  );
}
