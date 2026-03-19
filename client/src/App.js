import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import HostPage from './pages/HostPage';
import ClientPage from './pages/ClientPage';
import './index.css';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/host" element={<HostPage />} />
          <Route path="/client" element={<ClientPage />} />
          <Route path="/client/:sessionId" element={<ClientPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}