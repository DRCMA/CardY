import { create } from 'zustand';
import { Card, Player } from '../types/game';

interface GameState {
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  turnDirection: 1 | -1;
  
  // Game actions
  addPlayer: (player: Player) => void;
  playCardToDiscard: (playerId: string, cardId: string) => void; 
  playCardToBoard: (playerId: string, cardId: string) => void;   
  destroyBoardCard: (targetPlayerId: string, cardId: string) => void; 
  stealBoardCard: (playerId: string, targetPlayerId: string, cardId: string) => void;
  drawCard: (playerId: string, amount?: number) => void;
  flipBoardCard: (playerId: string, cardId: string) => void;
  nextTurn: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  players: [],
  deck: [],
  discardPile: [],
  currentPlayerIndex: 0,
  turnDirection: 1,

  // 1. Add player to the game
  addPlayer: (player) => 
    set((state) => ({
      players: [...state.players, { ...player, board: [] }]
    })),

  // 2. Play card to discard pile
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

  // 3. PLay card to board (Tabeau)
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

  // 4. Destroy a card from the board and send it to the discard pile
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
  // 5. Withraw cards from the deck and add them to the player's hand
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

  nextTurn: () => 
    set((state) => {
      let nextIndex = state.currentPlayerIndex + state.turnDirection;
      if (nextIndex >= state.players.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = state.players.length - 1;
      return { currentPlayerIndex: nextIndex };
    })
}));