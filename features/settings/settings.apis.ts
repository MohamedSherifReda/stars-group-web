import api from '@utils/api';
import type { ApiResponse } from 'core/types/api.types';

export type FeedbackVisibilityKey =
  | 'feedback_button_chat_visibility'
  | 'feedback_button_home_visibility';

export interface UIConfigToggleItem {
  value: boolean;
  keyname: FeedbackVisibilityKey;
  value_type: 'checkbox' | string;
}

export interface UIConfigTextItem {
  value: string;
  value_type: 'text' | string;
}

export interface FeedbackUIConfig {
  feedback_button_chat_visibility: UIConfigToggleItem;
  feedback_button_home_visibility: UIConfigToggleItem;
  feedback_url?: UIConfigTextItem;
}

export interface FeedbackUIConfigUpdatePayload {
  feedback_button_chat_visibility: boolean;
  feedback_button_home_visibility: boolean;
  feedback_url?: string | null;
}

export const settingsApi = {
  getUserProfileUIConfig: () =>
    api.get<ApiResponse<FeedbackUIConfig>>('/users/profile/ui-config'),

  updateUserProfileUIConfig: (payload: FeedbackUIConfigUpdatePayload) =>
    api.patch<ApiResponse<FeedbackUIConfig>>(
      '/users/profile/ui-config',
      payload
    ),
};


