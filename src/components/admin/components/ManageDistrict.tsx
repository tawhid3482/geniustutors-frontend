import { useState, useEffect } from "react";
import {
  useCreateDistrictsMutation,
  useDeleteDistrictsMutation,
  useGetAllDistrictsQuery,
  useUpdateDistrictsMutation,
} from "@/redux/features/district/districtApi";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
  ChevronDown,
  MapPin,
  Building2,
  Users,
  Save,
  Edit3,
} from "lucide-react";

// Define District type
interface District {
  id: string;
  name: string;
  thana: string[];
  area: string[];
  color: string;
  createdAt: string;
}

const ManageDistrict = () => {
  const {
    data: districtResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAllDistrictsQuery(undefined);
  const districts: District[] = districtResponse?.data || [];

  const [createDistrict] = useCreateDistrictsMutation();
  const [updateDistrict] = useUpdateDistrictsMutation();
  const [deleteDistrict] = useDeleteDistrictsMutation();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(
    new Set()
  );

  // New district form
  const [newDistrict, setNewDistrict] = useState({
    name: "",
    thana: [""],
    area: [""],
    color: "from-blue-100 to-blue-200",
  });

  // Edit form state
  const [editDistrict, setEditDistrict] = useState<District | null>(null);
  const [editThanaList, setEditThanaList] = useState<string[]>([]);
  const [editAreaList, setEditAreaList] = useState<string[]>([]);

  // Color options
  const colorOptions = [
    {
      value: "from-blue-100 to-blue-200",
      label: "Blue Gradient",
      bg: "bg-gradient-to-r from-blue-100 to-blue-200",
    },
    {
      value: "from-green-100 to-green-200",
      label: "Green Gradient",
      bg: "bg-gradient-to-r from-green-100 to-green-200",
    },
    {
      value: "from-red-100 to-red-200",
      label: "Red Gradient",
      bg: "bg-gradient-to-r from-red-100 to-red-200",
    },
    {
      value: "from-purple-100 to-purple-200",
      label: "Purple Gradient",
      bg: "bg-gradient-to-r from-purple-100 to-purple-200",
    },
    {
      value: "from-yellow-100 to-yellow-200",
      label: "Yellow Gradient",
      bg: "bg-gradient-to-r from-yellow-100 to-yellow-200",
    },
    {
      value: "from-pink-100 to-pink-200",
      label: "Pink Gradient",
      bg: "bg-gradient-to-r from-pink-100 to-pink-200",
    },
    {
      value: "from-indigo-100 to-indigo-200",
      label: "Indigo Gradient",
      bg: "bg-gradient-to-r from-indigo-100 to-indigo-200",
    },
    {
      value: "from-teal-100 to-teal-200",
      label: "Teal Gradient",
      bg: "bg-gradient-to-r from-teal-100 to-teal-200",
    },
  ];

  // Filter districts
  const filteredDistricts = districts.filter(
    (district) =>
      district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      district.thana.some((t) =>
        t.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      district.area.some((a) =>
        a.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Expand/collapse details
  const toggleDistrictExpansion = (districtId: string) => {
    const newExpanded = new Set(expandedDistricts);
    if (newExpanded.has(districtId)) {
      newExpanded.delete(districtId);
    } else {
      newExpanded.add(districtId);
    }
    setExpandedDistricts(newExpanded);
  };

  // Add new thana in add form
  const addNewThana = () => {
    setNewDistrict({
      ...newDistrict,
      thana: [...newDistrict.thana, ""],
    });
  };

  // Add new area in add form
  const addNewArea = () => {
    setNewDistrict({
      ...newDistrict,
      area: [...newDistrict.area, ""],
    });
  };

  // Add new thana in edit form
  const addEditThana = () => {
    setEditThanaList([...editThanaList, ""]);
  };

  // Add new area in edit form
  const addEditArea = () => {
    setEditAreaList([...editAreaList, ""]);
  };

  // Handle input changes in add form
  const handleThanaChange = (index: number, value: string) => {
    const updatedThana = [...newDistrict.thana];
    updatedThana[index] = value;
    setNewDistrict({ ...newDistrict, thana: updatedThana });
  };

  const handleAreaChange = (index: number, value: string) => {
    const updatedArea = [...newDistrict.area];
    updatedArea[index] = value;
    setNewDistrict({ ...newDistrict, area: updatedArea });
  };

  // Handle input changes in edit form
  const handleEditThanaChange = (index: number, value: string) => {
    const updatedThana = [...editThanaList];
    updatedThana[index] = value;
    setEditThanaList(updatedThana);
  };

  const handleEditAreaChange = (index: number, value: string) => {
    const updatedArea = [...editAreaList];
    updatedArea[index] = value;
    setEditAreaList(updatedArea);
  };

  // Remove fields in add form
  const removeThana = (index: number) => {
    const updatedThana = newDistrict.thana.filter((_, i) => i !== index);
    setNewDistrict({ ...newDistrict, thana: updatedThana });
  };

  const removeArea = (index: number) => {
    const updatedArea = newDistrict.area.filter((_, i) => i !== index);
    setNewDistrict({ ...newDistrict, area: updatedArea });
  };

  // Remove fields in edit form
  const removeEditThana = (index: number) => {
    const updatedThana = editThanaList.filter((_, i) => i !== index);
    setEditThanaList(updatedThana);
  };

  const removeEditArea = (index: number) => {
    const updatedArea = editAreaList.filter((_, i) => i !== index);
    setEditAreaList(updatedArea);
  };

  // Submit new district
  const handleSubmitNewDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDistrict({
        ...newDistrict,
        thana: newDistrict.thana.filter((t) => t.trim() !== ""),
        area: newDistrict.area.filter((a) => a.trim() !== ""),
      }).unwrap();

      // Reset form and close modal
      setNewDistrict({
        name: "",
        thana: [""],
        area: [""],
        color: "from-blue-100 to-blue-200",
      });
      setIsAddModalOpen(false);
      refetch(); // Refresh the data
    } catch (error) {
      console.error("Failed to create district:", error);
    }
  };

  // Open edit modal
  const handleEditClick = (district: District) => {
    setEditDistrict(district);
    setEditThanaList([...district.thana]);
    setEditAreaList([...district.area]);
    setIsEditModalOpen(true);
  };

  // Submit edit
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDistrict) return;

    try {
      // শুধুমাত্র update-able fields পাঠাও
      const dataToUpdate = {
        name: editDistrict.name,
        thana: editThanaList.filter((t) => t.trim() !== ""),
        area: editAreaList.filter((a) => a.trim() !== ""),
        color: editDistrict.color,
      };

      await updateDistrict({
        id: editDistrict.id, // where clause
        data: dataToUpdate, // only update-able fields
      }).unwrap();

      setIsEditModalOpen(false);
      setEditDistrict(null);
      setEditThanaList([]);
      setEditAreaList([]);
      refetch(); // Refresh the data
    } catch (error) {
      console.error("Failed to update district:", error);
    }
  };

  // Delete district
  const handleDeleteDistrict = async () => {
    if (!selectedDistrict) return;

    try {
      await deleteDistrict(selectedDistrict.id).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedDistrict(null);
      refetch(); // Refresh the data
    } catch (error) {
      console.error("Failed to delete district:", error);
    }
  };

  // Statistics
  const stats = {
    totalDistricts: districts.length,
    totalThanas: districts.reduce(
      (acc, district) => acc + district.thana.length,
      0
    ),
    totalAreas: districts.reduce(
      (acc, district) => acc + district.area.length,
      0
    ),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-700">
            Error Loading Data
          </h3>
          <p className="text-gray-500 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header and Statistics */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          District Management
        </h1>
        <p className="text-gray-600">
          Manage all districts, thanas, and area information
        </p>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg mr-4">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Districts</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalDistricts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg mr-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Thanas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalThanas}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-lg mr-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Areas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalAreas}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search districts, thanas, or areas..."
              className="w-full pl-10 pr-4 py-2 border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add District
            </button>
          </div>
        </div>
      </div>

      {/* District List */}
      <div className=" grid grid-cols-2 gap-5 items-center ">
        {filteredDistricts.map((district) => (
          <div
            key={district.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg"
          >
            {/* District Header */}
            <div
              className={`p-6 bg-gradient-to-r ${district.color} border-b border-gray-200`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/80 rounded-lg">
                      <Building2 className="w-5 h-5 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {district.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {district.thana.length} Thanas
                    </span>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {district.area.length} Areas
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(district)}
                    className="flex items-center gap-1 px-3 py-2 bg-white/80 rounded-lg hover:bg-white transition-colors duration-200 text-gray-700 hover:text-blue-600 text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDistrict(district);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 bg-white/80 rounded-lg hover:bg-white transition-colors duration-200 text-gray-700 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleDistrictExpansion(district.id)}
                    className="p-2 bg-white/80 rounded-lg hover:bg-white transition-colors duration-200 text-gray-700"
                  >
                    <ChevronDown
                      className={`w-5 h-5 transform transition-transform duration-200 ${
                        expandedDistricts.has(district.id) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedDistricts.has(district.id) && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Thana List */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-700">
                        Thanas ({district.thana.length})
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {district.thana.map((thana, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                        >
                          {thana}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Area List */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-gray-700">
                        Areas ({district.area.length})
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {district.area.map((area, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add District Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Add New District
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitNewDistrict}>
              <div className="p-6 space-y-6">
                {/* District Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={newDistrict.name}
                    onChange={(e) =>
                      setNewDistrict({ ...newDistrict, name: e.target.value })
                    }
                    placeholder="Enter district name"
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Color Theme
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          setNewDistrict({ ...newDistrict, color: color.value })
                        }
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          newDistrict.color === color.value
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-full h-8 rounded ${color.bg}`}></div>
                        <p className="text-xs mt-2 text-gray-600">
                          {color.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thana List */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Thana List
                    </label>
                    <button
                      type="button"
                      onClick={addNewThana}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Thana
                    </button>
                  </div>
                  <div className="space-y-3">
                    {newDistrict.thana.map((thana, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          value={thana}
                          onChange={(e) =>
                            handleThanaChange(index, e.target.value)
                          }
                          placeholder={`Thana ${index + 1}`}
                        />
                        {newDistrict.thana.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeThana(index)}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Area List */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Area List
                    </label>
                    <button
                      type="button"
                      onClick={addNewArea}
                      className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Area
                    </button>
                  </div>
                  <div className="space-y-3">
                    {newDistrict.area.map((area, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          value={area}
                          onChange={(e) =>
                            handleAreaChange(index, e.target.value)
                          }
                          placeholder={`Area ${index + 1}`}
                        />
                        {newDistrict.area.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArea(index)}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    Create District
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit District Modal */}
      {isEditModalOpen && editDistrict && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl  max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Edit District: {editDistrict.name}
                </h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditDistrict(null);
                    setEditThanaList([]);
                    setEditAreaList([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitEdit}>
              <div className="p-6 space-y-6">
                {/* District Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={editDistrict.name}
                    onChange={(e) =>
                      setEditDistrict({ ...editDistrict, name: e.target.value })
                    }
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Color Theme
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          setEditDistrict({
                            ...editDistrict,
                            color: color.value,
                          })
                        }
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          editDistrict.color === color.value
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-full h-8 rounded ${color.bg}`}></div>
                        <p className="text-xs mt-2 text-gray-600">
                          {color.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thana List */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Thana List ({editThanaList.length})
                    </label>
                    <button
                      type="button"
                      onClick={addEditThana}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Thana
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editThanaList.map((thana, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          value={thana}
                          onChange={(e) =>
                            handleEditThanaChange(index, e.target.value)
                          }
                          placeholder={`Thana ${index + 1}`}
                        />
                        {editThanaList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEditThana(index)}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Area List */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Area List ({editAreaList.length})
                    </label>
                    <button
                      type="button"
                      onClick={addEditArea}
                      className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Area
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editAreaList.map((area, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          value={area}
                          onChange={(e) =>
                            handleEditAreaChange(index, e.target.value)
                          }
                          placeholder={`Area ${index + 1}`}
                        />
                        {editAreaList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEditArea(index)}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditDistrict(null);
                      setEditThanaList([]);
                      setEditAreaList([]);
                    }}
                    className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedDistrict && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl ">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Delete District</h3>
              </div>
              <p className="text-gray-600">
                Are you sure you want to delete the district "
                {selectedDistrict.name}"? This action cannot be undone.
              </p>
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">
                  <strong>Warning:</strong> This will delete all associated
                  thanas and areas.
                </p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedDistrict(null);
                  }}
                  className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDistrict}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md"
                >
                  Delete District
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDistricts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Districts Found
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Try a different search term"
              : "Start by adding your first district"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageDistrict;
