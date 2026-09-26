import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// The calendar lives at "/"; this keeps old spike links working.
export const load: PageServerLoad = () => {
  redirect(308, '/');
};
