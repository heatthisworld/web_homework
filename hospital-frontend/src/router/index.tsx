import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Patients from '../pages/Patients';
import Doctors from '../pages/Doctors';
import Appointments from '../pages/Appointments';
import NotFound from '../pages/NotFound';

// 创建路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'patients', element: <Patients /> },
      { path: 'doctors', element: <Doctors /> },
      { path: 'appointments', element: <Appointments /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '*', element: <NotFound /> },
]);

export default router;