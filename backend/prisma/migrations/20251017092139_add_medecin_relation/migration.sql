-- DropForeignKey
ALTER TABLE "public"."Medecin" DROP CONSTRAINT "Medecin_userId_fkey";

-- AddForeignKey
ALTER TABLE "Medecin" ADD CONSTRAINT "Medecin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
