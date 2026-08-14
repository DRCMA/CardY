"use client";

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Card, Deck, CardEffect, TriggerType, ActionType } from '@/types/game';

// Opciones de Triggers basados en game.ts
const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
  { value: 'ON_PLAY', label: '⚡ Al Jugar (ON_PLAY)' },
  { value: 'ON_DRAW', label: '🎴 Al Robar (ON_DRAW)' },
  { value: 'ON_DISCARD', label: '🗑️ Al Descartar (ON_DISCARD)' },
  { value: 'TURN_START', label: '⏳ Inicio de Turno (TURN_START)' },
  { value: 'TURN_END', label: '⌛ Fin de Turno (TURN_END)' },
];

// Opciones de Acciones basadas en game.ts
const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'DRAW_CARDS', label: 'Robar Cartas' },
  { value: 'SKIP_TURN', label: 'Saltar Turno' },
  { value: 'REVERSE_TURN', label: 'Invertir Sentido' },
  { value: 'CHANGE_COLOR', label: 'Cambiar Color' },
  { value: 'DISCARD_HAND', label: 'Descartar Mano' },
  { value: 'DISCARD_CARD', label: 'Descartar Carta' },
  { value: 'STEAL_CARDS', label: 'Robar Carta a Enemigo' },
  { value: 'PLAY_TO_BOARD', label: 'Jugar Directo al Tablero' },
  { value: 'ATTACH_TO_CARD', label: 'Acoplar a otra Carta' },
  { value: 'DESTROY_CARD', label: 'Destruir Carta' },
  { value: 'FLIP_CARD', label: 'Voltear Carta' },
];

export default function MakeDeck() {
  const saveDeck = useGameStore((state) => state.saveDeck);

  // Estado del mazo que estamos creando
  const [deckName, setDeckName] = useState('');
  const [draftCards, setDraftCards] = useState<Card[]>([]);

  // Estado del formulario de la carta actual
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardName, setCardName] = useState('');
  
  // Estado de Efectos
  const [hasEffect, setHasEffect] = useState(false);
  const [trigger, setTrigger] = useState<TriggerType>('ON_PLAY');
  const [action, setAction] = useState<ActionType>('DRAW_CARDS');
  const [effectDescription, setEffectDescription] = useState('');

  // 1. Función para Añadir o Guardar Edición
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) return;

    // Construimos el array de efectos usando el tipo CardEffect de game.ts
    const cardEffects: CardEffect[] = hasEffect
      ? [
          {
            id: crypto.randomUUID(),
            trigger: trigger,
            action: action,
            description: effectDescription,
          },
        ]
      : [];

    if (editingCardId) {
      // MODO EDICIÓN
      setDraftCards((prev) =>
        prev.map((card) =>
          card.id === editingCardId
            ? {
                ...card,
                name: cardName,
                effects: cardEffects,
              }
            : card
        )
      );
      setEditingCardId(null);
    } else {
      // MODO CREACIÓN
      const newCard: Card = {
        id: crypto.randomUUID(),
        templateId: `tpl-${Date.now()}`,
        name: cardName,
        isFaceUp: false,
        effects: cardEffects,
      };
      setDraftCards([...draftCards, newCard]);
    }

    resetForm();
  };

  // 2. Cargar una carta en el formulario para Editarla
  const handleEdit = (card: Card) => {
    setEditingCardId(card.id);
    setCardName(card.name);
    
    if (card.effects && card.effects.length > 0) {
      const firstEffect = card.effects[0];
      setHasEffect(true);
      setTrigger(firstEffect.trigger || 'ON_PLAY');
      setAction(firstEffect.action || 'DRAW_CARDS');
      setEffectDescription(firstEffect.description || '');
    } else {
      setHasEffect(false);
      setTrigger('ON_PLAY');
      setAction('DRAW_CARDS');
      setEffectDescription('');
    }
  };

  // 3. Eliminar una carta
  const handleDelete = (id: string) => {
    setDraftCards((prev) => prev.filter((card) => card.id !== id));
    if (editingCardId === id) resetForm();
  };

  // 4. Limpiar formulario
  const resetForm = () => {
    setCardName('');
    setHasEffect(false);
    setTrigger('ON_PLAY');
    setAction('DRAW_CARDS');
    setEffectDescription('');
    setEditingCardId(null);
  };

  // 5. Guardar el mazo completo en Zustand
  const handleSaveFullDeck = () => {
    if (!deckName.trim() || draftCards.length === 0) {
      alert('Necesitas un nombre y al menos una carta para guardar el mazo.');
      return;
    }

    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name: deckName,
      cards: draftCards,
      createdAt: Date.now(),
    };

    saveDeck(newDeck);

    alert(`¡Mazo "${deckName}" guardado con éxito!`);
    setDeckName('');
    setDraftCards([]);
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-4 md:p-8 font-sans">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-blue-400">Constructor de Mazos</h1>

      {/* SECCIÓN 1: NOMBRE DEL MAZO */}
      <div className="mb-8 bg-gray-800 p-4 rounded-lg shadow">
        <label className="block text-sm font-medium mb-2 text-gray-200">Nombre del Mazo</label>
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          placeholder="Ej: Mazo de Fuego Oscuro"
          className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SECCIÓN 2: FORMULARIO DE LA CARTA */}
        <div className="bg-gray-800 p-6 rounded-lg shadow h-fit">
          <h2 className="text-xl font-semibold mb-4 text-green-400">
            {editingCardId ? '✏️ Editando Carta' : '➕ Crear Nueva Carta'}
          </h2>
          <form onSubmit={handleSaveCard} className="space-y-4">
            
            {/* Nombre de la carta */}
            <div>
              <label className="block text-sm mb-1 text-gray-200">Nombre de la carta</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
              />
            </div>

            {/* CHECKBOX DE EFECTO */}
            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id="effectToggle"
                checked={hasEffect}
                onChange={(e) => setHasEffect(e.target.checked)}
                className="w-5 h-5 accent-blue-500 cursor-pointer rounded"
              />
              <label htmlFor="effectToggle" className="cursor-pointer select-none text-gray-200">
                Esta carta tiene efecto especial
              </label>
            </div>

            {/* OPCIONES DE EFECTO CONDICIONALES */}
            {hasEffect && (
              <div className="mt-4 space-y-3 p-3 bg-gray-750/50 bg-gray-900/50 rounded border border-yellow-600/30">
                
                {/* SELECTOR DE TRIGGER */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-yellow-400">¿Cuándo se activa? (Trigger)</label>
                  <select
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value as TriggerType)}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm focus:outline-none focus:border-yellow-400"
                  >
                    {TRIGGER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SELECTOR DE ACCIÓN */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-yellow-400">¿Qué efecto hace? (Acción)</label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value as ActionType)}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm focus:outline-none focus:border-yellow-400"
                  >
                    {ACTION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DESCRIPCIÓN */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-yellow-400">Descripción visible para el jugador</label>
                  <textarea
                    value={effectDescription}
                    onChange={(e) => setEffectDescription(e.target.value)}
                    placeholder="Ej: El rival descarta 1 carta de su mano..."
                    rows={2}
                    required={hasEffect}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>
            )}

            {/* Botones de acción del formulario */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
              >
                {editingCardId ? 'Guardar Cambios' : 'Añadir al Mazo'}
              </button>
              {editingCardId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* SECCIÓN 3: LISTA DE CARTAS CREADAS */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">
            Cartas en el Mazo ({draftCards.length})
          </h2>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {draftCards.length === 0 ? (
              <p className="text-gray-400 text-center italic mt-10">No hay cartas todavía.</p>
            ) : (
              draftCards.map((card) => {
                const effect = card.effects[0];
                return (
                  <div key={card.id} className="bg-gray-700 p-3 rounded flex justify-between items-center border-l-4 border-blue-500">
                    <div>
                      <p className="font-bold">{card.name}</p>
                      {card.effects.length > 0 ? (
                        <div className="mt-1">
                          <span className="text-[10px] uppercase font-semibold bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded mr-1">
                            {effect?.trigger}
                          </span>
                          <span className="text-[10px] uppercase font-semibold bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded">
                            {effect?.action}
                          </span>
                          <p className="text-xs text-yellow-400 mt-1">✨ {effect?.description}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded mt-1 inline-block">
                          Sin efecto
                        </span>
                      )}
                    </div>
                    
                    {/* BOTONES EDITAR Y ELIMINAR */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(card)}
                        className="p-2 bg-yellow-600 hover:bg-yellow-500 rounded text-sm transition"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="p-2 bg-red-600 hover:bg-red-500 rounded text-sm transition"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Botón para guardar el mazo completo */}
          <button
            onClick={handleSaveFullDeck}
            disabled={draftCards.length === 0}
            className="w-full mt-6 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded transition"
          >
            💾 Guardar Mazo Completo
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}