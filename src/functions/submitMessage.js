const { app, output } = require('@azure/functions');
const { randomUUID } = require('node:crypto');

const messages = output.storageQueue({
  queueName: 'tp-messages',
  connection: 'AzureWebJobsStorage'
});

app.http('submitMessage', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'messages',
  extraOutputs: [messages],
  handler: async (request, context) => {
    let body;
    try {
      body = await request.json();
    } catch {
      return { status: 400, jsonBody: { error: 'Un corps JSON valide est requis.' } };
    }
    if (typeof body?.message !== 'string' || !body.message.trim() || body.message.length > 10000) {
      return { status: 400, jsonBody: { error: 'message doit être un texte non vide de 10 000 caractères maximum.' } };
    }
    const event = {
      id: randomUUID(),
      message: body.message.trim(),
      createdAt: new Date().toISOString()
    };
    context.extraOutputs.set(messages, event);
    return { status: 202, jsonBody: { id: event.id, status: 'queued' } };
  }
});
