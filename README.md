# MedFlow
# 1/ Backend (NestJS + Prisma + PostgreSQL)
# 1️⃣ Aller dans le dossier backend
cd backend

# 2️⃣ Installer les dépendances
npm install

# 3️⃣ Créer le fichier .env
echo DATABASE_URL="postgresql://postgres:motdepasse@localhost:5432/medflow?schema=public" > .env
echo JWT_SECRET="SECRET_KEY" >> .env
echo PORT=3000 >> .env

# 4️⃣ Générer et migrer la base de données
npx prisma migrate dev --name init
npx prisma generate

# 5️⃣ Lancer le serveur backend
npm run start:dev

# 2/ Frontend (React + Vite + TailwindCSS)
# 1️⃣ Aller dans le dossier frontend
cd ../frontend

# 2️⃣ Installer les dépendances
npm install

# 3️⃣ Créer le fichier .env
echo REACT_APP_API_URL=http://localhost:3000 > .env

# 4️⃣ Lancer l'application React
npm start

# 3/ Vérification rapide

 Backend → http://localhost:3000

Frontend → http://localhost:5173

Prisma Studio → npx prisma studio
