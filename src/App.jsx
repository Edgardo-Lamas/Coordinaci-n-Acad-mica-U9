import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
              <ProtectedRoute roles={[ROLES.RESPONSABLE]}>
                <MiSector />
              </ProtectedRoute>
            } />
            <Route path="cursos" element={<Cursos />} />
            <Route path="inscripciones" element={<Inscripciones />} />
            <Route path="certificados" element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.COORDINACION]}>
                <div className="empty-state" style={{ paddingTop: 80 }}>
                  <div className="empty-title">Certificados</div>
                  <div className="empty-text">Módulo disponible en la Fase 4</div>
                </div>
              </ProtectedRoute>
            } />
            <Route path="auditoria" element={
              <ProtectedRoute roles={[ROLES.ADMIN]}>
                <Auditoria />
              </ProtectedRoute>
            } />
            <Route path="configuracion" element={
              <ProtectedRoute roles={[ROLES.ADMIN]}>
                <div className="empty-state" style={{ paddingTop: 80 }}>
                  <div className="empty-title">Configuración</div>
                  <div className="empty-text">Gestión de usuarios, firmas y datos institucionales. Disponible próximamente.</div>
                </div>
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
