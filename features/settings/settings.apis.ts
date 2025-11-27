import api from '@utils/api';
import type { ApiResponse } from 'core/types/api.types';

export type FeedbackVisibilityKey =
  | 'feedback_button_chat_visibility'
  | 'feedback_button_home_visibility';

export interface UIConfigItem {
  value: boolean;
  keyname: FeedbackVisibilityKey;
  value_type: 'checkbox' | string;
}

export interface FeedbackUIConfig {
  feedback_button_chat_visibility: UIConfigItem;
  feedback_button_home_visibility: UIConfigItem;
}

export interface FeedbackUIConfigUpdatePayload {
  feedback_button_chat_visibility: boolean;
  feedback_button_home_visibility: boolean;
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


