'use client';
import {useEffect, useState } from 'react';
import { Edit3, Trash2, ChevronLeft, ChevronRight, Eye, Share2, X, Copy, Check, Mail, Linkedin, Facebook, Download } from 'lucide-react';
import Image from 'next/image';
import { generatePrintableHTML } from '@/app/generatedPrintablePdf';

const TINYURL_API_TOKEN = process.env.NEXT_PUBLIC_TINYURL_API_TOKEN; // or direct string

const PortfolioModal = ({ isOpen, onClose, profile }) => {
  const [copied, setCopied] = useState(false);
  const [shortUrl, setShortUrl] = useState("");
  const [loadingShort, setLoadingShort] = useState(false);

  const portfolioUrl = profile?._id
    ? `${window.location.origin}/${profile._id}`
    : "";

  useEffect(() => {
    const createShortUrl = async () => {
      if (!portfolioUrl) return;
      setLoadingShort(true);

      try {
        const res = await fetch("https://api.tinyurl.com/create", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TINYURL_API_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            url: portfolioUrl,
            domain: "tinyurl.com"
          })
        });

        const data = await res.json();
        if (data?.data?.tiny_url) {
          setShortUrl(data.data.tiny_url);
        } else {
          setShortUrl(portfolioUrl); // fallback
        }
      } catch (err) {
        console.error("TinyURL Error:", err);
        setShortUrl(portfolioUrl);
      }

      setLoadingShort(false);
    };

    if (isOpen) createShortUrl();
  }, [isOpen, portfolioUrl]);

  const handleCopyLink = async () => {
    if (shortUrl) {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform) => {
    const urlToShare = encodeURIComponent(shortUrl);
    const text = encodeURIComponent(`Check out ${profile?.name || "this portfolio"}!`);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${urlToShare}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${urlToShare}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${urlToShare}`,
      whatsapp: `https://wa.me/?text=${text}%20${urlToShare}`
    };

    if (urls[platform]) window.open(urls[platform], "_blank", "width=600,height=400");
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg">
      <div className="bg-linear-to-br from-white to-blue-50 rounded-3xl shadow-2xl w-full max-w-md mx-4 border border-blue-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-200 bg-[#9B5DE0] rounded-t-3xl">
          <h3 className="text-lg font-bold text-white">Portfolio Options</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Profile Info */}
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
            {profile?.personal?.avatar?.url ? <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
               <Image src={profile?.personal?.avatar?.url} alt={profile?.personal?.name || "P"} width={30} height={30} className='object-cover'/>
              </div> :    <div className="w-12 h-12 bg-linear-to-b  bg-[#9B5DE0] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">
                  {profile.personal.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || "P"}
                </span>
              </div>}
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-lg">{profile.personal.name || "Unnamed Profile"}</h4>
              <p className="text-sm text-gray-600">{profile.personal.email || "No email"}</p>
            </div>
          </div>
          
          <div className="space-y-2">
  <div className="flex gap-2">
    
    {loadingShort ? (
      // Skeleton loading placeholder
      <div className="flex-1 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
    ) : (
      <input
        type="text"
        value={shortUrl}
        readOnly
        className="input input-bordered flex-1 text-sm bg-white border-2 border-blue-200 focus:border-blue-500 text-gray-800 font-medium"
      />
    )}
    
    <button
      disabled={loadingShort}
      onClick={handleCopyLink}
      className="btn bg-[#9B5DE0] text-white border-0 btn-square disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
    >
      {loadingShort ? (
        // Small loading spinner icon
        <span className="loading loading-spinner loading-sm"></span>
      ) : copied ? (
        <Check className="w-4 h-4" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  </div>
</div>


          {/* Short URL Input */}
          {/* <div className="space-y-2">

            <div className="flex gap-2">
              <input
                type="text"
                value={shortUrl}
                readOnly
                className="input input-bordered flex-1 text-sm bg-white border-2 border-blue-200 focus:border-blue-500 text-gray-800 font-medium"
              />
              <button
                disabled={loadingShort}
                onClick={handleCopyLink}
                className="btn bg-[#9B5DE0] text-white border-0 btn-square"
              >
                {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
              </button>
            </div>
          </div> */}

          {/* View Portfolio */}
          {/* <button
            onClick={() => window.open(shortUrl, "_blank")}
            disabled={!shortUrl || loadingShort}
            className="btn bg-[#9B5DE0] text-white w-full gap-2 shadow-lg hover:shadow-xl"
          >
            <Eye className="w-5 h-5"/>
            View Portfolio
          </button> */}

          {/* Share */}
          <div className="border-t border-blue-200 pt-4">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">Share on Social Media</span>
            </label>
            <div className="flex flex-row gap-2 opacity-100">
              <button className="text-white border-0" onClick={() => handleShare("twitter")}>
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className='w-8 h-8' viewBox="0 0 50 50">
<path d="M 6.9199219 6 L 21.136719 26.726562 L 6.2285156 44 L 9.40625 44 L 22.544922 28.777344 L 32.986328 44 L 43 44 L 28.123047 22.3125 L 42.203125 6 L 39.027344 6 L 26.716797 20.261719 L 16.933594 6 L 6.9199219 6 z"></path>
</svg></button>
              <button className=" text-white border-0" onClick={() => handleShare("linkedin")}><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  className='w-8 h-8' viewBox="0 0 48 48">
<path fill="#0288D1" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path><path fill="#FFF" d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"></path>
</svg></button>
              <button className=" text-white border-0" onClick={() => handleShare("facebook")}><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  className='w-8 h-8' viewBox="0 0 48 48">
<path fill="#039be5" d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"></path><path fill="#fff" d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701v13.729C22.089,42.905,23.032,43,24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z"></path>
</svg></button>
              <button className="text-white border-0" onClick={() => handleShare("whatsapp")}><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  className='w-8 h-8' viewBox="0 0 48 48">
<path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6	C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"></path><path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6	C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3	L5,43.8C5,43.8,4.9,43.8,4.9,43.8z"></path><path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3	L4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24	c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2	c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z"></path><path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8	l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"></path><path fill="#fff" fillRule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0	s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3	c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9	c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8	c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z" clipRule="evenodd"></path>
</svg></button>    
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const ProfileList = ({ 
  profiles, 
  onEdit, 
  onDelete, 
  isLoading = false 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;
 const filteredProfiles = profiles;

  // Pagination
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProfiles = filteredProfiles.slice(startIndex, startIndex + itemsPerPage);

  const handlePortfolioAction = (profile) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };
  
  const handleOpenPortfolio = (profile) => {
  if (!profile?._id) return;
  const portfolioUrl = `${window.location.origin}/${profile._id}`;
  window.open(portfolioUrl, "_blank");
};

const handleDownloadPDF = async (profile) => {
  if (typeof window === "undefined") return;
  if (!profile?._id) return;

  try {
    const htmlContent = generatePrintableHTML(profile);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    // Save the window reference
    const pdfWindow = window.open(url, "_blank");

    // Cleanup when that tab is closed
    const timer = setInterval(() => {
      if (!pdfWindow || pdfWindow.closed) {
        clearInterval(timer);
        URL.revokeObjectURL(url);
      }
    }, 2000);

  } catch (error) {
    console.error("Redirection error:", error);
  }
};




  if (isLoading) {
    return (
      <div className="card bg-linear-to-br from-white to-blue-50 shadow-2xl border border-blue-200 rounded-3xl">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-[#4E56C0] text-white">
                  <th className="w-12 text-center rounded-tl-2xl">#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Experience</th>
                  <th>Education</th>
                  <th className="w-32 text-center rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-blue-50 transition-colors">
                    <td><div className="h-4 bg-linear-to-r from-blue-200 to-purple-200 rounded w-8 animate-pulse mx-auto"></div></td>
                    <td><div className="h-4 bg-linear-to-r from-blue-200 to-purple-200 rounded w-32 animate-pulse"></div></td>
                    <td><div className="h-4 bg-linear-to-r from-blue-200 to-purple-200 rounded w-40 animate-pulse"></div></td>
                    <td><div className="h-4 bg-linear-to-r from-blue-200 to-purple-200 rounded w-24 animate-pulse"></div></td>
                    <td><div className="h-4 bg-linear-to-r from-blue-200 to-purple-200 rounded w-16 animate-pulse"></div></td>
                    <td><div className="h-4 bg-linear-to-r from-blue-200 to-purple-200 rounded w-16 animate-pulse"></div></td>
                    <td><div className="h-8 bg-linear-to-r from-blue-200 to-purple-200 rounded animate-pulse"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  
  return (
     <div>
   {profiles.length > 0 ? <>
      <div className="space-y-6">
        {/* Table */}
        <div className="card bg-linear-to-br from-white to-blue-50 rounded-t-3xl text-gray-800 shadow-2xl border-2 border-blue-200 overflow-hidden">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table w-full border-collapse table-auto">
                <thead>
                  <tr className="bg-[#4E56C0] text-white text-sm font-bold text-center">
                    <th className="w-12 text-center py-4 rounded-tl-3xl justify-center">Id</th>
                    <th className="py-4 border-white border-x">Profile</th>
                    <th className="py-4 border-white border-x">Email</th>
                    <th className="text-center py-4 border-white border-x">Experience</th>
                    <th className="text-center py-4 border-white border-x">Education</th>
                    <th className="w-48 text-center py-4 rounded-tr-3xl border-white border-x">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProfiles.map((profile, index) => (
                    <tr key={profile._id || profile.personal.email} className="hover:bg-blue-50/80 transition-all duration-200 border-b border-blue-100 last:border-b-0">
                      <td className="text-center font-bold text-[#4E56C0] py-4">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="avatar placeholder">
                           <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-sm">
                                {profile?.personal?.avatar?.url ? <Image src={profile?.personal?.avatar?.url} alt={profile?.personal?.name || "user"} fill className='object-contain rounded-full'/> : 
                                profile?.personal?.name ? profile?.personal?.name .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'P'
                                }
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-lg">
                              {profile?.personal.name || 'Unnamed Profile'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="space-y-2">
                          {profile?.personal?.email && (
                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                              <Mail className="w-4 h-4 text-blue-500" />
                              {profile.personal.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-center font-semibold text-gray-700 py-4">
                          {profile?.experience?.[0]?.position || 'Not specified'}
                      </td>
                      <td className="text-center font-semibold text-gray-700 py-4">
                          {profile?.education?.[0]?.degree || 'Not specified'}
                      </td>
                      <td className="py-4">
                        <div className="flex justify-center gap-2">
                            <button
                            onClick={() => handleOpenPortfolio(profile)}
                            className="btn bg-linear-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white border-0 btn-sm gap-1 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                            title="Portfolio Options"
                            disabled={!profile._id}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                           <button
                              onClick={() => handleDownloadPDF(profile)}
                              className="btn bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 btn-sm shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                              title="Download PDF"
                              disabled={!profile._id}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          <button
                            onClick={() => handlePortfolioAction(profile)}
                            className="btn bg-linear-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white border-0 btn-sm gap-1 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                            title="Portfolio Options"
                            disabled={!profile._id}
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(profile)}
                            className="btn bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 btn-sm shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => profile._id && onDelete(profile?._id)}
                            className="btn bg-linear-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 btn-sm shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                            title="Delete Profile"
                            disabled={!profile._id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-blue-200">
            <div className="text-sm font-semibold text-gray-700 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-200">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProfiles.length)} of {filteredProfiles.length} profiles
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 btn-sm gap-2 shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:hover:from-gray-400 disabled:hover:to-gray-500 transform hover:-translate-y-1 transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`btn btn-sm min-w-10 font-bold ${
                        currentPage === pageNum 
                          ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg' 
                          : 'bg-linear-to-r from-blue-100 to-purple-100 text-gray-700 border border-blue-200 hover:from-blue-200 hover:to-purple-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 btn-sm gap-2 shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:hover:from-gray-400 disabled:hover:to-gray-500 transform hover:-translate-y-1 transition-all duration-200"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Modal */}
      <PortfolioModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProfile(null);
        }}
        profile={selectedProfile}
      />
    </> : (
      <p className="text-center text-gray-600">No profiles found.</p>
    )}
</div>  );
};

export default ProfileList;