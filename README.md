# TP 1 — Azure Functions avec Node.js

Application événementielle exécutée exclusivement en local, sans compte Azure.

```text
POST /api/messages → submitMessage → Queue tp-messages
```

## Prérequis

- Node.js 22 (`nvm use` si NVM est installé).
- VS Code avec Azure Functions, Azure Tools et Azurite (voir les recommandations du projet).
- Core Tools 4 et Azurite sont installés comme dépendances de développement par `npm ci`.

## Installation et démarrage

Depuis ce dossier :

```sh
nvm use
npm ci
cp local.settings.example.json local.settings.json
npx func --version
```

Dans un premier terminal :

```sh
nvm use
npm run storage
```

Azurite doit annoncer l'écoute sur `127.0.0.1:10000` (Blob), `10001` (Queue) et `10002` (Table). Ne pas lancer simultanément l'instance de l'extension VS Code sur ces ports.

Dans un deuxième terminal :

```sh
nvm use
npm start
```

Le runtime doit lister `submitMessage` (HTTP). Le premier démarrage télécharge le bundle d'extensions Microsoft et nécessite Internet ; les requêtes et données du TP restent locales.

## Étape 1 — HTTP Trigger

```sh
curl -i http://localhost:7071/api/messages \
  -H 'Content-Type: application/json' \
  -d '{"message":"Bonjour depuis le TP Azure !"}'
```

Réponse attendue : HTTP `202` et `{"id":"…","status":"queued"}`. Un JSON invalide, un message vide ou dépassant 10 000 caractères produit une réponse `400`.

La fonction `src/functions/submitMessage.js` est stateless : chaque requête produit un événement contenant un identifiant UUID, le texte et une date. Le binding `output.storageQueue` transmet cet événement à `tp-messages`. Une réponse `202` indique l'acceptation dans la queue. Les messages restent dans la queue pour cette étape.

Le stockage utilise `UseDevelopmentStorage=true`. Les données Azurite sont conservées dans `.azurite/`.

Arrêter les services avec `Ctrl+C` dans leurs terminaux respectifs. `local.settings.json`, `node_modules/` et `.azurite/` sont exclus de Git.

## Références

- [Azure Functions — modèle Node.js v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node)
- [Azurite — stockage Azure local](https://learn.microsoft.com/fr-fr/azure/storage/common/storage-use-azurite)
