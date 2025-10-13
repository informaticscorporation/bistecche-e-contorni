import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaShoppingCart, FaTrash } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { jsPDF } from "jspdf";

export default function Carrello({ selectedProduct, setSelectedProduct, count, setCount }) {
  const navigate = useNavigate();

  const [riepilogoOpen, setRiepilogoOpen] = useState(false);
  const [domicilio, setDomicilio] = useState(false);
  const [pdfPopup, setPdfPopup] = useState(false);
  const [ordinePDF, setOrdinePDF] = useState([]);

  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [provincia, setProvincia] = useState("");
  const [cap, setCap] = useState("");
  const [data, setData] = useState("");
  const [ora, setOra] = useState("");

  const ordine = Array.isArray(selectedProduct) ? selectedProduct : [];

  // 🔹 Funzione per rimuovere un prodotto dal carrello
  const rimuoviProdotto = (index) => {
    const nuovoOrdine = ordine.filter((_, i) => i !== index);
    setSelectedProduct(nuovoOrdine);
    setCount(nuovoOrdine.length);
  };

  // 🔹 Calcolo prezzo per prodotto con gestione "già cotto"
  const calcolaPrezzo = (p) => {
    let quantity = 0;
    if (p.selectedUnit === "g") quantity = parseFloat(p.selectedQuantity.replace("g", "")) / 1000;
    else if (p.selectedUnit === "kg") quantity = parseFloat(p.selectedQuantity.replace("kg", ""));

    const prezzoBase = Number(p.prezzo);
    // +4€ al kilo se già cotto
    return prezzoBase * quantity + (p.giacotto ? quantity * 4 : 0);
  };

  const prezzoTotale = ordine.reduce((acc, p) => acc + calcolaPrezzo(p), 0);

  const confermaOrdine = async () => {
    const newOrder = {
      nome,
      cognome,
      telefono,
      indirizzo,
      provincia,
      cap,
      domicilio,
      ordine,
      data,
      ora,
      prezzo: prezzoTotale,
    };

    try {
      const { error } = await supabase.from("Ordini").insert([newOrder]);
      if (error) throw error;

      setOrdinePDF(ordine);
      setRiepilogoOpen(false);
      setPdfPopup(true);
    } catch (err) {
      console.error("Errore invio ordine:", err);
      setOrdinePDF(ordine);
      setPdfPopup(true);
    }
  };

  const downloadPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Sfondo nero
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

  // Testo bianco
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);

  // Logo
  const img = new Image();
  img.src = "/logo.webp";
  img.onload = () => {
    const logoWidth = 40;
    const logoHeight = (img.height / img.width) * logoWidth;
    doc.addImage(img, "WEBP", (pageWidth - logoWidth) / 2, 10, logoWidth, logoHeight);
    y = 10 + logoHeight + 10;

    // Titolo
    doc.setFontSize(18);
    doc.text("Conferma Ordine", pageWidth / 2, y, { align: "center" });
    y += 15;

    doc.setFontSize(12);

    // ===== Sezione Cliente =====
    doc.setFont(undefined, "bold");
    doc.text("Dati Cliente:", 20, y);
    doc.setFont(undefined, "normal");
    y += 8;
    doc.text(`Nome: ${nome}`, 20, y); y += 8;
    doc.text(`Cognome: ${cognome}`, 20, y); y += 8;
    doc.text(`Telefono: ${telefono}`, 20, y); y += 12;

    // ===== Sezione Consegna =====
    if (domicilio) {
      doc.setFont(undefined, "bold");
      doc.text("Dettagli Consegna:", 20, y);
      doc.setFont(undefined, "normal");
      y += 8;
      doc.text(`Indirizzo: ${indirizzo}`, 20, y); y += 8;
      doc.text(`Provincia: ${provincia}`, 20, y); y += 8;
      doc.text(`CAP: ${cap}`, 20, y); y += 8;
      doc.text(`Variazione prezzo domicilio: 1-5 €`, 20, y); y += 12;
    }

    // ===== Sezione Prodotti =====
    doc.setFont(undefined, "bold");
    doc.text("Prodotti:", 20, y);
    y += 8;
    doc.setFont(undefined, "normal");

    ordinePDF.forEach((p) => {
      const prezzoProdotto = calcolaPrezzo(p);
      doc.text(`• ${p.nome}`, 20, y); y += 7;
      doc.text(`  Quantità: ${p.selectedQuantity} ${p.selectedUnit}`, 22, y); y += 7;
      if (p.giacotto) {
        doc.text(`  Già cotto: +4€`, 22, y); y += 7;
      }
      doc.text(`  Prezzo: €${prezzoProdotto.toFixed(2)}`, 22, y); y += 10;

      if (y > 270) {
        doc.addPage();
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");
        doc.setTextColor(255, 255, 255);
        y = 20;
      }
    });

    // ===== Totale =====
    doc.setFont(undefined, "bold");
    doc.text(`Prezzo Totale: €${prezzoTotale.toFixed(2)}`, 20, y); y += 12;

    // ===== Data e ora =====
    doc.setFont(undefined, "normal");
    doc.text(`Data ordine: ${data}`, 20, y); y += 7;
    doc.text(`Ora ordine: ${ora}`, 20, y); y += 7;

    // Scarica PDF
    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "Conferma_Ordine.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    setSelectedProduct([]);
    setCount(0);
    setPdfPopup(false);
  };
};


  if (!ordine.length && !pdfPopup) {
    return (
      <div className="carrello-vuoto">
        <p className="t-carrello-vuoto">Il carrello è vuoto</p>
        <button className="btn-prodotto" onClick={() => navigate(-1)}>
          Ordina
        </button>
      </div>
    );
  }

  return (
    <div className="carrello-page">
      <div className="arrow-back" onClick={() => navigate(-1)}>
        <FaArrowLeft size={24} />
      </div>

      <h1>Carrello</h1>
       <div className="carrello-wrapper">
          {ordine.map((p, index) => (
        <div key={index} className="prodotto-carrello">
          <img src={p.immaggine} alt={p.nome} />
          <div className="dettagli-prodotto">
            <h2>{p.nome}</h2>
            <p>Quantità: {p.selectedQuantity}</p>
            <p>Unità: {p.selectedUnit}</p>
            <p>Prezzo: €{calcolaPrezzo(p).toFixed(2)}</p>
            {p.giacotto && <p>Già cotto (+4€)</p>}
          </div>

          {/* 🔹 Cestino per rimuovere prodotto */}
          <FaTrash
            size={20}
            color="#ff4d4d"
            className="icon-trash"
            onClick={() => rimuoviProdotto(index)}
            style={{ cursor: "pointer", marginLeft: "10px" }}
          />
        </div>
      ))}
       </div>
    

      <button className="btn-riepilogo" onClick={() => setRiepilogoOpen(!riepilogoOpen)}>
        <FaShoppingCart /> Riepilogo
      </button>

      {riepilogoOpen && (
        <div className="riepilogo">
          <h3>Riepilogo Ordine</h3>

          <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <input type="text" placeholder="Cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} />
          <input type="text" placeholder="Telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />

          <label className="checkbox-label">
            <input type="checkbox" checked={domicilio} onChange={() => setDomicilio(!domicilio)} />
            Consegna a domicilio
          </label>

          {domicilio && (
            <>
              <p className="variazione-domicilio">
                Per il domicilio il prezzo totale subirà una variazione da 1 a 5 € in base alla zona
              </p>
              <input type="text" placeholder="Indirizzo" value={indirizzo} onChange={(e) => setIndirizzo(e.target.value)} />
              <input type="text" placeholder="Provincia" value={provincia} onChange={(e) => setProvincia(e.target.value)} />
              <input type="text" placeholder="CAP" value={cap} onChange={(e) => setCap(e.target.value)} />
            </>
          )}

          <label>Data ordine: <input type="date" value={data} onChange={(e) => setData(e.target.value)} /></label>
          <label>Ora ordine: <input type="time" value={ora} onChange={(e) => setOra(e.target.value)} /></label>

          <p><strong>Prezzo Totale: €{prezzoTotale.toFixed(2)}</strong></p>

          <button
            className="btn-conferma"
            onClick={confermaOrdine}
            disabled={!nome || !cognome || !telefono || !data || !ora}
          >
            Conferma Ordine
          </button>
        </div>
      )}

      {pdfPopup && (
        <div className="popup-pdf">
          <p className="text-pdf">Ordine inviato con successo! Vuoi scaricare il PDF della conferma?</p>
          <button onClick={downloadPDF}>📄 Scarica PDF</button>
          <button onClick={() => setPdfPopup(false)}>Chiudi</button>
        </div>
      )}
    </div>
  );
}
