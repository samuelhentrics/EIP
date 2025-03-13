Ce projet montre l'utilisation de trois Enterprise Integration Patterns (EIP) dans un système de traitement de commandes (Order Processing System).  
L'objectif est de simuler un processus de traitement des commandes en appliquant des concepts de Message Routing et de Transformation des messages.  

# EIPs utilisés
## 1. Message Translator (Traducteur de Message)
Le Message Translator est responsable de la transformation du format ou du contenu des messages pour qu'ils puissent être compris et traités par d'autres systèmes ou services.
Dans ce projet, il est utilisé pour adapter le format d'entrée des commandes à un format commun, facilitant ainsi leur traitement ultérieur.

## 2. Content-Based Router (Routeur Basé sur le Contenu)
Le Content-Based Router analyse le contenu des messages entrants pour déterminer la manière dont ils doivent être routés.
Ici, selon l'endroit où le produit est disponible (simulation), le routeur dirige la commande vers l'entrepôt approprié.

## 3. Aggregator (Agrégateur)
L'Aggregator combine plusieurs messages ou fragments de données en un seul message.
Dans le cadre du traitement des commandes, il va permettre d'obtenir tous les messages du Content-Based Router d'un entrepôt pour obtenir la liste de ce qu'ils ont à faire

# Objectif
Ce projet simule un système de traitement de commandes où :
- Les commandes entrantes sont transformées en un format commun.
- Elles sont routées vers différents entrepôts en fonction de leur contenu.
- On agrège les commandes d'un entrepôt pour obtenir la liste de ce qu'il y a à faire

# Architecture
Le projet est composé de deux parties :
- Front-end : une application Angular qui permet à l'utilisateur de soumettre des commandes.
- Back-end : une API Node.js qui gère la logique du traitement des commandes, y compris l'implémentation des EIPs.
- 
L'application utilise Docker Compose pour orchestrer les services, facilitant ainsi la gestion des conteneurs Docker pour le front-end, le back-end et RabbitMQ.

# Technologies utilisées
- Node.js : pour le front-end (Angular) et le back-end (API).
- amqplib : pour implémenter les patterns EIP et gérer les flux de données.
- RabbitMQ : pour la communication asynchrone entre les différents composants.
- Docker Compose : pour gérer les services Docker.

# Installation
Clonez ce dépôt.
```bash
git clone https://github.com/samuelhentrics/EIP.git
cd EIP
```
Construisez et démarrez les services avec Docker Compose.
```bash
docker-compose up
```
Le front-end (Angular) sera accessible sur http://localhost:3000.
Le back-end (API Node.js) sera accessible sur http://localhost:8080.
RabbitMQ sera disponible à http://localhost:15672.

# Utilisation
Accédez à l'application Angular dans votre navigateur.
Observez comment la commande est transformée, routée et agrégée en utilisant les différents EIPs.
