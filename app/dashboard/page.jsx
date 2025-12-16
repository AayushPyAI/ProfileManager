// app/dashboard/page.jsx
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import DashboardClient from './DashboardClient';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <>
    <ProtectedRoute>
      <Navbar />

      <main className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
        <DashboardClient />
      </main>

      <Footer />
      </ProtectedRoute>
    </>
  );
}
