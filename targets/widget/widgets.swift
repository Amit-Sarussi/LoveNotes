import AppIntents
import SwiftUI
import WidgetKit

private let appGroupId = "group.me.amitsarussi.lovenotesapp"
private let widgetStateKey = "widget_state"

private struct WidgetStatePayload: Codable {
    let daysPassed: Int
    let viewedNoteIds: [Int]
    let syncedAtIso: String?
}

private func loadWidgetState() -> WidgetStatePayload {
    guard let defaults = UserDefaults(suiteName: appGroupId),
          let raw = defaults.string(forKey: widgetStateKey),
          let data = raw.data(using: .utf8),
          let decoded = try? JSONDecoder().decode(WidgetStatePayload.self, from: data)
    else {
        return WidgetStatePayload(daysPassed: 0, viewedNoteIds: [], syncedAtIso: nil)
    }
    return decoded
}

private func normalizedSyncedAtIso(_ syncedAtIso: String?, fallbackDate: Date) -> String {
    if let iso = syncedAtIso {
        let formatter = ISO8601DateFormatter()
        if formatter.date(from: iso) != nil {
            return iso
        }
    }
    // Backward compatibility for older payloads that had no/invalid sync timestamp.
    return ISO8601DateFormatter().string(from: fallbackDate)
}

private func dayDiffSinceSync(_ syncedAtIso: String?, now: Date) -> Int {
    guard let iso = syncedAtIso else { return 0 }
    let formatter = ISO8601DateFormatter()
    guard let syncDate = formatter.date(from: iso) else { return 0 }

    let calendar = Calendar.current
    let from = calendar.startOfDay(for: syncDate)
    let to = calendar.startOfDay(for: now)
    let diff = calendar.dateComponents([.day], from: from, to: to).day ?? 0
    return max(diff, 0)
}

/// PostScript names from the bundled TTFs (same files as `expo-font` in the app).
private enum LoveNotesFont {
    static let regular = "AvigulFM-Regular"
    static let bold = "AvigulFM-Bold"
}

private enum LoveNotesColors {
    static let primary = Color(red: 1.0, green: 0.459, blue: 0.561) // #FF758F
    static let letter = Color(red: 201 / 255, green: 24 / 255, blue: 74 / 255) // #c9184a
    /// Muted label on black→gray widget background
    static let onGradientMuted = Color(white: 0.72)
    static let gradientBlack = Color.black
    static let gradientGray = Color(red: 64 / 255, green: 64 / 255, blue: 64 / 255) // #404040
}

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        let state = loadWidgetState()
        let now = Date()
        let syncedAtIso = normalizedSyncedAtIso(state.syncedAtIso, fallbackDate: now)
        return SimpleEntry(
            date: now,
            configuration: ConfigurationAppIntent(),
            daysPassed: state.daysPassed,
            viewedNoteIds: state.viewedNoteIds,
            syncedAtIso: syncedAtIso
        )
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        let state = loadWidgetState()
        let now = Date()
        let syncedAtIso = normalizedSyncedAtIso(state.syncedAtIso, fallbackDate: now)
        return SimpleEntry(
            date: now,
            configuration: configuration,
            daysPassed: state.daysPassed,
            viewedNoteIds: state.viewedNoteIds,
            syncedAtIso: syncedAtIso
        )
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        let state = loadWidgetState()
        let currentDate = Date()
        let syncedAtIso = normalizedSyncedAtIso(state.syncedAtIso, fallbackDate: currentDate)
        let calendar = Calendar.current
        // Build a long day-by-day timeline so the widget can keep flipping state at midnight
        // even if the app is not opened for many days.
        var entries: [SimpleEntry] = []
        entries.append(SimpleEntry(
            date: currentDate,
            configuration: configuration,
            daysPassed: state.daysPassed,
            viewedNoteIds: state.viewedNoteIds,
            syncedAtIso: syncedAtIso
        ))

        let startOfToday = calendar.startOfDay(for: currentDate)
        let futureDays = 30
        for dayOffset in 1 ... futureDays {
            guard let boundaryDate = calendar.date(byAdding: .day, value: dayOffset, to: startOfToday) else {
                continue
            }
            entries.append(SimpleEntry(
                date: boundaryDate,
                configuration: configuration,
                daysPassed: state.daysPassed,
                viewedNoteIds: state.viewedNoteIds,
                syncedAtIso: syncedAtIso
            ))
        }

        // Ask WidgetKit for a fresh timeline after our last scheduled entry.
        let fallbackRefresh = calendar.date(byAdding: .hour, value: 1, to: entries.last?.date ?? currentDate) ?? currentDate
        return Timeline(entries: entries, policy: .after(fallbackRefresh))
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
    let daysPassed: Int
    let viewedNoteIds: [Int]
    let syncedAtIso: String?

    var effectiveDaysPassed: Int {
        daysPassed + dayDiffSinceSync(syncedAtIso, now: date)
    }

    /// Calendar day index for “today’s” note (matches app: note `daysPassed` is unlockable from day 1 upward).
    var todayNoteId: Int {
        min(max(effectiveDaysPassed, 1), 365)
    }

    var hasNoteForToday: Bool {
        effectiveDaysPassed >= 1
    }

    var hasReadTodaysNote: Bool {
        hasNoteForToday && viewedNoteIds.contains(todayNoteId)
    }

    var widgetURL: URL? {
        return URL(string: "love-notes://")
    }
}

struct widgetEntryView: View {
    var entry: Provider.Entry

    var body: some View {
        Group {
            if entry.effectiveDaysPassed == 0 || (entry.hasNoteForToday && !entry.hasReadTodaysNote) {
                VStack(spacing: 0) {
                    Image("Envelope")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 84, height: 84)
                    Text("יש לך פתק חדש")
                        .font(.custom(LoveNotesFont.bold, size: 22))
                        .foregroundStyle(LoveNotesColors.letter)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .environment(\.layoutDirection, .rightToLeft)
            } else {
                HStack(alignment: .firstTextBaseline, spacing: 0) {
                    Text("\(entry.effectiveDaysPassed)")
                        .font(.custom(LoveNotesFont.bold, size: 46))
                        .foregroundStyle(LoveNotesColors.primary)
                    Text("/365")
                        .font(.custom(LoveNotesFont.regular, size: 40))
                        .foregroundStyle(LoveNotesColors.onGradientMuted)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .containerBackground(for: .widget) {
            LinearGradient(
                colors: [LoveNotesColors.gradientGray, LoveNotesColors.gradientBlack],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
        .widgetURL(entry.widgetURL)
    }
}

struct widget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            widgetEntryView(entry: entry)
        }
    }
}

extension ConfigurationAppIntent {
    fileprivate static var smiley: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.favoriteEmoji = "😀"
        return intent
    }

    fileprivate static var starEyes: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.favoriteEmoji = "🤩"
        return intent
    }
}

#Preview(as: .systemSmall) {
    widget()
} timeline: {
    SimpleEntry(date: .now, configuration: .smiley, daysPassed: 12, viewedNoteIds: [1, 2, 3, 4, 5], syncedAtIso: nil)
    SimpleEntry(date: .now, configuration: .starEyes, daysPassed: 142, viewedNoteIds: Array(1 ... 142), syncedAtIso: nil)
}
