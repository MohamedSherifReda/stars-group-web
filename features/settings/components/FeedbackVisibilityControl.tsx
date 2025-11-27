import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Toggle } from '~/components/ui/toggle';
import { Button } from '@ui/common/button';
import { Label } from '@ui/common/label';
import { Input } from '@ui/common/input';
import { Skeleton } from '@ui/common/skeleton';
import { settingsApi } from '@features/settings/settings.apis';
import type { FeedbackUIConfigUpdatePayload } from '@features/settings/settings.apis';
import toast from 'react-hot-toast';
import { useAuthStore } from 'infrastructure/store/auth';

const FeedbackVisibilityControl: React.FC = () => {
  const queryClient = useQueryClient();
  const { getUserRole } = useAuthStore();
  const isAdmin = useMemo(() => getUserRole() === 'admin', [getUserRole]);

  const [chatVisible, setChatVisible] = useState(false);
  const [homeVisible, setHomeVisible] = useState(false);
  const [feedbackFormUrl, setFeedbackFormUrl] = useState('');

  const {
    data: configResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user-profile-ui-config'],
    queryFn: () => settingsApi.getUserProfileUIConfig().then((res) => res.data),
  });

  useEffect(() => {
    if (configResponse?.data) {
      setChatVisible(
        !!configResponse.data.feedback_button_chat_visibility?.value
      );
      setHomeVisible(
        !!configResponse.data.feedback_button_home_visibility?.value
      );
      if (configResponse.data.feedback_url?.value) {
        setFeedbackFormUrl(configResponse.data.feedback_url.value);
      }
    }
  }, [configResponse]);

  const updateMutation = useMutation({
    mutationFn: (payload: FeedbackUIConfigUpdatePayload) =>
      settingsApi.updateUserProfileUIConfig(payload),
    onSuccess: () => {
      toast.success('Feedback visibility updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['user-profile-ui-config'],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          'Failed to update feedback visibility settings'
      );
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: FeedbackUIConfigUpdatePayload = {
      feedback_button_chat_visibility: chatVisible,
      feedback_button_home_visibility: homeVisible,
      feedback_url: feedbackFormUrl || null,
    };

    updateMutation.mutate(payload);
  };

  const isDisabled =
    !isAdmin || isLoading || updateMutation.isPending || isError;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              User Feedback Settings
            </h1>
            <p className="text-sm text-gray-500">
              Control where the user feedback button appears in the mobile app
              and configure the feedback form URL.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : isError ? (
            <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              Failed to load feedback visibility settings. Please try again
              later.
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-900">
                      Feedback button on user profile
                    </Label>
                    <p className="text-xs text-gray-500 mt-1 max-w-md">
                      When enabled, a feedback button will appear on the user
                      profile page inside the mobile app.
                    </p>
                  </div>
                  <Toggle
                    pressed={chatVisible}
                    onPressedChange={setChatVisible}
                    disabled={isDisabled}
                    aria-label="Toggle user profile feedback button visibility"
                  >
                    {chatVisible ? 'Visible' : 'Hidden'}
                  </Toggle>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-900">
                      Feedback button on home page
                    </Label>
                    <p className="text-xs text-gray-500 mt-1 max-w-md">
                      When enabled, a feedback button will appear on the home
                      screen of the mobile app.
                    </p>
                  </div>
                  <Toggle
                    pressed={homeVisible}
                    onPressedChange={setHomeVisible}
                    disabled={isDisabled}
                    aria-label="Toggle home page feedback button visibility"
                  >
                    {homeVisible ? 'Visible' : 'Hidden'}
                  </Toggle>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="feedback-form-url"
                  className="text-sm font-medium text-gray-900"
                >
                  Feedback form URL
                </Label>
                <Input
                  id="feedback-form-url"
                  type="url"
                  placeholder="https://your-form-url.com"
                  value={feedbackFormUrl}
                  onChange={(e) => setFeedbackFormUrl(e.target.value)}
                  disabled={isDisabled}
                />
                <p className="text-xs text-gray-500">
                  This URL will be used in the mobile app to open the form that
                  collects user feedback. It is stored in the backend as part of
                  the user profile UI configuration.
                </p>
              </div>

              {!isAdmin && (
                <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
                  You do not have permission to change feedback visibility
                  settings. Contact an administrator if you need access.
                </p>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isDisabled}>
                  {updateMutation.isPending ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackVisibilityControl;