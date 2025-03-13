class ContentBasedRouter {
    constructor(channel, exchange, warehouses, defaultWarehouse = "warehouse_default") {
        this.channel = channel;
        this.exchange = exchange;
        this.warehouses = warehouses;
        this.defaultWarehouse = defaultWarehouse;
    }

    async setupQueues() {
        try {
            // Déclarer un échange de type "direct"
            await this.channel.assertExchange(this.exchange, "direct", { durable: false });

            // Déclarer les files d’attente des entrepôts et les lier à l'échange
            for (let warehouse in this.warehouses) {
                await this.channel.assertQueue(this.warehouses[warehouse], { durable: false });
                await this.channel.bindQueue(this.warehouses[warehouse], this.exchange, warehouse);
            }

            // File d’attente par défaut
            await this.channel.assertQueue(this.defaultWarehouse, { durable: false });
            await this.channel.bindQueue(this.defaultWarehouse, this.exchange, "default");

            console.log("Content-Based Router initialisé avec succès.");
        } catch (error) {
            console.error("Erreur lors de la configuration du Content-Based Router :", error);
        }
    }

    async routeOrder(order) {
        const routingKey = this.warehouses[order.warehouse] ? order.warehouse : "default";
        this.channel.publish(this.exchange, routingKey, Buffer.from(JSON.stringify(order)));
        console.log(`Commande routée avec la clé '${routingKey}':`, order);
    }
}

module.exports = ContentBasedRouter;

