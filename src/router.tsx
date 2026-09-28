import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home.tsx';

export default function router() {
  return createBrowserRouter([
    {
      path: '/',
      element: 0,
      children: [
        { index: true, element: <Home /> }
      ]
    }
  ]);
}