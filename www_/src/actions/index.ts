import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getSupabaseClient } from '@/lib/supabase';

export const server = {
  joinWaitlist: defineAction({
    input: z.object({
      email: z.string().email('Invalid email address'),
    }),
    handler: async ({ email }) => {
      try {
        const { error } = await getSupabaseClient()
          .from('hviz_waitlist')
          .insert([{ email }])
          .select();

        if (error?.code === '23505') {
          return {
            success: false,
            message: 'Email already exists in the waitlist.'
          };
        }

        if (error) {
          console.error('Supabase error:', JSON.stringify(error, null, 2));
          console.error('Error details:', error.message, error.code, error.details);
          return {
            success: false,
            message: error.message
          };
        }

        return {
          success: true,
          message: 'Successfully joined the waitlist!'
        };
      } catch (error) {
        console.error('Error:', error);
        return {
          success: false,
          message: 'Something went wrong. Please try again.'
        };
      }
    }
  })
}