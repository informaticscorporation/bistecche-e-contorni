import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { FaShoppingCart } from "react-icons/fa";
import { GiNoodles, GiPig, GiCow, GiChicken, GiHamShank, GiCheeseWedge } from "react-icons/gi";


export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState("involtini"); // categoria di default

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from("Prodotti").select("*");
      setProducts(data || []);
      console.log(data);
    };
    fetchProducts();
  }, []);

  // Filtri per categoria
  const Involtini = products.filter((product) => product.categoria === "involtini");
  const Suino = products.filter((product) => product.categoria === "suino");
  const Manzo = products.filter((product) => product.categoria === "manzo");
  const Pollo = products.filter((product) => product.categoria === "pollo");
  const Salumi = products.filter((product) => product.categoria === "salumi");
  const Formaggi = products.filter((product) => product.categoria === "formaggi");

  // Funzione per ottenere i prodotti della categoria selezionata
  const getSelectedCategoryProducts = () => {
    switch (categories) {
      case "involtini":
        return Involtini;
      case "suino":
        return Suino;
      case "manzo":
        return Manzo;
      case "pollo":
        return Pollo;
      case "salumi":
        return Salumi;
      case "formaggi":
        return Formaggi;
      default:
        return [];
    }
  };

  const selectedProducts = getSelectedCategoryProducts();

  return (
    <div className="home">
      {/* Header */}
      <div className="header">
        <FaShoppingCart className="cart-icon" />
        <img src="/logo.webp" alt="Marina del Re" className="logo" />
        <div className="spacer" />
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Cerca qui..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="categories">
        <button
          className={`category ${categories === "involtini" ? "active" : ""}`}
          onClick={() => setCategories("involtini")}
        >
          <GiNoodles className="category-icon" /> Involtino
        </button>
        <button
          className={`category ${categories === "suino" ? "active" : ""}`}
          onClick={() => setCategories("suino")}
        >
          <GiPig className="category-icon" /> Suino
        </button>
        <button
          className={`category ${categories === "manzo" ? "active" : ""}`}
          onClick={() => setCategories("manzo")}
        >
          <GiCow className="category-icon" /> Manzo
        </button>
        <button
          className={`category ${categories === "pollo" ? "active" : ""}`}
          onClick={() => setCategories("pollo")}
        >
          <GiChicken className="category-icon" /> Pollo
        </button>
        <button
          className={`category ${categories === "salumi" ? "active" : ""}`}
          onClick={() => setCategories("salumi")}
        >
          <GiHamShank className="category-icon" /> Salumi
        </button>
        <button
          className={`category ${categories === "formaggi" ? "active" : ""}`}
          onClick={() => setCategories("formaggi")}
        >
          <GiCheeseWedge className="category-icon" /> Formaggi
        </button>
      </div>

      {/* Prodotti per categoria selezionata */}
      <div className="section">
        <div className="section-header">
          <h2>
            {categories.charAt(0).toUpperCase() + categories.slice(1)}
          </h2>
          <span>Vedi Tutto →</span>
        </div>

        <div className="products">
          {selectedProducts.length > 0 ? (
            selectedProducts.map((product) => (
              <div className="product-card" key={product.id}>
                <div className="img-wrapper">
                    
                     <img
                  src={product.immaggine }
                  alt={product.nome}
                />
                </div>
               
                <h3>{product.nome}</h3>
                <p className="desc">{product.ingredienti}</p>
               <p className="price">€{Number(product.prezzo).toFixed(2)}</p>

              </div>
            ))
          ) : (
            <p className="no-results">Nessun prodotto trovato</p>
          )}
        </div>
      </div>
    </div>
  );
}
