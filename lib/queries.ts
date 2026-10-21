const MEDIA_CARD = `
fragment MediaCard on Media {
  id
  idMal
  title { romaji english native }
  coverImage { large extraLarge color }
  bannerImage
  format
  status
  episodes
  averageScore
  season
  seasonYear
  genres
  isAdult
  nextAiringEpisode { episode airingAt }
}
`;

export const HOME_QUERY = `
${MEDIA_CARD}
query Home($season: MediaSeason, $year: Int, $now: Int) {
  trending: Page(page: 1, perPage: 14) {
    media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
      ...MediaCard
      description(asHtml: false)
    }
  }
  season: Page(page: 1, perPage: 14) {
    media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC, isAdult: false) {
      ...MediaCard
    }
  }
  top: Page(page: 1, perPage: 14) {
    media(type: ANIME, sort: SCORE_DESC, isAdult: false) {
      ...MediaCard
    }
  }
  airing: Page(page: 1, perPage: 14) {
    media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC, isAdult: false) {
      ...MediaCard
    }
  }
  movies: Page(page: 1, perPage: 14) {
    media(type: ANIME, format: MOVIE, sort: POPULARITY_DESC, isAdult: false) {
      ...MediaCard
    }
  }
  recent: Page(page: 1, perPage: 14) {
    airingSchedules(airingAt_lesser: $now, sort: TIME_DESC) {
      airingAt
      episode
      media { ...MediaCard }
    }
  }
}
`;

export const BROWSE_QUERY = `
${MEDIA_CARD}
query Browse(
  $page: Int
  $search: String
  $genre: [String]
  $year: Int
  $season: MediaSeason
  $format: MediaFormat
  $status: MediaStatus
  $sort: [MediaSort]
) {
  Page(page: $page, perPage: 30) {
    pageInfo { currentPage lastPage hasNextPage total }
    media(
      type: ANIME
      search: $search
      genre_in: $genre
      seasonYear: $year
      season: $season
      format: $format
      status: $status
      sort: $sort
      isAdult: false
    ) {
      ...MediaCard
    }
  }
}
`;

export const DETAIL_QUERY = `
${MEDIA_CARD}
query Detail($id: Int!) {
  Media(id: $id, type: ANIME) {
    ...MediaCard
    description(asHtml: false)
    duration
    source
    popularity
    favourites
    startDate { year month day }
    endDate { year month day }
    studios(isMain: true) { nodes { id name } }
    trailer { id site }
    relations {
      edges {
        relationType
        node { ...MediaCard }
      }
    }
    recommendations(perPage: 12, sort: RATING_DESC) {
      nodes { mediaRecommendation { ...MediaCard } }
    }
    streamingEpisodes { title thumbnail url site }
  }
}
`;

export const WATCH_QUERY = `
${MEDIA_CARD}
query Watch($id: Int!) {
  Media(id: $id, type: ANIME) {
    ...MediaCard
    duration
    streamingEpisodes { title }
  }
}
`;

export const SCHEDULE_QUERY = `
${MEDIA_CARD}
query Schedule($page: Int, $from: Int, $to: Int) {
  Page(page: $page, perPage: 50) {
    pageInfo { hasNextPage }
    airingSchedules(
      airingAt_greater: $from
      airingAt_lesser: $to
      sort: TIME
    ) {
      id
      airingAt
      episode
      media { ...MediaCard }
    }
  }
}
`;

export const SEARCH_QUERY = `
query Search($search: String) {
  Page(page: 1, perPage: 8) {
    media(type: ANIME, search: $search, sort: POPULARITY_DESC, isAdult: false) {
      id
      idMal
      title { romaji english }
      coverImage { large color }
      format
      seasonYear
      averageScore
    }
  }
}
`;

export const AZ_QUERY = `
${MEDIA_CARD}
query Az($search: String, $page: Int) {
  Page(page: $page, perPage: 50) {
    pageInfo { hasNextPage }
    media(type: ANIME, search: $search, sort: POPULARITY_DESC, isAdult: false) {
      ...MediaCard
    }
  }
}
`;
