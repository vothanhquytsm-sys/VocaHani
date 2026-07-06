import Foundation
import Speech
import AVFoundation

@MainActor
class SpeechRecognizerManager: ObservableObject {
    @Published var transcript = ""
    @Published var isRecording = false
    @Published var permissionGranted = false
    @Published var pronunciationScore: Int? = nil
    @Published var recognizedWords: String = ""
    @Published var feedbackMessage: String = ""
    
    private var audioEngine: AVAudioEngine?
    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    
    init() {
        self.speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    }
    
    func requestPermissions() {
        SFSpeechRecognizer.requestAuthorization { authStatus in
            Task { @MainActor in
                if authStatus == .authorized {
                    #if os(iOS)
                    AVAudioSession.sharedInstance().requestRecordPermission { granted in
                        Task { @MainActor in
                            self.permissionGranted = granted
                        }
                    }
                    #elseif os(macOS)
                    AVCaptureDevice.requestAccess(for: .audio) { granted in
                        Task { @MainActor in
                            self.permissionGranted = granted
                        }
                    }
                    #else
                    self.permissionGranted = true
                    #endif
                } else {
                    self.permissionGranted = false
                }
            }
        }
    }
    
    func checkPermissionStatus() {
        let speechAuth = SFSpeechRecognizer.authorizationStatus()
        if speechAuth == .authorized {
            #if os(iOS)
            let recordAuth = AVAudioSession.sharedInstance().recordPermission
            self.permissionGranted = (recordAuth == .granted)
            #elseif os(macOS)
            let audioAuth = AVCaptureDevice.authorizationStatus(for: .audio)
            self.permissionGranted = (audioAuth == .authorized)
            #else
            self.permissionGranted = true
            #endif
        } else {
            self.permissionGranted = false
        }
    }
    
    func startRecording(targetWord: String) {
        self.transcript = ""
        self.pronunciationScore = nil
        self.recognizedWords = ""
        self.feedbackMessage = ""
        
        #if os(iOS)
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.playAndRecord, mode: .measurement, options: [.defaultToSpeaker, .allowBluetooth])
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            print("SpeechRecognizer Error: Failed to set audio session category: \(error)")
            return
        }
        #endif
        
        audioEngine = AVAudioEngine()
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        
        guard let audioEngine = audioEngine,
              let recognitionRequest = recognitionRequest,
              let speechRecognizer = speechRecognizer,
              speechRecognizer.isAvailable else {
            print("SpeechRecognizer Error: Speech recognizer not available or engine fail.")
            return
        }
        
        recognitionRequest.shouldReportPartialResults = true
        
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        
        inputNode.removeTap(onBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            recognitionRequest.append(buffer)
        }
        
        audioEngine.prepare()
        do {
            try audioEngine.start()
            isRecording = true
        } catch {
            print("SpeechRecognizer Error: Audio engine could not start: \(error)")
            return
        }
        
        recognitionTask = speechRecognizer.recognitionTask(with: recognitionRequest) { result, error in
            if let result = result {
                let text = result.bestTranscription.formattedString
                Task { @MainActor in
                    self.transcript = text
                }
            }
        }
    }
    
    func stopRecording(targetWord: String) {
        audioEngine?.stop()
        audioEngine?.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        isRecording = false
        
        recognitionTask?.cancel()
        recognitionTask = nil
        recognitionRequest = nil
        audioEngine = nil
        
        #if os(iOS)
        do {
            try AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        } catch {
            print("SpeechRecognizer Error: Failed to deactivate audio session: \(error)")
        }
        #endif
        
        evaluatePronunciation(targetWord: targetWord)
    }
    
    private func evaluatePronunciation(targetWord: String) {
        let cleanTarget = targetWord.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            .replacingOccurrences(of: ".", with: "")
            .replacingOccurrences(of: ",", with: "")
            .replacingOccurrences(of: "?", with: "")
            .replacingOccurrences(of: "!", with: "")
            .replacingOccurrences(of: "-", with: " ")
            
        let cleanTranscript = transcript.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            .replacingOccurrences(of: ".", with: "")
            .replacingOccurrences(of: ",", with: "")
            .replacingOccurrences(of: "?", with: "")
            .replacingOccurrences(of: "!", with: "")
            .replacingOccurrences(of: "-", with: " ")
            
        if cleanTranscript.isEmpty {
            self.pronunciationScore = 0
            self.feedbackMessage = "Không nhận diện được giọng nói. Hãy thử lại!"
            return
        }
        
        self.recognizedWords = transcript
        
        let dist = levenshteinDistance(cleanTarget, cleanTranscript)
        let maxLen = max(cleanTarget.count, cleanTranscript.count)
        
        if maxLen == 0 {
            self.pronunciationScore = 100
        } else {
            let ratio = Double(maxLen - dist) / Double(maxLen)
            let score = Int(ratio * 100)
            
            if cleanTranscript == cleanTarget {
                self.pronunciationScore = 100
            } else if cleanTarget.contains(cleanTranscript) || cleanTranscript.contains(cleanTarget) {
                self.pronunciationScore = max(score, 85)
            } else {
                self.pronunciationScore = max(score, 0)
            }
        }
        
        guard let finalScore = self.pronunciationScore else { return }
        
        if finalScore >= 90 {
            self.feedbackMessage = "Tuyệt vời! Phát âm của bạn rất chuẩn xác. 🎉"
        } else if finalScore >= 70 {
            self.feedbackMessage = "Khá tốt! Phát âm gần đúng rồi, cố lên chút nữa."
        } else {
            self.feedbackMessage = "Chưa chính xác lắm. Hãy bấm nghe lại phát âm chuẩn và thử lại!"
        }
    }
    
    private func levenshteinDistance(_ s1: String, _ s2: String) -> Int {
        let empty = [Int](repeating: 0, count: s2.count + 1)
        var last = [Int](0...s2.count)
        
        for (i, char1) in s1.enumerated() {
            var cur = empty
            cur[0] = i + 1
            for (j, char2) in s2.enumerated() {
                if char1 == char2 {
                    cur[j + 1] = last[j]
                } else {
                    cur[j + 1] = min(last[j], last[j + 1], cur[j]) + 1
                }
            }
            last = cur
        }
        return last.last ?? 0
    }
}
