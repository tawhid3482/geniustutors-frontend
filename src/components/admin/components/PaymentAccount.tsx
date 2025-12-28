import { 
  useCreatePaymentAccountMutation, 
  useDeletePaymentAccountMutation, 
  useGetAllPaymentAccountQuery, 
  useUpdatePaymentAccountMutation 
} from '@/redux/features/PaymentAccount/PaymentAccountApi';
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  CreditCard,
  Smartphone,
  Globe,
  Loader2,
  AlertCircle,
  Banknote
} from 'lucide-react';

// Type Definitions
interface PaymentAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  createdAt: string;
  updatedAt: string;
}



interface CreatePaymentAccountRequest {
  accountName: string;
  accountNumber: string;
}

interface UpdatePaymentAccountRequest {
  id: string;
  data: {
    accountName: string;
    accountNumber: string;
  };
}

interface AccountFormData {
  id: string;
  accountName: string;
  accountNumber: string;
}

interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const PaymentAccount: React.FC = () => {
  // API Hooks with TypeScript
  const { 
    data: PaymentAccountData, 
    isLoading,
   isError,
    refetch 
  } = useGetAllPaymentAccountQuery(undefined);
  
  const [createPaymentAccount] = useCreatePaymentAccountMutation();
  const [updatePaymentAccount] = useUpdatePaymentAccountMutation();
  const [deletePaymentAccount] = useDeletePaymentAccountMutation();
  
  // State management
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentAccount, setCurrentAccount] = useState<AccountFormData>({
    id: '',
    accountName: '',
    accountNumber: ''
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification>({
    show: false,
    message: '',
    type: 'success'
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Update accounts when data changes
  useEffect(() => {
    if (PaymentAccountData?.data) {
      setAccounts(PaymentAccountData.data);
    }
  }, [PaymentAccountData]);

  // Reset form
  const resetForm = (): void => {
    setCurrentAccount({
      id: '',
      accountName: '',
      accountNumber: ''
    });
    setIsEditing(false);
    setIsSubmitting(false);
  };

  // Open modal for creating new account
  const handleCreateClick = (): void => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing account
  const handleEditClick = (account: PaymentAccount): void => {
    setCurrentAccount({
      id: account.id,
      accountName: account.accountName,
      accountNumber: account.accountNumber
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setCurrentAccount(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!currentAccount.accountName.trim() || !currentAccount.accountNumber.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        // Update existing account
        const updateData: UpdatePaymentAccountRequest = {
          id: currentAccount.id,
          data: {
            accountName: currentAccount.accountName.trim(),
            accountNumber: currentAccount.accountNumber.trim()
          }
        };
        
        await updatePaymentAccount(updateData).unwrap();
        showNotification('Account updated successfully', 'success');
      } else {
        // Create new account
        const createData: CreatePaymentAccountRequest = {
          accountName: currentAccount.accountName.trim(),
          accountNumber: currentAccount.accountNumber.trim()
        };
        
        await createPaymentAccount(createData).unwrap();
        showNotification('Account created successfully', 'success');
      }
      
      // Close modal and refresh data
      setIsModalOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      showNotification(
        error?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} account`,
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete account
  const handleDeleteClick = async (id: string): Promise<void> => {
    if (deleteConfirmId === id) {
      try {
        await deletePaymentAccount(id).unwrap();
        showNotification('Account deleted successfully', 'success');
        setDeleteConfirmId(null);
        refetch();
      } catch (error: any) {
        showNotification(error?.data?.message || 'Failed to delete account', 'error');
      }
    } else {
      setDeleteConfirmId(id);
    }
  };

  // Cancel delete confirmation
  const cancelDelete = (): void => {
    setDeleteConfirmId(null);
  };

  // Show notification
  const showNotification = (message: string, type: Notification['type']): void => {
    setNotification({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Get icon for account type
  const getAccountIcon = (accountName: string): JSX.Element => {
    const name = accountName.toLowerCase();
    if (name.includes('bkash')) return <Smartphone className="h-5 w-5 text-pink-600" />;
    if (name.includes('nogod')) return <Globe className="h-5 w-5 text-green-600" />;
    if (name.includes('rocket')) return <CreditCard className="h-5 w-5 text-purple-600" />;
    if (name.includes('bank')) return <Banknote className="h-5 w-5 text-blue-600" />;
    return <CreditCard className="h-5 w-5 text-gray-600" />;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle modal close
  const handleModalClose = (): void => {
    setIsModalOpen(false);
    resetForm();
  };

  // Render account row
  const renderAccountRow = (account: PaymentAccount): JSX.Element => (
    <tr key={account.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {getAccountIcon(account.accountName)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {account.accountName}
            </div>
            <div className="text-sm text-gray-500">
              ID: {account.id.substring(account.id.length - 8)}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-mono">
          {account.accountNumber}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(account.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {deleteConfirmId === account.id ? (
          <div className="flex items-center space-x-2">
            <span className="text-red-600 text-sm">Confirm delete?</span>
            <button
              onClick={() => handleDeleteClick(account.id)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={cancelDelete}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleEditClick(account)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </button>
            <button
              onClick={() => handleDeleteClick(account.id)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slideIn ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : notification.type === 'error'
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Payment Accounts</h1>
        </div>
        <p className="text-gray-600 ml-11">Manage your payment accounts for transactions</p>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-transform hover:scale-[1.02]">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-800">{accounts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">All Payment Accounts</h2>
            <p className="text-gray-500 text-sm mt-1">Click on an account to view details</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-blue-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Account
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center">
            <div className="inline-flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Loading accounts</h3>
              <p className="text-gray-500">Please wait while we fetch your payment accounts</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-12 text-center">
            <div className="inline-flex flex-col items-center justify-center max-w-md">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Failed to load accounts</h3>
              <p className="text-gray-600 mb-6">There was an error loading your payment accounts. Please try again.</p>
              <button
                onClick={() => refetch()}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Accounts List */}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <CreditCard className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payment accounts found</h3>
                        <p className="text-gray-500 mb-6 max-w-md">
                          You haven't added any payment accounts yet. Add your first account to get started.
                        </p>
                        <button
                          onClick={handleCreateClick}
                          className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Create Your First Account
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  accounts.map(renderAccountRow)
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scaleIn">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  {isEditing ? (
                    <Edit2 className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Plus className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {isEditing ? 'Edit Payment Account' : 'Create New Account'}
                </h3>
              </div>
              <button
                onClick={handleModalClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="accountName"
                    name="accountName"
                    value={currentAccount.accountName}
                    onChange={handleInputChange}
                    placeholder="e.g., Bkash, Nogod, Bank Account"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={isSubmitting}
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">Enter a descriptive name for this account</p>
                </div>
                
                <div>
                  <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={currentAccount.accountNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 01712345678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={isSubmitting}
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">Enter the phone number or account number</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isEditing ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentAccount;