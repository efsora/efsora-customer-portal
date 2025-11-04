import { BaseApiService } from './BaseApiService';

/**
 * ProductService - API service for product-related endpoints
 * Extends BaseApiService to inherit common HTTP methods
 */
export class ProductService extends BaseApiService {
  private readonly endpoints = {
    products: '/products',
    product: (id: string | number) => `/products/${id}`,
    categories: '/products/categories',
    productsByCategory: (category: string) => `/products/category/${category}`,
    search: '/products/search',
  };

  /**
   * Get all products
   * @param queryParams - Optional query parameters (page, limit, sort, etc.)
   */
  getAllProducts(queryParams?: Record<string, any>): Cypress.Chainable<Cypress.Response<any>> {
    return this.get(this.endpoints.products, queryParams);
  }

  /**
   * Get product by ID
   * @param productId - Product ID
   */
  getProductById(productId: string | number): Cypress.Chainable<Cypress.Response<any>> {
    return this.get(this.endpoints.product(productId));
  }

  /**
   * Create new product
   * @param productData - Product data
   */
  createProduct(productData: {
    name: string;
    description: string;
    price: number;
    category: string;
    stock?: number;
    imageUrl?: string;
  }): Cypress.Chainable<Cypress.Response<any>> {
    return this.post(this.endpoints.products, productData);
  }

  /**
   * Update product
   * @param productId - Product ID
   * @param productData - Updated product data
   */
  updateProduct(
    productId: string | number,
    productData: Partial<{
      name: string;
      description: string;
      price: number;
      category: string;
      stock: number;
      imageUrl: string;
    }>
  ): Cypress.Chainable<Cypress.Response<any>> {
    return this.put(this.endpoints.product(productId), productData);
  }

  /**
   * Partially update product
   * @param productId - Product ID
   * @param productData - Partial product data
   */
  patchProduct(
    productId: string | number,
    productData: Partial<{
      name: string;
      description: string;
      price: number;
      category: string;
      stock: number;
      imageUrl: string;
    }>
  ): Cypress.Chainable<Cypress.Response<any>> {
    return this.patch(this.endpoints.product(productId), productData);
  }

  /**
   * Delete product
   * @param productId - Product ID
   */
  deleteProduct(productId: string | number): Cypress.Chainable<Cypress.Response<any>> {
    return this.delete(this.endpoints.product(productId));
  }

  /**
   * Get all product categories
   */
  getCategories(): Cypress.Chainable<Cypress.Response<any>> {
    return this.get(this.endpoints.categories);
  }

  /**
   * Get products by category
   * @param category - Category name
   * @param queryParams - Optional query parameters
   */
  getProductsByCategory(
    category: string,
    queryParams?: Record<string, any>
  ): Cypress.Chainable<Cypress.Response<any>> {
    return this.get(this.endpoints.productsByCategory(category), queryParams);
  }

  /**
   * Search products
   * @param searchTerm - Search term
   * @param filters - Optional filters (category, minPrice, maxPrice, etc.)
   */
  searchProducts(
    searchTerm: string,
    filters?: Record<string, any>
  ): Cypress.Chainable<Cypress.Response<any>> {
    return this.get(this.endpoints.search, {
      q: searchTerm,
      ...filters,
    });
  }

  /**
   * Get products with pagination
   * @param page - Page number
   * @param limit - Items per page
   */
  getProductsWithPagination(
    page: number = 1,
    limit: number = 10
  ): Cypress.Chainable<Cypress.Response<any>> {
    return this.getAllProducts({ page, limit });
  }

  /**
   * Get products sorted by price
   * @param order - Sort order (asc or desc)
   */
  getProductsSortedByPrice(
    order: 'asc' | 'desc' = 'asc'
  ): Cypress.Chainable<Cypress.Response<any>> {
    return this.getAllProducts({ sortBy: 'price', order });
  }

  /**
   * Verify product list response
   * @param response - API response
   */
  verifyProductListResponse(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 200);
    this.verifyResponseIsArray(response);
  }

  /**
   * Verify product details response
   * @param response - API response
   * @param expectedProductName - Expected product name
   */
  verifyProductDetailsResponse(
    response: Cypress.Response<any>,
    expectedProductName?: string
  ): void {
    this.verifyStatus(response, 200);
    this.verifyResponseHasProperty(response, 'id');
    this.verifyResponseHasProperty(response, 'name');
    this.verifyResponseHasProperty(response, 'price');
    this.verifyResponseHasProperty(response, 'category');

    if (expectedProductName) {
      this.verifyResponseProperty(response, 'name', expectedProductName);
    }
  }

  /**
   * Verify product creation response
   * @param response - API response
   */
  verifyProductCreationResponse(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 201);
    this.verifyResponseHasProperty(response, 'id');
    this.verifyResponseHasProperty(response, 'name');
  }

  /**
   * Verify product update response
   * @param response - API response
   */
  verifyProductUpdateResponse(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 200);
    this.verifyResponseHasProperty(response, 'id');
  }

  /**
   * Verify product deletion response
   * @param response - API response
   */
  verifyProductDeletionResponse(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 200);
  }

  /**
   * Verify product not found response
   * @param response - API response
   */
  verifyProductNotFoundResponse(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 404);
  }

  /**
   * Verify categories response
   * @param response - API response
   */
  verifyCategoriesResponse(response: Cypress.Response<any>): void {
    this.verifyStatus(response, 200);
    this.verifyResponseIsArray(response);
  }
}
