import Header from './components/ui/header/header';
import Footer from './components/ui/footer/footer';
import Home from './pages/home/home';
import Perfil from '../src/pages/login/login';
import ReactDOM from 'react-dom/client';
import FaleConosco from './pages/faleconosco/faleconosco';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from '../src/pages/register/register';
import ModalDefault from './pages/mockModal/modal';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    <Routes>
      <Route
        path="/fale-conosco"
        element={
          <>
            <Header />
            <FaleConosco />
            <Footer />
          </>
        }
      />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <>
            <Header />
            <Home />
            <Footer />
          </>
        }
      />
      <Route path="/modal" element={<ModalDefault />} />
    </Routes>
  </BrowserRouter>
);
