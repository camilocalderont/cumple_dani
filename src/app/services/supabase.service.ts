import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private retryCount = 3;
  private retryDelay = 1000; // 1 second

  constructor() {
    const supabaseUrl = (window as any).env?.VITE_SUPABASE_URL;
    const supabaseKey = (window as any).env?.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    });
  }

  private async retry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < this.retryCount; i++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        if (error?.isAcquireTimeout) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          continue;
        }
        throw error;
      }
    }
    
    throw lastError;
  }

  async checkExistingRegistration(deviceId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('party_registrations')
      .select('id')
      .eq('device_id', deviceId)
      .single();

    if (error) {
      console.error('Error checking registration:', error);
      return false;
    }

    return !!data;
  }

  async saveRegistration(adultCount: number, children: string[], deviceId: string) {
    return this.retry(async () => {
      try {
        // Check if registration already exists
        const exists = await this.checkExistingRegistration(deviceId);
        if (exists) {
          throw new Error('Ya existe un registro para este dispositivo');
        }

        const { data: registration, error: regError } = await this.supabase
          .from('party_registrations')
          .insert([{ 
            adult_count: adultCount,
            device_id: deviceId
          }])
          .select()
          .single();

        if (regError) throw regError;

        if (!registration) {
          throw new Error('No registration data returned');
        }

        const childrenData = children.map(name => ({
          registration_id: registration.id,
          name
        }));

        const { error: childError } = await this.supabase
          .from('children')
          .insert(childrenData);

        if (childError) throw childError;

        return registration;
      } catch (error) {
        console.error('Error saving registration:', error);
        throw error;
      }
    });
  }
}