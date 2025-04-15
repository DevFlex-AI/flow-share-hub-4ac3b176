
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { setOpenAIKey, getOpenAIKey } from '@/utils/apiKeys';

export const APIKeyManager = () => {
  const [apiKey, setApiKey] = useState(getOpenAIKey() || '');

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }

    setOpenAIKey(apiKey);
    toast({
      title: "Success",
      description: "API key saved successfully",
    });
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">OpenAI API Key</h3>
      <div className="space-y-4">
        <div>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenAI API key"
            className="w-full"
          />
        </div>
        <Button onClick={handleSave} className="w-full">
          Save API Key
        </Button>
        <p className="text-sm text-orange-600">
          ⚠️ Warning: Storing API keys in localStorage is not secure.
          Consider using Supabase for production applications.
        </p>
      </div>
    </Card>
  );
};
