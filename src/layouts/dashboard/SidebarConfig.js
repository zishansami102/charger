import { Icon } from '@iconify/react';
import pieChart2Fill from '@iconify/icons-eva/pie-chart-2-fill';
import peopleFill from '@iconify/icons-eva/cube-fill';
import shoppingBagFill from '@iconify/icons-eva/credit-card-fill';
import fileTextFill from '@iconify/icons-eva/file-text-fill';
import lockFill from '@iconify/icons-eva/lock-fill';
import personAddFill from '@iconify/icons-eva/person-add-fill';
import alertTriangleFill from '@iconify/icons-eva/alert-triangle-fill';

// ----------------------------------------------------------------------

const getIcon = (name) => <Icon icon={name} width={22} height={22} />;

const sidebarConfig = [
  {
    title: 'Wallet',
    path: '/service/account',
    icon: getIcon(pieChart2Fill)
  },
  {
    title: 'Services',
    path: '/service/services',
    icon: getIcon(peopleFill)
  },
  {
    title: 'Billing Plans',
    path: '/service/plans',
    icon: getIcon(shoppingBagFill)
  },
  {
    title: 'Payments History',
    path: '/service/events',
    icon: getIcon(fileTextFill)
  }
  // {
  //   title: 'login',
  //   path: '/login',
  //   icon: getIcon(lockFill)
  // },
  // {
  //   title: 'register',
  //   path: '/register',
  //   icon: getIcon(personAddFill)
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: getIcon(alertTriangleFill)
  // }
];

export default sidebarConfig;
