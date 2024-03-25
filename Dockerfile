# Utiliser une image de noeud officielle comme image parente
FROM node:latest as build-stage

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json (si disponible)
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install

# Copier les fichiers et dossiers du projet dans le répertoire de travail (./) du conteneur
COPY . .

# Construire l'application pour la production
RUN npm run build

# Etape de production
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/build/ /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
