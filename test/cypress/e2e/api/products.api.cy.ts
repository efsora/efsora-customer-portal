import { ProductService } from '../../api/ProductService';
import { generateRandomString, generateRandomPrice } from '../../utils/dataGenerator';

describe('Product API Tests', () => {
  let productService: ProductService;

  before(() => {
    productService = new ProductService();
  });

  describe('GET /products', () => {
    it('should get all products', () => {
      productService.getAllProducts().then((response) => {
        productService.verifyProductListResponse(response);
        productService.verifyResponseTime(response, 2000);
      });
    });

    it('should get products with pagination', () => {
      productService.getProductsWithPagination(1, 5).then((response) => {
        productService.verifyStatus(response, 200);
        productService.verifyResponseIsArray(response);
        productService.verifyArrayLength(response, { max: 5 });
      });
    });

    it('should get products sorted by price ascending', () => {
      productService.getProductsSortedByPrice('asc').then((response) => {
        productService.verifyStatus(response, 200);
        productService.verifyResponseIsArray(response);

        // Verify sorting
        const prices = response.body.map((product: any) => product.price);
        const sortedPrices = [...prices].sort((a, b) => a - b);
        expect(prices).to.deep.equal(sortedPrices);
      });
    });

    it('should get products sorted by price descending', () => {
      productService.getProductsSortedByPrice('desc').then((response) => {
        productService.verifyStatus(response, 200);
        productService.verifyResponseIsArray(response);

        // Verify sorting
        const prices = response.body.map((product: any) => product.price);
        const sortedPrices = [...prices].sort((a, b) => b - a);
        expect(prices).to.deep.equal(sortedPrices);
      });
    });
  });

  describe('GET /products/:id', () => {
    it('should get product by ID', () => {
      const productId = 1;
      productService.getProductById(productId).then((response) => {
        productService.verifyProductDetailsResponse(response);
        productService.verifyResponseProperty(response, 'id', productId);
      });
    });

    it('should return 404 for non-existent product', () => {
      const nonExistentId = 99999;
      productService.getProductById(nonExistentId).then((response) => {
        productService.verifyProductNotFoundResponse(response);
      });
    });
  });

  describe('POST /products', () => {
    it('should create a new product', () => {
      const productData = {
        name: `Test Product ${generateRandomString(5)}`,
        description: 'Test product description',
        price: generateRandomPrice(10, 1000),
        category: 'Electronics',
        stock: 100,
      };

      productService.createProduct(productData).then((response) => {
        productService.verifyProductCreationResponse(response);
        productService.verifyResponseProperty(response, 'name', productData.name);
        productService.verifyResponseProperty(response, 'price', productData.price);
      });
    });

    it('should not create product without required fields', () => {
      const incompleteData = {
        name: 'Incomplete Product',
      } as any;

      productService.createProduct(incompleteData).then((response) => {
        productService.verifyStatus(response, 400);
      });
    });

    it('should not create product with invalid price', () => {
      const invalidData = {
        name: 'Invalid Product',
        description: 'Test description',
        price: -10, // Invalid negative price
        category: 'Electronics',
      };

      productService.createProduct(invalidData).then((response) => {
        productService.verifyStatus(response, 400);
      });
    });
  });

  describe('PUT /products/:id', () => {
    it('should update product', () => {
      const productId = 1;
      const updateData = {
        name: `Updated Product ${generateRandomString(5)}`,
        price: generateRandomPrice(10, 1000),
      };

      productService.updateProduct(productId, updateData).then((response) => {
        productService.verifyProductUpdateResponse(response);
        productService.verifyResponseProperty(response, 'name', updateData.name);
      });
    });

    it('should not update non-existent product', () => {
      const nonExistentId = 99999;
      const updateData = { name: 'Updated Product' };

      productService.updateProduct(nonExistentId, updateData).then((response) => {
        productService.verifyProductNotFoundResponse(response);
      });
    });
  });

  describe('PATCH /products/:id', () => {
    it('should partially update product', () => {
      const productId = 1;
      const patchData = {
        price: generateRandomPrice(10, 1000),
      };

      productService.patchProduct(productId, patchData).then((response) => {
        productService.verifyStatus(response, 200);
        productService.verifyResponseProperty(response, 'price', patchData.price);
      });
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete product', () => {
      // First create a product to delete
      const productData = {
        name: `Product to Delete ${generateRandomString(5)}`,
        description: 'Will be deleted',
        price: generateRandomPrice(10, 1000),
        category: 'Test',
      };

      productService.createProduct(productData).then((createResponse) => {
        const productId = createResponse.body.id;

        // Now delete the product
        productService.deleteProduct(productId).then((deleteResponse) => {
          productService.verifyProductDeletionResponse(deleteResponse);

          // Verify product is deleted
          productService.getProductById(productId).then((getResponse) => {
            productService.verifyProductNotFoundResponse(getResponse);
          });
        });
      });
    });

    it('should not delete non-existent product', () => {
      const nonExistentId = 99999;

      productService.deleteProduct(nonExistentId).then((response) => {
        productService.verifyProductNotFoundResponse(response);
      });
    });
  });

  describe('GET /products/categories', () => {
    it('should get all product categories', () => {
      productService.getCategories().then((response) => {
        productService.verifyCategoriesResponse(response);
        productService.verifyArrayLength(response, { min: 1 });
      });
    });
  });

  describe('GET /products/category/:category', () => {
    it('should get products by category', () => {
      const category = 'Electronics';

      productService.getProductsByCategory(category).then((response) => {
        productService.verifyStatus(response, 200);
        productService.verifyResponseIsArray(response);

        // Verify all products belong to the category
        response.body.forEach((product: any) => {
          expect(product.category).to.equal(category);
        });
      });
    });

    it('should return empty array for non-existent category', () => {
      const nonExistentCategory = 'NonExistentCategory';

      productService.getProductsByCategory(nonExistentCategory).then((response) => {
        productService.verifyStatus(response, 200);
        productService.verifyResponseIsArray(response);
        productService.verifyArrayLength(response, 0);
      });
    });
  });

  describe('GET /products/search', () => {
    it('should search products by name', () => {
      const searchTerm = 'laptop';

      productService.searchProducts(searchTerm).then((response) => {
        productService.verifyStatus(response, 200);
        productService.verifyResponseIsArray(response);

        // Verify search results contain the search term
        response.body.forEach((product: any) => {
          const containsSearchTerm =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
          expect(containsSearchTerm).to.equal(true);
        });
      });
    });

    it('should search products with filters', () => {
      const searchTerm = 'phone';
      const filters = {
        category: 'Electronics',
        minPrice: 100,
        maxPrice: 1000,
      };

      productService.searchProducts(searchTerm, filters).then((response) => {
        productService.verifyStatus(response, 200);
        productService.verifyResponseIsArray(response);

        // Verify filters are applied
        response.body.forEach((product: any) => {
          expect(product.category).to.equal(filters.category);
          expect(product.price).to.be.at.least(filters.minPrice);
          expect(product.price).to.be.at.most(filters.maxPrice);
        });
      });
    });

    it('should return empty array for no matches', () => {
      const searchTerm = generateRandomString(20);

      productService.searchProducts(searchTerm).then((response) => {
        productService.verifyStatus(response, 200);
        productService.verifyResponseIsArray(response);
        productService.verifyArrayLength(response, 0);
      });
    });
  });

  describe('Performance Tests', () => {
    it('should respond within acceptable time for product list', () => {
      productService.getAllProducts().then((response) => {
        productService.verifyResponseTime(response, 1000); // Max 1 second
      });
    });

    it('should respond within acceptable time for product details', () => {
      productService.getProductById(1).then((response) => {
        productService.verifyResponseTime(response, 500); // Max 500ms
      });
    });
  });
});
