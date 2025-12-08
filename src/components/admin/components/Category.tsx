// Category.tsx
"use client";
import React, { useState } from "react";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAllCategoryQuery,
  useUpdateCategoryMutation,
} from "@/redux/features/category/categoryApi";
import { toast } from "react-hot-toast";

interface CategoryFormData {
  name: string;
  color: string;
  icon: string;
  iconUrl: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  iconUrl: string;
  createdAt: string;
  tuitions?: number;
}

interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Category[];
}

const Category = () => {
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useGetAllCategoryQuery(undefined);

  const categories = apiResponse?.data || [];

  const [createCategory] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    color: "",
    icon: "",
    iconUrl: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateCategory({
          id: editingId,
          data: formData,
        }).unwrap();
        toast.success("Category updated successfully!");
        setEditingId(null);
      } else {
        await createCategory(formData).unwrap();
        toast.success("Category created successfully!");
      }

      setFormData({
        name: "",
        color: "#3b82f6",
        icon: "fa-solid fa-laptop-code",
        iconUrl: "",
      });
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Operation failed!");
      console.error(error);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      color: category.color || "#3b82f6",
      icon: category.icon || "fa-solid fa-laptop-code",
      iconUrl: category.iconUrl || "",
    });
    setEditingId(category.id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setCategoryToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id).unwrap();
      toast.success("Category deleted successfully!");
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Delete failed!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Error loading categories</span>
          </div>
          <p className="mt-2 text-sm">
            Please try again later or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Categories
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2">
            Manage your education categories
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: "",
              color: "#3b82f6",
              icon: "fa-solid fa-laptop-code",
              iconUrl: "",
            });
            setIsModalOpen(true);
          }}
          className="bg-[#16A34A] hover:bg-[#13823c] text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Categories</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                {categories.length}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-[#16A34A]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Tuitions</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                {categories.reduce(
                  (acc: number, cat: Category) => acc + (cat.tuitions || 0),
                  0
                )}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Recently Added</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                {categories.slice(-3).length}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                {categories.length}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((category: Category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
          >
            <div
              className="h-2 w-full"
              style={{ backgroundColor: category.color || "#4A90E2" }}
            />
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${category.color || "#4A90E2"}20`,
                    }}
                  >
                    {category.iconUrl ? (
                      <img
                        src={category.iconUrl}
                        alt={category.name}
                        className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.parentElement!.innerHTML = `<span class="text-lg">${
                            category.icon || "📚"
                          }</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-lg sm:text-xl">
                        {category.icon || "📚"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                      {category.name}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      Tuitions: {category.tuitions || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-6">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-3 sm:px-4 rounded-lg transition duration-200 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(category.id, category.name)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 sm:px-4 rounded-lg transition duration-200 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 text-gray-300">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
            No categories yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm sm:text-base">
            Create your first category to organize your education content
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#16A34A] hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm sm:text-base"
          >
            Create Category
          </button>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md my-8">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {editingId ? "Edit Category" : "Create New Category"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                  type="button"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16A34A] focus:border-[#16A34A] outline-none transition text-sm sm:text-base"
                      placeholder="e.g., IELTS Preparation, Primary Education"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <input
                        type="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-12 h-12 cursor-pointer rounded-lg border border-gray-300 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.color}
                          onChange={handleInputChange}
                          name="color"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
                          placeholder="#3b82f6"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter hex color code or use the color picker
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon Name *
                    </label>
                    <input
                      type="text"
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16A34A] focus:border-[#16A34A] outline-none transition text-sm sm:text-base"
                      placeholder="e.g., fa-solid fa-laptop-code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon URL (Optional)
                    </label>
                    <input
                      type="url"
                      name="iconUrl"
                      value={formData.iconUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16A34A] focus:border-[#16A34A] outline-none transition text-sm sm:text-base"
                      placeholder="https://example.com/icon.png"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Paste a direct image URL. Recommended: 64x64px PNG with
                      transparent background
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-[#16A34A] hover:bg-blue-700 text-white font-medium rounded-lg shadow transition text-sm sm:text-base"
                  >
                    {editingId ? "Update Category" : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className=" fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-2xl my-8">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Delete Category
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">
                      "{categoryToDelete?.name}"
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow transition"
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

export default Category;
