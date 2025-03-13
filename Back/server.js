const express = require("express");
const cors = require('cors');
const amqp = require("amqplib");
const MessageTranslator = require("./MessageTranslator");
const ContentBasedRouter = require("./ContentBasedRouter"); // Import de la classe
const Aggregator = require("./Aggregator");

const app = express();
app.use(express.json());
app.use(express.text({ type: "application/xml" })); // Gérer les requêtes XML

// Autoriser uniquement localhost:4200
app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

const EXCHANGE = "order_exchange";
const WAREHOUSES = {
    BVA1: "warehouse_boves",
    CDG7: "warehouse_senlis",
    LIL1: "warehouse_lauwin_planque",
    LYS1: "warehouse_sevrey",
    MRS1: "warehouse_montelimar",
    ORY1: "warehouse_saran",
    ORY4: "warehouse_bretigny_sur_orge",
    ETZ2: "warehouse_augny"
  };  

let channel, connection, router, aggregator;

const RETRY_INTERVAL = 5000; // 5 secondes
const MAX_RETRIES = 10; // Nombre maximal de tentatives

async function setupRabbitMQ() {
    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            connection = await amqp.connect("amqp://rabbitmq");
            channel = await connection.createChannel();

            // Initialisation du Content-Based Router
            router = new ContentBasedRouter(channel, EXCHANGE, WAREHOUSES);
            await router.setupQueues();

            // Initialisation de l'agrégateur
            aggregator = new Aggregator(channel, WAREHOUSES);
            console.log("Connexion à RabbitMQ établie avec succès.");
            break;
        } catch (error) {
            retries++;
            console.error(`Erreur lors de la connexion à RabbitMQ (tentative ${retries} de ${MAX_RETRIES}) :`, error);
            if (retries < MAX_RETRIES) {
                console.log(`Nouvelle tentative dans ${RETRY_INTERVAL / 1000} secondes...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
            } else {
                console.error("Impossible de se connecter à RabbitMQ après plusieurs tentatives.");
                throw error; 
            }
        }
    }
}

// Message Translator
app.post("/order", async (req, res) => {
    try {
        const order = await MessageTranslator.translate(req.body, req.get("Content-Type"));
        res.json({ message: "Commande transformée.", order });
    } catch (error) {
        console.error("Erreur lors de la transformation de la commande :", error);
        res.status(400).json({ error: error.message });
    }
});

// Content-Based Router
app.post("/send", async (req, res) => {
    try {
        await router.routeOrder(req.body);
        res.json({ message: "Commande envoyée et en traitement." });
    } catch (error) {
        console.error("Erreur lors de l'envoi de la commande :", error);
        res.status(400).json({ error: error.message });
    }
});

// Aggregator
app.get("/aggregate", async (req, res) => {
    try {
        const orders = await aggregator.aggregateOrders();
        res.json({ aggregatedOrders: orders });
    } catch (error) {
        console.error("Erreur lors de l'agrégation des commandes :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

app.get("/aggregate/:warehouse", async (req, res) => {
    try {
        const warehouse = req.params.warehouse.toUpperCase();
        
        const orders = await aggregator.aggregateOrdersFromWareHouse(warehouse);
        res.json({ aggregatedOrders: orders });
    } catch (error) {
        console.error("Erreur lors de l'agrégation des commandes :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

app.get("/read/:warehouse", async (req, res) => {
    const warehouse = req.params.warehouse.toUpperCase();
    
    if (!WAREHOUSES[warehouse]) {
        return res.status(400).json({ error: "Entrepôt invalide." });
    }

    try {
        const messages = [];
        let message;

        // Récupérer tous les messages en boucle jusqu'à ce que la file soit vide
        while ((message = await channel.get(WAREHOUSES[warehouse], { noAck: true })) !== false) {
            messages.push(message.content.toString());
        }

        // Envoyer les messages
        for (let message of messages) {
            await channel.publish(EXCHANGE, warehouse, Buffer.from(message));
        }

        res.json({ messages: messages.length > 0 ? messages : "Aucun message disponible." });
    } catch (error) {
        console.error("Erreur lors de la lecture des messages :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});


// Start server
setupRabbitMQ().then(() => {
    app.listen(3000, () => console.log("Serveur en écoute sur le port 3000"));
}).catch(console.error);
