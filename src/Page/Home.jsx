import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { FaShoppingCart, FaRegStar, FaStar } from "react-icons/fa";
import {
  GiNoodles,
  GiPig,
  GiCow,
  GiChicken,
  GiHamShank,
  GiCheeseWedge,
  GiForkKnifeSpoon,
  GiWineBottle
} from "react-icons/gi";
import { useNavigate } from "react-router-dom";

export default function Home({ count }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState("gastronomia");
  const [badge, setBadge] = useState(false);
  const [ratedProducts, setRatedProducts] = useState([]);
  const [popolari, setPopolari] = useState([]);
  const navigate = useNavigate();

  // 🔹 Caricamento prodotti popolari
  useEffect(() => {
    const fetchPopolari = async () => {
      const { data, error } = await supabase
        .from("Prodotti")
        .select("*")
        .order("rating", { ascending: false })
        .limit(10); // prende solo i top 5 per esempio
      if (error) console.error("Errore caricamento prodotti popolari:", error);
      else setPopolari(data || []);
    };
    setInterval(() => {
      fetchPopolari();
    }, 5000);
    clearInterval();
  }, []);

  // 🔹 Caricamento prodotti
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("Prodotti").select("*");
      if (error) console.error("Errore caricamento prodotti:", error);
      else setProducts(data || []);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    setBadge(count > 0);
  }, [count]);

  // 🔎 Ricerca globale
  const SearchResults = products.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ingredienti?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔄 Filtra per categoria
  const getSelectedCategoryProducts = () =>
    products.filter((p) => p.categoria === categories);

  // 🔄 Se l’utente scrive qualcosa, mostriamo i risultati della ricerca
  const selectedProducts =
    searchTerm.trim().length > 0 ? SearchResults : getSelectedCategoryProducts();

  // ⭐ Funzione per aggiungere un voto
  const handleRate = async (productId, currentRating) => {
    if (ratedProducts.includes(productId)) return;
    const newRating = (currentRating || 0) + 1;
    const { error } = await supabase
      .from("Prodotti")
      .update({ rating: newRating })
      .eq("id", productId);

    if (!error) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, rating: newRating } : p
        )
      );
      setRatedProducts((prev) => [...prev, productId]);
    }
  };

  return (
    <div className="home">
      {/* Header */}
      <div className="header">
        <h1 style={{position: "absolute",zIndex: -1000}}>Bistecche e Contorni | Carne Fresca e Specialità Locali a Villagrazia di Carini palermo</h1>
        <p style={{position: "absolute",zIndex: -1000}}>Offriamo carne fresca, salumi artigianali, involtini, porchetta, rosbif, pollo allo spiedo e altre specialità gastronomiche locali</p>
        {badge && <div className="badge">{count}</div>}
        <FaShoppingCart
          className="cart-icon"
          onClick={() => navigate("/carrello")}
        />
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
          className={`category ${categories === "preparati" ? "active" : ""}`}
          onClick={() => setCategories("preparati")}
        >
          <GiNoodles className="category-icon" /> Preparati
        </button>
        <button
          className={`category ${categories === "suino" ? "active" : ""}`}
          onClick={() => setCategories("suino")}
        >
          <GiPig className="category-icon" /> Suino
        </button>
        <button
          className={`category ${categories === "bovino" ? "active" : ""}`}
          onClick={() => setCategories("bovino")}
        >
          <GiCow className="category-icon" /> Bovino
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
        <button
          className={`category ${
            categories === "gastronomia" ? "active" : ""
          }`}
          onClick={() => setCategories("gastronomia")}
        >
          <GiForkKnifeSpoon className="category-icon" /> Gastronomia e Contorni
        </button>
        <button
          className={`category ${categories === "wine" ? "active" : ""}`}
          onClick={() => setCategories("wine")}
        >
          <GiWineBottle className="category-icon" /> Vini
        </button>
      </div>

      {/* Sezione Più Popolari */}
      <div className="section">
        <div className="section-header">
          <h2>Più Popolari</h2>
        </div>
        <div className="popular-products">
          {popolari.map((product) => {
            const isRated = ratedProducts.includes(product.id);
            return (
              <div className="product-card-popular" key={product.id}>
                <div className="img-wrapper">
                  <img src={product.immaggine} alt={product.nome} />
                  <div
                    className="star-icon"
                    onClick={() => handleRate(product.id, product.rating)}
                  >
                    {isRated ? (
                      <FaStar className="star filled" />
                    ) : (
                      <FaRegStar className="star empty" />
                    )}
                  </div>
                </div>
                <h3 className="name">{product.nome}</h3>
               
                <p className="price">€{Number(product.prezzo).toFixed(2)}</p>
                <div>
                  <button
                    className="btn-prodotto"
                    onClick={() => navigate(`/prodotto/${product.id}`)}
                  >
                    Ordina
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prodotti per categoria o ricerca */}
      <div className="section">
        <div className="section-header">
          <h2>
            {searchTerm.trim().length > 0
              ? `Risultati per "${searchTerm}"`
              : categories.charAt(0).toUpperCase() + categories.slice(1)}
          </h2>
          <span>Vedi Tutto →</span>
        </div>
        <div className="products">
          {selectedProducts.length > 0 ? (
            selectedProducts.map((product) => {
              const isRated = ratedProducts.includes(product.id);
              return (
                <div className="product-card" key={product.id}>
                  <div className="img-wrapper">
                    <img src={product.immaggine} alt={product.nome} />
                    <div
                      className="star-icon"
                      onClick={() => handleRate(product.id, product.rating)}
                    >
                      {isRated ? (
                        <FaStar className="star filled" />
                      ) : (
                        <FaRegStar className="star empty" />
                      )}
                    </div>
                  </div>
                  <h3>{product.nome}</h3>
                  <p className="desc">{product.ingredienti}</p>
                  <p className="price">€{Number(product.prezzo).toFixed(2)}</p>
                  <div>
                    <button
                      className="btn-prodotto"
                      onClick={() => navigate(`/prodotto/${product.id}`)}
                    >
                      Ordina
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-results">Nessun prodotto trovato</p>
          )}
        </div>
      </div>
    </div>
  );
}
