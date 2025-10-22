/**
 * @module imagesAPI
 * @description Image Management API functions
 */

import { supabase } from './supabaseClientIsolated.js';

/**
 * Check if Supabase is configured and available
 * @returns {boolean} True if Supabase is available
 */
const isSupabaseAvailable = () => {
  if (!supabase) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase not configured. Some features may not work.');
    }
    return false;
  }
  return true;
};

export const imagesAPI = {
  /**
   * Upload an image to Supabase Storage
   */
  async uploadImage(file, fileName) {
    try {
      if (!isSupabaseAvailable() || !file || !fileName) {
        return null;
      }

      const { data, error } = await supabase.storage
        .from('cat-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      return null;
    }
  },

  /**
   * Get public URL for an image
   */
  getImageUrl(fileName) {
    if (!isSupabaseAvailable() || !fileName) {
      return null;
    }

    const { data } = supabase.storage
      .from('cat-images')
      .getPublicUrl(fileName);

    return data?.publicUrl || null;
  }
};
