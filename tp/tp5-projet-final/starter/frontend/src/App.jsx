import { useState, useEffect } from 'react'

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newProduct, setNewProduct] = useState({ name: '', price: '' })

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Erreur lors du chargement')
      const data = await response.json()
      setProducts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price)
        })
      })
      if (!response.ok) throw new Error('Erreur lors de la création')
      setNewProduct({ name: '', price: '' })
      fetchProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erreur lors de la suppression')
      fetchProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container">
      <header>
        <h1>E-Commerce - TP5 Docker</h1>
        <p>Application dockerisée avec React, Express, PostgreSQL et Redis</p>
      </header>

      <main>
        <section className="add-product">
          <h2>Ajouter un produit</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nom du produit"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Prix"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              required
            />
            <button type="submit">Ajouter</button>
          </form>
        </section>

        <section className="products">
          <h2>Produits ({products.length})</h2>
          {loading && <p>Chargement...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && products.length === 0 && (
            <p>Aucun produit. Ajoutez-en un !</p>
          )}
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p className="price">{parseFloat(product.price).toFixed(2)} EUR</p>
                <p className="date">
                  Ajouté le {new Date(product.created_at).toLocaleDateString()}
                </p>
                <button onClick={() => handleDelete(product.id)} className="delete">
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>TP5 - Formation Docker - ForEach Academy</p>
      </footer>
    </div>
  )
}

export default App
