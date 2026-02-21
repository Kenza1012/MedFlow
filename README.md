# MedFlow
# 1/ Backend (NestJS + Prisma + PostgreSQL)
# 1️⃣ Aller dans le dossier backend
cd backend

# 2️⃣ Installer les dépendances
npm install

# 3️⃣ Créer le fichier .env
DATABASE_URL="postgresql://postgres:motdepasse@localhost:5432/medflow?schema=public" 
JWT_SECRET="SECRET_KEY" 
PORT=3000
FRONTEND_URL=http://localhost:5173

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
Ajouter les dépendances nécessaires

Ces paquets vont te servir pour la navigation, les appels API et le design :
npm install react-router-dom

npm install axios react-router-dom

npm install bootstrap


Optionnel (si tu veux utiliser Tailwind) :

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3️⃣ Créer le fichier .env
VITE_API_URL=http://localhost:3000

# 4️⃣ Lancer l'application React
npm run dev

# 3/ Vérification rapide

 Backend → http://localhost:3000

Frontend → http://localhost:5173

Prisma Studio → npx prisma studio
