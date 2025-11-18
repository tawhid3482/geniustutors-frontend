import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  CreditCard, 
  Star,
  BadgeCheck,
  FileText,
  Upload,
  X,
  Eye,
  Download,
  Phone,
  Receipt,
  Copy,
  Loader2
} from 'lucide-react';
import { 
  getUpgradePackages, 
  getUpgradeStatus, 
  applyForUpgrade,
  type UpgradePackage,
  type UpgradeStatus,
  type KYCDocuments
} from '@/services/upgradeService';
import { useAuth } from '@/contexts/AuthContext.next';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { platformPaymentMethodService, type PlatformPaymentMethod } from '@/services/platformPaymentMethodService';

const EnhancedUpgradeSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [upgradeStatus, setUpgradeStatus] = useState<UpgradeStatus | null>(null);
  const [packages, setPackages] = useState<UpgradePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<UpgradePackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [kycDocuments, setKycDocuments] = useState<KYCDocuments>({});
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Payment dialog states (same as course enrollment)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PlatformPaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_method: '',
    transaction_id: '',
    phone_number: ''
  });

  // Helper function to parse features
  const parseFeatures = (features: any): string[] => {
    if (!features) {
      return [];
    }
    if (Array.isArray(features)) {
      return features.filter(feature => typeof feature === 'string');
    }
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features || '[]');
        return Array.isArray(parsed) ? parsed.filter(feature => typeof feature === 'string') : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    fetchData();
    fetchPaymentMethods();
    
    // Pre-populate phone number if user has one
    if (user?.phone) {
      setPaymentData(prev => ({ ...prev, phone_number: user.phone || '' }));
    }
  }, [user?.phone]);

  // Fetch payment methods when component mounts
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusResponse, packagesResponse] = await Promise.all([
        getUpgradeStatus(),
        getUpgradePackages()
      ]);

      if (statusResponse.success) {
        setUpgradeStatus(statusResponse.data);
      }

      if (packagesResponse.success) {
        setPackages(packagesResponse.data);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (error.message?.includes('403') || error.message?.includes('Unauthorized')) {
        setAccessDenied(true);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load upgrade information. Please try again.',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    // Validate payment data
    if (!paymentData.payment_method || !paymentData.transaction_id || !paymentData.phone_number) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all payment fields including phone number',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedPackage) {
      toast({
        title: 'Error',
        description: 'No package selected',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
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

      const response = await applyForUpgrade(
        selectedPackage.id,
        selectedPaymentMethodName, // Send payment method name instead of ID
        paymentData.transaction_id,
        paymentData.phone_number, // Use phone number from form
        selectedPackage.type === 'verified' ? kycDocuments : undefined
      );

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Your upgrade application has been submitted successfully! Payment is pending verification.',
        });
        setShowPaymentDialog(false);
        setSelectedPackage(null);
        setPaymentData({
          payment_method: '',
          transaction_id: '',
          phone_number: ''
        });
        setKycDocuments({});
        fetchData(); // Refresh data
        
        // Show success message and stay on current page
        setTimeout(() => {
          toast({
            title: 'Application Submitted',
            description: 'Your application has been submitted successfully. You can track its status in the "Pending Applications" section below.',
          });
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (field: keyof KYCDocuments, file: File) => {
    // In a real implementation, you would upload the file to a server
    // For now, we'll just store the file name
    setKycDocuments(prev => ({
      ...prev,
      [field]: file.name
    }));
  };

  const removeFile = (field: keyof KYCDocuments) => {
    setKycDocuments(prev => {
      const newDocs = { ...prev };
      delete newDocs[field];
      return newDocs;
    });
  };

  // Helper function to render the payment dialog (same as course enrollment)
  const renderPaymentDialog = () => (
    <>
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
            {/* Package Summary */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="text-center">
                  <h3 className="font-semibold text-green-800 mb-2">{selectedPackage?.name}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-green-700">
                      ৳{selectedPackage?.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Duration: {selectedPackage?.duration_days} days
                  </p>
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

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={paymentData.phone_number}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, phone_number: e.target.value }))}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

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

              {/* KYC Documents for Verified Package */}
              {selectedPackage?.type === 'verified' && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowKycModal(true)}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload KYC Documents
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {submitting ? (
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

      {/* KYC Modal */}
      <Dialog open={showKycModal} onOpenChange={setShowKycModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Document Upload</DialogTitle>
            <DialogDescription>
              Please upload the required documents for verification
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please ensure all documents are clear and legible. Supported formats: JPG, PNG, PDF (max 5MB each)
              </AlertDescription>
            </Alert>

            {Object.entries({
              national_id: 'National ID Card',
              passport: 'Passport',
              driving_license: 'Driving License',
              utility_bill: 'Utility Bill (Electricity/Water/Gas)',
              bank_statement: 'Bank Statement',
              employment_letter: 'Employment Letter',
              education_certificate: 'Education Certificate'
            }).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={key}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(key as keyof KYCDocuments, file);
                      }
                    }}
                    className="flex-1"
                  />
                  {kycDocuments[key as keyof KYCDocuments] && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(key as keyof KYCDocuments)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {kycDocuments[key as keyof KYCDocuments] && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    {kycDocuments[key as keyof KYCDocuments]}
                  </div>
                )}
              </div>
            ))}

            <div className="space-y-2">
              <Label>Other Documents (Optional)</Label>
              <Textarea
                placeholder="List any additional documents you'd like to submit..."
                value={kycDocuments.other_documents?.join('\n') || ''}
                onChange={(e) => setKycDocuments(prev => ({
                  ...prev,
                  other_documents: e.target.value.split('\n').filter(doc => doc.trim())
                }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKycModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowKycModal(false)}>
              Save Documents
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  if (loading) {
    return (
      <>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2">Loading upgrade information...</span>
            </div>
          </CardContent>
        </Card>
        {renderPaymentDialog()}
      </>
    );
  }

  if (accessDenied) {
    return (
      <>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
              <p className="text-red-600 mb-4">
                You don't have permission to access the upgrade section. Please contact support if you believe this is an error.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => window.location.href = '/contact'} 
                  className="bg-red-600 hover:bg-red-700"
                >
                  Contact Support
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {renderPaymentDialog()}
      </>
    );
  }

  // If user has both genius and verified status
  if (upgradeStatus?.hasPremium && upgradeStatus?.hasVerified) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-purple-200 rounded-full opacity-20"></div>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-purple-600" />
                <Star className="h-6 w-6 text-yellow-500" />
                <BadgeCheck className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-purple-800">Genius & Verified Tutor</CardTitle>
            </div>
            <CardDescription className="text-purple-700 mt-2">
              You are a verified Genius Tutor with full access to all features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                  <Shield className="h-3 w-3 mr-1" />
                  Genius
                </Badge>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <BadgeCheck className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p className="text-purple-700">
                Enjoy all premium features including priority listing, enhanced profile, advanced analytics, 
                and priority support. Your verified status builds trust with students and parents.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Upgrades */}
        {upgradeStatus?.activeUpgrades && upgradeStatus.activeUpgrades.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Active Upgrades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upgradeStatus.activeUpgrades.map((upgrade) => (
                  <div key={upgrade.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{upgrade.package_name}</div>
                      <div className="text-sm text-gray-600">
                        Expires: {new Date(upgrade.end_date).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={upgrade.upgrade_type === 'premium' ? 'default' : 'secondary'}>
                      {upgrade.upgrade_type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // If user has only premium status
  if (upgradeStatus?.hasPremium) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-green-200 rounded-full opacity-20"></div>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-600" />
              <CardTitle className="text-2xl font-bold text-green-800">Genius Tutor</CardTitle>
            </div>
            <CardDescription className="text-green-700 mt-2">
              You are a Genius Tutor with enhanced features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <Shield className="h-3 w-3 mr-1" />
                Genius
              </Badge>
              <p className="text-green-700">
                Enjoy premium features including priority listing, enhanced profile, and advanced analytics.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade to Verified */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-green-600" />
              Get Verified Status
            </CardTitle>
            <CardDescription>
              Become a verified tutor to build more trust with students and parents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {packages.filter(pkg => pkg.type === 'verified').map((pkg) => (
                  <Card key={pkg.id} className="border-2 hover:border-green-300 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-green-600" />
                        {pkg.name}
                      </CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-2xl font-bold text-green-600">
                          ৳{pkg.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Duration: {pkg.duration_days} days
                        </div>
                        <div className="space-y-1">
                          {(() => {
                            const features = parseFeatures(pkg.features);
                            return Array.isArray(features) ? features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {feature}
                              </div>
                            )) : [];
                          })()}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setShowPaymentDialog(true);
                        }}
                      >
                        Apply for Verification
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has only verified status
  if (upgradeStatus?.hasVerified) {
    return (
      <>
        <div className="space-y-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-green-200 rounded-full opacity-20"></div>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-8 w-8 text-green-600" />
              <CardTitle className="text-2xl font-bold text-green-800">Verified Tutor</CardTitle>
            </div>
            <CardDescription className="text-green-700 mt-2">
              You are a verified tutor with trust indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <BadgeCheck className="h-3 w-3 mr-1" />
                Verified
              </Badge>
              <p className="text-green-700">
                Your verified status helps build trust with students and parents.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade to Genius */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Upgrade to Premium
            </CardTitle>
            <CardDescription>
              Get genius features for enhanced visibility and tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {packages.filter(pkg => pkg.type === 'premium').map((pkg) => (
                  <Card key={pkg.id} className="border-2 hover:border-green-300 transition-colors flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        {pkg.name}
                      </CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-3">
                        <div className="text-2xl font-bold text-green-600">
                          ৳{pkg.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Duration: {pkg.duration_days} days
                        </div>
                        <div className="space-y-1">
                          {(() => {
                            const features = parseFeatures(pkg.features);
                            return Array.isArray(features) ? features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {feature}
                              </div>
                            )) : [];
                          })()}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="mt-auto">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setShowPaymentDialog(true);
                        }}
                      >
                        Upgrade to Genius
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
        {renderPaymentDialog()}
      </>
    );
  }

  // If user has no upgrades
  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Upgrade Your Account
            </CardTitle>
            <CardDescription>
              Choose between Genius and Verified packages to enhance your tutoring profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Genius Package */}
              {packages.filter(pkg => pkg.type === 'premium').map((pkg) => (
                <Card key={pkg.id} className="border-2 hover:border-green-300 transition-colors flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      {pkg.name}
                    </CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-green-600">
                        ৳{pkg.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Duration: {pkg.duration_days} days
                      </div>
                      <div className="space-y-1">
                        {(() => {
                          const features = parseFeatures(pkg.features);
                          return Array.isArray(features) ? features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {feature}
                            </div>
                          )) : [];
                        })()}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowPaymentDialog(true);
                      }}
                    >
                      Get Genius
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {/* Verified Package */}
              {packages.filter(pkg => pkg.type === 'verified').map((pkg) => (
                <Card key={pkg.id} className="border-2 hover:border-green-300 transition-colors flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BadgeCheck className="h-5 w-5 text-green-600" />
                      {pkg.name}
                    </CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-green-600">
                        ৳{pkg.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Duration: {pkg.duration_days} days
                      </div>
                      <div className="space-y-1">
                        {(() => {
                          const features = parseFeatures(pkg.features);
                          return Array.isArray(features) ? features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {feature}
                            </div>
                          )) : [];
                        })()}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowPaymentDialog(true);
                      }}
                    >
                      Get Verified
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Applications */}
        {upgradeStatus?.pendingApplications && upgradeStatus.pendingApplications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upgradeStatus.pendingApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{application.package_name}</div>
                      <div className="text-sm text-gray-600">
                        Applied: {new Date(application.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending Review
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {renderPaymentDialog()}
    </>
  );
};

export default EnhancedUpgradeSection;
