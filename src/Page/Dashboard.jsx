import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const [prodotti, setProdotti] = useState([]);
  const [ordini, setOrdini] = useState([]);
  const [loadingImg, setLoadingImg] = useState(false);
  const [newProdotto, setNewProdotto] = useState({
    nome: "",
    prezzo: "",
    categoria: "",
    ingredienti: "",
    cotto: false,
    immaggine: "",
    rating : 0
  });
  const [editingProdotto, setEditingProdotto] = useState(null);
  const [intervalTime] = useState(10000); // refresh ogni 10s

  // --- FETCH PRODOTTI ---
  useEffect(() => {
    const fetchProdotti = async () => {
      const { data, error } = await supabase
        .from("Prodotti")
        .select("*")
        .order("id", { ascending: true });
      if (error) console.error("Errore caricamento prodotti:", error.message);
      setProdotti(data || []);
    };
    fetchProdotti();
    const interval = setInterval(fetchProdotti, intervalTime);
    return () => clearInterval(interval);
  }, [intervalTime]);

  // --- FETCH ORDINI ---
  useEffect(() => {
    const fetchOrdini = async () => {
      const { data, error } = await supabase
        .from("Ordini")
        .select("*")
        .order("id", { ascending: true });
      if (error) console.error("Errore caricamento ordini:", error.message);
      setOrdini(data || []);
    };
    fetchOrdini();
    const interval = setInterval(fetchOrdini, intervalTime);
    return () => clearInterval(interval);
  }, [intervalTime]);

  // --- UPLOAD IMMAGINE ---
  const handleUploadImage = async (file, isEditing = false) => {
    if (!file) return;
    setLoadingImg(true);

    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("immagginiprodotti")
      .upload(fileName, file);

    if (uploadError) {
      alert("Errore caricamento immagine");
      setLoadingImg(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("immagginiprodotti")
      .getPublicUrl(fileName);

    if (isEditing) {
      setEditingProdotto({ ...editingProdotto, immaggine: publicUrl });
    } else {
      setNewProdotto({ ...newProdotto, immaggine: publicUrl });
    }
    setLoadingImg(false);
  };

  // --- INSERISCI PRODOTTO ---
  const handleAddProdotto = async (e) => {
    e.preventDefault();
    const { nome, prezzo, categoria, ingredienti, immaggine, rating } = newProdotto;
    if (!nome || !prezzo || !categoria || !ingredienti || !immaggine || !rating) {
      return alert("Compila tutti i campi!");
    }

    const { error } = await supabase.from("Prodotti").insert([newProdotto]);
    if (error) return alert("Errore inserimento prodotto");

    setNewProdotto({
      nome: "",
      prezzo: "",
      categoria: "",
      ingredienti: "",
      cotto: false,
      immaggine: "",
      rating : 0
    });

    const { data } = await supabase.from("Prodotti").select("*");
    setProdotti(data);
  };

  // --- MODIFICA PRODOTTO ---
  const handleEditProdotto = async (id) => {
    const { nome, prezzo, categoria, ingredienti, cotto, immaggine, rating } = editingProdotto;
    await supabase
      .from("Prodotti")
      .update({ nome, prezzo, categoria, ingredienti, cotto, immaggine, rating })
      .eq("id", id);

    setEditingProdotto(null);
    const { data } = await supabase.from("Prodotti").select("*");
    setProdotti(data);
  };

  // --- ELIMINA PRODOTTO ---
  const handleDeleteProdotto = async (id) => {
    await supabase.from("Prodotti").delete().eq("id", id);
    setProdotti(prodotti.filter((p) => p.id !== id));
  };

  // --- ELIMINA ORDINE ---
  const handleDeleteOrdine = async (id) => {
    await supabase.from("Ordini").delete().eq("id", id);
    setOrdini(ordini.filter((o) => o.id !== id));
  };

  return (
    <div className="dashboard">
      <h1>Dashboard Amministratore</h1>

      {/* --- SEZIONE ORDINI --- */}
      <section className="section">
        <h2>Ordini</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cognome</th>
                <th>Telefono</th>
                <th>Ordine</th>
                <th>Domicilio</th>
                <th>Provincia</th>
                <th>Cap</th>
                <th>Indirizzo</th>
                <th>Prezzo (€)</th>
                <th>Data</th>
                <th>Ora</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {ordini.length > 0 ? (
                ordini.map((ordine) => (
                  <tr key={ordine.id}>
                    <td>{ordine.nome}</td>
                    <td>{ordine.cognome}</td>
                    <td>{ordine.telefono}</td>
                    <td>
                      {ordine.ordine.map((item, idx) => (
                        <div key={item.id || idx}>
                          {item.selectedQuantity} - {item.nome} - {item.giacotto ? "da cucinare✅" : "non da cucinare❌"}
                        </div>
                      ))}
                    </td>
                    <td>{ordine.domicilio ? "Si" : "No"}</td>
                    <td>{ordine.provincia}</td>
                    <td>{ordine.cap}</td>
                    <td>{ordine.indirizzo}</td>
                    <td>{ordine.prezzo?.toFixed(2)}</td>
                    <td>{ordine.data}</td>
                    <td>{ordine.ora}</td>
                    <td>
                      <button className="btn-delete" onClick={() => handleDeleteOrdine(ordine.id)}>
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12">Nessun ordine presente</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- SEZIONE PRODOTTI --- */}
      <section className="section">
        <h2>Prodotti</h2>

        {/* Form aggiunta */}
        <form className="add-form" onSubmit={handleAddProdotto}>
          <input type="text" placeholder="Nome" value={newProdotto.nome} onChange={(e) => setNewProdotto({ ...newProdotto, nome: e.target.value })} />
          <input type="number" placeholder="Prezzo (€)" value={newProdotto.prezzo} onChange={(e) => setNewProdotto({ ...newProdotto, prezzo: e.target.value })} />
          <select value={newProdotto.categoria} onChange={(e) => setNewProdotto({ ...newProdotto, categoria: e.target.value })}>
            <option value="">Seleziona Categoria</option>
            <option value="preparati">Preparati</option>
            <option value="suino">Suino</option>
            <option value="bovino">Bovino</option>
            <option value="pollo">Pollo</option>
            <option value="salumi">Salumi</option>
            <option value="formaggi">Formaggi</option>
            <option value="gastronomia">Gastronomia e Contorni</option>
            <option value="frutta">vini</option>
          </select>
          <input type="text" placeholder="Ingredienti" value={newProdotto.ingredienti} onChange={(e) => setNewProdotto({ ...newProdotto, ingredienti: e.target.value })} />
          <label>
            <input type="checkbox" checked={newProdotto.cotto} onChange={(e) => setNewProdotto({ ...newProdotto, cotto: e.target.checked })} /> Cotto
          </label>
          <input type="file" accept="image/*" onChange={(e) => handleUploadImage(e.target.files[0])} />
          {loadingImg && <p>Caricamento immagine...</p>}
          {newProdotto.immaggine && <img src={newProdotto.immaggine} alt="Anteprima" width="100" />}
          <input type="number" placeholder="Rating" value={newProdotto.rating} onChange={(e) => setNewProdotto({ ...newProdotto, rating: e.target.value })} />
          <button type="submit" className="btn-add">Aggiungi</button>
        </form>

        {/* Tabella prodotti */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Prezzo (€)</th>
                <th>Categoria</th>
                <th>Ingredienti</th>
                <th>Cotto</th>
                <th>Immagine</th>
                <th>Rating</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {prodotti.length > 0 ? (
                prodotti.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {editingProdotto?.id === p.id ? (
                        <input value={editingProdotto.nome} onChange={(e) => setEditingProdotto({ ...editingProdotto, nome: e.target.value })} />
                      ) : p.nome}
                    </td>
                    <td>
                      {editingProdotto?.id === p.id ? (
                        <input type="number" value={editingProdotto.prezzo} onChange={(e) => setEditingProdotto({ ...editingProdotto, prezzo: e.target.value })} />
                      ) : p.prezzo}
                    </td>
                    <td>
                      {editingProdotto?.id === p.id ? (
                        <select value={editingProdotto.categoria} onChange={(e) => setEditingProdotto({ ...editingProdotto, categoria: e.target.value })}>
                          <option value="preparati">Preparati</option>
                          <option value="suino">Suino</option>
                          <option value="bovino">Bovino</option>
                          <option value="pollo">Pollo</option>
                          <option value="salumi">Salumi</option>
                          <option value="formaggi">Formaggi</option>
                          <option value="gastronomia">Gastronomia e Contorni</option>
                          <option value="wine">Vini</option>
                        </select>
                      ) : p.categoria}
                    </td>
                    <td>
                      {editingProdotto?.id === p.id ? (
                        <input type="text" value={editingProdotto.ingredienti} onChange={(e) => setEditingProdotto({ ...editingProdotto, ingredienti: e.target.value })} />
                      ) : p.ingredienti}
                    </td>
                    <td>
                      {editingProdotto?.id === p.id ? (
                        <input type="checkbox" checked={editingProdotto.cotto} onChange={(e) => setEditingProdotto({ ...editingProdotto, cotto: e.target.checked })} />
                      ) : p.cotto ? "✅" : "❌"}
                    </td>
                    <td>
                      {editingProdotto?.id === p.id ? (
                        <>
                          <input type="file" onChange={(e) => handleUploadImage(e.target.files[0], true)} />
                          {editingProdotto.immaggine && <img src={editingProdotto.immaggine} alt={editingProdotto.nome} width="60" height="60" />}
                        </>
                      ) : p.immaggine ? (
                        <img src={p.immaggine} alt={p.nome} width="60" height="60" />
                      ) : null}
                    </td>
                    <td>
                      {editingProdotto?.id === p.id ? (
                        <input type="number" value={editingProdotto.rating} onChange={(e) => setEditingProdotto({ ...editingProdotto, rating: e.target.value })} />
                      ) : p.rating}
                    </td>
                    <td>
                      {editingProdotto?.id === p.id ? (
                        <button className="btn-save" onClick={() => handleEditProdotto(p.id)}>Salva</button>
                      ) : (
                        <>
                          <button className="btn-edit" onClick={() => setEditingProdotto(p)}>Modifica</button>
                          <button className="btn-delete" onClick={() => handleDeleteProdotto(p.id)}>Elimina</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">Nessun prodotto presente</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
