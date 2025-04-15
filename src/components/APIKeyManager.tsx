
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  setOpenAIKey, 
  getOpenAIKey,
  setGeminiKey,
  getGeminiKey
} from '@/utils/apiKeys';

export const APIKeyManager = () => {
  const [openaiKey, setOpenaiKey] = useState(getOpenAIKey() || '');
  const [geminiKey, setGeminiKeyState] = useState(getGeminiKey() || '');
  const [activeTab, setActiveTab] = useState("openai");

  const handleSaveOpenAI = () => {
    if (!openaiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid OpenAI API key",
        variant: "destructive"
      });
      return;
    }

    setOpenAIKey(openaiKey);
    toast({
      title: "Success",
      description: "OpenAI API key saved successfully",
    });
  };
  
  const handleSaveGemini = () => {
    if (!geminiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Gemini API key",
        variant: "destructive"
      });
      return;
    }

    setGeminiKey(geminiKey);
    toast({
      title: "Success",
      description: "Gemini API key saved successfully",
    });
  };

  return (
    <Card className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="openai">OpenAI API</TabsTrigger>
          <TabsTrigger value="gemini">Gemini API</TabsTrigger>
        </TabsList>
        
        <TabsContent value="openai" className="space-y-4">
          <h3 className="text-lg font-semibold">OpenAI API Key</h3>
          <div>
            <Input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="w-full"
            />
          </div>
          <Button onClick={handleSaveOpenAI} className="w-full">
            Save OpenAI API Key
          </Button>
          <p className="text-sm text-orange-600">
            ⚠️ Warning: Storing API keys in localStorage is not secure.
          </p>
        </TabsContent>
        
        <TabsContent value="gemini" className="space-y-4">
          <h3 className="text-lg font-semibold">Gemini API Key</h3>
          <div>
            <Input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKeyState(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="w-full"
            />
          </div>
          <Button onClick={handleSaveGemini} className="w-full">
            Save Gemini API Key
          </Button>
          <p className="text-sm text-orange-600">
            ⚠️ Warning: Storing API keys in localStorage is not secure.
          </p>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
