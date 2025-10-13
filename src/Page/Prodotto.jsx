import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";

export default function Prodotto({ selectedProduct, setSelectedProduct, count, setCount }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prodotto, setProdotto] = useState(null);
  const [unit, setUnit] = useState("g");
  const [quantity, setQuantity] = useState("");
  const [giacotto, setGiacotto] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchProdotto = async () => {
      const { data, error } = await supabase
        .from("Prodotti")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
      } else {
        setProdotto(data);
      }
    };
    fetchProdotto();
  }, [id]);

  // Calcolo prezzo in base al peso
  const calculatePrice = () => {
    if (!prodotto || !quantity) return 0;

    let basePricePerKg = Number(prodotto.prezzo);
    if (giacotto) basePricePerKg += 4; // +4 €/kg se già cotto

    let kg = 0;

    // Conversione quantità in kg
    if (unit === "g") {
      kg = parseFloat(quantity.replace("g", "")) / 1000;
    } else if (unit === "kg") {
      kg = parseFloat(quantity.replace("kg", ""));
    }

    const totalPrice = basePricePerKg * kg;
    return totalPrice;
  };

  const totalPrice = calculatePrice();

  const handleAddToCart = () => {
    if (!quantity) return;

    const cart = Array.isArray(selectedProduct) ? [...selectedProduct] : [];

    const existingIndex = cart.findIndex(
      (p) => p.id === prodotto.id && p.giacotto === giacotto
    );

    if (existingIndex !== -1) {
      cart[existingIndex] = {
        ...cart[existingIndex],
        selectedQuantity: quantity,
        selectedUnit: unit,
        totalPrice: totalPrice.toFixed(2),
      };
    } else {
      cart.push({
        ...prodotto,
        selectedQuantity: quantity,
        selectedUnit: unit,
        giacotto: giacotto,
        totalPrice: totalPrice.toFixed(2),
      });
      setCount(count + 1);
    }

    setSelectedProduct(cart);
    setShowPopup(true);
  };

  const options =
    unit === "g"
      ? ["100g", "200g", "300g", "400g", "500g"]
      : ["0.25kg", "0.5kg", "0.75kg", "1kg"];

  if (!prodotto) return <div>Loading...</div>;

  return (
    <div className="prodotto-page">
      {/* Freccia per tornare alla home */}
      <div className="arrow-back" onClick={() => navigate("/")}>
        <FaArrowLeft size={24} />
      </div>

      <img src={prodotto.immaggine} alt={prodotto.nome} />
      <h1>{prodotto.nome}</h1>
      <p>{prodotto.ingredienti}</p>

      <p>
        Prezzo base: €
        {giacotto
          ? (Number(prodotto.prezzo) + 4).toFixed(2)
          : Number(prodotto.prezzo).toFixed(2)}{" "}
        /kg
      </p>

      <div className="unit-selection">
        <label>
          <input
            type="radio"
            name="unit"
            value="g"
            checked={unit === "g"}
            onChange={() => {
              setUnit("g");
              setQuantity("");
            }}
          />
          Grammi
        </label>
        <label>
          <input
            type="radio"
            name="unit"
            value="kg"
            checked={unit === "kg"}
            onChange={() => {
              setUnit("kg");
              setQuantity("");
            }}
          />
          Chilogrammi
        </label>
      </div>

      <select value={quantity} onChange={(e) => setQuantity(e.target.value)}>
        <option value="">Seleziona quantità</option>
        {options.map((opt, index) => (
          <option key={index} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <div className="checkbox-cotto">
        <label>
          <input
            type="checkbox"
            checked={giacotto}
            onChange={(e) => setGiacotto(e.target.checked)}
          />
          Già cotto (+4€/kg)
        </label>
      </div>

      {quantity && (
        <p>
          Totale: <strong>€{totalPrice.toFixed(2)}</strong>
        </p>
      )}

      <button className="btn-prodotto" onClick={handleAddToCart} disabled={!quantity}>
        Aggiungi al carrello
      </button>

      {showPopup && (
        <div className="popup">
          <p>Prodotto aggiunto al carrello!</p>
          <div className="popup-buttons">
             <button className="btn-prodotto" onClick={() => navigate(-1)}>
            Torna alla Home
          </button>
          <button className="btn-prodotto" onClick={() => navigate("/carrello")}>
            Vai al Carrello
          </button>
          </div>
         
        </div>
      )}
    </div>
  );
}
