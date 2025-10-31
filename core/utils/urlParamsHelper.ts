class UrlParamsHelper {
  /**
   * Get current URL search parameters
   */
  private getSearchParams(): URLSearchParams {
    if (typeof window === 'undefined') {
      return new URLSearchParams();
    }
    return new URLSearchParams(window.location.search);
  }

  /**
   * Update the browser URL with new parameters
   */
  private updateBrowserUrl(params: URLSearchParams, replace = false): void {
    if (typeof window === 'undefined') return;

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (replace) {
      window.history.replaceState(null, '', newUrl);
    } else {
      window.history.pushState(null, '', newUrl);
    }

    // Dispatch event to notify listeners about URL change
    window.dispatchEvent(new Event('popstate'));
  }

  /**
   * Get all URL parameters as an object
   */
  getAll(): Record<string, string> {
    const params: Record<string, string> = {};
    this.getSearchParams().forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  /**
   * Get a specific URL parameter value
   * @param key - The parameter key
   * @param defaultValue - Default value if not found
   */
  get(key: string, defaultValue?: string): string | undefined {
    return this.getSearchParams().get(key) ?? defaultValue;
  }

  /**
   * Get a specific URL parameter as number
   * @param key - The parameter key
   * @param defaultValue - Default value if not found
   */
  getNumber(key: string, defaultValue?: number): number | undefined {
    const value = this.getSearchParams().get(key);
    return value ? Number(value) : defaultValue;
  }

  /**
   * Get a specific URL parameter as boolean
   * @param key - The parameter key
   * @param defaultValue - Default value if not found
   */
  getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
    const value = this.getSearchParams().get(key);
    if (value === 'true') return true;
    if (value === 'false') return false;
    return defaultValue;
  }

  /**
   * Check if a parameter exists
   * @param key - The parameter key to check
   */
  has(key: string): boolean {
    return this.getSearchParams().has(key);
  }

  /**
   * Update URL parameters
   * @param params - Object with parameters to update
   * @param replace - Replace history entry instead of adding new one
   */
  update(
    params: Record<string, string | number | boolean | null | undefined>,
    replace = false
  ): void {
    const newParams = new URLSearchParams(this.getSearchParams());

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });

    this.updateBrowserUrl(newParams, replace);
  }

  /**
   * Remove one or more URL parameters
   * @param keys - Single key or array of keys to remove
   * @param replace - Replace history entry instead of adding new one
   */
  remove(keys: string | string[], replace = false): void {
    const keysToRemove = Array.isArray(keys) ? keys : [keys];
    const newParams = new URLSearchParams(this.getSearchParams());

    keysToRemove.forEach((key) => {
      newParams.delete(key);
    });

    this.updateBrowserUrl(newParams, replace);
  }

  /**
   * Clear all URL parameters
   * @param replace - Replace history entry instead of adding new one
   */
  clearAll(replace = false): void {
    this.updateBrowserUrl(new URLSearchParams(), replace);
  }
}

// Singleton instance that can be used throughout the app
export const urlParamsHelper = new UrlParamsHelper();
