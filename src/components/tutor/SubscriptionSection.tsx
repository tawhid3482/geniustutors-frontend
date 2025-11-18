import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Shield, CheckCircle, AlertCircle, Clock, ArrowRight, CreditCard } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext.next';

interface PremiumStatus {
  hasPremium: boolean;
  hasVerified: boolean;
  activeUpgrades: any[];
  pendingApplications: any[];
}

interface UpgradePackage {
  id: string;
  name: string;
  type: 'premium' | 'verified';
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

const SubscriptionSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [availablePackages, setAvailablePackages] = useState<UpgradePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<UpgradePackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    fetchPremiumStatus();
    fetchAvailablePackages();
  }, []);

  const fetchPremiumStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to access premium features',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/upgrade-applications/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 403) {
          setAccessDenied(true);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to fetch premium status');
      }

      const data = await response.json();
      setPremiumStatus(data.data);
    } catch (error) {
      console.error('Error fetching premium status:', error);
      
      if (!accessDenied) {
        toast({
          title: 'Error',
          description: 'Failed to load premium status. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePackages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/upgrade-packages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailablePackages(data.data);
        // Set the first premium package as default
        const premiumPackage = data.data.find((pkg: UpgradePackage) => pkg.type === 'premium' && pkg.is_active);
        if (premiumPackage) {
          setSelectedPackage(premiumPackage);
        }
      } else {
        console.error('Failed to fetch packages:', response.status);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available packages',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPackage) {
      toast({
        title: 'Missing Information',
        description: 'Please select a package',
        variant: 'destructive',
      });
      return;
    }
    
    if (!transactionId.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your transaction ID',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to submit your application',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/upgrade-applications/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          package_id: selectedPackage.id,
          payment_method: paymentMethod,
          transaction_id: transactionId.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      toast({
        title: 'Application Submitted',
        description: 'Your upgrade application has been submitted successfully!',
      });

      // Reset form
      setTransactionId('');
      
      // Refresh premium status
      fetchPremiumStatus();
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderApplicationStatus = () => {
    if (!premiumStatus?.pendingApplications || premiumStatus.pendingApplications.length === 0) return null;

    const application = premiumStatus.pendingApplications[0];
    const { application_status: status, created_at, admin_note } = application;
    const date = new Date(created_at).toLocaleDateString();

    let statusIcon;
    let statusColor;
    let statusText;

    switch (status) {
      case 'pending':
        statusIcon = <Clock className="h-5 w-5 text-yellow-500" />;
        statusColor = 'bg-yellow-50 border-yellow-200';
        statusText = 'Your application is pending review';
        break;
      case 'approved':
        statusIcon = <CheckCircle className="h-5 w-5 text-green-500" />;
        statusColor = 'bg-green-50 border-green-200';
        statusText = 'Your application has been approved';
        break;
      case 'rejected':
        statusIcon = <AlertCircle className="h-5 w-5 text-red-500" />;
        statusColor = 'bg-red-50 border-red-200';
        statusText = 'Your application has been rejected';
        break;
      default:
        return null;
    }

    return (
      <Card className={`${statusColor} border shadow-sm mb-6`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">{statusIcon}</div>
            <div>
              <h3 className="font-semibold text-lg mb-1">{statusText}</h3>
              <p className="text-sm text-gray-600">Application submitted on {date}</p>
              {admin_note && status === 'rejected' && (
                <div className="mt-3 p-3 bg-white rounded-md border border-red-100">
                  <p className="text-sm font-medium text-gray-700">Reason for rejection:</p>
                  <p className="text-sm text-gray-600">{admin_note}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-7 w-7 text-red-600" />
            <CardTitle className="text-red-800">Access Denied</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            You don't have the required permissions to access premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-red-100">
              <h3 className="font-semibold text-red-800 mb-2">Issue Details:</h3>
              <ul className="space-y-1 text-sm text-red-700">
                <li>• Your current role: <strong>{user?.role || 'Unknown'}</strong></li>
                <li>• Required role: <strong>tutor</strong></li>
                <li>• Only users with the 'tutor' role can access premium subscription features</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border border-red-100">
              <h3 className="font-semibold text-red-800 mb-2">What you can do:</h3>
              <ul className="space-y-1 text-sm text-red-700">
                <li>• Contact customer support to verify your account</li>
                <li>• Ensure you registered with the correct account type</li>
                <li>• If you're a tutor, request role update from admin</li>
              </ul>
            </div>
            <div className="flex gap-3">
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
    );
  }

  if (premiumStatus?.hasPremium) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-green-200 rounded-full opacity-20"></div>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-600" />
              <CardTitle className="text-2xl font-bold text-green-800">Genius Tutor Status</CardTitle>
            </div>
            <CardDescription className="text-green-700 mt-2">
              You are a verified Genius Tutor on our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium">Priority Listing</h3>
                  </div>
                  <p className="text-sm text-gray-600">Your profile appears at the top of search results</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium">Genius Badge</h3>
                  </div>
                  <p className="text-sm text-gray-600">Special badge on your profile to attract more students</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium">Advanced Features</h3>
                  </div>
                  <p className="text-sm text-gray-600">Access to premium tools and features</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderApplicationStatus()}
      
      {(!premiumStatus?.pendingApplications || premiumStatus.pendingApplications.length === 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-7 w-7 text-green-600" />
              <CardTitle>Become a Genius Tutor</CardTitle>
            </div>
            <CardDescription>
              Upgrade to Genius Tutor status to get more visibility and opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Genius Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Priority placement in search results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Genius badge on your profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Featured in the Genius Tutors section</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Higher visibility to potential students</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Access to premium students and higher-paying jobs</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Apply Now</h3>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="package">Select Package</Label>
                      <div className="mt-2 space-y-2">
                        {availablePackages.filter(pkg => pkg.type === 'premium' && pkg.is_active).map((pkg) => (
                          <div
                            key={pkg.id}
                            className={`p-3 border rounded-md cursor-pointer transition-colors ${
                              selectedPackage?.id === pkg.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedPackage(pkg)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{pkg.name}</h4>
                                <p className="text-sm text-gray-600">{pkg.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-lg">৳{pkg.price}</div>
                                <div className="text-xs text-gray-500">{pkg.duration_days} days</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedPackage && (
                        <p className="text-xs text-gray-500 mt-1">
                          One-time payment for {selectedPackage.duration_days} days of premium status
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="payment-method">Payment Method</Label>
                      <RadioGroup 
                        id="payment-method" 
                        value={paymentMethod} 
                        onValueChange={setPaymentMethod}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bKash" id="bKash" />
                          <Label htmlFor="bKash" className="font-normal">bKash</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Nagad" id="Nagad" />
                          <Label htmlFor="Nagad" className="font-normal">Nagad</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Rocket" id="Rocket" />
                          <Label htmlFor="Rocket" className="font-normal">Rocket</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <Label htmlFor="transaction-id">Transaction ID</Label>
                      <Input 
                        id="transaction-id" 
                        placeholder="Enter your transaction ID"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-md border border-green-100">
                      <h4 className="font-medium text-green-800 mb-2">Payment Instructions:</h4>
                      <ol className="list-decimal list-inside text-sm text-green-700 space-y-1">
                        <li>Send ৳{selectedPackage?.price || 0} to our {paymentMethod} number: <span className="font-medium">01XXXXXXXXX</span></li>
                        <li>Copy the Transaction ID from your payment confirmation</li>
                        <li>Paste the Transaction ID in the field above</li>
                        <li>Submit your application</li>
                      </ol>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6 bg-green-600 hover:bg-green-700"
                    disabled={submitting || !selectedPackage}
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></span>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Apply for Genius Status
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionSection;