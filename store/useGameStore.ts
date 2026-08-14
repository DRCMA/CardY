import { create } from 'zustand';
import { Card, Player, GameRules, Deck } from '../types/game';

interface GameState {
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  savedDecks: Deck[]; // <-- AÑADIDO: Faltaba definir esto en la interfaz
  currentPlayerIndex: number;
  turnDirection: 1 | -1;
  
  // Game actions
  startGame: (rules: GameRules) => void;
  addPlayer: (player: Player) => void;
  playCardToDiscard: (playerId: string, cardId: string) => void; 
  playCardToBoard: (playerId: string, cardId: string) => void;   
  destroyBoardCard: (targetPlayerId: string, cardId: string) => void; 
  stealBoardCard: (playerId: string, targetPlayerId: string, cardId: string) => void;
  drawCard: (playerId: string, amount?: number) => void;
  flipBoardCard: (playerId: string, cardId: string) => void;
  executeDiscard: (targetPlayerId: string, zone: 'HAND' | 'BOARD', amount: number, isRandom: boolean, selectedCardId?: string) => void;
  saveDeck: (deck: Deck) => void;
  setActiveDeck: (cards: Card[]) => void;
  nextTurn: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  players: [],
  deck: [],
  discardPile: [],
  savedDecks: [], // <-- AÑADIDO: Inicializamos el array vacío
  currentPlayerIndex: 0,
  turnDirection: 1,

  // Start the game with the given rules
  startGame: (rules) =>
    set((state) => {
      // Copy the players and their hands/boards to avoid mutating the original state
      const updatedPlayers = state.players.map(player => ({
        ...player,
        hand: [...player.hand],
        board: [...(player.board || [])]
      }));

      let remainingDeck = [...state.deck];

      // Deal cards to each player based on the game rules
      updatedPlayers.forEach(player => {
        // Draw the corresponding cards from the deck 
        const drawnCards = remainingDeck.splice(0, rules.defaultDrawAmount);

        drawnCards.forEach(card => {
          // Comprobamos si la carta cumple alguna regla especial de reparto
          const specialRule = rules.dealRules.find(
            rule => card[rule.property] === rule.matchValue
          );

          if (specialRule) {
            // Si hay regla, aplicamos sus condiciones (ej: a la mesa, boca arriba)
            const modifiedCard = { ...card, isFaceUp: specialRule.isFaceUp };
            
            if (specialRule.destination === 'BOARD') {
              player.board.push(modifiedCard);
            } else if (specialRule.destination === 'HAND') {
              player.hand.push(modifiedCard);
            }
          } else {
            // Si no hay regla especial, va a la mano boca abajo por defecto
            player.hand.push({ ...card, isFaceUp: false });
          }
        });
      });

      return {
        players: updatedPlayers,
        deck: remainingDeck
      };
    }),

  // Add player to the game
  addPlayer: (player) => 
    set((state) => ({
      players: [...state.players, { ...player, board: [] }]
    })),

  // Play card to discard pile
  playCardToDiscard: (playerId, cardId) => 
    set((state) => {
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return state;

      const player = state.players[playerIndex];
      const cardToPlay = player.hand.find(c => c.id === cardId);
      if (!cardToPlay) return state;

      const newHand = player.hand.filter(c => c.id !== cardId);
      const updatedPlayers = [...state.players];
      updatedPlayers[playerIndex] = { ...player, hand: newHand };

      return {
        players: updatedPlayers,
        discardPile: [...state.discardPile, cardToPlay]
      };
    }),

  // PLay card to board (Tableau)
  playCardToBoard: (playerId, cardId) => 
    set((state) => {
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return state;

      const player = state.players[playerIndex];
      const cardToPlay = player.hand.find(c => c.id === cardId);
      if (!cardToPlay) return state;

      const newHand = player.hand.filter(c => c.id !== cardId);
      const updatedPlayers = [...state.players];
      
      // We take the card from the hand and put it on the board (Tableau)
      updatedPlayers[playerIndex] = { 
        ...player, 
        hand: newHand,
        board: [...(player.board || []), cardToPlay] 
      };

      return { players: updatedPlayers };
    }),

  // Destroy a card from the board and send it to the discard pile
  destroyBoardCard: (targetPlayerId, cardId) =>
    set((state) => {
      const targetIndex = state.players.findIndex(p => p.id === targetPlayerId);
      if (targetIndex === -1) return state;

      const targetPlayer = state.players[targetIndex];
      const cardToDestroy = targetPlayer.board.find(c => c.id === cardId);
      if (!cardToDestroy) return state;

      const newBoard = targetPlayer.board.filter(c => c.id !== cardId);
      const updatedPlayers = [...state.players];
      updatedPlayers[targetIndex] = { ...targetPlayer, board: newBoard };

      // We send the destroyed card to the discard pile
      return { 
        players: updatedPlayers,
        discardPile: [...state.discardPile, cardToDestroy]
      };
    }),

  // Steal a card from another player's board
  stealBoardCard: (playerId, targetPlayerId, cardId) =>
    set((state) => {
      // 1. Search for the player and the target player
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      const targetIndex = state.players.findIndex(p => p.id === targetPlayerId);
      
      if (playerIndex === -1 || targetIndex === -1) return state;

      const player = state.players[playerIndex];
      const targetPlayer = state.players[targetIndex];

      // 2. Search for the card in the target player's board
      const cardToSteal = targetPlayer.board.find(c => c.id === cardId);
      if (!cardToSteal) return state;

      // 3. Steal the card from the target player's board
      const newTargetBoard = targetPlayer.board.filter(c => c.id !== cardId);
      
      // 4. Move the card to the stealing player's board
      const newPlayerBoard = [...(player.board || []), cardToSteal];

      // 5. Save the changes in the state
      const updatedPlayers = [...state.players];
      updatedPlayers[targetIndex] = { ...targetPlayer, board: newTargetBoard };
      updatedPlayers[playerIndex] = { ...player, board: newPlayerBoard };

      return { players: updatedPlayers };
    }),

  // Withraw cards from the deck and add them to the player's hand
  drawCard: (playerId, amount = 1) => 
    set((state) => {
      if (state.deck.length === 0) return state;

      const playerIndex = state.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return state;

      const player = state.players[playerIndex];
      const cardsDrawn = state.deck.slice(0, amount);
      const remainingDeck = state.deck.slice(amount);

      const updatedPlayers = [...state.players];
      updatedPlayers[playerIndex] = { 
        ...player, 
        hand: [...player.hand, ...cardsDrawn] 
      };

      return {
        deck: remainingDeck,
        players: updatedPlayers
      };
    }),

  // Flip a card on the board
  flipBoardCard: (playerId, cardId) =>
    set((state) => {
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return state;

      const player = state.players[playerIndex];
      
      // Find the card in the player's board and flip its isFaceUp property
      const updatedBoard = player.board.map(card => {
        if (card.id === cardId) {
          return { ...card, isFaceUp: !card.isFaceUp };
        }
        return card;
      });

      const updatedPlayers = [...state.players];
      updatedPlayers[playerIndex] = { ...player, board: updatedBoard };

      return { players: updatedPlayers };
    }),

  // Discard cards
  executeDiscard: (targetPlayerId, zone, amount, isRandom, selectedCardId) =>
    set((state) => {
      const targetIndex = state.players.findIndex(p => p.id === targetPlayerId);
      if (targetIndex === -1) return state;

      const player = state.players[targetIndex];
      const sourceArray = zone === 'HAND' ? player.hand : player.board;
      
      if (sourceArray.length === 0) return state;

      let cardsToDiscard: Card[] = [];
      let remainingCards = [...sourceArray];

      if (isRandom) {
        // Random discard: we shuffle the array and take the first 'amount' cards
        const shuffled = [...sourceArray].sort(() => 0.5 - Math.random());
        cardsToDiscard = shuffled.slice(0, amount);
        remainingCards = sourceArray.filter(c => !cardsToDiscard.includes(c));
      } else if (selectedCardId) {
        // Choosed discard: we search for the card with the given ID and discard it
        const card = sourceArray.find(c => c.id === selectedCardId);
        if (card) {
          cardsToDiscard = [card];
          remainingCards = sourceArray.filter(c => c.id !== selectedCardId);
        }
      }

      // Save the changes in the state
      const updatedPlayers = [...state.players];
      updatedPlayers[targetIndex] = {
        ...player,
        [zone === 'HAND' ? 'hand' : 'board']: remainingCards
      };

      return {
        players: updatedPlayers,
        discardPile: [...state.discardPile, ...cardsToDiscard]
      };
    }),
    
  saveDeck: (newDeck) =>
    set((state) => ({
      savedDecks: [
        ...state.savedDecks.filter((d) => d.id !== newDeck.id),
        newDeck,
      ],
    })),

  setActiveDeck: (cards) => set({ deck: cards }),

  // Pass the turn to the next player
  nextTurn: () => 
    set((state) => {
      let nextIndex = state.currentPlayerIndex + state.turnDirection;
      if (nextIndex >= state.players.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = state.players.length - 1;
      return { currentPlayerIndex: nextIndex };
    })
}));