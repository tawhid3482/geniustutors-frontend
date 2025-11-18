'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TestApiComponent() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/refund-policies');
      const data = await response.json();
      setResult(data);
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
        <CardTitle>API Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testApi} disabled={loading}>
          {loading ? 'Testing...' : 'Test API'}
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
