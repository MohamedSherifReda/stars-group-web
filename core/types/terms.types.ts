export interface Terms {
  terms?: string;
  policy?: string;
  terms_id_terms_translations?: TermsIdTermsTranslation[];
  updated_at?: string;
  created_at?: string;
  deleted_at?: string;
}

export interface TermsIdTermsTranslation {
  terms?: string;
  policy?: string;
  language?: string;
}
