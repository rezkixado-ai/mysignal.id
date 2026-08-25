import { json } from './_lib/db.js';
import { isAuthorized } from './_lib/auth.js';

export const handler = async (event) => {
  return json(200, { authorized: isAuthorized(event) });
};
