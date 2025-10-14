import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { supabase } from '@/lib/supabase';

export const server = {
  joinWaitlist: defineAction({
    input: z.object({
      email: z.string().email('Invalid email address'),
    }),
    handler: async ({ email }) => {
      try {
        const { error } = await supabase
          .from('hviz_waitlist')
          .insert([{ email }])
          .select();

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