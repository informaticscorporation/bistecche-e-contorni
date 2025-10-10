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
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadingImg(true);

    const fileName = `${Date.now()}_${file.name}`;

    // Carica nel bucket
    const { error: uploadError } = await supabase.storage
      .from("immagginiprodotti")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Errore caricamento immagine:", uploadError.message);
      alert("Errore durante il caricamento dell'immagine.");
      setLoadingImg(false);
      return;
    }

    // Ottieni URL pubblico
    const {
      data: { publicUrl },
    } = supabase.storage.from("immagginiprodotti").getPublicUrl(fileName);

    console.log("URL immagine:", publicUrl);
    setNewProdotto((prev) => ({ ...prev, immaggine: publicUrl }));
    setLoadingImg(false);
  };

  // --- INSERISCI PRODOTTO ---
  const handleAddProdotto = async (e) => {
    e.preventDefault();
    console.log("NEW PRODOTTO:", newProdotto);

    if (
      !newProdotto.nome ||
      !newProdotto.prezzo ||
      !newProdotto.categoria ||
      !newProdotto.ingredienti ||
      !newProdotto.immaggine
    ) {
      alert("Compila tutti i campi!");
      return;
    }

    const { error } = await supabase.from("Prodotti").insert([newProdotto]);
    if (error) {
      alert("Errore durante l'inserimento del prodotto.");
      console.error(error.message);
      return;
    }

    setNewProdotto({
      nome: "",
      prezzo: "",
      categoria: "",
      ingredienti: "",
      cotto: false,
      immaggine: "",
    });

    const { data } = await supabase.from("Prodotti").select("*");
    setProdotti(data);
  };

  // --- ELIMINA PRODOTTO ---
  const handleDeleteProdotto = async (id) => {
    await supabase.from("Prodotti").delete().eq("id", id);
    setProdotti(prodotti.filter((p) => p.id !== id));
  };

  // --- MODIFICA PRODOTTO ---
  const handleEditProdotto = async (id) => {
    const { nome, prezzo, categoria, ingredienti, cotto, immaggine } =
      editingProdotto;
    await supabase
      .from("Prodotti")
      .update({ nome, prezzo, categoria, ingredienti, cotto, immaggine })
      .eq("id", id);
    setEditingProdotto(null);
    const { data } = await supabase.from("Prodotti").select("*");
    setProdotti(data);
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
                    <td>{JSON.stringify(ordine.ordine)}</td>
                    <td>{ordine.prezzo?.toFixed(2)}</td>
                    <td>{ordine.data}</td>
                    <td>{ordine.ora}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteOrdine(ordine.id)}
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">Nessun ordine presente</td>
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
          <input
            type="text"
            placeholder="Nome"
            value={newProdotto.nome}
            onChange={(e) =>
              setNewProdotto({ ...newProdotto, nome: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Prezzo (€)"
            value={newProdotto.prezzo}
            onChange={(e) =>
              setNewProdotto({ ...newProdotto, prezzo: e.target.value })
            }
          />
          <select
            value={newProdotto.categoria}
            onChange={(e) =>
              setNewProdotto({ ...newProdotto, categoria: e.target.value })
            }
          >
            <option value="">Seleziona Categoria</option>
            <option value="involtini">Involtini</option>
            <option value="suino">Suino</option>
            <option value="manzo">Manzo</option>
            <option value="pollo">Pollo</option>
            <option value="salumi">Salumi</option>
            <option value="formaggi">Formaggi</option>
          </select>
          <input
            type="text"
            placeholder="Ingredienti"
            value={newProdotto.ingredienti}
            onChange={(e) =>
              setNewProdotto({
                ...newProdotto,
                ingredienti: e.target.value,
              })
            }
          />
          <label>
            <input
              type="checkbox"
              checked={newProdotto.cotto}
              onChange={(e) =>
                setNewProdotto({ ...newProdotto, cotto: e.target.checked })
              }
            />
            Cotto
          </label>

          {/* Upload immagine */}
          <input type="file" accept="image/*" onChange={handleUploadImage} />
          {loadingImg && <p>Caricamento immagine...</p>}
          {newProdotto.immaggine && (
            <img
              src={newProdotto.immaggine}
              alt="Anteprima"
              className="product-img"
              width="100"
            />
          )}

          <button type="submit" className="btn-add">
            Aggiungi
          </button>
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
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {prodotti.length > 0 ? (
                prodotti.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {editingProdotto?.id === p.id ? (
                        <input
                          value={editingProdotto.nome}
                          onChange={(e) =>
                            setEditingProdotto({
                              ...editingProdotto,
                              nome: e.target.value,
                            })
                          }
                        />
                      ) : (
                        p.nome
                      )}
                    </td>
                    <td>{p.prezzo}</td>
                    <td>{p.categoria}</td>
                    <td>{p.ingredienti}</td>
                    <td>{p.cotto ? "✅" : "❌"}</td>
                    <td>
                      {p.immaggine && (
                        <img
                          src={p.immaggine}
                          alt={p.nome}
                          width="60"
                          height="60"
                        />
                      )}
                    </td>
                    <td>
                      {editingProdotto?.id === p.id ? (
                        <button
                          className="btn-save"
                          onClick={() => handleEditProdotto(p.id)}
                        >
                          Salva
                        </button>
                      ) : (
                        <>
                          <button
                            className="btn-edit"
                            onClick={() => setEditingProdotto(p)}
                          >
                            Modifica
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteProdotto(p.id)}
                          >
                            Elimina
                          </button>
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
