import Foundation

struct SM2Result {
    let easinessFactor: Double
    let repetitions: Int
    let intervalDays: Int
    let nextReviewDate: Date
}

struct SM2SpacedRepetition {
    /// Calculate next spacing interval and easiness factor based on SuperMemo-2 (SM-2) algorithm.
    /// - Parameters:
    ///   - quality: User memory rating from 0 to 5 (0: complete blackout, 5: perfect recall)
    ///   - currentEF: Current Easiness Factor (default 2.5)
    ///   - currentRepetitions: Current count of consecutive successful repetitions
    ///   - currentIntervalDays: Current interval spacing in days
    /// - Returns: Updated SM2 parameters and calculated next review date
    static func calculate(
        quality: Int,
        currentEF: Double,
        currentRepetitions: Int,
        currentIntervalDays: Int
    ) -> SM2Result {
        // Clamp quality between 0 and 5
        let q = max(0, min(5, quality))
        
        // 1. Calculate new Easiness Factor (EF')
        // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        let qDiff = Double(5 - q)
        let deltaEF = 0.1 - qDiff * (0.08 + qDiff * 0.02)
        var newEF = currentEF + deltaEF
        
        // Ensure Easiness Factor never drops below 1.3
        if newEF < 1.3 {
            newEF = 1.3
        }
        
        // 2. Calculate consecutive repetitions (n) and interval (I)
        var newRepetitions = currentRepetitions
        var newIntervalDays = currentIntervalDays
        
        if q >= 3 {
            // Quality is satisfactory (>= 3): user recalled the word
            newRepetitions += 1
            
            if newRepetitions == 1 {
                newIntervalDays = 1
            } else if newRepetitions == 2 {
                newIntervalDays = 6
            } else {
                newIntervalDays = Int(round(Double(currentIntervalDays) * newEF))
            }
        } else {
            // Quality is unsatisfactory (< 3): user forgot the word
            newRepetitions = 0
            newIntervalDays = 1
        }
        
        // 3. Calculate next review date (current local time + interval days)
        let calendar = Calendar.current
        let nextReviewDate = calendar.date(byAdding: .day, value: newIntervalDays, to: Date()) ?? Date()
        
        return SM2Result(
            easinessFactor: newEF,
            repetitions: newRepetitions,
            intervalDays: newIntervalDays,
            nextReviewDate: nextReviewDate
        )
    }
}
