export type { Review } from "./generate-reviews";
export { generateCustomerReviews } from "./generate-reviews";

import { generateCustomerReviews } from "./generate-reviews";

export const customerReviews = generateCustomerReviews(250);
