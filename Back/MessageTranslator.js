const xml2js = require("xml2js");

class MessageTranslator {
    static async translate(message, contentType) {
        if (contentType === "application/xml") {
            return this.xmlToJson(message);
        }
        if (contentType === "application/json") {
            return this.jsonToJson(message);
        }
        throw new Error("Unsupported message format.");
    }

    static async xmlToJson(xmlString) {
        return new Promise((resolve, reject) => {
            xml2js.parseString(xmlString, { explicitArray: false }, (err, result) => {
                if (err) reject(err);
                else resolve(this.standardizeOrder(result.order));
            });
        });
    }

    static jsonToJson(jsonMessage) {
        return this.standardizeOrder(jsonMessage);
    }

    static standardizeOrder(order) {
        if (!order.id || !order.customer || !order.product) {
            throw new Error("Commande invalide");
        }
        if(!order.warehouse){
            const warehouses = [
                "BVA1",
                "CDG7",
                "LIL1",
                "LYS1",
                "MRS1",
                "ORY1",
                "ORY4",
                "ETZ2"
            ];
            order.warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
            order.warehouse = order.warehouse.toUpperCase();
        }
        return {
            id: order.id,
            customer: order.customer,
            product: {
                name: order.product,
            },
            warehouse: order.warehouse.toUpperCase(),
        };
    }
}

module.exports = MessageTranslator;
