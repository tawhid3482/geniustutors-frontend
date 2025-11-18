'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, PlayCircle, CheckCircle, Star, Loader2, X, CreditCard, Phone, Receipt, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { enrollInCourse, formatCoursePrice, calculateDiscountPercentage, type Course } from '@/services/courseService';
import { platformPaymentMethodService, type PlatformPaymentMethod } from '@/services/platformPaymentMethodService';
import { API_BASE_URL } from '@/config/api';

interface CourseEnrollmentDialogProps {
  course: Course;
  children: React.ReactNode;
  onEnrollmentSuccess?: () => void;
}

export function CourseEnrollmentDialog({ course, children, onEnrollmentSuccess }: CourseEnrollmentDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PlatformPaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_method: '',
    transaction_id: ''
  });

  // Helper function to get full thumbnail URL
  const getThumbnailUrl = (thumbnailUrl: string | null | undefined): string | null => {
    if (!thumbnailUrl) return null;
    if (thumbnailUrl.startsWith('http')) return thumbnailUrl;
    return `${API_BASE_URL.replace('/api', '')}${thumbnailUrl}`;
  };

  // Fetch payment methods when component mounts
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoadingPaymentMethods(true);
        const methods = await platformPaymentMethodService.getPaymentMethods();
        setPaymentMethods(methods.filter(method => method.status === 'active'));
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        toast({
          title: 'Error',
          description: 'Failed to load payment methods',
          variant: 'destructive'
        });
      } finally {
        setLoadingPaymentMethods(false);
      }
    };

    fetchPaymentMethods();
  }, [toast]);

  // Get selected payment method details
  const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentData.payment_method);

  // Copy payment number to clipboard
  const copyPaymentNumber = async () => {
    if (selectedPaymentMethod?.payment_number) {
      try {
        await navigator.clipboard.writeText(selectedPaymentMethod.payment_number);
        toast({
          title: 'Copied!',
          description: 'Payment number copied to clipboard',
        });
      } catch (error) {
        console.error('Failed to copy:', error);
        toast({
          title: 'Error',
          description: 'Failed to copy payment number',
          variant: 'destructive'
        });
      }
    }
  };

  const handleEnrollClick = () => {
    setShowPaymentDialog(true);
  };

  const handlePaymentSubmit = async () => {
    // Validate payment data
    if (!paymentData.payment_method || !paymentData.transaction_id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all payment fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setEnrolling(true);
      
      // Get the payment method name from the selected payment method
      const selectedPaymentMethodName = paymentMethods.find(method => method.id === paymentData.payment_method)?.name;
      
      if (!selectedPaymentMethodName) {
        toast({
          title: 'Error',
          description: 'Please select a valid payment method',
          variant: 'destructive'
        });
        return;
      }
      
      await enrollInCourse(course.id, {
        payment_method: selectedPaymentMethodName, // Send payment method name instead of ID
        transaction_id: paymentData.transaction_id
      });
      
      toast({
        title: 'Success',
        description: 'Successfully enrolled in course! Payment is pending verification.',
      });
      
      setShowPaymentDialog(false);
      setIsOpen(false);
      onEnrollmentSuccess?.();
      
      // Reset payment data
      setPaymentData({
        payment_method: '',
        transaction_id: ''
      });
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to enroll in course',
        variant: 'destructive'
      });
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Course Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Course Header */}
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
              {getThumbnailUrl(course.thumbnail_url) ? (
                <img 
                  src={getThumbnailUrl(course.thumbnail_url)!} 
                  alt={course.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <PlayCircle className="h-16 w-16 text-primary opacity-80" />
              )}
            </div>
            <Badge variant="secondary" className="absolute top-4 right-4">
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Badge>
          </div>

          {/* Course Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Students</div>
              <div className="font-semibold">{course.enrolled_students || 0}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-semibold">{course.duration_hours}h</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Level</div>
              <div className="font-semibold capitalize">{course.level}</div>
            </div>
          </div>

          {/* Course Description */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3">About This Course</h3>
              <p className="text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            </CardContent>
          </Card>

          {/* Course Features */}
          {course.learning_outcomes && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
                <div className="space-y-2">
                  {course.learning_outcomes.split('\n').map((outcome, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{outcome.trim()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course Requirements */}
          {course.requirements && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {course.requirements}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Course Modules Preview */}
          {course.modules && course.modules.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">Course Content</h3>
                <div className="space-y-3">
                  {course.modules.slice(0, 5).map((module, index) => (
                    <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Module {index + 1}: {module.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {module.lesson_count || 0} lessons • {module.total_duration || 0} minutes
                        </div>
                      </div>
                      {module.is_free && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Free
                        </Badge>
                      )}
                    </div>
                  ))}
                  {course.modules.length > 5 && (
                    <div className="text-center text-muted-foreground">
                      +{course.modules.length - 5} more modules
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing and Enrollment */}
          <Card className="border-2 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl font-bold text-primary">
                      {formatCoursePrice(course.price)}
                    </span>
                    {course.original_price && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatCoursePrice(course.original_price)}
                      </span>
                    )}
                  </div>
                  {course.original_price && (
                    <Badge variant="destructive" className="text-sm">
                      {calculateDiscountPercentage(course.price, course.original_price)}% OFF
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleEnrollClick}
                    disabled={enrolling}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-bold py-3 rounded-lg"
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      'Enroll Now'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Payment Information
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Course Summary */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="text-center">
                  <h3 className="font-semibold text-green-800 mb-2">{course.title}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-green-700">
                      {formatCoursePrice(course.price)}
                    </span>
                    {course.original_price && (
                      <span className="text-sm text-green-600 line-through">
                        {formatCoursePrice(course.original_price)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <div className="space-y-4">
              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="payment_method" className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Method
                </Label>
                <Select 
                  value={paymentData.payment_method} 
                  onValueChange={(value) => setPaymentData(prev => ({ ...prev, payment_method: value }))}
                  disabled={loadingPaymentMethods}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingPaymentMethods ? "Loading payment methods..." : "Select payment method"} />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Number Display */}
              {selectedPaymentMethod && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Payment Number
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={selectedPaymentMethod.payment_number}
                      readOnly
                      className="border-green-200 bg-green-50 font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyPaymentNumber}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Send payment to this number and enter the transaction ID below
                  </p>
                </div>
              )}

              {/* Transaction ID */}
              <div className="space-y-2">
                <Label htmlFor="transaction_id" className="text-sm font-medium flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Transaction ID
                </Label>
                <Input
                  id="transaction_id"
                  type="text"
                  placeholder="Enter transaction ID"
                  value={paymentData.transaction_id}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, transaction_id: e.target.value }))}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1"
                disabled={enrolling}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={enrolling}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Complete Payment'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
