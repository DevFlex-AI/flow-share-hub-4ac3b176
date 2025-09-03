import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone } from 'lucide-react';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

const countryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+1', country: 'CA', flag: '🇨🇦' },
  { code: '+44', country: 'GB', flag: '🇬🇧' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+82', country: 'KR', flag: '🇰🇷' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+7', country: 'RU', flag: '🇷🇺' },
  { code: '+52', country: 'MX', flag: '🇲🇽' },
];

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Enter phone number",
  className = ""
}) => {
  const [countryCode, setCountryCode] = useState('+1');
  
  const handlePhoneChange = (phoneNumber: string) => {
    // Remove any non-digit characters except + at the beginning
    const cleaned = phoneNumber.replace(/[^\\d+]/g, '');
    
    // If it starts with a country code, use the full number
    if (cleaned.startsWith('+')) {
      onChange(cleaned);
    } else {
      // Otherwise, prepend the selected country code
      onChange(countryCode + cleaned);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      <Select value={countryCode} onValueChange={setCountryCode}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {countryCodes.map((country) => (
            <SelectItem key={`${country.code}-${country.country}`} value={country.code}>
              {country.flag} {country.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex-1 relative">
        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="tel"
          placeholder={placeholder}
          value={value.replace(countryCode, '')}
          onChange={(e) => handlePhoneChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10"
        />
      </div>
    </div>
  );
};
