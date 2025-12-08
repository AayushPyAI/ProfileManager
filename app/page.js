'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/login';
// import RegisterModal from '@/components/register';
import Button from '@/components/button';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useEffect } from 'react';

const Home = () => {
  const router = useRouter();
  const { user, logout ,  isLoading } = useUser();
  const [activeModal, setActiveModal] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const openLogin = () => setActiveModal('login');
  const openRegister = () => setActiveModal('register');
  const closeModal = () => setActiveModal(null);

  const handleLogout = () => setShowLogoutModal(true);
  useEffect(() => {
  if (user && ! isLoading) {
    router.replace('/dashboard'); 
  }
}, [user, isLoading, router]);


  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    router.push('/');
  };

  const goToDashboard = () => router.push('/dashboard');

  return (
    <div className="min-h-screen bg-linear-to-br from-[#4E56C0] to-[#FDCFFA] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="text-center w-full max-w-sm sm:max-w-md md:max-w-lg space-y-10">

        {/* Heading */}
        <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-[#4E56C0] bg-clip-text text-transparent leading-tight">
              ProfileManager
            </h1>
          <p className="text-base sm:text-lg md:text-xl text-white font-light px-3">
            Manage your professional profile with ease
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 w-full mx-auto px-2">

          {!user && 
            <>
              <Button
                title="Sign In"
                onClick={openLogin}
                className="bg-[#4E56C0] text-white font-semibold py-3 sm:py-4 rounded-xl shadow-md hover:shadow-xl transition-transform duration-200 hover:-translate-y-0.5"
              />

              {/* <Button
                title="Create Account"
                onClick={openRegister}
                className="bg-white hover:bg-slate-50 text-[#4E56C0] border-2 border-[#4E56C0] font-semibold py-3 sm:py-4 rounded-xl shadow-md hover:shadow-xl transition-transform duration-200 hover:-translate-y-0.5"
              /> */}
            </>
           }
          {/* // ) : (
          //   <>
          //     <div className="text-center mb-2 sm:mb-4">
          //       <div className="relative inline-block mb-4">
          //         <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white shadow-lg mx-auto overflow-hidden bg-slate-200">
          //           {(() => {
          //             const avatarUrl = user?.avatar?.url || user?.avatar;
          //             if (avatarUrl && avatarUrl.trim() !== '') {
          //               return (
          //                 <Image
          //                   src={avatarUrl}
          //                   alt={user?.name || 'avatar'}
          //                   width={40}
          //                   height={40}
          //                   className="w-full h-full object-cover"
          //                 />
          //               );
          //             }
          //             return (
          //               <div className="flex items-center justify-center w-full h-full text-slate-500 text-lg font-semibold">
          //                 {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          //               </div>
          //             );
          //           })()}
          //         </div>
          //       </div>

          //       <h2 className="text-xl sm:text-2xl font-semibold text-white">
          //         Welcome back, {user.name}!
          //       </h2>
          //       <p className="text-slate-500 text-sm sm:text-base mt-1">
          //         Ready to manage your profile?
          //       </p>
          //     </div>
          //     <Button
          //       title="Go to Dashboard"
          //       onClick={goToDashboard}
          //       className="bg-[#4E56C0] hover:bg-white text-white hover:text-[#4E56C0] font-semibold py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-transform duration-200 hover:-translate-y-0.5"
          //     />

          //     <Button
          //       title="Logout"
          //       onClick={handleLogout}
          //       className="bg-white hover:bg-[#4E56C0] hover:text-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 font-semibold py-3 sm:py-4 rounded-xl shadow-md hover:shadow-xl transition-colors duration-200"
          //     />
          //   </>
          // )} */}
        </div>
      </div>

{activeModal === 'login' && (
  <dialog className="modal modal-open">
    <div className="modal-box relative bg-white border border-gray-300 rounded-xl w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
      
      <button
        className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 hover:bg-gray-200 text-gray-700"
        onClick={closeModal}
      >
        <X className="w-4 h-4" />
      </button>

      <div className="p-4 sm:p-6 text-gray-900">
        <LoginForm
          onSuccess={closeModal}
          onClose={closeModal}
          // onSwitchToRegister={() => setActiveModal('register')}
        />
      </div>
    </div>

    <div className="modal-backdrop bg-black/50" onClick={closeModal} />
  </dialog>
)}

{/* Register Modal */}
{/* {activeModal === 'register' && (
  <dialog className="modal modal-open">
    <div className="modal-box relative bg-white border border-gray-300 rounded-xl w-[95vw] max-w-md overflow-y-auto scrollbar-none">
      
      <button
        className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 hover:bg-gray-200 text-gray-700"
        onClick={closeModal}
      >
        <X className="w-4 h-4" />
      </button>

      <div className="p-4 sm:p-6 text-gray-900">
        <RegisterModal
          onSuccess={closeModal}
          onSwitchToLogin={() => setActiveModal('login')}
        />
      </div>

    </div>
    <div className="modal-backdrop bg-black/50" onClick={closeModal} />
  </dialog>
)} */}


      {/* Logout Modal */}
      {showLogoutModal && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white shadow-2xl border border-slate-200 rounded-2xl max-w-xs sm:max-w-sm mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-orange-100">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-slate-800">
                Confirm Logout
              </h3>
            </div>

            <p className="py-4 text-slate-600 text-sm sm:text-base">
              Are you sure you want to logout?
            </p>

            <div className="modal-action w-full">
              <div className="flex gap-3 w-full">

                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="btn btn-ghost flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-2 sm:py-3 font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmLogout}
                  className="btn flex-1 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl py-2 sm:py-3 font-medium shadow-lg hover:shadow-xl"
                >
                  Yes, Logout
                </button>

              </div>
            </div>
          </div>

          <div
            className="modal-backdrop bg-black/40"
            onClick={() => setShowLogoutModal(false)}
          />
        </dialog>
      )}
    </div>
  );
};

export default Home;
