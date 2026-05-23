import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
  gameId: null,
  currentRound: null,
  totalRounds: 5,
  totalScore: 0,
  roundResults: [],
  status: 'idle', // idle | playing | round_result | finished

  setGame: (game) => set({
    gameId: game.gameId ?? game.id,
    currentRound: game.currentRound ?? game.roundNumber ?? 1,
    totalRounds: game.totalRounds ?? game.rounds ?? 5,
    totalScore: game.totalScore ?? 0,
    status: 'playing',
    roundResults: [],
    currentRoundData: getRoundData(game),
    lastResult: null,
  }),

  setRoundResult: (result) => set((state) => ({
    roundResults: [...state.roundResults, result],
    totalScore: state.totalScore + (result.score || 0),
    status: 'round_result',
    lastResult: result,
  })),

  nextRound: (roundData) => set((state) => ({
    currentRound: roundData.currentRound ?? roundData.roundNumber ?? state.currentRound + 1,
    currentRoundData: getRoundData(roundData),
    status: 'playing',
    lastResult: null,
  })),

  finishGame: () => set({ status: 'finished' }),

  reset: () => set({
    gameId: null,
    currentRound: null,
    totalScore: 0,
    roundResults: [],
    status: 'idle',
    lastResult: null,
    currentRoundData: null,
  }),
}))

function getRoundData(data) {
  return (
    data.currentRoundData ??
    data.roundData ??
    data.round ??
    data.location ??
    data.currentLocation ??
    data
  )
}
