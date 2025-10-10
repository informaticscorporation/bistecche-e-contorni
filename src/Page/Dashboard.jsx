import { useState } from "react";
import { supabase } from "../supabaseClient";
export default function Dashboard() {
    const [nome, setNome] = useState("");
    const [ingredienti, setIngredienti] = useState("");
    const [prezzo, setPrezzo] = useState("");
    const [categoria, setCategoria] = useState("");
    const [cotto, setCotto] = useState(false);
    

    const handleSubmit = (e) => {
        e.preventDefault();
        const nuovoProdotto = { nome, ingredienti, prezzo, categoria, cotto };
        supabase.from("Prodotti").insert([nuovoProdotto]).then(() => {

    });
        setNome("");
        setIngredienti("");
        setPrezzo("");
        setCategoria("");
        setCotto(false);
    };

    return (
        <>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}>
                
                <input
                    type="text"
                    placeholder="Nome prodotto"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />

                <textarea
                    placeholder="Ingredienti"
                    value={ingredienti}
                    onChange={(e) => setIngredienti(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Prezzo"
                    value={prezzo}
                    onChange={(e) => setPrezzo(e.target.value)}
                />

                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                    <option value="">Seleziona categoria</option>
                    <option value="involtini">Involtini</option>
                    <option value="suino">Suino</option>
                    <option value="manzo">Manzo</option>
                    <option value="pollo">Pollo</option>
                    <option value="tacchino">Tacchino</option>
                    <option value="salumi">Salumi</option>
                    <option value="formaggi">Formaggi</option>
                </select>

                <label>
                    <input
                        type="checkbox"
                        checked={cotto}
                        onChange={(e) => setCotto(e.target.checked)}
                    />
                    Cotto
                </label>

                <button type="submit">Aggiungi Prodotto</button>
            </form>
        </>
    );
}
