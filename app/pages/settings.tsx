import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import TermsAndConditions from './terms-conditions';
import PrivacyPolicy from './privacy-policy';
import ChangePasswordForm from '@features/settings/components/ChangePasswordForm';
import FeedbackVisibilityControl from '@features/settings/components/FeedbackVisibilityControl';
const SettingsPage = () => {
  
  return (
    <div>
      <Tabs defaultValue="terms_and_conditions" className="w-full">
        <TabsList>
          <TabsTrigger value="terms_and_conditions">
            Terms and Conditions
          </TabsTrigger>
          <TabsTrigger value="privacy_policy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="user_feedback">User Feedback</TabsTrigger>
          <TabsTrigger value="my_account">My Account</TabsTrigger>
        </TabsList>
        <TabsContent className="w-full" value="terms_and_conditions">
          <TermsAndConditions />
        </TabsContent>
        <TabsContent value="privacy_policy">
          <PrivacyPolicy />
        </TabsContent>
        <TabsContent value="user_feedback">
          <FeedbackVisibilityControl />
        </TabsContent>
        <TabsContent value="my_account">
          <ChangePasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage