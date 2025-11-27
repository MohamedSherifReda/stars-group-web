import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import TermsAndConditions from './terms-conditions';
import PrivacyPolicy from './privacy-policy';
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
      </Tabs>
    </div>
  );
}

export default SettingsPage