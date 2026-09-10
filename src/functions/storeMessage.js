const { app, output } = require('@azure/functions');

const messagesTable = output.table({
  tableName: 'Messages',
  connection: 'AzureWebJobsStorage'
});

app.storageQueue('storeMessage', {
  queueName: 'tp-messages',
  connection: 'AzureWebJobsStorage',
  extraOutputs: [messagesTable],
  handler: async (message, context) => {
    const event = typeof message === 'string' ? JSON.parse(message) : message;
    if (!event?.id || typeof event.message !== 'string' || !event.createdAt) {
      throw new Error('Le message doit contenir id, message et createdAt.');
    }

    context.extraOutputs.set(messagesTable, {
      PartitionKey: 'messages',
      RowKey: event.id,
      message: event.message,
      createdAt: event.createdAt
    });
    context.log(`Message ${event.id} transmis au binding Table Storage.`);
  }
});
