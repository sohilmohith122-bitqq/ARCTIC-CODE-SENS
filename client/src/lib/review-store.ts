import type { Review } from "@/types"

/** In-memory store for reviews created during the session. */
const store: Map<string, Review> = new Map()

export function saveReview(review: Review): void {
  store.set(review.id, review)
}

export function getReview(id: string): Review | undefined {
  return store.get(id)
}

export function listReviews(): Review[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function deleteReview(id: string): void {
  store.delete(id)
}
