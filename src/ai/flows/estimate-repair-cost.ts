'use server';

/**
 * @fileOverview Estimates the repair cost for a given repair request.
 *
 * - estimateRepairCost - A function that estimates the repair cost.
 * - EstimateRepairCostInput - The input type for the estimateRepairCost function.
 * - EstimateRepairCostOutput - The return type for the estimateRepairCost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateRepairCostInputSchema = z.object({
  requestType: z
    .string()
    .describe('The type of repair request (e.g., plumbing, electrical, carpentry).'),
  description: z.string().describe('A detailed description of the repair needed.'),
  location: z.string().describe('The location where the repair is needed (city, state).'),
  urgency: z
    .string()
    .describe(
      'The urgency of the request (e.g., emergency, within 24 hours, within a week).' + //
        '     Considerations: request is urgent if it requires immediate attention' + //
        '     and may cause further damage if left unaddressed.'
    ),
  imageUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of the issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type EstimateRepairCostInput = z.infer<typeof EstimateRepairCostInputSchema>;

const EstimateRepairCostOutputSchema = z.object({
  suggestedRate: z
    .number()
    .describe(
      'The suggested rate for the repair, in USD.  The rate should be a reasonable estimate ' +
        'given the request, including a description of the factors considered to determine the rate.'
    ),
  factors: z.string().describe('Factors considered when determining the rate.'),
});

export type EstimateRepairCostOutput = z.infer<typeof EstimateRepairCostOutputSchema>;

export async function estimateRepairCost(input: EstimateRepairCostInput): Promise<EstimateRepairCostOutput> {
  return estimateRepairCostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateRepairCostPrompt',
  input: {schema: EstimateRepairCostInputSchema},
  output: {schema: EstimateRepairCostOutputSchema},
  prompt: `You are an experienced repair cost estimator.

  Based on the homeowner's repair request, you will provide a suggested rate for the service.
  Consider the type of request, description, location, and urgency when determining the rate.

  The rate should be reasonable for the service requested. Explain the factors that influenced your estimate.

  Here are the details of the repair request:

  Type: {{{requestType}}}
  Description: {{{description}}}
  Location: {{{location}}}
  Urgency: {{{urgency}}}
  {{#if imageUri}}
  Image: {{media url=imageUri}}
  {{/if}}
  \n  Respond with a suggested rate and factors considered.
  `,
});

const estimateRepairCostFlow = ai.defineFlow(
  {
    name: 'estimateRepairCostFlow',
    inputSchema: EstimateRepairCostInputSchema,
    outputSchema: EstimateRepairCostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
