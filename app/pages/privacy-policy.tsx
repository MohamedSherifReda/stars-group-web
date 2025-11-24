import { termsAPI } from '@features/terms/Terms.api';
import { usePathname } from '@hooks/usePathname';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@ui/common/button';
import { Skeleton } from '@ui/common/skeleton';
import TextEditor from '@ui/common/TextEditor';
import DateFormatter from '@utils/dateFormatter';
import { queryClient } from '@utils/queryClient';
import type { Terms } from 'core/types/terms.types';
import { useAuthStore } from 'infrastructure/store/auth';
import { Edit, Save } from 'lucide-react';
import React, { Suspense, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const PrivacyPolicy = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { getUserRole } = useAuthStore();
  const pathName = usePathname();
  const editorRef = useRef(null);
  const isAdmin = getUserRole() === 'admin';
  const { data: privacyPolicy, isLoading: isLoadingPrivacyPolicy } = useQuery({
    queryKey: ['privacyPolicy'],
    queryFn: () =>
      termsAPI.getTerms().then((res) => {
        return res.data;
      }),
  });
  const updatePrivacyPolicyMutation = useMutation({
    mutationFn: (privacyPolicy: Terms) => termsAPI.updateTerms(privacyPolicy),
    onSuccess: () => {
      toast.success('Privacy policy updated successfully');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['privacyPolicy'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to update privacy policy'
      );
    },
  });

  function onSaveHandler() {
    if (editorRef.current) {
      updatePrivacyPolicyMutation.mutate({
        policy: (editorRef.current as any).getContent() as string,
        terms: privacyPolicy?.data[0]?.terms || ' ',
      });
    }
  }
  if (isLoadingPrivacyPolicy) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        <div className="flex justify-end mb-4">
          {isAdmin && pathName === '/settings' && (
            <Button
              disabled={
                isLoadingPrivacyPolicy || updatePrivacyPolicyMutation.isPending
              }
              onClick={() => {
                if (!isEditing) {
                  setIsEditing(true);
                }
                if (isEditing) {
                  onSaveHandler();
                }
              }}
            >
              {isEditing ? (
                <Save className="w-4 h-4 mr-2" />
              ) : (
                <Edit className="w-4 h-4 mr-2" />
              )}
              {isEditing
                ? 'Save'
                : updatePrivacyPolicyMutation.isPending
                ? 'Saving...'
                : 'Edit'}
            </Button>
          )}
        </div>
        {isEditing ? (
          <TextEditor
            ref={editorRef}
            initialValue={privacyPolicy?.data[0]?.policy as string}
          />
        ) : (
          <main className="p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Privacy Policy
              </h1>

              <div className="space-y-6 text-gray-700">
                <section>
                  <p className="text-sm text-gray-500 mb-4">
                    <strong>Last Updated:</strong>{' '}
                    {DateFormatter.formatDate(
                      privacyPolicy?.data[0]?.updated_at as string
                    )}
                  </p>
                  <Suspense fallback={<Skeleton className="w-full h-full" />}>
                    <div>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: privacyPolicy?.data[0]?.policy as string,
                        }}
                      />
                    </div>
                  </Suspense>
                </section>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
