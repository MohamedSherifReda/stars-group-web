import { TERMS_QUERY_KEY, termsAPI, useTermsRow } from '@features/terms/Terms.api';
import { usePathname } from '@hooks/usePathname';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@ui/common/button';
import { Skeleton } from '@ui/common/skeleton';
import TextEditor, { getBoundedEditorContent } from '@ui/common/TextEditor';
import DateFormatter from '@utils/dateFormatter';
import { sanitizeRichText } from '@utils/sanitizeHtml';
import { queryClient } from '@utils/queryClient';
import type { Terms } from 'core/types/terms.types';
import { useIsAdmin } from 'infrastructure/store/auth';
import { Edit, Save } from 'lucide-react';
import React, { Suspense, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const PrivacyPolicy = () => {
  const [isEditing, setIsEditing] = useState(false);
  const pathName = usePathname();
  const editorRef = useRef(null);
  // Role comes from the server profile, not from storage
  const isAdmin = useIsAdmin();
  const {
    data: termsRow,
    isLoading: isLoadingPrivacyPolicy,
    isFetching: isFetchingPrivacyPolicy,
    refetch: refetchPrivacyPolicy,
  } = useTermsRow();
  const updatePrivacyPolicyMutation = useMutation({
    mutationFn: (privacyPolicy: Pick<Terms, 'policy'>) =>
      termsAPI.updateTerms(privacyPolicy),
    onSuccess: () => {
      toast.success('Privacy policy updated successfully');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: TERMS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to update privacy policy'
      );
    },
  });

  function onSaveHandler() {
    if (editorRef.current) {
      const html = getBoundedEditorContent(editorRef.current);
      if (html === null) return;
      // Send only the policy field; the terms are saved by their own page
      updatePrivacyPolicyMutation.mutate({ policy: html });
    }
  }
  // Load the latest row before editing so another admin's change isn't overwritten
  async function startEditing() {
    const result = await refetchPrivacyPolicy();
    if (result.isError) {
      toast.error('Failed to load the latest privacy policy');
      return;
    }
    setIsEditing(true);
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
                isLoadingPrivacyPolicy ||
                (!isEditing && isFetchingPrivacyPolicy) ||
                updatePrivacyPolicyMutation.isPending
              }
              onClick={() => {
                if (!isEditing) {
                  startEditing();
                } else {
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
            initialValue={termsRow?.policy as string}
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
                      termsRow?.updated_at as string
                    )}
                  </p>
                  <Suspense fallback={<Skeleton className="w-full h-full" />}>
                    <div>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: sanitizeRichText(termsRow?.policy),
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
