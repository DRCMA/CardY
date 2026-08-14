// 1. TRIGGERS: 
export type TriggerType = 
  | 'ON_PLAY'          // Time when card is played
  | 'ON_DRAW'          // Time when card is drawn
  | 'ON_DISCARD'       // Time when card is discarded
  | 'TURN_START'       // Start player's time
  | 'TURN_END';        // End player's time

// 2. ACTIONS:
export type ActionType = 
  | 'DRAW_CARDS'       // Must draw a certain number of cards
  | 'SKIP_TURN'        // Skip the next player's turn
  | 'REVERSE_TURN'     // Reverse the order of turns
  | 'CHANGE_COLOR'     // Change the color of the game (for games like Uno)
  | 'DISCARD_HAND'     // Discard all cards in hand
  | 'DISCARD_CARD'     // Discard a specific card
  | 'STEAL_CARDS'      // Steal a certain number of cards from another player      
  | 'PLAY_TO_BOARD'    // Play a card directly to the board (without it being in hand)
  | 'ATTACH_TO_CARD'   // Attach an effect to another card in the Tableau(e.g., a curse or buff)
  | 'DESTROY_CARD'     // Destroy a card in Tableau play (remove it from the game)
  | 'FLIP_CARD';       // Flip a card in Tableau play 

// 3. EFFECTS
export interface CardEffect {
  id: string;
  trigger?: TriggerType;
  action?: ActionType;
  params?: Record<string, any>; // Additional parameters for the action (e.g., number of cards to draw)
  description: string;          // Description for the player to understand what the effect does
}
// Who chooses the target of the effect?
export type ChooserType = 
  | 'ACTOR'    // PLayer who played the card chooses
  | 'TARGET'   // Player who is the target of the effect chooses
  | 'RANDOM'   // The system chooses at random
  | 'ALL';     // All players choose (e.g., all discard 1)
// Where does the effect apply?
export type TargetZone = 
  | 'HAND'     // from the hand
  | 'BOARD'    // from the board
  | 'DECK';    // from the deck

// 4. THE CARD
export interface Card {
  id: string;              // Unique identifier for the card
  templateId: string;      // ID of the design/type (e.g., "uno-skip-red")
  name: string;            // Name of the card
  suitOrColor?: string;    // Suit (Hearts, Diamonds) or Color (Red, Blue)
  value?: number | string; // Value (7, "A", "King", "Skip")
  imageUrl?: string;       // Image of the card (optional)
  isFaceUp: boolean;       // true = face up, false = face down
  effects: CardEffect[];   // The effects that this card has
}

// 5. THE PLAYER
export interface Player {
  id: string;
  name: string;
  hand: Card[];            // The cards that the player has in their hand
  board: Card[];        // The cards that the player has played to the board (Tableau)
}

// 6. Card destination
export type DestinationZone = 'HAND' | 'BOARD' | 'DISCARD';

export interface DealRule {
  property: 'suitOrColor' | 'templateId' | 'name'; // What we see on the card
  matchValue: string;                              // The value that must match (e.g., "Blue")
  destination: DestinationZone;                    // Where it goes (e.g., "BOARD")
  isFaceUp: boolean;                               // Face up or face down?
}

export interface GameRules {
  id: string;
  name: string;
  defaultDrawAmount: number;    // Base card draw amount for each player at the start of the game
  dealRules: DealRule[];        // new rules for dealing cards
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: Card[];
  createdAt: number;
}