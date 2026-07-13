// inputs {static /data/*.json snapshots}, does {react-query хуки поверх статики + клиентский расчёт следующего этапа}, returns {типизированные данные витрины}
import { useQuery } from '@tanstack/react-query'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return res.json()
}

export type Race = {
  round: string; raceName: string; date: string; time: string
  Circuit: { circuitId: string; circuitName: string; Location: { country: string; locality: string } }
  Qualifying?: { date: string; time: string }
  SprintQualifying?: { date: string; time: string }
  Sprint?: unknown
}
export const useCalendar = () =>
  useQuery({ queryKey: ['calendar'], queryFn: () => get<{ races: Race[] }>('/data/jolpica/calendar.json') })

export type NextRace = {
  round: number; raceName: string; circuit?: string; country?: string
  isSprint: boolean; lockUtc: string; raceUtc: string; total: number
}
// клиентский расчёт: следующий этап + момент лока пиков (спринт → спринт-квала, иначе квала)
export function computeNextRace(races: Race[]): NextRace | null {
  const now = Date.now()
  for (const r of races) {
    const raceUtc = `${r.date}T${r.time}`
    if (new Date(raceUtc).getTime() + 3 * 3600e3 <= now) continue
    const q = r.SprintQualifying ?? r.Qualifying
    const lockUtc = q ? `${q.date}T${q.time}` : raceUtc
    return {
      round: Number(r.round), raceName: r.raceName,
      circuit: r.Circuit?.circuitName, country: r.Circuit?.Location?.country,
      isSprint: Boolean(r.Sprint), lockUtc, raceUtc, total: races.length,
    }
  }
  return null
}
export const useNextRace = () => {
  const cal = useCalendar()
  return { ...cal, data: cal.data ? computeNextRace(cal.data.races) : undefined }
}

export type DriverStanding = {
  position: string; points: string; wins: string
  Driver: { driverId: string; givenName: string; familyName: string; code?: string }
  Constructors: { constructorId: string; name: string }[]
}
export const useDriverStandings = () =>
  useQuery({
    queryKey: ['driver-standings'],
    queryFn: () => get<{ round: string; DriverStandings: DriverStanding[] }>('/data/jolpica/driver-standings.json'),
  })

export type ConstructorStanding = {
  position: string; points: string; wins: string
  Constructor: { constructorId: string; name: string }
}
export const useConstructorStandings = () =>
  useQuery({
    queryKey: ['constructor-standings'],
    queryFn: () => get<{ round: string; ConstructorStandings: ConstructorStanding[] }>('/data/jolpica/constructor-standings.json'),
  })

export type FantasyPlayer = {
  PlayerId: string; DisplayName: string; FUllName: string; TeamName: string
  PositionName: 'DRIVER' | 'CONSTRUCTOR'; DriverTLA?: string; DriverReference?: string
  LastName?: string
  Value: number; OldPlayerValue: number
  OverallPpints: string; GamedayPoints: string
  SelectedPercentage: string; CaptainSelectedPercentage: string
}
export const useFantasy = () =>
  useQuery({ queryKey: ['fantasy'], queryFn: () => get<{ fetchedAt: string; players: FantasyPlayer[] }>('/data/fantasy/players.json') })

export type PredictOption = { Id: number; Value: string; Points: string; Chance: string; Position: string; Type: number }
export type PredictQuestion = {
  Id: number; No: number; Text: string; SubText: string; Status: number
  Config: { Driver: number; Constructor: number; ChoiceLimit: number }
  Options: PredictOption[]
}
export type AnalysisIndexItem = { round: number; kind: 'preview' | 'debrief'; stage?: string; format: 'structured' | 'markdown'; file: string }
export const useAnalysisIndex = () =>
  useQuery({ queryKey: ['analysis-index'], queryFn: () => get<{ items: AnalysisIndexItem[] }>('/data/analyses/index.json') })
export const useAnalysis = (file?: string) =>
  useQuery({
    queryKey: ['analysis', file], enabled: !!file,
    queryFn: () => get<any>(`/data/analyses/${file}.json`),
  })

export type LeagueRow = { rank: number; team: string; account?: string; user: string; season: number; trend?: number; tag?: string; isMe?: boolean }
export type PredictLeague = {
  leagueName: string; leagueType: string; members: number; fetchedAt: string; sortNote?: string
  me: LeagueRow; standings: LeagueRow[]; rivals: LeagueRow[]
}
export const usePredictLeague = () =>
  useQuery({ queryKey: ['league-predict'], queryFn: () => get<PredictLeague>('/data/league/predict.json') })

export type FantasyLeague = {
  fetchedAt: string; privateLeague: unknown; note: string
  systemLeagues: { name: string; type: string; members: number; rank: number }[]
}
export const useFantasyLeague = () =>
  useQuery({ queryKey: ['league-fantasy'], queryFn: () => get<FantasyLeague>('/data/league/fantasy.json') })

export type Picks = {
  round: number; status: string; generated: string
  fantasy: {
    team: string; budgetUsed: number; budgetCap: number; captain: string
    drivers: { name: string; colorId: string; price: number; note?: string }[]
    constructors: { name: string; colorId: string; price: number }[]
  }
  predict: { question: string; answer: string; note?: string }[]
}
export const usePicks = (round?: number) =>
  useQuery({
    queryKey: ['picks', round], enabled: round != null, retry: false,
    queryFn: () => get<Picks>(`/data/picks/round-${round}.json`),
  })

export type Paddock = {
  round: number; stage: string
  clawdColumn?: { title: string; date: string; body: string }
  penalties: { driver: string; colorId: string; points: number; note?: string; tone?: string }[]
  upgrades: { team: string; colorId: string; part: string; verdict?: string; tone?: string }[]
  radio: { lap: string; text: string; tag?: string; tone?: string }[]
  rumors: { text: string; colorId?: string; prob?: number; impact?: string }[]
  fiaDocs: { date: string; text: string }[]
}
export const usePaddock = (round?: number) =>
  useQuery({
    queryKey: ['paddock', round], enabled: round != null, retry: false,
    queryFn: () => get<Paddock>(`/data/paddock/round-${round}.json`),
  })

export type ModelLearning = { id: number; date: string; title: string; trigger: string; text: string; applied: string }
export const useModel = () =>
  useQuery({ queryKey: ['model'], queryFn: () => get<{ promptVersion: string; learnings: ModelLearning[] }>('/data/model.json') })

export type PredictI18n = { questions: Record<string, string>; subtexts: Record<string, string>; options: Record<string, string> }
export const usePredictI18n = () =>
  useQuery({ queryKey: ['predict-i18n'], queryFn: () => get<PredictI18n>('/data/predict/i18n.json'), staleTime: Infinity })

export const usePredictIndex = () =>
  useQuery({ queryKey: ['predict-index'], queryFn: () => get<{ rounds: number[] }>('/data/predict/index.json') })
export const usePredictRound = (round?: number) =>
  useQuery({
    queryKey: ['predict-round', round], enabled: round != null,
    queryFn: () => get<{ round: number; fetchedAt: string; questions: PredictQuestion[] }>(`/data/predict/round-${round}.json`),
  })
