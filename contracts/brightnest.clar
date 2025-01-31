;; BrightNest Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-found (err u404))
(define-constant err-already-exists (err u409))
(define-constant err-unauthorized (err u401))
(define-constant err-already-completed (err u400))

;; Data structures
(define-map habits 
  { owner: principal, habit-id: uint } 
  { name: (string-ascii 64), created-at: uint }
)

(define-map completions 
  { owner: principal, habit-id: uint, date: uint } 
  { completed: bool }
)

(define-map streaks
  { owner: principal, habit-id: uint }
  { current-streak: uint, longest-streak: uint, last-completion: uint }
)

(define-map points principal uint)

;; Data variables
(define-data-var habit-counter uint u0)

;; Public functions
(define-public (create-habit (name (string-ascii 64)))
  (let 
    (
      (habit-id (+ (var-get habit-counter) u1))
      (habit-data { owner: tx-sender, habit-id: habit-id })
    )
    (map-set habits 
      habit-data
      { name: name, created-at: block-height }
    )
    (var-set habit-counter habit-id)
    (ok habit-id)
  )
)

(define-public (complete-habit (habit-id uint))
  (let
    (
      (today (/ block-height u144))
      (completion-key { owner: tx-sender, habit-id: habit-id, date: today })
      (streak-key { owner: tx-sender, habit-id: habit-id })
    )
    (asserts! (is-some (map-get? habits { owner: tx-sender, habit-id: habit-id })) err-not-found)
    (asserts! (is-none (map-get? completions completion-key)) err-already-completed)
    
    (map-set completions completion-key { completed: true })
    (check-and-update-streak habit-id today)
    (add-points)
    (ok true)
  )
)

;; Private functions
(define-private (check-and-update-streak (habit-id uint) (today uint))
  (let
    (
      (streak-key { owner: tx-sender, habit-id: habit-id })
      (streak-data (default-to 
        { current-streak: u0, longest-streak: u0, last-completion: u0 } 
        (map-get? streaks streak-key)))
      (last-completion (get last-completion streak-data))
      (current-streak (get current-streak streak-data))
      (longest-streak (get longest-streak streak-data))
      (new-current (if (is-eq (- today u1) last-completion)
        (+ current-streak u1)
        u1))
    )
    (map-set streaks
      streak-key
      { 
        current-streak: new-current,
        longest-streak: (if (> new-current longest-streak) new-current longest-streak),
        last-completion: today
      }
    )
  )
)

(define-private (add-points)
  (let
    (
      (current-points (default-to u0 (map-get? points tx-sender)))
    )
    (map-set points tx-sender (+ current-points u10))
  )
)

;; Read only functions
(define-read-only (get-habit (habit-id uint))
  (map-get? habits { owner: tx-sender, habit-id: habit-id })
)

(define-read-only (get-streak (habit-id uint))
  (map-get? streaks { owner: tx-sender, habit-id: habit-id })
)

(define-read-only (get-points-balance (user principal))
  (ok (default-to u0 (map-get? points user)))
)
