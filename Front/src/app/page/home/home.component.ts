import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { read } from 'fs';
import { compileDeclareClassMetadata } from '@angular/compiler';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  // faire une liste de produits
  productsSite = [
    {
      name: 'Product 1',
      description: 'Description du Product 1',
      price: 10,
      json: "<order><id>123</id><customer>Samiaule</customer><product>Product 1</product></order>"
    },
    {
      name: 'Product 2',
      description: 'Description du Product 2',
      price: 20,
      json: "<order><id>124</id><customer>Cédric</customer><product>Product 2</product></order>"
    },
    {
      name: 'Product 3',
      description: 'Description du Product 3',
      price: 30,
      json: "<order><id>125</id><customer>Salwa</customer><product>Product 3</product></order>"
    }
  ];

  productsApp = [
    {
      name: 'Product 1',
      description: 'Description du Product 1',
      price: 10,
      json: {
        id: 123,
        customer: "Corentin",
        product: "Product 1"
      }
    },
    {
      name: 'Product 2',
      description: 'Description du Product 2',
      price: 20,
      json: {
        id: 124,
        customer: "Paul",
        product: "Product 2"
      }
    },
    {
      name: 'Product 3',
      description: 'Description du Product 3',
      price: 20,
      json: {
        id: 124,
        customer: "Celian",
        product: "Product 3"
      }
    },
    {
      name: 'Product 4',
      description: 'Description du Product 4',
      price: 20,
      json: {
        id: 124,
        customer: "Vincent",
        product: "Product 4"
      },

    }
  ];

  // Produit choisi actuellement
  selectedProduct : any = {json: {}};

  // Les warehouses et leur contenu 
  warehouses: any = [
    {
      code: 'BVA1',
      name: 'Boves',
      address: '1 avenue du Superbe-Orénoque, 80440 Boves',
      orders: [],
      aggregateOrders: '',
    },
    {
      code: 'CDG7',
      name: 'Senlis',
      address: 'Parc d’activités des Portes de Senlis, 1 avenue Alain Boucher, 60452 Senlis',
      orders: [],
      aggregateOrders: '',
    },
    {
      code: 'LIL1',
      name: 'Lauwin-Planque',
      address: '1 rue Amazon, 59553 Lauwin-Planque',
      orders: [],
      aggregateOrders: '',
    },
    {
      code: 'LYS1',
      name: 'Sevrey',
      address: '1 Rue Amazon – ZAC du Parc d’Activité du Val de Bourgogne, 71100 Sevrey',
      orders: [],
      aggregateOrders: '',
    },
    {
      code: 'MRS1',
      name: 'Montélimar',
      address: 'Bâtiment II ZAC Les Portes de Provence, 26200 Montélimar',
      orders: [],
      aggregateOrders: '',
    },
    {
      code: 'ORY1',
      name: 'Saran',
      address: 'Pôle 45, 1401 rue du Champ Rouge, 45770 Saran',
      orders: [],
      aggregateOrders: '',
    },
    {
      code: 'ORY4',
      name: 'Brétigny-sur-Orge',
      address: '20 avenue du Centre d’Essais en Vol, 91220 Brétigny-sur-Orge',
      orders: [],
      aggregateOrders: '',
    },
    {
      code: 'ETZ2',
      name: 'Augny',
      address: '1 rue de la Croix de Lorraine, 57685 Augny',
      orders: [],
      aggregateOrders: '',
    }
  ];
  

  transformText: string = '';

  aggregatorString: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.updateWarehousesInfo();
  }

  // Fonction pour sélectionner un produit
  selectProduct(product: any) {
    this.selectedProduct = product;
  }

  getSelectedProduct(): string {
    return this.selectedProduct ? JSON.stringify(this.selectedProduct.json, null, 2) : '';
  }

  
  transform(): void {
    if (!this.selectedProduct || !this.selectedProduct.json) {
      console.error('Aucun produit sélectionné');
      return;
    }

    // Si json est un json ok sinon on dira que c'est un xml on est déjà normalement sur un format json 
    let isJson = true;

    if(typeof this.selectedProduct.json === 'string') {
      isJson = false;
    }

    if(isJson) {
    this.http.post('http://localhost:8080/order', this.selectedProduct.json)
      .subscribe(
        response => this.readTransform(response),
        error => console.error('Erreur lors de la requête:', error)
      );
    }
    else{
      // On envoie en mode xml 
      this.http.post('http://localhost:8080/order', this.selectedProduct.json, {
        headers: new HttpHeaders({
          'Content-Type': 'application/xml'
        })
      })
      .subscribe(
        response => this.readTransform(response),
        error => console.error('Erreur lors de la requête:', error)
      );
    }

  }

  readTransform(response: any): void {
    console.log('Réponse du serveur:', response);
    if(response.order) {
      this.transformText = JSON.stringify(response.order, null, 2);
    }
  }

  sendTransform(): void {
    if (!this.transformText) {
      console.error('Aucune transformation à envoyer');
      return;
    }

    this.http.post('http://localhost:8080/send', JSON.parse(this.transformText) )
      .subscribe(
        response => {
          //console.log('Réponse du serveur:', response);
          this.updateWarehousesInfo();
        },
        error => console.error('Erreur lors de la requête:', error)
      );
  }

  updateWarehousesInfo(): void {
    this.warehouses.forEach(warehouse => {
      this.http.get<{ messages: string[] }>(`http://localhost:8080/read/${warehouse.code}`)
        .subscribe({
          next: (response) => {
            //console.log('Réponse du serveur:', response);
            
            if (response && Array.isArray(response.messages)) {
              // Stocker les commandes avec un formatage lisible
              warehouse.orders = response.messages.map((order: string) => {
                try {
                  // Parser l'ordre JSON et le formater joliment avec des indentations
                  const parsedOrder = JSON.parse(order);
                  return JSON.stringify(parsedOrder, null, 2);  // null, 2 pour ajouter une indentation
                } catch (e) {
                  console.error("Erreur de parsing JSON :", e, order);
                  return null;
                }
              }).filter(order => order !== null);
            } else {
              //console.error("Réponse invalide :", response);
              warehouse.orders = [];
              warehouse.ordersString = '';
            }
          },
          error: (error) => {
            //console.error('Erreur lors de la requête:', error); 
            warehouse.orders = []; warehouse.ordersString = '';}
        });
    });
  }

  aggregateOrders(): void {
    this.warehouses.forEach(warehouse => {
      this.http.get('http://localhost:8080/aggregate/' + warehouse.code)
        .subscribe({
          next: (response) => {
            const data = response as { aggregatedOrders: string[] };

            console.log('Réponse du serveur:', data);
            if (Array.isArray(data.aggregatedOrders)) {
              warehouse.aggregateOrders = JSON.stringify(data.aggregatedOrders);
            }
            else {
              console.error("Réponse invalide :", response);
              warehouse.aggregateOrders = '';
            }

            console.log('aggregateOrders:', warehouse.aggregateOrders);
            this.updateWarehousesInfo();
          },
          error: error => console.error('Erreur lors de la requête:', error)
        });

      });
  }


}
