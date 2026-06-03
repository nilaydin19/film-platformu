import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Film, 
  Mail, 
  Lock, 
  ShieldAlert, 
  Globe, 
  CreditCard, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  ArrowLeft 
} from 'lucide-react';

const localTranslations = {
  tr: {
    splashSubtitle: "Sınırsız Sinema, Küratör Seçimleri",
    welcome: "KINOIA MAX'e Hoş Geldiniz",
    slogan: "Sınırları Aşan Sinema Deneyimi",
    subtitle: "Sıra dışı hikayelerin, büyüleyici görselliğin ve seçkin kürasyonun buluştuğu eşsiz dijital sinema evreni.",
    trialBtn: "30 Gün Ücretsiz Deneme Başlat",
    loginLink: "Zaten bir hesabınız var mı? Giriş Yapın",
    loginTitle: "Kinoia Hesabınıza Giriş Yapın",
    emailLabel: "E-POSTA ADRESİ",
    passwordLabel: "ŞİFRE",
    grantAdmin: "Yönetici Yetkisi Ver (Geliştirici Modu)",
    loginBtn: "Giriş Yap",
    registerTitle: "Hesap Oluşturun",
    registerSubtitle: "Deneme sürecinizi başlatmak için e-posta ve şifre belirleyin.",
    nextStep: "Devam Et",
    cancel: "Vazgeç",
    back: "Geri Dön",
    choosePlan: "Paketinizi Seçin",
    choosePlanSubtitle: "İlk 30 gün tamamen ücretsiz. İstediğiniz zaman iptal edebilirsiniz.",
    basePlan: "Kinoia Standart (SD)",
    basePrice: "99 TL / Ay",
    baseDesc: "Tek ekranda SD çözünürlük ile bütçe dostu sinema keyfi.",
    premiumPlan: "Kinoia Premium (HD)",
    premiumPrice: "149 TL / Ay",
    premiumDesc: "İki ekranda Full HD kalitesi, özel küratör odaları ve X-Ray desteği.",
    maxPlan: "Kinoia Max Family (4K)",
    maxPrice: "199 TL / Ay",
    maxDesc: "Dört ekranda 4K HDR yayın, sınırsız çocuk profili ve premium küratör desteği.",
    popularBadge: "En Çok Tercih Edilen",
    featuresTitle: "Paket Özellikleri",
    checkoutBtn: "Ödeme Adımına Geç",
    paymentTitle: "Sanal 3D Kredi Kartı Ödemesi",
    paymentSubtitle: "30 Günlük ücretsiz deneme için kredi kartı doğrulama simülasyonu.",
    cardNoPlaceholder: "KART NUMARASI",
    cardHolderPlaceholder: "KART SAHİBİ",
    expiryPlaceholder: "AA/YY",
    cvvPlaceholder: "CVV",
    termsText: "Kinoia platformunun Kullanım Koşulları ve Gizlilik Sözleşmesini okudum ve kabul ediyorum.",
    readTerms: "Sözleşmeyi Oku",
    submitPayment: "Ödemeyi Tamamla ve Üyeliği Başlat",
    submitting: "Hesabınız Oluşturuluyor...",
    successTitle: "Aboneliğiniz Başarıyla Aktifleştirildi!",
    successDesc: "Tebrikler! KINOIA MAX dünyasına hoş geldiniz. Harika hikayeler sizi bekliyor.",
    startStreaming: "Sinemaya Başla",
    privacyTitle: "Gizlilik Koşulları ve Kullanım Sözleşmesi",
    privacyContent: `Bu Gizlilik Koşulları ve Kullanım Sözleşmesi ("Sözleşme"), KINOIA MAX platformuna üye olan tüm kullanıcılar ile KINOIA MAX yönetim ekibi arasında akdedilmiştir.

1. ABONELİK VE HİZMET ŞARTLARI
- Üyeler, platformda sunulan 30 günlük ücretsiz deneme süresini başlatırken sanal 3D ödeme doğrulama simülasyonundan geçerler. Bu süreçte gerçek bir çekim yapılmaz.
- Deneme süresinin ardından, seçilen pakete göre (Standart 99 TL/Ay, Premium 149 TL/Ay, Max Family 199 TL/Ay) aylık otomatik yenileme devreye girer. İstediğiniz an ayarlar panelinden aboneliğinizi sonlandırabilirsiniz.

2. KULLANICI HESAPLARI VE GİZLİLİK
- Her üye kendi şifre güvenliğinden sorumludur.
- Çoklu profil sistemi üzerinden izleyicilerin yaş sınırlarına uygun (+16 veya +18 filtrelemeleri gibi) içerikler sunulması hedeflenir. Çocuk profillerinde sadece çizgi film ve çocuk animasyonları görüntülenir.
- Kişisel verileriniz ve izleme geçmişiniz, gizlilik koruma kanunlarına tam uygun olarak korunmaktadır. Reklam veya üçüncü taraflarla paylaşılmaz.

3. FİKRİ MÜLKİYET
- KINOIA platformunda yer alan tüm videolar, görseller, küratör notları ve X-Ray verileri telif hakkı koruması altındadır. Ticari amaçla çoğaltılamaz ve dağıtılamaz.

KINOIA MAX ekibini tercih ettiğiniz için teşekkür eder, keyifli seyirler dileriz!`,
    cardFrontHolder: "KART SAHİBİ",
    cardFrontExpires: "SON KUL."
  },
  en: {
    splashSubtitle: "Unlimited Cinema, Curated Rooms",
    welcome: "Welcome to KINOIA MAX",
    slogan: "A Cinema Experience Beyond Boundaries",
    subtitle: "The ultimate digital cinema universe where extraordinary stories, stunning visuals, and elite curation meet.",
    trialBtn: "Start 30-Day Free Trial",
    loginLink: "Already have an account? Sign In",
    loginTitle: "Log In to Your Kinoia Account",
    emailLabel: "EMAIL ADDRESS",
    passwordLabel: "PASSWORD",
    grantAdmin: "Grant Admin Authority (Developer Mode)",
    loginBtn: "Sign In",
    registerTitle: "Create Your Account",
    registerSubtitle: "Choose an email and password to begin your free trial.",
    nextStep: "Continue",
    cancel: "Cancel",
    back: "Back",
    choosePlan: "Select Your Plan",
    choosePlanSubtitle: "First 30 days are completely free. Cancel anytime.",
    basePlan: "Kinoia Standard (SD)",
    basePrice: "99 TL / Month",
    baseDesc: "Budget-friendly cinema in standard resolution on 1 screen.",
    premiumPlan: "Kinoia Premium (HD)",
    premiumPrice: "149 TL / Month",
    premiumDesc: "Full HD quality on 2 screens, custom Curator rooms, and X-Ray support.",
    maxPlan: "Kinoia Max Family (4K)",
    maxPrice: "199 TL / Month",
    maxDesc: "4K HDR resolution on 4 screens, unlimited Kids profiles, and premium Curation.",
    popularBadge: "Most Popular",
    featuresTitle: "Plan Features",
    checkoutBtn: "Proceed to Payment",
    paymentTitle: "Simulated 3D Credit Card Payment",
    paymentSubtitle: "Secure credit card verification simulation for your 30-day free trial.",
    cardNoPlaceholder: "CARD NUMBER",
    cardHolderPlaceholder: "CARD HOLDER",
    expiryPlaceholder: "MM/YY",
    cvvPlaceholder: "CVV",
    termsText: "I have read and agree to Kinoia's Terms of Use and Privacy Policy.",
    readTerms: "Read Agreement",
    submitPayment: "Complete Checkout & Start Trial",
    submitting: "Creating Your Account...",
    successTitle: "Subscription Successfully Activated!",
    successDesc: "Congratulations! Welcome to KINOIA MAX. Amazing stories await you.",
    startStreaming: "Start Streaming",
    privacyTitle: "Privacy Policy and Terms of Service",
    privacyContent: `This Privacy Policy and Terms of Service ("Agreement") governs the subscription and usage of KINOIA MAX between the registered users and KINOIA MAX Team.

1. SUBSCRIPTION AND SERVICE TERMS
- Users are prompted to undergo a 3D payment verification simulation to start their 30-day free trial. No actual money is processed.
- Post-trial, automatic renewal launches based on the tier (Standard 99 TL, Premium 149 TL, Max Family 199 TL). Users can cancel at any time.

2. SECURITY & PRIVACY
- Members are solely responsible for password security.
- Profile filtering ensures mature (+16/+18) limits. Kid profiles only present cartoons and animations.
- All personal data, watch records, and ratings are strictly private and never shared with third parties.

3. COPYRIGHTS
- All streaming materials, media titles, director logs, and X-Ray details are copyright-protected. Commercial duplication is prohibited.

Thank you for choosing KINOIA MAX. Have a great cinema time!`,
    cardFrontHolder: "CARD HOLDER",
    cardFrontExpires: "EXPIRES"
  },
  ru: {
    splashSubtitle: "Безлимитное Кино, Кураторские Выборы",
    welcome: "Добро пожаловать в KINOIA MAX",
    slogan: "Кинематографический опыт без границ",
    subtitle: "Уникальная вселенная цифрового кино, где встречаются необычные истории, захватывающие визуальные эффекты и элитное кураторство.",
    trialBtn: "Начать 30-дневную бесплатную пробную версию",
    loginLink: "Уже есть аккаунт? Войти",
    loginTitle: "Войти в аккаунт Kinoia",
    emailLabel: "ЭЛЕКТРОННАЯ ПОЧТА",
    passwordLabel: "ПАРОЛЬ",
    grantAdmin: "Предоставить права админа (для разработчиков)",
    loginBtn: "Войти",
    registerTitle: "Создать аккаунт",
    registerSubtitle: "Укажите почту и пароль для запуска пробного периода.",
    nextStep: "Продолжить",
    cancel: "Отмена",
    back: "Назад",
    choosePlan: "Выберите ваш тариф",
    choosePlanSubtitle: "Первые 30 дней абсолютно бесплатно. Отмена в любое время.",
    basePlan: "Kinoia Стандарт (SD)",
    basePrice: "99 TL / мес",
    baseDesc: "Бюджетный просмотр в стандартном разрешении на 1 экране.",
    premiumPlan: "Kinoia Премиум (HD)",
    premiumPrice: "149 TL / мес",
    premiumDesc: "Качество Full HD на 2 экранах, кураторские комнаты и поддержка X-Ray.",
    maxPlan: "Kinoia Max Семья (4K)",
    maxPrice: "199 TL / мес",
    maxDesc: "Разрешение 4K HDR на 4 экранах, детские профили и премиум кураторы.",
    popularBadge: "Самый популярный",
    featuresTitle: "Особенности плана",
    checkoutBtn: "Перейти к оплате",
    paymentTitle: "Симуляция 3D оплаты картой",
    paymentSubtitle: "Верификация кредитной карты для вашей бесплатной пробной версии.",
    cardNoPlaceholder: "НОМЕР КАРТЫ",
    cardHolderPlaceholder: "ИМЯ ДЕРЖАТЕЛЯ",
    expiryPlaceholder: "ММ/ГГ",
    cvvPlaceholder: "CVV",
    termsText: "Я прочитал и согласен с Условиями использования и Политикой конфиденциальности.",
    readTerms: "Прочитать соглашение",
    submitPayment: "Завершить оплату и запустить",
    submitting: "Создание аккаунта...",
    successTitle: "Подписка успешно активирована!",
    successDesc: "Поздравляем! Добро пожаловать в KINOIA MAX. Вас ждут невероятные истории.",
    startStreaming: "Начать просмотр",
    privacyTitle: "Политика конфиденциальности и условия",
    privacyContent: `Настоящее Соглашение регулирует подписку и использование KINOIA MAX.

1. УСЛОВИЯ ПОДПИСКИ
- Симуляция 3D-оплаты проводится для проверки безопасности, средства с карты не списываются.
- Отменить подписку можно в любой момент в личном кабинете.

2. КОНФИДЕНЦИАЛЬНОСТЬ
- Все пользовательские данные надежно зашифрованы и не подлежат передаче третьим лицам.
- Детские профили содержат только безопасный контент.`,
    cardFrontHolder: "ВЛАДЕЛЕЦ КАРТЫ",
    cardFrontExpires: "СРОК ДЕЙСТВ."
  },
  de: {
    splashSubtitle: "Unbegrenztes Kino, Kuratierte Räume",
    welcome: "Willkommen bei KINOIA MAX",
    slogan: "Kinoerlebnis jenseits aller Grenzen",
    subtitle: "Das ultimative digitale Kinouniversum, in dem außergewöhnliche Geschichten, atemberaubende Bilder und erlesene Kuration aufeinander treffen.",
    trialBtn: "30 Tage kostenlos testen",
    loginLink: "Haben Sie bereits ein Konto? Einloggen",
    loginTitle: "In Ihr Kinoia-Konto einloggen",
    emailLabel: "E-MAIL-ADRESSE",
    passwordLabel: "PASSWORT",
    grantAdmin: "Admin-Rechte gewähren (Entwicklermodus)",
    loginBtn: "Einloggen",
    registerTitle: "Konto erstellen",
    registerSubtitle: "Wählen Sie eine E-Mail und ein Passwort, um die Testversion zu starten.",
    nextStep: "Weiter",
    cancel: "Abbrechen",
    back: "Zurück",
    choosePlan: "Wählen Sie Ihren Tarif",
    choosePlanSubtitle: "Die ersten 30 Tage sind absolut kostenlos. Jederzeit kündbar.",
    basePlan: "Kinoia Standard (SD)",
    basePrice: "99 TL / Monat",
    baseDesc: "Budgetfreundliches Kino in Standardauflösung auf 1 Bildschirm.",
    premiumPlan: "Kinoia Premium (HD)",
    premiumPrice: "149 TL / Monat",
    premiumDesc: "Full HD auf 2 Bildschirmen, eigene Kuratorenräume und X-Ray-Support.",
    maxPlan: "Kinoia Max Family (4K)",
    maxPrice: "199 TL / Monat",
    maxDesc: "4K HDR auf 4 Bildschirmen, unbegrenzte Kinderprofile und Premium-Kuration.",
    popularBadge: "Am Beliebtesten",
    featuresTitle: "Tarifmerkmale",
    checkoutBtn: "Zur Kasse",
    paymentTitle: "Simulierte 3D-Kreditkartenzahlung",
    paymentSubtitle: "Kreditkartenverifizierung zur Freischaltung Ihres kostenlosen Testmonats.",
    cardNoPlaceholder: "KARTENNUMMER",
    cardHolderPlaceholder: "KARTENINHABER",
    expiryPlaceholder: "MM/JJ",
    cvvPlaceholder: "CVV",
    termsText: "Ich habe die Nutzungsbedingungen und Datenschutzrichtlinien von Kinoia gelesen und stimme ihnen zu.",
    readTerms: "Vertrag lesen",
    submitPayment: "Zahlung abschließen & starten",
    submitting: "Konto wird erstellt...",
    successTitle: "Abonnement erfolgreich aktiviert!",
    successDesc: "Herzlichen Glückwunsch! Willkommen bei KINOIA MAX. Tolle Geschichten erwarten Sie.",
    startStreaming: "Streaming Starten",
    privacyTitle: "Datenschutzbestimmungen und Bedingungen",
    privacyContent: `Nutzungsvereinbarung für die KINOIA MAX Streaming-Plattform.

1. MITGLIEDSCHAFT & KÜNDIGUNG
- Die 3D-Kreditkartenverifizierung ist eine Simulation. Es erfolgt keine reale Belastung.
- Die Kündigung ist jederzeit mit wenigen Klicks in Ihren Kontoeinstellungen möglich.

2. DATENSCHUTZ
- Ihre Sehgewohnheiten und persönlichen Daten werden streng vertraulich behandelt und verschlüsselt gesichert.`,
    cardFrontHolder: "KARTENINHABER",
    cardFrontExpires: "GÜLTIG BIS"
  },
  fr: {
    splashSubtitle: "Cinéma Illimité, Salles Sélectionnées",
    welcome: "Bienvenue sur KINOIA MAX",
    slogan: "Une expérience cinématographique sans limites",
    subtitle: "L'univers ultime du cinéma numérique où se rencontrent des histoires extraordinaires, des visuels captivants et une curation d'élite.",
    trialBtn: "Démarrer l'essai gratuit de 30 jours",
    loginLink: "Vous avez déjà un compte ? Se connecter",
    loginTitle: "Se connecter à votre compte Kinoia",
    emailLabel: "ADRESSE E-MAIL",
    passwordLabel: "MOT DE PASSE",
    grantAdmin: "Accorder les privilèges d'administrateur (mode développeur)",
    loginBtn: "Se connecter",
    registerTitle: "Créer un compte",
    registerSubtitle: "Entrez un e-mail et un mot de passe pour commencer votre essai gratuit.",
    nextStep: "Continuer",
    cancel: "Annuler",
    back: "Retour",
    choosePlan: "Sélectionnez votre forfait",
    choosePlanSubtitle: "Les 30 premiers jours sont totalement gratuits. Annulable à tout moment.",
    basePlan: "Kinoia Standard (SD)",
    basePrice: "99 TL / Mois",
    baseDesc: "Cinéma abordable en résolution standard sur 1 écran.",
    premiumPlan: "Kinoia Premium (HD)",
    premiumPrice: "149 TL / Mois",
    premiumDesc: "Qualité Full HD sur 2 écrans, salles de conservation exclusives et X-Ray.",
    maxPlan: "Kinoia Max Family (4K)",
    maxPrice: "199 TL / Mois",
    maxDesc: "Résolution 4K HDR sur 4 écrans, profils enfants illimités et curation premium.",
    popularBadge: "Le plus populaire",
    featuresTitle: "Caractéristiques",
    checkoutBtn: "Passer au paiement",
    paymentTitle: "Simulation de paiement 3D",
    paymentSubtitle: "Vérification sécurisée par carte pour débloquer vos 30 jours d'essai gratuit.",
    cardNoPlaceholder: "NUMÉRO DE CARTE",
    cardHolderPlaceholder: "TITULAIRE DE LA CARTE",
    expiryPlaceholder: "MM/AA",
    cvvPlaceholder: "CVV",
    termsText: "J'ai lu et j'accepte les conditions d'utilisation et la politique de confidentialité de Kinoia.",
    readTerms: "Lire le contrat",
    submitPayment: "Finaliser la commande & démarrer",
    submitting: "Création du compte...",
    successTitle: "Abonnement activé avec succès !",
    successDesc: "Félicitations ! Bienvenue sur KINOIA MAX. De superbes histoires vous attendent.",
    startStreaming: "Lancer la lecture",
    privacyTitle: "Conditions d'utilisation et confidentialité",
    privacyContent: `Conditions d'utilisation de KINOIA MAX.

1. ESSAI GRATUIT & CONDITIONS
- La validation 3D Secure est une pure simulation éducative.
- L'abonnement est résiliable sans frais à tout moment dans l'espace client.

2. VIE PRIVÉE
- Vos données sont entièrement cryptées et ne seront jamais partagées avec des tiers.`,
    cardFrontHolder: "TITULAIRE",
    cardFrontExpires: "EXPIRE FIN"
  }
};

const backdropMovies = [
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=300",
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=300",
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=300",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=300",
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300",
  "https://images.unsplash.com/photo-1505664194779-8bebcb95c539?q=80&w=300",
  "https://images.unsplash.com/photo-1560942485-b2a11cc13456?q=80&w=300",
  "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=300",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300",
  "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=300",
  "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=300",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=300"
];

export default function Auth() {
  const { login, register } = useAuth();
  const { language, setLanguage } = useLanguage();
  
  // Splash & Step State
  const [showSplash, setShowSplash] = useState(true);
  const [logoIntroTrigger, setLogoIntroTrigger] = useState(false);
  const [step, setStep] = useState(0); // 0: Landing, 1: Reg Credentials, 2: Choose Plan, 3: 3D Credit Card Payment, 4: Success Screen
  const [isLoginOpen, setIsLoginOpen] = useState(false); // Accordion login

  // Registration & Login inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('premium'); // base, premium, max
  
  // Simulated Credit Card States
  const [cardNo, setCardNo] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardFocused, setCardFocused] = useState(false); // flips card when true
  const [acceptTerms, setAcceptTerms] = useState(false);

  // General App states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const tLocal = (key) => {
    return localTranslations[language]?.[key] || localTranslations['tr']?.[key] || key;
  };

  // 1. Cinematic Web Audio API Sub-bass Synthesizer
  const playIntroSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const gain2 = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc2.type = 'sawtooth';
      
      const now = ctx.currentTime;
      
      // Cinematic sweeping sound (100Hz down to 30Hz sub rumble)
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 1.8);
      
      osc2.frequency.setValueAtTime(100, now);
      osc2.frequency.exponentialRampToValueAtTime(32, now + 1.8);
      
      // Warm lowpass filter to shave off sawtooth harshness
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(130, now);
      filter.Q.setValueAtTime(7, now);
      
      osc.connect(gainNode);
      osc2.connect(filter);
      filter.connect(gain2);
      
      gainNode.connect(ctx.destination);
      gain2.connect(ctx.destination);
      
      // Envelopes
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.85, now + 0.35); // quick sub burst
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
      
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.18, now + 0.3); // warm distortion layer
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
      
      osc.start(now);
      osc2.start(now);
      
      osc.stop(now + 2.5);
      osc2.stop(now + 2.5);
    } catch (err) {
      console.warn("Web Audio synthesis was blocked or not supported:", err);
    }
  };

  // 2. Splash screen duration management & automatic gesture-based sound triggers (Bypasses browser block)
  useEffect(() => {
    setLogoIntroTrigger(true);
    
    let soundPlayed = false;

    const playSoundOnGesture = () => {
      if (!soundPlayed) {
        playIntroSound();
        soundPlayed = true;
      }
      // Clean up listeners immediately after sound plays once
      window.removeEventListener('click', playSoundOnGesture);
      window.removeEventListener('keydown', playSoundOnGesture);
      window.removeEventListener('touchstart', playSoundOnGesture);
    };

    // Play immediately on mount (works in hot-reload or if tab had previous interaction)
    playIntroSound();

    // Set fallback listeners for robust first-interaction audio triggers
    window.addEventListener('click', playSoundOnGesture);
    window.addEventListener('keydown', playSoundOnGesture);
    window.addEventListener('touchstart', playSoundOnGesture);

    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3200);

    return () => {
      clearTimeout(splashTimer);
      window.removeEventListener('click', playSoundOnGesture);
      window.removeEventListener('keydown', playSoundOnGesture);
      window.removeEventListener('touchstart', playSoundOnGesture);
    };
  }, []);

  // Set step 1 upon registration process start
  const handleUserInteractiveStart = () => {
    setStep(1);
  };

  // 3. Login submit handling (Accordion Panel)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || (language === 'tr' ? 'Giriş başarısız oldu.' : 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  // 4. Registration submit handling (Step 3 checkout validation)
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!acceptTerms) {
      setError(language === 'tr' ? 'Lütfen sözleşmeyi onaylayın.' : 'Please agree to the membership contract.');
      return;
    }

    if (cardNo.replace(/\s/g, '').length < 16) {
      setError(language === 'tr' ? 'Lütfen geçerli bir 16 haneli kart numarası girin.' : 'Please enter a valid 16-digit card number.');
      return;
    }

    if (cardExpiry.length < 5) {
      setError(language === 'tr' ? 'Geçersiz son kullanma tarihi.' : 'Invalid expiry date.');
      return;
    }

    if (cardCvv.length < 3) {
      setError(language === 'tr' ? 'Geçersiz CVV kodu.' : 'Invalid CVV code.');
      return;
    }

    setLoading(true);
    try {
      // Complete simulated register
      await register(email, password, 'active', isAdmin ? 'admin' : 'user');
      setStep(4); // transition to success congratulations page
    } catch (err) {
      setError(err.message || (language === 'tr' ? 'Kayıt başarısız oldu.' : 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  // Form input format helpers
  const formatCardNo = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.substring(0, 16);
    const parts = val.match(/.{1,4}/g) || [];
    setCardNo(parts.join(' '));
  };

  const formatExpiry = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length >= 2) {
      setCardExpiry(val.substring(0, 2) + '/' + val.substring(2));
    } else {
      setCardExpiry(val);
    }
  };

  const formatCvv = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    setCardCvv(val);
  };

  // Card Brand Logo helper
  const getCardBrand = () => {
    const raw = cardNo.replace(/\s/g, '');
    if (raw.startsWith('4')) return 'Visa';
    if (raw.startsWith('5')) return 'Mastercard';
    if (raw.startsWith('3')) return 'Amex';
    return 'KinoiaPay';
  };

  // Custom SVG KINOIA MAX Cinematic Neon Icon
  const LogoIcon = ({ className = "w-10 h-10" }) => (
    <svg 
      viewBox="0 0 100 100" 
      className={`${className} text-purple-500 fill-current filter drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]`}
    >
      {/* Outer futuristic shutter lines */}
      <polygon points="10,15 25,10 40,30 20,40" className="opacity-40" />
      <polygon points="90,15 75,10 60,30 80,40" className="opacity-40" />
      {/* Geometric main 'K' made of solid play arrows */}
      <polygon points="30,20 48,20 48,80 30,80" />
      <polygon points="48,50 72,25 85,32 58,56" />
      <polygon points="56,54 82,75 72,83 48,62" />
      {/* Play element glow */}
      <polygon points="52,44 68,50 52,56" className="text-purple-300 opacity-80" />
    </svg>
  );

  // Cinematic Intro Splash View
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#070708] flex flex-col items-center justify-center z-50 overflow-hidden">
        <div className="flex flex-col items-center space-y-6 animate-logo-intro">
          <LogoIcon className="w-28 h-28 text-purple-500 animate-neon-glow rounded-3xl p-1 bg-purple-900/10 border border-purple-500/20" />
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-[0.2em] text-white">
              KINOIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">MAX</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-500 uppercase tracking-[0.3em] font-medium max-w-xs">
              {tLocal('splashSubtitle')}
            </p>
          </div>
        </div>

        {/* Shimmer pulse lines */}
        <div className="absolute bottom-12 w-32 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#070708] text-gray-200 overflow-x-hidden font-sans select-none">
      
      {/* Background Cinematic Movie Collage */}
      <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-6 gap-3 p-3 opacity-20 pointer-events-none select-none overflow-hidden blur-[4px]">
        {backdropMovies.map((url, idx) => (
          <div key={idx} className="aspect-[2/3] rounded-2xl bg-brand-slate overflow-hidden border border-white/5 shadow-2xl">
            <img src={url} alt="" className="w-full h-full object-cover grayscale opacity-60" />
          </div>
        ))}
      </div>
      
      {/* Dark Blur Overlay Mask */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#070708] via-[#070708]/92 to-[#111113]/85 z-0" />

      {/* Global Dil ve Bilgi Seçici Header */}
      <header className="absolute top-6 left-6 right-6 flex justify-between items-center z-30">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStep(0)}>
          <LogoIcon className="w-9 h-9" />
          <span className="text-xl font-black tracking-widest text-white font-sans">
            KINOIA <span className="text-purple-500">MAX</span>
          </span>
        </div>

        {/* Global Language Switcher */}
        <div className="relative flex items-center bg-[#111113]/90 hover:bg-white/5 border border-white/5 rounded-2xl px-4.5 py-2 text-xs text-purple-400 font-bold transition-all shadow-lg cursor-pointer">
          <Globe className="w-4 h-4 mr-2 text-purple-500 animate-spin-slow" />
          <span className="uppercase">{language}</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
            <option value="ru">Русский</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-20 pb-10">
        
        {/* STEP 0: PRIME-STYLE LANDING & ACCORDION LOGIN */}
        {step === 0 && (
          <>
            {/* Left Info Section */}
            <section className="lg:col-span-7 space-y-6 text-left pr-0 lg:pr-8 animate-fade-in">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-black uppercase text-purple-400 tracking-widest shadow-md">
                <Sparkles className="w-3.5 h-3.5" /> Curated Streaming
              </span>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                {tLocal('slogan')}
              </h2>

              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-lg">
                {tLocal('subtitle')}
              </p>

              {/* Big CTA */}
              <div className="pt-4">
                <button 
                  onClick={handleUserInteractiveStart}
                  className="group flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black px-8 py-5 rounded-2xl shadow-xl hover:shadow-purple-500/20 hover:scale-[1.03] active:scale-95 transition-all text-sm uppercase tracking-widest cursor-pointer"
                >
                  {tLocal('trialBtn')}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </section>

            {/* Right Form / Accordion Login Section */}
            <section className="lg:col-span-5 animate-fade-in">
              <div className="glass-panel border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative">
                
                {/* Visual Title inside the Card */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-12 h-12 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-3">
                    <Film className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{tLocal('welcome')}</h3>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Always visible registration/action CTA prompt if not login */}
                {!isLoginOpen ? (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-xs text-gray-400">
                      {language === 'tr' ? 'Hemen ücretsiz deneme başlatın veya mevcut hesabınıza erişin.' : 'Start your free trial today or access your existing account.'}
                    </p>
                    <button 
                      onClick={() => setIsLoginOpen(true)}
                      className="w-full bg-[#111113] hover:bg-white/5 text-purple-400 border border-purple-500/20 hover:border-purple-400/30 font-black py-4.5 rounded-2xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md"
                    >
                      {tLocal('loginBtn')}
                    </button>
                  </div>
                ) : (
                  /* Pürüzsüz Accordion Login Form */
                  <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase text-purple-400 tracking-wider">
                        {tLocal('loginTitle')}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setIsLoginOpen(false)}
                        className="text-xs text-gray-500 hover:text-white cursor-pointer transition-colors"
                      >
                        {tLocal('cancel')}
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 font-bold mb-1.5 block tracking-wider">{tLocal('emailLabel')}</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="email" 
                          required 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@kinoia.com"
                          className="w-full bg-[#070708] text-xs text-gray-200 pl-11 pr-4 py-4 rounded-2xl border border-white/5 focus:outline-none focus:border-purple-500 transition-all font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 font-bold mb-1.5 block tracking-wider">{tLocal('passwordLabel')}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="password" 
                          required 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••"
                          className="w-full bg-[#070708] text-xs text-gray-200 pl-11 pr-4 py-4 rounded-2xl border border-white/5 focus:outline-none focus:border-purple-500 transition-all font-semibold"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4.5 rounded-2xl transition-all cursor-pointer shadow-lg shadow-purple-600/10 text-xs uppercase tracking-widest mt-2"
                    >
                      {loading ? (language === 'tr' ? 'Giriş Yapılıyor...' : 'Signing In...') : tLocal('loginBtn')}
                    </button>
                  </form>
                )}

                {/* Footer terms links */}
                <div className="mt-6 text-center border-t border-white/5 pt-4">
                  <button 
                    onClick={() => setShowPrivacyModal(true)} 
                    className="text-[10px] text-gray-500 hover:text-purple-400 transition-colors uppercase tracking-widest font-black"
                  >
                    {tLocal('readTerms')}
                  </button>
                </div>

              </div>
            </section>
          </>
        )}

        {/* STEP 1: REGISTRATION CREDENTIALS FORM */}
        {step === 1 && (
          <section className="lg:col-span-12 max-w-lg mx-auto w-full animate-fade-in">
            <div className="glass-panel border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setStep(0)} 
                  className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="space-y-1 text-left">
                  <h3 className="text-xl font-bold text-white">{tLocal('registerTitle')}</h3>
                  <p className="text-xs text-gray-400">{tLocal('registerSubtitle')}</p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-5">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold mb-1.5 block tracking-wider">{tLocal('emailLabel')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@kinoia.com"
                      className="w-full bg-[#070708] text-xs text-gray-200 pl-11 pr-4 py-4 rounded-2xl border border-white/5 focus:outline-none focus:border-purple-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold mb-1.5 block tracking-wider">{tLocal('passwordLabel')}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="password" 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full bg-[#070708] text-xs text-gray-200 pl-11 pr-4 py-4 rounded-2xl border border-white/5 focus:outline-none focus:border-purple-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Admin Mode Option */}
                <div 
                  onClick={() => setIsAdmin(!isAdmin)}
                  className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all"
                >
                  <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${isAdmin ? 'bg-purple-600 border-purple-500' : 'border-white/20'}`}>
                    {isAdmin && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-xs text-gray-300 font-bold tracking-wide">{tLocal('grantAdmin')}</span>
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setStep(0)}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-widest transition-all cursor-pointer text-center"
                  >
                    {tLocal('cancel')}
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-2xl transition-all cursor-pointer shadow-lg shadow-purple-600/10 text-xs uppercase tracking-widest"
                  >
                    {tLocal('nextStep')}
                  </button>
                </div>
              </form>

            </div>
          </section>
        )}

        {/* STEP 2: PLAN SELECTOR */}
        {step === 2 && (
          <section className="lg:col-span-12 w-full animate-fade-in space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl md:text-3xl font-black text-white">{tLocal('choosePlan')}</h3>
              <p className="text-xs md:text-sm text-gray-400">{tLocal('choosePlanSubtitle')}</p>
            </div>

            {/* Plan Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              
              {/* Plan 1: Base */}
              <div 
                onClick={() => setSelectedPlan('base')}
                className={`glass-panel rounded-3xl p-6 border transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedPlan === 'base' 
                    ? 'border-purple-500 bg-purple-900/5 shadow-2xl scale-[1.02]' 
                    : 'border-white/5 hover:border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-black text-white">{tLocal('basePlan')}</h4>
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'base' ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/20'}`}>
                      {selectedPlan === 'base' && <Check className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed min-h-[50px]">{tLocal('baseDesc')}</p>
                  <div className="text-2xl font-black text-white">{tLocal('basePrice')}</div>
                </div>

                <div className="border-t border-white/5 pt-4 mt-6 space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> 1 Ekran (1 Screen)</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> SD Çözünürlük (SD)</div>
                  <div className="flex items-center gap-2 text-gray-600"><Check className="w-4 h-4 text-gray-600" /> {language === 'tr' ? 'Küratör Yok' : 'No Curation'}</div>
                </div>
              </div>

              {/* Plan 2: Premium */}
              <div 
                onClick={() => setSelectedPlan('premium')}
                className={`glass-panel rounded-3xl p-6 border transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedPlan === 'premium' 
                    ? 'border-purple-500 bg-purple-900/10 shadow-2xl scale-[1.03] ring-1 ring-purple-500/20' 
                    : 'border-white/5 hover:border-white/10 hover:bg-white/5'
                }`}
              >
                {/* Popular Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-md">
                  {tLocal('popularBadge')}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-black text-white">{tLocal('premiumPlan')}</h4>
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'premium' ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/20'}`}>
                      {selectedPlan === 'premium' && <Check className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed min-h-[50px]">{tLocal('premiumDesc')}</p>
                  <div className="text-2xl font-black text-purple-400">{tLocal('premiumPrice')}</div>
                </div>

                <div className="border-t border-white/5 pt-4 mt-6 space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> 2 Ekran Eşzamanlı</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Full HD (1080p)</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Küratör Odaları</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Amazon Prime X-Ray</div>
                </div>
              </div>

              {/* Plan 3: Max Family */}
              <div 
                onClick={() => setSelectedPlan('max')}
                className={`glass-panel rounded-3xl p-6 border transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedPlan === 'max' 
                    ? 'border-purple-500 bg-purple-900/5 shadow-2xl scale-[1.02]' 
                    : 'border-white/5 hover:border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-black text-white">{tLocal('maxPlan')}</h4>
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'max' ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/20'}`}>
                      {selectedPlan === 'max' && <Check className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed min-h-[50px]">{tLocal('maxDesc')}</p>
                  <div className="text-2xl font-black text-white">{tLocal('maxPrice')}</div>
                </div>

                <div className="border-t border-white/5 pt-4 mt-6 space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> 4 Ekran Eşzamanlı</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> 4K Ultra HD + HDR</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Çocuk Profili Desteği</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Premium Küratör Odası</div>
                </div>
              </div>

            </div>

            <div className="flex gap-4 justify-center pt-4 max-w-xs mx-auto">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-widest transition-all cursor-pointer text-center"
              >
                {tLocal('back')}
              </button>
              <button 
                onClick={() => setStep(3)}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-2xl transition-all cursor-pointer shadow-lg shadow-purple-600/10 text-xs uppercase tracking-widest"
              >
                {tLocal('checkoutBtn')}
              </button>
            </div>
          </section>
        )}

        {/* STEP 3: SANAL 3D KREDİ KARTI ÖDEMESİ */}
        {step === 3 && (
          <section className="lg:col-span-12 max-w-2xl mx-auto w-full animate-fade-in space-y-8">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black text-white">{tLocal('paymentTitle')}</h3>
              <p className="text-xs text-gray-400">{tLocal('paymentSubtitle')}</p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs max-w-md mx-auto">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Grid Layout: Left is 3D Card, Right is Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-brand-slate/60 p-6 md:p-8 border border-white/5 rounded-3xl shadow-2xl relative glass-panel">
              
              {/* Left Column: Interactive 3D Credit Card Render */}
              <div className="flex justify-center items-center perspective-1000">
                <div 
                  className={`relative w-80 h-48 rounded-2xl text-white font-mono preserve-3d transition-transform duration-700 shadow-2xl ${
                    cardFocused ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT SIDE */}
                  <div className="absolute inset-0 w-full h-full rounded-2xl p-5 bg-gradient-to-tr from-purple-800 via-indigo-900 to-purple-900 backface-hidden flex flex-col justify-between border border-white/10 shadow-inner">
                    <div className="flex justify-between items-start">
                      {/* Chip and Wifi logos */}
                      <div className="flex flex-col gap-2">
                        <div className="w-10 h-7 rounded-md bg-amber-400/80 border border-amber-500/30 overflow-hidden relative shadow-inner">
                          {/* Inner details of sim chip */}
                          <div className="absolute top-1 left-2 w-6 h-5 border-r border-b border-black/10" />
                          <div className="absolute top-3 left-0 w-8 h-2 border-t border-b border-black/10" />
                        </div>
                        <span className="text-[7px] text-gray-400 tracking-[0.2em] font-sans">KINOIA PREMIUM SECURE</span>
                      </div>
                      <span className="text-base font-black tracking-widest text-purple-300 font-sans">KINOIA</span>
                    </div>

                    {/* Card Number */}
                    <div className="text-lg md:text-xl font-bold tracking-widest py-2 text-center text-gray-200">
                      {cardNo || '•••• •••• •••• ••••'}
                    </div>

                    {/* Holder and Expiry */}
                    <div className="flex justify-between text-[10px] uppercase text-gray-400 font-sans">
                      <div className="flex flex-col text-left">
                        <span className="text-[8px] text-gray-500 font-black">{tLocal('cardFrontHolder')}</span>
                        <span className="font-bold text-gray-200 tracking-wider truncate max-w-[150px]">
                          {cardHolder || 'JOHN DOE'}
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] text-gray-500 font-black">{tLocal('cardFrontExpires')}</span>
                        <span className="font-bold text-gray-200 tracking-wider">
                          {cardExpiry || 'MM/YY'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-950 via-purple-950 to-slate-900 backface-hidden rotate-y-180 flex flex-col justify-between py-5 border border-white/10 shadow-2xl">
                    {/* Magnetic Stripe */}
                    <div className="w-full h-10 bg-black/80" />

                    {/* Signature and CVV Panel */}
                    <div className="px-5 flex items-center gap-3">
                      <div className="flex-1 h-8 bg-white/20 rounded-md border border-white/5 flex items-center justify-end px-3 select-none">
                        <span className="text-gray-400 italic text-[10px]">KINOIA CO.</span>
                      </div>
                      <div className="w-14 h-8 bg-white text-black font-bold flex items-center justify-center rounded-md border shadow-inner text-sm tracking-widest">
                        {cardCvv || '•••'}
                      </div>
                    </div>

                    {/* Terms label */}
                    <div className="px-5 text-[8px] text-gray-500 font-sans leading-tight text-left">
                      This is an educational simulation. No actual funds are charged or verified. Designed with 3D CSS transform engines for Kinoia Max.
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Card Form */}
              <form onSubmit={handleRegistrationSubmit} className="space-y-4 text-left">
                
                {/* Card Number Input */}
                <div>
                  <label className="text-[9px] text-gray-400 font-bold block mb-1 tracking-wider">{tLocal('cardNoPlaceholder')}</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text"
                      required
                      value={cardNo}
                      onChange={formatCardNo}
                      placeholder="4111 2222 3333 4444"
                      className="w-full bg-[#070708] text-xs text-gray-200 pl-11 pr-4 py-3.5 rounded-2xl border border-white/5 focus:outline-none focus:border-purple-500 transition-all font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Card Holder Input */}
                <div>
                  <label className="text-[9px] text-gray-400 font-bold block mb-1 tracking-wider">{tLocal('cardHolderPlaceholder')}</label>
                  <input 
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    placeholder="JOHN DOE"
                    className="w-full bg-[#070708] text-xs text-gray-200 px-4 py-3.5 rounded-2xl border border-white/5 focus:outline-none focus:border-purple-500 transition-all font-bold uppercase tracking-wider"
                  />
                </div>

                {/* Expiry and CVV (Side-by-side) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold block mb-1 tracking-wider">{tLocal('expiryPlaceholder')}</label>
                    <input 
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={formatExpiry}
                      placeholder="MM/YY"
                      className="w-full bg-[#070708] text-xs text-gray-200 px-4 py-3.5 rounded-2xl border border-white/5 focus:outline-none focus:border-purple-500 transition-all font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold block mb-1 tracking-wider">{tLocal('cvvPlaceholder')}</label>
                    <input 
                      type="password"
                      required
                      value={cardCvv}
                      onChange={formatCvv}
                      onFocus={() => setCardFocused(true)}
                      onBlur={() => setCardFocused(false)}
                      placeholder="•••"
                      className="w-full bg-[#070708] text-xs text-gray-200 px-4 py-3.5 rounded-2xl border border-white/5 focus:outline-none focus:border-purple-500 transition-all font-bold text-center font-mono"
                    />
                  </div>
                </div>

                {/* Accept Terms Checkbox */}
                <div 
                  onClick={() => setAcceptTerms(!acceptTerms)}
                  className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all mt-3"
                >
                  <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                    acceptTerms ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/20'
                  }`}>
                    {acceptTerms && <Check className="w-3 h-3 font-bold" />}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold tracking-wide leading-relaxed">
                    {tLocal('termsText')}{' '}
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowPrivacyModal(true); }}
                      className="text-purple-400 underline hover:text-purple-300 font-black"
                    >
                      [{tLocal('readTerms')}]
                    </button>
                  </span>
                </div>

                {/* Submitting Status / Checkout Button */}
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white font-bold py-4.5 rounded-2xl text-xs uppercase tracking-widest transition-all cursor-pointer text-center"
                  >
                    {tLocal('back')}
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black py-4.5 rounded-2xl transition-all cursor-pointer shadow-lg shadow-purple-600/20 text-xs uppercase tracking-widest"
                  >
                    {loading ? tLocal('submitting') : tLocal('submitPayment')}
                  </button>
                </div>

              </form>
            </div>
          </section>
        )}

        {/* STEP 4: SUCCESS CONGRATULATIONS SCREEN */}
        {step === 4 && (
          <section className="lg:col-span-12 max-w-md mx-auto w-full animate-fade-in">
            <div className="glass-panel border border-white/5 rounded-3xl p-8 shadow-2xl text-center space-y-6 flex flex-col items-center">
              
              <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/20 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-purple-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">{tLocal('successTitle')}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {tLocal('successDesc')}
                </p>
              </div>

              {/* Display details */}
              <div className="w-full bg-[#070708] border border-white/5 rounded-2xl p-4 space-y-2 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-gray-500">{language === 'tr' ? 'Hesap E-Posta' : 'Account Email'}:</span>
                  <span className="font-bold text-gray-200">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{language === 'tr' ? 'Seçilen Paket' : 'Selected Plan'}:</span>
                  <span className="font-bold text-purple-400 capitalize">{selectedPlan} Plan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{language === 'tr' ? 'Abonelik Durumu' : 'Subscription Status'}:</span>
                  <span className="font-bold text-emerald-400 uppercase">{language === 'tr' ? 'AKTİF' : 'ACTIVE'}</span>
                </div>
              </div>

              <button 
                onClick={() => window.location.reload()} // Reload re-initializes AuthContext user and transitions into Profile Selector!
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black py-4.5 rounded-2xl shadow-lg transition-all text-xs uppercase tracking-widest cursor-pointer"
              >
                {tLocal('startStreaming')}
              </button>

            </div>
          </section>
        )}

      </main>

      {/* PRIVACY AGREEMENT MODAL OVERLAY */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel border border-white/10 rounded-3xl w-full max-w-xl max-h-[80vh] flex flex-col justify-between overflow-hidden shadow-2xl animate-scale-up">
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-brand-slate/40">
              <span className="text-xs font-black uppercase text-purple-400 tracking-wider">
                {tLocal('privacyTitle')}
              </span>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="p-6 overflow-y-auto scrollbar-hide text-xs text-gray-400 leading-relaxed text-left space-y-4 whitespace-pre-line select-text">
              {tLocal('privacyContent')}
            </div>

            {/* Footer Close Button */}
            <div className="p-6 border-t border-white/5 flex justify-end bg-brand-slate/40">
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                {language === 'tr' ? 'Tamam, Okudum' : 'Okay, I Read'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
