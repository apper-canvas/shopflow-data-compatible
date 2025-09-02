import productsData from "@/services/mockData/products.json"

class ProductService {
  constructor() {
    this.products = [...productsData]
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getAll() {
    await this.delay()
    return [...this.products]
  }

  async getById(id) {
    await this.delay()
    const product = this.products.find(p => p.Id === parseInt(id))
    return product ? { ...product } : null
  }

  async getByCategory(category) {
    await this.delay()
    return this.products.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    ).map(p => ({ ...p }))
  }

  async getFeatured(limit = 12) {
    await this.delay()
    return this.products.slice(0, limit).map(p => ({ ...p }))
  }

  async search(query) {
    await this.delay()
    const searchTerm = query.toLowerCase()
    return this.products.filter(p =>
      p.title.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    ).map(p => ({ ...p }))
  }

  getCategories() {
    const categories = [...new Set(this.products.map(p => p.category))]
    return categories.sort()
  }
}

export default new ProductService()