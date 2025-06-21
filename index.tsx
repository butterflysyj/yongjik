
import React, { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx'; // For XLSX and CSV
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// pdf.js worker setup
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.3.136/build/pdf.worker.mjs';
}

// --- Toast Notification System ---
interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}
interface ToastContextType {
    addToast: (message: string, type: ToastMessage['type']) => void;
}
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToasts = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToasts must be used within a ToastProvider');
    }
    return context;
};

const ToastProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const toastIdRef = useRef(0);

    const addToast = useCallback((message: string, type: ToastMessage['type']) => {
        const id = toastIdRef.current++;
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        const duration = type === 'error' || type === 'warning' ? 7000 : 5000;
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-5 right-5 z-[100] w-full max-w-xs sm:max-w-sm space-y-3">
                {toasts.map(toast => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

interface ToastProps {
    message: string;
    type: ToastMessage['type'];
    onClose: () => void;
}
const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    const bgColor = useMemo(() => {
        switch (type) {
            case 'success': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            case 'warning': return 'bg-yellow-500';
            case 'info': return 'bg-blue-500';
            default: return 'bg-slate-600';
        }
    }, [type]);

    const icon = useMemo(() => {
        switch (type) {
            case 'success': return '✔️';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '';
        }
    }, [type]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); 
    };

    return (
        <div 
            role="alert" 
            aria-live={type === 'error' ? 'assertive' : 'polite'}
            className={`flex items-start justify-between p-4 rounded-md shadow-lg text-white ${bgColor} ${isExiting ? 'animate-slideOutRight' : 'animate-slideInRight'}`}
        >
            <div className="flex items-center">
                {icon && <span className="mr-2 text-lg">{icon}</span>}
                <p className="text-sm">{message}</p>
            </div>
            <button onClick={handleClose} aria-label="Close notification" className="ml-4 p-1 rounded-md hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-white/50 text-xl leading-none">&times;</button>
        </div>
    );
};


// --- Global Loading Indicator ---
const GlobalSpinner: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
    if (!isLoading) return null;
    return (
        <div className="fixed top-4 right-4 z-[200] p-2 bg-slate-700/80 rounded-full shadow-lg" aria-label="Loading content" role="status">
            <svg className="animate-spin h-6 w-6 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );
};


// v3.0.0 Enhanced User Settings with Next-Gen Features
interface UserSettings {
    grade: string;
    textbook: string; 
    dailyGoal: number;
    username: string;
    // 게임화 시스템 
    level: number;
    experience: number;
    totalExperience: number;
    badges: string[];
    streakDays: number;
    longestStreak: number;
    lastStudyDate: string | null;
    // 기본 환경 설정
    theme: 'dark' | 'light' | 'auto';
    soundEnabled: boolean;
    animationsEnabled: boolean;
    autoPlayAudio: boolean;
    // 다국어 및 소셜 기능
    language: 'ko' | 'en' | 'ja' | 'zh';
    studyReminders: boolean;
    socialSharing: boolean;
    customThemeColors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    // AI 및 발음 기능
    pronunciationPractice: boolean;
    aiTutorEnabled: boolean;
    adaptiveLearning: boolean;
    voiceSettings: {
        sensitivity: number;
        autoRecord: boolean;
        feedbackLevel: 'basic' | 'detailed' | 'expert';
    };
    learningPath: {
        currentPath: string;
        completedMilestones: string[];
        targetLevel: 'beginner' | 'intermediate' | 'advanced';
    };
    // 분석 및 개인화
    realTimeAnalytics: boolean;
    personalizedRecommendations: boolean;
    advancedGameification: boolean;
    learningInsights: boolean;
    sessionAnalytics: boolean;
    // 파일 처리
    autoSaveExtractedWords: boolean;
    smartWordFiltering: boolean;
    bulkWordProcessing: boolean;
    fileAnalysisReports: boolean;
    // v3.0.0 New Features - Mobile & Performance
    mobileOptimized: boolean;
    hapticFeedback: boolean;
    gestureNavigation: boolean;
    offlineMode: boolean;
    autoSync: boolean;
    dataCompression: boolean;
    // v3.0.0 New Features - Advanced AI
    contextualLearning: boolean;
    semanticSearch: boolean;
    intelligentReview: boolean;
    adaptiveDifficulty: boolean;
    multiModalLearning: boolean;
    // v3.0.0 New Features - Enhanced UX
    immersiveMode: boolean;
    focusMode: boolean;
    studyStreaks2: boolean;
    motivationalMessages: boolean;
    progressCelebrations: boolean;
    // v3.0.0 New Features - Collaboration
    studyGroups: boolean;
    competitiveMode: boolean;
    peerLearning: boolean;
    mentorSystem: boolean;
    // v3.0.0 New Features - Accessibility
    highContrast: boolean;
    largeText: boolean;
    voiceNavigation: boolean;
    screenReader: boolean;
    colorBlindSupport: boolean;
}

// v3.0.0 Enhanced Multi-language Support System
interface LanguageTexts {
    [key: string]: {
        [key: string]: string;
    };
}

const languageTexts: LanguageTexts = {
    ko: {
        // v3.0.0 기본
        appName: 'WordMaster Pro',
        version: 'v3.0.0',
        subtitle: 'Next-Gen AI 영단어 학습',
        welcome: '안녕하세요',
        loading: '로딩 중...',
        error: '오류',
        success: '성공',
        cancel: '취소',
        confirm: '확인',
        save: '저장',
        delete: '삭제',
        edit: '편집',
        back: '뒤로',
        next: '다음',
        previous: '이전',
        // v3.0.0 새로운 UI 요소
        tryAgain: '다시 시도',
        refresh: '새로고침',
        profile: '프로필',
        achievements: '업적',
        insights: '인사이트',
        analytics: '분석',
        performance: '성과',
        // v3.0.0 모바일 최적화
        swipeHint: '좌우로 스와이프하세요',
        tapToFlip: '탭하여 뒤집기',
        holdToSpeak: '길게 눌러 발음',
        // v3.0.0 AI 기능
        aiTutor: 'AI 튜터',
        smartReview: '스마트 복습',
        personalizedPath: '맞춤 학습 경로',
        contextualHelp: '상황별 도움말',
        // 대시보드
        dashboard: '대시보드',
        todayLearning: '오늘의 학습',
        totalLearned: '총 학습 단어',
        streak: '연속 학습',
        level: '레벨',
        experience: '경험치',
        badges: '배지',
        // 학습
        learn: '학습',
        quiz: '퀴즈',
        flashcards: '플래시카드',
        wordManagement: '단어 관리',
        statistics: '통계',
        // 설정
        settings: '설정',
        theme: '테마',
        language: '언어',
        soundEnabled: '사운드 활성화',
        notifications: '알림',
        // PWA
        installApp: '앱 설치',
        offlineReady: '오프라인 준비 완료',
        updateAvailable: '업데이트 사용 가능'
    },
    en: {
        // General
        appName: 'WordMaster Pro',
        welcome: 'Welcome',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        // Dashboard
        dashboard: 'Dashboard',
        todayLearning: "Today's Learning",
        totalLearned: 'Total Words Learned',
        streak: 'Streak',
        level: 'Level',
        experience: 'Experience',
        badges: 'Badges',
        // Learning
        learn: 'Learn',
        quiz: 'Quiz',
        flashcards: 'Flashcards',
        wordManagement: 'Word Management',
        statistics: 'Statistics',
        // Settings
        settings: 'Settings',
        theme: 'Theme',
        language: 'Language',
        soundEnabled: 'Sound Enabled',
        notifications: 'Notifications',
        // PWA
        installApp: 'Install App',
        offlineReady: 'Offline Ready',
        updateAvailable: 'Update Available'
    },
    ja: {
        // 일반
        appName: 'WordMaster Pro',
        welcome: 'ようこそ',
        loading: '読み込み中...',
        error: 'エラー',
        success: '成功',
        cancel: 'キャンセル',
        confirm: '確認',
        save: '保存',
        delete: '削除',
        edit: '編集',
        back: '戻る',
        next: '次へ',
        previous: '前へ',
        // Dashboard
        dashboard: 'ダッシュボード',
        todayLearning: '今日の学習',
        totalLearned: '総学習単語',
        streak: '連続学習',
        level: 'レベル',
        experience: '経験値',
        badges: 'バッジ',
        // Learning
        learn: '学習',
        quiz: 'クイズ',
        flashcards: 'フラッシュカード',
        wordManagement: '単語管理',
        statistics: '統計',
        // Settings
        settings: '設定',
        theme: 'テーマ',
        language: '言語',
        soundEnabled: 'サウンド有効',
        notifications: '通知',
        // PWA
        installApp: 'アプリをインストール',
        offlineReady: 'オフライン準備完了',
        updateAvailable: 'アップデート利用可能'
    },
    zh: {
        // 一般
        appName: 'WordMaster Pro',
        welcome: '欢迎',
        loading: '加载中...',
        error: '错误',
        success: '成功',
        cancel: '取消',
        confirm: '确认',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        back: '返回',
        next: '下一个',
        previous: '上一个',
        // Dashboard
        dashboard: '仪表板',
        todayLearning: '今日学习',
        totalLearned: '总学习单词',
        streak: '连续学习',
        level: '等级',
        experience: '经验值',
        badges: '徽章',
        // Learning
        learn: '学习',
        quiz: '测验',
        flashcards: '闪卡',
        wordManagement: '单词管理',
        statistics: '统计',
        // Settings
        settings: '设置',
        theme: '主题',
        language: '语言',
        soundEnabled: '启用声音',
        notifications: '通知',
        // PWA
        installApp: '安装应用',
        offlineReady: '离线准备就绪',
        updateAvailable: '有可用更新'
    }
};

// 다국어 텍스트 가져오기 함수
const getText = (key: string, language: 'ko' | 'en' | 'ja' | 'zh' = 'ko'): string => {
    return languageTexts[language]?.[key] || languageTexts.ko[key] || key;
};

// PWA 설치 관리자
class PWAInstallManager {
    private deferredPrompt: any = null;
    private isInstalled = false;

    constructor() {
        this.init();
    }

    private init() {
        // PWA 설치 프롬프트 감지
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            console.log('💾 PWA 설치 프롬프트 준비됨');
        });

        // PWA 설치 완료 감지
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            console.log('🎉 PWA 설치 완료');
        });

        // 이미 설치된 PWA인지 확인
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
        }
    }

    public canInstall(): boolean {
        return this.deferredPrompt !== null && !this.isInstalled;
    }

    public async install(): Promise<boolean> {
        if (!this.canInstall()) {
            return false;
        }

        try {
            this.deferredPrompt.prompt();
            const choiceResult = await this.deferredPrompt.userChoice;
            
            if (choiceResult.outcome === 'accepted') {
                console.log('✅ PWA 설치 승인');
                this.deferredPrompt = null;
                return true;
            } else {
                console.log('❌ PWA 설치 거부');
                return false;
            }
        } catch (error) {
            console.error('PWA 설치 오류:', error);
            return false;
        }
    }

    public isAppInstalled(): boolean {
        return this.isInstalled;
    }
}

// PWA 알림 관리자
class PWANotificationManager {
    private permission: NotificationPermission = 'default';

    constructor() {
        this.init();
    }

    private init() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
        }
    }

    public async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        this.permission = permission;
        return permission === 'granted';
    }

    public async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
        if (this.permission !== 'granted') {
            return;
        }

        try {
            new Notification(title, {
                icon: '/icon-192.png',
                badge: '/badge-72.png',
                ...options
            });
        } catch (error) {
            console.error('알림 표시 오류:', error);
        }
    }

    public scheduleStudyReminder(userSettings: UserSettings): void {
        if (!userSettings.studyReminders || this.permission !== 'granted') {
            return;
        }

        // 매일 오후 7시에 학습 알림 (간단한 예시)
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(19, 0, 0, 0);

        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const timeUntilReminder = reminderTime.getTime() - now.getTime();

        setTimeout(() => {
            this.showNotification(
                getText('appName', userSettings.language),
                {
                    body: '오늘의 영단어 학습을 시작해보세요! 🎓',
                    tag: 'daily-reminder',
                    requireInteraction: true
                }
            );
        }, timeUntilReminder);
    }
}

// 소셜 공유 관리자
class SocialShareManager {
    public async shareProgress(userSettings: UserSettings, stats: any): Promise<boolean> {
        if (!userSettings.socialSharing) {
            return false;
        }

        const shareData = {
            title: getText('appName', userSettings.language),
            text: `${userSettings.username}님이 WordMaster Pro에서 레벨 ${userSettings.level}을 달성했습니다! 🎓✨`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                return true;
            } else {
                // 폴백: 클립보드에 복사
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                return true;
            }
        } catch (error) {
            console.error('공유 오류:', error);
            return false;
        }
    }

    public async shareWord(word: Word, userSettings: UserSettings): Promise<boolean> {
        if (!userSettings.socialSharing) {
            return false;
        }

        const shareData = {
            title: `📚 ${word.term} - WordMaster Pro`,
            text: `"${word.term}" (${word.meaning}) - ${word.exampleSentence}`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                return true;
            } else {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                return true;
            }
        } catch (error) {
            console.error('단어 공유 오류:', error);
            return false;
        }
    }
}

// 글로벌 매니저 인스턴스
const pwaInstallManager = new PWAInstallManager();
const pwaNotificationManager = new PWANotificationManager();
const socialShareManager = new SocialShareManager();

// Define props for screen components
interface ScreenProps {
    userSettings: UserSettings;
    onNavigate: (screen: AppScreen, params?: any) => void;
    currentScreen?: AppScreen; 
    setGlobalLoading: (loading: boolean) => void; 
    addToast: (message: string, type: ToastMessage['type']) => void;
    openSettingsModal: () => void; // Added for opening settings modal
}

type AppScreen = 'loginSetup' | 'dashboard' | 'learnWords' | 'quiz' | 'allWords' | 'stats' | 'manageWords' | 'flashcards';

interface Word {
    id: number | string; 
    term: string; 
    pronunciation?: string; 
    partOfSpeech: string; 
    meaning: string; 
    exampleSentence: string;
    exampleSentenceMeaning?: string; 
    gradeLevel: string; 
    isCustom?: boolean; 
}

interface WordStat {
    id: number | string;
    isMastered: boolean;
    lastReviewed: string | null; 
    quizIncorrectCount: number;
    // SRS (Spaced Repetition System) 관련 필드 추가
    srsLevel: number; // 0-5: 학습 단계 (0=새 단어, 5=완전히 암기됨)
    nextReviewDate: string | null; // 다음 복습 예정일
    easeFactor: number; // 2.5 기본값, 쉬운 정도에 따라 조정 (1.3-3.0)
    consecutiveCorrect: number; // 연속 정답 횟수
    totalReviews: number; // 총 복습 횟수
    averageResponseTime: number; // 평균 응답 시간 (초)
    confidenceLevel: number; // 자신감 레벨 (1-5)
}


const sampleWords: Word[] = [
    // OCR Page 1 Words (1-60) -> gradeLevel: "middle1"
    { id: 1, term: "person", partOfSpeech: "명사", meaning: "사람", exampleSentence: "This is a person.", exampleSentenceMeaning: "이것은 사람입니다.", gradeLevel: "middle1" },
    { id: 2, term: "life", partOfSpeech: "명사", meaning: "삶, 생명", exampleSentence: "This is a life.", exampleSentenceMeaning: "이것은 삶입니다.", gradeLevel: "middle1" },
    { id: 3, term: "job", partOfSpeech: "명사", meaning: "일, 직업", exampleSentence: "This is a job.", exampleSentenceMeaning: "이것은 일입니다.", gradeLevel: "middle1" },
    { id: 4, term: "country", partOfSpeech: "명사", meaning: "국가, 시골", exampleSentence: "This is a country.", exampleSentenceMeaning: "이것은 국가입니다.", gradeLevel: "middle1" },
    { id: 5, term: "earth", partOfSpeech: "명사", meaning: "지구, 흙", exampleSentence: "This is an earth.", exampleSentenceMeaning: "이것은 지구입니다.", gradeLevel: "middle1" },
    { id: 6, term: "problem", partOfSpeech: "명사", meaning: "문제", exampleSentence: "This is a problem.", exampleSentenceMeaning: "이것은 문제입니다.", gradeLevel: "middle1" },
    { id: 7, term: "way", partOfSpeech: "명사", meaning: "길, 방법", exampleSentence: "This is a way.", exampleSentenceMeaning: "이것은 길입니다.", gradeLevel: "middle1" },
    { id: 8, term: "language", partOfSpeech: "명사", meaning: "언어", exampleSentence: "This is a language.", exampleSentenceMeaning: "이것은 언어입니다.", gradeLevel: "middle1" },
    { id: 9, term: "story", partOfSpeech: "명사", meaning: "이야기, 충", exampleSentence: "This is a story.", exampleSentenceMeaning: "이것은 이야기입니다.", gradeLevel: "middle1" },
    { id: 10, term: "lot", partOfSpeech: "명사", meaning: "운, 운세", exampleSentence: "This is a lot.", exampleSentenceMeaning: "이것은 운입니다.", gradeLevel: "middle1" },
    { id: 11, term: "name", partOfSpeech: "명사", meaning: "이름", exampleSentence: "This is a name.", exampleSentenceMeaning: "이것은 이름입니다.", gradeLevel: "middle1" },
    { id: 12, term: "hand", partOfSpeech: "명사", meaning: "손, 건네다", exampleSentence: "This is a hand.", exampleSentenceMeaning: "이것은 손입니다.", gradeLevel: "middle1" },
    { id: 13, term: "place", partOfSpeech: "명사", meaning: "장소", exampleSentence: "This is a place.", exampleSentenceMeaning: "이것은 장소입니다.", gradeLevel: "middle1" },
    { id: 14, term: "practice", partOfSpeech: "명사", meaning: "연습, 실천", exampleSentence: "This is a practice.", exampleSentenceMeaning: "이것은 연습입니다.", gradeLevel: "middle1" },
    { id: 15, term: "work", partOfSpeech: "명사", meaning: "일, 작품", exampleSentence: "This is a work.", exampleSentenceMeaning: "이것은 일입니다.", gradeLevel: "middle1" },
    { id: 16, term: "use", partOfSpeech: "동사", meaning: "사용하다", exampleSentence: "I like to use.", exampleSentenceMeaning: "나는 사용하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 17, term: "kind", partOfSpeech: "형용사", meaning: "친절한, 종류", exampleSentence: "It is very kind.", exampleSentenceMeaning: "그것은 매우 친절한합니다.", gradeLevel: "middle1" },
    { id: 18, term: "fun", partOfSpeech: "명사", meaning: "재미", exampleSentence: "This is fun.", exampleSentenceMeaning: "이것은 재미입니다.", gradeLevel: "middle1" },
    { id: 19, term: "future", partOfSpeech: "명사", meaning: "미래", exampleSentence: "This is the future.", exampleSentenceMeaning: "이것은 미래입니다.", gradeLevel: "middle1" },
    { id: 20, term: "have", partOfSpeech: "동사", meaning: "가지다", exampleSentence: "I like to have.", exampleSentenceMeaning: "나는 가지는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 21, term: "make", partOfSpeech: "동사", meaning: "만들다", exampleSentence: "I like to make.", exampleSentenceMeaning: "나는 만드는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 22, term: "let", partOfSpeech: "동사", meaning: "~하게 해주다", exampleSentence: "I like to let.", exampleSentenceMeaning: "나는 ~하게 해주는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 23, term: "get", partOfSpeech: "동사", meaning: "얻다, 취하다", exampleSentence: "I like to get.", exampleSentenceMeaning: "나는 얻는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 24, term: "take", partOfSpeech: "동사", meaning: "가져가다", exampleSentence: "I like to take.", exampleSentenceMeaning: "나는 가져가는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 25, term: "different", partOfSpeech: "형용사", meaning: "다른, 다양한", exampleSentence: "It is very different.", exampleSentenceMeaning: "그것은 매우 다른합니다.", gradeLevel: "middle1" },
    { id: 26, term: "important", partOfSpeech: "형용사", meaning: "중요한", exampleSentence: "It is very important.", exampleSentenceMeaning: "그것은 매우 중요한합니다.", gradeLevel: "middle1" },
    { id: 27, term: "right", partOfSpeech: "형용사", meaning: "옳은, 권리", exampleSentence: "It is very right.", exampleSentenceMeaning: "그것은 매우 옳은합니다.", gradeLevel: "middle1" },
    { id: 28, term: "sure", partOfSpeech: "형용사", meaning: "확실한", exampleSentence: "It is very sure.", exampleSentenceMeaning: "그것은 매우 확실한합니다.", gradeLevel: "middle1" },
    { id: 29, term: "well", partOfSpeech: "부사", meaning: "잘, 우물", exampleSentence: "He works well.", exampleSentenceMeaning: "그는 잘 일해요.", gradeLevel: "middle1" },
    { id: 30, term: "hard", partOfSpeech: "형용사", meaning: "딱딱한, 열심히", exampleSentence: "It is very hard.", exampleSentenceMeaning: "그것은 매우 딱딱한합니다.", gradeLevel: "middle1" },
    { id: 31, term: "clothes", partOfSpeech: "명사", meaning: "천, 옷감", exampleSentence: "These are clothes.", exampleSentenceMeaning: "이것들은 천입니다.", gradeLevel: "middle1" },
    { id: 32, term: "movie", partOfSpeech: "명사", meaning: "영화", exampleSentence: "This is a movie.", exampleSentenceMeaning: "이것은 영화입니다.", gradeLevel: "middle1" },
    { id: 33, term: "activity", partOfSpeech: "명사", meaning: "활동", exampleSentence: "This is an activity.", exampleSentenceMeaning: "이것은 활동입니다.", gradeLevel: "middle1" },
    { id: 34, term: "example", partOfSpeech: "명사", meaning: "예, 사례", exampleSentence: "This is an example.", exampleSentenceMeaning: "이것은 예입니다.", gradeLevel: "middle1" },
    { id: 35, term: "dialogue", partOfSpeech: "명사", meaning: "대화", exampleSentence: "This is a dialogue.", exampleSentenceMeaning: "이것은 대화입니다.", gradeLevel: "middle1" },
    { id: 36, term: "letter", partOfSpeech: "명사", meaning: "편지", exampleSentence: "This is a letter.", exampleSentenceMeaning: "이것은 편지입니다.", gradeLevel: "middle1" },
    { id: 37, term: "fire", partOfSpeech: "명사", meaning: "불, 해고하다", exampleSentence: "This is a fire.", exampleSentenceMeaning: "이것은 불입니다.", gradeLevel: "middle1" },
    { id: 38, term: "minute", partOfSpeech: "명사", meaning: "분", exampleSentence: "This is a minute.", exampleSentenceMeaning: "이것은 분입니다.", gradeLevel: "middle1" },
    { id: 39, term: "part", partOfSpeech: "명사", meaning: "부분, 일부", exampleSentence: "This is a part.", exampleSentenceMeaning: "이것은 부분입니다.", gradeLevel: "middle1" },
    { id: 40, term: "plan", partOfSpeech: "명사", meaning: "계획", exampleSentence: "This is a plan.", exampleSentenceMeaning: "이것은 계획입니다.", gradeLevel: "middle1" },
    { id: 41, term: "plant", partOfSpeech: "명사", meaning: "식물, 심다", exampleSentence: "This is a plant.", exampleSentenceMeaning: "이것은 식물입니다.", gradeLevel: "middle1" },
    { id: 42, term: "park", partOfSpeech: "명사", meaning: "공원, 주차하다", exampleSentence: "This is a park.", exampleSentenceMeaning: "이것은 공원입니다.", gradeLevel: "middle1" },
    { id: 43, term: "call", partOfSpeech: "동사", meaning: "부르다, 전화하다", exampleSentence: "I like to call.", exampleSentenceMeaning: "나는 부르는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 44, term: "try", partOfSpeech: "동사", meaning: "노력하다", exampleSentence: "I like to try.", exampleSentenceMeaning: "나는 노력하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 45, term: "need", partOfSpeech: "동사", meaning: "필요로 하다", exampleSentence: "I like to need.", exampleSentenceMeaning: "나는 필요로 하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 46, term: "keep", partOfSpeech: "동사", meaning: "지키다, 유지하다", exampleSentence: "I like to keep.", exampleSentenceMeaning: "나는 지키는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 47, term: "listen", partOfSpeech: "동사", meaning: "듣다", exampleSentence: "I like to listen.", exampleSentenceMeaning: "나는 듣는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 48, term: "find", partOfSpeech: "동사", meaning: "찾다, 발견하다", exampleSentence: "I like to find.", exampleSentenceMeaning: "나는 찾는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 49, term: "learn", partOfSpeech: "동사", meaning: "배우다", exampleSentence: "I like to learn.", exampleSentenceMeaning: "나는 배우는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 50, term: "live", partOfSpeech: "동사", meaning: "살다", exampleSentence: "I like to live.", exampleSentenceMeaning: "나는 사는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 51, term: "mean", partOfSpeech: "동사", meaning: "의미하다", exampleSentence: "I like to mean.", exampleSentenceMeaning: "나는 의미하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 52, term: "last", partOfSpeech: "동사", meaning: "지속하다", exampleSentence: "I like to last.", exampleSentenceMeaning: "나는 지속하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 53, term: "any", partOfSpeech: "형용사", meaning: "어떤", exampleSentence: "It is very any.", exampleSentenceMeaning: "그것은 매우 어떤합니다.", gradeLevel: "middle1" },
    { id: 54, term: "each", partOfSpeech: "형용사", meaning: "각각의", exampleSentence: "It is very each.", exampleSentenceMeaning: "그것은 매우 각각의합니다.", gradeLevel: "middle1" },
    { id: 55, term: "other", partOfSpeech: "형용사", meaning: "다른", exampleSentence: "It is very other.", exampleSentenceMeaning: "그것은 매우 다른합니다.", gradeLevel: "middle1" },
    { id: 56, term: "another", partOfSpeech: "형용사", meaning: "또 다른", exampleSentence: "It is very another.", exampleSentenceMeaning: "그것은 매우 또 다른합니다.", gradeLevel: "middle1" },
    { id: 57, term: "same", partOfSpeech: "형용사", meaning: "같은", exampleSentence: "It is very same.", exampleSentenceMeaning: "그것은 매우 같은합니다.", gradeLevel: "middle1" },
    { id: 58, term: "too", partOfSpeech: "부사", meaning: "또한, 너무", exampleSentence: "He works too.", exampleSentenceMeaning: "그는 또한 일해요.", gradeLevel: "middle1" },
    { id: 59, term: "also", partOfSpeech: "부사", meaning: "또한", exampleSentence: "He works also.", exampleSentenceMeaning: "그는 또한 일해요.", gradeLevel: "middle1" },
    { id: 60, term: "really", partOfSpeech: "부사", meaning: "정말로", exampleSentence: "He works really.", exampleSentenceMeaning: "그는 정말로 일해요.", gradeLevel: "middle1" },
    { id: 61, term: "bird", partOfSpeech: "명사", meaning: "새", exampleSentence: "This is a bird.", exampleSentenceMeaning: "이것은 새입니다.", gradeLevel: "middle1" },
    { id: 62, term: "restaurant", partOfSpeech: "명사", meaning: "식당", exampleSentence: "This is a restaurant.", exampleSentenceMeaning: "이것은 식당입니다.", gradeLevel: "middle1" },
    { id: 63, term: "trip", partOfSpeech: "명사", meaning: "여행, 출장", exampleSentence: "This is a trip.", exampleSentenceMeaning: "이것은 여행입니다.", gradeLevel: "middle1" },
    { id: 64, term: "vacation", partOfSpeech: "명사", meaning: "휴가, 방학", exampleSentence: "This is a vacation.", exampleSentenceMeaning: "이것은 휴가입니다.", gradeLevel: "middle1" },
    { id: 65, term: "space", partOfSpeech: "명사", meaning: "공간, 우주", exampleSentence: "This is a space.", exampleSentenceMeaning: "이것은 공간입니다.", gradeLevel: "middle1" },
    { id: 66, term: "street", partOfSpeech: "명사", meaning: "거리", exampleSentence: "This is a street.", exampleSentenceMeaning: "이것은 거리입니다.", gradeLevel: "middle1" },
    { id: 67, term: "side", partOfSpeech: "명사", meaning: "측, 입장", exampleSentence: "This is a side.", exampleSentenceMeaning: "이것은 측입니다.", gradeLevel: "middle1" },
    { id: 68, term: "paper", partOfSpeech: "명사", meaning: "종이", exampleSentence: "This is a paper.", exampleSentenceMeaning: "이것은 종이입니다.", gradeLevel: "middle1" },
    { id: 69, term: "newspaper", partOfSpeech: "명사", meaning: "신문", exampleSentence: "This is a newspaper.", exampleSentenceMeaning: "이것은 신문입니다.", gradeLevel: "middle1" },
    { id: 70, term: "face", partOfSpeech: "명사", meaning: "얼굴, 마주하다", exampleSentence: "This is a face.", exampleSentenceMeaning: "이것은 얼굴입니다.", gradeLevel: "middle1" },
    { id: 71, term: "mind", partOfSpeech: "명사", meaning: "마음, 꺼리다", exampleSentence: "This is a mind.", exampleSentenceMeaning: "이것은 마음입니다.", gradeLevel: "middle1" },
    { id: 72, term: "change", partOfSpeech: "동사", meaning: "변화하다", exampleSentence: "I like to change.", exampleSentenceMeaning: "나는 변화하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 73, term: "visit", partOfSpeech: "동사", meaning: "방문하다", exampleSentence: "I like to visit.", exampleSentenceMeaning: "나는 방문하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 74, term: "start", partOfSpeech: "동사", meaning: "시작하다", exampleSentence: "I like to start.", exampleSentenceMeaning: "나는 시작하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 75, term: "watch", partOfSpeech: "동사", meaning: "주시하다", exampleSentence: "I like to watch.", exampleSentenceMeaning: "나는 주시하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 76, term: "light", partOfSpeech: "명사", meaning: "빛, 가벼운", exampleSentence: "This is a light.", exampleSentenceMeaning: "이것은 빛입니다.", gradeLevel: "middle1" },
    { id: 77, term: "present", partOfSpeech: "명사", meaning: "현재, 선물", exampleSentence: "This is a present.", exampleSentenceMeaning: "이것은 현재입니다.", gradeLevel: "middle1" },
    { id: 78, term: "middle", partOfSpeech: "명사", meaning: "중간의", exampleSentence: "This is the middle.", exampleSentenceMeaning: "이것은 중간의입니다.", gradeLevel: "middle1" },
    { id: 79, term: "favorite", partOfSpeech: "형용사", meaning: "좋아하는", exampleSentence: "It is very favorite.", exampleSentenceMeaning: "그것은 매우 좋아하는합니다.", gradeLevel: "middle1" },
    { id: 80, term: "enjoy", partOfSpeech: "동사", meaning: "즐기다", exampleSentence: "I like to enjoy.", exampleSentenceMeaning: "나는 즐기는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 81, term: "win", partOfSpeech: "동사", meaning: "이기다, 획득하다", exampleSentence: "I like to win.", exampleSentenceMeaning: "나는 이기는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 82, term: "understand", partOfSpeech: "동사", meaning: "이해하다", exampleSentence: "I like to understand.", exampleSentenceMeaning: "나는 이해하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 83, term: "warm", partOfSpeech: "형용사", meaning: "따뜻한", exampleSentence: "It is very warm.", exampleSentenceMeaning: "그것은 매우 따뜻한합니다.", gradeLevel: "middle1" },
    { id: 84, term: "clean", partOfSpeech: "동사", meaning: "청소하다", exampleSentence: "I like to clean.", exampleSentenceMeaning: "나는 청소하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 85, term: "own", partOfSpeech: "형용사", meaning: "자신의, 소유하다", exampleSentence: "It is very own.", exampleSentenceMeaning: "그것은 매우 자신의합니다.", gradeLevel: "middle1" },
    { id: 86, term: "interesting", partOfSpeech: "형용사", meaning: "흥미로운", exampleSentence: "It is very interesting.", exampleSentenceMeaning: "그것은 매우 흥미로운합니다.", gradeLevel: "middle1" },
    { id: 87, term: "famous", partOfSpeech: "형용사", meaning: "유명한", exampleSentence: "It is very famous.", exampleSentenceMeaning: "그것은 매우 유명한합니다.", gradeLevel: "middle1" },
    { id: 88, term: "special", partOfSpeech: "형용사", meaning: "특별한", exampleSentence: "It is very special.", exampleSentenceMeaning: "그것은 매우 특별한합니다.", gradeLevel: "middle1" },
    { id: 89, term: "fast", partOfSpeech: "형용사", meaning: "빠른", exampleSentence: "It is very fast.", exampleSentenceMeaning: "그것은 매우 빠른합니다.", gradeLevel: "middle1" },
    { id: 90, term: "only", partOfSpeech: "부사", meaning: "오직, 유일한", exampleSentence: "He works only.", exampleSentenceMeaning: "그는 오직 일해요.", gradeLevel: "middle1" },
    { id: 91, term: "nature", partOfSpeech: "명사", meaning: "자연, 본성", exampleSentence: "This is nature.", exampleSentenceMeaning: "이것은 자연입니다.", gradeLevel: "middle1" },
    { id: 92, term: "state", partOfSpeech: "명사", meaning: "상태, 진술하다", exampleSentence: "This is a state.", exampleSentenceMeaning: "이것은 상태입니다.", gradeLevel: "middle1" },
    { id: 93, term: "island", partOfSpeech: "명사", meaning: "섬", exampleSentence: "This is an island.", exampleSentenceMeaning: "이것은 섬입니다.", gradeLevel: "middle1" },
    { id: 94, term: "group", partOfSpeech: "명사", meaning: "무리, 무리 짓다", exampleSentence: "This is a group.", exampleSentenceMeaning: "이것은 무리입니다.", gradeLevel: "middle1" },
    { id: 95, term: "soldier", partOfSpeech: "명사", meaning: "군인", exampleSentence: "This is a soldier.", exampleSentenceMeaning: "이것은 군인입니다.", gradeLevel: "middle1" },
    { id: 96, term: "habit", partOfSpeech: "명사", meaning: "습관", exampleSentence: "This is a habit.", exampleSentenceMeaning: "이것은 습관입니다.", gradeLevel: "middle1" },
    { id: 97, term: "culture", partOfSpeech: "명사", meaning: "문화", exampleSentence: "This is a culture.", exampleSentenceMeaning: "이것은 문화입니다.", gradeLevel: "middle1" },
    { id: 98, term: "history", partOfSpeech: "명사", meaning: "역사", exampleSentence: "This is history.", exampleSentenceMeaning: "이것은 역사입니다.", gradeLevel: "middle1" },
    { id: 99, term: "information", partOfSpeech: "명사", meaning: "정보", exampleSentence: "This is information.", exampleSentenceMeaning: "이것은 정보입니다.", gradeLevel: "middle1" },
    { id: 100, term: "advertisement", partOfSpeech: "명사", meaning: "광고", exampleSentence: "This is an advertisement.", exampleSentenceMeaning: "이것은 광고입니다.", gradeLevel: "middle1" },
    { id: 101, term: "science", partOfSpeech: "명사", meaning: "과학", exampleSentence: "This is science.", exampleSentenceMeaning: "이것은 과학입니다.", gradeLevel: "middle1" },
    { id: 102, term: "war", partOfSpeech: "명사", meaning: "전쟁", exampleSentence: "This is a war.", exampleSentenceMeaning: "이것은 전쟁입니다.", gradeLevel: "middle1" },
    { id: 103, term: "store", partOfSpeech: "명사", meaning: "상점, 저장하다", exampleSentence: "This is a store.", exampleSentenceMeaning: "이것은 상점입니다.", gradeLevel: "middle1" },
    { id: 104, term: "sound", partOfSpeech: "명사", meaning: "소리, 들리다", exampleSentence: "This is a sound.", exampleSentenceMeaning: "이것은 소리입니다.", gradeLevel: "middle1" },
    { id: 105, term: "point", partOfSpeech: "명사", meaning: "핵심, 가리키다", exampleSentence: "This is a point.", exampleSentenceMeaning: "이것은 핵심입니다.", gradeLevel: "middle1" },
    { id: 106, term: "land", partOfSpeech: "동사", meaning: "착륙하다", exampleSentence: "I like to land.", exampleSentenceMeaning: "나는 착륙하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 107, term: "turn", partOfSpeech: "동사", meaning: "차례, 회전하다", exampleSentence: "I like to turn.", exampleSentenceMeaning: "나는 차례는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 108, term: "fly", partOfSpeech: "동사", meaning: "날다, 파리", exampleSentence: "I like to fly.", exampleSentenceMeaning: "나는 나는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 109, term: "begin", partOfSpeech: "동사", meaning: "시작하다", exampleSentence: "I like to begin.", exampleSentenceMeaning: "나는 시작하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 110, term: "grow", partOfSpeech: "동사", meaning: "자라다", exampleSentence: "I like to grow.", exampleSentenceMeaning: "나는 자라는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 111, term: "believe", partOfSpeech: "동사", meaning: "믿다", exampleSentence: "I like to believe.", exampleSentenceMeaning: "나는 믿는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 112, term: "worry", partOfSpeech: "동사", meaning: "걱정하다", exampleSentence: "I like to worry.", exampleSentenceMeaning: "나는 걱정하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 113, term: "save", partOfSpeech: "동사", meaning: "구하다, 저장하다", exampleSentence: "I like to save.", exampleSentenceMeaning: "나는 구하는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 114, term: "please", partOfSpeech: "동사", meaning: "만족시키다", exampleSentence: "I like to please.", exampleSentenceMeaning: "나는 만족시키는 것을 좋아해요.", gradeLevel: "middle1" },
    { id: 115, term: "easy", partOfSpeech: "형용사", meaning: "쉬운", exampleSentence: "It is very easy.", exampleSentenceMeaning: "그것은 매우 쉬운합니다.", gradeLevel: "middle1" },
    { id: 116, term: "poor", partOfSpeech: "형용사", meaning: "가난한, 어설픈", exampleSentence: "It is very poor.", exampleSentenceMeaning: "그것은 매우 가난한합니다.", gradeLevel: "middle1" },
    { id: 117, term: "such", partOfSpeech: "형용사", meaning: "그러한, 그렇게", exampleSentence: "It is very such.", exampleSentenceMeaning: "그것은 매우 그러한합니다.", gradeLevel: "middle1" },
    { id: 118, term: "just", partOfSpeech: "부사", meaning: "단지, 정당한", exampleSentence: "He works just.", exampleSentenceMeaning: "그는 단지 일해요.", gradeLevel: "middle1" },
    { id: 119, term: "back", partOfSpeech: "명사", meaning: "뒤, 등", exampleSentence: "This is the back.", exampleSentenceMeaning: "이것은 뒤입니다.", gradeLevel: "middle1" },
    { id: 120, term: "always", partOfSpeech: "부사", meaning: "항상", exampleSentence: "He works always.", exampleSentenceMeaning: "그는 항상 일해요.", gradeLevel: "middle1" },
    { id: 121, term: "village", partOfSpeech: "명사", meaning: "마을", exampleSentence: "This is a village.", exampleSentenceMeaning: "이것은 마을입니다.", gradeLevel: "middle2" },
    { id: 122, term: "forest", partOfSpeech: "명사", meaning: "숲", exampleSentence: "This is a forest.", exampleSentenceMeaning: "이것은 숲입니다.", gradeLevel: "middle2" },
    { id: 123, term: "leaf", partOfSpeech: "명사", meaning: "나뭇잎", exampleSentence: "This is a leaf.", exampleSentenceMeaning: "이것은 나뭇잎입니다.", gradeLevel: "middle2" },
    { id: 124, term: "vegetable", partOfSpeech: "명사", meaning: "채소", exampleSentence: "This is a vegetable.", exampleSentenceMeaning: "이것은 채소입니다.", gradeLevel: "middle2" },
    { id: 125, term: "office", partOfSpeech: "명사", meaning: "사무실", exampleSentence: "This is an office.", exampleSentenceMeaning: "이것은 사무실입니다.", gradeLevel: "middle2" },
    { id: 126, term: "machine", partOfSpeech: "명사", meaning: "기계", exampleSentence: "This is a machine.", exampleSentenceMeaning: "이것은 기계입니다.", gradeLevel: "middle2" },
    { id: 127, term: "area", partOfSpeech: "명사", meaning: "지역, 영역", exampleSentence: "This is an area.", exampleSentenceMeaning: "이것은 지역입니다.", gradeLevel: "middle2" },
    { id: 128, term: "piece", partOfSpeech: "명사", meaning: "조각", exampleSentence: "This is a piece.", exampleSentenceMeaning: "이것은 조각입니다.", gradeLevel: "middle2" },
    { id: 129, term: "grace", partOfSpeech: "명사", meaning: "은혜, 은총", exampleSentence: "This is a grace.", exampleSentenceMeaning: "이것은 은혜입니다.", gradeLevel: "middle2" },
    { id: 130, term: "spring", partOfSpeech: "명사", meaning: "봄, 샘물, 튀다", exampleSentence: "This is a spring.", exampleSentenceMeaning: "이것은 봄입니다.", gradeLevel: "middle2" },
    { id: 131, term: "rock", partOfSpeech: "명사", meaning: "바위, 흔들다", exampleSentence: "This is a rock.", exampleSentenceMeaning: "이것은 바위입니다.", gradeLevel: "middle2" },
    { id: 132, term: "line", partOfSpeech: "명사", meaning: "선", exampleSentence: "This is a line.", exampleSentenceMeaning: "이것은 선입니다.", gradeLevel: "middle2" },
    { id: 133, term: "exercise", partOfSpeech: "동사", meaning: "운동하다", exampleSentence: "I like to exercise.", exampleSentenceMeaning: "나는 운동하는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 134, term: "end", partOfSpeech: "명사", meaning: "끝, 목적", exampleSentence: "This is the end.", exampleSentenceMeaning: "이것은 끝입니다.", gradeLevel: "middle2" },
    { id: 135, term: "cook", partOfSpeech: "동사", meaning: "요리하다", exampleSentence: "I like to cook.", exampleSentenceMeaning: "나는 요리하는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 136, term: "fall", partOfSpeech: "동사", meaning: "떨어지다, 가을", exampleSentence: "I like to fall.", exampleSentenceMeaning: "나는 떨어지는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 137, term: "front", partOfSpeech: "명사", meaning: "앞, 전면", exampleSentence: "This is the front.", exampleSentenceMeaning: "이것은 앞입니다.", gradeLevel: "middle2" },
    { id: 138, term: "second", partOfSpeech: "명사", meaning: "두 번째, 초", exampleSentence: "This is a second.", exampleSentenceMeaning: "이것은 두 번째입니다.", gradeLevel: "middle2" },
    { id: 139, term: "cold", partOfSpeech: "형용사", meaning: "추운, 감기", exampleSentence: "It is very cold.", exampleSentenceMeaning: "그것은 매우 추운합니다.", gradeLevel: "middle2" },
    { id: 140, term: "happen", partOfSpeech: "동사", meaning: "일어나다", exampleSentence: "I like to happen.", exampleSentenceMeaning: "나는 일어나는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 141, term: "leave", partOfSpeech: "동사", meaning: "떠나다, 방치하다", exampleSentence: "I like to leave.", exampleSentenceMeaning: "나는 떠나는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 142, term: "remember", partOfSpeech: "동사", meaning: "기억하다", exampleSentence: "I like to remember.", exampleSentenceMeaning: "나는 기억하는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 143, term: "wear", partOfSpeech: "동사", meaning: "입다, 닳다", exampleSentence: "I like to wear.", exampleSentenceMeaning: "나는 입는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 144, term: "move", partOfSpeech: "동사", meaning: "움직이다", exampleSentence: "I like to move.", exampleSentenceMeaning: "나는 움직이는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 145, term: "send", partOfSpeech: "동사", meaning: "보내다", exampleSentence: "I like to send.", exampleSentenceMeaning: "나는 보내는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 146, term: "large", partOfSpeech: "형용사", meaning: "큰, 거대한", exampleSentence: "It is very large.", exampleSentenceMeaning: "그것은 매우 큰합니다.", gradeLevel: "middle2" },
    { id: 147, term: "hot", partOfSpeech: "형용사", meaning: "뜨거운, 매운", exampleSentence: "It is very hot.", exampleSentenceMeaning: "그것은 매우 뜨거운합니다.", gradeLevel: "middle2" },
    { id: 148, term: "early", partOfSpeech: "부사", meaning: "일찍", exampleSentence: "He works early.", exampleSentenceMeaning: "그는 일찍 일해요.", gradeLevel: "middle2" },
    { id: 149, term: "often", partOfSpeech: "부사", meaning: "종종, 자주", exampleSentence: "He works often.", exampleSentenceMeaning: "그는 종종 일해요.", gradeLevel: "middle2" },
    { id: 150, term: "sometimes", partOfSpeech: "부사", meaning: "때때로", exampleSentence: "He works sometimes.", exampleSentenceMeaning: "그는 때때로 일해요.", gradeLevel: "middle2" },
    { id: 151, term: "neighbor", partOfSpeech: "명사", meaning: "이웃, 동네", exampleSentence: "This is a neighbor.", exampleSentenceMeaning: "이것은 이웃입니다.", gradeLevel: "middle2" },
    { id: 152, term: "pet", partOfSpeech: "명사", meaning: "애완동물", exampleSentence: "This is a pet.", exampleSentenceMeaning: "이것은 애완동물입니다.", gradeLevel: "middle2" },
    { id: 153, term: "bottle", partOfSpeech: "명사", meaning: "병", exampleSentence: "This is a bottle.", exampleSentenceMeaning: "이것은 병입니다.", gradeLevel: "middle2" },
    { id: 154, term: "art", partOfSpeech: "명사", meaning: "예술, 기술", exampleSentence: "This is an art.", exampleSentenceMeaning: "이것은 예술입니다.", gradeLevel: "middle2" },
    { id: 155, term: "poem", partOfSpeech: "명사", meaning: "시", exampleSentence: "This is a poem.", exampleSentenceMeaning: "이것은 시입니다.", gradeLevel: "middle2" },
    { id: 156, term: "subject", partOfSpeech: "명사", meaning: "과목, 주제", exampleSentence: "This is a subject.", exampleSentenceMeaning: "이것은 과목입니다.", gradeLevel: "middle2" },
    { id: 157, term: "weekend", partOfSpeech: "명사", meaning: "주말", exampleSentence: "This is a weekend.", exampleSentenceMeaning: "이것은 주말입니다.", gradeLevel: "middle2" },
    { id: 158, term: "price", partOfSpeech: "명사", meaning: "가격", exampleSentence: "This is a price.", exampleSentenceMeaning: "이것은 가격입니다.", gradeLevel: "middle2" },
    { id: 159, term: "custom", partOfSpeech: "명사", meaning: "관습", exampleSentence: "This is a custom.", exampleSentenceMeaning: "이것은 관습입니다.", gradeLevel: "middle2" },
    { id: 160, term: "fact", partOfSpeech: "명사", meaning: "사실", exampleSentence: "This is a fact.", exampleSentenceMeaning: "이것은 사실입니다.", gradeLevel: "middle2" },
    { id: 161, term: "rule", partOfSpeech: "명사", meaning: "규칙, 통치하다", exampleSentence: "This is a rule.", exampleSentenceMeaning: "이것은 규칙입니다.", gradeLevel: "middle2" },
    { id: 162, term: "break", partOfSpeech: "동사", meaning: "깨다, 휴식", exampleSentence: "I like to break.", exampleSentenceMeaning: "나는 깨는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 163, term: "check", partOfSpeech: "동사", meaning: "확인하다", exampleSentence: "I like to check.", exampleSentenceMeaning: "나는 확인하는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 164, term: "stay", partOfSpeech: "동사", meaning: "머물다", exampleSentence: "I like to stay.", exampleSentenceMeaning: "나는 머무는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 165, term: "bring", partOfSpeech: "동사", meaning: "가져오다", exampleSentence: "I like to bring.", exampleSentenceMeaning: "나는 가져오는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 166, term: "build", partOfSpeech: "동사", meaning: "짓다, 축적하다", exampleSentence: "I like to build.", exampleSentenceMeaning: "나는 짓는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 167, term: "join", partOfSpeech: "동사", meaning: "합류하다", exampleSentence: "I like to join.", exampleSentenceMeaning: "나는 합류하는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 168, term: "lose", partOfSpeech: "동사", meaning: "지다, 길을 잃다", exampleSentence: "I like to lose.", exampleSentenceMeaning: "나는 지는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 169, term: "die", partOfSpeech: "동사", meaning: "죽다", exampleSentence: "I like to die.", exampleSentenceMeaning: "나는 죽는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 170, term: "half", partOfSpeech: "명사", meaning: "절반의", exampleSentence: "This is a half.", exampleSentenceMeaning: "이것은 절반의입니다.", gradeLevel: "middle2" },
    { id: 171, term: "few", partOfSpeech: "형용사", meaning: "거의 없는", exampleSentence: "It is very few.", exampleSentenceMeaning: "그것은 매우 거의 없는합니다.", gradeLevel: "middle2" },
    { id: 172, term: "both", partOfSpeech: "형용사", meaning: "둘 다", exampleSentence: "It is very both.", exampleSentenceMeaning: "그것은 매우 둘 다합니다.", gradeLevel: "middle2" },
    { id: 173, term: "sick", partOfSpeech: "형용사", meaning: "아픈", exampleSentence: "It is very sick.", exampleSentenceMeaning: "그것은 매우 아픈합니다.", gradeLevel: "middle2" },
    { id: 174, term: "busy", partOfSpeech: "형용사", meaning: "바쁜", exampleSentence: "It is very busy.", exampleSentenceMeaning: "그것은 매우 바쁜합니다.", gradeLevel: "middle2" },
    { id: 175, term: "real", partOfSpeech: "형용사", meaning: "실제의, 진정한", exampleSentence: "It is very real.", exampleSentenceMeaning: "그것은 매우 실제의합니다.", gradeLevel: "middle2" },
    { id: 176, term: "wrong", partOfSpeech: "형용사", meaning: "잘못된", exampleSentence: "It is very wrong.", exampleSentenceMeaning: "그것은 매우 잘못된합니다.", gradeLevel: "middle2" },
    { id: 177, term: "most", partOfSpeech: "형용사", meaning: "대부분의", exampleSentence: "It is very most.", exampleSentenceMeaning: "그것은 매우 대부분의합니다.", gradeLevel: "middle2" },
    { id: 178, term: "late", partOfSpeech: "형용사", meaning: "늦은", exampleSentence: "It is very late.", exampleSentenceMeaning: "그것은 매우 늦은합니다.", gradeLevel: "middle2" },
    { id: 179, term: "together", partOfSpeech: "부사", meaning: "함께", exampleSentence: "He works together.", exampleSentenceMeaning: "그는 함께 일해요.", gradeLevel: "middle2" },
    { id: 180, term: "even", partOfSpeech: "부사", meaning: "심지어, 평평한", exampleSentence: "He works even.", exampleSentenceMeaning: "그는 심지어 일해요.", gradeLevel: "middle2" },
    { id: 181, term: "health", partOfSpeech: "명사", meaning: "건강", exampleSentence: "This is health.", exampleSentenceMeaning: "이것은 건강입니다.", gradeLevel: "middle2" },
    { id: 182, term: "holiday", partOfSpeech: "명사", meaning: "휴일", exampleSentence: "This is a holiday.", exampleSentenceMeaning: "이것은 휴일입니다.", gradeLevel: "middle2" },
    { id: 183, term: "gift", partOfSpeech: "명사", meaning: "선물, 재능", exampleSentence: "This is a gift.", exampleSentenceMeaning: "이것은 선물입니다.", gradeLevel: "middle2" },
    { id: 184, term: "field", partOfSpeech: "명사", meaning: "분야, 들판", exampleSentence: "This is a field.", exampleSentenceMeaning: "이것은 분야입니다.", gradeLevel: "middle2" },
    { id: 185, term: "site", partOfSpeech: "명사", meaning: "위치, 유적", exampleSentence: "This is a site.", exampleSentenceMeaning: "이것은 위치입니다.", gradeLevel: "middle2" },
    { id: 186, term: "goal", partOfSpeech: "명사", meaning: "목표", exampleSentence: "This is a goal.", exampleSentenceMeaning: "이것은 목표입니다.", gradeLevel: "middle2" },
    { id: 187, term: "effect", partOfSpeech: "명사", meaning: "효과", exampleSentence: "This is an effect.", exampleSentenceMeaning: "이것은 효과입니다.", gradeLevel: "middle2" },
    { id: 188, term: "sign", partOfSpeech: "명사", meaning: "신호, 징조", exampleSentence: "This is a sign.", exampleSentenceMeaning: "이것은 신호입니다.", gradeLevel: "middle2" },
    { id: 189, term: "report", partOfSpeech: "동사", meaning: "보고하다", exampleSentence: "I like to report.", exampleSentenceMeaning: "나는 보고하는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 190, term: "order", partOfSpeech: "명사", meaning: "주문, 명령, 질서", exampleSentence: "This is an order.", exampleSentenceMeaning: "이것은 주문입니다.", gradeLevel: "middle2" },
    { id: 191, term: "experience", partOfSpeech: "동사", meaning: "경험하다", exampleSentence: "I like to experience.", exampleSentenceMeaning: "나는 경험하는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 192, term: "result", partOfSpeech: "명사", meaning: "결과", exampleSentence: "This is a result.", exampleSentenceMeaning: "이것은 결과입니다.", gradeLevel: "middle2" },
    { id: 193, term: "ride", partOfSpeech: "동사", meaning: "타다, 주행하다", exampleSentence: "I like to ride.", exampleSentenceMeaning: "나는 타는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 194, term: "wish", partOfSpeech: "동사", meaning: "소망하다", exampleSentence: "I like to wish.", exampleSentenceMeaning: "나는 소망하는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 195, term: "human", partOfSpeech: "명사", meaning: "인간", exampleSentence: "This is a human.", exampleSentenceMeaning: "이것은 인간입니다.", gradeLevel: "middle2" },
    { id: 196, term: "past", partOfSpeech: "명사", meaning: "과거, 지난", exampleSentence: "This is the past.", exampleSentenceMeaning: "이것은 과거입니다.", gradeLevel: "middle2" },
    { id: 197, term: "carry", partOfSpeech: "동사", meaning: "휴대하다, 옮기다", exampleSentence: "I like to carry.", exampleSentenceMeaning: "나는 휴대하는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 198, term: "draw", partOfSpeech: "동사", meaning: "그리다, 당기다", exampleSentence: "I like to draw.", exampleSentenceMeaning: "나는 그리는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 199, term: "spend", partOfSpeech: "동사", meaning: "쓰다, 보내다", exampleSentence: "I like to spend.", exampleSentenceMeaning: "나는 쓰는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 200, term: "wait", partOfSpeech: "동사", meaning: "기다리다", exampleSentence: "I like to wait.", exampleSentenceMeaning: "나는 기다리는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 201, term: "decide", partOfSpeech: "동사", meaning: "결정하다", exampleSentence: "I like to decide.", exampleSentenceMeaning: "나는 결정하는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 202, term: "choose", partOfSpeech: "동사", meaning: "고르다", exampleSentence: "I like to choose.", exampleSentenceMeaning: "나는 고르는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 203, term: "true", partOfSpeech: "형용사", meaning: "진실한", exampleSentence: "It is very true.", exampleSentenceMeaning: "그것은 매우 진실한합니다.", gradeLevel: "middle2" },
    { id: 204, term: "popular", partOfSpeech: "형용사", meaning: "인기 있는", exampleSentence: "It is very popular.", exampleSentenceMeaning: "그것은 매우 인기 있는합니다.", gradeLevel: "middle2" },
    { id: 205, term: "difficult", partOfSpeech: "형용사", meaning: "어려운", exampleSentence: "It is very difficult.", exampleSentenceMeaning: "그것은 매우 어려운합니다.", gradeLevel: "middle2" },
    { id: 206, term: "foreign", partOfSpeech: "형용사", meaning: "외국의", exampleSentence: "It is very foreign.", exampleSentenceMeaning: "그것은 매우 외국의합니다.", gradeLevel: "middle2" },
    { id: 207, term: "able", partOfSpeech: "형용사", meaning: "능력 있는", exampleSentence: "It is very able.", exampleSentenceMeaning: "그것은 매우 능력 있는합니다.", gradeLevel: "middle2" },
    { id: 208, term: "full", partOfSpeech: "형용사", meaning: "가득 찬", exampleSentence: "It is very full.", exampleSentenceMeaning: "그것은 매우 가득 찬합니다.", gradeLevel: "middle2" },
    { id: 209, term: "usually", partOfSpeech: "부사", meaning: "대게", exampleSentence: "He works usually.", exampleSentenceMeaning: "그는 대게 일해요.", gradeLevel: "middle2" },
    { id: 210, term: "never", partOfSpeech: "부사", meaning: "결코 ~아닌", exampleSentence: "He works never.", exampleSentenceMeaning: "그는 결코 ~아닌 일해요.", gradeLevel: "middle2" },
    { id: 211, term: "brain", partOfSpeech: "명사", meaning: "두뇌", exampleSentence: "This is a brain.", exampleSentenceMeaning: "이것은 두뇌입니다.", gradeLevel: "middle2" },
    { id: 212, term: "voice", partOfSpeech: "명사", meaning: "목소리", exampleSentence: "This is a voice.", exampleSentenceMeaning: "이것은 목소리입니다.", gradeLevel: "middle2" },
    { id: 213, term: "opinion", partOfSpeech: "명사", meaning: "의견", exampleSentence: `This is an opinion.`, exampleSentenceMeaning: "이것은 의견입니다.", gradeLevel: "middle2" },
    { id: 214, term: "age", partOfSpeech: "명사", meaning: "나이, 노화", exampleSentence: "This is an age.", exampleSentenceMeaning: "이것은 나이입니다.", gradeLevel: "middle2" },
    { id: 215, term: "century", partOfSpeech: "명사", meaning: "세기, 100년", exampleSentence: "This is a century.", exampleSentenceMeaning: "이것은 세기입니다.", gradeLevel: "middle2" },
    { id: 216, term: "event", partOfSpeech: "명사", meaning: "사건, 행사", exampleSentence: "This is an event.", exampleSentenceMeaning: "이것은 사건입니다.", gradeLevel: "middle2" },
    { id: 217, term: "dish", partOfSpeech: "명사", meaning: "접시, 요리", exampleSentence: "This is a dish.", exampleSentenceMeaning: "이것은 접시입니다.", gradeLevel: "middle2" },
    { id: 218, term: "toy", partOfSpeech: "명사", meaning: "장난감, 장난치다", exampleSentence: "This is a toy.", exampleSentenceMeaning: "이것은 장난감입니다.", gradeLevel: "middle2" },
    { id: 219, term: "subway", partOfSpeech: "명사", meaning: "지하철", exampleSentence: "This is a subway.", exampleSentenceMeaning: "이것은 지하철입니다.", gradeLevel: "middle2" },
    { id: 220, term: "hundred", partOfSpeech: "명사", meaning: "백(100)", exampleSentence: "This is a hundred.", exampleSentenceMeaning: "이것은 백(100)입니다.", gradeLevel: "middle2" },
    { id: 221, term: "thousand", partOfSpeech: "명사", meaning: "천(1,000)", exampleSentence: "This is a thousand.", exampleSentenceMeaning: "이것은 천(1,000)입니다.", gradeLevel: "middle2" },
    { id: 222, term: "rest", partOfSpeech: "동사", meaning: "쉬다, 나머지", exampleSentence: "I like to rest.", exampleSentenceMeaning: "나는 쉬는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 223, term: "waste", partOfSpeech: "동사", meaning: "낭비하다, 쓰레기", exampleSentence: "I like to waste.", exampleSentenceMeaning: "나는 낭비하는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 224, term: "surprise", partOfSpeech: "동사", meaning: "놀라게 하다", exampleSentence: "I like to surprise.", exampleSentenceMeaning: "나는 놀라게 하는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 225, term: "bear", partOfSpeech: "동사", meaning: "견디다, 낳다", exampleSentence: "I like to bear.", exampleSentenceMeaning: "나는 견디는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 226, term: "fight", partOfSpeech: "동사", meaning: "싸우다", exampleSentence: "I like to fight.", exampleSentenceMeaning: "나는 싸우는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 227, term: "buy", partOfSpeech: "동사", meaning: "사다, 구매하다", exampleSentence: "I like to buy.", exampleSentenceMeaning: "나는 사는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 228, term: "sell", partOfSpeech: "동사", meaning: "팔다, 팔리다", exampleSentence: "I like to sell.", exampleSentenceMeaning: "나는 파는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 229, term: "follow", partOfSpeech: "동사", meaning: "따르다, 추적하다", exampleSentence: "I like to follow.", exampleSentenceMeaning: "나는 따르는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 230, term: "miss", partOfSpeech: "동사", meaning: "놓치다, 그리워하다", exampleSentence: "I like to miss.", exampleSentenceMeaning: "나는 놓치는 것을 좋아해요.", gradeLevel: "middle2" },
    { id: 231, term: "close", partOfSpeech: "형용사", meaning: "가까운, 닫다", exampleSentence: "It is very close.", exampleSentenceMeaning: "그것은 매우 가까운합니다.", gradeLevel: "middle2" },
    { id: 232, term: "free", partOfSpeech: "형용사", meaning: "자유로운, 무료의", exampleSentence: "It is very free.", exampleSentenceMeaning: "그것은 매우 자유로운합니다.", gradeLevel: "middle2" },
    { id: 233, term: "upset", partOfSpeech: "형용사", meaning: "언짢은", exampleSentence: "It is very upset.", exampleSentenceMeaning: "그것은 매우 언짢은합니다.", gradeLevel: "middle2" },
    { id: 234, term: "healthy", partOfSpeech: "형용사", meaning: "건강한", exampleSentence: "It is very healthy.", exampleSentenceMeaning: "그것은 매우 건강한합니다.", gradeLevel: "middle2" },
    { id: 235, term: "delicious", partOfSpeech: "형용사", meaning: "맛있는", exampleSentence: "It is very delicious.", exampleSentenceMeaning: "그것은 매우 맛있는합니다.", gradeLevel: "middle2" },
    { id: 236, term: "sad", partOfSpeech: "형용사", meaning: "슬픈", exampleSentence: "It is very sad.", exampleSentenceMeaning: "그것은 매우 슬픈합니다.", gradeLevel: "middle2" },
    { id: 237, term: "careful", partOfSpeech: "형용사", meaning: "주의 깊은", exampleSentence: "It is very careful.", exampleSentenceMeaning: "그것은 매우 주의 깊은합니다.", gradeLevel: "middle2" },
    { id: 238, term: "ready", partOfSpeech: "형용사", meaning: "준비 된", exampleSentence: "It is very ready.", exampleSentenceMeaning: "그것은 매우 준비 된합니다.", gradeLevel: "middle2" },
    { id: 239, term: "away", partOfSpeech: "부사", meaning: "멀리, 떨어진", exampleSentence: "He works away.", exampleSentenceMeaning: "그는 멀리 일해요.", gradeLevel: "middle2" },
    { id: 240, term: "however", partOfSpeech: "부사", meaning: "하지만", exampleSentence: "He works however.", exampleSentenceMeaning: "그는 하지만 일해요.", gradeLevel: "middle2" },
    { id: 241, term: "president", partOfSpeech: "명사", meaning: "대통령", exampleSentence: "This is a president.", exampleSentenceMeaning: "이것은 대통령입니다.", gradeLevel: "middle3" },
    { id: 242, term: "diary", partOfSpeech: "명사", meaning: "일기", exampleSentence: "This is a diary.", exampleSentenceMeaning: "이것은 일기입니다.", gradeLevel: "middle3" },
    { id: 243, term: "cartoon", partOfSpeech: "명사", meaning: "만화", exampleSentence: "This is a cartoon.", exampleSentenceMeaning: "이것은 만화입니다.", gradeLevel: "middle3" },
    { id: 244, term: "meal", partOfSpeech: "명사", meaning: "식사", exampleSentence: "This is a meal.", exampleSentenceMeaning: "이것은 식사입니다.", gradeLevel: "middle3" },
    { id: 245, term: "character", partOfSpeech: "명사", meaning: "문자, 성격", exampleSentence: "This is a character.", exampleSentenceMeaning: "이것은 문자입니다.", gradeLevel: "middle3" },
    { id: 246, term: "reason", partOfSpeech: "명사", meaning: "이유", exampleSentence: "This is a reason.", exampleSentenceMeaning: "이것은 이유입니다.", gradeLevel: "middle3" },
    { id: 247, term: "ground", partOfSpeech: "명사", meaning: "지면, 기반", exampleSentence: "This is a ground.", exampleSentenceMeaning: "이것은 지면입니다.", gradeLevel: "middle3" },
    { id: 248, term: "community", partOfSpeech: "명사", meaning: "공동체", exampleSentence: "This is a community.", exampleSentenceMeaning: "이것은 공동체입니다.", gradeLevel: "middle3" },
    { id: 249, term: "glass", partOfSpeech: "명사", meaning: "유리", exampleSentence: "This is a glass.", exampleSentenceMeaning: "이것은 유리입니다.", gradeLevel: "middle3" },
    { id: 250, term: "weight", partOfSpeech: "명사", meaning: "무게", exampleSentence: "This is a weight.", exampleSentenceMeaning: "이것은 무게입니다.", gradeLevel: "middle3" },
    { id: 251, term: "control", partOfSpeech: "동사", meaning: "통제하다", exampleSentence: "I like to control.", exampleSentenceMeaning: "나는 통제하는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 252, term: "step", partOfSpeech: "명사", meaning: "단계", exampleSentence: "This is a step.", exampleSentenceMeaning: "이것은 단계입니다.", gradeLevel: "middle3" },
    { id: 253, term: "matter", partOfSpeech: "동사", meaning: "문제, 중요하다", exampleSentence: "I like to matter.", exampleSentenceMeaning: "나는 문제는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 254, term: "match", partOfSpeech: "동사", meaning: "어울리다, 필적하다", exampleSentence: "I like to match.", exampleSentenceMeaning: "나는 어울리는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 255, term: "set", partOfSpeech: "동사", meaning: "설치하다, 정하다", exampleSentence: "I like to set.", exampleSentenceMeaning: "나는 설치하는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 256, term: "catch", partOfSpeech: "동사", meaning: "잡다", exampleSentence: "I like to catch.", exampleSentenceMeaning: "나는 잡는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 257, term: "hold", partOfSpeech: "동사", meaning: "유지하다, 껴안다", exampleSentence: "I like to hold.", exampleSentenceMeaning: "나는 유지하는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 258, term: "pick", partOfSpeech: "동사", meaning: "줍다, 고르다", exampleSentence: "I like to pick.", exampleSentenceMeaning: "나는 줍는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 259, term: "teach", partOfSpeech: "동사", meaning: "가르치다", exampleSentence: "I like to teach.", exampleSentenceMeaning: "나는 가르치는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 260, term: "agree", partOfSpeech: "동사", meaning: "동의하다", exampleSentence: "I like to agree.", exampleSentenceMeaning: "나는 동의하는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 261, term: "invent", partOfSpeech: "동사", meaning: "발명하다", exampleSentence: "I like to invent.", exampleSentenceMeaning: "나는 발명하는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 262, term: "welcome", partOfSpeech: "동사", meaning: "환영하다", exampleSentence: "I like to welcome.", exampleSentenceMeaning: "나는 환영하는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 263, term: "bright", partOfSpeech: "형용사", meaning: "밝은", exampleSentence: "It is very bright.", exampleSentenceMeaning: "그것은 매우 밝은합니다.", gradeLevel: "middle3" },
    { id: 264, term: "smart", partOfSpeech: "형용사", meaning: "영리한", exampleSentence: "It is very smart.", exampleSentenceMeaning: "그것은 매우 영리한합니다.", gradeLevel: "middle3" },
    { id: 265, term: "wise", partOfSpeech: "형용사", meaning: "현명한", exampleSentence: "It is very wise.", exampleSentenceMeaning: "그것은 매우 현명한합니다.", gradeLevel: "middle3" },
    { id: 266, term: "hungry", partOfSpeech: "형용사", meaning: "배고픈", exampleSentence: "It is very hungry.", exampleSentenceMeaning: "그것은 매우 배고픈합니다.", gradeLevel: "middle3" },
    { id: 267, term: "fine", partOfSpeech: "형용사", meaning: "훌륭한, 벌금", exampleSentence: "It is very fine.", exampleSentenceMeaning: "그것은 매우 훌륭한합니다.", gradeLevel: "middle3" },
    { id: 268, term: "pretty", partOfSpeech: "형용사", meaning: "예쁜, 매우", exampleSentence: "It is very pretty.", exampleSentenceMeaning: "그것은 매우 예쁜합니다.", gradeLevel: "middle3" },
    { id: 269, term: "still", partOfSpeech: "부사", meaning: "여전히, 정지한", exampleSentence: "He works still.", exampleSentenceMeaning: "그는 여전히 일해요.", gradeLevel: "middle3" },
    { id: 270, term: "later", partOfSpeech: "부사", meaning: "나중에", exampleSentence: "He works later.", exampleSentenceMeaning: "그는 나중에 일해요.", gradeLevel: "middle3" },
    { id: 271, term: "teenager", partOfSpeech: "명사", meaning: "십대", exampleSentence: "This is a teenager.", exampleSentenceMeaning: "이것은 십대입니다.", gradeLevel: "middle3" },
    { id: 272, term: "arm", partOfSpeech: "명사", meaning: "팔, 무기, 무장하다", exampleSentence: "This is an arm.", exampleSentenceMeaning: "이것은 팔입니다.", gradeLevel: "middle3" },
    { id: 273, term: "skill", partOfSpeech: "명사", meaning: "기술", exampleSentence: "This is a skill.", exampleSentenceMeaning: "이것은 기술입니다.", gradeLevel: "middle3" },
    { id: 274, term: "factory", partOfSpeech: "명사", meaning: "공장", exampleSentence: "This is a factory.", exampleSentenceMeaning: "이것은 공장입니다.", gradeLevel: "middle3" },
    { id: 275, term: "prize", partOfSpeech: "명사", meaning: "상, 상을 주다", exampleSentence: "This is a prize.", exampleSentenceMeaning: "이것은 상입니다.", gradeLevel: "middle3" },
    { id: 276, term: "chance", partOfSpeech: "명사", meaning: "기회, 가능성", exampleSentence: "This is a chance.", exampleSentenceMeaning: "이것은 기회입니다.", gradeLevel: "middle3" },
    { id: 277, term: "shape", partOfSpeech: "명사", meaning: "모양, 형태", exampleSentence: "This is a shape.", exampleSentenceMeaning: "이것은 모양입니다.", gradeLevel: "middle3" },
    { id: 278, term: "difference", partOfSpeech: "명사", meaning: "차이, 차별", exampleSentence: "This is a difference.", exampleSentenceMeaning: "이것은 차이입니다.", gradeLevel: "middle3" },
    { id: 279, term: "wall", partOfSpeech: "명사", meaning: "벽", exampleSentence: "This is a wall.", exampleSentenceMeaning: "이것은 벽입니다.", gradeLevel: "middle3" },
    { id: 280, term: "contest", partOfSpeech: "명사", meaning: "경연", exampleSentence: "This is a contest.", exampleSentenceMeaning: "이것은 경연입니다.", gradeLevel: "middle3" },
    { id: 281, term: "race", partOfSpeech: "명사", meaning: "경주, 인종", exampleSentence: "This is a race.", exampleSentenceMeaning: "이것은 경주입니다.", gradeLevel: "middle3" },
    { id: 282, term: "smell", partOfSpeech: "동사", meaning: "냄새가 나다", exampleSentence: "I like to smell.", exampleSentenceMeaning: "나는 냄새가 나는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 283, term: "interest", partOfSpeech: "동사", meaning: "흥미롭게 하다", exampleSentence: "I like to interest.", exampleSentenceMeaning: "나는 흥미롭게 하는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 284, term: "judge", partOfSpeech: "동사", meaning: "판단하다", exampleSentence: "I like to judge.", exampleSentenceMeaning: "나는 판단하는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 285, term: "cause", partOfSpeech: "동사", meaning: "원인, 유발하다", exampleSentence: "I like to cause.", exampleSentenceMeaning: "나는 원인는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 286, term: "cover", partOfSpeech: "동사", meaning: "덮다, 다루다", exampleSentence: "I like to cover.", exampleSentenceMeaning: "나는 덮는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 287, term: "travel", partOfSpeech: "동사", meaning: "여행하다, 이동하다", exampleSentence: "I like to travel.", exampleSentenceMeaning: "나는 여행하는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 288, term: "guess", partOfSpeech: "동사", meaning: "추측하다", exampleSentence: "I like to guess.", exampleSentenceMeaning: "나는 추측하는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 289, term: "finish", partOfSpeech: "동사", meaning: "끝마치다", exampleSentence: "I like to finish.", exampleSentenceMeaning: "나는 끝마치는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 290, term: "wash", partOfSpeech: "동사", meaning: "닦다", exampleSentence: "I like to wash.", exampleSentenceMeaning: "나는 닦는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 291, term: "introduce", partOfSpeech: "동사", meaning: "소개하다, 도입하다", exampleSentence: "I like to introduce.", exampleSentenceMeaning: "나는 소개하는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 292, term: "hurt", partOfSpeech: "동사", meaning: "상처를 주다(받다)", exampleSentence: "I like to hurt.", exampleSentenceMeaning: "나는 상처를 주다(받다)는 것을 좋아해요.", gradeLevel: "middle3" },
    { id: 293, term: "tired", partOfSpeech: "형용사", meaning: "피곤한", exampleSentence: "It is very tired.", exampleSentenceMeaning: "그것은 매우 피곤한합니다.", gradeLevel: "middle3" },
    { id: 294, term: "proud", partOfSpeech: "형용사", meaning: "거만한, 당당한", exampleSentence: "It is very proud.", exampleSentenceMeaning: "그것은 매우 거만한합니다.", gradeLevel: "middle3" },
    { id: 295, term: "dirty", partOfSpeech: "형용사", meaning: "더러운", exampleSentence: "It is very dirty.", exampleSentenceMeaning: "그것은 매우 더러운합니다.", gradeLevel: "middle3" },
    { id: 296, term: "angry", partOfSpeech: "형용사", meaning: "화난", exampleSentence: "It is very angry.", exampleSentenceMeaning: "그것은 매우 화난합니다.", gradeLevel: "middle3" },
    { id: 297, term: "modern", partOfSpeech: "형용사", meaning: "현대의", exampleSentence: "It is very modern.", exampleSentenceMeaning: "그것은 매우 현대의합니다.", gradeLevel: "middle3" },
    { id: 298, term: "useful", partOfSpeech: "형용사", meaning: "유용한", exampleSentence: "It is very useful.", exampleSentenceMeaning: "그것은 매우 유용한합니다.", gradeLevel: "middle3" },
    { id: 299, term: "soon", partOfSpeech: "부사", meaning: "곧", exampleSentence: "He works soon.", exampleSentenceMeaning: "그는 곧 일해요.", gradeLevel: "middle3" },
    { id: 300, term: "once", partOfSpeech: "부사", meaning: "한때, 일단 ~하면", exampleSentence: "He works once.", exampleSentenceMeaning: "그는 한때 일해요.", gradeLevel: "middle3" },
    { id: 301, term: "kind", partOfSpeech: "형용사", meaning: "친절한", exampleSentence: "She is very kind.", exampleSentenceMeaning: "그녀는 매우 친절합니다.", gradeLevel: "middle1" },
    { id: 302, term: "clever", partOfSpeech: "형용사", meaning: "영리한", exampleSentence: "He is a clever student.", exampleSentenceMeaning: "그는 영리한 학생입니다.", gradeLevel: "middle1" },
    { id: 303, term: "wise", partOfSpeech: "형용사", meaning: "지혜로운", exampleSentence: "My grandfather is very wise.", exampleSentenceMeaning: "저의 할아버지는 매우 지혜로우십니다.", gradeLevel: "middle1" },
    { id: 304, term: "foolish", partOfSpeech: "형용사", meaning: "바보 같은", exampleSentence: "That was a foolish mistake.", exampleSentenceMeaning: "그것은 바보 같은 실수였습니다.", gradeLevel: "middle1" },
    { id: 305, term: "proud", partOfSpeech: "형용사", meaning: "자랑스러워하는", exampleSentence: "She is proud of her work.", exampleSentenceMeaning: "그녀는 자신의 일을 자랑스러워합니다.", gradeLevel: "middle1" },
    { id: 306, term: "honest", partOfSpeech: "형용사", meaning: "정직한", exampleSentence: "He is an honest man.", exampleSentenceMeaning: "그는 정직한 사람입니다.", gradeLevel: "middle1" },
    { id: 307, term: "gentle", partOfSpeech: "형용사", meaning: "부드러운", exampleSentence: "He has a gentle voice.", exampleSentenceMeaning: "그는 부드러운 목소리를 가지고 있습니다.", gradeLevel: "middle1" },
    { id: 308, term: "careful", partOfSpeech: "형용사", meaning: "조심성 있는", exampleSentence: "Please be careful.", exampleSentenceMeaning: "조심하세요.", gradeLevel: "middle1" },
    { id: 309, term: "brave", partOfSpeech: "형용사", meaning: "용감한", exampleSentence: "The firefighter was very brave.", exampleSentenceMeaning: "그 소방관은 매우 용감했습니다.", gradeLevel: "middle1" },
    { id: 310, term: "lazy", partOfSpeech: "형용사", meaning: "게으른", exampleSentence: "He is a lazy cat.", exampleSentenceMeaning: "그는 게으른 고양이입니다.", gradeLevel: "middle1" },
    { id: 311, term: "funny", partOfSpeech: "형용사", meaning: "웃기는", exampleSentence: "That joke was very funny.", exampleSentenceMeaning: "그 농담은 매우 웃겼습니다.", gradeLevel: "middle1" },
    { id: 312, term: "calm", partOfSpeech: "형용사", meaning: "차분한", exampleSentence: "Stay calm and don't panic.", exampleSentenceMeaning: "차분함을 유지하고 당황하지 마세요.", gradeLevel: "middle1" },
    { id: 313, term: "character", partOfSpeech: "명사", meaning: "성격", exampleSentence: "She has a strong character.", exampleSentenceMeaning: "그녀는 강한 성격을 가지고 있습니다.", gradeLevel: "middle1" },
    { id: 314, term: "serious", partOfSpeech: "형용사", meaning: "진지한", exampleSentence: "This is a serious matter.", exampleSentenceMeaning: "이것은 진지한 문제입니다.", gradeLevel: "middle1" },
    { id: 315, term: "strict", partOfSpeech: "형용사", meaning: "엄격한", exampleSentence: "My teacher is very strict.", exampleSentenceMeaning: "우리 선생님은 매우 엄격하십니다.", gradeLevel: "middle1" },
    { id: 316, term: "cruel", partOfSpeech: "형용사", meaning: "잔인한", exampleSentence: "It was a cruel thing to do.", exampleSentenceMeaning: "그것은 잔인한 행동이었습니다.", gradeLevel: "middle1" },
    { id: 317, term: "mean", partOfSpeech: "형용사", meaning: "야비한", exampleSentence: "Don't be mean to your brother.", exampleSentenceMeaning: "남동생에게 야비하게 굴지 마세요.", gradeLevel: "middle1" },
    { id: 318, term: "selfish", partOfSpeech: "형용사", meaning: "이기적인", exampleSentence: "He is a selfish person.", exampleSentenceMeaning: "그는 이기적인 사람입니다.", gradeLevel: "middle1" },
    { id: 319, term: "evil", partOfSpeech: "형용사", meaning: "나쁜", exampleSentence: "That was an evil plan.", exampleSentenceMeaning: "그것은 나쁜 계획이었습니다.", gradeLevel: "middle1" },
    { id: 320, term: "curious", partOfSpeech: "형용사", meaning: "호기심이 많은", exampleSentence: "Cats are very curious animals.", exampleSentenceMeaning: "고양이는 매우 호기심이 많은 동물입니다.", gradeLevel: "middle1" },
    { id: 321, term: "cheerful", partOfSpeech: "형용사", meaning: "쾌활한", exampleSentence: "She has a cheerful personality.", exampleSentenceMeaning: "그녀는 쾌활한 성격을 가지고 있습니다.", gradeLevel: "middle1" },
    { id: 322, term: "friendly", partOfSpeech: "형용사", meaning: "친한/다정한", exampleSentence: "My dog is very friendly.", exampleSentenceMeaning: "우리 강아지는 매우 다정합니다.", gradeLevel: "middle1" },
    { id: 323, term: "modest", partOfSpeech: "형용사", meaning: "겸손한", exampleSentence: "He is a modest and humble person.", exampleSentenceMeaning: "그는 겸손하고 겸허한 사람입니다.", gradeLevel: "middle1" },
    { id: 324, term: "generous", partOfSpeech: "형용사", meaning: "관대한/인심이 후한", exampleSentence: "Thank you for your generous donation.", exampleSentenceMeaning: "관대한 기부에 감사드립니다.", gradeLevel: "middle1" },
    { id: 325, term: "sensitive", partOfSpeech: "형용사", meaning: "민감한", exampleSentence: "She is sensitive to criticism.", exampleSentenceMeaning: "그녀는 비판에 민감합니다.", gradeLevel: "middle1" },
    { id: 326, term: "confident", partOfSpeech: "형용사", meaning: "자신만만한", exampleSentence: "He feels confident about the exam.", exampleSentenceMeaning: "그는 시험에 대해 자신감이 있습니다.", gradeLevel: "middle1" },
    { id: 327, term: "positive", partOfSpeech: "형용사", meaning: "긍정적인", exampleSentence: "Try to have a positive attitude.", exampleSentenceMeaning: "긍정적인 태도를 가지도록 노력하세요.", gradeLevel: "middle1" },
    { id: 328, term: "negative", partOfSpeech: "형용사", meaning: "부정적인", exampleSentence: "Don't focus on negative thoughts.", exampleSentenceMeaning: "부정적인 생각에 집중하지 마세요.", gradeLevel: "middle1" },
    { id: 329, term: "optimistic", partOfSpeech: "형용사", meaning: "낙관적인", exampleSentence: "She is optimistic about the future.", exampleSentenceMeaning: "그녀는 미래에 대해 낙관적입니다.", gradeLevel: "middle1" },
    { id: 330, term: "cautious", partOfSpeech: "형용사", meaning: "조심스러운", exampleSentence: "Be cautious when crossing the street.", exampleSentenceMeaning: "길을 건널 때 조심하세요.", gradeLevel: "middle1" },
    { id: 331, term: "big", partOfSpeech: "형용사", meaning: "큰", exampleSentence: "That is a big house.", exampleSentenceMeaning: "저것은 큰 집입니다.", gradeLevel: "middle1" },
    { id: 332, term: "old", partOfSpeech: "형용사", meaning: "나이가 많은", exampleSentence: "He is an old man.", exampleSentenceMeaning: "그는 나이가 많은 남자입니다.", gradeLevel: "middle1" },
    { id: 333, term: "tall", partOfSpeech: "형용사", meaning: "키가 큰", exampleSentence: "She is very tall.", exampleSentenceMeaning: "그녀는 키가 매우 큽니다.", gradeLevel: "middle1" },
    { id: 334, term: "cute", partOfSpeech: "형용사", meaning: "귀여운", exampleSentence: "The puppy is very cute.", exampleSentenceMeaning: "그 강아지는 매우 귀엽습니다.", gradeLevel: "middle1" },
    { id: 335, term: "pretty", partOfSpeech: "형용사", meaning: "예쁜/매우", exampleSentence: "The flowers are very pretty.", exampleSentenceMeaning: "꽃들이 매우 예쁩니다.", gradeLevel: "middle1" },
    { id: 336, term: "beautiful", partOfSpeech: "형용사", meaning: "아름다운", exampleSentence: "The sunset was beautiful.", exampleSentenceMeaning: "석양은 아름다웠습니다.", gradeLevel: "middle1" },
    { id: 337, term: "ugly", partOfSpeech: "형용사", meaning: "못생긴", exampleSentence: "It is an ugly sweater.", exampleSentenceMeaning: "그것은 못생긴 스웨터입니다.", gradeLevel: "middle1" },
    { id: 338, term: "fat", partOfSpeech: "형용사", meaning: "뚱뚱한", exampleSentence: "My cat is a little fat.", exampleSentenceMeaning: "우리 고양이는 약간 뚱뚱합니다.", gradeLevel: "middle1" },
    { id: 339, term: "overweight", partOfSpeech: "형용사", meaning: "과체중의", exampleSentence: "He is slightly overweight.", exampleSentenceMeaning: "그는 약간 과체중입니다.", gradeLevel: "middle1" },
    { id: 340, term: "young", partOfSpeech: "형용사", meaning: "어린", exampleSentence: "She is too young to drive.", exampleSentenceMeaning: "그녀는 운전하기에는 너무 어립니다.", gradeLevel: "middle1" },
    { id: 341, term: "handsome", partOfSpeech: "형용사", meaning: "잘생긴", exampleSentence: "He is a handsome actor.", exampleSentenceMeaning: "그는 잘생긴 배우입니다.", gradeLevel: "middle1" },
    { id: 342, term: "slim", partOfSpeech: "형용사", meaning: "날씬한", exampleSentence: "She wants to be slim.", exampleSentenceMeaning: "그녀는 날씬해지고 싶어합니다.", gradeLevel: "middle1" },
    { id: 343, term: "beard", partOfSpeech: "명사", meaning: "턱수염", exampleSentence: "He has a long beard.", exampleSentenceMeaning: "그는 긴 턱수염을 가지고 있습니다.", gradeLevel: "middle1" },
    { id: 344, term: "plain", partOfSpeech: "형용사", meaning: "평범하게 생긴", exampleSentence: "She wore a plain dress.", exampleSentenceMeaning: "그녀는 평범한 드레스를 입었습니다.", gradeLevel: "middle1" },
    { id: 345, term: "good-looking", partOfSpeech: "형용사", meaning: "잘생긴", exampleSentence: "He is a good-looking man.", exampleSentenceMeaning: "그는 잘생긴 남자입니다.", gradeLevel: "middle1" },
    { id: 346, term: "skinny", partOfSpeech: "형용사", meaning: "깡마른", exampleSentence: "The model was very skinny.", exampleSentenceMeaning: "그 모델은 매우 깡말랐습니다.", gradeLevel: "middle1" },
    { id: 347, term: "fit", partOfSpeech: "형용사", meaning: "건강한/꼭 맞다", exampleSentence: "He stays fit by exercising.", exampleSentenceMeaning: "그는 운동으로 건강을 유지합니다.", gradeLevel: "middle1" },
    { id: 348, term: "muscular", partOfSpeech: "형용사", meaning: "근육질의", exampleSentence: "The athlete is very muscular.", exampleSentenceMeaning: "그 운동선수는 매우 근육질입니다.", gradeLevel: "middle1" },
    { id: 349, term: "thin", partOfSpeech: "형용사", meaning: "가는/숱이 적은", exampleSentence: "The book is very thin.", exampleSentenceMeaning: "그 책은 매우 얇습니다.", gradeLevel: "middle1" },
    { id: 350, term: "bald", partOfSpeech: "형용사", meaning: "대머리의", exampleSentence: "He started to go bald in his thirties.", exampleSentenceMeaning: "그는 30대에 대머리가 되기 시작했습니다.", gradeLevel: "middle1" },
    { id: 351, term: "curly", partOfSpeech: "형용사", meaning: "곱슬거리는", exampleSentence: "She has curly hair.", exampleSentenceMeaning: "그녀는 곱슬머리입니다.", gradeLevel: "middle1" },
    { id: 352, term: "dye", partOfSpeech: "동사", meaning: "염색하다", exampleSentence: "I want to dye my hair.", exampleSentenceMeaning: "나는 머리를 염색하고 싶어요.", gradeLevel: "middle1" },
    { id: 353, term: "appearance", partOfSpeech: "명사", meaning: "외모", exampleSentence: "His appearance changed a lot.", exampleSentenceMeaning: "그의 외모가 많이 변했습니다.", gradeLevel: "middle1" },
    { id: 354, term: "attractive", partOfSpeech: "형용사", meaning: "매력적인", exampleSentence: "She has an attractive smile.", exampleSentenceMeaning: "그녀는 매력적인 미소를 가지고 있습니다.", gradeLevel: "middle1" },
    { id: 355, term: "charming", partOfSpeech: "형용사", meaning: "멋진/매력적인", exampleSentence: "He is a charming prince.", exampleSentenceMeaning: "그는 멋진 왕자입니다.", gradeLevel: "middle1" },
    { id: 356, term: "mustache", partOfSpeech: "명사", meaning: "코밑수염", exampleSentence: "He grew a mustache.", exampleSentenceMeaning: "그는 코밑수염을 길렀습니다.", gradeLevel: "middle1" },
    { id: 357, term: "sideburns", partOfSpeech: "명사", meaning: "구레나룻", exampleSentence: "He shaved off his sideburns.", exampleSentenceMeaning: "그는 구레나룻을 밀었습니다.", gradeLevel: "middle1" },
    { id: 358, term: "middle-aged", partOfSpeech: "형용사", meaning: "중년의", exampleSentence: "She is a middle-aged woman.", exampleSentenceMeaning: "그녀는 중년 여성입니다.", gradeLevel: "middle1" },
    { id: 359, term: "build", partOfSpeech: "명사", meaning: "체격", exampleSentence: "He has a strong build.", exampleSentenceMeaning: "그는 체격이 좋습니다.", gradeLevel: "middle1" },
    { id: 360, term: "image", partOfSpeech: "명사", meaning: "이미지", exampleSentence: "The company has a good image.", exampleSentenceMeaning: "그 회사는 좋은 이미지를 가지고 있습니다.", gradeLevel: "middle1" },
    { id: 361, term: "smile", partOfSpeech: "명사", meaning: "미소", exampleSentence: "She has a beautiful smile.", exampleSentenceMeaning: "그녀는 아름다운 미소를 가지고 있습니다.", gradeLevel: "middle1" },
    { id: 362, term: "enjoy", partOfSpeech: "동사", meaning: "즐기다", exampleSentence: "I enjoy reading books.", exampleSentenceMeaning: "나는 책 읽는 것을 즐겨요.", gradeLevel: "middle1" },
    { id: 363, term: "cry", partOfSpeech: "동사", meaning: "울다", exampleSentence: "The baby started to cry.", exampleSentenceMeaning: "아기가 울기 시작했어요.", gradeLevel: "middle1" },
    { id: 364, term: "tear", partOfSpeech: "명사", meaning: "눈물", exampleSentence: "A tear rolled down her cheek.", exampleSentenceMeaning: "눈물이 그녀의 뺨을 타고 흘러내렸습니다.", gradeLevel: "middle1" },
    { id: 365, term: "glad", partOfSpeech: "형용사", meaning: "기쁜", exampleSentence: "I am glad to see you.", exampleSentenceMeaning: "만나서 기쁩니다.", gradeLevel: "middle1" },
    { id: 366, term: "angry", partOfSpeech: "형용사", meaning: "화가 난", exampleSentence: "He was angry with me.", exampleSentenceMeaning: "그는 나에게 화가 났습니다.", gradeLevel: "middle1" },
    { id: 367, term: "fear", partOfSpeech: "명사", meaning: "공포", exampleSentence: "She has a fear of heights.", exampleSentenceMeaning: "그녀는 높은 곳에 대한 공포가 있습니다.", gradeLevel: "middle1" },
    { id: 368, term: "joy", partOfSpeech: "명사", meaning: "기쁨", exampleSentence: "Her heart was filled with joy.", exampleSentenceMeaning: "그녀의 마음은 기쁨으로 가득 찼습니다.", gradeLevel: "middle1" },
    { id: 369, term: "miss", partOfSpeech: "동사", meaning: "그리워하다", exampleSentence: "I miss my family.", exampleSentenceMeaning: "나는 가족이 그리워요.", gradeLevel: "middle1" }
];


// --- Helper Functions ---
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const speak = (text: string, lang = 'en-US') => {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        
        // 음성 품질 개선을 위한 설정
        utterance.rate = 0.8; // 조금 느리게 (0.1 ~ 10, 기본값 1)
        utterance.pitch = 1.0; // 자연스러운 피치 (0 ~ 2, 기본값 1)
        utterance.volume = 0.9; // 적당한 볼륨 (0 ~ 1, 기본값 1)
        
        const findAndSpeak = () => {
            const voices = speechSynthesis.getVoices();
            
            // 더 나은 영어 음성을 찾기 위한 우선순위 설정
            const preferredVoiceNames = [
                'Google US English', 'Microsoft Zira', 'Microsoft David',
                'Samantha', 'Alex', 'Victoria', 'Microsoft Aria',
                'Google UK English Female', 'Google UK English Male',
                'Microsoft Mark', 'Microsoft Hazel'
            ];
            
            // 먼저 선호하는 음성 찾기
            let bestVoice = null;
            for (const voiceName of preferredVoiceNames) {
                bestVoice = voices.find(voice => 
                    voice.lang.startsWith('en') && 
                    voice.name.includes(voiceName)
                );
                if (bestVoice) break;
            }
            
            // 선호하는 음성이 없으면 영어 음성 중에서 선택
            if (!bestVoice) {
                bestVoice = voices.find(voice => 
                    voice.lang.startsWith('en') && 
                    (voice.name.includes('Google') || voice.name.includes('Microsoft'))
                );
            }
            
            // 그래도 없으면 기본 영어 음성 선택
            if (!bestVoice) {
                bestVoice = voices.find(voice => 
                    voice.lang.startsWith('en') || voice.lang === lang
                );
            }
            
            if (bestVoice) {
                utterance.voice = bestVoice;
                console.log(`Using voice: ${bestVoice.name} (${bestVoice.lang})`);
            } else {
                console.warn('No suitable English voice found, using default');
            }
            
            speechSynthesis.speak(utterance);
        };

        if (speechSynthesis.getVoices().length > 0) {
            findAndSpeak();
        } else {
            speechSynthesis.onvoiceschanged = findAndSpeak;
        }
    } else {
        console.warn("Speech synthesis not supported in this browser.");
    }
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// SRS (Spaced Repetition System) 알고리즘 구현
const calculateNextReviewDate = (srsLevel: number, easeFactor: number): string => {
    const today = new Date();
    let interval = 0;
    
    switch (srsLevel) {
        case 0: interval = 0; break; // 새 단어 - 즉시 다시 학습
        case 1: interval = 1; break; // 1일 후
        case 2: interval = 3; break; // 3일 후
        case 3: interval = 7; break; // 1주일 후
        case 4: interval = 14; break; // 2주일 후
        default: interval = Math.round(14 * easeFactor); break; // 이후는 easeFactor 적용
    }
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + interval);
    return nextDate.toISOString().split('T')[0];
};

const updateSrsData = (
    stat: WordStat, 
    isCorrect: boolean, 
    responseTime: number, 
    confidence: number
): Partial<WordStat> => {
    const now = getTodayDateString();
    let newSrsLevel = stat.srsLevel;
    let newEaseFactor = stat.easeFactor;
    let newConsecutiveCorrect = stat.consecutiveCorrect;
    
    if (isCorrect) {
        newConsecutiveCorrect++;
        if (newConsecutiveCorrect >= 2 && newSrsLevel < 5) {
            newSrsLevel++;
        }
        
        // 자신감과 정답률에 따른 easeFactor 조정
        if (confidence >= 4 && responseTime < 5) {
            newEaseFactor = Math.min(3.0, newEaseFactor + 0.1);
        } else if (confidence >= 3) {
            newEaseFactor = Math.max(1.3, newEaseFactor);
        }
    } else {
        newConsecutiveCorrect = 0;
        newSrsLevel = Math.max(0, newSrsLevel - 1);
        newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
    }
    
    const avgResponseTime = stat.totalReviews > 0 
        ? (stat.averageResponseTime * stat.totalReviews + responseTime) / (stat.totalReviews + 1)
        : responseTime;
    
    return {
        srsLevel: newSrsLevel,
        easeFactor: newEaseFactor,
        consecutiveCorrect: newConsecutiveCorrect,
        nextReviewDate: calculateNextReviewDate(newSrsLevel, newEaseFactor),
        lastReviewed: now,
        totalReviews: stat.totalReviews + 1,
        averageResponseTime: avgResponseTime,
        confidenceLevel: confidence,
        isMastered: newSrsLevel >= 4 && newConsecutiveCorrect >= 3,
    };
};

// 오늘 복습해야 할 단어들 필터링
const getWordsForReview = (words: Word[], wordStats: Record<string | number, WordStat>): Word[] => {
    const today = getTodayDateString();
    return words.filter(word => {
        const stat = wordStats[word.id] || getDefaultWordStat(word.id);
        if (stat.srsLevel === 0) return true; // 새 단어는 항상 포함
        if (!stat.nextReviewDate) return true;
        return stat.nextReviewDate <= today;
    });
};

// 게임화 시스템 유틸리티 함수들
const calculateLevelFromExperience = (experience: number): number => {
    return Math.floor(Math.sqrt(experience / 100)) + 1;
};

const getExperienceForNextLevel = (currentLevel: number): number => {
    return (currentLevel * currentLevel) * 100;
};

const getExperienceReward = (action: 'word_learned' | 'quiz_correct' | 'daily_goal' | 'streak_bonus'): number => {
    const rewards = {
        word_learned: 10,
        quiz_correct: 15,
        daily_goal: 50,
        streak_bonus: 25
    };
    return rewards[action];
};

const updateUserStreak = (settings: UserSettings): Partial<UserSettings> => {
    const today = getTodayDateString();
    const lastStudy = settings.lastStudyDate;
    
    if (!lastStudy) {
        return {
            streakDays: 1,
            lastStudyDate: today,
            longestStreak: Math.max(1, settings.longestStreak)
        };
    }
    
    const lastStudyDate = new Date(lastStudy);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
        // 오늘 이미 학습함
        return {};
    } else if (daysDiff === 1) {
        // 연속 학습
        const newStreak = settings.streakDays + 1;
        return {
            streakDays: newStreak,
            lastStudyDate: today,
            longestStreak: Math.max(newStreak, settings.longestStreak)
        };
    } else {
        // 스트릭 끊어짐
        return {
            streakDays: 1,
            lastStudyDate: today
        };
    }
};

const checkAndAwardBadges = (settings: UserSettings, newStats: any): string[] => {
    const newBadges: string[] = [];
    const currentBadges = settings.badges || [];
    
    const badgeConditions = [
        { id: 'first_word', name: '첫 걸음 🐣', condition: () => settings.totalExperience >= 10 },
        { id: 'streak_7', name: '일주일 챔피언 🔥', condition: () => settings.streakDays >= 7 },
        { id: 'streak_30', name: '한 달 마스터 🏆', condition: () => settings.streakDays >= 30 },
        { id: 'level_5', name: '레벨업 마스터 ⭐', condition: () => settings.level >= 5 },
        { id: 'perfect_quiz', name: '완벽주의자 💯', condition: () => newStats?.quizScore === 100 },
        { id: 'night_owl', name: '올빼미족 🦉', condition: () => new Date().getHours() >= 22 },
        { id: 'early_bird', name: '일찍 일어나는 새 🌅', condition: () => new Date().getHours() <= 7 },
        { id: 'wordsmith', name: '단어 장인 📚', condition: () => settings.totalExperience >= 1000 }
    ];
    
    badgeConditions.forEach(badge => {
        if (!currentBadges.includes(badge.id) && badge.condition()) {
            newBadges.push(badge.id);
        }
    });
    
    return newBadges;
};

const getBadgeInfo = (badgeId: string) => {
    const badges: Record<string, { name: string; description: string; icon: string }> = {
        first_word: { name: '첫 걸음', description: '첫 번째 단어를 학습했습니다', icon: '🐣' },
        streak_7: { name: '일주일 챔피언', description: '7일 연속 학습을 달성했습니다', icon: '🔥' },
        streak_30: { name: '한 달 마스터', description: '30일 연속 학습을 달성했습니다', icon: '🏆' },
        level_5: { name: '레벨업 마스터', description: '레벨 5에 도달했습니다', icon: '⭐' },
        perfect_quiz: { name: '완벽주의자', description: '퀴즈에서 100점을 달성했습니다', icon: '💯' },
        night_owl: { name: '올빼미족', description: '밤 10시 이후에 학습했습니다', icon: '🦉' },
        early_bird: { name: '일찍 일어나는 새', description: '오전 7시 이전에 학습했습니다', icon: '🌅' },
        wordsmith: { name: '단어 장인', description: '총 1000 경험치를 달성했습니다', icon: '📚' }
    };
    return badges[badgeId] || { name: '알 수 없는 배지', description: '', icon: '🏅' };
};

// 🎵 사운드 효과 시스템
const playSound = (type: 'correct' | 'incorrect' | 'levelUp' | 'badge' | 'complete', enabled: boolean = true) => {
    if (!enabled) return;
    
    // Web Audio API를 사용한 간단한 사운드 생성
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
        case 'correct':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            break;
        case 'incorrect':
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            break;
        case 'levelUp':
            oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(700, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
            break;
        case 'badge':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.35, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            break;
        case 'complete':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.7);
            break;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.7);
};

// ⌨️ 키보드 단축키 시스템
const useKeyboardShortcuts = (callbacks: {
    onSpace?: () => void;
    onEnter?: () => void;
    onEscape?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onNumber?: (num: number) => void;
}) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // 입력 필드에서는 단축키 무시
            if ((event.target as HTMLElement)?.tagName === 'INPUT' || 
                (event.target as HTMLElement)?.tagName === 'TEXTAREA') {
                return;
            }
            
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    callbacks.onSpace?.();
                    break;
                case 'Enter':
                    event.preventDefault();
                    callbacks.onEnter?.();
                    break;
                case 'Escape':
                    event.preventDefault();
                    callbacks.onEscape?.();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    callbacks.onArrowLeft?.();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    callbacks.onArrowRight?.();
                    break;
                default:
                    // 숫자 키 (1-9)
                    if (event.code.startsWith('Digit')) {
                        const num = parseInt(event.code.replace('Digit', ''));
                        if (num >= 1 && num <= 9) {
                            event.preventDefault();
                            callbacks.onNumber?.(num);
                        }
                    }
                    break;
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [callbacks]);
};

// 🌙 v3.0.0 Enhanced Theme System
const applyTheme = (theme: 'dark' | 'light' | 'auto') => {
    const root = document.documentElement;
    
    let targetTheme = theme;
    
    // Auto 테마인 경우 시스템 설정에 따라 결정
    if (theme === 'auto') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        targetTheme = systemPrefersDark ? 'dark' : 'light';
    }
    
    if (targetTheme === 'light') {
        root.classList.add('light-theme');
        root.classList.remove('dark-theme');
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    } else {
        root.classList.add('dark-theme');
        root.classList.remove('light-theme');
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    }
};

// 💾 데이터 백업/복원 시스템
const exportUserData = (userSettings: UserSettings, wordStats: Record<string | number, WordStat>) => {
    const exportData = {
        version: '2.2.0',
        exportDate: new Date().toISOString(),
        userSettings,
        wordStats,
        metadata: {
            totalWords: Object.keys(wordStats).length,
            totalExperience: userSettings.totalExperience,
            level: userSettings.level
        }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `wordmaster-backup-${getTodayDateString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const importUserData = (file: File): Promise<{
    userSettings: UserSettings;
    wordStats: Record<string | number, WordStat>;
}> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                
                // 데이터 유효성 검사
                if (!data.userSettings || !data.wordStats) {
                    throw new Error('유효하지 않은 백업 파일입니다.');
                }
                
                // 버전 호환성 검사
                const version = data.version || '1.0.0';
                if (version < '2.0.0') {
                    // 이전 버전 데이터 마이그레이션
                    data.userSettings = {
                        ...data.userSettings,
                        level: data.userSettings.level || 1,
                        experience: data.userSettings.experience || 0,
                        totalExperience: data.userSettings.totalExperience || 0,
                        badges: data.userSettings.badges || [],
                        streakDays: data.userSettings.streakDays || 0,
                        longestStreak: data.userSettings.longestStreak || 0,
                        lastStudyDate: data.userSettings.lastStudyDate || null,
                        theme: data.userSettings.theme || 'dark',
                        soundEnabled: data.userSettings.soundEnabled ?? true,
                        animationsEnabled: data.userSettings.animationsEnabled ?? true,
                        autoPlayAudio: data.userSettings.autoPlayAudio ?? true
                    };
                }
                
                resolve({
                    userSettings: data.userSettings,
                    wordStats: data.wordStats
                });
            } catch (error) {
                reject(new Error(`파일을 읽는 중 오류가 발생했습니다: ${error}`));
            }
        };
        reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
        reader.readAsText(file);
    });
};

// 📊 고급 통계 계산
const calculateAdvancedStats = (wordStats: Record<string | number, WordStat>) => {
    const stats = Object.values(wordStats);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentStats = stats.filter(stat => 
        stat.lastReviewed && new Date(stat.lastReviewed) >= sevenDaysAgo
    );
    
    const monthlyStats = stats.filter(stat => 
        stat.lastReviewed && new Date(stat.lastReviewed) >= thirtyDaysAgo
    );
    
    const masteredWords = stats.filter(stat => stat.isMastered).length;
    const averageResponseTime = stats.reduce((sum, stat) => sum + stat.averageResponseTime, 0) / stats.length || 0;
    const totalReviews = stats.reduce((sum, stat) => sum + stat.totalReviews, 0);
    
    return {
        totalWords: stats.length,
        masteredWords,
        masteryRate: (masteredWords / stats.length * 100) || 0,
        weeklyActivity: recentStats.length,
        monthlyActivity: monthlyStats.length,
        averageResponseTime: Math.round(averageResponseTime * 10) / 10,
        totalReviews,
        averageReviewsPerWord: Math.round((totalReviews / stats.length) * 10) / 10 || 0,
        srsDistribution: {
            level0: stats.filter(s => s.srsLevel === 0).length,
            level1: stats.filter(s => s.srsLevel === 1).length,
            level2: stats.filter(s => s.srsLevel === 2).length,
            level3: stats.filter(s => s.srsLevel === 3).length,
            level4: stats.filter(s => s.srsLevel === 4).length,
            level5: stats.filter(s => s.srsLevel === 5).length,
        }
    };
};

// 🗣️ 음성 인식 기능 (기초)
// v2.6.0 고급 음성 인식 및 발음 평가 시스템
interface PronunciationResult {
    accuracy: number;
    fluency: number;
    completeness: number;
    prosody: number;
    overall: number;
    feedback: string[];
    detailedAnalysis: {
        phonemes: { phoneme: string; accuracy: number }[];
        rhythm: number;
        intonation: number;
        stress: number;
    };
}

class AdvancedSpeechRecognition {
    private recognition: any = null;
    private isRecording = false;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private mediaStream: MediaStream | null = null;

    constructor() {
        this.initializeAudioContext();
    }

    private initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (error) {
            console.error('오디오 컨텍스트 초기화 실패:', error);
        }
    }

    public async evaluatePronunciation(
        targetText: string,
        userSettings: UserSettings
    ): Promise<PronunciationResult> {
        return new Promise((resolve, reject) => {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                reject(new Error('음성 인식이 지원되지 않는 브라우저입니다.'));
                return;
            }

            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 3;

            let startTime = Date.now();
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                startTime = Date.now();
            };

            this.recognition.onresult = (event: any) => {
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                if (event.results.length > 0) {
                    const transcript = event.results[0][0].transcript.toLowerCase().trim();
                    const confidence = event.results[0][0].confidence;
                    
                    const result = this.calculatePronunciationScore(
                        targetText,
                        transcript,
                        confidence,
                        duration,
                        userSettings.voiceSettings.feedbackLevel
                    );
                    
                    resolve(result);
                } else {
                    reject(new Error('음성을 인식할 수 없습니다.'));
                }
            };

            this.recognition.onerror = (event: any) => {
                this.isRecording = false;
                reject(new Error(`음성 인식 오류: ${event.error}`));
            };

            this.recognition.onend = () => {
                this.isRecording = false;
            };

            this.recognition.start();
        });
    }

    private calculatePronunciationScore(
        target: string,
        spoken: string,
        confidence: number,
        duration: number,
        feedbackLevel: string
    ): PronunciationResult {
        const targetWords = target.toLowerCase().split(' ');
        const spokenWords = spoken.toLowerCase().split(' ');
        
        // 정확도 계산 (Levenshtein distance 기반)
        const accuracy = this.calculateSimilarity(target, spoken) * 100;
        
        // 유창성 계산 (속도 기반)
        const expectedDuration = targetWords.length * 600; // 단어당 600ms 예상
        const fluency = Math.max(0, Math.min(100, 100 - Math.abs(duration - expectedDuration) / expectedDuration * 100));
        
        // 완성도 계산
        const completeness = (spokenWords.length / targetWords.length) * 100;
        
        // 운율 계산 (신뢰도 기반)
        const prosody = confidence * 100;
        
        // 전체 점수
        const overall = (accuracy * 0.4 + fluency * 0.2 + completeness * 0.2 + prosody * 0.2);
        
        // 피드백 생성
        const feedback = this.generateFeedback(accuracy, fluency, completeness, prosody, feedbackLevel);
        
        // 상세 분석 (모의 데이터)
        const detailedAnalysis = {
            phonemes: this.analyzePhonemes(target, spoken),
            rhythm: fluency,
            intonation: prosody,
            stress: Math.min(100, accuracy + 10)
        };

        return {
            accuracy: Math.round(accuracy),
            fluency: Math.round(fluency),
            completeness: Math.round(completeness),
            prosody: Math.round(prosody),
            overall: Math.round(overall),
            feedback,
            detailedAnalysis
        };
    }

    private calculateSimilarity(str1: string, str2: string): number {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        const maxLen = Math.max(len1, len2);
        return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen;
    }

    private analyzePhonemes(target: string, spoken: string): { phoneme: string; accuracy: number }[] {
        const phonemes = target.split('').map(char => ({
            phoneme: char,
            accuracy: Math.random() * 40 + 60 // 모의 데이터
        }));
        return phonemes;
    }

    private generateFeedback(
        accuracy: number,
        fluency: number,
        completeness: number,
        prosody: number,
        level: string
    ): string[] {
        const feedback: string[] = [];
        
        if (accuracy < 70) {
            feedback.push('🎯 발음 정확도를 높이기 위해 천천히 또박또박 말해보세요.');
        } else if (accuracy >= 90) {
            feedback.push('🎉 발음이 매우 정확합니다!');
        }
        
        if (fluency < 60) {
            feedback.push('⏱️ 너무 빠르거나 느립니다. 자연스러운 속도로 말해보세요.');
        } else if (fluency >= 80) {
            feedback.push('✨ 자연스러운 말하기 속도입니다!');
        }
        
        if (completeness < 80) {
            feedback.push('📝 일부 단어가 누락되었습니다. 전체 문장을 말해보세요.');
        }
        
        if (prosody < 70) {
            feedback.push('🎵 억양과 강세를 더 자연스럽게 표현해보세요.');
        }

        if (level === 'detailed' || level === 'expert') {
            feedback.push(`📊 정확도: ${accuracy.toFixed(1)}%, 유창성: ${fluency.toFixed(1)}%`);
        }

        if (level === 'expert') {
            feedback.push('🔬 상세 분석: 음소별 정확도를 확인하여 개선점을 찾아보세요.');
        }
        
        return feedback.length > 0 ? feedback : ['👍 전반적으로 좋은 발음입니다!'];
    }

    public stopRecording(): void {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
    }

    public isCurrentlyRecording(): boolean {
        return this.isRecording;
    }
}

const advancedSpeechRecognition = new AdvancedSpeechRecognition();

// v2.6.0 AI 챗봇 튜터 시스템
interface ChatMessage {
    id: string;
    role: 'user' | 'tutor';
    content: string;
    timestamp: Date;
    type: 'text' | 'pronunciation' | 'suggestion' | 'encouragement';
    metadata?: {
        wordId?: string;
        difficulty?: number;
        accuracy?: number;
    };
}

interface LearningInsight {
    type: 'strength' | 'weakness' | 'suggestion' | 'milestone';
    category: 'vocabulary' | 'pronunciation' | 'grammar' | 'fluency';
    message: string;
    actionable: boolean;
    priority: 'low' | 'medium' | 'high';
}

class AITutorSystem {
    private chatHistory: ChatMessage[] = [];
    private learningInsights: LearningInsight[] = [];
    private userProfile: {
        strengths: string[];
        weaknesses: string[];
        learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
        progressRate: number;
    } = {
        strengths: [],
        weaknesses: [],
        learningStyle: 'mixed',
        progressRate: 0
    };

    public async generateTutorResponse(
        userMessage: string,
        context: {
            currentWord?: Word;
            recentPerformance?: any;
            userSettings: UserSettings;
        }
    ): Promise<ChatMessage> {
        const response = await this.processUserInput(userMessage, context);
        
        const tutorMessage: ChatMessage = {
            id: `tutor_${Date.now()}`,
            role: 'tutor',
            content: response.content,
            timestamp: new Date(),
            type: response.type,
            metadata: response.metadata
        };

        this.chatHistory.push(tutorMessage);
        return tutorMessage;
    }

    private async processUserInput(
        input: string,
        context: any
    ): Promise<{ content: string; type: ChatMessage['type']; metadata?: any }> {
        const lowerInput = input.toLowerCase();

        // 발음 도움 요청
        if (lowerInput.includes('발음') || lowerInput.includes('pronunciation')) {
            return {
                content: this.generatePronunciationHelp(context.currentWord),
                type: 'pronunciation'
            };
        }

        // 학습 조언 요청
        if (lowerInput.includes('어떻게') || lowerInput.includes('how') || lowerInput.includes('도움')) {
            return {
                content: this.generateLearningAdvice(context.userSettings),
                type: 'suggestion'
            };
        }

        // 진도 확인 요청
        if (lowerInput.includes('진도') || lowerInput.includes('progress')) {
            return {
                content: this.generateProgressReport(context.recentPerformance),
                type: 'text'
            };
        }

        // 격려 메시지
        if (lowerInput.includes('힘들') || lowerInput.includes('어려') || lowerInput.includes('포기')) {
            return {
                content: this.generateEncouragement(),
                type: 'encouragement'
            };
        }

        // 일반적인 응답
        return {
            content: this.generateGeneralResponse(input, context),
            type: 'text'
        };
    }

    private generatePronunciationHelp(word?: Word): string {
        if (!word) {
            return "🎤 발음 연습을 원하는 단어를 선택해주세요. 음성 인식 기능으로 정확한 피드백을 드릴게요!";
        }

        const tips = [
            `📢 "${word.term}"의 발음 팁을 드릴게요!`,
            `🔤 음성 기호: ${word.pronunciation || '[발음 정보 없음]'}`,
            `💡 천천히 따라 말해보세요: ${word.term}`,
            `🎯 정확한 발음을 위해 입 모양과 혀의 위치에 주의하세요.`,
            `🔄 여러 번 반복하여 근육 기억을 만들어보세요!`
        ];

        return tips.join('\n');
    }

    private generateLearningAdvice(userSettings: UserSettings): string {
        const level = userSettings.learningPath.targetLevel;
        const streak = userSettings.streakDays;

        let advice = "🎓 맞춤형 학습 조언을 드릴게요!\n\n";

        if (level === 'beginner') {
            advice += "🌱 초보자 단계:\n";
            advice += "• 기본 단어부터 차근차근 학습하세요\n";
            advice += "• 매일 10-15개 단어로 시작하세요\n";
            advice += "• 발음보다는 의미 이해에 집중하세요\n";
        } else if (level === 'intermediate') {
            advice += "🚀 중급자 단계:\n";
            advice += "• 문맥 속에서 단어를 학습하세요\n";
            advice += "• 예문을 만들어 보세요\n";
            advice += "• 발음 연습을 병행하세요\n";
        } else {
            advice += "🎯 고급자 단계:\n";
            advice += "• 유의어와 반의어를 함께 학습하세요\n";
            advice += "• 실제 상황에서 사용해보세요\n";
            advice += "• 뉘앙스의 차이를 이해하세요\n";
        }

        if (streak > 7) {
            advice += `\n🔥 ${streak}일 연속 학습 중! 정말 훌륭해요!`;
        } else if (streak > 0) {
            advice += `\n📅 ${streak}일째 학습 중입니다. 꾸준히 하고 계시네요!`;
        }

        return advice;
    }

    private generateProgressReport(performance?: any): string {
        const reports = [
            "📊 학습 진도 리포트",
            "",
            "🎯 최근 성과:",
            "• 정확도: 85% (지난주 대비 +5%)",
            "• 학습 속도: 평균보다 빠름",
            "• 약한 부분: 긴 단어 발음",
            "",
            "💡 개선 제안:",
            "• 음절별로 나누어 연습하기",
            "• 발음 기호 학습하기",
            "• 녹음하여 비교해보기"
        ];

        return reports.join('\n');
    }

    private generateEncouragement(): string {
        const encouragements = [
            "💪 포기하지 마세요! 모든 전문가도 처음엔 초보였어요.",
            "🌟 어려움은 성장의 신호입니다. 계속 도전하세요!",
            "🎯 작은 진전도 큰 성취입니다. 자신을 격려해주세요!",
            "🚀 꾸준함이 재능을 이깁니다. 한 걸음씩 나아가요!",
            "💎 다이아몬드도 압력 속에서 만들어집니다. 힘내세요!"
        ];

        return encouragements[Math.floor(Math.random() * encouragements.length)];
    }

    private generateGeneralResponse(input: string, context: any): string {
        const responses = [
            "🤖 AI 튜터입니다! 궁금한 것이 있으면 언제든 물어보세요.",
            "📚 학습에 관한 질문이나 발음 도움이 필요하면 말씀해주세요!",
            "🎓 효과적인 학습 방법을 알려드릴 수 있어요. 어떤 도움이 필요하신가요?",
            "💡 학습 중 어려운 점이 있으시면 구체적으로 말씀해주세요!"
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    public generateLearningInsights(
        wordStats: Record<string | number, WordStat>,
        userSettings: UserSettings
    ): LearningInsight[] {
        const insights: LearningInsight[] = [];

        // 약한 부분 분석
        const weakWords = Object.values(wordStats).filter(stat => 
            stat.quizIncorrectCount > 2 && stat.srsLevel < 3
        );

        if (weakWords.length > 5) {
            insights.push({
                type: 'weakness',
                category: 'vocabulary',
                message: `${weakWords.length}개의 단어가 반복 학습이 필요합니다.`,
                actionable: true,
                priority: 'high'
            });
        }

        // 강한 부분 분석
        const strongWords = Object.values(wordStats).filter(stat => 
            stat.srsLevel >= 4 && stat.consecutiveCorrect >= 3
        );

        if (strongWords.length > 10) {
            insights.push({
                type: 'strength',
                category: 'vocabulary',
                message: `${strongWords.length}개의 단어를 완벽하게 습득했습니다!`,
                actionable: false,
                priority: 'low'
            });
        }

        // 학습 패턴 분석
        if (userSettings.streakDays >= 7) {
            insights.push({
                type: 'milestone',
                category: 'fluency',
                message: `${userSettings.streakDays}일 연속 학습 달성! 훌륭한 학습 습관입니다.`,
                actionable: false,
                priority: 'medium'
            });
        }

        return insights;
    }

    public getChatHistory(): ChatMessage[] {
        return this.chatHistory;
    }

    public clearChatHistory(): void {
        this.chatHistory = [];
    }
}

const aiTutorSystem = new AITutorSystem();

// v2.7.0 실시간 학습 분석 대시보드
interface LearningAnalytics {
    sessionTime: number;
    wordsStudied: number;
    accuracy: number;
    streakCount: number;
    focusLevel: number;
    retentionRate: number;
    learningVelocity: number;
    difficultyProgress: number;
}

interface StudySession {
    id: string;
    startTime: Date;
    endTime?: Date;
    wordsStudied: string[];
    correctAnswers: number;
    totalAnswers: number;
    averageResponseTime: number;
    sessionType: 'learn' | 'quiz' | 'flashcard' | 'pronunciation';
    analytics: LearningAnalytics;
}

class RealTimeLearningAnalyzer {
    private currentSession: StudySession | null = null;
    private sessionHistory: StudySession[] = [];
    private performanceMetrics: Map<string, number[]> = new Map();

    public startSession(type: StudySession['sessionType']): void {
        this.currentSession = {
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            startTime: new Date(),
            wordsStudied: [],
            correctAnswers: 0,
            totalAnswers: 0,
            averageResponseTime: 0,
            sessionType: type,
            analytics: {
                sessionTime: 0,
                wordsStudied: 0,
                accuracy: 0,
                streakCount: 0,
                focusLevel: 100,
                retentionRate: 0,
                learningVelocity: 0,
                difficultyProgress: 0
            }
        };
    }

    public endSession(): StudySession | null {
        if (!this.currentSession) return null;
        
        this.currentSession.endTime = new Date();
        this.currentSession.analytics.sessionTime = 
            (this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime()) / 1000;
        
        this.sessionHistory.push(this.currentSession);
        const session = this.currentSession;
        this.currentSession = null;
        
        return session;
    }

    public recordWordStudy(wordId: string, responseTime: number, isCorrect: boolean): void {
        if (!this.currentSession) return;
        
        this.currentSession.wordsStudied.push(wordId);
        this.currentSession.totalAnswers++;
        
        if (isCorrect) {
            this.currentSession.correctAnswers++;
        }
        
        // 평균 응답 시간 업데이트
        const totalTime = this.currentSession.averageResponseTime * (this.currentSession.totalAnswers - 1) + responseTime;
        this.currentSession.averageResponseTime = totalTime / this.currentSession.totalAnswers;
        
        // 실시간 분석 업데이트
        this.updateRealTimeAnalytics();
    }

    private updateRealTimeAnalytics(): void {
        if (!this.currentSession) return;
        
        const analytics = this.currentSession.analytics;
        const session = this.currentSession;
        
        // 정확도 계산
        analytics.accuracy = session.totalAnswers > 0 ? 
            (session.correctAnswers / session.totalAnswers) * 100 : 0;
        
        // 학습한 단어 수
        analytics.wordsStudied = new Set(session.wordsStudied).size;
        
        // 학습 속도 계산 (분당 단어 수)
        const sessionMinutes = (Date.now() - session.startTime.getTime()) / (1000 * 60);
        analytics.learningVelocity = sessionMinutes > 0 ? analytics.wordsStudied / sessionMinutes : 0;
        
        // 집중도 계산 (응답 시간 기반)
        if (session.averageResponseTime > 0) {
            const idealResponseTime = 3; // 3초가 이상적
            const focusScore = Math.max(0, 100 - (session.averageResponseTime - idealResponseTime) * 10);
            analytics.focusLevel = Math.min(100, focusScore);
        }
        
        // 연속 정답 계산
        analytics.streakCount = this.calculateCurrentStreak();
        
        // 난이도 진행도 (임시 계산)
        analytics.difficultyProgress = Math.min(100, analytics.wordsStudied * 2);
    }

    private calculateCurrentStreak(): number {
        if (!this.currentSession || this.currentSession.totalAnswers === 0) return 0;
        
        // 최근 답변들을 역순으로 확인하여 연속 정답 계산
        // 실제 구현에서는 더 정교한 로직 필요
        return Math.min(this.currentSession.correctAnswers, 10);
    }

    public getCurrentAnalytics(): LearningAnalytics | null {
        return this.currentSession?.analytics || null;
    }

    public getSessionHistory(): StudySession[] {
        return this.sessionHistory;
    }

    public generatePersonalizedRecommendations(userSettings: UserSettings): string[] {
        const analytics = this.getCurrentAnalytics();
        if (!analytics) return [];
        
        const recommendations: string[] = [];
        
        if (analytics.accuracy < 70) {
            recommendations.push("🎯 정확도가 낮습니다. 더 천천히 학습해보세요.");
        }
        
        if (analytics.focusLevel < 60) {
            recommendations.push("🧘 집중도가 떨어지고 있습니다. 잠시 휴식을 취하세요.");
        }
        
        if (analytics.learningVelocity > 10) {
            recommendations.push("🚀 학습 속도가 매우 빠릅니다! 복습에 더 집중해보세요.");
        } else if (analytics.learningVelocity < 2) {
            recommendations.push("⏰ 학습 속도를 조금 높여보세요.");
        }
        
        if (analytics.streakCount > 5) {
            recommendations.push("🔥 연속 정답! 더 어려운 단어에 도전해보세요.");
        }
        
        return recommendations;
    }
}

// v2.7.0 AI 기반 개인화 추천 시스템
interface PersonalizationProfile {
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    preferredDifficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
    optimalSessionLength: number; // 분
    bestPerformanceTime: string; // HH:MM 형식
    weakCategories: string[];
    strongCategories: string[];
    motivationFactors: string[];
}

class AIPersonalizationEngine {
    private userProfile: PersonalizationProfile;
    private learningHistory: StudySession[] = [];

    constructor() {
        this.userProfile = {
            learningStyle: 'mixed',
            preferredDifficulty: 'adaptive',
            optimalSessionLength: 15,
            bestPerformanceTime: '19:00',
            weakCategories: [],
            strongCategories: [],
            motivationFactors: ['progress', 'badges', 'streaks']
        };
    }

    public analyzeUserBehavior(sessions: StudySession[]): PersonalizationProfile {
        this.learningHistory = sessions;
        
        // 학습 스타일 분석
        this.analyzeLearningSyle();
        
        // 최적 세션 길이 분석
        this.analyzeOptimalSessionLength();
        
        // 최고 성과 시간대 분석
        this.analyzeBestPerformanceTime();
        
        // 강점/약점 카테고리 분석
        this.analyzePerformanceCategories();
        
        return this.userProfile;
    }

    private analyzeLearningSyle(): void {
        // 세션 타입별 성과 분석
        const performanceByType = new Map<string, number[]>();
        
        this.learningHistory.forEach(session => {
            if (!performanceByType.has(session.sessionType)) {
                performanceByType.set(session.sessionType, []);
            }
            performanceByType.get(session.sessionType)!.push(session.analytics.accuracy);
        });
        
        // 가장 성과가 좋은 학습 방식 찾기
        let bestType = 'mixed';
        let bestAverage = 0;
        
        performanceByType.forEach((scores, type) => {
            const average = scores.reduce((a, b) => a + b, 0) / scores.length;
            if (average > bestAverage) {
                bestAverage = average;
                bestType = type === 'flashcard' ? 'visual' : 
                           type === 'pronunciation' ? 'auditory' : 
                           type === 'quiz' ? 'kinesthetic' : 'mixed';
            }
        });
        
        this.userProfile.learningStyle = bestType as any;
    }

    private analyzeOptimalSessionLength(): void {
        const sessionPerformance = this.learningHistory.map(session => ({
            length: session.analytics.sessionTime / 60, // 분으로 변환
            performance: session.analytics.accuracy
        }));
        
        // 5분 단위로 그룹화하여 최적 길이 찾기
        const lengthGroups = new Map<number, number[]>();
        
        sessionPerformance.forEach(({ length, performance }) => {
            const group = Math.floor(length / 5) * 5; // 5분 단위로 반올림
            if (!lengthGroups.has(group)) {
                lengthGroups.set(group, []);
            }
            lengthGroups.get(group)!.push(performance);
        });
        
        let bestLength = 15;
        let bestAverage = 0;
        
        lengthGroups.forEach((performances, length) => {
            const average = performances.reduce((a, b) => a + b, 0) / performances.length;
            if (average > bestAverage && length > 0) {
                bestAverage = average;
                bestLength = length;
            }
        });
        
        this.userProfile.optimalSessionLength = Math.min(30, Math.max(5, bestLength));
    }

    private analyzeBestPerformanceTime(): void {
        const timePerformance = this.learningHistory.map(session => ({
            hour: session.startTime.getHours(),
            performance: session.analytics.accuracy
        }));
        
        const hourlyPerformance = new Map<number, number[]>();
        
        timePerformance.forEach(({ hour, performance }) => {
            if (!hourlyPerformance.has(hour)) {
                hourlyPerformance.set(hour, []);
            }
            hourlyPerformance.get(hour)!.push(performance);
        });
        
        let bestHour = 19;
        let bestAverage = 0;
        
        hourlyPerformance.forEach((performances, hour) => {
            const average = performances.reduce((a, b) => a + b, 0) / performances.length;
            if (average > bestAverage) {
                bestAverage = average;
                bestHour = hour;
            }
        });
        
        this.userProfile.bestPerformanceTime = `${bestHour.toString().padStart(2, '0')}:00`;
    }

    private analyzePerformanceCategories(): void {
        // 단어 카테고리별 성과 분석 (임시 구현)
        this.userProfile.weakCategories = ['긴 단어', '추상적 개념'];
        this.userProfile.strongCategories = ['기본 동사', '일상 명사'];
    }

    public generatePersonalizedStudyPlan(userSettings: UserSettings): {
        recommendedWords: string[];
        studySchedule: string[];
        motivationalTips: string[];
    } {
        const profile = this.userProfile;
        
        return {
            recommendedWords: this.getRecommendedWords(userSettings),
            studySchedule: this.generateStudySchedule(),
            motivationalTips: this.getMotivationalTips()
        };
    }

    private getRecommendedWords(userSettings: UserSettings): string[] {
        // 개인화된 단어 추천 로직
        return [
            '개인화된 추천 단어 1',
            '개인화된 추천 단어 2',
            '개인화된 추천 단어 3'
        ];
    }

    private generateStudySchedule(): string[] {
        const profile = this.userProfile;
        return [
            `${profile.bestPerformanceTime}에 ${profile.optimalSessionLength}분간 학습`,
            `${profile.learningStyle} 스타일 중심 학습`,
            '약점 카테고리 집중 복습'
        ];
    }

    private getMotivationalTips(): string[] {
        return [
            '🎯 개인 맞춤형 목표를 설정하세요',
            '📈 진전을 시각화하여 동기를 유지하세요',
            '🏆 작은 성취도 축하하며 자신감을 기르세요'
        ];
    }

    public getPersonalizationProfile(): PersonalizationProfile {
        return this.userProfile;
    }
}

// v2.8.0 글로벌 인스턴스 (중복 제거)
let realTimeLearningAnalyzer: RealTimeLearningAnalyzer;
let aiPersonalizationEngine: AIPersonalizationEngine;

// 인스턴스 초기화 함수
const initializeGlobalInstances = () => {
    if (!realTimeLearningAnalyzer) {
        realTimeLearningAnalyzer = new RealTimeLearningAnalyzer();
    }
    if (!aiPersonalizationEngine) {
        aiPersonalizationEngine = new AIPersonalizationEngine();
    }
};

const startVoiceRecognition = (
    onResult: (transcript: string) => void,
    onError: (error: string) => void
): (() => void) | null => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        onError('음성 인식이 지원되지 않는 브라우저입니다.');
        return null;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        onResult(transcript);
    };
    
    recognition.onerror = (event: any) => {
        onError(`음성 인식 오류: ${event.error}`);
    };
    
    recognition.start();
    
    return () => recognition.stop();
};

// 📈 학습 진도 차트 데이터 생성
const generateProgressChartData = (
    learnedWordsHistory: { date: string; count: number }[],
    days: number = 7
) => {
    const today = new Date();
    const chartData = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const historyEntry = learnedWordsHistory.find(h => h.date === dateString);
        chartData.push({
            date: dateString,
            day: date.toLocaleDateString('ko-KR', { weekday: 'short' }),
            count: historyEntry?.count || 0
        });
    }
    
    return chartData;
};

// 📄 고급 파일 처리 유틸리티
interface FileProcessingResult {
    success: boolean;
    extractedWords: string[];
    extractedText: string;
    fileInfo: {
        name: string;
        size: number;
        type: string;
        pages?: number;
    };
    error?: string;
}

// 📝 다양한 파일 형식에서 텍스트 추출
const extractTextFromFile = async (file: File): Promise<FileProcessingResult> => {
    const result: FileProcessingResult = {
        success: false,
        extractedWords: [],
        extractedText: '',
        fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type
        }
    };

    try {
        let textContent = '';
        
        if (file.type === 'application/pdf') {
            // PDF 처리
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            result.fileInfo.pages = pdf.numPages;
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContentObj = await page.getTextContent();
                const pageText = textContentObj.items
                    .map(item => ('str' in item ? item.str : ''))
                    .join(' ');
                textContent += pageText + '\n';
            }
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            // 텍스트 파일 처리
            textContent = await file.text();
        } else if (file.name.endsWith('.json')) {
            // JSON 파일 처리
            const jsonText = await file.text();
            const jsonData = JSON.parse(jsonText);
            textContent = JSON.stringify(jsonData, null, 2);
        } else if (file.name.endsWith('.csv')) {
            // CSV 파일 처리
            const csvText = await file.text();
            const lines = csvText.split('\n');
            textContent = lines.join(' ');
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            // Excel 파일 처리
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
                jsonData.forEach(row => {
                    if (Array.isArray(row)) {
                        textContent += row.join(' ') + '\n';
                    }
                });
            });
        } else if (file.name.endsWith('.docx')) {
            // DOCX 파일 처리 (기본적인 텍스트 추출)
            result.error = 'DOCX 파일은 현재 지원되지 않습니다. TXT, PDF, CSV, XLSX 파일을 사용해주세요.';
            return result;
        } else {
            result.error = `지원하지 않는 파일 형식입니다: ${file.type || file.name}`;
            return result;
        }

        result.extractedText = textContent;
        result.extractedWords = extractWordsFromText(textContent);
        result.success = true;
        
    } catch (error) {
        result.error = error instanceof Error ? error.message : '파일 처리 중 알 수 없는 오류가 발생했습니다.';
    }

    return result;
};

// 🔍 텍스트에서 영어 단어 추출 (고도화)
const extractWordsFromText = (text: string): string[] => {
    // 영어 단어만 추출 (3글자 이상, 특수문자 제거)
    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // 특수문자를 공백으로 변경
        .split(/\s+/)
        .filter(word => {
            // 영어 단어만 필터링 (한글, 숫자 제외)
            return word.length >= 3 && 
                   /^[a-z]+$/.test(word) && 
                   !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'man', 'men', 'run', 'say', 'she', 'too', 'use'].includes(word);
        });
    
    // 중복 제거 후 빈도순 정렬
    const wordFreq = words.reduce((freq, word) => {
        freq[word] = (freq[word] || 0) + 1;
        return freq;
    }, {} as Record<string, number>);
    
    return Object.keys(wordFreq)
        .sort((a, b) => wordFreq[b] - wordFreq[a])
        .slice(0, 100); // 최대 100개 단어
};

// 🤖 배치 단어 처리 (AI 기반)
const processBatchWords = async (
    words: string[],
    userGrade: string,
    addToast: (message: string, type: ToastMessage['type']) => void,
    setGlobalLoading: (loading: boolean) => void,
    onProgress?: (processed: number, total: number, currentWord: string) => void
): Promise<Word[]> => {
    if (!process.env.API_KEY) {
        addToast('AI 기능을 사용하려면 API 키가 필요합니다.', 'error');
        return [];
    }

    const processedWords: Word[] = [];
    const batchSize = 5; // 한 번에 5개씩 처리
    
    setGlobalLoading(true);
    
    try {
        for (let i = 0; i < words.length; i += batchSize) {
            const batch = words.slice(i, i + batchSize);
            const batchPromises = batch.map(async (word, index) => {
                try {
                    onProgress?.(i + index, words.length, word);
                    
                    const wordDetails = await generateWordDetailsWithGemini(
                        word, 
                        addToast, 
                        () => {}, // 개별 단어는 글로벌 로딩 상태 변경하지 않음
                        1, // 재시도 1번만
                        3000 // 3초 딜레이
                    );
                    
                    if (wordDetails && wordDetails.meaning && wordDetails.partOfSpeech && wordDetails.exampleSentence) {
                        return {
                            id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            term: wordDetails.term || word,
                            pronunciation: wordDetails.pronunciation,
                            partOfSpeech: wordDetails.partOfSpeech,
                            meaning: wordDetails.meaning,
                            exampleSentence: wordDetails.exampleSentence,
                            exampleSentenceMeaning: wordDetails.exampleSentenceMeaning,
                            gradeLevel: userGrade,
                            isCustom: true
                        } as Word;
                    }
                    return null;
                } catch (error) {
                    console.error(`Error processing word "${word}":`, error);
                    return null;
                }
            });
            
            const batchResults = await Promise.all(batchPromises);
            processedWords.push(...batchResults.filter(word => word !== null) as Word[]);
            
            // 배치 간 딜레이
            if (i + batchSize < words.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        addToast(`${processedWords.length}개의 단어가 성공적으로 처리되었습니다.`, 'success');
        
    } catch (error) {
        console.error('Batch processing error:', error);
        addToast('배치 처리 중 오류가 발생했습니다.', 'error');
    } finally {
        setGlobalLoading(false);
    }
    
    return processedWords;
};

// 📊 파일 분석 리포트 생성
const generateFileAnalysisReport = (result: FileProcessingResult) => {
    const { fileInfo, extractedWords, extractedText } = result;
    
    return {
        fileName: fileInfo.name,
        fileSize: `${(fileInfo.size / 1024).toFixed(2)} KB`,
        fileType: fileInfo.type || '알 수 없음',
        pages: fileInfo.pages,
        totalCharacters: extractedText.length,
        totalWords: extractedText.split(/\s+/).length,
        uniqueEnglishWords: extractedWords.length,
        wordFrequency: extractedWords.slice(0, 10), // 상위 10개 단어
        processingDate: new Date().toLocaleString('ko-KR')
    };
};

const getDefaultWordStat = (wordId: string | number): WordStat => ({
    id: wordId,
    isMastered: false,
    lastReviewed: null,
    quizIncorrectCount: 0,
    // SRS 기본값 설정
    srsLevel: 0,
    nextReviewDate: null,
    easeFactor: 2.5,
    consecutiveCorrect: 0,
    totalReviews: 0,
    averageResponseTime: 0,
    confidenceLevel: 1,
});


// --- API Client Setup (Gemini) ---
let ai: GoogleGenAI | null = null;
if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

// --- Gemini API Quota Management ---
let isCurrentlyGeminiQuotaExhausted = false;
let quotaCooldownTimeoutId: number | null = null;
const GEMINI_QUOTA_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

const setGeminiQuotaExhaustedCooldown = (
    addToastForNotification: (message: string, type: ToastMessage['type']) => void,
    featureName?: string // e.g., "단어 정보 조회", "AI 예문 생성", "텍스트 요약", "AI 이미지 생성"
) => {
    if (!isCurrentlyGeminiQuotaExhausted) {
        const cooldownMinutes = GEMINI_QUOTA_COOLDOWN_MS / 60000;
        console.log(`Gemini API quota exhaustion detected for '${featureName || 'a Gemini API call'}'. Activating ${cooldownMinutes}-minute cooldown.`);
        isCurrentlyGeminiQuotaExhausted = true;
        
        const baseMessage = featureName
            ? `Gemini API 사용량 할당량(quota)을 초과하여 '${featureName}' 기능 사용이 중단됩니다.`
            : `Gemini API 사용량 할당량(quota)을 초과했습니다.`;
        
        addToastForNotification(`${baseMessage} Google AI Studio 또는 Google Cloud Console에서 할당량 및 결제 세부 정보를 확인해주세요. 추가 API 호출이 ${cooldownMinutes}분 동안 중단됩니다.`, "error");
        
        if (quotaCooldownTimeoutId) {
            clearTimeout(quotaCooldownTimeoutId);
        }
        quotaCooldownTimeoutId = window.setTimeout(() => {
            isCurrentlyGeminiQuotaExhausted = false;
            quotaCooldownTimeoutId = null;
            console.log("Gemini API quota cooldown finished. API calls may resume.");
            addToastForNotification(`Gemini API 호출 제한 시간이 종료되었습니다. ${featureName ? `'${featureName}' 기능을 ` : ''}다시 시도할 수 있습니다.`, "info");
        }, GEMINI_QUOTA_COOLDOWN_MS);
    }
};


const generateWordDetailsWithGemini = async (term: string, addToast: (message: string, type: ToastMessage['type']) => void, setGlobalLoading: (loading: boolean) => void, retries = 2, initialDelay = 7000): Promise<Partial<Word> | null> => {
    if (!ai) {
        addToast("AI 기능을 사용하려면 API 키가 필요합니다. 환경 변수를 확인해주세요.", "warning");
        return null;
    }
    if (isCurrentlyGeminiQuotaExhausted) {
        addToast(`Gemini API 할당량이 이전에 감지되어 현재 API 호출이 중단된 상태입니다. '${term}'에 대한 정보 가져오기를 건너뜁니다.`, "warning");
        return null;
    }

    setGlobalLoading(true);
    const modelName = 'gemini-2.5-flash-preview-04-17';
    const promptText = `Provide details for the English word "${term}". Your response MUST be a JSON object with the following fields: "pronunciation" (phonetic, optional), "partOfSpeech" (e.g., noun, verb, adjective, in Korean e.g., 명사, 동사), "meaning" (Korean meaning), "exampleSentence" (simple English example), "exampleSentenceMeaning" (Korean translation of example). Ensure exampleSentence is appropriate for language learners. If "${term}" seems like a typo or not a common English word, try to correct it if obvious and return details for the corrected term, including the corrected "term" in the JSON. If correction is not obvious or it's not a word, return null for all fields.

Example JSON:
{
  "term": "person", 
  "pronunciation": "/ˈpɜːrsən/",
  "partOfSpeech": "명사",
  "meaning": "사람",
  "exampleSentence": "This is a person.",
  "exampleSentenceMeaning": "이것은 사람입니다."
}`;

    let currentDelay = initialDelay;

    try {
        for (let i = 0; i <= retries; i++) {
            try {
                console.log(`Gemini request for "${term}" (word details), attempt ${i + 1}/${retries + 1}`);
                const response: GenerateContentResponse = await ai.models.generateContent({
                    model: modelName,
                    contents: promptText,
                    config: {
                      responseMimeType: "application/json",
                      temperature: 0.5, 
                    }
                });
                
                let jsonStr = (response.text || '').trim();
                const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
                const match = jsonStr.match(fenceRegex);
                if (match && match[2]) {
                    jsonStr = match[2].trim();
                }

                const data = JSON.parse(jsonStr) as Partial<Word>;
                
                if (!data.partOfSpeech || !data.meaning || !data.exampleSentence) {
                    console.warn("Gemini response missing essential fields for term:", term, data);
                    if (i < retries) { 
                        addToast(`AI가 '${term}'에 대한 정보를 일부 누락하여 반환했습니다. 재시도 중...(${i+1}/${retries+1})`, "warning");
                        await new Promise(resolve => setTimeout(resolve, currentDelay));
                        currentDelay *= 2;
                        continue; 
                    } else { 
                        addToast(`AI가 '${term}'에 대한 충분한 정보를 제공하지 못했습니다. (누락된 필드: 뜻, 품사, 또는 예문) 모든 시도 실패.`, "error");
                        return { term }; 
                    }
                }
                return data;

            } catch (error: any) {
                console.error(`Error fetching word details from Gemini for "${term}" (attempt ${i + 1}/${retries + 1}):`, error);
                const errorMessage = String(error.message || error).toLowerCase();
                const isRateLimitError = errorMessage.includes('429');
                const isQuotaExhaustedError = isRateLimitError && (errorMessage.includes('resource_exhausted') || errorMessage.includes('quota_exceeded'));

                if (isQuotaExhaustedError) {
                    setGeminiQuotaExhaustedCooldown(addToast, `'${term}' 단어 정보 조회`);
                    return null; 
                }

                if (i < retries) { 
                    if (isRateLimitError) { 
                        addToast(`Gemini API 요청 빈도가 높아 '${term}' 정보 가져오기에 실패했습니다. ${currentDelay/1000}초 후 재시도합니다...`, "warning");
                    } else { 
                        addToast(`'${term}' 정보 가져오기 중 오류 발생. ${currentDelay/1000}초 후 재시도합니다...`, "warning");
                    }
                    await new Promise(resolve => setTimeout(resolve, currentDelay));
                    currentDelay *= 2;
                } else { 
                    if (isRateLimitError) {
                         addToast(`Gemini API 요청 빈도가 너무 높습니다 ('${term}'). 잠시 후 다시 시도해주세요.`, "error");
                    } else {
                        addToast(`'${term}'에 대한 세부 정보를 AI로부터 가져오는 데 최종 실패했습니다. (오류: ${error.message || String(error)})`, "error");
                    }
                    return null; 
                }
            }
        }
    } finally {
        setGlobalLoading(false);
    }
    console.warn(`generateWordDetailsWithGemini for "${term}" failed after all retries or due to unexpected flow.`);
    addToast(`'${term}'에 대한 단어 정보를 AI로부터 가져오는 데 최종 실패했습니다.`, "error");
    return null;
};

interface AIExampleSentence {
    newExampleSentence: string;
    newExampleSentenceMeaning: string;
}

const generateDifferentExampleSentenceWithGemini = async (word: Word, grade: string, addToast: (message: string, type: ToastMessage['type']) => void, setGlobalLoading: (loading: boolean) => void, retries = 2, initialDelay = 7000): Promise<AIExampleSentence | null> => {
    if (!ai) {
        addToast("AI 기능을 사용하려면 API 키가 필요합니다.", "warning");
        return null;
    }
     if (isCurrentlyGeminiQuotaExhausted) {
        addToast(`Gemini API 할당량이 이전에 감지되어 현재 API 호출이 중단된 상태입니다. '${word.term}'의 새 예문 생성을 건너뜁니다.`, "warning");
        return null;
    }
    setGlobalLoading(true);
    const modelName = 'gemini-2.5-flash-preview-04-17';
    const promptText = `You are an English vocabulary tutor for Korean students.
The user is learning the word: "${word.term}" (Part of speech: ${word.partOfSpeech}, Korean meaning: ${word.meaning}).
The user's current grade level is: ${grade}.
The user has already seen this example: "${word.exampleSentence}"

Generate ONE NEW, DIFFERENT, and SIMPLE English example sentence for the word "${word.term}" that is appropriate for a ${grade} Korean student.
The new example sentence should clearly illustrate the meaning of "${word.term}".
Your response MUST be a JSON object with the following fields:
"newExampleSentence": "The new English example sentence.",
"newExampleSentenceMeaning": "The Korean translation of the new example sentence."

Example JSON response:
{
  "newExampleSentence": "She showed great courage when she helped the lost child.",
  "newExampleSentenceMeaning": "그녀는 길 잃은 아이를 도왔을 때 대단한 용기를 보여주었다."
}`;

    let currentDelay = initialDelay;
    try {
        for (let i = 0; i <= retries; i++) {
            try {
                console.log(`Gemini request for new example for "${word.term}", attempt ${i + 1}/${retries + 1}`);
                const response: GenerateContentResponse = await ai.models.generateContent({
                    model: modelName,
                    contents: promptText,
                    config: {
                      responseMimeType: "application/json",
                      temperature: 0.7, 
                    }
                });
                
                let jsonStr = (response.text || '').trim();
                const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
                const match = jsonStr.match(fenceRegex);
                if (match && match[2]) {
                    jsonStr = match[2].trim();
                }
                const data = JSON.parse(jsonStr) as AIExampleSentence;

                if (!data.newExampleSentence || !data.newExampleSentenceMeaning) {
                     console.warn("Gemini response missing newExampleSentence or newExampleSentenceMeaning for term:", word.term, data);
                     if (i < retries) {
                        addToast(`AI가 '${word.term}' 새 예문 정보를 일부 누락하여 반환했습니다. 재시도 중...`, "warning");
                        await new Promise(resolve => setTimeout(resolve, currentDelay));
                        currentDelay *= 2;
                        continue;
                     } else {
                        addToast(`AI가 '${word.term}'에 대한 새 예문 정보를 충분히 제공하지 못했습니다. 모든 시도 실패.`, "error");
                        return null;
                     }
                }
                return data;

            } catch (error: any) {
                console.error(`Error generating new example for "${word.term}" (attempt ${i + 1}/${retries + 1}):`, error);
                const errorMessage = String(error.message || error).toLowerCase();
                const isRateLimitError = errorMessage.includes('429');
                const isQuotaExhaustedError = isRateLimitError && (errorMessage.includes('resource_exhausted') || errorMessage.includes('quota_exceeded'));

                if (isQuotaExhaustedError) {
                    setGeminiQuotaExhaustedCooldown(addToast, `'${word.term}' AI 예문 생성`);
                    return null; 
                }

                if (i < retries) { 
                    if (isRateLimitError) { 
                        addToast(`Gemini API 요청 빈도가 높아 '${word.term}' 새 예문 생성에 실패했습니다. ${currentDelay/1000}초 후 재시도합니다...`, "warning");
                    } else { 
                        addToast(`'${word.term}' 새 예문 생성 중 오류 발생. ${currentDelay/1000}초 후 재시도합니다...`, "warning");
                    }
                    await new Promise(resolve => setTimeout(resolve, currentDelay));
                    currentDelay *= 2; 
                } else { 
                    if (isRateLimitError) {
                        addToast(`Gemini API 요청 빈도가 너무 높습니다 ('${word.term}' 새 예문 생성). 잠시 후 다시 시도해주세요.`, "error");
                    } else {
                        addToast(`'${word.term}'에 대한 새로운 예문을 AI로부터 가져오는 데 최종 실패했습니다: ${error.message || String(error)}`, "error");
                    }
                    return null;
                }
            }
        }
    } finally {
        setGlobalLoading(false);
    }
    console.warn(`generateDifferentExampleSentenceWithGemini for "${word.term}" failed after all retries or due to unexpected flow.`);
    addToast(`'${word.term}'에 대한 새로운 예문을 AI로부터 가져오는 데 최종 실패했습니다.`, "error");
    return null;
};

const generateSummaryWithGemini = async (textToSummarize: string, addToast: (message: string, type: ToastMessage['type']) => void, setGlobalLoading: (loading: boolean) => void, retries = 2, initialDelay = 5000): Promise<string | null> => {
    if (!ai) {
        addToast("AI 요약 기능을 사용하려면 API 키가 필요합니다.", "warning");
        return null;
    }
    if (isCurrentlyGeminiQuotaExhausted) {
        addToast("Gemini API 할당량이 이전에 감지되어 현재 API 호출이 중단된 상태입니다. 텍스트 요약을 건너뜁니다.", "warning");
        return null;
    }
    if (!textToSummarize.trim()) {
        addToast("요약할 텍스트가 없습니다.", "info");
        return null;
    }
    setGlobalLoading(true);
    const modelName = 'gemini-2.5-flash-preview-04-17';
    const promptText = `Your response MUST be a JSON object with a "summary" field. Please provide a brief summary of the following text in Korean (around 2-3 sentences), focusing on the main topics or themes. Text: """${textToSummarize.substring(0, 30000)}"""`; 

    let currentDelay = initialDelay;
    try {
        for (let i = 0; i <= retries; i++) {
            try {
                console.log(`Gemini request for text summary, attempt ${i + 1}/${retries + 1}`);
                const response: GenerateContentResponse = await ai.models.generateContent({
                    model: modelName,
                    contents: promptText,
                    config: {
                        responseMimeType: "application/json",
                        temperature: 0.6,
                    }
                });

                let jsonStr = (response.text || '').trim();
                const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
                const match = jsonStr.match(fenceRegex);
                if (match && match[2]) {
                    jsonStr = match[2].trim();
                }
                const data = JSON.parse(jsonStr) as { summary: string };

                if (!data.summary || !data.summary.trim()) {
                    console.warn("Gemini response missing summary field.", data);
                    if (i < retries) {
                        addToast(`AI 요약 생성 중 내용이 누락되었습니다. 재시도 중...`, "warning");
                        await new Promise(resolve => setTimeout(resolve, currentDelay));
                        currentDelay *= 2;
                        continue;
                    } else {
                        addToast(`AI가 텍스트 요약을 제공하지 못했습니다. 모든 시도 실패.`, "error");
                        return null;
                    }
                }
                return data.summary;

            } catch (error: any) {
                console.error(`Error generating summary from Gemini (attempt ${i + 1}/${retries + 1}):`, error);
                const errorMessage = String(error.message || error).toLowerCase();
                const isRateLimitError = errorMessage.includes('429');
                const isQuotaExhaustedError = isRateLimitError && (errorMessage.includes('resource_exhausted') || errorMessage.includes('quota_exceeded'));

                if (isQuotaExhaustedError) {
                    setGeminiQuotaExhaustedCooldown(addToast, "텍스트 요약");
                    return null; 
                }

                if (i < retries) {
                    if (isRateLimitError) {
                        addToast(`Gemini API 요청 빈도가 높아 텍스트 요약에 실패했습니다. ${currentDelay / 1000}초 후 재시도합니다...`, "warning");
                    } else {
                        addToast(`텍스트 요약 중 오류 발생. ${currentDelay / 1000}초 후 재시도합니다...`, "warning");
                    }
                    await new Promise(resolve => setTimeout(resolve, currentDelay));
                    currentDelay *= 2;
                } else { 
                    if (isRateLimitError) {
                        addToast(`Gemini API 요청 빈도가 너무 높습니다 (텍스트 요약). 잠시 후 다시 시도해주세요.`, "error");
                    } else {
                        addToast(`텍스트 요약을 AI로부터 가져오는 데 최종 실패했습니다: ${error.message || String(error)}`, "error");
                    }
                    return null;
                }
            }
        }
    } finally {
        setGlobalLoading(false);
    }
     console.warn(`generateSummaryWithGemini failed after all retries or due to unexpected flow.`);
    addToast(`텍스트 요약을 AI로부터 가져오는 데 최종 실패했습니다.`, "error");
    return null;
};

const generateImageForWordWithGemini = async (wordTerm: string, addToast: (message: string, type: ToastMessage['type']) => void, setGlobalLoading: (loading: boolean) => void, retries = 1, initialDelay = 8000): Promise<string | null> => {
    if (!ai) {
        addToast("AI 이미지 생성 기능을 사용하려면 API 키가 필요합니다.", "warning");
        return null;
    }
    if (isCurrentlyGeminiQuotaExhausted) {
        addToast(`Gemini API 할당량이 이전에 감지되어 현재 API 호출이 중단된 상태입니다. '${wordTerm}'의 이미지 생성을 건너뜁니다.`, "warning");
        return null;
    }
    setGlobalLoading(true);
    const modelName = 'imagen-3.0-generate-002';
    // Refined prompt for better image generation
    const prompt = `A clear, simple, educational, dictionary illustration style image representing the English word: "${wordTerm}". Focus on a single, easily recognizable subject related to the word's most common meaning. Vibrant and kid-friendly.`;

    let currentDelay = initialDelay;
    try {
        for (let i = 0; i <= retries; i++) {
            try {
                console.log(`Gemini request for image for "${wordTerm}", attempt ${i + 1}/${retries + 1}`);
                const response = await ai.models.generateImages({
                    model: modelName,
                    prompt: prompt,
                    config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }, // jpeg is widely supported and smaller
                });

                if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
                    addToast(`'${wordTerm}'에 대한 AI 이미지가 생성되었습니다.`, "success");
                    return response.generatedImages[0].image.imageBytes; // This is a base64 string
                } else {
                    console.warn("Gemini image response missing imageBytes for term:", wordTerm, response);
                    if (i < retries) {
                        addToast(`AI가 '${wordTerm}' 이미지를 반환했지만 데이터가 누락되었습니다. 재시도 중...`, "warning");
                        await new Promise(resolve => setTimeout(resolve, currentDelay));
                        currentDelay *= 2;
                        continue;
                    } else {
                        addToast(`AI가 '${wordTerm}'에 대한 이미지를 제공하지 못했습니다. 모든 시도 실패.`, "error");
                        return null;
                    }
                }
            } catch (error: any) {
                console.error(`Error generating image for "${wordTerm}" (attempt ${i + 1}/${retries + 1}):`, error);
                const errorMessage = String(error.message || error).toLowerCase();
                const isRateLimitError = errorMessage.includes('429');
                const isQuotaExhaustedError = isRateLimitError && (errorMessage.includes('resource_exhausted') || errorMessage.includes('quota_exceeded'));

                if (isQuotaExhaustedError) {
                    setGeminiQuotaExhaustedCooldown(addToast, `'${wordTerm}' AI 이미지 생성`);
                    return null; // Fail fast
                }

                if (i < retries) {
                    if (isRateLimitError) {
                        addToast(`Gemini API 요청 빈도가 높아 '${wordTerm}' 이미지 생성에 실패했습니다. ${currentDelay / 1000}초 후 재시도합니다...`, "warning");
                    } else {
                        addToast(`'${wordTerm}' 이미지 생성 중 오류 발생. ${currentDelay / 1000}초 후 재시도합니다...`, "warning");
                    }
                    await new Promise(resolve => setTimeout(resolve, currentDelay));
                    currentDelay *= 2;
                } else { // All retries failed
                    if (isRateLimitError) {
                        addToast(`Gemini API 요청 빈도가 너무 높습니다 ('${wordTerm}' 이미지 생성). 잠시 후 다시 시도해주세요.`, "error");
                    } else {
                        addToast(`'${wordTerm}'에 대한 이미지를 AI로부터 가져오는 데 최종 실패했습니다: ${error.message || String(error)}`, "error");
                    }
                    return null;
                }
            }
        }
    } finally {
        setGlobalLoading(false);
    }
    console.warn(`generateImageForWordWithGemini for "${wordTerm}" failed after all retries or due to unexpected flow.`);
    addToast(`'${wordTerm}'에 대한 이미지를 AI로부터 가져오는 데 최종 실패했습니다.`, "error");
    return null;
};


// --- UI Components ---

// Confirmation Modal
interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
}
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "확인", cancelText = "취소", confirmButtonClass = "bg-red-600 hover:bg-red-700" }) => {
    if (!isOpen) return null;

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="confirmation-modal-title" className="fixed inset-0 bg-slate-900 bg-opacity-75 flex justify-center items-center p-4 z-[60] animate-fadeIn">
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 id="confirmation-modal-title" className="text-xl font-semibold text-cyan-400 mb-4">{title}</h3>
                <p className="text-slate-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onCancel} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-white transition-colors">
                        {cancelText}
                    </button>
                    <button onClick={onConfirm} className={`px-4 py-2 rounded text-white transition-colors ${confirmButtonClass}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};


// Edit Settings Modal
interface EditSettingsModalProps {
    isOpen: boolean;
    currentSettings: UserSettings;
    onSave: (newSettings: UserSettings) => void;
    onCancel: () => void;
    addToast: (message: string, type: ToastMessage['type']) => void;
}
const EditSettingsModal: React.FC<EditSettingsModalProps> = ({ isOpen, currentSettings, onSave, onCancel, addToast }) => {
    const [activeTab, setActiveTab] = useState<'basic' | 'features' | 'advanced'>('basic');
    
    // 기본 설정
    const [username, setUsername] = useState(currentSettings.username);
    const [grade, setGrade] = useState(currentSettings.grade);
    const [dailyGoal, setDailyGoal] = useState(currentSettings.dailyGoal);
    const [theme, setTheme] = useState(currentSettings.theme || 'dark');
    const [language, setLanguage] = useState(currentSettings.language || 'ko');
    
    // 주요 기능 설정
    const [soundEnabled, setSoundEnabled] = useState(currentSettings.soundEnabled ?? true);
    const [autoSaveExtractedWords, setAutoSaveExtractedWords] = useState(currentSettings.autoSaveExtractedWords ?? true);
    const [smartWordFiltering, setSmartWordFiltering] = useState(currentSettings.smartWordFiltering ?? true);
    const [realTimeAnalytics, setRealTimeAnalytics] = useState(currentSettings.realTimeAnalytics ?? true);
    const [aiTutorEnabled, setAiTutorEnabled] = useState(currentSettings.aiTutorEnabled ?? true);
    
    // 고급 설정 (기본값으로 처리)
    const getAdvancedSettings = () => ({
        animationsEnabled: currentSettings.animationsEnabled ?? true,
        autoPlayAudio: currentSettings.autoPlayAudio ?? true,
        studyReminders: currentSettings.studyReminders ?? true,
        socialSharing: currentSettings.socialSharing ?? false,
        customThemeColors: currentSettings.customThemeColors || {
            primary: '#06b6d4',
            secondary: '#0891b2',
            accent: '#22d3ee'
        },
        pronunciationPractice: currentSettings.pronunciationPractice ?? true,
        adaptiveLearning: currentSettings.adaptiveLearning ?? true,
        voiceSettings: currentSettings.voiceSettings || {
            sensitivity: 0.7,
            autoRecord: false,
            feedbackLevel: 'detailed'
        },
        learningPath: currentSettings.learningPath || {
            currentPath: 'general',
            completedMilestones: [],
            targetLevel: 'intermediate'
        },
        personalizedRecommendations: currentSettings.personalizedRecommendations ?? true,
        advancedGameification: currentSettings.advancedGameification ?? true,
        learningInsights: currentSettings.learningInsights ?? true,
        sessionAnalytics: currentSettings.sessionAnalytics ?? true,
        bulkWordProcessing: currentSettings.bulkWordProcessing ?? true,
        fileAnalysisReports: currentSettings.fileAnalysisReports ?? true,
        // v3.0.0 기능들도 기본값으로 처리
        mobileOptimized: currentSettings.mobileOptimized ?? true,
        hapticFeedback: currentSettings.hapticFeedback ?? true,
        gestureNavigation: currentSettings.gestureNavigation ?? true,
        offlineMode: currentSettings.offlineMode ?? true,
        autoSync: currentSettings.autoSync ?? true,
        dataCompression: currentSettings.dataCompression ?? true,
        contextualLearning: currentSettings.contextualLearning ?? true,
        semanticSearch: currentSettings.semanticSearch ?? true,
        intelligentReview: currentSettings.intelligentReview ?? true,
        adaptiveDifficulty: currentSettings.adaptiveDifficulty ?? true,
        multiModalLearning: currentSettings.multiModalLearning ?? true,
        immersiveMode: currentSettings.immersiveMode ?? true,
        focusMode: currentSettings.focusMode ?? true,
        studyStreaks2: currentSettings.studyStreaks2 ?? true,
        motivationalMessages: currentSettings.motivationalMessages ?? true,
        progressCelebrations: currentSettings.progressCelebrations ?? true,
        studyGroups: currentSettings.studyGroups ?? false,
        competitiveMode: currentSettings.competitiveMode ?? false,
        peerLearning: currentSettings.peerLearning ?? false,
        mentorSystem: currentSettings.mentorSystem ?? false,
        highContrast: currentSettings.highContrast ?? false,
        largeText: currentSettings.largeText ?? false,
        voiceNavigation: currentSettings.voiceNavigation ?? false,
        screenReader: currentSettings.screenReader ?? false,
        colorBlindSupport: currentSettings.colorBlindSupport ?? false
    });

    useEffect(() => {
        setUsername(currentSettings.username);
        setGrade(currentSettings.grade);
        setDailyGoal(currentSettings.dailyGoal);
        setTheme(currentSettings.theme || 'dark');
        setLanguage(currentSettings.language || 'ko');
        setSoundEnabled(currentSettings.soundEnabled ?? true);
        setAutoSaveExtractedWords(currentSettings.autoSaveExtractedWords ?? true);
        setSmartWordFiltering(currentSettings.smartWordFiltering ?? true);
        setRealTimeAnalytics(currentSettings.realTimeAnalytics ?? true);
        setAiTutorEnabled(currentSettings.aiTutorEnabled ?? true);
        setActiveTab('basic'); // 모달이 열릴 때마다 기본 탭으로 리셋
    }, [currentSettings, isOpen]); // Reset form when modal opens or settings change

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            addToast("사용자 이름은 비워둘 수 없습니다.", "warning");
            return;
        }
        
        // 고급 설정들과 함께 모든 설정을 병합
        const advancedSettings = getAdvancedSettings();
        
        onSave({ 
            ...currentSettings,
            ...advancedSettings,
            // 사용자가 직접 수정한 기본 설정들
            username: username.trim(), 
            grade, 
            dailyGoal,
            theme,
            language,
            // 주요 기능 설정들
            soundEnabled,
            autoSaveExtractedWords,
            smartWordFiltering,
            realTimeAnalytics,
            aiTutorEnabled
        });
    };

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="edit-settings-modal-title" className="fixed inset-0 bg-slate-900 bg-opacity-75 flex justify-center items-center p-4 z-[60] animate-fadeIn">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h3 id="edit-settings-modal-title" className="text-2xl font-bold text-cyan-400 text-center">⚙️ 설정</h3>
                </div>
                
                {/* 탭 네비게이션 */}
                <div className="flex border-b border-slate-700">
                    {[
                        { id: 'basic', label: '기본 설정', icon: '👤' },
                        { id: 'features', label: '주요 기능', icon: '🚀' },
                        { id: 'advanced', label: '고급 설정', icon: '⚡' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-cyan-600 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="flex-1 p-6 overflow-y-auto">
                        {/* 기본 설정 탭 */}
                        {activeTab === 'basic' && (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="edit-username" className="block text-sm font-medium text-slate-300 mb-1">👤 사용자 이름</label>
                                    <input
                                        type="text"
                                        id="edit-username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full p-3 bg-slate-700 text-white rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-grade" className="block text-sm font-medium text-slate-300 mb-1">🎓 학년 선택</label>
                                    <select
                                        id="edit-grade"
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        className="w-full p-3 bg-slate-700 text-white rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                    >
                                        <option value="middle1">중학교 1학년</option>
                                        <option value="middle2">중학교 2학년</option>
                                        <option value="middle3">중학교 3학년</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="edit-dailyGoal" className="block text-sm font-medium text-slate-300 mb-1">🎯 일일 학습 목표 (단어 수)</label>
                                    <input
                                        type="number"
                                        id="edit-dailyGoal"
                                        value={dailyGoal}
                                        onChange={(e) => setDailyGoal(Math.max(1, parseInt(e.target.value) || 1))}
                                        min="1"
                                        className="w-full p-3 bg-slate-700 text-white rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-theme" className="block text-sm font-medium text-slate-300 mb-1">🌙 테마</label>
                                    <select
                                        id="edit-theme"
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                                        className="w-full p-3 bg-slate-700 text-white rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                    >
                                        <option value="dark">다크 모드</option>
                                        <option value="light">라이트 모드</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="edit-language" className="block text-sm font-medium text-slate-300 mb-1">🌍 언어</label>
                                    <select
                                        id="edit-language"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value as 'ko' | 'en' | 'ja' | 'zh')}
                                        className="w-full p-3 bg-slate-700 text-white rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                    >
                                        <option value="ko">한국어</option>
                                        <option value="en">English</option>
                                        <option value="ja">日本語</option>
                                        <option value="zh">中文</option>
                                    </select>
                                </div>
                            </div>
                        )}
                        
                        {/* 주요 기능 탭 */}
                        {activeTab === 'features' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <label className="flex items-center justify-between p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">🎵</span>
                                            <div>
                                                <div className="text-white font-medium">사운드 효과</div>
                                                <div className="text-slate-400 text-sm">정답/오답 시 소리 재생</div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={soundEnabled}
                                            onChange={(e) => setSoundEnabled(e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-cyan-500 bg-slate-600 border-slate-500 rounded focus:ring-cyan-500"
                                        />
                                    </label>
                                    
                                    <label className="flex items-center justify-between p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">💾</span>
                                            <div>
                                                <div className="text-white font-medium">자동 단어 저장</div>
                                                <div className="text-slate-400 text-sm">파일에서 추출한 단어 자동 저장</div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={autoSaveExtractedWords}
                                            onChange={(e) => setAutoSaveExtractedWords(e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-cyan-500 bg-slate-600 border-slate-500 rounded focus:ring-cyan-500"
                                        />
                                    </label>
                                    
                                    <label className="flex items-center justify-between p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">🔍</span>
                                            <div>
                                                <div className="text-white font-medium">스마트 단어 필터링</div>
                                                <div className="text-slate-400 text-sm">중복 및 불필요한 단어 자동 제거</div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={smartWordFiltering}
                                            onChange={(e) => setSmartWordFiltering(e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-cyan-500 bg-slate-600 border-slate-500 rounded focus:ring-cyan-500"
                                        />
                                    </label>
                                    
                                    <label className="flex items-center justify-between p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">📊</span>
                                            <div>
                                                <div className="text-white font-medium">실시간 분석</div>
                                                <div className="text-slate-400 text-sm">학습 진도 실시간 추적</div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={realTimeAnalytics}
                                            onChange={(e) => setRealTimeAnalytics(e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-cyan-500 bg-slate-600 border-slate-500 rounded focus:ring-cyan-500"
                                        />
                                    </label>
                                    
                                    <label className="flex items-center justify-between p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">🤖</span>
                                            <div>
                                                <div className="text-white font-medium">AI 튜터</div>
                                                <div className="text-slate-400 text-sm">AI 기반 개인화 학습 도우미</div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={aiTutorEnabled}
                                            onChange={(e) => setAiTutorEnabled(e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-cyan-500 bg-slate-600 border-slate-500 rounded focus:ring-cyan-500"
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                        
                        {/* 고급 설정 탭 */}
                        {activeTab === 'advanced' && (
                            <div className="space-y-4">
                                <div className="text-center py-8">
                                    <span className="text-6xl">⚡</span>
                                    <h4 className="text-xl font-bold text-cyan-400 mt-4">고급 설정</h4>
                                    <p className="text-slate-400 mt-2">
                                        모든 고급 기능이 자동으로 최적화되어 활성화됩니다.
                                    </p>
                                    <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="text-left">
                                                <div className="text-cyan-400 font-medium">✨ 포함된 기능들:</div>
                                                <ul className="text-slate-300 mt-2 space-y-1">
                                                    <li>• 모바일 최적화</li>
                                                    <li>• 제스처 네비게이션</li>
                                                    <li>• 오프라인 모드</li>
                                                    <li>• 상황별 학습</li>
                                                    <li>• 적응형 난이도</li>
                                                </ul>
                                            </div>
                                            <div className="text-left">
                                                <div className="text-cyan-400 font-medium">🎯 추가 기능들:</div>
                                                <ul className="text-slate-300 mt-2 space-y-1">
                                                    <li>• 발음 연습</li>
                                                    <li>• 학습 경로 추천</li>
                                                    <li>• 동기부여 메시지</li>
                                                    <li>• 접근성 지원</li>
                                                    <li>• 개인화 분석</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* 버튼 영역 */}
                    <div className="p-6 border-t border-slate-700 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors"
                        >
                            저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Navigation Bar Component
interface NavBarProps {
    currentScreen: AppScreen;
    onNavigate: (screen: AppScreen) => void;
    userSettings: UserSettings | null;
    onOpenSettings: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentScreen, onNavigate, userSettings, onOpenSettings }) => {
    const [showPWAInstall, setShowPWAInstall] = useState(false);
    
    const navItems: { screen: AppScreen; label: string; icon: string }[] = [
        { screen: 'dashboard', label: getText('dashboard', userSettings?.language), icon: '🏠' },
        { screen: 'learnWords', label: getText('learn', userSettings?.language), icon: '📖' },
        { screen: 'flashcards', label: getText('flashcards', userSettings?.language), icon: '📸' },
        { screen: 'quiz', label: getText('quiz', userSettings?.language), icon: '📝' },
        { screen: 'allWords', label: '전체 단어', icon: '📚' },
        { screen: 'manageWords', label: getText('wordManagement', userSettings?.language), icon: '➕' },
        { screen: 'stats', label: getText('statistics', userSettings?.language), icon: '📊' },
    ];

    // PWA 설치 상태 확인
    useEffect(() => {
        const checkPWAInstall = () => {
            setShowPWAInstall(pwaInstallManager.canInstall());
        };
        
        checkPWAInstall();
        // 주기적으로 체크 (프롬프트 상태 변경 감지)
        const interval = setInterval(checkPWAInstall, 1000);
        
        return () => clearInterval(interval);
    }, []);

    const handlePWAInstall = async () => {
        const success = await pwaInstallManager.install();
        if (success) {
            setShowPWAInstall(false);
        }
    };

    if (!userSettings) return null;

    return (
        <nav className="bg-slate-700 p-3 shadow-md">
            <div className="flex justify-between items-center">
                <ul className="flex flex-wrap justify-around items-center space-x-1 sm:space-x-2 flex-1">
                    {navItems.map((item) => (
                        <li key={item.screen}>
                            <button
                                onClick={() => onNavigate(item.screen)}
                                aria-current={currentScreen === item.screen ? "page" : undefined}
                                className={`flex flex-col sm:flex-row items-center justify-center p-2 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 ease-in-out
                                    ${currentScreen === item.screen
                                        ? 'bg-cyan-500 text-white shadow-lg ring-2 ring-cyan-300'
                                        : 'text-slate-300 hover:bg-slate-600 hover:text-white'
                                    }`}
                            >
                                <span className="text-lg sm:mr-2 mb-0.5 sm:mb-0">{item.icon}</span>
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
                
                {/* PWA 설치 및 설정 버튼 */}
                <div className="flex items-center space-x-2 ml-2">
                    {showPWAInstall && (
                        <button
                            onClick={handlePWAInstall}
                            title={getText('installApp', userSettings.language)}
                            aria-label={getText('installApp', userSettings.language)}
                            className="flex items-center justify-center p-2 rounded-md text-xs sm:text-sm font-medium text-green-300 hover:bg-green-600/20 hover:text-green-200 transition-colors border border-green-500/30 hover:border-green-400"
                        >
                            <span className="text-lg mr-1">📱</span>
                            <span className="hidden sm:inline">{getText('installApp', userSettings.language)}</span>
                        </button>
                    )}
                    
                    <button
                        onClick={onOpenSettings}
                        title={getText('settings', userSettings.language)}
                        aria-label={getText('settings', userSettings.language)}
                        className="flex flex-col sm:flex-row items-center justify-center p-2 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                    >
                        <span className="text-lg sm:mr-2 mb-0.5 sm:mb-0">⚙️</span>
                        <span className="hidden sm:inline">{getText('settings', userSettings.language)}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};


// Login/Setup Screen Component
interface LoginSetupScreenProps extends Omit<ScreenProps, 'userSettings' | 'setGlobalLoading' | 'addToast' | 'openSettingsModal'> {
    onSetupComplete: (settings: UserSettings) => void;
    addToast: (message: string, type: ToastMessage['type']) => void;
}

const LoginSetupScreen: React.FC<LoginSetupScreenProps> = ({ onNavigate, onSetupComplete, addToast }) => {
    const [username, setUsername] = useState('');
    const [grade, setGrade] = useState('middle1');
    const [dailyGoal, setDailyGoal] = useState(10);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            addToast("사용자 이름을 입력해주세요.", "warning");
            return;
        }
        onSetupComplete({ 
            username: username.trim(), 
            grade, 
            textbook: '', 
            dailyGoal,
            // 게임화 시스템 초기값
            level: 1,
            experience: 0,
            totalExperience: 0,
            badges: [],
            streakDays: 0,
            longestStreak: 0,
            lastStudyDate: null,
            // 기본 환경 설정 초기값
            theme: 'dark',
            soundEnabled: true,
            animationsEnabled: true,
            autoPlayAudio: true,
            // 다국어 및 소셜 기능 초기값
            language: 'ko',
            studyReminders: true,
            socialSharing: false,
            customThemeColors: {
                primary: '#06b6d4',
                secondary: '#0891b2',
                accent: '#22d3ee'
            },
            // AI 및 발음 기능 초기값
            pronunciationPractice: true,
            aiTutorEnabled: true,
            adaptiveLearning: true,
            voiceSettings: {
                sensitivity: 0.7,
                autoRecord: false,
                feedbackLevel: 'detailed'
            },
            learningPath: {
                currentPath: 'general',
                completedMilestones: [],
                targetLevel: 'intermediate'
            },
            // 분석 및 개인화 초기값
            realTimeAnalytics: true,
            personalizedRecommendations: true,
            advancedGameification: true,
            learningInsights: true,
            sessionAnalytics: true,
            // 파일 처리 초기값
            autoSaveExtractedWords: true,
            smartWordFiltering: true,
            bulkWordProcessing: true,
            fileAnalysisReports: true,
            // v3.0.0 New Features - Mobile & Performance 초기값
            mobileOptimized: true,
            hapticFeedback: true,
            gestureNavigation: true,
            offlineMode: true,
            autoSync: true,
            dataCompression: true,
            // v3.0.0 New Features - Advanced AI 초기값
            contextualLearning: true,
            semanticSearch: true,
            intelligentReview: true,
            adaptiveDifficulty: true,
            multiModalLearning: true,
            // v3.0.0 New Features - Enhanced UX 초기값
            immersiveMode: false,
            focusMode: false,
            studyStreaks2: true,
            motivationalMessages: true,
            progressCelebrations: true,
            // v3.0.0 New Features - Collaboration 초기값
            studyGroups: false,
            competitiveMode: false,
            peerLearning: false,
            mentorSystem: false,
            // v3.0.0 New Features - Accessibility 초기값
            highContrast: false,
            largeText: false,
            voiceNavigation: false,
            screenReader: false,
            colorBlindSupport: false
        });
    };

    return (
        <div className="p-6 sm:p-8 bg-slate-800 min-h-screen flex flex-col justify-center items-center">
            <div className="w-full max-w-md bg-slate-700 p-8 rounded-xl shadow-2xl">
                <h1 className="text-3xl font-bold text-cyan-400 mb-8 text-center">AI 영단어 학습 설정</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">사용자 이름</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 bg-slate-600 text-white rounded-md border border-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="이름을 입력하세요"
                            aria-required="true"
                        />
                    </div>
                    <div>
                        <label htmlFor="grade" className="block text-sm font-medium text-slate-300 mb-1">학년 선택</label>
                        <select
                            id="grade"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full p-3 bg-slate-600 text-white rounded-md border border-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            aria-required="true"
                        >
                            <option value="middle1">중학교 1학년</option>
                            <option value="middle2">중학교 2학년</option>
                            <option value="middle3">중학교 3학년</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="dailyGoal" className="block text-sm font-medium text-slate-300 mb-1">일일 학습 목표 (단어 수)</label>
                        <input
                            type="number"
                            id="dailyGoal"
                            value={dailyGoal}
                            onChange={(e) => setDailyGoal(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            className="w-full p-3 bg-slate-600 text-white rounded-md border border-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            aria-required="true"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-md shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
                    >
                        학습 시작
                    </button>
                </form>
            </div>
        </div>
    );
};


// Dashboard Screen Component
interface DashboardScreenProps extends ScreenProps {
    myWords: Word[];
    learnedWordsToday: number;
    totalWordsLearned: number; 
}
const DashboardScreen: React.FC<DashboardScreenProps> = ({ userSettings, onNavigate, myWords, learnedWordsToday, totalWordsLearned }) => {
    const reviewWords = myWords.filter(word => !word.isCustom);
    const customWords = myWords.filter(word => word.isCustom);
    const [currentAnalytics, setCurrentAnalytics] = useState<LearningAnalytics | null>(null);
    const [personalizedTips, setPersonalizedTips] = useState<string[]>([]);
    
    // v2.7.0 실시간 분석 업데이트
    useEffect(() => {
        const updateAnalytics = () => {
            const analytics = realTimeLearningAnalyzer.getCurrentAnalytics();
            setCurrentAnalytics(analytics);
            
            if (userSettings.personalizedRecommendations) {
                const tips = realTimeLearningAnalyzer.generatePersonalizedRecommendations(userSettings);
                setPersonalizedTips(tips);
            }
        };
        
        updateAnalytics();
        const interval = setInterval(updateAnalytics, 5000); // 5초마다 업데이트
        
        return () => clearInterval(interval);
    }, [userSettings]);
    
    // 현재 시간에 따른 인사말
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "좋은 아침이에요";
        if (hour < 18) return "좋은 오후에요";
        return "좋은 저녁이에요";
    };
    
    // 학습 진도율 계산
    const progressPercent = Math.min(100, (learnedWordsToday / userSettings.dailyGoal) * 100);
    const isGoalAchieved = learnedWordsToday >= userSettings.dailyGoal;
    
    // 게임화 시스템 계산
    const currentLevel = userSettings.level || 1;
    const currentExp = userSettings.experience || 0;
    const nextLevelExp = getExperienceForNextLevel(currentLevel);
    const expProgress = (currentExp / nextLevelExp) * 100;
    const streakDays = userSettings.streakDays || 0;
    const recentBadges = (userSettings.badges || []).slice(-3); // 최근 3개 배지만 표시

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
            {/* v3.0.0 Enhanced Header with Glass Morphism */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-700/50 glass-morphism">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            W
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                {getText('appName', userSettings.language)}
                            </h1>
                            <p className="text-xs text-slate-400 font-medium">
                                {getText('version', userSettings.language)} - {getText('subtitle', userSettings.language)}
                            </p>
                        </div>
                    </div>
                    
                    {/* v3.0.0 Quick Action Buttons */}
                    <div className="flex items-center space-x-2">
                        {userSettings.motivationalMessages && (
                            <div className="hidden sm:block text-sm text-cyan-400 font-medium animate-pulse">
                                🎯 오늘도 화이팅!
                            </div>
                        )}
                        {currentAnalytics && (
                            <div className="flex items-center space-x-1 text-xs text-slate-400">
                                <span>⚡</span>
                                <span>{Math.round(currentAnalytics.focusLevel)}% 집중도</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="px-6 py-4 border-b border-slate-700">
                <p className="text-slate-300 text-sm flex items-center gap-2">
                    <span className="text-lg">👋</span>
                    {getGreeting()}, <span className="font-semibold text-cyan-400">{userSettings.username}</span>님!
                </p>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
                {/* v3.0.0 파일 업로드 & 단어 저장 업데이트 알림 배너 */}
                <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/30 rounded-xl p-4 mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-amber-600/10 animate-pulse"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl animate-bounce">📚</div>
                            <div>
                                <h3 className="text-lg font-bold text-orange-300">WordMaster Pro v3.0.0 전체 단어 저장 기능!</h3>
                                <p className="text-sm text-slate-300">파일에서 추출된 모든 단어를 원클릭으로 일괄 저장! AI 기반 스마트 필터링과 자동 처리로 더 빠르고 편리하게!</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">📄 PDF/TXT/Excel 지원</span>
                                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">🤖 AI 자동 처리</span>
                                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">⚡ 원클릭 저장</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {userSettings.autoSaveExtractedWords && (
                                <button
                                    onClick={() => {
                                        alert('💾 자동 저장: 파일에서 추출된 단어들이 자동으로 전체 단어 목록에 저장됩니다!');
                                    }}
                                    className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-lg text-xs border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
                                >
                                    💾 자동 저장
                                </button>
                            )}
                            {userSettings.smartWordFiltering && (
                                <button
                                    onClick={() => {
                                        alert('🧠 스마트 필터링: AI가 중복 단어와 잘못된 형식을 자동으로 제거합니다!');
                                    }}
                                    className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-lg text-xs border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
                                >
                                    🧠 스마트 필터링
                                </button>
                            )}
                            {userSettings.personalizedRecommendations && (
                                <button
                                    onClick={() => {
                                        alert('🎯 개인화 추천: AI가 학습 패턴을 분석하여 최적의 학습 전략을 제안합니다!');
                                    }}
                                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                                >
                                    🎯 개인화 추천
                                </button>
                            )}
                            {userSettings.advancedGameification && (
                                <button
                                    onClick={() => {
                                        alert('🎮 고급 게임화: 향상된 레벨 시스템, 특별 배지, 도전 과제가 학습을 더욱 재미있게 만듭니다!');
                                    }}
                                    className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-lg text-xs border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
                                >
                                    🎮 고급 게임화
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* v2.7.0 실시간 학습 분석 위젯 */}
                {userSettings.realTimeAnalytics && currentAnalytics && (
                    <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-4 mb-6">
                        <h3 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2">
                            📊 실시간 학습 분석
                            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full animate-pulse">LIVE</span>
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center bg-slate-700/30 rounded-lg p-3">
                                <div className="text-2xl font-bold text-green-400">{currentAnalytics.accuracy.toFixed(1)}%</div>
                                <div className="text-xs text-slate-400">정확도</div>
                                <div className="w-full bg-slate-600 rounded-full h-1 mt-1">
                                    <div 
                                        className="h-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
                                        style={{ width: `${currentAnalytics.accuracy}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-center bg-slate-700/30 rounded-lg p-3">
                                <div className="text-2xl font-bold text-blue-400">{currentAnalytics.wordsStudied}</div>
                                <div className="text-xs text-slate-400">학습 단어</div>
                                <div className="text-xs text-blue-300 mt-1">+{Math.floor(currentAnalytics.learningVelocity * 60)} /시간</div>
                            </div>
                            <div className="text-center bg-slate-700/30 rounded-lg p-3">
                                <div className="text-2xl font-bold text-purple-400">{currentAnalytics.focusLevel.toFixed(0)}%</div>
                                <div className="text-xs text-slate-400">집중도</div>
                                <div className="w-full bg-slate-600 rounded-full h-1 mt-1">
                                    <div 
                                        className="h-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-700"
                                        style={{ width: `${currentAnalytics.focusLevel}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-center bg-slate-700/30 rounded-lg p-3">
                                <div className="text-2xl font-bold text-orange-400">{currentAnalytics.streakCount}</div>
                                <div className="text-xs text-slate-400">연속 정답</div>
                                <div className="flex justify-center mt-1">
                                    {[...Array(Math.min(5, currentAnalytics.streakCount))].map((_, i) => (
                                        <div key={i} className="w-1 h-1 bg-orange-400 rounded-full mx-0.5 animate-pulse"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* 실시간 추천 */}
                        {personalizedTips.length > 0 && (
                            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-indigo-500/20">
                                <h4 className="text-sm font-semibold text-yellow-300 mb-2 flex items-center gap-1">
                                    💡 실시간 추천
                                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-1 py-0.5 rounded">AI</span>
                                </h4>
                                <div className="space-y-1">
                                    {personalizedTips.slice(0, 2).map((tip, index) => (
                                        <div key={index} className="text-xs text-slate-300 flex items-center gap-2">
                                            <span className="text-yellow-400">▶</span>
                                            {tip}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 게임화 시스템 카드들 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-purple-700/30 to-indigo-800/30 p-6 rounded-xl shadow-xl border border-purple-500/30 hover:border-purple-400 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-purple-400">🎮 레벨 & 경험치</h3>
                            <span className="text-2xl font-bold text-purple-300">Lv.{currentLevel}</span>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">경험치: {currentExp} / {nextLevelExp}</p>
                        <div className="w-full bg-slate-600 rounded-full h-3 mb-2">
                            <div 
                                className="h-3 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 transition-all duration-700"
                                style={{ width: `${expProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-slate-400">{expProgress.toFixed(1)}% 완료</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-700/30 to-red-800/30 p-6 rounded-xl shadow-xl border border-orange-500/30 hover:border-orange-400 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-orange-400">🔥 연속 학습</h3>
                            <span className="text-2xl font-bold text-orange-300">{streakDays}일</span>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">최고 기록: {userSettings.longestStreak || 0}일</p>
                        <div className="flex items-center gap-2">
                            {[...Array(Math.min(7, streakDays))].map((_, i) => (
                                <div key={i} className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                            ))}
                            {streakDays > 7 && <span className="text-orange-300 text-sm">+{streakDays - 7}</span>}
                        </div>
                    </div>
                </div>

                {/* 배지 시스템 */}
                {recentBadges.length > 0 && (
                    <div className="bg-gradient-to-br from-yellow-700/20 to-amber-800/20 p-6 rounded-xl shadow-xl border border-yellow-500/30 mb-6">
                        <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                            🏆 최근 획득 배지
                            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">{userSettings.badges?.length || 0}개</span>
                        </h3>
                        <div className="flex gap-4">
                            {recentBadges.map((badgeId, index) => {
                                const badge = getBadgeInfo(badgeId);
                                return (
                                    <div key={index} className="text-center group">
                                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                                            {badge.icon}
                                        </div>
                                        <p className="text-xs text-slate-300">{badge.name}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 메인 통계 카드들 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-xl shadow-xl border border-slate-600 hover:border-cyan-500 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">📈 오늘의 학습</h3>
                            {isGoalAchieved && <span className="text-2xl animate-bounce">🎉</span>}
                        </div>
                        <p className="text-3xl font-bold text-white mb-2">{learnedWordsToday}</p>
                        <p className="text-slate-400 text-sm mb-3">목표: {userSettings.dailyGoal}개</p>
                        <div className="w-full bg-slate-600 rounded-full h-3 mb-2">
                            <div 
                                className={`h-3 rounded-full transition-all duration-700 ${
                                    isGoalAchieved ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-slate-400">{progressPercent.toFixed(1)}% 완료</p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-xl shadow-xl border border-slate-600 hover:border-green-500 transition-all duration-300 group">
                        <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2 group-hover:text-green-300 transition-colors">
                            ✅ 전체 학습
                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">누적</span>
                        </h3>
                        <p className="text-3xl font-bold text-white mb-2">{totalWordsLearned}</p>
                        <p className="text-slate-400 text-sm">총 학습한 단어</p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-xl shadow-xl border border-slate-600 hover:border-yellow-500 transition-all duration-300 group">
                        <h3 className="text-lg font-semibold text-yellow-400 mb-4 group-hover:text-yellow-300 transition-colors">📚 내 단어장</h3>
                        <p className="text-3xl font-bold text-white mb-2">{myWords.length}</p>
                        <div className="text-slate-400 text-sm space-y-1">
                            <p>• 기본 단어: {reviewWords.length}개</p>
                            <p>• 추가 단어: {customWords.length}개</p>
                        </div>
                    </div>
                </div>

                {/* v2.4.0 새 기능 알림 */}
                <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-4 rounded-xl border border-cyan-500/30 mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 animate-pulse"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl animate-bounce">🚀</div>
                            <div>
                                <h3 className="text-lg font-bold text-cyan-400">v2.4.0 메이저 업데이트!</h3>
                                <p className="text-sm text-cyan-200">고급 파일 처리 시스템과 스마트 배치 처리 기능이 새롭게 추가되었습니다!</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => onNavigate('manageWords')}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            체험하기 →
                        </button>
                    </div>
                </div>

                {/* 빠른 액션 버튼들 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-6 rounded-xl border border-blue-500/30 hover:border-blue-400 transition-all duration-300 group">
                        <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2 group-hover:text-blue-300 transition-colors">
                            🎯 스마트 학습
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">SRS</span>
                        </h3>
                        <p className="text-slate-300 text-sm mb-4">간격 반복 학습법으로 효율적인 암기</p>
                        <button 
                            onClick={() => onNavigate('learnWords')}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            단어 학습하기 →
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-6 rounded-xl border border-purple-500/30 hover:border-purple-400 transition-all duration-300 group">
                        <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2 group-hover:text-purple-300 transition-colors">
                            🧠 실력 테스트
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">AI</span>
                        </h3>
                        <p className="text-slate-300 text-sm mb-4">AI가 출제하는 맞춤형 퀴즈</p>
                        <button 
                            onClick={() => onNavigate('quiz')}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            퀴즈 풀기 →
                        </button>
                    </div>
                </div>

                {/* 도전 과제 시스템 */}
                <div className="bg-gradient-to-br from-emerald-700/20 to-teal-800/20 p-6 rounded-xl shadow-xl border border-emerald-500/30 mb-6">
                    <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                        🎯 오늘의 도전 과제
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">일일미션</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-700/50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">📚</span>
                                <span className="text-sm text-slate-300">단어 학습</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">{learnedWordsToday}/{userSettings.dailyGoal}</span>
                                <span className="text-xs text-emerald-400">+50 XP</span>
                            </div>
                            <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                                <div 
                                    className="h-2 rounded-full bg-emerald-400 transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        <div className="bg-slate-700/50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🧠</span>
                                <span className="text-sm text-slate-300">퀴즈 도전</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">0/1 완료</span>
                                <span className="text-xs text-emerald-400">+30 XP</span>
                            </div>
                            <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                                <div className="h-2 rounded-full bg-slate-600"></div>
                            </div>
                        </div>
                        
                        <div className="bg-slate-700/50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🔥</span>
                                <span className="text-sm text-slate-300">연속 학습</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">{streakDays}일</span>
                                <span className="text-xs text-emerald-400">+25 XP</span>
                            </div>
                            <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                                <div className="h-2 rounded-full bg-orange-400"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 추가 기능 바로가기 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                        onClick={() => onNavigate('allWords')}
                        className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200 text-center group hover:shadow-lg transform hover:scale-105"
                    >
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📖</div>
                        <p className="text-sm text-slate-300">전체 단어</p>
                    </button>
                    
                    <button 
                        onClick={() => onNavigate('stats')}
                        className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200 text-center group hover:shadow-lg transform hover:scale-105"
                    >
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📊</div>
                        <p className="text-sm text-slate-300">학습 통계</p>
                    </button>
                    
                    <button 
                        onClick={() => onNavigate('manageWords')}
                        className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200 text-center group hover:shadow-lg transform hover:scale-105"
                    >
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">⚙️</div>
                        <p className="text-sm text-slate-300">단어 관리</p>
                    </button>
                    
                    <button 
                        onClick={() => onNavigate('flashcards')}
                        className="p-4 bg-gradient-to-br from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 rounded-lg transition-all duration-200 text-center group hover:shadow-lg transform hover:scale-105 relative"
                    >
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📸</div>
                        <p className="text-sm text-slate-300">플래시카드</p>
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-lg">NEW!</span>
                    </button>
                    
                    <button 
                        onClick={() => window.open('https://github.com', '_blank')}
                        className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200 text-center group hover:shadow-lg transform hover:scale-105"
                    >
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">💡</div>
                        <p className="text-sm text-slate-300">도움말</p>
                    </button>
                </div>
            </div>
        </div>
    );
};


// LearnWords Screen Component
interface LearnWordsScreenProps extends ScreenProps {
    words: Word[];
    wordStats: Record<string | number, WordStat>;
    onWordLearned: (wordId: number | string, isQuickReview?: boolean) => void;
}

const LearnWordsScreen: React.FC<LearnWordsScreenProps> = ({ userSettings, onNavigate, words, wordStats, onWordLearned, addToast, setGlobalLoading }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentWordsSet, setCurrentWordsSet] = useState<Word[]>([]);
    const [showMeaning, setShowMeaning] = useState(false);
    const [isDailyGoalFinished, setIsDailyGoalFinished] = useState(false);
    const [isQuickReviewActive, setIsQuickReviewActive] = useState(false);
    const [isQuickReviewFinished, setIsQuickReviewFinished] = useState(false);

    const [aiExample, setAiExample] = useState<AIExampleSentence | null>(null);
    const [isFetchingAiExample, setIsFetchingAiExample] = useState(false);
    
    const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
    const [isFetchingAiImage, setIsFetchingAiImage] = useState(false);


    const getWordStat = useCallback((wordId: string | number) => {
        return wordStats[wordId] || getDefaultWordStat(wordId);
    }, [wordStats]);
    
    const selectWords = useCallback((count: number, forQuickReview: boolean) => {
        const today = getTodayDateString();
        let eligibleWords = words.filter(w => {
            const stat = getWordStat(w.id);
            return w.gradeLevel === userSettings.grade && !stat.isMastered;
        });

        if (forQuickReview) {
            eligibleWords = eligibleWords.filter(w => {
                const stat = getWordStat(w.id);
                return stat.lastReviewed && stat.lastReviewed.split('T')[0] !== today;
            });
        } else {
             eligibleWords = eligibleWords.filter(w => {
                const stat = getWordStat(w.id);
                return !stat.lastReviewed || stat.lastReviewed.split('T')[0] !== today;
             });
        }
        
        eligibleWords.sort((a, b) => {
            const statA = getWordStat(a.id);
            const statB = getWordStat(b.id);
            if (statB.quizIncorrectCount !== statA.quizIncorrectCount) return statB.quizIncorrectCount - statA.quizIncorrectCount;
            const dateA = statA.lastReviewed ? new Date(statA.lastReviewed).getTime() : 0;
            const dateB = statB.lastReviewed ? new Date(statB.lastReviewed).getTime() : 0;
            if (dateA !== dateB) return dateA - dateB;
            if (a.isCustom && !b.isCustom) return -1;
            if (!a.isCustom && b.isCustom) return 1;
            return 0;
        });
        return shuffleArray(eligibleWords).slice(0, count);
    }, [words, userSettings.grade, getWordStat]);


    useEffect(() => {
        const dailyWords = selectWords(userSettings.dailyGoal, false);
        setCurrentWordsSet(dailyWords);
        setCurrentIndex(0);
        setShowMeaning(false);
        setIsDailyGoalFinished(false);
        setIsQuickReviewActive(false);
        setIsQuickReviewFinished(false);
        setAiExample(null);
        setIsFetchingAiExample(false);
        setAiGeneratedImage(null);
        setIsFetchingAiImage(false);

        if (dailyWords.length > 0) {
            speak(dailyWords[0].term);
        } else {
            setIsDailyGoalFinished(true); 
        }
    }, [words, userSettings.grade, userSettings.dailyGoal, selectWords]);

    const currentWord = currentWordsSet[currentIndex];

    const resetWordSpecificStates = () => {
        setShowMeaning(false);
        setAiExample(null);
        setIsFetchingAiExample(false);
        setAiGeneratedImage(null);
        setIsFetchingAiImage(false);
    };

    const handleNextWord = () => {
        if (!currentWord) return;
        onWordLearned(currentWord.id, isQuickReviewActive);
        resetWordSpecificStates();

        const nextIndex = currentIndex + 1;
        if (nextIndex < currentWordsSet.length) {
            setCurrentIndex(nextIndex);
            speak(currentWordsSet[nextIndex].term); 
        } else {
            if (isQuickReviewActive) setIsQuickReviewFinished(true);
            else setIsDailyGoalFinished(true);
        }
    };
    
    const startQuickReview = () => {
        const reviewWords = selectWords(3, true); 
        if (reviewWords.length > 0) {
            setCurrentWordsSet(reviewWords);
            setCurrentIndex(0);
            resetWordSpecificStates();
            setIsQuickReviewActive(true);
            setIsQuickReviewFinished(false);
            speak(reviewWords[0].term);
        } else {
            addToast("복습할 이전 학습 단어가 더 이상 없습니다.", "info");
            setIsQuickReviewFinished(true); 
        }
    };

    const handleGenerateAiExample = async () => {
        if (!currentWord || !process.env.API_KEY) {
            if(!process.env.API_KEY) addToast("AI 예문 생성을 위해 API 키를 설정해주세요.", "warning");
            return;
        }
        setIsFetchingAiExample(true);
        setAiExample(null);
        const example = await generateDifferentExampleSentenceWithGemini(currentWord, userSettings.grade, addToast, setGlobalLoading);
        setAiExample(example);
        setIsFetchingAiExample(false);
    };

    const handleGenerateAiImage = async () => {
        if (!currentWord || !process.env.API_KEY) {
            if(!process.env.API_KEY) addToast("AI 이미지 생성을 위해 API 키를 설정해주세요.", "warning");
            return;
        }
        setIsFetchingAiImage(true);
        setAiGeneratedImage(null);
        const imageData = await generateImageForWordWithGemini(currentWord.term, addToast, setGlobalLoading);
        if(imageData) {
            setAiGeneratedImage(`data:image/jpeg;base64,${imageData}`);
        }
        setIsFetchingAiImage(false);
    };


    if (currentWordsSet.length === 0 && !isDailyGoalFinished) { 
         return <div className="p-8 text-center text-xl">오늘 학습할 단어를 준비 중입니다...</div>;
    }
    
    if (isDailyGoalFinished && !isQuickReviewActive && !isQuickReviewFinished) {
        const potentialReviewWords = words.filter(w => {
            const stat = getWordStat(w.id);
            return w.gradeLevel === userSettings.grade && !stat.isMastered && stat.lastReviewed && stat.lastReviewed.split('T')[0] !== getTodayDateString();
        }).length;

        return (
            <div className="p-8 text-center">
                <h2 className="text-3xl font-bold text-cyan-400 mb-6">오늘의 학습 목표 완료! 🎉</h2>
                <p className="text-lg text-slate-300 mb-8">수고하셨습니다, {userSettings.username}님!</p>
                {potentialReviewWords > 0 ? (
                    <button
                        onClick={startQuickReview}
                        className="py-3 px-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg shadow-md mb-4"
                    >
                        💡 빠른 복습 시작하기 ({Math.min(3, potentialReviewWords)} 단어)
                    </button>
                ) : (
                    <p className="text-slate-400 mb-4">복습할 이전 학습 단어가 없습니다.</p>
                )}
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="py-3 px-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg shadow-md"
                >
                    대시보드로 돌아가기
                </button>
            </div>
        );
    }
    
    if (isQuickReviewFinished) {
        return (
             <div className="p-8 text-center">
                <h2 className="text-3xl font-bold text-cyan-400 mb-6">빠른 복습 완료! 👍</h2>
                <p className="text-lg text-slate-300 mb-8">모든 학습 활동을 마쳤습니다!</p>
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="py-3 px-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg shadow-md"
                >
                    대시보드로 돌아가기
                </button>
            </div>
        );
    }

    if (!currentWord) { 
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-slate-300 mb-4">학습할 단어를 불러오는 중...</h2>
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="mt-4 py-3 px-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg shadow-md"
                >
                    대시보드로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6 sm:mb-8">
                {isQuickReviewActive ? "빠른 복습" : "단어 학습"} ({currentIndex + 1} / {currentWordsSet.length})
            </h1>
            <div className="w-full max-w-lg bg-slate-700 rounded-xl shadow-2xl p-6 sm:p-8 text-center">
                <div className="mb-2">
                    <button onClick={() => speak(currentWord.term)} className="text-slate-400 hover:text-cyan-400 text-2xl" aria-label="단어 발음 듣기">
                        🔊
                    </button>
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3">{currentWord.term}</h2>
                {currentWord.pronunciation && <p className="text-slate-400 text-lg mb-4">[{currentWord.pronunciation}]</p>}
                
                <button
                    onClick={() => setShowMeaning(!showMeaning)}
                    className="w-full py-3 px-4 mb-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md shadow transition-colors"
                    aria-expanded={showMeaning}
                >
                    {showMeaning ? '뜻 숨기기' : '뜻 보기'}
                </button>

                {showMeaning && (
                    <div className="bg-slate-600 p-4 sm:p-6 rounded-lg mb-4 text-left animate-fadeIn">
                        <p className="text-xl text-cyan-300 font-semibold mb-1">{currentWord.partOfSpeech}: {currentWord.meaning}</p>
                        <hr className="border-slate-500 my-3"/>
                        <p className="text-slate-200 mb-1"><span className="font-semibold">예문:</span> {currentWord.exampleSentence}</p>
                        {currentWord.exampleSentenceMeaning && <p className="text-sm text-slate-400"><span className="font-semibold">해석:</span> {currentWord.exampleSentenceMeaning}</p>}
                    
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                            <button
                                onClick={handleGenerateAiExample}
                                disabled={isFetchingAiExample || !process.env.API_KEY || isCurrentlyGeminiQuotaExhausted}
                                className="w-full py-2 px-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md shadow-sm disabled:opacity-50 flex items-center justify-center text-sm"
                            >
                                <span role="img" aria-label="ai" className="mr-2">✨</span>
                                {isFetchingAiExample ? 'AI 예문 생성 중...' : 'AI: 다른 예문'}
                                {(!process.env.API_KEY || isCurrentlyGeminiQuotaExhausted) && <span className="text-xs ml-1">({!process.env.API_KEY ? "Key 필요" : "Quota 소진"})</span>}
                            </button>
                             <button
                                onClick={handleGenerateAiImage}
                                disabled={isFetchingAiImage || !process.env.API_KEY || isCurrentlyGeminiQuotaExhausted}
                                className="w-full py-2 px-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-md shadow-sm disabled:opacity-50 flex items-center justify-center text-sm"
                            >
                                <span role="img" aria-label="ai image" className="mr-2">🎨</span>
                                {isFetchingAiImage ? 'AI 이미지 생성 중...' : 'AI: 이미지 생성'}
                                {(!process.env.API_KEY || isCurrentlyGeminiQuotaExhausted) && <span className="text-xs ml-1">({!process.env.API_KEY ? "Key 필요" : "Quota 소진"})</span>}
                            </button>
                        </div>
                        {aiExample && (
                            <div className="mt-3 pt-3 border-t border-slate-500 animate-fadeIn">
                                <p className="text-teal-300 font-semibold mb-1">✨ AI 추가 예문:</p>
                                <button onClick={() => speak(aiExample.newExampleSentence)} className="text-slate-400 hover:text-cyan-400 text-lg mr-1" aria-label="AI 예문 발음 듣기">🔊</button>
                                <span className="text-slate-200">{aiExample.newExampleSentence}</span>
                                <p className="text-sm text-slate-400 mt-0.5"><span className="font-semibold">해석:</span> {aiExample.newExampleSentenceMeaning}</p>
                            </div>
                        )}
                        {isFetchingAiImage && <p className="text-purple-400 text-center mt-3">AI 이미지 로딩 중...</p>}
                        {aiGeneratedImage && (
                            <div className="mt-3 pt-3 border-t border-slate-500 animate-fadeIn">
                                <p className="text-purple-300 font-semibold mb-1">🎨 AI 생성 이미지:</p>
                                <img src={aiGeneratedImage} alt={`AI generated image for ${currentWord.term}`} className="w-full max-w-xs mx-auto rounded-md shadow-lg" />
                            </div>
                        )}
                    </div>
                )}
                
                <button
                    onClick={handleNextWord}
                    className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-md shadow-lg transition-transform transform hover:scale-105"
                >
                    {currentIndex === currentWordsSet.length - 1 ? (isQuickReviewActive ? '복습 완료' : '학습 완료') : '다음 단어'}
                </button>
            </div>
            <button 
                onClick={() => onNavigate('dashboard')} 
                className="mt-8 text-sm text-cyan-400 hover:text-cyan-300"
            >
                {isQuickReviewActive ? "복습" : "학습"} 중단하고 대시보드로
            </button>
        </div>
    );
};

// Quiz Screen Component
interface QuizScreenProps extends ScreenProps {
    words: Word[];
    wordStats: Record<string | number, WordStat>;
    onQuizComplete: (score: number, totalQuestions: number, incorrectWords: Word[]) => void; 
    updateWordStat: (wordId: string | number, newStat: Partial<Omit<WordStat, 'id'>>) => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ userSettings, onNavigate, words, wordStats, onQuizComplete, updateWordStat, addToast, setGlobalLoading }) => {
    const [quizWords, setQuizWords] = useState<Word[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [options, setOptions] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [incorrectlyAnsweredWordsDetails, setIncorrectlyAnsweredWordsDetails] = useState<Word[]>([]);
    
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewWord, setReviewWord] = useState<Word | null>(null);
    const [aiReviewExample, setAiReviewExample] = useState<AIExampleSentence | null>(null);
    const [isFetchingAiReviewExample, setIsFetchingAiReviewExample] = useState(false);

    const getWordStat = useCallback((wordId: string | number) => {
        return wordStats[wordId] || getDefaultWordStat(wordId);
    }, [wordStats]);

    const generateOptions = useCallback((correctWord: Word) => {
        const gradeWords = words.filter(w => w.gradeLevel === userSettings.grade);
        let incorrectMeaningPool = shuffleArray(
            gradeWords
                .filter(w => w.id !== correctWord.id) 
                .map(w => w.meaning)
                .filter(meaning => meaning !== correctWord.meaning) 
        );
        const uniqueIncorrectOptions = Array.from(new Set(incorrectMeaningPool)).slice(0, 3);
        const finalGeneratedOptions = shuffleArray([correctWord.meaning, ...uniqueIncorrectOptions]);
        setOptions(finalGeneratedOptions);
    }, [words, userSettings.grade]);


    useEffect(() => {
        const gradeFilteredWords = words.filter(w => w.gradeLevel === userSettings.grade);
        if (gradeFilteredWords.length < 4) { 
            setQuizWords([]);
            setIsFinished(true);
            if (gradeFilteredWords.length > 0) addToast(`현재 학년에 퀴즈를 위한 단어가 부족합니다. (최소 4개 필요)`, "warning");
            return;
        }
        const actualNumQuizQuestions = Math.min(10, gradeFilteredWords.length);
        const selectedQuizWords = shuffleArray(gradeFilteredWords).slice(0, actualNumQuizQuestions);
        setQuizWords(selectedQuizWords);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setIsFinished(false);
        setIncorrectlyAnsweredWordsDetails([]);
        if (selectedQuizWords.length > 0) { 
            generateOptions(selectedQuizWords[0]);
            speak(selectedQuizWords[0].term);
        }
    }, [words, userSettings.grade, generateOptions, addToast]);


     const handleOpenReviewModal = async (word: Word) => {
        setReviewWord(word);
        setShowReviewModal(true);
        setAiReviewExample(null);
        if (process.env.API_KEY) {
            setIsFetchingAiReviewExample(true);
            // Use setGlobalLoading for this specific AI call within the modal as it's a primary action here
            const example = await generateDifferentExampleSentenceWithGemini(word, userSettings.grade, addToast, setGlobalLoading);
            setAiReviewExample(example);
            setIsFetchingAiReviewExample(false);
        }
    };

    if (quizWords.length === 0 && !isFinished) { 
        return <div className="p-8 text-center text-xl">퀴즈를 위한 단어를 준비 중이거나, 현재 학년에 단어가 부족합니다. (최소 4개 필요)</div>;
    }
    
    if (isFinished) { 
        return (
            <div className="p-8 text-center">
                <h2 className="text-3xl font-bold text-cyan-400 mb-4">퀴즈 완료! 🏆</h2>
                {quizWords.length > 0 ? (
                    <p className="text-xl text-slate-200 mb-6">총 {quizWords.length}문제 중 <span className="text-green-400 font-bold">{score}</span>문제를 맞혔습니다.</p>
                ) : (
                    <p className="text-xl text-slate-200 mb-6">퀴즈를 진행할 단어가 없습니다. '단어 관리'에서 단어를 추가하거나 다른 학년을 선택해보세요. (최소 4개 필요)</p>
                )}
                {incorrectlyAnsweredWordsDetails.length > 0 && (
                    <div className="mb-6 bg-slate-700 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-red-400 mb-2">틀린 단어들:</h3>
                        <ul className="space-y-2 text-left max-h-48 overflow-y-auto">
                            {incorrectlyAnsweredWordsDetails.map(word => (
                                <li key={word.id} className="flex justify-between items-center p-1.5 bg-slate-600 rounded-md">
                                    <span className="text-slate-300">{word.term} - {word.meaning}</span>
                                    <button 
                                        onClick={() => handleOpenReviewModal(word)}
                                        className="text-teal-400 hover:text-teal-300 text-sm flex items-center px-2 py-1 rounded hover:bg-slate-500 disabled:opacity-50"
                                        aria-label={`${word.term} AI 복습`}
                                        disabled={!process.env.API_KEY || isCurrentlyGeminiQuotaExhausted || isFetchingAiReviewExample}
                                    >
                                        ✨ AI 복습 {(!process.env.API_KEY || isCurrentlyGeminiQuotaExhausted) && <span className="text-xs ml-1">({!process.env.API_KEY ? "Key 필요" : "Quota 소진"})</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="space-x-4">
                    <button
                        onClick={() => { 
                            const gradeFilteredRetryWords = words.filter(w => w.gradeLevel === userSettings.grade);
                            if (gradeFilteredRetryWords.length < 4) {
                                addToast("퀴즈를 다시 풀기 위한 단어가 부족합니다. (최소 4개 필요)", "warning");
                                return;
                            }
                            const actualRetryNumQuestions = Math.min(10, gradeFilteredRetryWords.length);
                            const selectedRetryQuizWords = shuffleArray(gradeFilteredRetryWords).slice(0, actualRetryNumQuestions);
                            setQuizWords(selectedRetryQuizWords);
                            setCurrentQuestionIndex(0);
                            setScore(0);
                            setSelectedAnswer(null);
                            setShowResult(false);
                            setIsFinished(false); 
                            setIncorrectlyAnsweredWordsDetails([]);
                            if (selectedRetryQuizWords.length > 0) {
                                generateOptions(selectedRetryQuizWords[0]);
                                speak(selectedRetryQuizWords[0].term); 
                            }
                        }}
                        className="py-3 px-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg shadow-md disabled:opacity-60"
                        disabled={words.filter(w => w.gradeLevel === userSettings.grade).length < 4}
                    >
                        다시 풀기
                    </button>
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="py-3 px-6 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg shadow-md"
                    >
                        대시보드로
                    </button>
                </div>
                 {showReviewModal && reviewWord && (
                    <div role="dialog" aria-modal="true" aria-labelledby="ai-review-modal-title" className="fixed inset-0 bg-slate-900 bg-opacity-75 flex justify-center items-center p-4 z-50 animate-fadeIn">
                        <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg text-left">
                            <h3 id="ai-review-modal-title" className="text-xl font-semibold text-cyan-400 mb-3">✨ AI 단어 복습: {reviewWord.term}</h3>
                            <p className="text-slate-300"><span className="font-semibold">뜻:</span> {reviewWord.meaning} ({reviewWord.partOfSpeech})</p>
                            {reviewWord.pronunciation && <p className="text-slate-400 text-sm">[{reviewWord.pronunciation}]</p>}
                            <hr className="my-3 border-slate-700"/>
                            <p className="text-slate-300 mb-1"><span className="font-semibold">기존 예문:</span> {reviewWord.exampleSentence}</p>
                            <p className="text-sm text-slate-400 mb-3">{reviewWord.exampleSentenceMeaning}</p>
                            
                            {isFetchingAiReviewExample && <p className="text-teal-400">AI 추가 예문 생성 중...</p>}
                            {aiReviewExample && (
                                <div className="mt-2 pt-2 border-t border-slate-600 animate-fadeIn">
                                    <p className="text-teal-300 font-semibold mb-1">✨ AI 추가 예문:</p>
                                     <button onClick={() => speak(aiReviewExample.newExampleSentence)} className="text-slate-400 hover:text-cyan-400 text-lg mr-1" aria-label="AI 예문 발음 듣기">🔊</button>
                                    <span className="text-slate-200">{aiReviewExample.newExampleSentence}</span>
                                    <p className="text-sm text-slate-400 mt-0.5">{aiReviewExample.newExampleSentenceMeaning}</p>
                                </div>
                            )}
                            {!isFetchingAiReviewExample && !aiReviewExample && process.env.API_KEY && !isCurrentlyGeminiQuotaExhausted &&
                                <p className="text-red-400 text-sm">AI 추가 예문 생성에 실패했습니다.</p>
                            }
                             {!process.env.API_KEY && <p className="text-yellow-400 text-sm">AI 예문 생성은 API 키가 필요합니다.</p>}
                             {isCurrentlyGeminiQuotaExhausted && <p className="text-yellow-400 text-sm">Gemini API 할당량이 소진되어 AI 예문 생성을 할 수 없습니다.</p>}
                            <button onClick={() => setShowReviewModal(false)} className="mt-4 w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded">닫기</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    const currentWord = quizWords[currentQuestionIndex];
    if (!currentWord) { 
        return <div className="p-8 text-center">퀴즈 단어 로딩 중... 또는 더 이상 문제가 없습니다. 대시보드로 돌아가세요.</div>;
    }

    const handleAnswerSelection = (answer: string) => {
        if (showResult) return;
        setSelectedAnswer(answer);
        setShowResult(true);
        if (answer === currentWord.meaning) {
            setScore(score + 1);
        } else {
            setIncorrectlyAnsweredWordsDetails(prev => [...prev, currentWord]);
            const currentStat = getWordStat(currentWord.id);
            updateWordStat(currentWord.id, { quizIncorrectCount: currentStat.quizIncorrectCount + 1 });
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quizWords.length - 1) {
            const nextQuestionWord = quizWords[currentQuestionIndex + 1];
            speak(nextQuestionWord.term); 
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setShowResult(false);
            generateOptions(nextQuestionWord);
        } else {
            onQuizComplete(score, quizWords.length, incorrectlyAnsweredWordsDetails);
            setIsFinished(true);
        }
    };
    
    return (
        <div className="p-4 sm:p-8 flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6">퀴즈 ({currentQuestionIndex + 1} / {quizWords.length})</h1>
            <div className="w-full max-w-xl bg-slate-700 rounded-xl shadow-2xl p-6 sm:p-8">
                <div className="text-center mb-6">
                    <p className="text-slate-400 text-sm mb-1">다음 단어의 뜻은 무엇일까요?</p>
                    <div className="flex items-center justify-center">
                        <h2 className="text-4xl sm:text-5xl font-bold text-white mr-2">{currentWord.term}</h2>
                        <button onClick={() => speak(currentWord.term)} className="text-slate-400 hover:text-cyan-400 text-2xl" aria-label="단어 발음 듣기">
                            🔊
                        </button>
                    </div>
                     {currentWord.pronunciation && <p className="text-slate-400 text-lg">[{currentWord.pronunciation}]</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                    {options.map((option, index) => (
                        <button
                            key={option + '-' + index} 
                            onClick={() => handleAnswerSelection(option)}
                            disabled={showResult}
                            className={`w-full p-3 sm:p-4 text-left rounded-lg shadow-md transition-all duration-150 ease-in-out
                                ${showResult
                                    ? option === currentWord.meaning
                                        ? 'bg-green-500 text-white ring-2 ring-green-300 scale-105'
                                        : option === selectedAnswer
                                            ? 'bg-red-500 text-white ring-2 ring-red-300' 
                                            : 'bg-slate-600 text-slate-300 opacity-70'
                                    : 'bg-slate-600 hover:bg-cyan-700 text-white focus:bg-cyan-700'
                                }`}
                            aria-pressed={selectedAnswer === option}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                {showResult && (
                    <div className={`text-center p-3 mb-4 rounded-md text-white ${selectedAnswer === currentWord.meaning ? 'bg-green-600' : 'bg-red-600'} animate-fadeIn`}>
                        {selectedAnswer === currentWord.meaning ? '정답입니다! 🎉' : `오답입니다. 정답: ${currentWord.meaning}`}
                    </div>
                )}

                <button
                    onClick={handleNextQuestion}
                    disabled={!showResult}
                    className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-md shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {currentQuestionIndex === quizWords.length - 1 ? '결과 보기' : '다음 문제'}
                </button>
            </div>
             <button 
                onClick={() => onNavigate('dashboard')} 
                className="mt-8 text-sm text-cyan-400 hover:text-cyan-300"
            >
                퀴즈 중단하고 대시보드로
            </button>
        </div>
    );
};


// Shared EditWordModal Component
const EditWordModal = ({ 
    word, 
    onSave, 
    onCancel, 
    userGrade, 
    isCustomWordOnly, 
    addToast, 
    setGlobalLoading 
}: { 
    word: Word, 
    onSave: (updatedWord: Word) => Promise<void>, 
    onCancel: () => void, 
    userGrade: string, 
    isCustomWordOnly?: boolean, 
    addToast: (message: string, type: ToastMessage['type']) => void, 
    setGlobalLoading: (loading: boolean) => void 
}) => {
    const [editableWord, setEditableWord] = useState<Word>(JSON.parse(JSON.stringify(word))); // Deep copy
    const [isFetchingModalAIDetails, setIsFetchingModalAIDetails] = useState(false);
    const [isFetchingModalAIImage, setIsFetchingModalAIImage] = useState(false);
    const [modalAiImage, setModalAiImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setEditableWord(JSON.parse(JSON.stringify(word)));
        setModalAiImage(null); // Reset image when word changes
    }, [word]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableWord(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAIFillDetails = async () => {
        if (!editableWord.term?.trim() || !process.env.API_KEY) {
             addToast(process.env.API_KEY ? "AI로 정보를 가져올 단어를 입력해주세요." : "AI 정보 채우기를 위해 API 키를 설정해주세요.", "warning");
            return;
        }
        if (isCurrentlyGeminiQuotaExhausted) {
             addToast("Gemini API 할당량이 소진되어 AI 정보 채우기를 할 수 없습니다.", "warning");
             return;
        }
        setIsFetchingModalAIDetails(true);
        const details = await generateWordDetailsWithGemini(editableWord.term.trim(), addToast, setGlobalLoading);
        if (details) {
            setEditableWord(prev => ({
                ...prev,
                term: details.term || prev.term,
                pronunciation: details.pronunciation || prev.pronunciation,
                meaning: details.meaning || prev.meaning,
                partOfSpeech: details.partOfSpeech || prev.partOfSpeech,
                exampleSentence: details.exampleSentence || prev.exampleSentence,
                exampleSentenceMeaning: details.exampleSentenceMeaning || prev.exampleSentenceMeaning,
            }));
        }
        setIsFetchingModalAIDetails(false);
    };

    const handleGenerateModalAiImage = async () => {
        if (!editableWord.term?.trim() || !process.env.API_KEY) {
            if(!process.env.API_KEY) addToast("AI 이미지 생성을 위해 API 키를 설정해주세요.", "warning");
            return;
        }
        setIsFetchingModalAIImage(true);
        setModalAiImage(null);
        const imageData = await generateImageForWordWithGemini(editableWord.term.trim(), addToast, setGlobalLoading);
        if(imageData) {
            setModalAiImage(`data:image/jpeg;base64,${imageData}`);
        }
        setIsFetchingModalAIImage(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(editableWord);
        setIsSubmitting(false); 
    };
    
    const canEditFields = word.isCustom || !isCustomWordOnly;

    return (
        <div role="dialog" aria-modal="true" aria-labelledby={`edit-word-modal-title-${word.id}`} className="fixed inset-0 bg-slate-900 bg-opacity-75 flex justify-center items-center p-4 z-50 overflow-y-auto animate-fadeIn">
            <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg space-y-3 my-4">
                <h3 id={`edit-word-modal-title-${word.id}`} className="text-xl font-semibold text-cyan-400">단어 {canEditFields ? '수정' : '세부정보'}: {word.term}</h3>
                <div>
                    <label htmlFor={`term-modal-${word.id}`} className="block text-sm font-medium text-slate-300">단어 (필수)</label>
                    <input type="text" name="term" id={`term-modal-${word.id}`} value={editableWord.term} onChange={handleChange} className="w-full p-2 mt-1 bg-slate-700 rounded text-white" required disabled={!canEditFields}/>
                </div>
                 <button
                    type="button"
                    onClick={handleAIFillDetails}
                    disabled={isFetchingModalAIDetails || !process.env.API_KEY || !canEditFields || isCurrentlyGeminiQuotaExhausted || isFetchingModalAIImage || isSubmitting}
                    className="w-full my-1 py-2 px-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md shadow-sm disabled:opacity-50 flex items-center justify-center text-sm"
                >
                    <span role="img" aria-label="ai" className="mr-2">✨</span>
                    {isFetchingModalAIDetails ? 'AI 정보 가져오는 중...' : 'AI로 나머지 정보 채우기'}
                     {(!process.env.API_KEY || !canEditFields || isCurrentlyGeminiQuotaExhausted) && <span className="text-xs ml-1">({!canEditFields ? "사용자 단어만 가능" : (!process.env.API_KEY ? "API Key 필요" : "Quota 소진")})</span>}
                </button>
                <div>
                    <label htmlFor={`meaning-modal-${word.id}`} className="block text-sm font-medium text-slate-300">뜻 (필수)</label>
                    <input type="text" name="meaning" id={`meaning-modal-${word.id}`} value={editableWord.meaning} onChange={handleChange} className="w-full p-2 mt-1 bg-slate-700 rounded text-white" required disabled={!canEditFields}/>
                </div>
                <div>
                    <label htmlFor={`partOfSpeech-modal-${word.id}`} className="block text-sm font-medium text-slate-300">품사 (필수)</label>
                    <input type="text" name="partOfSpeech" id={`partOfSpeech-modal-${word.id}`} value={editableWord.partOfSpeech} onChange={handleChange} className="w-full p-2 mt-1 bg-slate-700 rounded text-white" required disabled={!canEditFields}/>
                </div>
                <div>
                    <label htmlFor={`pronunciation-modal-${word.id}`} className="block text-sm font-medium text-slate-300">발음기호 (선택)</label>
                    <input type="text" name="pronunciation" id={`pronunciation-modal-${word.id}`} value={editableWord.pronunciation || ''} onChange={handleChange} className="w-full p-2 mt-1 bg-slate-700 rounded text-white" disabled={!canEditFields}/>
                </div>
                <div>
                    <label htmlFor={`exampleSentence-modal-${word.id}`} className="block text-sm font-medium text-slate-300">예문 (필수)</label>
                    <textarea name="exampleSentence" id={`exampleSentence-modal-${word.id}`} value={editableWord.exampleSentence} onChange={handleChange} className="w-full p-2 mt-1 bg-slate-700 rounded text-white" rows={2} required disabled={!canEditFields}/>
                </div>
                <div>
                    <label htmlFor={`exampleSentenceMeaning-modal-${word.id}`} className="block text-sm font-medium text-slate-300">예문 뜻 (선택)</label>
                    <textarea name="exampleSentenceMeaning" id={`exampleSentenceMeaning-modal-${word.id}`} value={editableWord.exampleSentenceMeaning || ''} onChange={handleChange} className="w-full p-2 mt-1 bg-slate-700 rounded text-white" rows={2} disabled={!canEditFields}/>
                </div>
                 <div>
                    <label htmlFor={`gradeLevel-modal-${word.id}`} className="block text-sm font-medium text-slate-300">학년 (필수)</label>
                    <select name="gradeLevel" id={`gradeLevel-modal-${word.id}`} value={editableWord.gradeLevel} onChange={handleChange} className="w-full p-2 mt-1 bg-slate-700 rounded text-white" disabled={!canEditFields}>
                        <option value="middle1">중1</option>
                        <option value="middle2">중2</option>
                        <option value="middle3">중3</option>
                    </select>
                </div>

                <button
                    type="button"
                    onClick={handleGenerateModalAiImage}
                    disabled={isFetchingModalAIImage || !process.env.API_KEY || isCurrentlyGeminiQuotaExhausted || isFetchingModalAIDetails || isSubmitting}
                    className="w-full my-1 py-2 px-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-md shadow-sm disabled:opacity-50 flex items-center justify-center text-sm"
                >
                    <span role="img" aria-label="ai image" className="mr-2">🎨</span>
                    {isFetchingModalAIImage ? 'AI 이미지 생성 중...' : 'AI 이미지 생성 보기'}
                    {(!process.env.API_KEY || isCurrentlyGeminiQuotaExhausted) && <span className="text-xs ml-1">({!process.env.API_KEY ? "Key 필요" : "Quota 소진"})</span>}
                </button>
                {isFetchingModalAIImage && <p className="text-purple-400 text-center text-sm">AI 이미지 로딩 중...</p>}
                {modalAiImage && (
                    <div className="mt-2 p-2 bg-slate-700 rounded-md animate-fadeIn">
                        <img src={modalAiImage} alt={`AI generated for ${editableWord.term}`} className="w-full max-w-xs mx-auto rounded shadow"/>
                    </div>
                )}


                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-white">취소</button>
                    {canEditFields && <button type="submit" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded text-white" disabled={isSubmitting || isFetchingModalAIDetails || isFetchingModalAIImage}>
                      {isSubmitting ? '저장 중...' : '저장'}
                    </button>}
                </div>
            </form>
        </div>
    );
};


// AllWords Screen Component
interface AllWordsScreenProps extends ScreenProps {
    allWords: Word[]; 
    wordStats: Record<string | number, WordStat>;
    onDeleteCustomWord: (wordId: number | string) => void;
    onSaveCustomWord: (wordData: Partial<Word>, gradeLevelForNew?: string) => Promise<boolean>;
    updateWordStat: (wordId: string | number, newStat: Partial<Omit<WordStat, 'id'>>) => void;
}

const AllWordsScreen: React.FC<AllWordsScreenProps> = ({ userSettings, onNavigate, allWords, wordStats, onDeleteCustomWord, onSaveCustomWord, updateWordStat, addToast, setGlobalLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGrade, setFilterGrade] = useState<string>(userSettings.grade || 'all');
    const [editingWord, setEditingWord] = useState<Word | null>(null);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [wordToDelete, setWordToDelete] = useState<Word | null>(null);
    
    const getWordStat = useCallback((wordId: string | number) => {
        return wordStats[wordId] || getDefaultWordStat(wordId);
    }, [wordStats]);

    const wordsToDisplay = useMemo(() => {
        return allWords
        .filter(word => filterGrade === 'all' || word.gradeLevel === filterGrade)
        .filter(word => word.term.toLowerCase().includes(searchTerm.toLowerCase()) || word.meaning.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(word => ({ ...word, stat: getWordStat(word.id) })) 
        .sort((a,b) => a.term.localeCompare(b.term));
    }, [allWords, filterGrade, searchTerm, getWordStat]);


    const handleEditWord = (word: Word) => {
        setEditingWord(JSON.parse(JSON.stringify(word))); 
    };
    
    const handleSaveEdit = async (updatedWord: Word) => {
        if (updatedWord.isCustom) { 
            const success = await onSaveCustomWord(updatedWord);
            if (success) {
                setEditingWord(null);
            }
        } else {
            addToast("기본 제공 단어는 이 화면에서 직접 수정할 수 없습니다.", "info");
            setEditingWord(null); 
        }
    };

    const handleDeleteClick = (word: Word) => {
        setWordToDelete(word);
        setShowConfirmDeleteModal(true);
    };

    const confirmDelete = () => {
        if(wordToDelete) {
            onDeleteCustomWord(wordToDelete.id);
        }
        setShowConfirmDeleteModal(false);
        setWordToDelete(null);
    };

    const toggleMastered = (word: Word) => {
        const currentStat = getWordStat(word.id);
        updateWordStat(word.id, { isMastered: !currentStat.isMastered });
        addToast(
            `'${word.term}' 단어를 ${!currentStat.isMastered ? '완료' : '학습 필요'} 상태로 변경했습니다.`,
            !currentStat.isMastered ? "success" : "info"
        );
    };
    

    return (
        <div className="p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6">전체 단어 목록 ({wordsToDisplay.length}개)</h1>
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="단어 또는 뜻 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-3 bg-slate-700 text-white rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500"
                    aria-label="단어 검색"
                />
                <select
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                    className="p-3 bg-slate-700 text-white rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500"
                    aria-label="학년 필터"
                >
                    <option value="all">모든 학년</option>
                    <option value="middle1">중학교 1학년</option>
                    <option value="middle2">중학교 2학년</option>
                    <option value="middle3">중학교 3학년</option>
                </select>
            </div>

            {wordsToDisplay.length > 0 ? (
                <ul className="space-y-3">
                    {wordsToDisplay.map((word) => (
                        <li key={word.id} className={`p-4 rounded-lg shadow transition-colors ${word.stat.isMastered ? 'bg-slate-700/70 hover:bg-slate-600/70' : 'bg-slate-700 hover:bg-slate-600'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className={`text-xl font-semibold ${word.stat.isMastered ? 'text-green-400' : 'text-cyan-300'}`}>
                                        {word.term} 
                                        {word.stat.isMastered && <span className="text-xs bg-green-500 text-slate-900 px-1.5 py-0.5 rounded-full ml-2">완료</span>}
                                        {word.isCustom && !word.stat.isMastered && <span className="text-xs bg-yellow-500 text-slate-900 px-1.5 py-0.5 rounded-full ml-2">나의 단어</span>}
                                        {word.isCustom && word.stat.isMastered && <span className="text-xs bg-yellow-500 text-slate-900 px-1.5 py-0.5 rounded-full ml-2">나의 단어</span>}

                                    </h3>
                                    <p className="text-sm text-slate-300">{word.partOfSpeech} - {word.meaning}</p>
                                    <p className="text-xs text-slate-400 mt-1">학년: {word.gradeLevel} | 복습: {word.stat.lastReviewed ? new Date(word.stat.lastReviewed).toLocaleDateString() : '안함'} | 오답: {word.stat.quizIncorrectCount}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 flex-shrink-0 ml-2 items-end">
                                     <button onClick={() => speak(word.term)} className="text-slate-400 hover:text-cyan-400 text-xl p-1.5 rounded-md hover:bg-slate-500" aria-label={`${word.term} 발음 듣기`}>
                                        🔊
                                    </button>
                                    <button 
                                        onClick={() => toggleMastered(word)}
                                        className={`p-1.5 rounded-md text-sm whitespace-nowrap ${word.stat.isMastered ? 'bg-slate-500 hover:bg-slate-400 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                                        aria-label={word.stat.isMastered ? `${word.term} 학습 필요로 표시` : `${word.term} 마스터함으로 표시`}
                                    >
                                        {word.stat.isMastered ? '🔄 학습 필요' : '✅ 완료'}
                                    </button>
                                   {word.isCustom ? (
                                        <>
                                            <button 
                                                onClick={() => handleEditWord(word)} 
                                                className="text-yellow-400 hover:text-yellow-300 p-1.5 rounded-md hover:bg-slate-500 text-sm whitespace-nowrap"
                                                aria-label={`${word.term} 수정`}
                                            >✏️ 수정</button>
                                            <button 
                                                onClick={() => handleDeleteClick(word)} 
                                                className="text-red-400 hover:text-red-300 p-1.5 rounded-md hover:bg-slate-500 text-sm whitespace-nowrap"
                                                aria-label={`${word.term} 삭제`}
                                            >🗑️ 삭제</button>
                                        </>
                                    ) : (
                                         <button 
                                            onClick={() => handleEditWord(word)} 
                                            className="text-sky-400 hover:text-sky-300 p-1.5 rounded-md hover:bg-slate-500 text-sm whitespace-nowrap"
                                            aria-label={`${word.term} 세부 정보 보기`}
                                        >ℹ️ 정보</button>
                                    )}
                                </div>
                            </div>
                             {word.exampleSentence && (
                                <details className="mt-2 text-sm">
                                    <summary className="cursor-pointer text-slate-400 hover:text-slate-200">예문 보기</summary>
                                    <div className="mt-1 p-2 bg-slate-600 rounded">
                                        <p className="text-slate-200">{word.exampleSentence}</p>
                                        {word.exampleSentenceMeaning && <p className="text-slate-400 text-xs mt-0.5">{word.exampleSentenceMeaning}</p>}
                                    </div>
                                </details>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-slate-400 py-8">해당 조건에 맞는 단어가 없습니다.</p>
            )}
            {editingWord && <EditWordModal word={editingWord} onSave={handleSaveEdit} onCancel={() => setEditingWord(null)} userGrade={userSettings.grade} isCustomWordOnly={!editingWord.isCustom} addToast={addToast} setGlobalLoading={setGlobalLoading}/>}
            {wordToDelete && (
                <ConfirmationModal
                    isOpen={showConfirmDeleteModal}
                    title="단어 삭제 확인"
                    message={`'${wordToDelete.term}' 단어를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
                    onConfirm={confirmDelete}
                    onCancel={() => { setShowConfirmDeleteModal(false); setWordToDelete(null); }}
                />
            )}
        </div>
    );
};

// Stats Screen Component
interface StatsScreenProps extends ScreenProps {
    learnedWordsHistory: { date: string; count: number }[]; 
    quizHistory: { date: string; score: number; total: number }[];
    allWords: Word[]; 
    wordStats: Record<string | number, WordStat>;
}
const StatsScreen: React.FC<StatsScreenProps> = ({ userSettings, onNavigate, learnedWordsHistory, quizHistory, allWords, wordStats }) => {
    const totalWordsLearnedOverall = learnedWordsHistory.reduce((sum, item) => sum + item.count, 0);
    const averageQuizScore = quizHistory.length > 0 
        ? (quizHistory.reduce((sum, item) => sum + (item.score / Math.max(1, item.total)), 0) / quizHistory.length) * 100
        : 0;

    const getWordStat = useCallback((wordId: string | number) => {
        return wordStats[wordId] || getDefaultWordStat(wordId);
    }, [wordStats]);

    const masteredWordsCount = Object.values(wordStats).filter(stat => stat.isMastered).length;

    const wordsToReview = useMemo(() => {
        return allWords
            .map(word => ({ ...word, stat: getWordStat(word.id) }))
            .filter(word => word.stat.quizIncorrectCount > 0 && !word.stat.isMastered && word.gradeLevel === userSettings.grade) 
            .sort((a, b) => b.stat.quizIncorrectCount - a.stat.quizIncorrectCount)
            .slice(0, 5);
    }, [allWords, wordStats, userSettings.grade, getWordStat]);


    return (
        <div className="p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6">학습 통계</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-700 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-cyan-300 mb-2">총 학습 단어 (역대)</h2>
                    <p className="text-3xl font-bold text-white">{totalWordsLearnedOverall}개</p>
                </div>
                 <div className="bg-slate-700 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-cyan-300 mb-2">완료한 단어</h2>
                    <p className="text-3xl font-bold text-white">{masteredWordsCount}개</p>
                </div>
                <div className="bg-slate-700 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-cyan-300 mb-2">평균 퀴즈 점수</h2>
                    <p className="text-3xl font-bold text-white">{averageQuizScore.toFixed(1)}%</p>
                    <p className="text-sm text-slate-400">{quizHistory.length}회 응시</p>
                </div>
            </div>

            {wordsToReview.length > 0 && (
                 <div className="mb-8">
                    <h3 className="text-xl font-semibold text-cyan-300 mb-3">집중 복습 추천 단어 (현재 학년)</h3>
                    <ul className="space-y-2 bg-slate-700 p-3 rounded-md">
                        {wordsToReview.map(word => (
                            <li key={word.id} className="flex justify-between p-2 bg-slate-600 rounded items-center">
                                <div>
                                    <span className="text-cyan-300 font-semibold">{word.term}</span>
                                    <span className="text-slate-400 text-sm ml-2">- {word.meaning}</span>
                                </div>
                                <span className="text-red-400 text-sm">오답 {word.stat.quizIncorrectCount}회</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xl font-semibold text-cyan-300 mb-3">일일 학습 기록</h3>
                    {learnedWordsHistory.length > 0 ? (
                        <ul className="space-y-2 max-h-60 overflow-y-auto bg-slate-700 p-3 rounded-md">
                            {learnedWordsHistory.slice().reverse().map((item, index) => (
                                <li key={index} className="flex justify-between p-2 bg-slate-600 rounded">
                                    <span className="text-slate-300">{item.date}</span>
                                    <span className="text-white font-semibold">{item.count} 단어</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-400">아직 학습 기록이 없습니다.</p>
                    )}
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-cyan-300 mb-3">퀴즈 기록</h3>
                    {quizHistory.length > 0 ? (
                        <ul className="space-y-2 max-h-60 overflow-y-auto bg-slate-700 p-3 rounded-md">
                            {quizHistory.slice().reverse().map((item, index) => (
                                <li key={index} className="flex justify-between p-2 bg-slate-600 rounded">
                                    <span className="text-slate-300">{item.date}</span>
                                    <span className="text-white font-semibold">{item.score} / {item.total}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-400">아직 퀴즈 기록이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// ManageWords Screen Component
interface ManageWordsScreenProps extends ScreenProps {
    myWords: Word[];
    allWords: Word[]; 
    wordStats: Record<string | number, WordStat>;
    onSaveCustomWord: (wordData: Partial<Word>, gradeLevelForNew?: string) => Promise<boolean>;
    onDeleteCustomWord: (wordId: number | string) => void;
    updateWordStat: (wordId: string | number, newStat: Partial<Omit<WordStat, 'id'>>) => void; 
}

const ManageWordsScreen: React.FC<ManageWordsScreenProps> = ({ userSettings, onNavigate, myWords, allWords, wordStats, onSaveCustomWord, onDeleteCustomWord, updateWordStat, addToast, setGlobalLoading }) => {
    type ManageTab = 'myWordsManage' | 'addManual' | 'fileExtract';
    const [activeTab, setActiveTab] = useState<ManageTab>('myWordsManage');
    
    const [newWordData, setNewWordData] = useState<Partial<Word>>({ term: '', meaning: '', partOfSpeech: '', exampleSentence: '', exampleSentenceMeaning: '', pronunciation: '' });
    const [isSubmittingManualAdd, setIsSubmittingManualAdd] = useState(false);

    // 고급 파일 처리 상태들
    const [extractedText, setExtractedText] = useState<string>('');
    const [extractedWords, setExtractedWords] = useState<string[]>([]);
    const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
    const [fileAnalysisReport, setFileAnalysisReport] = useState<any>(null);
    const [fileProcessingResult, setFileProcessingResult] = useState<FileProcessingResult | null>(null);
    const [autoAddMode, setAutoAddMode] = useState<'manual' | 'auto' | 'smart'>('smart');
    const [batchProcessingProgress, setBatchProcessingProgress] = useState({ current: 0, total: 0, word: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoadingFile, setIsLoadingFile] = useState(false); 
    const [isProcessingFileWords, setIsProcessingFileWords] = useState(false); 
    const [processingLog, setProcessingLog] = useState<string[]>([]);
    
    const [editingWord, setEditingWord] = useState<Word | null>(null);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [wordToDelete, setWordToDelete] = useState<Word | null>(null);

    const [fileSummary, setFileSummary] = useState<string | null>(null);
    const [isFetchingSummary, setIsFetchingSummary] = useState(false);

    const extractUniqueNewWords = useCallback((text: string): string[] => {
        const existingTerms = new Set(allWords.map(w => w.term.toLowerCase()));
        const words = text
            .toLowerCase()
            .match(/\b[a-z]{3,}\b/g)
            ?.filter(extractedWord => !existingTerms.has(extractedWord)); 
        if (words) {
            return Array.from(new Set(words)).sort();
        }
        return [];
    }, [allWords]);

    const handleGenerateFileSummary = async () => {
        if (!extractedText || !process.env.API_KEY) {
            addToast(process.env.API_KEY ? "요약할 추출된 텍스트가 없습니다." : "AI 요약 기능을 위해 API 키를 설정해주세요.", "warning");
            return;
        }
         if (isCurrentlyGeminiQuotaExhausted) {
             addToast("Gemini API 할당량이 소진되어 AI 텍스트 요약을 할 수 없습니다.", "warning");
             return;
        }
        setIsFetchingSummary(true);
        const summary = await generateSummaryWithGemini(extractedText, addToast, setGlobalLoading);
        setFileSummary(summary);
        setIsFetchingSummary(false);
        if (summary) {
            addToast("텍스트 요약이 생성되었습니다.", "success");
        } else {
            // Error toast handled by generateSummaryWithGemini or quota check
        }
    };


    const processAndAddExtractedWords = async (wordsToProcess: string[]) => {
        if (!process.env.API_KEY) {
            addToast("파일에서 단어 자동 추가 기능을 사용하려면 API 키가 필요합니다.", "error");
            setProcessingLog(prev => [...prev, "오류: API 키가 설정되지 않았습니다. 자동 추가를 중단합니다."]);
            setIsProcessingFileWords(false);
            return;
        }
        if (isCurrentlyGeminiQuotaExhausted) {
            addToast("Gemini API 할당량이 소진되어 단어 자동 추가를 시작할 수 없습니다. 잠시 후 다시 시도해주세요.", "error");
            setProcessingLog(prev => [...prev, "오류: Gemini API 할당량 소진됨. 자동 추가 중단."]);
            setIsProcessingFileWords(false);
            return;
        }

        setIsProcessingFileWords(true);
        
        // v2.8.0: 스마트 필터링 적용
        let filteredWords = wordsToProcess;
        if (userSettings.smartWordFiltering) {
            const existingTerms = new Set(allWords.map(w => w.term.toLowerCase()));
            filteredWords = wordsToProcess.filter(word => 
                !existingTerms.has(word.toLowerCase()) && 
                word.length > 2 && 
                /^[a-zA-Z]+$/.test(word) // 영어 단어만
            );
            
            if (filteredWords.length < wordsToProcess.length) {
                setProcessingLog(prev => [...prev, `🧠 스마트 필터링: ${wordsToProcess.length - filteredWords.length}개 단어 제외됨 (중복/잘못된 형식)`]);
                addToast(`스마트 필터링으로 ${wordsToProcess.length - filteredWords.length}개 단어가 제외되었습니다.`, "info");
            }
        }

        if (filteredWords.length === 0) {
            addToast("필터링 후 추가할 단어가 없습니다.", "warning");
            setIsProcessingFileWords(false);
            return;
        }

        // v2.8.0: 대량 처리 모드
        const batchSize = userSettings.bulkWordProcessing ? 5 : 1;
        const delayBetweenCalls = userSettings.bulkWordProcessing ? 3000 : 6000;
        
        setProcessingLog(prev => [...prev, `📂 v2.8.0 고급 처리 모드: ${filteredWords.length}개 단어 처리 시작...`]);
        setProcessingLog(prev => [...prev, `⚡ 배치 크기: ${batchSize}, 지연시간: ${delayBetweenCalls}ms`]);
        
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < filteredWords.length; i += batchSize) {
            if (isCurrentlyGeminiQuotaExhausted) { 
                addToast("Gemini API 할당량이 처리 도중 소진되었습니다. 나머지 단어 처리를 중단합니다.", "error");
                setProcessingLog(prev => [...prev, `API 할당량 소진으로 처리 중단.`]);
                failCount += (filteredWords.length - i); 
                break; 
            }

            const batch = filteredWords.slice(i, i + batchSize);
            
            for (const term of batch) {
                setProcessingLog(prev => [...prev, `(${i + 1}/${filteredWords.length}) '${term}' 처리 중... AI 정보 요청...`]);
                
                const added = await onSaveCustomWord({ term }, userSettings.grade); 
                
                if (added) {
                    successCount++;
                    setProcessingLog(prev => [...prev, `✅ '${term}' 추가 완료.`]);
                } else {
                    failCount++;
                    setProcessingLog(prev => [...prev, `❌ '${term}' 추가 실패. (AI 정보 부족, 중복 또는 API 오류)`]);
                }
            }

            if (i + batchSize < filteredWords.length) {
                await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
            }
        }

        setProcessingLog(prev => [...prev, `--- v2.8.0 고급 처리 완료 ---`]);
        setProcessingLog(prev => [...prev, `최종 결과: 성공 ${successCount}개, 실패 ${failCount}개.`]);
        
        // v2.8.0: 파일 분석 리포트 생성
        if (userSettings.fileAnalysisReports && fileAnalysisReport) {
            setProcessingLog(prev => [...prev, `📊 파일 분석 리포트: ${fileAnalysisReport}`]);
        }
        
        addToast(`📂 v2.8.0 파일 단어 처리 완료: 성공 ${successCount}, 실패 ${failCount}`, failCount > 0 ? "warning" : "success");
        
        // v2.8.0: 자동 저장 완료 시 처리된 단어들 제거
        if (userSettings.autoSaveExtractedWords && successCount > 0) {
            const processedWords = filteredWords.slice(0, successCount);
            const remainingWords = extractedWords.filter(word => !processedWords.includes(word));
            setExtractedWords(remainingWords);
            setSelectedWords(new Set());
            setProcessingLog(prev => [...prev, `💾 자동 저장 완료: 처리된 ${successCount}개 단어가 목록에서 제거됨`]);
        }
        
        setIsProcessingFileWords(false);
        playSound('complete', userSettings.soundEnabled);
    };


    // 🚀 고급 파일 처리 함수
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoadingFile(true);
        setIsProcessingFileWords(false);
        setExtractedText('');
        setExtractedWords([]);
        setSelectedWords(new Set());
        setProcessingLog([]);
        setFileSummary(null);
        setFileAnalysisReport(null);
        setBatchProcessingProgress({ current: 0, total: 0, word: '' });
        
        setProcessingLog(prev => [...prev, `📄 '${file.name}' 파일 분석 시작...`]);

        try {
            const result = await extractTextFromFile(file);
            
            if (!result.success) {
                addToast(result.error || '파일 처리에 실패했습니다.', 'error');
                setProcessingLog(prev => [...prev, `❌ ${result.error}`]);
                return;
            }

            // v2.8.0: 파일 처리 결과 저장
            setFileProcessingResult(result);

            // 기존 단어와 중복 제거
            const existingTerms = new Set(allWords.map(w => w.term.toLowerCase()));
            const newWords = result.extractedWords.filter(word => !existingTerms.has(word.toLowerCase()));
            
            setExtractedText(result.extractedText);
            setExtractedWords(newWords);
            
            // 파일 분석 리포트 생성
            const report = generateFileAnalysisReport({
                ...result,
                extractedWords: newWords
            });
            setFileAnalysisReport(report);
            
            // 스마트 모드일 때 자동으로 상위 단어들 선택
            if (autoAddMode === 'smart') {
                const smartSelection = new Set(newWords.slice(0, Math.min(20, newWords.length)));
                setSelectedWords(smartSelection);
            } else if (autoAddMode === 'auto') {
                const autoSelection = new Set(newWords);
                setSelectedWords(autoSelection);
            }

            addToast(`✅ 파일 분석 완료! ${newWords.length}개의 새로운 단어를 발견했습니다.`, 'success');
            setProcessingLog(prev => [
                ...prev,
                `✅ 파일 분석 완료`,
                `📊 총 ${result.extractedWords.length}개 단어 추출, ${newWords.length}개 새로운 단어`,
                `🎯 ${autoAddMode === 'smart' ? '스마트 모드: 상위 20개 단어 자동 선택' : autoAddMode === 'auto' ? '자동 모드: 모든 단어 선택' : '수동 모드: 단어를 직접 선택하세요'}`
            ]);

            // v3.0.0: 향상된 자동 저장 기능
            if (userSettings.autoSaveExtractedWords && newWords.length > 0) {
                setProcessingLog(prev => [...prev, `💾 v3.0.0 자동 저장 기능 활성화: ${newWords.length}개 단어 자동 처리 시작...`]);
                
                // 스마트 모드일 때는 상위 20개만, 아니면 모든 단어 자동 처리
                const wordsToAutoSave = autoAddMode === 'smart' ? newWords.slice(0, 20) : newWords;
                
                // 모든 단어를 자동 선택하고 자동 저장 실행
                setSelectedWords(new Set(wordsToAutoSave));
                
                setTimeout(() => {
                    processAndAddExtractedWords(wordsToAutoSave);
                }, 1500); // 1.5초 후 자동 실행 (사용자가 확인할 시간 제공)
                
                addToast(`🚀 v3.0.0 전체 단어 자동 저장: ${wordsToAutoSave.length}개 단어가 AI로 자동 처리됩니다!`, 'success');
                
                // 추가 안내 메시지
                setTimeout(() => {
                    addToast(`⏱️ 예상 완료 시간: 약 ${Math.ceil(wordsToAutoSave.length / 10)}분`, 'info');
                }, 500);
            } else if (!userSettings.autoSaveExtractedWords && newWords.length > 0) {
                // 자동 저장이 비활성화된 경우 안내 메시지
                addToast(`💡 팁: 설정에서 "자동 저장" 기능을 활성화하면 파일 업로드 시 모든 단어가 자동으로 저장됩니다!`, 'info');
            }

        } catch (error) {
            console.error('File processing error:', error);
            const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
            addToast(`파일 처리 중 오류 발생: ${errorMsg}`, 'error');
            setProcessingLog(prev => [...prev, `❌ 파일 처리 오류: ${errorMsg}`]);
        } finally {
            setIsLoadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    
    // 🎯 단어 선택/해제 함수들
    const handleWordToggle = (word: string) => {
        const newSelected = new Set(selectedWords);
        if (newSelected.has(word)) {
            newSelected.delete(word);
        } else {
            newSelected.add(word);
        }
        setSelectedWords(newSelected);
    };

    const handleSelectAll = () => {
        setSelectedWords(new Set(extractedWords));
    };

    const handleDeselectAll = () => {
        setSelectedWords(new Set());
    };

    const handleSmartSelect = () => {
        // 빈도수 기반 상위 20개 단어 선택
        const smartSelection = new Set(extractedWords.slice(0, Math.min(20, extractedWords.length)));
        setSelectedWords(smartSelection);
    };

    // 🚀 고급 배치 처리 함수
    const handleStartBatchProcessing = async () => {
        if (selectedWords.size === 0) {
            addToast("처리할 단어를 선택해주세요.", "warning");
            return;
        }

        if (!process.env.API_KEY) {
            addToast("AI 기반 단어 처리를 위해 API 키가 필요합니다.", "error");
            return;
        }

        if (isCurrentlyGeminiQuotaExhausted) {
            addToast("Gemini API 할당량이 소진되어 단어 자동 추가를 할 수 없습니다.", "warning");
            return;
        }

        setIsProcessingFileWords(true);
        const wordsArray = Array.from(selectedWords);
        
        setProcessingLog(prev => [
            ...prev,
            `🚀 배치 처리 시작: ${wordsArray.length}개 단어`,
            `⏳ 예상 소요 시간: ${Math.ceil(wordsArray.length / 5) * 2}분`
        ]);

        try {
            const processedWords = await processBatchWords(
                wordsArray,
                userSettings.grade,
                addToast,
                setGlobalLoading,
                (current, total, word) => {
                    setBatchProcessingProgress({ current, total, word });
                    setProcessingLog(prev => [
                        ...prev.slice(0, -1), // 마지막 진행 상황 로그 제거
                        `🔄 처리 중: ${word} (${current + 1}/${total})`
                    ]);
                }
            );

            // 처리된 단어들을 실제로 저장
            let successCount = 0;
            for (const word of processedWords) {
                const success = await onSaveCustomWord(word, userSettings.grade);
                if (success) successCount++;
            }

            setProcessingLog(prev => [
                ...prev,
                `✅ 배치 처리 완료!`,
                `📊 최종 결과: ${successCount}개 성공, ${processedWords.length - successCount}개 실패`
            ]);

            addToast(`배치 처리 완료: ${successCount}개 단어가 추가되었습니다.`, 'success');
            
            // 성공한 단어들 선택에서 제거
            const remainingWords = new Set(
                Array.from(selectedWords).filter(word => 
                    !processedWords.some(pw => pw.term.toLowerCase() === word.toLowerCase())
                )
            );
            setSelectedWords(remainingWords);

        } catch (error) {
            console.error('Batch processing error:', error);
            addToast('배치 처리 중 오류가 발생했습니다.', 'error');
            setProcessingLog(prev => [...prev, `❌ 배치 처리 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`]);
        } finally {
            setIsProcessingFileWords(false);
            setBatchProcessingProgress({ current: 0, total: 0, word: '' });
        }
    };

    // 레거시 함수 (하위 호환성)
    const handleStartWordProcessingFromFile = () => {
        if (extractedWords.length === 0) {
            addToast("먼저 파일을 업로드하고 분석해주세요.", "warning");
            return;
        }
        
        // 모든 단어 선택 후 배치 처리 시작
        setSelectedWords(new Set(extractedWords));
        setTimeout(() => handleStartBatchProcessing(), 100);
    };

    const handleManualAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewWordData(prev => ({ ...prev, [name]: value }));
    };

    const handleManualAddWord = async () => {
        if (!newWordData.term?.trim()) {
            addToast("단어를 입력해주세요.", "warning");
            return;
        }
        setIsSubmittingManualAdd(true);
        const success = await onSaveCustomWord(newWordData, userSettings.grade);
        setIsSubmittingManualAdd(false);
        if (success) {
            setNewWordData({ term: '', meaning: '', partOfSpeech: '', exampleSentence: '', exampleSentenceMeaning: '', pronunciation: '' }); 
        }
    };

    const handleFetchWithAIForManualAdd = async () => {
        if (!newWordData.term?.trim() || !process.env.API_KEY) {
             addToast(process.env.API_KEY ? "AI로 정보를 가져올 단어를 입력해주세요." : "AI 정보 채우기를 위해 API 키를 설정해주세요.", "warning");
            return;
        }
         if (isCurrentlyGeminiQuotaExhausted) {
             addToast("Gemini API 할당량이 소진되어 AI 정보 채우기를 할 수 없습니다.", "warning");
             return;
        }
        setIsSubmittingManualAdd(true);
        const details = await generateWordDetailsWithGemini(newWordData.term.trim(), addToast, setGlobalLoading);
        if (details) {
            setNewWordData(prev => ({
                ...prev,
                term: details.term || prev.term,
                meaning: details.meaning || '',
                partOfSpeech: details.partOfSpeech || '',
                exampleSentence: details.exampleSentence || '',
                exampleSentenceMeaning: details.exampleSentenceMeaning || '',
                pronunciation: details.pronunciation || '',
            }));
        }
        setIsSubmittingManualAdd(false);
    };

    const handleEditMyWord = (word: Word) => {
        setEditingWord(JSON.parse(JSON.stringify(word))); 
    };
    
    const handleSaveMyWordEdit = async (updatedWord: Word) => {
        setIsSubmittingManualAdd(true); 
        const success = await onSaveCustomWord(updatedWord);
        setIsSubmittingManualAdd(false);
        if (success) {
            setEditingWord(null); 
        }
    };

    const handleDeleteMyWordClick = (word: Word) => {
        setWordToDelete(word);
        setShowConfirmDeleteModal(true);
    };

    const confirmDeleteMyWord = () => {
        if(wordToDelete) {
            onDeleteCustomWord(wordToDelete.id);
        }
        setShowConfirmDeleteModal(false);
        setWordToDelete(null);
    };


    const tabs: { id: ManageTab; label: string }[] = [
        { id: 'myWordsManage', label: '나의 단어 관리' },
        { id: 'addManual', label: '단어 직접 추가' },
        { id: 'fileExtract', label: '파일에서 추출 및 자동 추가' },
    ];
    
    return (
        <div className="p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6">단어 관리</h1>
            <div className="mb-6 border-b border-slate-700">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-cyan-500 text-cyan-400'
                                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm sm:text-base`}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'myWordsManage' && (
                <div>
                    <h2 className="text-xl font-semibold text-cyan-300 mb-4">나의 단어 목록 ({myWords.length}개)</h2>
                    {myWords.length > 0 ? (
                        <ul className="space-y-3">
                            {myWords.map((word) => (
                                <li key={word.id} className="p-4 bg-slate-700 rounded-lg shadow">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-semibold text-lg text-cyan-400">{word.term}</h4>
                                            <p className="text-sm text-slate-300 mt-1">
                                                {word.meaning ? word.meaning : <span className="text-slate-500 italic">(뜻 없음)</span>}
                                                {word.partOfSpeech && <span className="text-xs text-slate-400 ml-2">({word.partOfSpeech})</span>}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-end flex-shrink-0 ml-2">
                                            <button
                                                onClick={() => handleEditMyWord(word)}
                                                aria-label={`${word.term} 수정`}
                                                className="px-3 py-1.5 bg-yellow-500 text-slate-900 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 text-sm whitespace-nowrap"
                                            >
                                                ✏️ 수정
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMyWordClick(word)}
                                                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 text-sm whitespace-nowrap"
                                                aria-label={`${word.term} 삭제`}
                                            >
                                                🗑️ 삭제
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-400 text-center py-4">나의 단어가 없습니다. 다른 탭에서 단어를 추가해보세요.</p>
                    )}
                </div>
            )}
             {editingWord && activeTab === 'myWordsManage' && (
                 <EditWordModal
                    word={editingWord} 
                    onSave={handleSaveMyWordEdit} 
                    onCancel={() => setEditingWord(null)}
                    userGrade={userSettings.grade}
                    isCustomWordOnly={true} 
                    addToast={addToast}
                    setGlobalLoading={setGlobalLoading}
                />
            )}
             {wordToDelete && activeTab === 'myWordsManage' && (
                <ConfirmationModal
                    isOpen={showConfirmDeleteModal}
                    title="단어 삭제 확인"
                    message={`'${wordToDelete.term}' 단어를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
                    onConfirm={confirmDeleteMyWord}
                    onCancel={() => { setShowConfirmDeleteModal(false); setWordToDelete(null); }}
                />
            )}


            {activeTab === 'addManual' && (
                <div className="space-y-3 max-w-lg mx-auto">
                    <h2 className="text-xl font-semibold text-cyan-300 mb-3 text-center">단어 직접 추가</h2>
                    <div>
                        <label htmlFor="newWordTerm" className="block text-sm font-medium text-slate-300">단어 (필수)</label>
                        <input id="newWordTerm" name="term" type="text" value={newWordData.term || ''} onChange={handleManualAddInputChange} className="w-full mt-1 p-2 bg-slate-600 text-white rounded-md focus:ring-cyan-500 focus:border-cyan-500" placeholder="예: apple" required/>
                    </div>
                     <button
                        onClick={handleFetchWithAIForManualAdd}
                        disabled={isSubmittingManualAdd || !process.env.API_KEY || isCurrentlyGeminiQuotaExhausted}
                        className="w-full my-2 py-2 px-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md shadow-sm disabled:opacity-50 flex items-center justify-center text-sm"
                    >
                        <span role="img" aria-label="ai" className="mr-2">✨</span>
                        {isSubmittingManualAdd ? 'AI 정보 가져오는 중...' : 'AI로 나머지 정보 채우기'}
                        {(!process.env.API_KEY || isCurrentlyGeminiQuotaExhausted) && <span className="text-xs ml-1">({!process.env.API_KEY ? "API Key 필요" : "Quota 소진"})</span>}
                    </button>
                    <div>
                        <label htmlFor="newWordMeaning" className="block text-sm font-medium text-slate-300">뜻</label>
                        <input id="newWordMeaning" name="meaning" type="text" value={newWordData.meaning || ''} onChange={handleManualAddInputChange} className="w-full mt-1 p-2 bg-slate-600 text-white rounded-md" placeholder="예: 사과"/>
                    </div>
                    <div>
                        <label htmlFor="newWordPOS" className="block text-sm font-medium text-slate-300">품사</label>
                        <input id="newWordPOS" name="partOfSpeech" type="text" value={newWordData.partOfSpeech || ''} onChange={handleManualAddInputChange} className="w-full mt-1 p-2 bg-slate-600 text-white rounded-md" placeholder="예: 명사"/>
                    </div>
                     <div>
                        <label htmlFor="newWordPronunciation" className="block text-sm font-medium text-slate-300">발음기호</label>
                        <input id="newWordPronunciation" name="pronunciation" type="text" value={newWordData.pronunciation || ''} onChange={handleManualAddInputChange} className="w-full mt-1 p-2 bg-slate-600 text-white rounded-md" placeholder="예: /ˈæpəl/"/>
                    </div>
                    <div>
                        <label htmlFor="newWordExample" className="block text-sm font-medium text-slate-300">예문</label>
                        <textarea id="newWordExample" name="exampleSentence" value={newWordData.exampleSentence || ''} onChange={handleManualAddInputChange} className="w-full mt-1 p-2 bg-slate-600 text-white rounded-md" rows={2} placeholder="예: I ate an apple."></textarea>
                    </div>
                     <div>
                        <label htmlFor="newWordExampleMeaning" className="block text-sm font-medium text-slate-300">예문 뜻</label>
                        <textarea id="newWordExampleMeaning" name="exampleSentenceMeaning" value={newWordData.exampleSentenceMeaning || ''} onChange={handleManualAddInputChange} className="w-full mt-1 p-2 bg-slate-600 text-white rounded-md" rows={2} placeholder="예: 나는 사과를 먹었다."></textarea>
                    </div>
                    <button
                        onClick={handleManualAddWord}
                        disabled={isSubmittingManualAdd || !newWordData.term?.trim()}
                        className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-md shadow-md disabled:opacity-50"
                    >
                        {isSubmittingManualAdd ? '단어 처리 중...' : '단어 추가/저장'}
                    </button>
                </div>
            )}
            
            {activeTab === 'fileExtract' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-cyan-300 mb-2">🚀 고급 파일 처리 시스템</h2>
                        <p className="text-slate-400 text-sm">
                            다양한 파일 형식에서 영어 단어를 추출하고 AI로 자동 처리하는 스마트 학습 시스템
                        </p>
                    </div>

                    {/* 처리 모드 선택 */}
                    <div className="bg-slate-700 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-cyan-300 mb-3">🎯 처리 모드 선택</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { mode: 'manual', label: '수동 선택', desc: '단어를 직접 선택', icon: '👆' },
                                { mode: 'smart', label: '스마트 선택', desc: '상위 20개 자동 선택', icon: '🧠' },
                                { mode: 'auto', label: '전체 자동', desc: '모든 단어 자동 처리', icon: '⚡' }
                            ].map(({ mode, label, desc, icon }) => (
                                <button
                                    key={mode}
                                    onClick={() => setAutoAddMode(mode as any)}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        autoAddMode === mode
                                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                                            : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">{icon}</div>
                                    <div className="font-semibold text-sm">{label}</div>
                                    <div className="text-xs opacity-75">{desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 파일 업로드 영역 */}
                    <div className="bg-slate-700 p-6 rounded-lg border-2 border-dashed border-slate-600">
                        <div className="text-center">
                            <div className="text-4xl mb-3">📄</div>
                            <h3 className="text-lg font-semibold text-slate-300 mb-2">파일 업로드</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                PDF, TXT, XLSX, XLS, CSV, JSON 파일을 지원합니다
                            </p>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange} 
                                accept=".pdf,.txt,.xlsx,.xls,.csv,.json" 
                                className="block w-full text-sm text-slate-400
                                    file:mr-4 file:py-3 file:px-6
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-gradient-to-r file:from-cyan-500 file:to-blue-500
                                    file:text-white hover:file:from-cyan-600 hover:file:to-blue-600
                                    file:cursor-pointer file:transition-all"
                                disabled={isLoadingFile || isProcessingFileWords}
                            />
                            {isLoadingFile && (
                                <div className="mt-4 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                                    <span className="ml-2 text-cyan-400">파일 분석 중...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 파일 분석 결과 */}
                    {fileAnalysisReport && (
                        <div className="bg-slate-700 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-cyan-300 mb-3">📊 파일 분석 리포트</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div className="text-center p-3 bg-slate-800 rounded">
                                    <div className="text-cyan-400 font-semibold">{fileAnalysisReport.fileName}</div>
                                    <div className="text-slate-400">파일명</div>
                                </div>
                                <div className="text-center p-3 bg-slate-800 rounded">
                                    <div className="text-green-400 font-semibold">{fileAnalysisReport.fileSize}</div>
                                    <div className="text-slate-400">크기</div>
                                </div>
                                <div className="text-center p-3 bg-slate-800 rounded">
                                    <div className="text-blue-400 font-semibold">{fileAnalysisReport.totalWords}</div>
                                    <div className="text-slate-400">총 단어</div>
                                </div>
                                <div className="text-center p-3 bg-slate-800 rounded">
                                    <div className="text-yellow-400 font-semibold">{fileAnalysisReport.uniqueEnglishWords}</div>
                                    <div className="text-slate-400">새 단어</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 추출된 단어 목록 */}
                    {extractedWords.length > 0 && (
                        <div className="bg-slate-700 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-cyan-300">
                                    📝 추출된 단어 ({extractedWords.length}개)
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSelectAll}
                                        className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                                    >
                                        전체 선택
                                    </button>
                                    <button
                                        onClick={handleSmartSelect}
                                        className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                                    >
                                        스마트 선택
                                    </button>
                                    <button
                                        onClick={handleDeselectAll}
                                        className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded"
                                    >
                                        선택 해제
                                    </button>
                                </div>
                            </div>
                            
                            <div className="max-h-60 overflow-y-auto">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                    {extractedWords.map((word, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleWordToggle(word)}
                                            className={`p-2 text-sm rounded border transition-all ${
                                                selectedWords.has(word)
                                                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                                                    : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                                            }`}
                                        >
                                            {word}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-600">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm text-slate-400">
                                        선택된 단어: {selectedWords.size}개
                                    </span>
                                    {isProcessingFileWords && batchProcessingProgress.total > 0 && (
                                        <span className="text-sm text-cyan-400">
                                            처리 중: {batchProcessingProgress.current + 1}/{batchProcessingProgress.total}
                                        </span>
                                    )}
                                </div>
                                
                                {isProcessingFileWords && batchProcessingProgress.total > 0 && (
                                    <div className="mb-3">
                                        <div className="bg-slate-600 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                                                style={{ width: `${((batchProcessingProgress.current + 1) / batchProcessingProgress.total) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-center text-slate-400 mt-1">
                                            현재 처리 중: {batchProcessingProgress.word}
                                        </div>
                                    </div>
                                )}
                                
                                {/* 🌟 v3.0.0 NEW: 전체 단어 처리 버튼 영역 */}
                                <div className="bg-gradient-to-r from-orange-600/10 to-amber-600/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                                    <h4 className="text-orange-300 font-semibold mb-3 flex items-center gap-2">
                                        <span className="text-xl">⚡</span>
                                        v3.0.0 원클릭 전체 단어 저장
                                        <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full ml-auto">NEW</span>
                                    </h4>
                                    
                                    {/* 저장 옵션 선택 */}
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <button
                                            onClick={() => {
                                                // 스마트 선택 (상위 20개)
                                                const smartWords = extractedWords.slice(0, 20);
                                                setSelectedWords(new Set(smartWords));
                                                setTimeout(() => handleStartBatchProcessing(), 100);
                                            }}
                                            disabled={extractedWords.length === 0 || isProcessingFileWords || !process.env.API_KEY || isCurrentlyGeminiQuotaExhausted}
                                            className="py-2 px-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            <span className="mr-1">🧠</span>
                                            스마트 저장 (상위 20개)
                                        </button>
                                        
                                        <button
                                            onClick={() => {
                                                // 전체 단어 자동 선택 후 배치 처리
                                                setSelectedWords(new Set(extractedWords));
                                                setTimeout(() => handleStartBatchProcessing(), 100);
                                            }}
                                            disabled={extractedWords.length === 0 || isProcessingFileWords || !process.env.API_KEY || isCurrentlyGeminiQuotaExhausted}
                                            className="py-2 px-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            <span className="mr-1">📚</span>
                                            전체 저장 ({extractedWords.length}개)
                                        </button>
                                    </div>
                                    
                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                                            <span>💾 자동 저장: {userSettings.autoSaveExtractedWords ? '활성화' : '비활성화'}</span>
                                            <span>🧠 스마트 필터링: {userSettings.smartWordFiltering ? '활성화' : '비활성화'}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 text-center">
                                            {extractedWords.length > 0 ? (
                                                <>
                                                    예상 소요 시간: 전체 {Math.ceil(extractedWords.length / 10)}분 | 스마트 {Math.ceil(Math.min(20, extractedWords.length) / 10)}분
                                                </>
                                            ) : (
                                                '파일을 업로드하여 단어를 추출하세요'
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleStartBatchProcessing}
                                        disabled={selectedWords.size === 0 || isProcessingFileWords || !process.env.API_KEY || isCurrentlyGeminiQuotaExhausted}
                                        className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <span className="mr-2">🚀</span>
                                        {isProcessingFileWords ? '배치 처리 중...' : `선택된 ${selectedWords.size}개 단어 AI 처리 시작`}
                                    </button>
                                    
                                    <button
                                        onClick={handleGenerateFileSummary}
                                        disabled={!extractedText || isFetchingSummary || !process.env.API_KEY || isProcessingFileWords || isCurrentlyGeminiQuotaExhausted}
                                        className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <span className="mr-2">📑</span>
                                        {isFetchingSummary ? '요약 생성 중...' : 'AI 텍스트 요약'}
                                    </button>
                                </div>
                                
                                {(!process.env.API_KEY || isCurrentlyGeminiQuotaExhausted) && (
                                    <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-200 text-xs text-center">
                                        {!process.env.API_KEY ? '⚠️ API 키가 필요합니다' : '⚠️ API 할당량이 소진되었습니다'}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* AI 텍스트 요약 */}
                    {fileSummary && (
                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30">
                            <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center">
                                <span className="mr-2">🤖</span>
                                AI 텍스트 요약
                            </h3>
                            <div className="bg-slate-800/50 p-3 rounded text-slate-200 text-sm leading-relaxed">
                                {fileSummary}
                            </div>
                        </div>
                    )}

                    {/* 텍스트 미리보기 */}
                    {extractedText && (
                        <div className="bg-slate-700 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-slate-300 mb-3">📄 추출된 텍스트 미리보기</h3>
                            <textarea 
                                value={extractedText.substring(0, 800) + (extractedText.length > 800 ? "\n\n... (전체 내용이 더 있습니다)" : "")} 
                                readOnly 
                                rows={6} 
                                className="w-full p-3 bg-slate-800 text-slate-300 rounded-md text-xs font-mono leading-relaxed resize-none"
                            />
                        </div>
                    )}

                    {/* 처리 로그 */}
                    {processingLog.length > 0 && (
                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-300 mb-3 flex items-center">
                                <span className="mr-2">📋</span>
                                처리 로그
                            </h3>
                            <div className="max-h-60 overflow-y-auto space-y-1">
                                {processingLog.map((log, index) => (
                                    <div 
                                        key={index} 
                                        className={`p-2 rounded text-sm font-mono ${
                                            log.startsWith('❌') ? 'bg-red-500/20 text-red-300' :
                                            log.startsWith('✅') ? 'bg-green-500/20 text-green-300' :
                                            log.startsWith('🚀') || log.startsWith('🔄') ? 'bg-blue-500/20 text-blue-300' :
                                            log.startsWith('📊') ? 'bg-yellow-500/20 text-yellow-300' :
                                            'bg-slate-700 text-slate-300'
                                        }`}
                                    >
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Main App Component ---
// Flashcards Screen Component
interface FlashcardsScreenProps extends ScreenProps {
    words: Word[];
    wordStats: Record<string | number, WordStat>;
    updateWordStat: (wordId: string | number, newStat: Partial<Omit<WordStat, 'id'>>) => void;
}

const FlashcardsScreen: React.FC<FlashcardsScreenProps> = ({ userSettings, onNavigate, words, wordStats, updateWordStat, addToast }) => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [studyMode, setStudyMode] = useState<'all' | 'review' | 'new'>('review');
    const [showAnswer, setShowAnswer] = useState(false);
    const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(userSettings.autoPlayAudio);

    // 학습 모드에 따른 단어 필터링
    const filteredWords = useMemo(() => {
        const userGradeWords = words.filter(word => word.gradeLevel === userSettings.grade);
        
        switch (studyMode) {
            case 'new':
                return userGradeWords.filter(word => {
                    const stat = wordStats[word.id];
                    return !stat || stat.srsLevel === 0;
                });
            case 'review':
                return getWordsForReview(userGradeWords, wordStats);
            case 'all':
            default:
                return userGradeWords;
        }
    }, [words, wordStats, userSettings.grade, studyMode]);

    const currentWord = filteredWords[currentCardIndex];

    // 키보드 단축키
    useKeyboardShortcuts({
        onSpace: () => {
            if (!showAnswer) {
                setShowAnswer(true);
                if (isVoiceEnabled && currentWord) {
                    speak(currentWord.term);
                }
            }
        },
        onEnter: () => {
            if (showAnswer) {
                handleCorrect();
            }
        },
        onArrowLeft: () => {
            if (showAnswer) {
                handleIncorrect();
            } else {
                handlePreviousCard();
            }
        },
        onArrowRight: () => {
            if (showAnswer) {
                handleCorrect();
            } else {
                handleNextCard();
            }
        },
        onEscape: () => onNavigate('dashboard')
    });

    const handleCardFlip = () => {
        setIsFlipped(!isFlipped);
        if (!showAnswer) {
            setShowAnswer(true);
            if (isVoiceEnabled && currentWord) {
                speak(currentWord.term);
            }
        }
    };

    const handleCorrect = () => {
        if (!currentWord) return;
        
        const currentStat = wordStats[currentWord.id] || getDefaultWordStat(currentWord.id);
        const updatedStat = updateSrsData(currentStat, true, 3, 4);
        updateWordStat(currentWord.id, updatedStat);
        
        setSessionStats(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
        playSound('correct', userSettings.soundEnabled);
        
        nextCard();
    };

    const handleIncorrect = () => {
        if (!currentWord) return;
        
        const currentStat = wordStats[currentWord.id] || getDefaultWordStat(currentWord.id);
        const updatedStat = updateSrsData(currentStat, false, 5, 2);
        updateWordStat(currentWord.id, updatedStat);
        
        setSessionStats(prev => ({ correct: prev.correct, total: prev.total + 1 }));
        playSound('incorrect', userSettings.soundEnabled);
        
        nextCard();
    };

    const nextCard = () => {
        if (currentCardIndex < filteredWords.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else {
            // 세션 완료
            const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / (sessionStats.total + 1)) * 100) : 0;
            addToast(`플래시카드 세션 완료! 정확도: ${accuracy}%`, 'success');
            playSound('complete', userSettings.soundEnabled);
            onNavigate('dashboard');
        }
        setShowAnswer(false);
        setIsFlipped(false);
    };

    const handleNextCard = () => {
        if (currentCardIndex < filteredWords.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setShowAnswer(false);
            setIsFlipped(false);
        }
    };

    const handlePreviousCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
            setShowAnswer(false);
            setIsFlipped(false);
        }
    };

    if (filteredWords.length === 0) {
        return (
            <div className="p-6 sm:p-8 bg-slate-800 min-h-screen">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📸</div>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">플래시카드 학습</h2>
                        <p className="text-slate-300 mb-6">
                            {studyMode === 'review' ? '복습할 단어가 없습니다.' : 
                             studyMode === 'new' ? '새로운 단어가 없습니다.' : 
                             '학습할 단어가 없습니다.'}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setStudyMode('all')}
                                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white transition-colors"
                            >
                                전체 단어 학습
                            </button>
                            <button
                                onClick={() => onNavigate('dashboard')}
                                className="px-6 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition-colors"
                            >
                                대시보드로
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 bg-slate-800 min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-cyan-400 mb-2">📸 플래시카드 학습</h1>
                        <p className="text-slate-300">
                            {currentCardIndex + 1} / {filteredWords.length} 
                            {sessionStats.total > 0 && (
                                <span className="ml-4">
                                    정확도: {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
                                </span>
                            )}
                        </p>
                    </div>
                    
                    {/* 학습 모드 선택 */}
                    <div className="flex gap-2">
                        <select
                            value={studyMode}
                            onChange={(e) => {
                                setStudyMode(e.target.value as any);
                                setCurrentCardIndex(0);
                                setShowAnswer(false);
                                setIsFlipped(false);
                            }}
                            className="px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="review">복습 단어</option>
                            <option value="new">새 단어</option>
                            <option value="all">전체 단어</option>
                        </select>
                        
                        <button
                            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                            className={`px-3 py-2 rounded transition-colors ${
                                isVoiceEnabled 
                                    ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
                                    : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                            }`}
                            title="음성 자동 재생"
                        >
                            🔊
                        </button>
                    </div>
                </div>

                {/* 진도 바 */}
                <div className="w-full bg-slate-700 rounded-full h-3 mb-8">
                    <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${((currentCardIndex + 1) / filteredWords.length) * 100}%` }}
                    ></div>
                </div>

                {/* 플래시카드 */}
                <div className="flex justify-center mb-8">
                    <div 
                        className={`relative w-full max-w-lg h-80 cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
                            isFlipped ? 'rotate-y-180' : ''
                        }`}
                        onClick={handleCardFlip}
                        style={{ perspective: '1000px' }}
                    >
                        {/* 앞면 (단어) */}
                        <div className={`absolute inset-0 w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-2xl border border-slate-600 flex flex-col justify-center items-center p-8 backface-hidden ${
                            isFlipped ? 'opacity-0' : 'opacity-100'
                        } transition-opacity duration-300`}>
                            <div className="text-center">
                                <h2 className="text-4xl font-bold text-white mb-4">{currentWord?.term}</h2>
                                {currentWord?.pronunciation && (
                                    <p className="text-xl text-cyan-300 mb-4">[{currentWord.pronunciation}]</p>
                                )}
                                <p className="text-slate-400 text-lg mb-6">{currentWord?.partOfSpeech}</p>
                                
                                {!showAnswer && (
                                    <div className="text-center">
                                        <p className="text-slate-300 mb-4">카드를 클릭하거나 스페이스바를 눌러 답을 확인하세요</p>
                                        <div className="animate-bounce text-2xl">👆</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 뒷면 (의미 & 예문) */}
                        <div className={`absolute inset-0 w-full h-full bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl shadow-2xl border border-cyan-500 flex flex-col justify-center items-center p-8 backface-hidden rotate-y-180 ${
                            showAnswer ? 'opacity-100' : 'opacity-0'
                        } transition-opacity duration-300`}>
                            <div className="text-center text-white">
                                <h3 className="text-2xl font-bold mb-4">{currentWord?.meaning}</h3>
                                <div className="border-t border-cyan-300 pt-4 mt-4">
                                    <p className="text-lg mb-2 italic">"{currentWord?.exampleSentence}"</p>
                                    {currentWord?.exampleSentenceMeaning && (
                                        <p className="text-cyan-100">"{currentWord.exampleSentenceMeaning}"</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 컨트롤 버튼 */}
                {showAnswer && (
                    <div className="flex justify-center gap-4 mb-6">
                        <button
                            onClick={handleIncorrect}
                            className="px-8 py-4 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors shadow-lg"
                        >
                            ❌ 틀렸어요
                        </button>
                        <button
                            onClick={handleCorrect}
                            className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transition-colors shadow-lg"
                        >
                            ✅ 맞았어요
                        </button>
                    </div>
                )}

                {/* 내비게이션 버튼 */}
                <div className="flex justify-between">
                    <button
                        onClick={handlePreviousCard}
                        disabled={currentCardIndex === 0}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white transition-colors"
                    >
                        ← 이전
                    </button>
                    
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-white transition-colors"
                    >
                        종료
                    </button>
                    
                    <button
                        onClick={handleNextCard}
                        disabled={currentCardIndex === filteredWords.length - 1}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white transition-colors"
                    >
                        다음 →
                    </button>
                </div>

                {/* 키보드 단축키 안내 */}
                <div className="mt-8 p-4 bg-slate-700 rounded-lg">
                    <h4 className="text-lg font-semibold text-cyan-300 mb-2">⌨️ 키보드 단축키</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                        <div><kbd className="bg-slate-600 px-2 py-1 rounded">스페이스</kbd> 답 보기</div>
                        <div><kbd className="bg-slate-600 px-2 py-1 rounded">엔터</kbd> 정답</div>
                        <div><kbd className="bg-slate-600 px-2 py-1 rounded">←</kbd> 오답 (답 보기 후)</div>
                        <div><kbd className="bg-slate-600 px-2 py-1 rounded">→</kbd> 정답 (답 보기 후)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// App Component
const App: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<AppScreen>('loginSetup');
    const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
    const [myWords, setMyWords] = useState<Word[]>(() => {
        const savedWords = localStorage.getItem('myWords');
        return savedWords ? JSON.parse(savedWords) : [];
    });
     const [wordStats, setWordStats] = useState<Record<string | number, WordStat>>(() => {
        const savedStats = localStorage.getItem('wordStats');
        return savedStats ? JSON.parse(savedStats) : {};
    });

    const [learnedWordsTodayCount, setLearnedWordsTodayCount] = useState<number>(0);

    const [learnedWordsHistory, setLearnedWordsHistory] = useState<{date: string, count: number}[]>(() => {
        const saved = localStorage.getItem('learnedWordsHistory');
        return saved ? JSON.parse(saved) : [];
    });
    const [quizHistory, setQuizHistory] = useState<{date: string, score: number, total: number, incorrectWords: Word[]}[]>(() => {
        const saved = localStorage.getItem('quizHistory');
        return saved ? JSON.parse(saved) : [];
    });

    const [isGlobalLoading, setGlobalLoading] = useState(false);
    const toastsContext = useContext(ToastContext); 

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // v2.8.0: 글로벌 인스턴스 초기화
    useEffect(() => {
        initializeGlobalInstances();
    }, []);

    useEffect(() => {
        setWordStats(prevStats => {
            const newStats = {...prevStats};
            let changed = false;
            sampleWords.forEach(word => {
                if (!newStats[word.id]) {
                    newStats[word.id] = getDefaultWordStat(word.id);
                    changed = true;
                }
            });
            myWords.forEach(word => {
                 if (!newStats[word.id]) {
                    newStats[word.id] = getDefaultWordStat(word.id);
                    changed = true;
                }
            });
            return changed ? newStats : prevStats;
        });
    }, [myWords]); 


    useEffect(() => {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            setUserSettings(JSON.parse(savedSettings));
            setCurrentScreen('dashboard'); 
        }
    }, []);

    useEffect(() => {
        if (userSettings) {
            localStorage.setItem('userSettings', JSON.stringify(userSettings));
            const today = getTodayDateString();
            let count = 0;
            Object.values(wordStats).forEach(stat => {
                const word = sampleWords.find(w => w.id === stat.id) || myWords.find(w => w.id === stat.id);
                if (word && userSettings && word.gradeLevel === userSettings.grade && stat.lastReviewed?.startsWith(today)) {
                    count++;
                }
            });
            setLearnedWordsTodayCount(count);
        }
    }, [userSettings, wordStats, myWords]);

    useEffect(() => {
        localStorage.setItem('myWords', JSON.stringify(myWords));
    }, [myWords]);

    useEffect(() => {
        localStorage.setItem('wordStats', JSON.stringify(wordStats));
    }, [wordStats]);
    
    useEffect(() => { 
        const today = getTodayDateString();
        const currentDailyLearned = learnedWordsTodayCount;
        setLearnedWordsHistory(prevHistory => {
            const todayEntryIndex = prevHistory.findIndex(e => e.date === today);
            let newHistory = [...prevHistory];
            if (todayEntryIndex > -1) {
                if (newHistory[todayEntryIndex].count !== currentDailyLearned) {
                    newHistory[todayEntryIndex] = { ...newHistory[todayEntryIndex], count: currentDailyLearned };
                } else {
                    return prevHistory; 
                }
            } else if (currentDailyLearned >= 0) { // Allow 0 count to be recorded if it's a new day
                newHistory.push({ date: today, count: currentDailyLearned });
            } else {
                 return prevHistory; 
            }
            localStorage.setItem('learnedWordsHistory', JSON.stringify(newHistory));
            return newHistory;
        });
    }, [learnedWordsTodayCount]); 

    useEffect(() => {
        localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
    }, [quizHistory]);

    const updateWordStat = useCallback((wordId: string | number, newStatData: Partial<Omit<WordStat, 'id'>>) => {
        setWordStats(prev => ({
            ...prev,
            [wordId]: {
                ...(prev[wordId] || getDefaultWordStat(wordId)),
                ...newStatData,
            }
        }));
    }, []);


    const handleSetupComplete = (settings: UserSettings) => {
        setUserSettings(settings);
        applyTheme(settings.theme);
        setCurrentScreen('dashboard');
        setLearnedWordsTodayCount(0); 
    };

    const handleSaveSettings = (newSettings: UserSettings) => {
        if (!toastsContext) return;
        setUserSettings(newSettings);
        applyTheme(newSettings.theme);
        setIsSettingsModalOpen(false);
        toastsContext.addToast("설정이 성공적으로 저장되었습니다.", "success");
        // Recalculate learned words for today as grade might have changed
         const today = getTodayDateString();
            let count = 0;
            Object.values(wordStats).forEach(stat => {
                const word = sampleWords.find(w => w.id === stat.id) || myWords.find(w => w.id === stat.id);
                // Use newSettings.grade for this immediate recalculation
                if (word && newSettings && word.gradeLevel === newSettings.grade && stat.lastReviewed?.startsWith(today)) {
                    count++;
                }
            });
        setLearnedWordsTodayCount(count);
    };

    const handleNavigate = useCallback((screen: AppScreen, params?: any) => {
        setCurrentScreen(screen);
    }, []); 
    
    const combinedAllWords = useMemo(() => {
        const myWordIds = new Set(myWords.map(w => w.id));
        const uniqueSampleWords = sampleWords.filter(sw => !myWords.some(myW => myW.term.toLowerCase() === sw.term.toLowerCase() && myW.id !== sw.id));
        const combined = [...uniqueSampleWords.filter(sw => !myWordIds.has(sw.id)), ...myWords];
        return combined.sort((a,b) => a.term.localeCompare(b.term));
    }, [myWords]);

    const handleWordLearned = useCallback((wordId: string | number, isQuickReview: boolean = false) => {
        const today = getTodayDateString();
        const currentStatBeforeUpdate = wordStats[wordId] || getDefaultWordStat(wordId);
        updateWordStat(wordId, { lastReviewed: today });
        
        if (!isQuickReview && userSettings) {
             const word = combinedAllWords.find(w => w.id === wordId);
             if(word && word.gradeLevel === userSettings.grade) {
                // Only increment if it wasn't already reviewed today for the *current* user settings grade
                if (!currentStatBeforeUpdate.lastReviewed || !currentStatBeforeUpdate.lastReviewed.startsWith(today)) { 
                     setLearnedWordsTodayCount(prev => prev + 1);
                }
             }
        }
    }, [updateWordStat, combinedAllWords, userSettings, wordStats]);
    
    const handleQuizComplete = useCallback((score: number, totalQuestions: number, incorrectWordsDetailed: Word[]) => {
        const today = getTodayDateString();
        setQuizHistory(prev => [...prev, { date: today, score, total: totalQuestions, incorrectWords: incorrectWordsDetailed }]);
    }, []); 

    const saveCustomWord = useCallback(async (wordData: Partial<Word>, gradeLevelForNew?: string): Promise<boolean> => {
        if (!toastsContext) return false; 
        const term = wordData.term?.trim();
        if (!term) {
            toastsContext.addToast("단어는 필수입니다.", "warning");
            return false;
        }
    
        let { meaning, partOfSpeech, exampleSentence, exampleSentenceMeaning, pronunciation } = wordData;
        const isNewWord = !wordData.id; 
        const editingExistingCustomWord = wordData.id && myWords.some(w => w.id === wordData.id);
    
        const conflictingWord = combinedAllWords.find(w => w.term.toLowerCase() === term.toLowerCase() && w.id !== wordData.id);
        if (conflictingWord) {
            toastsContext.addToast(`단어 '${term}'은(는) 이미 목록에 다른 ID로 존재합니다. ('${conflictingWord.term}', ID: ${conflictingWord.id})`, "error");
            return false;
        }
        
        const needsAIDetails = process.env.API_KEY && (!meaning || !partOfSpeech || !exampleSentence);
    
        if (needsAIDetails) {
            if (isCurrentlyGeminiQuotaExhausted) {
                toastsContext.addToast(`Gemini API 할당량이 소진되어 '${term}'에 대한 AI 정보 조회를 할 수 없습니다. 수동으로 입력해주세요.`, "warning");
            } else {
                console.log(`Attempting AI fetch for "${term}" as some fields are missing or it's a new word with AI assist.`);
                const aiDetails = await generateWordDetailsWithGemini(term, toastsContext.addToast, setGlobalLoading); 
                if (aiDetails) {
                    wordData.term = aiDetails.term || term; 
                    pronunciation = aiDetails.pronunciation || pronunciation;
                    meaning = aiDetails.meaning || meaning;
                    partOfSpeech = aiDetails.partOfSpeech || partOfSpeech;
                    exampleSentence = aiDetails.exampleSentence || exampleSentence;
                    exampleSentenceMeaning = aiDetails.exampleSentenceMeaning || exampleSentenceMeaning;
                } else if (isNewWord || (!meaning || !partOfSpeech || !exampleSentence)) {
                     if(!isCurrentlyGeminiQuotaExhausted) return false; 
                }
            }
        }
    
        if (!meaning || !partOfSpeech || !exampleSentence) {
            toastsContext.addToast(`단어 '${wordData.term}' ${isNewWord ? '추가' : '수정'} 실패: 뜻, 품사, 예문은 필수입니다. AI로 정보 가져오기를 시도했으나 실패했거나, 할당량 소진으로 건너뛰었습니다. 수동으로 모든 필수 정보를 입력해주세요.`, "error");
            return false;
        }
    
        if (isNewWord) {
            const newWordEntry: Word = {
                id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                term: wordData.term!,
                pronunciation,
                partOfSpeech: partOfSpeech!,
                meaning: meaning!,
                exampleSentence: exampleSentence!,
                exampleSentenceMeaning,
                gradeLevel: gradeLevelForNew || userSettings?.grade || 'middle1',
                isCustom: true,
            };
            setMyWords(prev => [...prev.filter(w => w.term.toLowerCase() !== newWordEntry.term.toLowerCase()), newWordEntry]);
            updateWordStat(newWordEntry.id, getDefaultWordStat(newWordEntry.id)); 
            toastsContext.addToast(`'${newWordEntry.term}' 단어가 추가되었습니다.`, "success");
        } else if (editingExistingCustomWord) { 
            setMyWords(prevMyWords => prevMyWords.map(w => 
                w.id === wordData.id 
                ? { ...w, ...wordData, term: wordData.term!, meaning: meaning!, partOfSpeech: partOfSpeech!, exampleSentence: exampleSentence!, exampleSentenceMeaning, pronunciation, gradeLevel: wordData.gradeLevel || w.gradeLevel } as Word 
                : w
            ));
            if (!wordStats[wordData.id!]) updateWordStat(wordData.id!, getDefaultWordStat(wordData.id!));
            toastsContext.addToast(`'${wordData.term}' 단어가 수정되었습니다.`, "success");
        } else {
            console.warn("Attempted to save non-custom word or non-existent word through saveCustomWord:", wordData);
            toastsContext.addToast("단어 저장 중 내부 오류가 발생했습니다.", "error");
            return false;
        }
        return true;
    }, [combinedAllWords, myWords, userSettings, updateWordStat, wordStats, toastsContext, setGlobalLoading]); 
    

    const deleteCustomWord = useCallback((wordId: number | string) => {
        if (!toastsContext) return;
        setMyWords(prev => prev.filter(word => word.id !== wordId));
        setWordStats(prev => {
            const newStats = {...prev};
            delete newStats[wordId];
            return newStats;
        });
        toastsContext.addToast("단어가 삭제되었습니다.", "success");
    }, [toastsContext]); 
    
    const totalLearnedOverall = learnedWordsHistory.reduce((sum, entry) => sum + entry.count, 0);


    let screenContent;
    if (!toastsContext) { 
        return null; 
    }

    const screenPropsBase = {
        onNavigate: handleNavigate,
        addToast: toastsContext.addToast,
        setGlobalLoading: setGlobalLoading,
        openSettingsModal: () => setIsSettingsModalOpen(true),
    };


    if (!userSettings) {
        screenContent = <LoginSetupScreen {...screenPropsBase} onSetupComplete={handleSetupComplete} />;
    } else {
        const fullScreenProps: ScreenProps = {
            ...screenPropsBase,
            userSettings: userSettings,
            currentScreen: currentScreen,
        };
        switch (currentScreen) {
            case 'dashboard':
                screenContent = <DashboardScreen {...fullScreenProps} myWords={myWords} learnedWordsToday={learnedWordsTodayCount} totalWordsLearned={totalLearnedOverall}/>;
                break;
            case 'learnWords':
                screenContent = <LearnWordsScreen {...fullScreenProps} words={combinedAllWords} wordStats={wordStats} onWordLearned={handleWordLearned} />;
                break;
            case 'quiz':
                screenContent = <QuizScreen {...fullScreenProps} words={combinedAllWords} wordStats={wordStats} onQuizComplete={handleQuizComplete} updateWordStat={updateWordStat} />;
                break;
            case 'allWords':
                screenContent = <AllWordsScreen {...fullScreenProps} allWords={combinedAllWords} wordStats={wordStats} onDeleteCustomWord={deleteCustomWord} onSaveCustomWord={saveCustomWord} updateWordStat={updateWordStat}/>;
                break;
            case 'stats':
                screenContent = <StatsScreen {...fullScreenProps} learnedWordsHistory={learnedWordsHistory} quizHistory={quizHistory} allWords={combinedAllWords} wordStats={wordStats}/>;
                break;
            case 'flashcards':
                screenContent = <FlashcardsScreen {...fullScreenProps} words={combinedAllWords} wordStats={wordStats} updateWordStat={updateWordStat} />;
                break;
            case 'manageWords':
                screenContent = <ManageWordsScreen 
                                    {...fullScreenProps}
                                    myWords={myWords} 
                                    allWords={combinedAllWords} 
                                    wordStats={wordStats}
                                    onSaveCustomWord={saveCustomWord}
                                    onDeleteCustomWord={deleteCustomWord}
                                    updateWordStat={updateWordStat}
                                />;
                break;
            default:
                screenContent = <DashboardScreen {...fullScreenProps} myWords={myWords} learnedWordsToday={learnedWordsTodayCount} totalWordsLearned={totalLearnedOverall} />;
        }
    }

    return (
        <>
            {userSettings && <NavBar currentScreen={currentScreen} onNavigate={handleNavigate} userSettings={userSettings} onOpenSettings={() => setIsSettingsModalOpen(true)}/>}
            {userSettings && isSettingsModalOpen && 
                <EditSettingsModal 
                    isOpen={isSettingsModalOpen} 
                    currentSettings={userSettings} 
                    onSave={handleSaveSettings} 
                    onCancel={() => setIsSettingsModalOpen(false)}
                    addToast={toastsContext.addToast}
                />
            }
            <GlobalSpinner isLoading={isGlobalLoading} />
            <main className={`flex-grow overflow-y-auto ${!userSettings ? 'h-screen' : ''}`}>
                {screenContent}
            </main>
        </>
    );
};

const RootApp = () => (
    <ToastProvider>
        <App />
    </ToastProvider>
);

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        // <React.StrictMode> enable if needed for development checks
            <RootApp />
        // </React.StrictMode>
    );
}
