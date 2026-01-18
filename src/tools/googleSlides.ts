import { google } from 'googleapis';
import { z } from 'zod';
import { billingGate } from '../middleware/costGate';
import { getGoogleAuth } from '@/lib/google';

// Schema for the Slides Storyboard
export const SlidesStoryboardSchema = z.object({
  title: z.string(),
  slides: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      speakerNotes: z.string().optional(),
    }),
  ),
});

export type SlidesStoryboard = z.infer<typeof SlidesStoryboardSchema>;

/**
 * Tool to create a Google Slides presentation from a storyboard.
 * Staging area for video generation.
 */
export async function createSlidesStoryboard(clerkId: string, storyboard: SlidesStoryboard) {
  // Use the refined billing gate
  await billingGate(clerkId, 'SLIDE_DECK');

  const auth = await getGoogleAuth(clerkId);
  const slides = google.slides({ version: 'v1', auth });

  // 3. Create a new presentation
  const presentation = await slides.presentations.create({
    requestBody: {
      title: storyboard.title,
    },
  });

  const presentationId = presentation.data.presentationId;
  if (!presentationId) throw new Error('Failed to create presentation');

  // 4. Batch update to add slides and content
  const requests: any[] = [];

  storyboard.slides.forEach((slide, index) => {
    const slideId = `slide_${index}`;
    const titleId = `title_${index}`;
    const bodyId = `body_${index}`;

    // Add a slide
    requests.push({
      createSlide: {
        objectId: slideId,
        insertionIndex: index,
        slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' },
        placeholderIdMappings: [
          { layoutPlaceholder: { type: 'TITLE', index: 0 }, objectId: titleId },
          { layoutPlaceholder: { type: 'BODY', index: 0 }, objectId: bodyId },
        ],
      },
    });

    // Insert Title text
    requests.push({
      insertText: {
        objectId: titleId,
        text: slide.title,
      },
    });

    // Insert Body text
    requests.push({
      insertText: {
        objectId: bodyId,
        text: slide.content,
      },
    });
  });

  await slides.presentations.batchUpdate({
    presentationId,
    requestBody: { requests },
  });

  return {
    presentationId,
    url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
  };
}
