import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import UserDashboardLayout from './layouts/userDashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Account from './pages/Account';
import UserAccount from './pages/UserAccount';
import Services from './pages/Services';
import Subscriptions from './pages/Subscriptions';
import Plans from './pages/Plans';
import Events from './pages/Events';
import NotFound from './pages/Page404';
import SubscribeDemo from './pages/SubscribeDemo';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/service',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/service/account" replace /> },
        { path: 'account', element: <Account /> },
        { path: 'services', element: <Services /> },
        { path: 'plans', element: <Plans /> },
        { path: 'events', element: <Events /> }
      ]
    },
    {
      path: '/user',
      element: <UserDashboardLayout />,
      children: [
        { element: <Navigate to="/user/account" replace /> },
        { path: 'account', element: <UserAccount /> },
        { path: 'subscriptions', element: <Subscriptions /> },
        { path: 'events', element: <Events /> }
      ]
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { path: 'subscribe', element: <SubscribeDemo /> },
        { path: '404', element: <NotFound /> },
        { path: '/', element: <Navigate to="/service/account" /> },
        { path: '*', element: <Navigate to="/404" /> }
      ]
    },
    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}
