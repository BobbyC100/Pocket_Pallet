/**
 * Utility for streaming server-sent events from API routes
 */

export interface StreamEvent {
  type: 'step_start' | 'step_complete' | 'step_error' | 'progress' | 'complete' | 'error';
  step?: string;
  message?: string;
  data?: any;
  progress?: number;
  duration?: number;
}

/**
 * Creates a TransformStream encoder for server-sent events
 */
export function createSSETransformer() {
  return new TransformStream({
    transform(chunk: StreamEvent, controller) {
      const data = `data: ${JSON.stringify(chunk)}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));
    },
  });
}

/**
 * Creates a Response with streaming headers
 */
export function createStreamResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Client-side hook to consume SSE streams
 */
export async function* consumeSSEStream(response: Response): AsyncGenerator<StreamEvent> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      
      // Split on double newline (SSE message boundary)
      const lines = buffer.split('\n\n');
      
      // Keep the last incomplete message in buffer
      buffer = lines.pop() || '';
      
      // Process complete messages
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6); // Remove 'data: ' prefix
          try {
            yield JSON.parse(data) as StreamEvent;
          } catch (e) {
            console.error('Failed to parse SSE message:', data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Helper to send a stream event
 */
export function sendStreamEvent(writer: WritableStreamDefaultWriter, event: StreamEvent) {
  return writer.write(event);
}

