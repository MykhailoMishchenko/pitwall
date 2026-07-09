// inputs {jolpica ids / fantasy TeamName}, does {цвета команд + украинские имена}, returns {словари и хелперы}
export const TEAM_COLORS: Record<string, string> = {
  mercedes: '#27F4D2', ferrari: '#E8002D', mclaren: '#FF8000', red_bull: '#3671C6',
  alpine: '#0093CC', rb: '#6692FF', haas: '#B6BABD', williams: '#64C4FF',
  audi: '#D7DDE2', aston_martin: '#229971', cadillac: '#C6A15B',
}

const TEAMNAME_TO_ID: Record<string, string> = {
  'Mercedes': 'mercedes', 'Ferrari': 'ferrari', 'McLaren': 'mclaren', 'Red Bull': 'red_bull',
  'Red Bull Racing': 'red_bull', 'Alpine': 'alpine', 'Alpine F1 Team': 'alpine',
  'RB': 'rb', 'RB F1 Team': 'rb', 'Racing Bulls': 'rb', 'Haas': 'haas', 'Haas F1 Team': 'haas',
  'Williams': 'williams', 'Audi': 'audi', 'Aston Martin': 'aston_martin',
  'Cadillac': 'cadillac', 'Cadillac F1 Team': 'cadillac',
}

export function teamColor(idOrName: string): string {
  return TEAM_COLORS[idOrName] ?? TEAM_COLORS[TEAMNAME_TO_ID[idOrName] ?? ''] ?? '#8A939F'
}

export const DRIVER_UA: Record<string, string> = {
  antonelli: 'Антонеллі', russell: 'Расселл', hamilton: 'Гамільтон', leclerc: 'Леклер',
  norris: 'Норріс', piastri: 'Піастрі', max_verstappen: 'Ферстаппен', hadjar: 'Хаджар',
  gasly: 'Гаслі', lawson: 'Лоусон', arvid_lindblad: 'Ліндблад', bearman: 'Бірман',
  colapinto: 'Колапінто', bortoleto: 'Бортолето', sainz: 'Сайнс', albon: 'Албон',
  ocon: 'Окон', alonso: 'Алонсо', hulkenberg: 'Хюлькенберг', bottas: 'Боттас',
  perez: 'Перес', stroll: 'Стролл',
}

export function driverUa(driverId: string, familyName: string): string {
  return DRIVER_UA[driverId] ?? familyName
}

const GP_UA: Record<string, string> = {
  Belgium: 'Гран-прі Бельгії', Hungary: 'Гран-прі Угорщини', Netherlands: 'Гран-прі Нідерландів',
  Italy: 'Гран-прі Італії', Spain: 'Гран-прі Іспанії', Azerbaijan: 'Гран-прі Азербайджану',
  Singapore: 'Гран-прі Сінгапуру', USA: 'Гран-прі США', 'United States': 'Гран-прі США',
  Mexico: 'Гран-прі Мексики', Brazil: 'Гран-прі Бразилії', Qatar: 'Гран-прі Катару',
  UAE: 'Гран-прі Абу-Дабі', 'Saudi Arabia': 'Гран-прі Саудівської Аравії',
  Australia: 'Гран-прі Австралії', China: 'Гран-прі Китаю', Japan: 'Гран-прі Японії',
  Bahrain: 'Гран-прі Бахрейну', Monaco: 'Гран-прі Монако', Canada: 'Гран-прі Канади',
  Austria: 'Гран-прі Австрії', UK: 'Гран-прі Великої Британії',
  'Great Britain': 'Гран-прі Великої Британії',
}

export function gpUa(country?: string, raceName?: string): string {
  return (country && GP_UA[country]) || raceName || 'Гран-прі'
}
