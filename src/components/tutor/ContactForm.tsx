import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useAuth } from '@/contexts/AuthContext.next';
import { useToast } from '@/components/ui/use-toast';
import { Send, Phone, Mail, MapPin, BookOpen, Calendar, DollarSign } from 'lucide-react';
import { BANGLADESH_DISTRICTS_WITH_POST_OFFICES } from '@/data/bangladeshDistricts';
import { tutorRequestService, TutorRequestFormData } from '@/services/tutorRequestService';
import { taxonomyService } from '@/services/taxonomyService';
import mediumOptions from '@/data/mediumOptions.json';



interface ContactFormProps {
  tutorId: string;
  tutorName: string;
  onContactSubmitted?: () => void;
}

export default function ContactForm({ tutorId, tutorName, onContactSubmitted }: ContactFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoadingTaxonomy, setIsLoadingTaxonomy] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classLevels, setClassLevels] = useState<any[]>([]);
  
  // Form data state
  const [formData, setFormData] = useState<any>({
    phoneNumber: user?.phone || '',
    studentGender: 'male',
    district: '',
    area: '',
    detailedLocation: '',
    // category: '',
    selectedCategories: [],
    selectedSubjects: [],
    selectedClasses: [],
    tutorGenderPreference: 'any',
    // salary: '',
    isSalaryNegotiable: true,
    salaryRange: {
      min: 0,
      max: 0
    },
    extraInformation: '',
    medium: 'English Medium',
    numberOfStudents: 1,
    tutoringDays: 5,
    tutoringTime: '',
    tutoringDuration: '2:00',
    tutoringType: 'Home Tutoring'
  });

  // Available areas and post offices based on selected district
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [availablePostOffices, setAvailablePostOffices] = useState<any[]>([]);

  // Update available areas and post offices when district changes
  React.useEffect(() => {
    if (formData.district) {
      const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => d.id === formData.district);
      if (district) {
        setAvailableAreas(district.areas.map(area => area.name));
        setFormData((prev:any) => ({
          ...prev,
          area: ''
        }));
      } else {
        setAvailableAreas([]);
        setAvailablePostOffices([]);
      }
    } else {
      setAvailableAreas([]);
      setAvailablePostOffices([]);
    }
  }, [formData.district]);
  
  // Update available post offices when area changes
  React.useEffect(() => {
    if (formData.district && formData.area) {
      const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => d.id === formData.district);
      if (district) {
        const area = district.areas.find(a => a.name === formData.area);
        if (area) {
          setAvailablePostOffices(area.postOffices);
        } else {
          setAvailablePostOffices([]);
        }
      }
    } else {
      setAvailablePostOffices([]);
    }
  }, [formData.district, formData.area]);

  // Fetch taxonomy data on component mount
  useEffect(() => {
    const fetchTaxonomyData = async () => {
      setIsLoadingTaxonomy(true);
      try {
        const taxonomyData = await taxonomyService.getTaxonomyData();
        // setCategories(taxonomyData.categories || []);
        
        // Extract all unique subjects and class levels from all categories
        const allSubjects: any[] = [];
        const allClassLevels: any[] = [];
        const processedSubjects = new Set<string>();
        const processedClassLevels = new Set<string>();

        // taxonomyData.categories.forEach((category) => {
        //   if (category.subjects) {
        //     category.subjects.forEach((subject: any) => {
        //       if (subject && typeof subject === 'object' && subject.id !== undefined && !processedSubjects.has(subject.name)) {
        //         allSubjects.push(subject);
        //         processedSubjects.add(subject.name);
        //       }
        //     });
        //   }
          
        //   if (category.classLevels) {
        //     category.classLevels.forEach((classLevel: any) => {
        //       if (classLevel && typeof classLevel === 'object' && classLevel.id !== undefined && !processedClassLevels.has(classLevel.name)) {
        //         allClassLevels.push(classLevel);
        //         processedClassLevels.add(classLevel.name);
        //       }
        //     });
        //   }
        // });

        setSubjects(allSubjects);
        setClassLevels(allClassLevels);
      } catch (error) {
        console.error('Error fetching taxonomy data:', error);
        // Set default categories if API fails
        setCategories([
          { id: 1, name: 'Primary', description: 'Primary Education', subjects: [], classLevels: [] },
          { id: 2, name: 'Secondary', description: 'Secondary Education', subjects: [], classLevels: [] },
          { id: 3, name: 'Higher Secondary', description: 'Higher Secondary Education', subjects: [], classLevels: [] },
          { id: 4, name: 'University', description: 'University Education', subjects: [], classLevels: [] }
        ]);
        setSubjects([
          { id: 1, name: 'Mathematics' },
          { id: 2, name: 'Physics' },
          { id: 3, name: 'Chemistry' },
          { id: 4, name: 'Biology' },
          { id: 5, name: 'English' },
          { id: 6, name: 'Bangla' }
        ]);
        setClassLevels([
          { id: 1, name: 'Class 1' },
          { id: 2, name: 'Class 2' },
          { id: 3, name: 'Class 3' },
          { id: 4, name: 'Class 4' },
          { id: 5, name: 'Class 5' },
          { id: 6, name: 'Class 6' },
          { id: 7, name: 'Class 7' },
          { id: 8, name: 'Class 8' },
          { id: 9, name: 'Class 9' },
          { id: 10, name: 'Class 10' }
        ]);
      } finally {
        setIsLoadingTaxonomy(false);
      }
    };

    fetchTaxonomyData();
  }, []);

  // Handle form field changes
  const handleChange = (field: keyof TutorRequestFormData, value: any) => {
    setFormData((prev:any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle subject selection
  const handleSubjectSelection = (subjectName: string) => {
    setFormData((prev:any) => {
      const currentSubjects = prev.selectedSubjects || [];
      const subjects = currentSubjects.includes(subjectName)
        ? currentSubjects.filter((s:any) => s !== subjectName)
        : [...currentSubjects, subjectName];
      
      return {
        ...prev,
        selectedSubjects: subjects
      };
    });
  };

  // Handle category selection
  const handleCategorySelection = (categoryName: string) => {
    setFormData((prev:any) => {
      const currentCategories = prev.selectedCategories || [];
      const categories = currentCategories.includes(categoryName)
        ? currentCategories.filter((c:any) => c !== categoryName)
        : [...currentCategories, categoryName];
      
      return {
        ...prev,
        selectedCategories: categories
      };
    });
  };

  // Handle class selection
  const handleClassSelection = (className: string) => {
    setFormData((prev:any) => {
      const currentClasses = prev.selectedClasses || [];
      const classes = currentClasses.includes(className)
        ? currentClasses.filter((c:any) => c !== className)
        : [...currentClasses, className];
      
      return {
        ...prev,
        selectedClasses: classes
      };
    });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validate form data
      if (!formData.phoneNumber || !formData.district || !formData.area) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      if ((formData.selectedCategories || []).length === 0) {
        toast({
          title: 'Missing Information',
          description: 'Please select at least one category',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      if ((formData.selectedSubjects || []).length === 0 || (formData.selectedClasses || []).length === 0) {
      toast({
          title: 'Missing Information',
          description: 'Please select at least one subject and class',
          variant: 'destructive'
        });
        setIsSubmitting(false);
      return;
    }

      if (!formData.tutoringTime) {
        toast({
          title: 'Missing Information',
          description: 'Please select tutoring time',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.salaryRange.min === 0 || formData.salaryRange.max === 0) {
        toast({
          title: 'Missing Information',
          description: 'Please enter salary range',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.salaryRange.min > formData.salaryRange.max) {
      toast({
          title: 'Invalid Salary Range',
          description: 'Minimum salary cannot be greater than maximum salary',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      // Submit form data using the new endpoint for tutor profile requests
      const response = await tutorRequestService.createPublicTutorRequestFromTutor(tutorId, formData);
      
      if (response.success) {
        setShowSuccess(true);
        toast({
          title: 'Request Submitted',
          description: 'Your tutor request has been submitted successfully!',
        });
      onContactSubmitted?.();
      } else {
        toast({
          title: 'Submission Failed',
          description: response.message || 'Failed to submit tutor request',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting tutor request:', error);
      toast({
        title: 'Submission Error',
        description: 'An error occurred while submitting your request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If showing success message
  if (showSuccess) {
    return (
      <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-green-600 text-4xl mb-4">✓</div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Request Submitted Successfully!</h3>
        <p className="text-green-700 text-sm">
          Your tutor request has been sent to {tutorName}. We'll contact you soon!
        </p>
      </div>
    );
  }

  return (
    <>

      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Personal Information */}
      <div className="space-y-4">
      <div>
          <Label htmlFor="phoneNumber">Phone Number *</Label>
        <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            placeholder="Enter your phone number"
          required
        />
      </div>

      <div>
          <Label>Student Gender *</Label>
          <RadioGroup 
            value={formData.studentGender} 
            onValueChange={(value) => handleChange('studentGender', value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both">Both</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="district">District *</Label>
          <SearchableSelect
            value={formData.district}
            onValueChange={(value) => handleChange('district', value)}
            placeholder="Select district"
            options={BANGLADESH_DISTRICTS_WITH_POST_OFFICES.map((district) => ({
              value: district.id,
              label: district.name
            }))}
          />
        </div>
        
        <div>
          <Label htmlFor="area">Thana *</Label>
          <SearchableSelect
            value={formData.area}
            onValueChange={(value) => handleChange('area', value)}
            placeholder="Select area"
            options={availableAreas.map((area) => ({
              value: area,
              label: area
            }))}
            disabled={!formData.district}
          />
        </div>
        
        
        <div>
          <Label htmlFor="detailedLocation">Detailed Location (Optional)</Label>
          <Textarea 
            id="detailedLocation" 
            value={formData.detailedLocation} 
            onChange={(e) => handleChange('detailedLocation', e.target.value)}
            placeholder="Enter detailed address, landmarks, etc."
            rows={3}
          />
        </div>
        
        <div>
          <Label>Tutor Gender Preference *</Label>
          <RadioGroup 
            value={formData.tutorGenderPreference} 
            onValueChange={(value) => handleChange('tutorGenderPreference', value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="tutor-male" />
              <Label htmlFor="tutor-male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="tutor-female" />
              <Label htmlFor="tutor-female">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="tutor-any" />
              <Label htmlFor="tutor-any">Any</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Academic Information */}
      <div className="space-y-4">
        <div>
          <Label>Categories *</Label>
          {isLoadingTaxonomy ? (
            <div className="text-center py-4 text-sm">Loading categories...</div>
          ) : (
            <Select 
              value="" 
              onValueChange={(value) => {
                if (value && !formData.selectedCategories.includes(value)) {
                  handleCategorySelection(value);
                }
              }}
              disabled={isLoadingTaxonomy}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select categories" />
              </SelectTrigger>
              <SelectContent className="select-content-scroll">
                {categories.filter(category => category && category.id).map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {formData.selectedCategories.length > 0 && (
            <div className="mt-2 space-y-1">
              {formData.selectedCategories.map((category:any, index:any) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm">
                  <span>{category}</span>
                  <button
                    type="button"
                    onClick={() => handleCategorySelection(category)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <Label>Subjects *</Label>
          {isLoadingTaxonomy ? (
            <div className="text-center py-4 text-sm">Loading subjects...</div>
          ) : (
            <Select 
              value="" 
              onValueChange={(value) => {
                if (value && !formData.selectedSubjects.includes(value)) {
                  handleSubjectSelection(value);
                }
              }}
              disabled={!formData.selectedCategories.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subjects" />
              </SelectTrigger>
              <SelectContent className="select-content-scroll">
                {subjects.filter(subject => subject && subject.id).map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {formData.selectedSubjects.length > 0 && (
            <div className="mt-2 space-y-1">
              {formData.selectedSubjects.map((subject:any, index:any) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm">
                  <span>{subject}</span>
                  <button
                    type="button"
                    onClick={() => handleSubjectSelection(subject)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <Label>Class Levels *</Label>
          {isLoadingTaxonomy ? (
            <div className="text-center py-4 text-sm">Loading class levels...</div>
          ) : (
            <Select 
              value="" 
              onValueChange={(value) => {
                if (value && !formData.selectedClasses.includes(value)) {
                  handleClassSelection(value);
                }
              }}
              disabled={!formData.selectedCategories.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select classes" />
              </SelectTrigger>
              <SelectContent className="select-content-scroll">
                {classLevels.filter(classLevel => classLevel && classLevel.id).map((classLevel) => (
                  <SelectItem key={classLevel.id} value={classLevel.name}>
                    {classLevel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {formData.selectedClasses.length > 0 && (
            <div className="mt-2 space-y-1">
              {formData.selectedClasses.map((className:any, index:any) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm">
                  <span>{className}</span>
                  <button
                    type="button"
                    onClick={() => handleClassSelection(className)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tutoring Details */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="medium">Medium *</Label>
          <Select 
            value={formData.medium} 
            onValueChange={(value) => handleChange('medium', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select medium" />
            </SelectTrigger>
            <SelectContent className="select-content-scroll">
              {mediumOptions.mediums.map((medium) => (
                <SelectItem key={medium.value} value={medium.value}>
                  {medium.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="numberOfStudents">Number of Students *</Label>
        <Input
            id="numberOfStudents" 
            type="number"
            min="1"
            max="10"
            value={formData.numberOfStudents} 
            onChange={(e) => handleChange('numberOfStudents', parseInt(e.target.value) || 1)}
            placeholder="Number of students"
          required
        />
      </div>

      <div>
          <Label htmlFor="tutoringTime">Tutoring Time *</Label>
        <Input
            id="tutoringTime" 
            type="time"
            value={formData.tutoringTime} 
            onChange={(e) => handleChange('tutoringTime', e.target.value)}
            required
        />
      </div>

      <div>
          <Label htmlFor="tutoringDays">Tutoring Days per Week *</Label>
          <Select 
            value={formData.tutoringDays.toString()} 
            onValueChange={(value) => handleChange('tutoringDays', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select days per week" />
            </SelectTrigger>
            <SelectContent className="select-content-scroll">
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
        
        <div>
          <Label htmlFor="tutoringType">Tutoring Type *</Label>
          <Select 
            value={formData.tutoringType || 'Home Tutoring'} 
            onValueChange={(value) => handleChange('tutoringType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tutoring type" />
            </SelectTrigger>
            <SelectContent className="select-content-scroll">
              <SelectItem value="Home Tutoring">Home Tutoring</SelectItem>
              <SelectItem value="Online Tutoring">Online Tutoring</SelectItem>
              <SelectItem value="Both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="tutoringDuration">Tutoring Duration *</Label>
          <Select 
            value={formData.tutoringDuration || '2:00'} 
            onValueChange={(value) => handleChange('tutoringDuration', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent className="select-content-scroll">
              <SelectItem value="1:00">1 Hour</SelectItem>
              <SelectItem value="1:30">1.5 Hours</SelectItem>
              <SelectItem value="2:00">2 Hours</SelectItem>
              <SelectItem value="2:30">2.5 Hours</SelectItem>
              <SelectItem value="3:00">3 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Salary Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="salaryMin">Minimum Salary *</Label>
          <Input 
            id="salaryMin" 
            type="number"
            value={formData.salaryRange.min} 
            onChange={(e) => handleChange('salaryRange', { ...formData.salaryRange, min: parseInt(e.target.value) || 0 })}
            placeholder="Minimum salary"
          required
          />
        </div>
        
        <div>
          <Label htmlFor="salaryMax">Maximum Salary *</Label>
          <Input 
            id="salaryMax" 
            type="number"
            value={formData.salaryRange.max} 
            onChange={(e) => handleChange('salaryRange', { ...formData.salaryRange, max: parseInt(e.target.value) || 0 })}
            placeholder="Maximum salary"
            required
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isSalaryNegotiable"
            checked={formData.isSalaryNegotiable}
            onCheckedChange={(checked) => handleChange('isSalaryNegotiable', checked)}
          />
          <Label htmlFor="isSalaryNegotiable" className="text-sm leading-tight">Salary is Negotiable</Label>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <Label htmlFor="extraInformation">Additional Information (Optional)</Label>
        <Textarea 
          id="extraInformation" 
          value={formData.extraInformation} 
          onChange={(e) => handleChange('extraInformation', e.target.value)}
          placeholder="Any specific requirements or information you want to share"
          rows={3}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit Tutor Request
          </>
        )}
      </Button>

      <div className="text-xs text-gray-500 text-center">
          By submitting this request, you agree to our terms of service and privacy policy.
      </div>
    </form>
    </>
  );
}
