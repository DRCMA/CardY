import { Card, Player } from "@/types/game";

export const mockCards: Card[] = [
  {
    id: "c1",
    templateId: "t1",
    name: "Espada de Fuego",
    imageUrl: "⚔️",
    suitOrColor: "Roja",
    isFaceUp: true,
    effects: [],
  },
  {
    id: "c2",
    templateId: "t1",
    name: "Escudo Arcano",
    imageUrl: "🛡️",
    suitOrColor: "Azul",
    isFaceUp: true,
    effects: [],
  },
  {
    id: "c3",
    templateId: "t2",
    name: "Poción Vital",
    imageUrl: "🧪",
    suitOrColor: "Verde",
    isFaceUp: true,
    effects: [],
  },
  {
    id: "c4",
    templateId: "t2",
    name: "Relámpago",
    imageUrl: "⚡",
    suitOrColor: "Amarilla",
    isFaceUp: true,
    effects: [],
  },
];

export const mockPlayers: Player[] = [
  {
    id: "p1",
    name: "Jugador 1 (Tú)",
    hand: [mockCards[0], mockCards[1]],
    board: [],
  },
  {
    id: "p2",
    name: "Jugador 2 (Rival)",
    hand: [mockCards[2]],
    board: [mockCards[3]],
  },
];