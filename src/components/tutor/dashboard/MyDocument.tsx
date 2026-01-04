import { useAuth } from '@/contexts/AuthContext.next';
import { 
  useDeleteDocumentMutation, 
  useGetAllDocumentUserQuery 
} from '@/redux/features/document/documentApi';
import React, { useState } from 'react';
import { 
  FaFilePdf, 
  FaFileImage, 
  FaTrash, 
  FaDownload,
  FaEye,
  FaSpinner,
  FaTimes
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface DocumentType {
  id: string;
  userId: string;
  type: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: DocumentType[];
}

const MyDocument = () => {
  const { user } = useAuth();
  const { 
    data: apiResponse, 
    isLoading, 
    isError, 
    refetch 
  } = useGetAllDocumentUserQuery(user?.id || '') as {
    data: ApiResponse;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
  

    try {
      setDeletingId(id);
      const response = await deleteDocument(id).unwrap();
      
      if (response.success) {
        toast.success('Document deleted successfully');
        refetch();
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error deleting document');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreview = (doc: DocumentType) => {
    setSelectedDocument(doc);
    setShowPreview(true);
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FaFilePdf className="text-red-500 text-xl" />;
    }
    if (fileType.includes('image')) {
      return <FaFileImage className="text-green-500 text-xl" />;
    }
    return <FaFilePdf className="text-gray-500 text-xl" />;
  };

  const formatDocumentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading documents</p>
        <button 
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const documents = apiResponse?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Documents</h1>
        <p className="text-gray-600 mt-2">
          {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaFilePdf className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">No documents found</h3>
          <p className="text-gray-500 mt-2">Upload your documents to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {getFileIcon(doc.file_type)}
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full">
                    {formatDocumentType(doc.type)}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Uploaded</p>
                  <p className="text-gray-700 font-medium">
                    {formatDate(doc.uploaded_at)}
                  </p>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => handlePreview(doc)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                    title="Preview"
                  >
                    <FaEye className="mr-2" />
                    Preview
                  </button>
                  
                  <button
                    onClick={() => handleDownload(doc.file_url, `${doc.type}_${doc.id}`)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors duration-200"
                    title="Download"
                  >
                    <FaDownload className="mr-2" />
                    Download
                  </button>
                  
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={isDeleting && deletingId === doc.id}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    {isDeleting && deletingId === doc.id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaTrash />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {formatDocumentType(selectedDocument.type)}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="p-4 h-[70vh] overflow-auto">
              {selectedDocument.file_type.includes('image') ? (
                <img
                  src={selectedDocument.file_url}
                  alt="Document preview"
                  className="max-w-full h-auto mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                  }}
                />
              ) : selectedDocument.file_type.includes('pdf') ? (
                <iframe
                  src={selectedDocument.file_url}
                  className="w-full h-full min-h-[60vh]"
                  title="Document preview"
                />
              ) : (
                <div className="text-center py-12">
                  <FaFilePdf className="mx-auto text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-600">Preview not available for this file type</p>
                  <a
                    href={selectedDocument.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Open in new tab
                  </a>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    Uploaded: {formatDate(selectedDocument.uploaded_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(selectedDocument.file_url, `${selectedDocument.type}_${selectedDocument.id}`)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDocument;