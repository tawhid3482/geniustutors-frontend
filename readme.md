 {/* ✅ FIXED: Create New Job Modal - 3 Step Location Selection with Multiple Area */}
      <Dialog open={showCreateModal} onOpenChange={handleCloseCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Tuition Request</DialogTitle>
            <DialogDescription>
              Create a new tuition request for students
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-phoneNumber">Phone Number *</Label>
                  <Input
                    id="create-phoneNumber"
                    value={createFormData.phoneNumber}
                    onChange={(e) =>
                      handleCreateFormChange("phoneNumber", e.target.value)
                    }
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-studentGender">Student Gender *</Label>
                  <Select
                    value={createFormData.studentGender}
                    onValueChange={(value) =>
                      handleCreateFormChange("studentGender", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ✅ FIXED: Location Information Section - 3 Step Process with Multiple Area Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-district">District *</Label>
                  {isDistrictLoading ? (
                    <Input placeholder="Loading districts..." disabled />
                  ) : (
                    <Select
                      value={createFormData.district}
                      onValueChange={(value) => handleCreateDistrictChange(value)}
                      disabled={isDistrictLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isDistrictLoading ? "Loading..." : "Select district"} />
                      </SelectTrigger>
                      <SelectContent>
                        {districtOptions.map((district: any) => (
                          <SelectItem key={district.value} value={district.value}>
                            {district.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-thana">Thana/Upazila *</Label>
                  {!createFormData.district ? (
                    <Input placeholder="Please select district first" disabled />
                  ) : availableThanasForCreate.length > 0 ? (
                    <Select
                      value={createFormData.thana}
                      onValueChange={(value) => handleCreateThanaChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select thana/upazila" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableThanasForCreate.map((thana) => (
                          <SelectItem key={thana} value={thana}>
                            {thana}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="create-thana"
                      value={createFormData.thana}
                      onChange={(e) =>
                        handleCreateFormChange("thana", e.target.value)
                      }
                      placeholder="Enter thana/upazila"
                      required
                    />
                  )}
                </div>

                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="create-area">Area *</Label>
                  {!createFormData.thana ? (
                    <Input placeholder="Please select thana first" disabled />
                  ) : availableAreasForCreate.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {availableAreasForCreate.map((area) => (
                          <div
                            key={area}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer border ${
                              selectedAreasForCreate.includes(area)
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-gray-100 text-gray-800 border-gray-300"
                            }`}
                            onClick={() => handleCreateAreaSelection(area)}
                          >
                            <span>{area}</span>
                            {selectedAreasForCreate.includes(area) && (
                              <span className="text-xs">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {selectedAreasForCreate.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Selected Areas:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedAreasForCreate.map((area) => (
                              <div
                                key={area}
                                className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-sm"
                              >
                                <span>{area}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCreateAreaSelection(area)}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Input
                      id="create-area"
                      value={createFormData.area}
                      onChange={(e) =>
                        handleCreateFormChange("area", e.target.value)
                      }
                      placeholder="Enter area"
                      required
                    />
                  )}
                </div>

                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="create-detailedLocation">
                    Detailed Location (Optional)
                  </Label>
                  <Input
                    id="create-detailedLocation"
                    value={createFormData.detailedLocation}
                    onChange={(e) =>
                      handleCreateFormChange("detailedLocation", e.target.value)
                    }
                    placeholder="Enter detailed location"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Medium Selection - using imported mediumOptions */}
                <div className="space-y-2">
                  <Label htmlFor="create-medium">Medium *</Label>
                  <Select
                    value={createFormData.medium}
                    onValueChange={(value) =>
                      handleCreateFormChange("medium", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select medium" />
                    </SelectTrigger>
                    <SelectContent>
                      {mediumOptions.mediums.map((medium) => (
                        <SelectItem key={medium.value} value={medium.value}>
                          {medium.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tutoring Type */}
                <div className="space-y-2">
                  <Label htmlFor="create-tutoringType">Tutoring Type *</Label>
                  <Select
                    value={createFormData.tutoringType}
                    onValueChange={(value) =>
                      handleCreateFormChange("tutoringType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tutoring type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home Tutoring">
                        Home Tutoring
                      </SelectItem>
                      <SelectItem value="Online Tutoring">
                        Online Tutoring
                      </SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Category, Subjects, and Classes Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Category, Subjects & Classes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label htmlFor="create-category">Category *</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (
                        value &&
                        !createFormData.selectedCategories.includes(value)
                      ) {
                        handleCreateCategorySelection(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {createFormData.selectedCategories.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium">Selected Categories:</p>
                      {createFormData.selectedCategories.map(
                        (category, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm"
                          >
                            <span>{category}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCreateCategorySelection(category)
                              }
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Subject Selection - using imported SUBJECT_OPTIONS */}
                <div className="space-y-2">
                  <Label htmlFor="create-subjects">Subjects *</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (
                        value &&
                        !createFormData.selectedSubjects.includes(value)
                      ) {
                        handleCreateSubjectSelection(value);
                      }
                    }}
                    disabled={!createFormData.selectedCategories.length}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECT_OPTIONS.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {createFormData.selectedSubjects.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium">Selected Subjects:</p>
                      {createFormData.selectedSubjects.map((subject, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm"
                          >
                            <span>{subject}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCreateSubjectSelection(subject)
                              }
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Class Level Selection - using imported CLASS_LEVELS */}
                <div className="space-y-2">
                  <Label htmlFor="create-classes">Class Levels *</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (
                        value &&
                        !createFormData.selectedClasses.includes(value)
                      ) {
                        handleCreateClassSelection(value);
                      }
                    }}
                    disabled={!createFormData.selectedCategories.length}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class levels" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_LEVELS.map((classLevel) => (
                        <SelectItem key={classLevel} value={classLevel}>
                          {classLevel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {createFormData.selectedClasses.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium">Selected Classes:</p>
                      {createFormData.selectedClasses.map(
                        (className, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm"
                          >
                            <span>{className}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCreateClassSelection(className)
                              }
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Number of Students - Input field (no dropdown) */}
                <div className="space-y-2">
                  <Label htmlFor="create-numberOfStudents">
                    Number of Students *
                  </Label>
                  <Input
                    id="create-numberOfStudents"
                    type="number"
                    min="1"
                    value={createFormData.numberOfStudents}
                    onChange={(e) =>
                      handleCreateFormChange(
                        "numberOfStudents",
                        parseInt(e.target.value) || 1
                      )
                    }
                    placeholder="Enter number of students"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Tutoring Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tutoring Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-tutoringDuration">
                    Duration per Session *
                  </Label>
                  <Select
                    value={createFormData.tutoringDuration}
                    onValueChange={(value) =>
                      handleCreateFormChange("tutoringDuration", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                      <SelectItem value="2 hours">2 hours</SelectItem>
                      <SelectItem value="2.5 hours">2.5 hours</SelectItem>
                      <SelectItem value="3 hours">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-tutoringDays">Days per Week *</Label>
                  <Select
                    value={createFormData.tutoringDays.toString()}
                    onValueChange={(value) =>
                      handleCreateFormChange("tutoringDays", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="2">2 Days</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="4">4 Days</SelectItem>
                      <SelectItem value="5">5 Days</SelectItem>
                      <SelectItem value="6">6 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-tutoringTime">Preferred Time *</Label>
                  <Input
                    id="tutoringTime"
                    type="time"
                    value={createFormData.tutoringTime}
                    onChange={(e) =>
                      handleChange("tutoringTime", e.target.value)
                    }
                    className="w-full h-10 sm:h-11"
                  />
                  <p className="text-xs text-gray-500">Tutoring Time *</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-tutorGenderPreference">
                    Preferred Tutor Gender *
                  </Label>
                  <Select
                    value={createFormData.tutorGenderPreference}
                    onValueChange={(value) =>
                      handleCreateFormChange("tutorGenderPreference", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Salary Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Salary Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-salaryMin">Minimum Salary (৳) *</Label>
                  <Input
                    id="create-salaryMin"
                    type="number"
                    min="0"
                    value={createFormData.salaryRange.min}
                    onChange={(e) =>
                      handleCreateSalaryRangeChange(
                        "min",
                        parseInt(e.target.value)
                      )
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-salaryMax">Maximum Salary (৳) *</Label>
                  <Input
                    id="create-salaryMax"
                    type="number"
                    min="0"
                    value={createFormData.salaryRange.max}
                    onChange={(e) =>
                      handleCreateSalaryRangeChange(
                        "max",
                        parseInt(e.target.value)
                      )
                    }
                    required
                  />
                </div>

                <div className="space-y-2 flex items-center gap-2">
                  <Checkbox
                    id="create-isSalaryNegotiable"
                    checked={createFormData.isSalaryNegotiable}
                    onCheckedChange={(checked) =>
                      handleCreateFormChange("isSalaryNegotiable", checked)
                    }
                  />
                  <Label
                    htmlFor="create-isSalaryNegotiable"
                    className="cursor-pointer"
                  >
                    Salary is Negotiable
                  </Label>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div className="space-y-2">
                <Label htmlFor="create-extraInformation">
                  Extra Information (Optional)
                </Label>
                <Textarea
                  id="create-extraInformation"
                  value={createFormData.extraInformation}
                  onChange={(e) =>
                    handleCreateFormChange("extraInformation", e.target.value)
                  }
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-adminNote">Admin Notes (Optional)</Label>
                <Textarea
                  id="create-adminNote"
                  value={createFormData.adminNote}
                  onChange={(e) =>
                    handleCreateFormChange("adminNote", e.target.value)
                  }
                  placeholder="Internal admin notes..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreateModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequest} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ FIXED: Edit Request Modal - 3 Step Location Selection with Multiple Area */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tuition Request</DialogTitle>
            <DialogDescription>
              Update the details of the tuition request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-studentGender">Student Gender</Label>
                    <Select
                      value={editFormData.studentGender || ""}
                      onValueChange={(value) =>
                        handleEditFormChange("studentGender", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="any">Any</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                    <Input
                      id="edit-phoneNumber"
                      value={editFormData.phoneNumber || ""}
                      onChange={(e) =>
                        handleEditFormChange("phoneNumber", e.target.value)
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              {/* ✅ FIXED: Location Information - 3 Step Process with Multiple Area Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-district">District</Label>
                    {isDistrictLoading ? (
                      <Input value={editFormData.district || ""} disabled />
                    ) : (
                      <Select
                        value={editFormData.district || ""}
                        onValueChange={(value) => handleEditDistrictChange(value)}
                        disabled={isDistrictLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isDistrictLoading ? "Loading..." : "Select district"} />
                        </SelectTrigger>
                        <SelectContent>
                          {districtOptions.map((district: any) => (
                            <SelectItem
                              key={district.value}
                              value={district.value}
                            >
                              {district.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-thana">Thana/Upazila</Label>
                    {!editFormData.district ? (
                      <Input value={editFormData.thana || ""} disabled />
                    ) : availableThanasForEdit.length > 0 ? (
                      <Select
                        value={editFormData.thana || ""}
                        onValueChange={(value) => handleEditThanaChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select thana/upazila" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableThanasForEdit.map((thana) => (
                            <SelectItem key={thana} value={thana}>
                              {thana}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="edit-thana"
                        value={editFormData.thana || ""}
                        onChange={(e) =>
                          handleEditFormChange("thana", e.target.value)
                        }
                        placeholder="Enter thana/upazila"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="edit-area">Area</Label>
                    {!editFormData.thana ? (
                      <Input value={editFormData.area || ""} disabled />
                    ) : availableAreasForEdit.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {availableAreasForEdit.map((area) => (
                            <div
                              key={area}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer border ${
                                selectedAreasForEdit.includes(area)
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-gray-100 text-gray-800 border-gray-300"
                              }`}
                              onClick={() => handleEditAreaSelection(area)}
                            >
                              <span>{area}</span>
                              {selectedAreasForEdit.includes(area) && (
                                <span className="text-xs">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                        {selectedAreasForEdit.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Selected Areas:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedAreasForEdit.map((area) => (
                                <div
                                  key={area}
                                  className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-sm"
                                >
                                  <span>{area}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleEditAreaSelection(area)}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input
                        id="edit-area"
                        value={editFormData.area || ""}
                        onChange={(e) =>
                          handleEditFormChange("area", e.target.value)
                        }
                        placeholder="Enter area"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="edit-detailedLocation">
                      Detailed Location
                    </Label>
                    <Input
                      id="edit-detailedLocation"
                      value={editFormData.detailedLocation || ""}
                      onChange={(e) =>
                        handleEditFormChange("detailedLocation", e.target.value)
                      }
                      placeholder="Enter detailed location"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-medium">Medium</Label>
                    <Select
                      value={editFormData.medium || ""}
                      onValueChange={(value) =>
                        handleEditFormChange("medium", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select medium" />
                      </SelectTrigger>
                      <SelectContent>
                        {mediumOptions.mediums.map((medium) => (
                          <SelectItem key={medium.value} value={medium.value}>
                            {medium.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Subject Selection using imported SUBJECT_OPTIONS */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-subject">Subject</Label>
                    <Select
                      value={editFormData.subject || ""}
                      onValueChange={(value) =>
                        handleEditFormChange("subject", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Select subject</SelectItem>
                        {SUBJECT_OPTIONS.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Class Level Selection using imported CLASS_LEVELS */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-studentClass">Class Level</Label>
                    <Select
                      value={editFormData.studentClass || ""}
                      onValueChange={(value) =>
                        handleEditFormChange("studentClass", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Select class level</SelectItem>
                        {CLASS_LEVELS.map((classLevel) => (
                          <SelectItem key={classLevel} value={classLevel}>
                            {classLevel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-tutoringType">Tutoring Type</Label>
                    <Select
                      value={editFormData.tutoringType || ""}
                      onValueChange={(value) =>
                        handleEditFormChange("tutoringType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tutoring type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Home Tutoring">
                          Home Tutoring
                        </SelectItem>
                        <SelectItem value="Online Tutoring">
                          Online Tutoring
                        </SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Tutoring Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tutoring Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-numberOfStudents">
                      Number of Students
                    </Label>
                    <Input
                      id="edit-numberOfStudents"
                      type="number"
                      min="1"
                      value={editFormData.numberOfStudents || 1}
                      onChange={(e) =>
                        handleEditFormChange(
                          "numberOfStudents",
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tutoringDays">Days per Week</Label>
                    <Input
                      id="edit-tutoringDays"
                      type="number"
                      min="1"
                      max="7"
                      value={editFormData.tutoringDays || 1}
                      onChange={(e) =>
                        handleEditFormChange(
                          "tutoringDays",
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tutoringTime">Preferred Time</Label>
                    <Input
                      id="edit-tutoringTime"
                      value={editFormData.tutoringTime || ""}
                      onChange={(e) =>
                        handleEditFormChange("tutoringTime", e.target.value)
                      }
                      placeholder="e.g., 4:00 PM - 6:00 PM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tutoringDuration">
                      Duration per Session
                    </Label>
                    <Select
                      value={editFormData.tutoringDuration || ""}
                      onValueChange={(value) =>
                        handleEditFormChange("tutoringDuration", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30 minutes">30 minutes</SelectItem>
                        <SelectItem value="1 hour">1 hour</SelectItem>
                        <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                        <SelectItem value="2 hours">2 hours</SelectItem>
                        <SelectItem value="2.5 hours">2.5 hours</SelectItem>
                        <SelectItem value="3 hours">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Tutor Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tutor Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-tutorGenderPreference">
                      Preferred Tutor Gender
                    </Label>
                    <Select
                      value={editFormData.tutorGenderPreference || ""}
                      onValueChange={(value) =>
                        handleEditFormChange("tutorGenderPreference", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-salaryMin">Minimum Salary (৳)</Label>
                    <Input
                      id="edit-salaryMin"
                      type="number"
                      min="0"
                      value={editFormData.salaryRange?.min || 0}
                      onChange={(e) =>
                        handleEditSalaryRangeChange(
                          "min",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-salaryMax">Maximum Salary (৳)</Label>
                    <Input
                      id="edit-salaryMax"
                      type="number"
                      min="0"
                      value={editFormData.salaryRange?.max || 0}
                      onChange={(e) =>
                        handleEditSalaryRangeChange(
                          "max",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2 flex items-center gap-2 mt-6">
                    <Switch
                      id="edit-isSalaryNegotiable"
                      checked={editFormData.isSalaryNegotiable || false}
                      onCheckedChange={(checked) =>
                        handleEditFormChange("isSalaryNegotiable", checked)
                      }
                    />
                    <Label
                      htmlFor="edit-isSalaryNegotiable"
                      className="cursor-pointer"
                    >
                      Salary is Negotiable
                    </Label>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Additional Information
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="edit-extraInformation">
                    Extra Information
                  </Label>
                  <Textarea
                    id="edit-extraInformation"
                    value={editFormData.extraInformation || ""}
                    onChange={(e) =>
                      handleEditFormChange("extraInformation", e.target.value)
                    }
                    placeholder="Any additional information..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-adminNote">Admin Notes</Label>
                  <Textarea
                    id="edit-adminNote"
                    value={editFormData.adminNote || ""}
                    onChange={(e) =>
                      handleEditFormChange("adminNote", e.target.value)
                    }
                    placeholder="Internal admin notes..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Status Update */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Status</h3>
                <div className="flex gap-2">
                  {(["Active", "Inactive", "Completed", "Assign"] as const).map(
                    (status) => (
                      <Button
                        key={status}
                        variant={
                          editFormData.status === status ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleEditFormChange("status", status)}
                      >
                        {status}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRequest} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tuition Request Details</DialogTitle>
            <DialogDescription>
              Detailed information about the tuition request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student Name</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.studentName}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {selectedRequest.phoneNumber}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedRequest.district}, {selectedRequest.area}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Student Gender</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.studentGender}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Medium</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.medium}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.subject || "Not specified"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Class Level</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.studentClass || "Not specified"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tutoring Type</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.tutoringType}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Tutor Gender</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.tutorGenderPreference}
                  </div>
                </div>
              </div>

              {/* Tutoring Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tutoring Days</Label>
                  <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {selectedRequest.tutoringDays} days/week
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tutoring Time</Label>
                  <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {selectedRequest.tutoringTime}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Number of Students</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.numberOfStudents}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Duration per Session</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.tutoringDuration}
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div className="space-y-2">
                <Label>Salary Range</Label>
                <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />৳
                  {selectedRequest.salaryRange.min.toLocaleString()} - ৳
                  {selectedRequest.salaryRange.max.toLocaleString()}
                  {selectedRequest.isSalaryNegotiable && (
                    <Badge className="ml-2 bg-red-500">Negotiable</Badge>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                <Label>Additional Information</Label>
                <div className="p-2 bg-gray-50 rounded-md min-h-[60px]">
                  {selectedRequest.extraInformation ||
                    "No additional information"}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <div className="p-2 bg-gray-50 rounded-md min-h-[60px]">
                  {selectedRequest.adminNote || "No admin notes"}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    {renderStatusBadge(selectedRequest.status)}
                  </div>
                </div>
                <div>
                  <Label>Created At</Label>
                  <div className="mt-1">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <div className="mt-1">
                    {selectedRequest.updatedAt
                      ? new Date(selectedRequest.updatedAt).toLocaleString()
                      : "N/A"}
                  </div>
                </div>
              </div>

              {/* Update Notice History */}
              {updateNoticeHistory.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Update Notice History
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {updateNoticeHistory.map((notice, index) => (
                      <div
                        key={index}
                        className="p-3 bg-blue-50 rounded-md border border-blue-100"
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium">
                            {notice.updateNotice}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(notice.updatedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Tutor Modal */}
      <Dialog open={showAssignTutorModal} onOpenChange={setShowAssignTutorModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Tutor to Request</DialogTitle>
            <DialogDescription>
              Select a tutor to assign to this tuition request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Request Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Subject:</span>
                      <span>{selectedRequest.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Class:</span>
                      <span>{selectedRequest.studentClass}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Location:</span>
                      <span>
                        {selectedRequest.area}, {selectedRequest.district}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Salary Range:</span>
                      <span>
                        ৳{selectedRequest.salaryRange.min} - ৳
                        {selectedRequest.salaryRange.max}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Tutor Selection</h3>
                  <div className="space-y-2">
                    <Label htmlFor="assignmentNotes">Assignment Notes</Label>
                    <Textarea
                      id="assignmentNotes"
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      placeholder="Add notes about this assignment..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Available Tutors</h3>
                {isLoadingTutors ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredTutors.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No tutors found</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {filteredTutors.map((tutor) => (
                      <div
                        key={tutor.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedTutor === tutor.id
                            ? "border-green-500 bg-green-50"
                            : "border-border hover:border-primary/50 hover:bg-muted/20"
                        }`}
                        onClick={() => setSelectedTutor(tutor.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              {tutor.avatar_url ? (
                                <img
                                  src={tutor.avatar_url}
                                  alt={tutor.full_name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{tutor.full_name}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{tutor.district}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span>{tutor.rating || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant={selectedTutor === tutor.id ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTutor(tutor.id);
                            }}
                          >
                            {selectedTutor === tutor.id ? "Selected" : "Select"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignTutorModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignTutor} disabled={isAssigning || !selectedTutor}>
              {isAssigning ? "Assigning..." : "Assign Tutor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignments Modal */}
      <Dialog open={showAssignmentsModal} onOpenChange={setShowAssignmentsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tutor Assignments</DialogTitle>
            <DialogDescription>
              View all tutor assignments for this request
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignmentsModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tutor Details Modal */}
      <Dialog open={showTutorDetails} onOpenChange={setShowTutorDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tutor Details</DialogTitle>
            <DialogDescription>
              Detailed information about the tutor
            </DialogDescription>
          </DialogHeader>

          {selectedTutorDetails && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  {selectedTutorDetails.avatar_url ? (
                    <img
                      src={selectedTutorDetails.avatar_url}
                      alt={selectedTutorDetails.full_name}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedTutorDetails.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{selectedTutorDetails.rating || 0}</span>
                    <span className="text-muted-foreground">
                      ({selectedTutorDetails.total_reviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Location</Label>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedTutorDetails.district || selectedTutorDetails.location || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Hourly Rate</Label>
                  <p>
                    ৳{selectedTutorDetails.hourly_rate || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Subjects</Label>
                  <p>{selectedTutorDetails.subjects || selectedTutorDetails.preferred_subjects || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Education</Label>
                  <p>{selectedTutorDetails.education || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Experience</Label>
                  <p>{selectedTutorDetails.experience || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTutorDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>