CREATE TABLE "MessageAttachment" (
    "messageId" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("messageId", "attachmentId"),
    CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MessageAttachment_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
