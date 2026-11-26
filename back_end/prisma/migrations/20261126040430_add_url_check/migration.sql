-- CreateTable
CREATE TABLE "UrlCheck" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "isSafe" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "threatTypes" TEXT[],
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UrlCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UrlCheck_userId_checkedAt_idx" ON "UrlCheck"("userId", "checkedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UrlCheck_userId_url_key" ON "UrlCheck"("userId", "url");

-- AddForeignKey
ALTER TABLE "UrlCheck" ADD CONSTRAINT "UrlCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
