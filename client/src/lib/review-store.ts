import type { Review } from "@/types"

const STORE_KEY = "arctic.reviews"

function load(): Map<string, Review> {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return new Map()
    const arr: Review[] = JSON.parse(raw)
    return new Map(arr.map((r) => [r.id, r]))
  } catch {
    return new Map()
  }
}

function persist(store: Map<string, Review>): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(store.values())))
}

export function saveReview(review: Review): void {
  const store = load()
  store.set(review.id, review)
  persist(store)
}

export function getReview(id: string): Review | undefined {
  return load().get(id)
}

export function listReviews(): Review[] {
  return Array.from(load().values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function deleteReview(id: string): void {
  const store = load()
  store.delete(id)
  persist(store)
}
