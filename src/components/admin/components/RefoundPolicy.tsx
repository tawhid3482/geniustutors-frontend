import { 
  useCreateRefundPolicyMutation, 
  useDeleteRefundPolicyMutation, 
  useGetAllRefundPolicyQuery, 
  useUpdateRefundPolicyMutation 
} from '@/redux/features/RefundPolicy/RefundPolicyApi';
import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Save,
  X
} from 'lucide-react';

interface RefundPolicy {
  id: string;
  title: string;
  description: string;
  conditions: string[];
  processing_time: string;
  createdAt: string;
  updatedAt: string;
}

interface PolicyFormData {
  title: string;
  description: string;
  conditions: string[];
  processing_time: string;
}

const RefundPolicyManager = () => {
  const { data: policyData, isLoading, error } = useGetAllRefundPolicyQuery(undefined);
  const [createRefundPolicy] = useCreateRefundPolicyMutation();
  const [updateRefundPolicy] = useUpdateRefundPolicyMutation();
  const [deleteRefundPolicy] = useDeleteRefundPolicyMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<RefundPolicy | null>(null);
  const [newCondition, setNewCondition] = useState('');
  const [formData, setFormData] = useState<PolicyFormData>({
    title: '',
    description: '',
    conditions: [],
    processing_time: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setEditingPolicy(null);
    setFormData({
      title: '',
      description: '',
      conditions: [],
      processing_time: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (policy: RefundPolicy) => {
    setIsEditMode(true);
    setEditingPolicy(policy);
    setFormData({
      title: policy.title,
      description: policy.description,
      conditions: [...policy.conditions],
      processing_time: policy.processing_time
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPolicy(null);
    setNewCondition('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        conditions: [...prev.conditions, newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode && editingPolicy) {
        await updateRefundPolicy({
          id: editingPolicy.id,
          data: formData
        }).unwrap();
      } else {
        await createRefundPolicy(formData).unwrap();
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving policy:', error);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    try {
      await deleteRefundPolicy(id).unwrap();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center justify-center text-red-600 mb-4">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 text-center mb-2">
            Error Loading Policies
          </h3>
          <p className="text-red-600 text-center">
            Failed to load refund policies. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const policies: RefundPolicy[] = policyData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Refund Policy Management</h1>
          <p className="text-gray-600 mt-2">Manage and configure refund policies for your platform</p>
        </div>

        {/* Create Policy Button */}
        <div className="mb-6">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Policy
          </button>
        </div>

        {/* Policies Grid */}
        {policies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Refund Policies Found
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first refund policy.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Policy
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Policy Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{policy.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(policy)}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                        title="Edit Policy"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(policy.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete Policy"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Policy Description */}
                  <p className="text-gray-600 mb-4">{policy.description}</p>

                  {/* Conditions */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Conditions:</h4>
                    <ul className="space-y-2">
                      {policy.conditions.map((condition, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Processing Time */}
                  <div className="flex items-center text-gray-700 mb-4">
                    <Clock className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="font-medium">Processing Time:</span>
                    <span className="ml-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {policy.processing_time}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Created:</span>
                        <span className="ml-2">{formatDate(policy.createdAt)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span>
                        <span className="ml-2">{formatDate(policy.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {policies.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">{policies.length}</div>
                <div className="text-blue-600">Total Policies</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">
                  {policies.filter(p => p.title.includes('Premium')).length}
                </div>
                <div className="text-green-600">Premium Policies</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-700">
                  {policies.filter(p => p.title.includes('Standard')).length}
                </div>
                <div className="text-purple-600">Standard Policies</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Refund Policy' : 'Create New Refund Policy'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Policy Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Standard Refund Policy"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Describe the refund policy..."
                    />
                  </div>

                  {/* Conditions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conditions
                    </label>
                    <div className="space-y-2 mb-4">
                      {formData.conditions.map((condition, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg"
                        >
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>{condition}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCondition(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        placeholder="Add a new condition..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleAddCondition}
                        className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Processing Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Processing Time
                    </label>
                    <input
                      type="text"
                      name="processing_time"
                      value={formData.processing_time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., 3–5 working days"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {isEditMode ? 'Update Policy' : 'Create Policy'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center text-red-600 mb-4">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Refund Policy
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this refund policy? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePolicy(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundPolicyManager;