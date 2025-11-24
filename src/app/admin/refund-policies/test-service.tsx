'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { refundPolicyService } from '@/services/refundPolicyService';

export function TestServiceComponent() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testService = async () => {
    setLoading(true);
    try {
      const response = await refundPolicyService.getRefundPolicies();
      setResult(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testService} disabled={loading}>
          {loading ? 'Testing...' : 'Test Service'}
        </Button>
        {result && (
          <pre className="mt-4 p-4 bg-gray-100 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
