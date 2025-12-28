import { useAuth } from '@/contexts/AuthContext.next';
import { useGetAllAppointmentLetterQuery } from '@/redux/features/AppointmentLetter/AppointmentLetterApi';
import React, { useState } from 'react';
import { Download, FileText, Calendar, User } from 'lucide-react';

const ConfirmationLettersManagement = () => {
  const { user } = useAuth();
  const { data: appointmentData, isLoading, isError } = useGetAllAppointmentLetterQuery(user?.tutor_id);
  const [downloading, setDownloading] = useState(false);

  // Handle PDF download
  const handleDownload = async (pdfUrl:any, fileName = 'Appointment_Letter.pdf') => {
    try {
      setDownloading(true);
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Extract filename from URL
  const extractFileName = (url:any) => {
    if (!url) return 'Appointment_Letter.pdf';
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Appointment_Letter.pdf';
  };

  // Format date
  const formatDate = (dateString:any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>Failed to load data.</p>
      </div>
    );
  }

  const appointmentLetters = appointmentData?.data || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Appointment Letters Management</h2>
        <p className="text-gray-600">View and download your appointment confirmation letters</p>
      </div>
      
      {appointmentLetters.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointment Letters</h3>
          <p className="text-gray-500">You don't have any appointment letters yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointmentLetters.map((letter:any) => (
            <div 
              key={letter.id} 
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Appointment Letter #{letter.id.slice(-6)}
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="text-sm">Sender ID: <strong>{letter.senderId}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(letter.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-gray-700 mb-2">
                      <strong>File:</strong> {extractFileName(letter.pdf)}
                    </p>
                    <a 
                      href={letter.pdf} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      Preview PDF
                    </a>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleDownload(letter.pdf, extractFileName(letter.pdf))}
                    disabled={downloading}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
                  >
                    {downloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {appointmentLetters.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-700">
            <strong>Total Letters:</strong> {appointmentLetters.length} appointment letter(s) found
          </p>
        </div>
      )}
    </div>
  );
};

export default ConfirmationLettersManagement;