import AppIntents
import SwiftUI
import WidgetKit

private let appGroupId = "group.me.amitsarussi.lovenotesapp"
private let widgetStateKey = "widget_state"

private struct WidgetStatePayload: Codable {
    let daysPassed: Int
    let viewedNoteIds: [Int]
}

private func loadWidgetState() -> WidgetStatePayload {
    guard let defaults = UserDefaults(suiteName: appGroupId),
          let raw = defaults.string(forKey: widgetStateKey),
          let data = raw.data(using: .utf8),
          let decoded = try? JSONDecoder().decode(WidgetStatePayload.self, from: data)
    else {
        return WidgetStatePayload(daysPassed: 0, viewedNoteIds: [])
    }
    return decoded
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
        SimpleEntry(
            date: Date(),
            configuration: ConfigurationAppIntent(),
            daysPassed: 12,
            viewedNoteIds: [1, 2, 3, 4, 5]
        )
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        let state = loadWidgetState()
        return SimpleEntry(date: Date(), configuration: configuration, daysPassed: state.daysPassed, viewedNoteIds: state.viewedNoteIds)
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        let state = loadWidgetState()
        let currentDate = Date()
        let entry = SimpleEntry(date: currentDate, configuration: configuration, daysPassed: state.daysPassed, viewedNoteIds: state.viewedNoteIds)
        // One entry + reload policy so each refresh re-reads the app group (stale multi-entry timelines would reuse one snapshot).
        let nextRefresh = Calendar.current.date(byAdding: .minute, value: 1, to: currentDate)!
        return Timeline(entries: [entry], policy: .after(nextRefresh))
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
    let daysPassed: Int
    let viewedNoteIds: [Int]

    /// Calendar day index for “today’s” note (matches app: note `daysPassed` is unlockable from day 1 upward).
    var todayNoteId: Int {
        min(max(daysPassed, 1), 365)
    }

    var hasNoteForToday: Bool {
        daysPassed >= 1
    }

    var hasReadTodaysNote: Bool {
        hasNoteForToday && viewedNoteIds.contains(todayNoteId)
    }

    var widgetURL: URL? {
        if hasNoteForToday, !hasReadTodaysNote {
            return URL(string: "love-notes://note/\(todayNoteId)")
        }
        return URL(string: "love-notes://")
    }
}

struct widgetEntryView: View {
    var entry: Provider.Entry

    var body: some View {
        Group {
            if entry.hasNoteForToday, !entry.hasReadTodaysNote {
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
                    Text("\(entry.daysPassed)")
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
    SimpleEntry(date: .now, configuration: .smiley, daysPassed: 12, viewedNoteIds: [1, 2, 3, 4, 5])
    SimpleEntry(date: .now, configuration: .starEyes, daysPassed: 142, viewedNoteIds: Array(1 ... 142))
}
