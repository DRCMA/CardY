"use client";

import { useState } from "react";
import Link from "next/link";
import { useGameStore } from "@/store/useGameStore";
import { Card } from "@/types/game";
import { useLanguageStore } from '@/store/useLanguageStore';

export default function CardCreatorPage() {
  const { t, language, setLanguage } = useLanguageStore();
  const { deck, setDeck } = useGameStore((state) => ({
    deck: state.deck,
    setDeck: (cards: Card[]) => useGameStore.setState({ deck: cards }),
  }));

  // Estado del formulario de creación
  const [name, setName] = useState("");
  const [suitOrColor, setSuitOrColor] = useState("Rojo");
  const [imageUrl, setImageUrl] = useState("🐉");
  const [description, setDescription] = useState("");
  const [savedCards, setSavedCards] = useState<Card[]>([]);

  // Opciones de iconos predefinidos para probar fácil
  const iconOptions = ["🐉", "⚔️", "🛡️", "🧪", "⚡", "👑", "🏹", "🔥", "💀", "💎"];

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCard: Card = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      templateId: `tpl-${Date.now()}`,
      name: name.trim(),
      suitOrColor,
      imageUrl: imageUrl || "🃏",
      isFaceUp: true,
      effects: description ? [{ id: "e1", description}] : [],
    };

    // Guardamos la carta en la lista local de creadas
    const updatedCards = [...savedCards, newCard];
    setSavedCards(updatedCards);

    // Añadimos la carta directamente al mazo global de juego
    setDeck([...deck, newCard]);

    // Limpiamos el formulario
    setName("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      {/* NAVEGACIÓN */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-yellow-400 tracking-wider">CardY Creator</h1>
          <p className="text-xs text-slate-400 mt-1">Diseña tus propias cartas y pruébalas al instante en el tapete</p>
        </div>
        <Link
          href="/"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-lg transition-all"
        >
          🎮 Ir a la Mesa de Juego ({deck.length} cartas en Mazo)
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Formulario de Creación */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-emerald-400">Atributos de la Carta</h2>
          
          <form onSubmit={handleCreateCard} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Nombre de la Carta
              </label>
              <input
                type="text"
                placeholder="Ej: Dragón Infernal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Categoría / Color
                </label>
                <select
                  value={suitOrColor}
                  onChange={(e) => setSuitOrColor(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="Rojo">🔴 Rojo / Ataque</option>
                  <option value="Azul">🔵 Azul / Defensa</option>
                  <option value="Verde">🟢 Verde / Curación</option>
                  <option value="Amarillo">🟡 Amarillo / Especial</option>
                  <option value="Violeta">🟣 Violeta / Arcana</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Icono / Ilustración
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>
            </div>

            {/* Selector rápido de emojis */}
            <div>
              <span className="block text-[10px] text-slate-500 mb-1">Opciones rápidas de icono:</span>
              <div className="flex gap-2 flex-wrap">
                {iconOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setImageUrl(emoji)}
                    className={`w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-lg border ${
                      imageUrl === emoji ? "border-yellow-400" : "border-slate-700"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Efecto o Descripción
              </label>
              <textarea
                placeholder="Ej: Destruye una carta de la mesa rival al jugarla."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-3 rounded-xl shadow-lg transition-all active:scale-95"
            >
              ✨ Guardar Carta y Añadir al Mazo
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: Vista Previa en Tiempo Real */}
        <div className="lg:col-span-6 flex flex-col items-center justify-start bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-6 text-slate-300">Vista Previa en Vivo</h2>

          {/* Carta Interactiva Renderizada */}
          <div className="w-56 h-80 bg-white rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] text-slate-900 p-4 flex flex-col justify-between border-4 border-slate-200 relative overflow-hidden group">
            
            {/* Header de la carta */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-black text-sm text-slate-800 truncate max-w-[130px]">
                {name || "Nombre Carta"}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300">
                {suitOrColor}
              </span>
            </div>

            {/* Ilustración central */}
            <div className="my-auto flex items-center justify-center bg-slate-50 rounded-xl h-32 border border-slate-100">
              <span className="text-6xl drop-shadow-md select-none">{imageUrl || "🃏"}</span>
            </div>

            {/* Texto de efecto */}
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 min-h-[50px] flex items-center justify-center">
              <p className="text-[11px] text-slate-600 text-center leading-tight line-clamp-3">
                {description || "Sin descripción de efecto."}
              </p>
            </div>
          </div>

          {/* Contador de cartas creadas */}
          <div className="mt-8 text-center">
            <span className="text-xs text-slate-400 font-semibold">
              Cartas creadas en esta sesión: <strong className="text-yellow-400">{savedCards.length}</strong>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}