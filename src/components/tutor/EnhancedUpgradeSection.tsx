import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Phone,
  Receipt,
  Copy,
  Loader2,
  Calendar,
  UserCheck,
  TrendingUp,
  Target,
  Award,
  Crown,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.next';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const EnhancedUpgradeSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    payment_method: '',
    transaction_id: '',
    phone_number: ''
  });

  // Demo Data - Upgrade Status
  const [upgradeStatus, setUpgradeStatus] = useState({
    hasPremium: false,
    hasVerified: true,
    activeUpgrades: [
      {
        id: '1',
        package_name: 'Verified Tutor',
        upgrade_type: 'verified',
        end_date: '2024-12-31T23:59:59Z',
        start_date: '2024-01-01T00:00:00Z',
        status: 'active'
      }
    ],
    pendingApplications: [
      {
        id: '2',
        package_name: 'Genius Pro',
        created_at: '2024-03-10T14:30:00Z',
        status: 'pending',
        amount_paid: 1200.00
      }
    ],
    stats: {
      total_upgrades: 3,
      total_spent: 2500.00,
      success_rate: 85
    }
  });

  // Demo Data - Packages
  const [packages, setPackages] = useState([
    {
      id: '1',
      name: 'Genius Basic',
      description: 'Basic premium features for 30 days',
      type: 'premium',
      price: 500,
      duration_days: 30,
      features: JSON.stringify([
        'Priority listing in search results',
        'Enhanced profile with badges',
        'Advanced analytics dashboard',
        'Priority customer support',
        'Unlimited course creation',
        'Profile verification badge',
        'Early access to new features'
      ]),
      popular: false,
      discount: 0
    },
    {
      id: '2',
      name: 'Genius Pro',
      description: 'Advanced premium features for 90 days',
      type: 'premium',
      price: 1200,
      duration_days: 90,
      features: JSON.stringify([
        'All Basic features',
        'Featured tutor spotlight',
        'Advanced marketing tools',
        'Custom profile URL',
        'Monthly performance reports',
        'Dedicated account manager',
        'Social media promotion'
      ]),
      popular: true,
      discount: 15
    },
    {
      id: '3',
      name: 'Verified Tutor',
      description: 'Get verified status for trust building',
      type: 'verified',
      price: 300,
      duration_days: 365,
      features: JSON.stringify([
        'Verified badge on profile',
        'Increased student trust',
        'Background check validation',
        'Certificate of verification',
        'KYC documentation',
        'Trust score boost',
        'Parent confidence badge'
      ]),
      popular: false,
      discount: 0
    },
    {
      id: '4',
      name: 'Combo Package',
      description: 'Both Genius and Verified for 60 days',
      type: 'premium',
      price: 800,
      duration_days: 60,
      features: JSON.stringify([
        'All Genius Basic features',
        'Verified badge',
        'Priority in both categories',
        'Combined discount',
        'Dual certification',
        'Extended support hours',
        'Premium webinar access'
      ]),
      popular: true,
      discount: 20
    }
  ]);

  // Demo Data - Payment Methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      name: 'bKash',
      type: 'MOBILE_BANKING',
      payment_number: '01711-123456',
      account_name: 'Tutor Platform Ltd.',
      status: 'active',
      instructions: 'Send money to this number and mention transaction ID in note',
      icon: '💰'
    },
    {
      id: '2',
      name: 'Nagad',
      type: 'MOBILE_BANKING',
      payment_number: '01722-654321',
      account_name: 'Tutor Platform',
      status: 'active',
      instructions: 'Send money to this number via Nagad app',
      icon: '📱'
    },
    {
      id: '3',
      name: 'Rocket',
      type: 'MOBILE_BANKING',
      payment_number: '01733-987654',
      account_name: 'Tutor Platform',
      status: 'active',
      instructions: 'Send money via Rocket Mobile Banking',
      icon: '🚀'
    },
    {
      id: '4',
      name: 'Bank Transfer',
      type: 'BANK_TRANSFER',
      payment_number: '1234567890123',
      account_name: 'Tutor Platform Ltd.',
      status: 'active',
      instructions: 'Transfer to this bank account (DBBL Gulshan Branch)',
      icon: '🏦'
    }
  ]);

  // Demo User Data
  const demoUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '01712345678',
    role: 'TUTOR',
    rating: 4.8,
    totalStudents: 45,
    completedSessions: 120,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  };

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      // Pre-populate phone number
      setPaymentData(prev => ({ ...prev, phone_number: demoUser.phone }));
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentData.payment_method);

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

  const handlePaymentSubmit = async () => {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Success! 🎉',
        description: `Your ${selectedPackage.name} application has been submitted successfully! Payment is pending verification.`,
      });
      
      setShowPaymentDialog(false);
      setPaymentData({
        payment_method: '',
        transaction_id: '',
        phone_number: demoUser.phone
      });
      
      // Update status for demo
      setUpgradeStatus(prev => ({
        ...prev,
        pendingApplications: [
          ...prev.pendingApplications,
          {
            id: Date.now().toString(),
            package_name: selectedPackage.name,
            created_at: new Date().toISOString(),
            status: 'pending',
            amount_paid: selectedPackage.price
          }
        ]
      }));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const parseFeatures = (features: any): string[] => {
    if (!features) return [];
    if (Array.isArray(features)) return features;
    if (typeof features === 'string') {
      try {
        return JSON.parse(features);
      } catch {
        return [];
      }
    }
    return [];
  };

  const renderPaymentDialog = () => (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Payment Information
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  {selectedPackage?.type === 'premium' ? (
                    <Crown className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <BadgeCheck className="h-6 w-6 text-blue-500" />
                  )}
                  <h3 className="font-bold text-green-800 text-lg">{selectedPackage?.name}</h3>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {selectedPackage?.discount > 0 && (
                    <span className="text-sm text-gray-500 line-through">
                      ৳{(selectedPackage?.price / (1 - selectedPackage.discount/100)).toFixed(0)}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-green-700">
                    ৳{selectedPackage?.price.toLocaleString()}
                  </span>
                </div>
                {selectedPackage?.discount > 0 && (
                  <Badge className="bg-red-100 text-red-800 mb-3">
                    {selectedPackage.discount}% OFF
                  </Badge>
                )}
                <div className="flex items-center justify-center gap-4 text-sm text-green-600 mt-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedPackage?.duration_days} days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UserCheck className="h-4 w-4" />
                    <span>{selectedPackage?.type === 'premium' ? 'Premium' : 'Verified'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Method
              </Label>
              <Select 
                value={paymentData.payment_method} 
                onValueChange={(value) => setPaymentData(prev => ({ ...prev, payment_method: value }))}
              >
                <SelectTrigger className="border-green-200">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id} className="flex items-center gap-2">
                      <span className="text-lg">{method.icon}</span>
                      <span>{method.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                    className="shrink-0 border-green-300"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground px-1">
                  {selectedPaymentMethod.instructions}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Your Phone Number
              </Label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={paymentData.phone_number}
                onChange={(e) => setPaymentData(prev => ({ ...prev, phone_number: e.target.value }))}
                className="border-green-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Transaction ID
              </Label>
              <Input
                type="text"
                placeholder="Enter transaction ID"
                value={paymentData.transaction_id}
                onChange={(e) => setPaymentData(prev => ({ ...prev, transaction_id: e.target.value }))}
                className="border-green-200"
              />
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 text-sm">
              Please keep your transaction ID safe. It will be used to verify your payment within 24 hours.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              className="flex-1 border-green-300"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePaymentSubmit}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Complete Payment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-200 to-emerald-200"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // User Profile Header
  const UserProfileHeader = () => (
    <Card className="mb-6 border-green-100 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-2 border-green-200">
              <AvatarImage src={demoUser.profileImage} />
              <AvatarFallback className="bg-green-100 text-green-800">
                {demoUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{demoUser.name}</h2>
                {upgradeStatus.hasVerified && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {upgradeStatus.hasPremium && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                    <Crown className="h-3 w-3 mr-1" />
                    Genius
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">Professional Tutor</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{demoUser.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span>{demoUser.totalStudents} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span>{demoUser.completedSessions} sessions</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-700">৳{upgradeStatus.stats.total_spent}</div>
            <div className="text-sm text-gray-500">Total Spent on Upgrades</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Stats Section
  const StatsSection = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Upgrade Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-700">{upgradeStatus.stats.total_upgrades}</div>
                <div className="text-sm text-gray-600">Total Upgrades</div>
              </div>
              <Award className="h-8 w-8 text-green-600 opacity-70" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-700">৳{upgradeStatus.stats.total_spent.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600 opacity-70" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-700">{upgradeStatus.stats.success_rate}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="relative">
                <CheckCircle className="h-8 w-8 text-purple-600 opacity-70" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Active Upgrades Section
  const ActiveUpgradesSection = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Active Upgrades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upgradeStatus.activeUpgrades.map((upgrade) => {
            const daysRemaining = Math.ceil((new Date(upgrade.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const progress = Math.max(0, Math.min(100, (daysRemaining / upgrade.duration_days) * 100));
            
            return (
              <div key={upgrade.id} className="border rounded-lg p-4 hover:border-green-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {upgrade.upgrade_type === 'premium' ? (
                      <Crown className="h-6 w-6 text-yellow-500" />
                    ) : (
                      <BadgeCheck className="h-6 w-6 text-blue-500" />
                    )}
                    <div>
                      <div className="font-semibold">{upgrade.package_name}</div>
                      <div className="text-sm text-gray-600">
                        Started: {new Date(upgrade.start_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge className={
                    upgrade.upgrade_type === 'premium' 
                      ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300"
                      : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300"
                  }>
                    {upgrade.upgrade_type === 'premium' ? 'Genius' : 'Verified'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Days Remaining: {daysRemaining}</span>
                    <span className="text-green-600 font-medium">{progress.toFixed(0)}% active</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-sm text-gray-500">
                    Expires: {new Date(upgrade.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  // Pending Applications Section
  const PendingApplicationsSection = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-500" />
          Pending Applications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upgradeStatus.pendingApplications.map((application) => (
            <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-yellow-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="font-medium">{application.package_name}</div>
                  <div className="text-sm text-gray-600">
                    Applied: {new Date(application.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Review
                </Badge>
                <div className="text-sm font-semibold text-gray-700 mt-1">
                  ৳{application.amount_paid.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Packages Grid
  const PackagesGrid = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Available Upgrade Packages
        </CardTitle>
        <CardDescription>
          Choose the package that best fits your needs. All packages include 24/7 support.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Packages</TabsTrigger>
            <TabsTrigger value="premium">Genius</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="premium" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2">
              {packages.filter(p => p.type === 'premium').map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="verified" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2">
              {packages.filter(p => p.type === 'verified').map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  const PackageCard = ({ pkg }: { pkg: any }) => {
    const features = parseFeatures(pkg.features);
    
    return (
      <Card className={`border-2 hover:border-green-300 transition-all duration-300 hover:shadow-lg flex flex-col h-full ${
        pkg.popular ? 'border-green-300 shadow-md relative' : ''
      }`}>
        {pkg.popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1">
              <Star className="h-3 w-3 mr-1" />
              MOST POPULAR
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                {pkg.type === 'premium' ? (
                  <Crown className="h-5 w-5 text-yellow-500" />
                ) : (
                  <BadgeCheck className="h-5 w-5 text-blue-500" />
                )}
                {pkg.name}
              </CardTitle>
              <CardDescription className="mt-1">{pkg.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                {pkg.discount > 0 && (
                  <span className="text-sm text-gray-500 line-through">
                    ৳{(pkg.price / (1 - pkg.discount/100)).toFixed(0)}
                  </span>
                )}
                <span className="text-3xl font-bold text-green-700">
                  ৳{pkg.price.toLocaleString()}
                </span>
                {pkg.discount > 0 && (
                  <Badge className="bg-red-100 text-red-800">
                    Save {pkg.discount}%
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{pkg.duration_days} days</span>
                </div>
                <div className="flex items-center gap-1">
                  {pkg.type === 'premium' ? (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                  )}
                  <span>{pkg.type === 'premium' ? 'Premium' : 'Verified'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-700">Features:</div>
              <div className="space-y-2">
                {features.slice(0, 4).map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
                {features.length > 4 && (
                  <div className="text-sm text-gray-500">
                    + {features.length - 4} more features
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-4">
          <Button 
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            onClick={() => {
              setSelectedPackage(pkg);
              setShowPaymentDialog(true);
            }}
          >
            {pkg.type === 'premium' ? 'Upgrade Now' : 'Get Verified'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Main Render Logic
  return (
    <>
      <div className="space-y-6">
        <UserProfileHeader />
        
        {upgradeStatus.hasPremium && upgradeStatus.hasVerified ? (
          <>
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-md">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Crown className="h-12 w-12 text-yellow-500" />
                      <BadgeCheck className="h-8 w-8 text-blue-500 absolute -bottom-2 -right-2" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-purple-800 mb-2">
                    Genius & Verified Tutor 🎉
                  </h2>
                  <p className="text-purple-600 mb-4">
                    You have full access to all premium features and verified status!
                  </p>
                  <div className="flex justify-center gap-3 mb-6">
                    <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300">
                      <Crown className="h-3 w-3 mr-1" />
                      Genius Status Active
                    </Badge>
                    <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300">
                      <BadgeCheck className="h-3 w-3 mr-1" />
                      Verified Status Active
                    </Badge>
                  </div>
                  <Alert className="max-w-md mx-auto bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      You're getting maximum visibility and trust from students!
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
            
            <StatsSection />
            <ActiveUpgradesSection />
            <PendingApplicationsSection />
          </>
        ) : upgradeStatus.hasPremium ? (
          <>
            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-md">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Crown className="h-10 w-10 text-yellow-600" />
                      <h2 className="text-2xl font-bold text-yellow-800">Genius Tutor</h2>
                    </div>
                    <p className="text-yellow-700 mb-4">
                      Enjoy premium features including priority listing, enhanced profile, and advanced analytics.
                    </p>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300">
                        <Crown className="h-3 w-3 mr-1" />
                        Genius Status Active
                      </Badge>
                      <Button 
                        variant="outline" 
                        className="border-blue-300 text-blue-700"
                        onClick={() => {
                          const verifiedPackage = packages.find(p => p.type === 'verified');
                          setSelectedPackage(verifiedPackage);
                          setShowPaymentDialog(true);
                        }}
                      >
                        <BadgeCheck className="h-4 w-4 mr-2" />
                        Get Verified
                      </Button>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="h-32 w-32 bg-gradient-to-br from-yellow-200 to-amber-200 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <StatsSection />
            <ActiveUpgradesSection />
            <PendingApplicationsSection />
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-blue-500" />
                Get Verified Status
              </h3>
              <p className="text-gray-600 mb-6">
                Become a verified tutor to build more trust with students and parents
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                {packages.filter(p => p.type === 'verified').map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </div>
          </>
        ) : upgradeStatus.hasVerified ? (
          <>
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-md">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <BadgeCheck className="h-10 w-10 text-blue-600" />
                      <h2 className="text-2xl font-bold text-blue-800">Verified Tutor</h2>
                    </div>
                    <p className="text-blue-700 mb-4">
                      Your verified status helps build trust with students and parents.
                    </p>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300">
                        <BadgeCheck className="h-3 w-3 mr-1" />
                        Verified Status Active
                      </Badge>
                      <Button 
                        variant="outline" 
                        className="border-yellow-300 text-yellow-700"
                        onClick={() => {
                          const premiumPackage = packages.find(p => p.type === 'premium' && p.popular);
                          setSelectedPackage(premiumPackage);
                          setShowPaymentDialog(true);
                        }}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Genius
                      </Button>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="h-32 w-32 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <StatsSection />
            <ActiveUpgradesSection />
            <PendingApplicationsSection />
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Upgrade to Genius
              </h3>
              <p className="text-gray-600 mb-6">
                Get genius features for enhanced visibility and tools
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                {packages.filter(p => p.type === 'premium').map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <StatsSection />
            <ActiveUpgradesSection />
            <PendingApplicationsSection />
            <PackagesGrid />
          </>
        )}
        
        {/* FAQ Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-2">What's the difference between Genius and Verified?</h4>
                <p className="text-gray-600 text-sm">
                  <span className="font-medium text-green-700">Genius</span> gives you premium features like priority listing and analytics. 
                  <span className="font-medium text-blue-700 ml-2">Verified</span> builds trust with students through background verification.
                </p>
              </div>
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-2">How long does verification take?</h4>
                <p className="text-gray-600 text-sm">
                  Usually 24-48 hours after payment confirmation. We'll notify you via email and in-app notification.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Can I cancel my upgrade?</h4>
                <p className="text-gray-600 text-sm">
                  Upgrades are non-refundable, but you can cancel auto-renewal anytime before the expiration date.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {renderPaymentDialog()}
    </>
  );
};

export default EnhancedUpgradeSection;