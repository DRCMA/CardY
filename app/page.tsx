"use client";

import Link from "next/link";

export default function MainMenuPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Título Central */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-black text-yellow-400 tracking-widest drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">
          CARDY
        </h1>
        <p className="text-slate-400 mt-4 text-lg">
          El motor de creación de juegos de cartas
        </p>
      </div>

      {/* Menú de Opciones */}
      <div className="w-full max-w-md grid grid-cols-1 gap-4">
        
        {/* Opción Activa: Make Deck */}
        <Link 
          href="/decks"
          className="group relative w-full flex items-center justify-between bg-slate-900 border border-emerald-500/50 p-6 rounded-2xl hover:bg-slate-800 hover:border-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
        >
          <div>
            <h2 className="text-2xl font-bold text-emerald-400 group-hover:text-emerald-300">
              Make Deck
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Crea un mazo de cartas desde cero
            </p>
          </div>
          <span className="text-3xl">🎴</span>
        </Link>

        {/* Opción Futura 1: Jugar (Deshabilitada) */}
        <div className="w-full flex items-center justify-between bg-slate-900/50 border border-slate-800 p-6 rounded-2xl opacity-60 cursor-not-allowed">
          <div>
            <h2 className="text-2xl font-bold text-slate-500">
              Play Game
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Próximamente...
            </p>
          </div>
          <span className="text-3xl opacity-50">🎮</span>
        </div>

        {/* Opción Futura 2: Inventario (Deshabilitada) */}
        <div className="w-full flex items-center justify-between bg-slate-900/50 border border-slate-800 p-6 rounded-2xl opacity-60 cursor-not-allowed">
          <div>
            <h2 className="text-2xl font-bold text-slate-500">
              My Collection
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Próximamente...
            </p>
          </div>
          <span className="text-3xl opacity-50">📚</span>
        </div>

      </div>
    </div>
  );
}