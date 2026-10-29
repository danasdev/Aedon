/** First-run tutorial state, kept per browser. */
const STORAGE_KEY = "aedon.tour.v1";

/** Whether the tour should open by itself (first visit to the editor). */
export function shouldAutoStartTour() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "done";
  } catch {
    return false;
  }
}

export function markTourDone() {
  try {
    localStorage.setItem(STORAGE_KEY, "done");
  } catch {
    /* private mode: the tour simply shows again next time */
  }
}
