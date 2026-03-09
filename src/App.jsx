import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Internos from './pages/Internos';
import InternoDetalle from './pages/InternoDetalle';
import ImportarExcel from './pages/ImportarExcel';
import Sectores from './pages/Sectores';
import SectorDetalle from './pages/SectorDetalle';
import Cursos from './pages/Cursos';
import Inscripciones from './pages/Inscripciones';
import Auditoria from './pages/Auditoria';
import MiSector from './pages/MiSector';
import Certificados from './pages/Certificados';
import Reportes from './pages/Reportes';
import Verificar from './pages/Verificar';
import Configuracion from './pages/Configuracion';
import Correcciones from './pages/Correcciones';
import { ROLES } from './data/mockData';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="internos" element={<Internos />} />
            <Route path="internos/:id" element={<InternoDetalle />} />
            <Route path="importar" element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.COORDINACION]}>
                <ImportarExcel />
              </ProtectedRoute>
            } />
            <Route path="sectores" element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.COORDINACION]}>
                <Sectores />
              </ProtectedRoute>
            } />
            <Route path="sectores/:id" element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.COORDINACION]}>
                <SectorDetalle />
              </ProtectedRoute>
            } />
            <Route path="mi-sector" element={
              <ProtectedRoute roles={[ROLES.RESPONSABLE, ROLES.CARGADOR]}>
                <MiSector />
              </ProtectedRoute>
            } />
            <Route path="cursos" element={<Cursos />} />
            <Route path="inscripciones" element={<Inscripciones />} />
            <Route path="certificados" element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.COORDINACION, ROLES.JEFE]}>
                <Certificados />
              </ProtectedRoute>
            } />
            <Route path="reportes" element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.COORDINACION, ROLES.JEFE]}>
                <Reportes />
              </ProtectedRoute>
            } />
            <Route path="correcciones" element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.COORDINACION, ROLES.RESPONSABLE, ROLES.JEFE]}>
                <Correcciones />
              </ProtectedRoute>
            } />
            <Route path="auditoria" element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.COORDINACION]}>
                <Auditoria />
              </ProtectedRoute>
            } />
            <Route path="configuracion" element={
              <ProtectedRoute roles={[ROLES.ADMIN]}>
                <Configuracion />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="verificar/:codigo" element={<Verificar />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
