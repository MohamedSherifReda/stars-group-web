import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Mail, Phone, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactUsApi } from '@features/contact-us/contact-us.apis';
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '~/styles/phone-input.css';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/common/card';
import { Button } from '@ui/common/button';
import { Label } from '@ui/common/label';
import { Input } from '@ui/common/input';

export default function ContactUs() {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const queryClient = useQueryClient();

  const { data: contactUsData, isLoading } = useQuery({
    queryKey: ['contact-us'],
    queryFn: () => contactUsApi.getContactUs().then((res) => res.data?.data),
    select: (data) => Array.isArray(data) ? data[0] : data,
  });

  useEffect(() => {
    if (contactUsData) {
      setEmail(contactUsData.email || '');
      // Combine phone_number_key and phone_number for PhoneInput
      const fullPhone = contactUsData.phone_number_key 
        ? `${contactUsData.phone_number_key}${contactUsData.phone_number}`
        : contactUsData.phone_number;
      setPhoneNumber(fullPhone || '');
    }
  }, [contactUsData]);

  const updateMutation = useMutation({
    mutationFn: (data: { email: string; phone_number: string; phone_number_key: string }) =>
      contactUsApi.updateContactUs(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-us'] });
      setIsEditing(false);
      toast.success('Contact information updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update contact information');
    },
  });

  const handleSave = () => {
    if (!email || !phoneNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone number using the library's built-in validation
    if (!isValidPhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Parse phone number to extract country code and national number
    try {
      const parsedPhone = parsePhoneNumber(phoneNumber);
      if (!parsedPhone) {
        toast.error('Invalid phone number format');
        return;
      }

      const phone_number_key = `+${parsedPhone.countryCallingCode}`;
      const phone_number = parsedPhone.nationalNumber;

      updateMutation.mutate({
        email,
        phone_number,
        phone_number_key,
      });
    } catch (error) {
      toast.error('Failed to parse phone number');
      console.error('Phone parsing error:', error);
    }
  };

  const handleCancel = () => {
    if (contactUsData) {
      setEmail(contactUsData.email || '');
      const fullPhone = contactUsData.phone_number_key 
        ? `${contactUsData.phone_number_key}${contactUsData.phone_number}`
        : contactUsData.phone_number;
      setPhoneNumber(fullPhone || '');
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="mt-2 text-gray-600">
            Manage contact information for customer inquiries.
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription className='mt-1'>
                Email address and phone number for customer support.
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading contact information...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                ) : (
                  <div className="flex h-9 w-full rounded-md border border-input bg-gray-50 px-3 py-1 text-sm items-center">
                    {contactUsData?.email || 'No email set'}
                  </div>
                )}
              </div>

              {/* Phone Number Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={phoneNumber}
                    onChange={(value) => setPhoneNumber(value || '')}
                    className="flex h-9 w-full rounded-md border border-input hover:border-primary focus:border-primary bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  />
                ) : (
                  <div className="flex h-9 w-full rounded-md border border-input bg-gray-50 px-3 py-1 text-sm items-center">
                    {contactUsData?.phone_number_key && contactUsData?.phone_number
                      ? `${contactUsData.phone_number_key} ${contactUsData.phone_number}`
                      : contactUsData?.phone_number || 'No phone number set'}
                  </div>
                )}
              </div>

              {/* Action Buttons (only shown in edit mode) */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateMutation.isPending}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}