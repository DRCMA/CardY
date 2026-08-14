"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { mockPlayers, mockCards } from "@/data/mockGames";
import { Card, Player } from "@/types/game";

export default function GameBoard() {
  const {
    players,
    discardPile,
    deck,
    currentPlayerIndex,
    addPlayer,
    drawCard,
    playCardToBoard,
    playCardToDiscard,
    flipBoardCard,
    destroyBoardCard,
    nextTurn,
  } = useGameStore();

  const [selectedHandCard, setSelectedHandCard] = useState<Card | null>(null);

  // Inicializar estado de prueba
  useEffect(() => {
    if (players.length === 0) {
      mockPlayers.forEach((player: Player) => addPlayer(player));
      useGameStore.setState({ deck: [...mockCards, ...mockCards] });
    }
  }, [players.length, addPlayer]);

  if (players.length < 2) {
    return (
      <div className="min-h-screen bg-emerald-950 text-white flex items-center justify-center font-bold">
        Cargando mesa de juego de CardY...
      </div>
    );
  }

  const me = players[0];
  const opponent = players[1];

  const handleDraw = () => {
    drawCard(me.id, 1);
  };

  const handlePlayToBoard = () => {
    if (!selectedHandCard) return;
    playCardToBoard(me.id, selectedHandCard.id);
    setSelectedHandCard(null);
  };

  const handlePlayToDiscard = () => {
    if (!selectedHandCard) return;
    playCardToDiscard(me.id, selectedHandCard.id);
    setSelectedHandCard(null);
  };

  return (
    <div className="min-h-screen bg-emerald-900 text-white flex flex-col font-sans select-none relative overflow-hidden">
      
      {/* BARRA SUPERIOR */}
      <div className="bg-emerald-950/80 px-6 py-3 flex justify-between items-center border-b border-emerald-800">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-xl tracking-wider text-emerald-400">CardY</span>
          <span className="text-xs bg-emerald-800 text-emerald-200 px-2 py-1 rounded">MVP Local</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">
            Turno de: <strong className="text-yellow-400">{players[currentPlayerIndex]?.name}</strong>
          </span>
          <button
            onClick={nextTurn}
            className="bg-yellow-500 hover:bg-yellow-400 text-emerald-950 font-bold px-4 py-1.5 rounded-lg text-sm shadow-md transition-all active:scale-95"
          >
            Pasar Turno ➔
          </button>
        </div>
      </div>

      {/* RIVAL */}
      <div className="flex-1 p-4 flex flex-col items-center justify-start bg-black/10">
        <h2 className="text-emerald-300 font-bold text-sm mb-2 opacity-80">{opponent.name} (Rival)</h2>
        <div className="flex gap-3 min-h-[120px] items-center">
          {opponent.board.map((card) => (
            <div
              key={card.id}
              onClick={() => destroyBoardCard(opponent.id, card.id)}
              title="Haz clic para destruir esta carta del rival"
              className="w-20 h-28 bg-white rounded-lg shadow-lg text-black flex flex-col items-center justify-center p-2 border-2 border-red-500 cursor-pointer hover:scale-105 transition-transform relative group"
            >
              <span className="text-2xl">{card.imageUrl || "🎴"}</span>
              <span className="text-[10px] font-bold text-center mt-1 line-clamp-2">{card.name}</span>
            </div>
          ))}
          {opponent.board.length === 0 && (
            <div className="w-20 h-28 border-2 border-dashed border-emerald-700/50 rounded-lg flex items-center justify-center text-emerald-700/60 text-[10px] text-center p-2">
              Mesa rival vacía
            </div>
          )}
        </div>
      </div>

      {/* MAZO Y DESCARTES */}
      <div className="h-44 bg-emerald-950/60 border-y border-emerald-800/40 flex items-center justify-center gap-16 shadow-inner">
        <div onClick={handleDraw} className="flex flex-col items-center cursor-pointer group">
          <div className="w-24 h-36 bg-slate-800 rounded-lg border-2 border-slate-600 shadow-2xl flex items-center justify-center group-hover:scale-105 group-hover:border-yellow-400 transition-all">
            <span className="text-slate-400 font-black tracking-widest text-xs rotate-90 group-hover:text-yellow-400">
              ROBAR
            </span>
          </div>
          <span className="mt-1.5 text-xs text-emerald-300 font-semibold">
            Mazo ({deck.length})
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-24 h-36 border-2 border-dashed border-emerald-700/60 rounded-lg flex items-center justify-center relative">
            {discardPile.length > 0 ? (
              <div className="w-full h-full bg-slate-100 text-black rounded-lg p-2 flex flex-col items-center justify-center">
                <span className="text-2xl">{discardPile[discardPile.length - 1].imageUrl || "🃏"}</span>
                <span className="text-[10px] font-bold text-center mt-1">
                  {discardPile[discardPile.length - 1].name}
                </span>
              </div>
            ) : (
              <span className="text-emerald-800 text-xs font-bold uppercase">Descartes</span>
            )}
          </div>
          <span className="mt-1.5 text-xs text-emerald-400/80 font-semibold">
            Pila ({discardPile.length})
          </span>
        </div>
      </div>

      {/* TU MESA Y TU MANO */}
      <div className="flex-1 p-4 flex flex-col items-center justify-end relative bg-black/10">
        <div className="flex gap-3 mb-6 min-h-[120px] items-center">
          {me.board.map((card) => (
            <div
              key={card.id}
              onClick={() => flipBoardCard(me.id, card.id)}
              className={`w-20 h-28 rounded-lg shadow-lg flex flex-col items-center justify-center p-2 border-2 cursor-pointer hover:-translate-y-1 transition-transform ${
                card.isFaceUp 
                  ? "bg-white text-black border-blue-500" 
                  : "bg-slate-800 text-white border-slate-600"
              }`}
            >
              {card.isFaceUp ? (
                <>
                  <span className="text-2xl">{card.imageUrl || "🎴"}</span>
                  <span className="text-[10px] font-bold text-center mt-1 line-clamp-2">{card.name}</span>
                </>
              ) : (
                <span className="text-[10px] font-bold text-slate-400">BOCA ABAJO</span>
              )}
            </div>
          ))}
          {me.board.length === 0 && (
            <div className="w-20 h-28 border-2 border-dashed border-emerald-700/50 rounded-lg flex items-center justify-center text-emerald-700/60 text-[10px] text-center p-2">
              Tu Mesa (Vacía)
            </div>
          )}
        </div>

        <div className="flex gap-2 items-end pb-2">
          {me.hand.map((card) => {
            const isSelected = selectedHandCard?.id === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setSelectedHandCard(isSelected ? null : card)}
                className={`w-28 h-40 bg-white rounded-xl shadow-2xl text-black flex flex-col items-center justify-between p-3 border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-yellow-400 -translate-y-6 shadow-[0_0_20px_rgba(250,204,21,0.6)]"
                    : "border-gray-200 hover:-translate-y-3"
                }`}
              >
                <span className="text-xs font-bold text-gray-400 uppercase self-start">
                  {card.suitOrColor || "Efecto"}
                </span>
                <span className="text-4xl my-auto">{card.imageUrl || "🃏"}</span>
                <span className="text-xs font-extrabold text-center line-clamp-2">{card.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MENÚ DE ACCIONES */}
      {selectedHandCard && (
        <div className="absolute bottom-48 bg-slate-900/95 border border-yellow-400 text-white p-4 rounded-xl shadow-2xl flex flex-col items-center gap-3 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
          <p className="text-xs font-bold text-yellow-400">
            ¿Qué quieres hacer con <span className="underline">{selectedHandCard.name}</span>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handlePlayToBoard}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
            >
              📥 Bajar a mi Mesa
            </button>
            <button
              onClick={handlePlayToDiscard}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
            >
              🔥 Tirar a Descartes
            </button>
            <button
              onClick={() => setSelectedHandCard(null)}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold px-2 py-2 rounded-lg transition-colors"
            >
              ✕ Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}