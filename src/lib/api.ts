// inputs {/api/*}, does {react-query хуки поверх read-only API}, returns {типизированные данные витрины}
import { useQuery } from '@tanstack/react-query'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return res.json()
}

export type NextRace = {
  round: number; raceName: string; circuit?: string; country?: string
  isSprint: boolean; lockUtc: string; raceUtc: string; total: number
}
export const useNextRace = () =>
  useQuery({ queryKey: ['next-race'], queryFn: () => get<NextRace>('/api/next-race'), refetchInterval: 60_000 })

export type DriverStanding = {
  position: string; points: string; wins: string
  Driver: { driverId: string; givenName: string; familyName: string; code?: string }
  Constructors: { constructorId: string; name: string }[]
}
export const useDriverStandings = () =>
  useQuery({
    queryKey: ['driver-standings'],
    queryFn: () => get<{ round: string; DriverStandings: DriverStanding[] }>('/api/standings/drivers'),
  })

export type ConstructorStanding = {
  position: string; points: string; wins: string
  Constructor: { constructorId: string; name: string }
}
export const useConstructorStandings = () =>
  useQuery({
    queryKey: ['constructor-standings'],
    queryFn: () => get<{ round: string; ConstructorStandings: ConstructorStanding[] }>('/api/standings/constructors'),
  })

export type Race = {
  round: string; raceName: string; date: string; time: string
  Circuit: { circuitId: string; circuitName: string; Location: { country: string; locality: string } }
  Sprint?: unknown
}
export const useCalendar = () =>
  useQuery({ queryKey: ['calendar'], queryFn: () => get<{ races: Race[] }>('/api/calendar') })

export type FantasyPlayer = {
  PlayerId: string; DisplayName: string; FUllName: string; TeamName: string
  PositionName: 'DRIVER' | 'CONSTRUCTOR'; DriverTLA?: string
  Value: number; OldPlayerValue: number
  OverallPpints: string; GamedayPoints: string
  SelectedPercentage: string; CaptainSelectedPercentage: string
}
export const useFantasy = () =>
  useQuery({ queryKey: ['fantasy'], queryFn: () => get<{ fetchedAt: string; players: FantasyPlayer[] }>('/api/fantasy') })
