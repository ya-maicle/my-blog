import {createClient} from '@sanity/client'

/**
 * Sanity client configured for this project.
 * If you make your dataset private, you will need to add a token here via environment variables.
 * See: https://www.sanity.io/docs/js-client
 */
export const client = createClient({
  projectId: 'ubv6h649',
  dataset: 'production',
  apiVersion: '2025-08-08', // use a date string
  useCdn: true, // `false` if you want to ensure fresh data
})

export default client
