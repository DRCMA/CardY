"use client";

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Card, Deck, CardEffect, TriggerType, ActionType } from '@/types/game';
import { useLanguageStore } from '@/store/useLanguageStore';

const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
  { value: 'ON_PLAY', label: '⚡ Al Jugar (ON_PLAY)' },
  { value: 'ON_DRAW', label: '🎴 Al Robar (ON_DRAW)' },
  { value: 'ON_DISCARD', label: '🗑️ Al Descartar (ON_DISCARD)' },
  { value: 'TURN_START', label: '⏳ Inicio de Turno (TURN_START)' },
  { value: 'TURN_END', label: '⌛ Fin de Turno (TURN_END)' },
];

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'DRAW_CARDS', label: 'Robar Cartas (steal cards)' },
  { value: 'SKIP_TURN', label: 'Saltar Turno (skip turn)' },
  { value: 'REVERSE_TURN', label: 'Invertir Sentido (reverse turn)' },
  { value: 'CHANGE_COLOR', label: 'Cambiar Color (change color)' },
  { value: 'DISCARD_HAND', label: 'Descartar Mano (discard hand)' },
  { value: 'DISCARD_CARD', label: 'Descartar Carta (discard card)' },
  { value: 'STEAL_CARDS', label: 'Robar Carta a Enemigo (steal cards from opponent)' },
  { value: 'PLAY_TO_BOARD', label: 'Jugar Directo al Tablero (play to board)' },
  { value: 'ATTACH_TO_CARD', label: 'Acoplar a otra Carta (attach to card)' },
  { value: 'DESTROY_CARD', label: 'Destruir Carta (destroy card)' },
  { value: 'FLIP_CARD', label: 'Voltear Carta (flip card)' },
];

export default function MakeDeck() {
  const saveDeck = useGameStore((state) => state.saveDeck);
  const { t, language, setLanguage } = useLanguageStore();
  const [deckName, setDeckName] = useState('');
  const [draftCards, setDraftCards] = useState<Card[]>([]);

  // ESTADOS PRINCIPALES DE LA CARTA
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardName, setCardName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  
  // ESTADOS DE COLOR / PALO
  const [hasColor, setHasColor] = useState(false);
  const [cardColor, setCardColor] = useState('');

  // ESTADOS DE VALOR
  const [hasValue, setHasValue] = useState(false);
  const [cardValue, setCardValue] = useState('');
  
  // ESTADOS DE EFECTOS
  const [hasEffects, setHasEffects] = useState(false);
  const [currentEffects, setCurrentEffects] = useState<CardEffect[]>([]); // Lista de efectos de la carta actual
  const [trigger, setTrigger] = useState<TriggerType>('ON_PLAY');
  const [action, setAction] = useState<ActionType>('DRAW_CARDS');
  const [effectDescription, setEffectDescription] = useState('');

  // FUNCIÓN: Añadir un efecto temporalmente a la carta en edición
  const handleAddEffectToCard = () => {
    if (!trigger || !action) return;
    
    const newEffect: CardEffect = {
      id: crypto.randomUUID(),
      trigger,
      action,
      description: effectDescription,
    };

    setCurrentEffects([...currentEffects, newEffect]);
    
    // Limpiamos los inputs del efecto para el siguiente
    setTrigger('ON_PLAY');
    setAction('DRAW_CARDS');
    setEffectDescription('');
  };

  const handleImportCard = (card: Card) => {
  setEditingCardId(null); // Fundamental: lo dejamos en null para que cree una nueva y no sobrescriba
  setQuantity(1);
  
  setHasColor(!!card.suitOrColor);
  setCardColor(card.suitOrColor || '');

  setHasValue(!!card.value);
  setCardValue(card.value ? String(card.value) : '');
  
  if (card.effects && card.effects.length > 0) {
    setHasEffects(true);
    // Clonamos los efectos generando nuevos IDs únicos para evitar bugs en el tablero
    setCurrentEffects(card.effects.map(eff => ({ ...eff, id: crypto.randomUUID() })));
  } else {
    setHasEffects(false);
    setCurrentEffects([]);
  }
};

  // FUNCIÓN: Eliminar un efecto de la lista temporal
  const handleRemoveEffect = (effectId: string) => {
    setCurrentEffects(currentEffects.filter(e => e.id !== effectId));
  };

  // FUNCIÓN: Guardar la carta en el mazo
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) return;

    // Preparamos los datos opcionales
    const finalColor = hasColor && cardColor.trim() ? cardColor.trim() : undefined;
    const finalValue = hasValue && cardValue.trim() ? cardValue.trim() : undefined;
    const finalEffects = hasEffects ? currentEffects : [];

    if (editingCardId) {
      // MODO EDICIÓN
      setDraftCards((prev) =>
        prev.map((card) =>
          card.id === editingCardId
            ? {
                ...card,
                name: cardName,
                suitOrColor: finalColor,
                value: finalValue,
                effects: finalEffects,
              }
            : card
        )
      );
      setEditingCardId(null);
    } else {
      // MODO CREACIÓN (Respeta la cantidad)
      const newCopies: Card[] = Array.from({ length: quantity }).map(() => {
        // Debemos clonar los efectos para que cada carta tenga IDs únicos en sus efectos
        const clonedEffects = finalEffects.map(eff => ({
          ...eff,
          id: crypto.randomUUID()
        }));

        return {
          id: crypto.randomUUID(),
          templateId: `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: cardName,
          suitOrColor: finalColor,
          value: finalValue,
          isFaceUp: false,
          effects: clonedEffects,
        };
      });

      setDraftCards([...draftCards, ...newCopies]);
    }

    resetForm();
  };

  // FUNCIÓN: Cargar datos para editar
  const handleEdit = (card: Card) => {
    setEditingCardId(card.id);
    setCardName(card.name);
    
    setHasColor(!!card.suitOrColor);
    setCardColor(card.suitOrColor || '');

    setHasValue(!!card.value);
    setCardValue(card.value ? String(card.value) : '');
    
    if (card.effects && card.effects.length > 0) {
      setHasEffects(true);
      setCurrentEffects(card.effects);
    } else {
      setHasEffects(false);
      setCurrentEffects([]);
    }
  };

  const handleDelete = (id: string) => {
    setDraftCards((prev) => prev.filter((card) => card.id !== id));
    if (editingCardId === id) resetForm();
  };

  const resetForm = () => {
    setCardName('');
    setQuantity(1);
    
    setHasColor(false);
    setCardColor('');
    
    setHasValue(false);
    setCardValue('');

    setHasEffects(false);
    setCurrentEffects([]);
    setTrigger('ON_PLAY');
    setAction('DRAW_CARDS');
    setEffectDescription('');
    
    setEditingCardId(null);
  };

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
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-blue-400">{t('deckBuilder.title')}</h1>

        <div className="mb-8 bg-gray-800 p-4 rounded-lg shadow border border-gray-700/50">
          <label className="block text-sm font-medium mb-2 text-gray-200">{t('deckBuilder.deckName')}</label>
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder={t('deckBuilder.deckNamePlaceholder')}
            className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* FORMULARIO DE CARTA */}
          <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700/50 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-green-400">
              {editingCardId ? '✏️ ' + t('deckBuilder.editCard') : t('deckBuilder.createCard')}
            </h2>
            
            <form onSubmit={handleSaveCard} className="space-y-5">
              
              {/* NOMBRE Y CANTIDAD */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm mb-1 text-gray-200">{t('deckBuilder.cardName')}</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                    className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>

                {!editingCardId && (
                  <div>
                    <label className="block text-sm mb-1 text-gray-200">{t('deckBuilder.quantity')}</label>
                    <div className="flex items-center space-x-1">
                      <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-[46px] bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 font-bold transition">-</button>
                      <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" className="w-16 h-[46px] text-center bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white font-bold" />
                      <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-[46px] bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 font-bold transition">+</button>
                    </div>
                  </div>
                )}
              </div>

              {/* COLOR / PALO */}
              <div className="flex items-center gap-4 bg-gray-900/40 p-3 rounded border border-gray-700/50">
                <div className="flex items-center space-x-2 min-w-[140px]">
                  <input type="checkbox" id="colorToggle" checked={hasColor} onChange={(e) => setHasColor(e.target.checked)} className="w-4 h-4 accent-blue-500" />
                  <label htmlFor="colorToggle" className="text-sm cursor-pointer text-gray-200">{t('deckBuilder.hasColor')}</label>
                </div>
                {hasColor && (
                  <input type="text" value={cardColor} onChange={(e) => setCardColor(e.target.value)} placeholder={t('deckBuilder.colorPlaceholder')} className="flex-1 p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white text-sm" />
                )}
              </div>

              {/* VALOR */}
              <div className="flex items-center gap-4 bg-gray-900/40 p-3 rounded border border-gray-700/50">
                <div className="flex items-center space-x-2 min-w-[140px]">
                  <input type="checkbox" id="valueToggle" checked={hasValue} onChange={(e) => setHasValue(e.target.checked)} className="w-4 h-4 accent-blue-500" />
                  <label htmlFor="valueToggle" className="text-sm cursor-pointer text-gray-200">{t('deckBuilder.hasValue')}</label>
                </div>
                {hasValue && (
                  <input type="text" value={cardValue} onChange={(e) => setCardValue(e.target.value)} placeholder={t('deckBuilder.valuePlaceholder')} className="flex-1 p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white text-sm" />
                )}
              </div>

              {/* EFECTOS */}
              <div className="border border-gray-700/50 rounded-lg p-4 bg-gray-900/20">
                <div className="flex items-center space-x-2 mb-2">
                  <input type="checkbox" id="effectsToggle" checked={hasEffects} onChange={(e) => setHasEffects(e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                  <label htmlFor="effectsToggle" className="font-semibold cursor-pointer text-yellow-400">{t('deckBuilder.hasEffects')}</label>
                </div>

                {hasEffects && (
                  <div className="mt-4 space-y-4">
                    {/* Lista de efectos añadidos */}
                    {currentEffects.length > 0 && (
                      <div className="bg-gray-800 p-3 rounded border border-yellow-600/30 space-y-2">
                        <h4 className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">{t('deckBuilder.addedEffectsTitle')} ({currentEffects.length})</h4>
                        {currentEffects.map((eff, idx) => (
                          <div key={eff.id} className="flex justify-between items-center bg-gray-900/60 p-2 rounded text-sm">
                            <div>
                              <span className="font-bold text-blue-300 mr-2">#{idx + 1} {eff.trigger}</span>
                              <span className="text-purple-300">➜ {eff.action}</span>
                              {eff.description && <p className="text-xs text-gray-400 mt-0.5">{eff.description}</p>}
                            </div>
                            <button type="button" onClick={() => handleRemoveEffect(eff.id)} className="text-red-400 hover:text-red-300 px-2 py-1 bg-red-900/30 rounded">✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Creador de nuevo efecto */}
                    <div className="p-3 bg-gray-800 rounded border border-gray-600 border-dashed">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3">{t('deckBuilder.configureEffect')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-400">{t('deckBuilder.triggerLabel')}</label>
                          <select value={trigger} onChange={(e) => setTrigger(e.target.value as TriggerType)} className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm focus:outline-none focus:border-yellow-400">
                            {TRIGGER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-400">{t('deckBuilder.actionLabel')}</label>
                          <select value={action} onChange={(e) => setAction(e.target.value as ActionType)} className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm focus:outline-none focus:border-yellow-400">
                            {ACTION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-xs font-semibold mb-1 text-gray-400">{t('deckBuilder.descriptionLabel')}</label>
                        <input type="text" value={effectDescription} onChange={(e) => setEffectDescription(e.target.value)} placeholder={t('deckBuilder.descriptionPlaceholder')} className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm focus:outline-none focus:border-yellow-400" />
                      </div>
                      <button type="button" onClick={handleAddEffectToCard} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded transition text-sm">
                        + Añadir Efecto a la Carta
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTONES DE GUARDAR CARTA */}
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-lg">
                  {editingCardId ? t('deckBuilder.updateCard') : `📥 ${t('deckBuilder.saveCard')} (${quantity})`}
                </button>
                {editingCardId && (
                  <button type="button" onClick={resetForm} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition">
                    {t('deckBuilder.cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* LISTA DE CARTAS EN EL MAZO */}
          <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700/50 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-purple-400">
                {t('deckBuilder.summaryTitle')} ({draftCards.length})
              </h2>
              
              <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
                {draftCards.length === 0 ? (
                  <p className="text-gray-400 text-center italic mt-10">{t('deckBuilder.emptyDeck')}</p>
                ) : (
                  draftCards.map((card) => (
                    <div key={card.id} className="bg-gray-700 p-3 rounded flex justify-between items-start border-l-4 border-blue-500">
                      <div className="flex-1 pr-2">
                        <p className="font-bold text-lg leading-tight">{card.name}</p>
                        
                        {/* Etiquetas de Color y Valor */}
                        {(card.suitOrColor || card.value) && (
                          <div className="flex gap-2 mt-1.5">
                            {card.suitOrColor && <span className="bg-gray-800 text-gray-300 text-[10px] uppercase px-2 py-0.5 rounded border border-gray-600">🎨 {card.suitOrColor}</span>}
                            {card.value && <span className="bg-gray-800 text-gray-300 text-[10px] uppercase px-2 py-0.5 rounded border border-gray-600">🔢 {card.value}</span>}
                          </div>
                        )}

                        {/* Etiquetas de Efectos */}
                        {card.effects.length > 0 ? (
                          <div className="mt-2 space-y-1">
                            {card.effects.map(eff => (
                              <div key={eff.id} className="text-[10px] flex items-center gap-1">
                                <span className="uppercase font-semibold bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded">{eff.trigger}</span>
                                <span className="uppercase font-semibold bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded">{eff.action}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded mt-2 inline-block">{t('deckBuilder.noEffects')}</span>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleImportCard(card)} className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm transition" title="Usar como plantilla"type="button">🧲</button>
                        <button onClick={() => handleEdit(card)} className="p-2 bg-yellow-600 hover:bg-yellow-500 rounded text-sm transition" title="Editar">✏️</button>
                        <button onClick={() => handleDelete(card.id)} className="p-2 bg-red-600 hover:bg-red-500 rounded text-sm transition" title="Eliminar">🗑️</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={handleSaveFullDeck}
              disabled={draftCards.length === 0}
              className="w-full mt-6 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition shadow-lg"
            >
              {t('deckBuilder.saveFullDeck')}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}