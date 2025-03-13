const amqp = require("amqplib");

class Aggregator {
    constructor(channel, warehouses) {
        this.channel = channel;
        this.warehouses = warehouses;
    }

    async aggregateOrders() {
        try {
            const aggregatedOrders = [];
            
            for (let wh in this.warehouses) {
                let messages = await this.channel.get(this.warehouses[wh]);
                while (messages) {
                    aggregatedOrders.push(JSON.parse(messages.content.toString()));
                    this.channel.ack(messages);
                    messages = await this.channel.get(this.warehouses[wh]);
                }
            }
            
            return aggregatedOrders;
        } catch (error) {
            console.error("Erreur lors de l'agrégation des commandes :", error);
            throw new Error("Erreur interne du serveur");
        }
    }

    async aggregateOrdersFromWareHouse(wh) {
        try {
            const aggregatedOrders = [];
            
            let messages = await this.channel.get(this.warehouses[wh]);
            while (messages) {
                aggregatedOrders.push(JSON.parse(messages.content.toString()));
                this.channel.ack(messages);
                messages = await this.channel.get(this.warehouses[wh]);
            }
            
            return aggregatedOrders;
        } catch (error) {
            console.error("Erreur lors de l'agrégation des commandes :", error);
            throw new Error("Erreur interne du serveur");
        }
    }
}

module.exports = Aggregator;
