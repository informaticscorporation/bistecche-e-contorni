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
  const [selectedVerdure, setSelectedVerdure] = useState([]);

  const prodottiNonAlKg = [
    "Pollo Allo Spiedo",
    "Stinco di Maiale",
    "Pollo Ruspantino Allo Spiedo",
    "Coscia Di Pollo",
  ];

  const verdureOptions = [
    "Peperoni",
    "Fagiolina",
    "Zucchina",
    "Melanzane",
    "Zucca",
    "Funghi",
  ];

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
        setGiacotto(data.cotto === true);
      }
    };
    fetchProdotto();
  }, [id]);

  const isNonAlKg = prodotto && prodottiNonAlKg.includes(prodotto.nome);
  const isVerdure = prodotto && prodotto.nome === "Verdure Grigliate";

  // ✅ Calcolo prezzo
  const calculatePrice = () => {
    if (!prodotto) return 0;

    let basePricePerKg = Number(prodotto.prezzo);

    // +4€/kg solo se selezionato manualmente
    if (giacotto && prodotto.cotto !== true) {
      basePricePerKg += 4;
    }

    // ✅ Prezzo al pezzo
    if (isNonAlKg) {
      return basePricePerKg * (parseInt(quantity) || 1);
    }

    // ✅ Prezzo al kg (anche verdure)
    let kg =
      unit === "g"
        ? parseFloat(quantity.replace("g", "")) / 1000
        : parseFloat(quantity.replace("kg", ""));
    return basePricePerKg * kg;
  };

  const totalPrice = calculatePrice();

  const handleAddToCart = () => {
    if (!quantity && !isVerdure) return;

    const cart = Array.isArray(selectedProduct) ? [...selectedProduct] : [];

    const item = {
      ...prodotto,
      selectedQuantity: quantity || "N/A",
      selectedUnit: isNonAlKg ? "pz" : unit,
      giacotto: giacotto,
      totalPrice: totalPrice.toFixed(2),
    };

    if (isVerdure) item.selectedVerdure = selectedVerdure;

    cart.push(item);
    setSelectedProduct(cart);
    setCount(count + 1);
    setShowPopup(true);
  };

  const options =
    unit === "g"
      ? ["100", "150", "200", "250", "300", "350", "400", "450", "500", "550", "600", "650", "700", "750", "800", "850", "900", "950"]
      : [ "1kg","1.5kg","2kg","2.5kg","3kg","3.5kg","4kg","4.5kg","5kg","5.5kg","6kg","6.5kg","7kg","7.5kg","8kg","8.5kg","9kg","9.5kg","10kg"];

  if (!prodotto) return <div>Loading...</div>;

  return (
    <div className="prodotto-page">
      <div className="arrow-back" onClick={() => navigate("/")}>
        <FaArrowLeft size={24} />
      </div>

      <img src={prodotto.immaggine} alt={prodotto.nome} />
      <h1>
        {prodotto.nome}{" "}
        {prodotto.cotto && <span style={{ color: "red" }}>(Già cotto)</span>}
      </h1>
      <p>{prodotto.ingredienti}</p>

      <p>
        Prezzo base: €{Number(prodotto.prezzo).toFixed(2)}{" "}
        {isNonAlKg ? "/pz" : "/kg"}
        {prodotto.cotto !== true && " (opzione +4€/kg se già cotto)"}
      </p>

      {/* ✅ Verdure grigliate → selezione multipla */}
      {isVerdure && (
        <div className="verdure-options">
          <p>Scegli le verdure:</p>
          {verdureOptions.map((v) => (
            <label key={v} style={{ display: "block" }}>
              <input
                type="checkbox"
                value={v}
                checked={selectedVerdure.includes(v)}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedVerdure((prev) =>
                    prev.includes(val)
                      ? prev.filter((x) => x !== val)
                      : [...prev, val]
                  );
                }}
              />
              {v}
            </label>
          ))}
        </div>
      )}

      {/* ✅ Prodotti a peso (incluso verdure) */}
      {!isNonAlKg && (
        <>
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

          <select
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          >
            <option value="">Seleziona quantità</option>
            {options.map((opt, index) => (
              <option key={index} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </>
      )}

      {isNonAlKg && (
        <select
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        >
          <option value="">Seleziona quantità</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} pezzo{n > 1 && "i"}
            </option>
          ))}
        </select>
      )}

      <div className="checkbox-cotto">
        <label>
          <input
            type="checkbox"
            checked={giacotto}
            onChange={(e) => setGiacotto(e.target.checked)}
            disabled={prodotto?.cotto === true}
          />
          Già cotto (+4€/kg)
        </label>
      </div>

      {totalPrice > 0 && (
        <p>
          Totale: <strong>€{totalPrice.toFixed(2)}</strong>
        </p>
      )}

      <button
        className="btn-prodotto"
        onClick={handleAddToCart}
        disabled={!quantity && !isVerdure}
      >
        Aggiungi al carrello
      </button>

      {showPopup && (
        <div className="popup">
          <p>Prodotto aggiunto al carrello!</p>
          <div className="popup-buttons">
            <button className="btn-prodotto" onClick={() => navigate(-1)}>
              Torna alla Home
            </button>
            <button
              className="btn-prodotto"
              onClick={() => navigate("/carrello")}
            >
              Vai al Carrello
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
