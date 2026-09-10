# TP 1 — Azure Functions avec Node.js

Application événementielle exécutée exclusivement en local, sans compte Azure.

```text
POST /api/messages → submitMessage → Queue tp-messages → storeMessage → Table Messages
```

## Prérequis

- Node.js 22 (`nvm use` si NVM est installé).
- VS Code avec Azure Functions, Azure Tools et Azurite (voir les recommandations du projet).
- Core Tools 4 et Azurite sont installés comme dépendances de développement par `npm ci`.

## Installation et démarrage

Récupérer le dépôt :

```sh
git clone https://github.com/Mahkalix/TP_Azure.git
cd TP_Azure
```

Puis installer les dépendances et préparer la configuration locale :

```sh
nvm use
npm ci
cp local.settings.example.json local.settings.json
npx func --version
```

`nvm use` est facultatif si Node.js 22 est déjà actif (`node --version`). Le fichier `local.settings.example.json` configure uniquement Azurite ; aucun compte Azure ni secret n’est nécessaire.

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

Le runtime doit lister `submitMessage` (HTTP) et `storeMessage` (Queue). Le premier démarrage télécharge le bundle d'extensions Microsoft et nécessite Internet ; les requêtes et données du TP restent locales.

## Étape 1 — HTTP Trigger

```sh
curl -i http://localhost:7071/api/messages \
  -H 'Content-Type: application/json' \
  -d '{"message":"Bonjour depuis le TP Azure !"}'
```

Réponse attendue : HTTP `202` et `{"id":"…","status":"queued"}`. Un JSON invalide, un message vide ou dépassant 10 000 caractères produit une réponse `400`.

La fonction `src/functions/submitMessage.js` est stateless : chaque requête produit un événement contenant un identifiant UUID, le texte et une date. Le binding `output.storageQueue` transmet cet événement à `tp-messages`. Une réponse `202` indique l'acceptation dans la queue. La fonction Queue Trigger traite ensuite les messages automatiquement.

Le stockage utilise `UseDevelopmentStorage=true`. Les données Azurite sont conservées dans `.azurite/`.

Arrêter les services avec `Ctrl+C` dans leurs terminaux respectifs. `local.settings.json`, `node_modules/` et `.azurite/` sont exclus de Git.

## Étape 2 — Queue Trigger et binding Table Storage

`src/functions/storeMessage.js` est déclenchée par l’arrivée d’un message dans `tp-messages` via `app.storageQueue`. Elle lit le contenu et utilise `output.table` avec `context.extraOutputs.set` pour écrire dans la table `Messages`. Le runtime gère l’écriture et la création de la table si nécessaire.

Les fonctions sont indépendantes : aucun import ni appel direct entre elles. Leur seul échange passe par la queue.

Chaque ligne contient `PartitionKey` (`messages`), `RowKey` (l’identifiant du message), `message` et `createdAt`.

Pour vérifier, envoie la requête `curl` ci-dessus : les logs doivent annoncer l’exécution réussie de `storeMessage`, et la table `Messages` doit contenir une ligne avec l’identifiant retourné par HTTP. Après traitement réussi, le message est retiré automatiquement de la queue : une queue vide est donc normale.

Le binding Table crée des entités ; il ne garantit pas une mise à jour si le même identifiant est rejoué. Les erreurs de traitement sont remontées au runtime pour ses nouvelles tentatives.

## Références

- [Azure Functions — modèle Node.js v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node)
- [Azurite — stockage Azure local](https://learn.microsoft.com/fr-fr/azure/storage/common/storage-use-azurite)
<<<<<<< HEAD
=======

>>>>>>> a6ea42dfe9462f405d9a0365f2869e5ba0f088d2
- [Binding de sortie Azure Tables](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-table-output)
